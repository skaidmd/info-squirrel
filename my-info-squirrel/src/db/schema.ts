import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// スクレイピング結果を保存するテーブル
export const scrapedData = sqliteTable('scraped_data', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(),
  title: text('title'),
  description: text('description'),
  content: text('content'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// スクレイピング履歴を保存するテーブル
export const scrapingHistory = sqliteTable('scraping_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(),
  status: text('status').notNull(), // 'success' or 'error'
  errorMessage: text('error_message'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}); 