import { NextResponse } from 'next/server';
import { getScrapeResultById } from '@/lib/db-service';

interface RouteContext {
  params: {
    id: string;
  }
}

export async function GET(
  req: Request,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    const id = parseInt(params.id, 10);
    
    if (isNaN(id)) {
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