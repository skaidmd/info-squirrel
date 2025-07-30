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
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col lg:flex-row gap-4 mb-2">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com - スクレイピングしたいURLを入力"
            className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 bg-white/90 backdrop-blur-sm ${
              url && !isValidUrl ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 hover:border-gray-300'
            }`}
            disabled={isLoading}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !isValidUrl}
          className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-2xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          <span className="flex items-center">
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                処理中...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
{initialSelectors ? '再実行' : '実行'}
              </>
            )}
          </span>
        </button>
      </div>
      
      {url && !isValidUrl && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg mt-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-red-700 font-medium">有効なURLを入力してください</p>
              <p className="text-red-600 text-sm mt-1">URLはhttp://またはhttps://で始まる必要があります。</p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6">
        <label className="flex items-center space-x-3 cursor-pointer p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 hover:from-indigo-100 hover:to-purple-100 transition-all duration-300">
          <input
            type="checkbox"
            checked={useSelectors}
            onChange={(e) => setUseSelectors(e.target.checked)}
            className="h-5 w-5 text-indigo-600 rounded-md border-gray-300 focus:ring-indigo-500 focus:ring-2"
            disabled={isLoading}
          />
          <div>
            <span className="text-gray-800 font-semibold text-lg">高度なセレクター機能</span>
            <p className="text-gray-600 text-sm mt-1">CSSセレクターを使用して特定の要素のみを抽出します</p>
          </div>
        </label>
      </div>

      {useSelectors && (
        <div className="mt-6 space-y-6 bg-white rounded-2xl p-6 border-2 border-indigo-100 shadow-lg">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
                セレクター設定
              </h3>
              <p className="text-gray-600 text-sm mt-1">抽出したい要素を指定してください</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowExamples(!showExamples)}
                className="group inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 text-sm font-medium rounded-xl hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {showExamples ? '例を隠す' : '例を見る'}
              </button>
              <button
                type="button"
                onClick={addSelectorField}
                disabled={isLoading}
                className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white text-sm font-medium rounded-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-md"
              >
                <svg className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                追加
              </button>
            </div>
          </div>

          <div className="text-sm md:text-base text-gray-700 mb-2">
            <p>CSSセレクターを使用して、Webページから特定の要素を抽出できます。</p>
            <p className="mt-1">例えば、<code className="bg-gray-100 px-1 rounded font-mono text-blue-700">h1</code>（見出し）、<code className="bg-gray-100 px-1 rounded font-mono text-blue-700">.class-name</code>（クラス）、<code className="bg-gray-100 px-1 rounded font-mono text-blue-700">#id-name</code>（ID）などが指定できます。</p>
          </div>

          {showExamples && (
            <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
              <h4 className="font-medium text-blue-800 mb-2">よく使われるセレクターの例</h4>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <div>
                    <p className="text-gray-800 md:text-base"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">h1</code> - メインタイトル</p>
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
                    <p className="text-gray-800 md:text-base"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">meta[name=&quot;description&quot;]</code> - メタディスクリプション</p>
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
                    <p className="text-gray-800 md:text-base"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">.article-content</code> - 記事コンテンツ（クラス名による指定）</p>
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
                    <p className="text-gray-800 md:text-base"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">#main-content</code> - メインコンテンツ（ID指定）</p>
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
                    <p className="text-gray-800 md:text-base"><code className="bg-gray-100 px-1 rounded font-mono text-blue-700">div.price</code> - 価格情報（タグとクラス）</p>
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
                <label className="block text-xs md:text-sm text-gray-700 mb-1 font-medium">名前（キー）</label>
                <input
                  type="text"
                  value={field.name}
                  onChange={(e) => updateSelectorField(field.id, 'name', e.target.value)}
                  placeholder="タイトル"
                  className="w-full px-3 py-2 md:py-3 border rounded-md text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600"
                  disabled={isLoading}
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs md:text-sm text-gray-700 mb-1 font-medium">CSSセレクター</label>
                <input
                  type="text"
                  value={field.selector}
                  onChange={(e) => updateSelectorField(field.id, 'selector', e.target.value)}
                  placeholder="h1.title"
                  className="w-full px-3 py-2 md:py-3 border rounded-md text-sm md:text-base focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-600"
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
          <h3 className="font-medium text-yellow-800 mb-2 text-base md:text-lg">セレクター活用のヒント</h3>
          <ul className="list-disc pl-5 text-sm md:text-base text-yellow-800 space-y-1">
            <li>よく使われるセレクター例をクリックすると、自動的にフォームに追加されます</li>
            <li>セレクターを複数指定すると、各要素を個別に抽出できます（例：タイトル、説明文、価格など）</li>
            <li>スクレイピング後に結果を確認し、セレクターを編集して再スクレイピングが可能です</li>
            <li>セレクターがマッチしない場合は空の結果が返されます</li>
          </ul>
          <p className="mt-2 text-sm md:text-base text-yellow-800">
            <strong>応用例：</strong> ECサイトの商品ページから<code className="bg-yellow-100 px-1 rounded font-mono text-yellow-800">.product-title</code>（商品名）、<code className="bg-yellow-100 px-1 rounded font-mono text-yellow-800">.price</code>（価格）、<code className="bg-yellow-100 px-1 rounded font-mono text-yellow-800">.description</code>（説明）などを抽出
          </p>
        </div>
      )}
    </form>
  );
} 