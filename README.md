# Info Squirrel

Info Squirrelは、指定したURLのWebページをスクレイピングして、その内容を表示するシンプルなツールです。

## 機能

- URLを入力してWebページのスクレイピングができます
- スクレイピング結果をデータベースに保存します
- エラーが発生した場合は詳細なエラーメッセージを表示します

## 技術スタック

- Next.js 15
- TypeScript
- Node.js 22
- SQLite (データベース)
- Drizzle ORM (データベースORM)
- cheerio (HTMLパーサー)
- axios (HTTPクライアント)
- Tailwind CSS (スタイリング)

## 使い方

### インストール

```bash
npm install
```

### データベースのセットアップ

```bash
# マイグレーションファイルを生成
npm run db:generate

# マイグレーションを実行
npm run db:migrate
```

### 開発サーバーの起動

```bash
npm run dev
```

開発サーバーが起動したら、ブラウザで [http://localhost:3000](http://localhost:3000) にアクセスしてください。

### ビルド

```bash
npm run build
```

### 本番環境での実行

```bash
npm run start
```

## ライセンス

MITライセンス
