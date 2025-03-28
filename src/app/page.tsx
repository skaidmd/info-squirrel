'use client';

import { useState } from 'react';
import Link from 'next/link';
import UrlForm from '@/components/UrlForm';
import ResultDisplay from '@/components/ResultDisplay';
import { ScrapeResult, SelectorDefinition } from '@/lib/scraper';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [usedSelectors, setUsedSelectors] = useState<SelectorDefinition | null>(null);
  const [editMode, setEditMode] = useState(false);

  const handleSubmit = async (inputUrl: string, selectors?: SelectorDefinition) => {
    try {
      setIsLoading(true);
      setUrl(inputUrl);
      setResult(null);
      setUsedSelectors(selectors || null);

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          url: inputUrl,
          selectors
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`APIエラー (${response.status}): ${errorText.substring(0, 100)}...`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('スクレイピングエラー:', error);
      setResult({
        success: false,
        error: error instanceof Error 
          ? `${error.message}` 
          : 'リクエスト中にエラーが発生しました。ネットワーク接続を確認してください。'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24 bg-gray-50">
      <div className="w-full max-w-3xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
          Info Squirrel
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          URLを入力してWebページをスクレイピングしましょう
        </p>
        <div className="flex justify-center">
          <Link 
            href="/history" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            スクレイピング履歴を見る
          </Link>
        </div>
      </div>

      {!result || editMode ? (
        <UrlForm 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
          initialUrl={url || ''}
          initialSelectors={editMode ? usedSelectors || undefined : undefined}
        />
      ) : null}
      
      {isLoading && (
        <div className="flex justify-center items-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {result && !editMode && (
        <>
          <ResultDisplay result={result} url={url} selectors={usedSelectors} />
          
          {result.success && (
            <div className="w-full max-w-3xl mx-auto mt-4">
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 focus:outline-none"
                >
                  セレクターを編集して再スクレイピング
                </button>
                <button
                  onClick={() => {
                    setResult(null);
                    setUrl(null);
                    setUsedSelectors(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none"
                >
                  新しいURLでスクレイピング
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
