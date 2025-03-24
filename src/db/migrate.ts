import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

// マイグレーションを実行
console.log('🔄 マイグレーションを実行中...');
migrate(db, { migrationsFolder: './drizzle' });
console.log('✅ マイグレーション完了');

process.exit(0); 