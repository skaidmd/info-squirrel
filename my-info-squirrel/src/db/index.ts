import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

// SQLiteデータベースへの接続
const sqlite = new Database('sqlite.db');

// Drizzle ORMのインスタンスを作成
export const db = drizzle(sqlite, { schema });

// マイグレーションを実行する関数
export function runMigrations() {
  migrate(db, { migrationsFolder: 'drizzle' });
}

// アプリケーション起動時に自動的にマイグレーションを実行する
if (process.env.NODE_ENV !== 'test') {
  try {
    runMigrations();
    console.log('Database migrations completed successfully');
  } catch (error) {
    console.error('Error running database migrations:', error);
  }
} 