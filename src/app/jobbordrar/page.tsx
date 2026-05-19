import Link from 'next/link';
import { getJobOrders } from '../actions';
import StatusToggle from './StatusToggle';
import DeleteOrderButton from './DeleteOrderButton';

export default async function JobOrders() {
  const orders = await getJobOrders();
  const hasAwaitingPayment = orders.some((order: any) => order.status === 'Väntar Betalning');

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold text-orange-dynex">Jobbordrar</h1>
          <p className="text-zinc-500 mt-2">Hantera dina offerter och pågående jobb</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-zinc-900/50 p-12 rounded-xl border border-zinc-800 text-center">
          <p className="text-zinc-500 text-xl italic">Inga jobbordrar hittades än.</p>
          <Link href="/ny-offert" className="text-orange-dynex hover:underline mt-4 inline-block">Skapa din första offert här</Link>
        </div>
      ) : (
        <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-500 text-xs uppercase tracking-widest">
                  <th className="py-4 px-6 font-medium">Status</th>
                  <th className="py-4 px-6 font-medium">Fordon</th>
                  <th className="py-4 px-6 font-medium">Kund</th>
                  <th className="py-4 px-6 font-medium">Pris {hasAwaitingPayment && <span className="lowercase font-normal">(förfallodatum)</span>}</th>
                  <th className="py-4 px-6 font-medium text-right">Åtgärder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-orange-dynex/5 transition-colors group">
                    <td className="py-5 px-6">
                      <StatusToggle id={order.id} currentStatus={order.status} />
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-bold text-zinc-200">{order.car_brand} {order.car_model}</div>
                      <div className="text-xs text-orange-dynex font-mono uppercase tracking-tighter mb-1">{order.registration_number}</div>
                      <div className="text-xs text-zinc-500">{order.car_year} • {order.mileage} mil</div>
                    </td>
                    <td className="py-5 px-6 text-sm text-zinc-300">
                      {order.customer_name}
                    </td>
                    <td className="py-5 px-6">
                      <div className="font-mono text-sm text-zinc-200">
                        {order.total_price ? `${order.total_price.toLocaleString('sv-SE')} kr` : '-'}
                      </div>
                      {order.status === 'Väntar Betalning' && order.due_date && (
                        <div className="text-xs text-red-400 mt-1 font-medium">
                          {order.due_date}
                        </div>
                      )}
                      {order.status === 'Klar' && (
                        <div className="text-xs text-green-500 mt-1 font-medium uppercase tracking-wider">
                          Betalt
                        </div>
                      )}
                    </td>
                    <td className="py-5 px-6 text-right">
                      <div className="flex justify-end items-center gap-4">
                        <DeleteOrderButton id={order.id} />
                        <Link 
                          href={`/jobbordrar/${order.id}`}
                          className="bg-zinc-800 hover:bg-orange-dynex hover:text-black px-4 py-2 rounded-lg transition-all text-xs font-bold whitespace-nowrap"
                        >
                          Visa detaljer
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}