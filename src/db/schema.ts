import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

// スクレイピング履歴テーブル
export const scrapingHistory = sqliteTable('scraping_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  url: text('url').notNull(),
  status: text('status').notNull(),
  error: text('error'),
  content: text('content'),
  selectors: text('selectors'), // セレクター情報をJSON文字列として保存
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
}); 