import { NextResponse } from 'next/server';
import { scrapeUrl } from '@/lib/scraper';
import { saveScrapeResult } from '@/lib/db-service';

export async function POST(request: Request) {
  try {
    // リクエストボディからURLを取得
    let url;
    try {
      const body = await request.json();
      url = body.url;
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

    console.log(`APIリクエスト受信: ${url}`);

    // URLのスクレイピングを実行
    const result = await scrapeUrl(url);

    console.log(`スクレイピング結果: ${result.success ? '成功' : '失敗'}`);

    try {
      // 結果をデータベースに保存
      await saveScrapeResult(
        url, 
        result.success ? 'success' : 'error',
        result.data,
        result.error
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