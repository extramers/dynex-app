'use client';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { deleteOrder } from '../actions';

export default function DeleteOrderButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = () => {
    if (window.confirm('Är du säker på att du vill ta bort denna order?')) {
      startTransition(async () => {
        await deleteOrder(id);
        router.refresh();
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 border border-red-500/30 px-4 py-2 rounded-lg transition-all text-xs font-bold whitespace-nowrap disabled:opacity-50"
    >
      {isPending ? 'Tar bort...' : 'Ta bort'}
    </button>
  );
}