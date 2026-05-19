'use client';

import { useTransition } from 'react';
import { updateJobStatus } from '../actions';

export default function StatusToggle({ id, currentStatus }: { id: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateJobStatus(id, newStatus);
      // Wait a bit or let Next.js revalidate
      window.location.reload();
    });
  };

  return (
    <div className="relative inline-block w-full max-w-[120px]">
      <select 
        value={currentStatus}
        onChange={handleChange}
        disabled={isPending}
        className={`appearance-none cursor-pointer w-full pl-3 pr-8 py-1.5 rounded-full text-[10px] font-bold uppercase border outline-none transition-colors ${
          currentStatus === 'Offert' ? 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500' :
          currentStatus === 'Pågående' ? 'bg-orange-dynex/10 text-orange-dynex border-orange-dynex/30 hover:border-orange-dynex' :
          currentStatus === 'Väntar Betalning' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30 hover:border-blue-500' :
          'bg-green-900/20 text-green-500 border-green-500/30 hover:border-green-500'
        } ${isPending ? 'opacity-50' : ''}`}
      >
        <option value="Offert">Offert</option>
        <option value="Pågående">Pågående</option>
        <option value="Väntar Betalning">Väntar Betalning</option>
        <option value="Klar">Klar</option>
      </select>
      <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
          currentStatus === 'Offert' ? 'text-zinc-500' :
          currentStatus === 'Pågående' ? 'text-orange-dynex' :
          currentStatus === 'Väntar Betalning' ? 'text-blue-400' :
          'text-green-500'
        }`}>
        <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
      </div>
    </div>
  );
}