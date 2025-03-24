'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type HistoryItem = {
  id: number;
  url: string;
  status: string;
  error?: string;
  content?: string;
  createdAt: number;
};

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/history');
        
        if (!response.ok) {
          throw new Error(`APIエラー: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setHistory(result.data);
        } else {
          setError(result.error || '履歴の取得に失敗しました');
        }
      } catch (err) {
        console.error('履歴取得エラー:', err);
        setError(err instanceof Error ? err.message : '履歴の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

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

  // URLを短く表示
  const shortenUrl = (url: string, maxLength = 50) => {
    return url.length > maxLength
      ? url.substring(0, maxLength) + '...'
      : url;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center my-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded my-4">
        <div className="flex items-center">
          <div className="ml-3">
            <p className="text-red-700 font-medium">エラーが発生しました</p>
            <p className="text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>スクレイピング履歴がありません。</p>
        <p className="mt-2">
          <Link href="/" className="text-blue-500 hover:underline">
            ホームに戻る
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">スクレイピング履歴</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                URL
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ステータス
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日時
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {history.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                    title={item.url}
                  >
                    {shortenUrl(item.url)}
                  </a>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === 'success' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {item.status === 'success' ? '成功' : 'エラー'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(item.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link 
                    href={`/history/${item.id}`}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    詳細
                  </Link>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(item.url);
                      alert('URLをコピーしました！');
                    }}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    URLコピー
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-right">
        <Link href="/" className="text-blue-500 hover:underline">
          ホームに戻る
        </Link>
      </div>
    </div>
  );
} 