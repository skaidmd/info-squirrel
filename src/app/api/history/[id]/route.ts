import { NextResponse } from 'next/server';
import { getScrapeResultById } from '@/lib/db-service';

export async function GET(request: Request) {
  try {
    // URLからパラメータを抽出
    const url = new URL(request.url);
    const idParam = url.pathname.split('/').pop();
    const id = idParam ? parseInt(idParam, 10) : null;
    
    if (!id || isNaN(id)) {
      return NextResponse.json(
        { success: false, error: '有効なIDを指定してください' },
        { status: 400 }
      );
    }
    
    console.log(`履歴詳細取得API: ID ${id}`);
    
    // データベースから履歴を取得
    const historyItem = await getScrapeResultById(id);
    
    if (!historyItem) {
      return NextResponse.json(
        { success: false, error: '指定されたIDの履歴が見つかりません' },
        { status: 404 }
      );
    }
    
    // レスポンスを返す
    return NextResponse.json({
      success: true,
      data: historyItem
    });
  } catch (error) {
    console.error('履歴詳細取得API内部エラー:', error);
    
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