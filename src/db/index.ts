import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { resolve } from 'path';

// データベースファイルのパスを解決
const dbPath = resolve(process.cwd(), 'sqlite.db');

// SQLite接続の初期化
const sqlite = new Database(dbPath);

// Drizzle ORMの初期化
export const db = drizzle(sqlite, { schema }); 