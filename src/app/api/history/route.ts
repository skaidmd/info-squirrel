import { NextResponse } from 'next/server';
import { getRecentScrapeResults } from '@/lib/db-service';

export async function GET(request: Request) {
  try {
    console.log('履歴取得APIが呼び出されました');
    
    // クエリパラメータからlimitを取得（デフォルト50件）
    const url = new URL(request.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 50;
    
    // データベースから履歴を取得
    const history = await getRecentScrapeResults(limit);
    
    console.log(`履歴を${history.length}件取得しました`);
    
    // レスポンスを返す
    return NextResponse.json({
      success: true,
      data: history
    });
  } catch (error) {
    console.error('履歴取得API内部エラー:', error);
    
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