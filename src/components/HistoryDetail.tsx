'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SelectorDefinition } from '@/lib/scraper';

type HistoryDetailProps = {
  id: string;
};

type HistoryItem = {
  id: number;
  url: string;
  status: string;
  error?: string;
  content?: string;
  selectors?: string; // JSON文字列として保存されているセレクター情報
  createdAt: number;
  updatedAt: number;
};

export default function HistoryDetail({ id }: HistoryDetailProps) {
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedSelectors, setParsedSelectors] = useState<SelectorDefinition | null>(null);
  const [parsedContent, setParsedContent] = useState<Record<string, string> | null>(null);

  useEffect(() => {
    const fetchHistoryDetail = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/history/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('指定されたIDの履歴が見つかりません');
          }
          throw new Error(`APIエラー: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setItem(result.data);
          
          // セレクター情報をパース
          if (result.data.selectors) {
            try {
              const selectorsObj = JSON.parse(result.data.selectors);
              setParsedSelectors(selectorsObj);
            } catch (e) {
              console.error('セレクター情報のパースに失敗:', e);
            }
          }
          
          // コンテンツがJSON形式の場合はパース
          if (result.data.content && result.data.content.startsWith('{') && result.data.content.endsWith('}')) {
            try {
              const contentObj = JSON.parse(result.data.content);
              setParsedContent(contentObj);
            } catch (e) {
              console.error('コンテンツのJSONパースに失敗:', e);
              // パースに失敗した場合は通常のテキストとして扱う
            }
          }
        } else {
          setError(result.error || '履歴の取得に失敗しました');
        }
      } catch (err) {
        console.error('履歴詳細取得エラー:', err);
        setError(err instanceof Error ? err.message : '履歴の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistoryDetail();
  }, [id]);

  // タイムスタンプを読みやすい形式に変換
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center my-16">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
        </div>
        <p className="mt-6 text-gray-600 text-lg font-medium">履歴を読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-elevated rounded-2xl p-8 my-8 bg-gradient-to-br from-red-50 to-red-100">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div className="ml-6">
            <h3 className="text-red-800 font-semibold text-lg md:text-xl">エラーが発生しました</h3>
            <p className="text-red-700 mt-2 text-base md:text-lg">{error}</p>
            <Link href="/history" className="mt-4 inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 text-sm md:text-base font-medium">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              履歴一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="card-elevated rounded-2xl p-12 my-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">履歴が見つかりませんでした</h3>
        <p className="text-gray-600 mb-6">指定されたIDの履歴データが存在しません。</p>
        <Link href="/history" className="inline-flex items-center px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors duration-200 font-medium">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          履歴一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">スクレイピング詳細</h2>
          <p className="text-gray-600">ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">{item.id}</span></p>
        </div>
        <Link href="/history" className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          履歴一覧に戻る
        </Link>
      </div>
      
      <div className="card-elevated rounded-2xl p-8 mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-blue-800">URL</h3>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:text-blue-800 text-sm break-all font-medium underline-offset-2 hover:underline transition-colors duration-200"
            >
              {item.url}
            </a>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6">
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                item.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'
              }`}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  {item.status === 'success' ? (
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  ) : (
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  )}
                </svg>
              </div>
              <h3 className="text-base font-semibold text-emerald-800">ステータス</h3>
            </div>
            <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-full ${
              item.status === 'success' 
                ? 'bg-emerald-200 text-emerald-800' 
                : 'bg-red-200 text-red-800'
            }`}>
              {item.status === 'success' ? '✅ 成功' : '❌ エラー'}
            </span>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-purple-800">作成日時</h3>
            </div>
            <p className="text-purple-700 font-mono text-sm">{formatDate(item.createdAt)}</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6">
            <div className="flex items-center mb-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-orange-800">更新日時</h3>
            </div>
            <p className="text-orange-700 font-mono text-sm">{formatDate(item.updatedAt)}</p>
          </div>
        </div>
        
        {parsedSelectors && Object.keys(parsedSelectors).length > 0 && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">使用セレクター</h3>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-xl border border-indigo-200">
              <div className="space-y-3">
                {Object.entries(parsedSelectors).map(([key, value]) => (
                  <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="font-semibold text-indigo-800 text-sm sm:text-base min-w-0 sm:min-w-[120px]">{key}:</span>
                    <code className="bg-white/80 px-3 py-2 rounded-lg font-mono text-sm text-indigo-900 break-all border border-indigo-200">{value}</code>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {item.error && (
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">エラー内容</h3>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
              <p className="text-red-800 font-medium">{item.error}</p>
            </div>
          </div>
        )}
        
        {item.content && (
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">スクレイピング結果</h3>
            </div>
            {parsedContent ? (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 max-h-[500px] overflow-y-auto">
                <div className="space-y-6">
                  {Object.entries(parsedContent).map(([key, value]) => (
                    <div key={key} className="bg-white/80 p-4 rounded-lg border border-green-200">
                      <h4 className="font-bold text-green-800 text-lg mb-3 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        {key}
                      </h4>
                      <pre className="whitespace-pre-wrap text-gray-800 text-sm font-sans leading-relaxed">{value}</pre>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 max-h-[500px] overflow-y-auto">
                <pre className="whitespace-pre-wrap text-gray-800 font-sans leading-relaxed">{item.content}</pre>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
        <button
          onClick={() => {
            navigator.clipboard.writeText(item.url);
            alert('URLをコピーしました！');
          }}
          className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 hover:scale-105 shadow-lg font-medium"
        >
          <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
          </svg>
          URLをコピー
        </button>
        
        {item.content && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(item.content || '');
              alert('コンテンツをコピーしました！');
            }}
            className="group inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-300 hover:scale-105 shadow-lg font-medium"
          >
            <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
            </svg>
            コンテンツをコピー
          </button>
        )}
      </div>
    </div>
  );
} 