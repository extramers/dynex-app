'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateJobDescription } from '../../actions';

interface DescriptionEditorProps {
  id: string;
  initialDescription: string;
  canEdit: boolean;
  onSave?: (newDescription: string) => void;
}

export default function DescriptionEditor({ id, initialDescription, canEdit, onSave }: DescriptionEditorProps) {
  const [description, setDescription] = useState(initialDescription || '');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const router = useRouter();

  const handleSave = async () => {
    if (!canEdit) return;
    setIsSaving(true);
    try {
      await updateJobDescription(id, description);
      setLastSaved(new Date().toLocaleTimeString('sv-SE'));
      if (onSave) onSave(description);
      router.refresh();
    } catch (error) {
      console.error('Failed to save description', error);
      alert('Kunde inte spara arbetsbeskrivningen.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-orange-dynex font-black uppercase tracking-widest text-[10px]">
          Allmänna arbetsanteckningar
        </h3>
        {lastSaved && (
          <span className="text-zinc-600 text-[9px] italic font-bold">SPARAD {lastSaved}</span>
        )}
      </div>
      
      {canEdit ? (
        <div className="space-y-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-2xl p-6 focus:border-orange-dynex outline-none text-zinc-100 text-lg italic leading-relaxed min-h-[350px] shadow-inner"
            placeholder="Skriv vad som gjorts, t.ex:
- Bytt olja och filter
- Uppdaterat mjukvara till steg 1
- Kontrollerat bromsar"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-orange-dynex hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-black font-black py-4 rounded-xl transition-all shadow-[0_0_15px_rgba(255,102,0,0.2)] uppercase text-xs tracking-widest"
          >
            {isSaving ? 'Sparar...' : 'Spara anteckningar'}
          </button>
        </div>
      ) : (
        <div className="p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800 text-zinc-500 text-sm italic leading-relaxed">
          <p className="mb-4">🔒 Anteckningar är låsta för tillfället.</p>
          <p className="text-xs">Du kan endast redigera dessa när ordern har status &quot;Pågående&quot; eller &quot;Klar&quot;.</p>
          
          {description && (
            <div className="mt-8 pt-8 border-t border-zinc-800">
               <p className="text-zinc-400 non-italic">{description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}