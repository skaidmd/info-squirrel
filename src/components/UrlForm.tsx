'use client';

import { useState, useEffect } from 'react';
import { SelectorDefinition } from '@/lib/scraper';

type UrlFormProps = {
  onSubmit: (url: string, selectors?: SelectorDefinition) => Promise<void>;
  isLoading: boolean;
  initialUrl?: string;
  initialSelectors?: SelectorDefinition;
};

export default function UrlForm({ onSubmit, isLoading, initialUrl = '', initialSelectors }: UrlFormProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [useSelectors, setUseSelectors] = useState(!!initialSelectors);
  const [selectorFields, setSelectorFields] = useState<{id: string; name: string; selector: string}[]>(() => {
    if (initialSelectors) {
      return Object.entries(initialSelectors).map(([name, selector]) => ({
        id: crypto.randomUUID(),
        name,
        selector
      }));
    }
    return [];
  });
  const [showExamples, setShowExamples] = useState(false);

  // URLの入力値が変更されたらバリデーションを実行
  useEffect(() => {
    // 基本的なURL形式のチェック
    const isValid = /^https?:\/\/.+/.test(url.trim());
    setIsValidUrl(isValid);
  }, [url]);

  // 初期値が変更された場合に状態を更新
  useEffect(() => {
    setUrl(initialUrl);
    
    if (initialSelectors) {
      setUseSelectors(true);
      setSelectorFields(Object.entries(initialSelectors).map(([name, selector]) => ({
        id: crypto.randomUUID(),
        name,
        selector
      })));
    }
  }, [initialUrl, initialSelectors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 入力が有効で、ローディング中でなければ送信
    if (isValidUrl && !isLoading) {
      // URLの先頭と末尾の空白を削除
      const trimmedUrl = url.trim();
      
      // セレクターを構築
      let selectors: SelectorDefinition | undefined = undefined;
      
      if (useSelectors && selectorFields.length > 0) {
        selectors = {};
        for (const field of selectorFields) {
          if (field.name && field.selector) {
            selectors[field.name] = field.selector;
          }
        }
        
        // 空のオブジェクトなら未指定とする
        if (Object.keys(selectors).length === 0) {
          selectors = undefined;
        }
      }
      
      await onSubmit(trimmedUrl, selectors);
    }
  };

  const addSelectorField = () => {
    setSelectorFields([
      ...selectorFields, 
      { id: crypto.randomUUID(), name: '', selector: '' }
    ]);
  };

  const removeSelectorField = (id: string) => {
    setSelectorFields(selectorFields.filter(field => field.id !== id));
  };

  const updateSelectorField = (id: string, field: 'name' | 'selector', value: string) => {
    setSelectorFields(
      selectorFields.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addExampleSelector = (exampleName: string, exampleSelector: string) => {
    setSelectorFields([
      ...selectorFields,
      { id: crypto.randomUUID(), name: exampleName, selector: exampleSelector }
    ]);
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
          {isLoading ? '処理中...' : initialSelectors ? '再スクレイピング' : 'スクレイピング'}
        </button>
      </div>
      
      {url && !isValidUrl && (
        <p className="text-red-500 text-sm mt-1">
          有効なURLを入力してください。URLはhttp://またはhttps://で始まる必要があります。
        </p>
      )}

      <div className="mt-4">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={useSelectors}
            onChange={(e) => setUseSelectors(e.target.checked)}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
            disabled={isLoading}
          />
          <span className="text-gray-700">セレクターを指定して特定の要素のみを抽出する</span>
        </label>
      </div>

      {useSelectors && (
        <div className="mt-4 space-y-4 border border-gray-200 rounded-md p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">セレクター設定</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowExamples(!showExamples)}
                className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-md hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {showExamples ? '例を隠す' : '例を見る'}
              </button>
              <button
                type="button"
                onClick={addSelectorField}
                disabled={isLoading}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + 追加
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-700 mb-2">
            <p>CSSセレクターを使用して、Webページから特定の要素を抽出できます。</p>
            <p className="mt-1">例えば、<code className="bg-gray-100 px-1 rounded font-mono text-blue-700">h1</code>（見出し）、<code className="bg-gray-100 px-1 rounded font-mono text-blue-700">.class-name</code>（クラス）、<code className="bg-gray-100 px-1 rounded font-mono text-blue-700">#id-name</code>（ID）などが指定できます。</p>
          </div>

          {showExamples && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
              <h4 className="font-medium text-blue-800 mb-2">よく使われるセレクターの例</h4>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-800"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">h1</code> - メインタイトル</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addExampleSelector('タイトル', 'h1')}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    追加
                  </button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-800"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">meta[name=&quot;description&quot;]</code> - メタディスクリプション</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addExampleSelector('説明', 'meta[name="description"]')}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    追加
                  </button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-800"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">.article-content</code> - 記事コンテンツ（クラス名による指定）</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addExampleSelector('コンテンツ', '.article-content')}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    追加
                  </button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-800"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">#main-content</code> - メインコンテンツ（ID指定）</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addExampleSelector('メイン', '#main-content')}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    追加
                  </button>
                </li>
                <li className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-800"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">div.price</code> - 価格情報（タグとクラス）</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => addExampleSelector('価格', 'div.price')}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                  >
                    追加
                  </button>
                </li>
              </ul>
            </div>
          )}

          {selectorFields.length === 0 && (
            <p className="text-gray-500 text-sm">
              「追加」ボタンを押して、抽出したい要素のセレクターを設定してください。
            </p>
          )}

          {selectorFields.map((field) => (
            <div key={field.id} className="flex flex-col sm:flex-row gap-2 border-b border-gray-200 pb-4">
              <div className="flex-1">
                <label className="block text-xs text-gray-700 mb-1">名前（キー）</label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateSelectorField(field.id, 'name', e.target.value)}
                  placeholder="タイトル"
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-gray-700 mb-1">CSSセレクター</label>
                <input
                  type="text"
                  value={field.selector}
                  onChange={(e) => updateSelectorField(field.id, 'selector', e.target.value)}
                  placeholder="h1.title"
                  className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoading}
                />
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => removeSelectorField(field.id)}
                  disabled={isLoading}
                  className="px-3 py-2 bg-red-100 text-red-600 text-sm rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {useSelectors && (
        <div className="mt-4 rounded-md p-4 bg-yellow-50 border border-yellow-200">
          <h3 className="font-medium text-yellow-800 mb-2">セレクター活用のヒント</h3>
          <ul className="list-disc pl-5 text-sm text-yellow-800 space-y-1">
            <li>よく使われるセレクター例をクリックすると、自動的にフォームに追加されます</li>
            <li>セレクターを複数指定すると、各要素を個別に抽出できます（例：タイトル、説明文、価格など）</li>
            <li>スクレイピング後に結果を確認し、セレクターを編集して再スクレイピングが可能です</li>
            <li>セレクターがマッチしない場合は空の結果が返されます</li>
          </ul>
          <p className="mt-2 text-sm text-yellow-800">
            <strong>応用例：</strong> ECサイトの商品ページから<code className="bg-yellow-100 px-1 rounded font-mono">.product-title</code>（商品名）、<code className="bg-yellow-100 px-1 rounded font-mono">.price</code>（価格）、<code className="bg-yellow-100 px-1 rounded font-mono">.description</code>（説明）などを抽出
          </p>
        </div>
      )}
    </form>
  );
} 