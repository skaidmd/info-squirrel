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
    <main className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800"></div>
      
      <div className="relative z-10 flex min-h-screen flex-col items-center p-6 md:p-24">
        <div className="w-full max-w-4xl text-center mb-16">
          <div className="glass-morphism rounded-3xl p-8 md:p-12 mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              <span className="gradient-text">Info Squirrel</span>
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 leading-relaxed">
              WebページをスマートにスクレイピングAIで情報を効率的に抽出
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/history" 
                className="group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
                スクレイピング履歴
              </Link>
            </div>
          </div>
        </div>

        {!result || editMode ? (
          <div className="w-full max-w-4xl">
            <div className="card-elevated rounded-3xl p-8 md:p-10">
              <UrlForm 
                onSubmit={handleSubmit} 
                isLoading={isLoading} 
                initialUrl={url || ''}
                initialSelectors={editMode ? usedSelectors || undefined : undefined}
              />
            </div>
          </div>
        ) : null}
        
        {isLoading && (
          <div className="flex flex-col items-center justify-center mt-12">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
            </div>
            <p className="mt-6 text-white/80 text-lg font-medium">スクレイピング中...</p>
          </div>
        )}

        {result && !editMode && (
          <div className="w-full max-w-4xl mt-8">
            <div className="card-elevated rounded-3xl p-8 md:p-10">
              <ResultDisplay result={result} url={url} selectors={usedSelectors} />
              
              {result.success && (
                <div className="flex flex-wrap gap-4 justify-center mt-8 pt-8 border-t border-gray-200/20">
                  <button
                    onClick={() => setEditMode(true)}
                    className="group inline-flex items-center px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    セレクターを編集して再スクレイピング
                  </button>
                  <button
                    onClick={() => {
                      setResult(null);
                      setUrl(null);
                      setUsedSelectors(null);
                    }}
                    className="group inline-flex items-center px-6 py-3 text-sm font-semibold rounded-2xl bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:from-gray-700 hover:to-gray-800 transition-all duration-300 hover:scale-105 shadow-lg"
                  >
                    <svg className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                    </svg>
                    新しいURLでスクレイピング
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
