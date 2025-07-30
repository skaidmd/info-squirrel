import { db } from '@/db';
import { scrapingHistory } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { SelectorDefinition } from './scraper';

/**
 * スクレイピング履歴を保存する
 */
export async function saveScrapeResult(
  url: string, 
  status: 'success' | 'error', 
  content?: string | Record<string, string>, 
  error?: string,
  selectors?: SelectorDefinition
) {
  try {
    // コンテンツが構造化データの場合はJSON文字列に変換
    const contentStr = typeof content === 'object' ? JSON.stringify(content) : content;
    
    // セレクターが指定されている場合はJSON文字列に変換
    const selectorsStr = selectors ? JSON.stringify(selectors) : null;
    
    const result = await db.insert(scrapingHistory).values({
      url,
      status,
      content: contentStr,
      error,
      selectors: selectorsStr,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning({ id: scrapingHistory.id });

    return result[0];
  } catch (error) {
    console.error('データベース保存エラー:', error);
    throw error;
  }
}

/**
 * 直近のスクレイピング履歴を取得する
 */
export async function getRecentScrapeResults(limit = 10) {
  try {
    return await db.select()
      .from(scrapingHistory)
      .orderBy(desc(scrapingHistory.createdAt))
      .limit(limit);
  } catch (error) {
    console.error('データベース取得エラー:', error);
    throw error;
  }
}

/**
 * IDでスクレイピング履歴を取得する
 */
export async function getScrapeResultById(id: number) {
  try {
    const results = await db.select()
      .from(scrapingHistory)
      .where(eq(scrapingHistory.id, id))
      .limit(1);
    
    return results[0] || null;
  } catch (error) {
    console.error('データベース取得エラー:', error);
    throw error;
  }
} 