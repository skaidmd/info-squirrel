import HistoryList from '@/components/HistoryList';

export const metadata = {
  title: '履歴一覧 - Info Squirrel',
  description: 'スクレイピング履歴の一覧を表示します',
};

export default function HistoryPage() {
  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24 bg-gray-50">
      <div className="w-full max-w-6xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
          スクレイピング履歴
        </h1>
        <p className="text-lg text-gray-600">
          過去に実行したスクレイピングの履歴を確認できます
        </p>
      </div>

      <div className="w-full max-w-6xl">
        <HistoryList />
      </div>
    </main>
  );
} 