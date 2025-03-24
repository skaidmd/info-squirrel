'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type HistoryDetailProps = {
  id: string;
};

type HistoryItem = {
  id: number;
  url: string;
  status: string;
  error?: string;
  content?: string;
  createdAt: number;
  updatedAt: number;
};

export default function HistoryDetail({ id }: HistoryDetailProps) {
  const [item, setItem] = useState<HistoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
            <Link href="/history" className="mt-4 inline-block text-blue-500 hover:underline">
              履歴一覧に戻る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>履歴が見つかりませんでした。</p>
        <p className="mt-2">
          <Link href="/history" className="text-blue-500 hover:underline">
            履歴一覧に戻る
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">スクレイピング詳細 (ID: {item.id})</h2>
        <Link href="/history" className="text-blue-500 hover:underline">
          履歴一覧に戻る
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">URL</h3>
            <p className="mt-1 break-all">
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {item.url}
              </a>
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">ステータス</h3>
            <p className="mt-1">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                item.status === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {item.status === 'success' ? '成功' : 'エラー'}
              </span>
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">作成日時</h3>
            <p className="mt-1">{formatDate(item.createdAt)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">更新日時</h3>
            <p className="mt-1">{formatDate(item.updatedAt)}</p>
          </div>
        </div>
        
        {item.error && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">エラー内容</h3>
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-red-700">{item.error}</p>
            </div>
          </div>
        )}
        
        {item.content && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-1">コンテンツ</h3>
            <div className="bg-gray-50 p-4 rounded border border-gray-200 max-h-[400px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{item.content}</pre>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={() => {
            navigator.clipboard.writeText(item.url);
            alert('URLをコピーしました！');
          }}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none"
        >
          URLをコピー
        </button>
        
        {item.content && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(item.content || '');
              alert('コンテンツをコピーしました！');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
          >
            コンテンツをコピー
          </button>
        )}
      </div>
    </div>
  );
} 