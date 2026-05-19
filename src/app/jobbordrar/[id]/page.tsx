import { getJobOrderById } from '../../actions';
import { notFound } from 'next/navigation';
import OrderTabs from './OrderTabs';

export default async function OrderDetail({ params }: { params: any }) {
  const resolvedParams = await params;
  const order = await getJobOrderById(resolvedParams.id);
  if (!order) notFound();

  return (
    <main className="min-h-screen p-4 md:p-8 bg-black text-white print:bg-white print:text-black">
      <OrderTabs order={order as any} />
    </main>
  );
}
