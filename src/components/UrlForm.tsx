'use client';

import { useState, useEffect } from 'react';

type UrlFormProps = {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
};

export default function UrlForm({ onSubmit, isLoading }: UrlFormProps) {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  // URLの入力値が変更されたらバリデーションを実行
  useEffect(() => {
    // 基本的なURL形式のチェック
    const isValid = /^https?:\/\/.+/.test(url.trim());
    setIsValidUrl(isValid);
  }, [url]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力が有効で、ローディング中でなければ送信
    if (isValidUrl && !isLoading) {
      // URLの先頭と末尾の空白を削除
      const trimmedUrl = url.trim();
      
      await onSubmit(trimmedUrl);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row gap-2 mb-1">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          className={`flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            url && !isValidUrl ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !isValidUrl}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? '処理中...' : 'スクレイピング'}
        </button>
      </div>
      
      {url && !isValidUrl && (
        <p className="text-red-500 text-sm mt-1">
          有効なURLを入力してください。URLはhttp://またはhttps://で始まる必要があります。
        </p>
      )}
    </form>
  );
} 