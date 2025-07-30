import { NextResponse } from 'next/server';
import { scrapeUrl, SelectorDefinition } from '@/lib/scraper';
import { saveScrapeResult } from '@/lib/db-service';

export async function POST(request: Request) {
  try {
    // リクエストボディからURLとセレクターを取得
    let url: string;
    let selectors: SelectorDefinition | undefined;
    
    try {
      const body = await request.json();
      url = body.url;
      selectors = body.selectors;
      
      // セレクターのバリデーション
      if (selectors && typeof selectors !== 'object') {
        return NextResponse.json(
          { success: false, error: 'selectorsは有効なオブジェクトである必要があります' },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error('リクエストボディの解析エラー:', error);
      return NextResponse.json(
        { success: false, error: 'リクエストボディの解析に失敗しました。有効なJSONを送信してください。' },
        { status: 400 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URLが指定されていません' },
        { status: 400 }
      );
    }

    console.log(`APIリクエスト受信: ${url}${selectors ? '（セレクター指定あり）' : ''}`);
    
    // セレクターが指定されている場合はログ出力
    if (selectors) {
      console.log(`指定されたセレクター: ${Object.keys(selectors).join(', ')}`);
    }

    // URLのスクレイピングを実行
    const result = await scrapeUrl(url, selectors);

    console.log(`スクレイピング結果: ${result.success ? '成功' : '失敗'}`);

    try {
      // 結果をデータベースに保存
      await saveScrapeResult(
        url, 
        result.success ? 'success' : 'error',
        result.data,
        result.error,
        selectors
      );
    } catch (dbError) {
      console.error('データベース保存エラー:', dbError);
      // データベース保存エラーがあっても処理は続行して結果を返す
    }

    // 結果を返す
    return NextResponse.json(result);
  } catch (error) {
    console.error('スクレイピングAPI内部エラー:', error);
    
    // エラーレスポンスを返す
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : '不明なエラーが発生しました' 
      },
      { status: 500 }
    );
  }
} 