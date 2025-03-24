import { db } from '@/db';
import { scrapingHistory } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * スクレイピング履歴を保存する
 */
export async function saveScrapeResult(url: string, status: 'success' | 'error', content?: string, error?: string) {
  try {
    const result = await db.insert(scrapingHistory).values({
      url,
      status,
      content,
      error,
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