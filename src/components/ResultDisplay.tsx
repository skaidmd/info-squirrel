'use client';

import { ScrapeResult, SelectorDefinition } from '@/lib/scraper';

type ResultDisplayProps = {
  result: ScrapeResult | null;
  url: string | null;
  selectors?: SelectorDefinition | null;
};

export default function ResultDisplay({ result, url, selectors }: ResultDisplayProps) {
  if (!result) return null;

  // データが構造化データ（オブジェクト）かどうかを判定
  const isStructuredData = result.success && result.data && typeof result.data === 'object';

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">スクレイピング結果</h2>
        
        {url && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">URL:</p>
            <p className="break-all">{url}</p>
          </div>
        )}

        {selectors && Object.keys(selectors).length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">使用セレクター:</p>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
              {Object.entries(selectors).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="font-medium">{key}</span>: <code className="bg-gray-100 px-1 py-0.5 rounded">{value}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.success ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">取得データ:</p>
            {isStructuredData ? (
              <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-[400px] overflow-y-auto">
                {Object.entries(result.data as Record<string, string>).map(([key, value]) => (
                  <div key={key} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                    <h3 className="font-bold text-blue-800">{key}</h3>
                    <pre className="whitespace-pre-wrap text-sm mt-1">{value}</pre>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-[400px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm">{result.data as string}</pre>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-red-700 font-medium">エラーが発生しました</p>
                <p className="text-red-700 mt-1">{result.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 