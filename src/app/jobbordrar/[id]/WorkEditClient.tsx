'use client';

import { useState } from 'react';
import { updateJobDescription } from '../../actions';

export default function WorkEditClient({ id, initialDescription, disabled }: { id: string, initialDescription: string, disabled: boolean }) {
  const [show, setShow] = useState(false);
  const [text, setText] = useState(initialDescription || '');

  if (disabled) return <button disabled className="bg-zinc-800 text-zinc-600 px-6 py-2 rounded-lg cursor-not-allowed">Låst (Ändra status till Pågående)</button>;

  return (
    <>
      <button onClick={() => setShow(true)} className="bg-zinc-800 hover:bg-zinc-700 text-white px-6 py-2 rounded-lg">
        Arbetsbeskrivning
      </button>

      {show && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-8">
          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl w-full max-w-2xl">
            <h2 className="text-2xl font-bold mb-4 text-orange-dynex">Uppdatera Arbetsbeskrivning</h2>
            <textarea 
              className="w-full bg-black border border-zinc-800 rounded-xl p-4 text-white min-h-[200px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end gap-4 mt-6">
              <button onClick={() => setShow(false)} className="text-zinc-500">Avbryt</button>
              <button onClick={async () => {
                await updateJobDescription(id, text);
                setShow(false);
                window.location.reload();
              }} className="bg-orange-dynex text-black px-8 py-2 rounded-xl font-bold">Spara</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}