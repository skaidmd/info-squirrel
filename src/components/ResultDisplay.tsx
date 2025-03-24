'use client';

import { ScrapeResult } from '@/lib/scraper';

type ResultDisplayProps = {
  result: ScrapeResult | null;
  url: string | null;
};

export default function ResultDisplay({ result, url }: ResultDisplayProps) {
  if (!result) return null;

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

        {result.success ? (
          <div>
            <p className="text-sm text-gray-600 mb-2">取得データ:</p>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{result.data}</pre>
            </div>
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