import HistoryDetail from '@/components/HistoryDetail';

export const dynamic = 'force-dynamic';

interface PageParams {
  id: string;
}

interface PageProps {
  params: Promise<PageParams>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `履歴詳細 #${id} - Info Squirrel`,
    description: 'スクレイピング履歴の詳細を表示します',
  };
}

export default async function HistoryDetailPage({ params }: PageProps) {
  const { id } = await params;

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