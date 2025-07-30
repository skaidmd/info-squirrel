'use client';

import { useState } from 'react';
import styles from './page.module.css';

// スクレイピング結果の型定義
interface ScrapedData {
  title: string;
  description: string;
  content: string;
  url: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string } | null>(null);

  const handleScrape = async () => {
    if (!url) {
      setError({ message: 'URLを入力してください' });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/scrape?url=${encodeURIComponent(url)}`);
      
      // レスポンステキストを取得
      const responseText = await response.text();
      
      let data;
      try {
        // テキストをJSONとしてパース
        data = JSON.parse(responseText);
      } catch (parseError) {
        // JSONパースエラーの場合、生のレスポンスも表示
        throw new Error(`JSONパースエラー: ${parseError instanceof Error ? parseError.message : String(parseError)}\n\n生のレスポンス:\n${responseText.substring(0, 500)}${responseText.length > 500 ? '...(省略)' : ''}`);
      }

      if (!response.ok) {
        throw new Error(data.details || data.error || 'スクレイピングに失敗しました');
      }

      setScrapedData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'エラーが発生しました';
      setError({
        message: 'スクレイピングに失敗しました',
        details: errorMessage
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>InfoSquirrel</h1>
      <p className={styles.description}>ウェブページの情報を簡単に取得できます</p>
      
      <div className={styles.scraperContainer}>
        <div className={styles.inputGroup}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="URLを入力してください"
            className={styles.urlInput}
          />
          <button
            onClick={handleScrape}
            disabled={loading}
            className={styles.scrapeButton}
          >
            {loading ? 'スクレイピング中...' : 'スクレイピング開始'}
          </button>
        </div>

        {error && (
          <div className={styles.errorMessage}>
            <h3>エラーが発生しました</h3>
            <p>{error.message}</p>
            {error.details && (
              <div className={styles.errorDetails}>
                <pre>{error.details}</pre>
              </div>
            )}
          </div>
        )}

        {scrapedData && (
          <div className={styles.resultContainer}>
            <h2>スクレイピング結果</h2>
            <div className={styles.resultItem}>
              <h3>タイトル</h3>
              <p>{scrapedData.title}</p>
            </div>
            <div className={styles.resultItem}>
              <h3>説明</h3>
              <p>{scrapedData.description}</p>
            </div>
            <div className={styles.resultItem}>
              <h3>コンテンツ</h3>
              <div className={styles.contentBox}>{scrapedData.content}</div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
} 