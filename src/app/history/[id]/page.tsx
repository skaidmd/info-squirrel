import HistoryDetail from '@/components/HistoryDetail';

export const dynamic = 'force-dynamic';

type HistoryDetailPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: HistoryDetailPageProps) {
  return {
    title: `履歴詳細 #${params.id} - Info Squirrel`,
    description: 'スクレイピング履歴の詳細を表示します',
  };
}

export default function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const { id } = params;

  return (
    <main className="flex min-h-screen flex-col items-center p-6 md:p-24 bg-gray-50">
      <div className="w-full max-w-6xl text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-2">
          履歴詳細 #{id}
        </h1>
        <p className="text-lg text-gray-600">
          スクレイピング履歴の詳細情報を表示しています
        </p>
      </div>

      <div className="w-full max-w-6xl">
        <HistoryDetail id={id} />
      </div>
    </main>
  );
} 