'use client';

import { useState } from 'react';
import { ScrapeResult, SelectorDefinition } from '@/lib/scraper';

type ResultDisplayProps = {
  result: ScrapeResult | null;
  url: string | null;
  selectors?: SelectorDefinition | null;
};

export default function ResultDisplay({ result, url, selectors }: ResultDisplayProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  if (!result) return null;

  // データが構造化データ（オブジェクト）かどうかを判定
  const isStructuredData = result.success && result.data && typeof result.data === 'object';

  // テキストを行で分割して整形する
  const formatText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, index) => {
      // タグ情報を抽出
      const tagMatch = line.match(/^<(\w+)>(.*)/);
      if (tagMatch) {
        const [, tag, content] = tagMatch;
        return (
          <div key={index} className="mb-1 flex">
            <span className="text-xs md:text-sm text-gray-700 bg-gray-100 px-1 py-0.5 rounded mr-2 font-mono">{`<${tag}>`}</span>
            <span className="text-sm md:text-base text-gray-900">{content}</span>
          </div>
        );
      }
      return <div key={index} className="mb-1 text-sm md:text-base text-gray-900">{line}</div>;
    });
  };

  const toggleExpand = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl md:text-2xl font-semibold mb-4 text-gray-900">スクレイピング結果</h2>
        
        {url && (
          <div className="mb-4">
            <p className="text-sm md:text-base font-medium text-gray-700">URL:</p>
            <p className="break-all text-sm md:text-base text-gray-900">{url}</p>
          </div>
        )}

        {selectors && Object.keys(selectors).length > 0 && (
          <div className="mb-4">
            <p className="text-sm md:text-base font-medium text-gray-700">使用セレクター:</p>
            <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm md:text-base">
              {Object.entries(selectors).map(([key, value]) => (
                <div key={key} className="mb-1">
                  <span className="font-medium text-gray-900">{key}</span>: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-blue-800">{value}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {result.success ? (
          <div>
            <p className="text-sm md:text-base font-medium text-gray-700 mb-2">取得データ:</p>
            {isStructuredData ? (
              <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-[400px] overflow-y-auto">
                {Object.entries(result.data as Record<string, string>).map(([key, value]) => {
                  const isExpanded = expandedItems.has(key);
                  const lines = value.split('\n');
                  const previewLines = 5;
                  const hasManyLines = lines.length > previewLines;

                  return (
                    <div key={key} className="mb-4 pb-4 border-b border-gray-200 last:border-b-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-blue-900 text-base md:text-lg">{key}</h3>
                        {hasManyLines && (
                          <button
                            onClick={() => toggleExpand(key)}
                            className="text-xs md:text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded font-medium hover:bg-blue-200"
                          >
                            {isExpanded ? '折りたたむ' : `全て表示 (${lines.length}行)`}
                          </button>
                        )}
                      </div>
                      <div className="mt-1">
                        {hasManyLines && !isExpanded 
                          ? formatText(lines.slice(0, previewLines).join('\n'))
                          : formatText(value)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-[400px] overflow-y-auto">
                {formatText(result.data as string)}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-red-700 font-medium text-base md:text-lg">エラーが発生しました</p>
                <p className="text-red-700 mt-1 text-sm md:text-base">{result.error}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 