'use client';

import { useState, useEffect } from 'react';
import { createQuotation } from '../actions';

interface LineItem { description: string; quantity: number; price: number; }

const BRAND_MODELS: Record<string, string[]> = {
  'Volvo': ['V40', 'V60', 'V70', 'V90', 'XC40', 'XC60', 'XC90', 'S60', 'S90'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  'BMW': ['1-serie', '2-serie', '3-serie', '4-serie', '5-serie', 'X1', 'X3', 'X5', 'i3', 'i4'],
  'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touareg', 'ID.3', 'ID.4', 'Caddy', 'Transporter'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
  'Mercedes-Benz': ['A-Klass', 'C-Klass', 'E-Klass', 'S-Klass', 'GLA', 'GLB', 'GLC', 'GLE'],
  'Skoda': ['Octavia', 'Superb', 'Fabia', 'Enyaq', 'Kodiaq'],
  'Toyota': ['Yaris', 'Corolla', 'RAV4', 'Hilux', 'Land Cruiser']
};

export default function NewQuotation() {
  const [laborItems, setLaborItems] = useState<LineItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [partsItems, setPartsItems] = useState<LineItem[]>([]);
  const [optimizationItems, setOptimizationItems] = useState<LineItem[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const labor = laborItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const parts = partsItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const optimization = optimizationItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setTotalPrice(labor + parts + optimization);
  }, [laborItems, partsItems, optimizationItems]);

  const updateItem = (list: LineItem[], setList: any, index: number, field: keyof LineItem, value: any) => {
    const newList = [...list];
    newList[index] = { ...newList[index], [field]: value };
    setList(newList);
  };

  const removeItem = (list: LineItem[], setList: any, index: number) => {
    setList(list.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h1 className="text-4xl font-bold text-orange-dynex mb-8 uppercase tracking-tighter">Ny Offert</h1>
      
      <form action={createQuotation} className="space-y-8">
        <input type="hidden" name="laborData" value={JSON.stringify(laborItems)} />
        <input type="hidden" name="partsData" value={JSON.stringify(partsItems)} />
        <input type="hidden" name="optimizationData" value={JSON.stringify(optimizationItems)} />
        <input type="hidden" name="totalPrice" value={totalPrice.toString()} />

        {/* FORDON */}
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
          <h3 className="text-xl font-bold text-orange-dynex border-b border-orange-dynex/20 pb-2 uppercase tracking-widest">FORDON</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Bilmärke</label>
              <input name="carBrand" list="brands" required onChange={(e) => setSelectedBrand(e.target.value)} className="w-full bg-black border border-zinc-700 rounded-md py-2 px-3 text-sm focus:border-orange-dynex outline-none" placeholder="Märke..." />
              <datalist id="brands">{Object.keys(BRAND_MODELS).sort().map(b => <option key={b} value={b} />)}</datalist>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Modell</label>
              <input name="carModel" list="models" className="w-full bg-black border border-zinc-700 rounded-md py-2 px-3 text-sm focus:border-orange-dynex outline-none" placeholder="Modell..." />
              <datalist id="models">{BRAND_MODELS[selectedBrand]?.map(m => <option key={m} value={m} />)}</datalist>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Årsmodell</label>
              <input name="carYear" list="years" required className="w-full bg-black border border-zinc-700 rounded-md py-2 px-3 text-sm focus:border-orange-dynex outline-none" placeholder="År..." />
              <datalist id="years">{Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() + 1) - i).map(y => <option key={y} value={y.toString()} />)}</datalist>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Reg-nummer</label>
              <input name="registrationNumber" className="w-full bg-black border border-zinc-700 rounded-md py-2 px-3 text-sm focus:border-orange-dynex outline-none uppercase" placeholder="ABC 123" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Mätarställning (mil)</label>
              <input name="mileage" list="mileages" required className="w-full bg-black border border-zinc-700 rounded-md py-2 px-3 text-sm focus:border-orange-dynex outline-none" placeholder="Mil..." />
              <datalist id="mileages">{[0, 500, 1000, 2500, 5000, 7500, 10000, 15000, 20000].map(m => <option key={m} value={m.toString()} />)}</datalist>
            </div>
          </div>
        </div>

        {/* ARBETE */}
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
          <h3 className="text-xl font-bold text-orange-dynex uppercase tracking-widest">Arbete</h3>
          {laborItems.map((item, i) => (
            <div key={i} className="flex gap-4 items-end bg-black/20 p-4 rounded-xl border border-zinc-800/50">
              <div className="flex-[3]"><label className="text-[10px] text-zinc-500 uppercase">Beskrivning</label><input className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 text-sm outline-none" value={item.description} onChange={e => updateItem(laborItems, setLaborItems, i, 'description', e.target.value)} /></div>
              <div className="flex-1"><label className="text-[10px] text-zinc-500 uppercase text-right block">Timmar</label><input className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 text-sm outline-none text-right" type="number" step="0.5" value={item.quantity} onChange={e => updateItem(laborItems, setLaborItems, i, 'quantity', parseFloat(e.target.value) || 0)} /></div>
              <div className="flex-1"><label className="text-[10px] text-zinc-500 uppercase text-right block">Pris/tim</label><input className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 text-sm outline-none text-right" type="number" value={item.price} onChange={e => updateItem(laborItems, setLaborItems, i, 'price', parseFloat(e.target.value) || 0)} /></div>
              <button type="button" onClick={() => removeItem(laborItems, setLaborItems, i)} className="text-red-500 mb-1 px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => setLaborItems([...laborItems, { description: '', quantity: 1, price: 0 }])} className="text-xs text-orange-dynex font-bold">+ LÄGG TILL ARBETE</button>
        </div>

        {/* OPTIMERING */}
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
          <h3 className="text-xl font-bold text-orange-dynex uppercase tracking-widest">Optimering</h3>
          {optimizationItems.map((item, i) => (
            <div key={i} className="flex gap-4 items-end bg-orange-dynex/5 p-4 rounded-xl border border-orange-dynex/20">
              <div className="flex-[3]"><label className="text-[10px] text-zinc-500 uppercase">Programvara / Steg</label><input className="w-full bg-black border border-orange-dynex/20 rounded-md py-1 px-3 text-sm outline-none" value={item.description} onChange={e => updateItem(optimizationItems, setOptimizationItems, i, 'description', e.target.value)} /></div>
              <div className="flex-1"><label className="text-[10px] text-zinc-500 uppercase text-right block">Pris</label><input className="w-full bg-black border border-orange-dynex/20 rounded-md py-1 px-3 text-sm outline-none text-right" type="number" value={item.price} onChange={e => updateItem(optimizationItems, setOptimizationItems, i, 'price', parseFloat(e.target.value) || 0)} /></div>
              <button type="button" onClick={() => removeItem(optimizationItems, setOptimizationItems, i)} className="text-red-500 mb-1 px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => setOptimizationItems([...optimizationItems, { description: '', quantity: 1, price: 0 }])} className="text-xs text-orange-dynex font-bold">+ LÄGG TILL OPTIMERING</button>
        </div>

        {/* RESERVDELAR */}
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
          <div className="flex justify-between items-center border-b border-orange-dynex/20 pb-2">
             <h3 className="text-xl font-bold text-orange-dynex uppercase tracking-widest">Reservdelar</h3>
             {partsItems.length > 0 && <span className="text-[10px] text-zinc-500 italic">Lämna tomt för att dölja i offert</span>}
          </div>
          {partsItems.map((item, i) => (
            <div key={i} className="flex gap-4 items-end bg-black/20 p-4 rounded-xl border border-zinc-800/50">
              <div className="flex-[3]"><label className="text-[10px] text-zinc-500 uppercase">Artikel</label><input className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 text-sm outline-none" value={item.description} onChange={e => updateItem(partsItems, setPartsItems, i, 'description', e.target.value)} /></div>
              <div className="flex-1"><label className="text-[10px] text-zinc-500 uppercase text-right block">Antal</label><input className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 text-sm outline-none text-right" type="number" value={item.quantity} onChange={e => updateItem(partsItems, setPartsItems, i, 'quantity', parseFloat(e.target.value) || 0)} /></div>
              <div className="flex-1"><label className="text-[10px] text-zinc-500 uppercase text-right block">Pris/st</label><input className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 text-sm outline-none text-right" type="number" value={item.price} onChange={e => updateItem(partsItems, setPartsItems, i, 'price', parseFloat(e.target.value) || 0)} /></div>
              <button type="button" onClick={() => removeItem(partsItems, setPartsItems, i)} className="text-red-500 mb-1 px-2">✕</button>
            </div>
          ))}
          <button type="button" onClick={() => setPartsItems([...partsItems, { description: '', quantity: 1, price: 0 }])} className="text-xs text-orange-dynex font-bold">+ LÄGG TILL RESERVDEL</button>
        </div>

        {/* KUND */}
        <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-xl space-y-4">
          <h3 className="text-xl font-bold text-orange-dynex border-b border-orange-dynex/20 pb-2 uppercase tracking-widest">KUND</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Namn</label><input name="customerName" required className="w-full bg-black border border-zinc-700 rounded-md py-2 px-3 text-sm outline-none" /></div>
            <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">Telefon</label><input name="customerPhone" className="w-full bg-black border border-zinc-700 rounded-md py-2 px-3 text-sm outline-none" /></div>
            <div><label className="text-[10px] font-bold text-zinc-500 uppercase mb-1 block">E-post</label><input name="customerEmail" type="email" className="w-full bg-black border border-zinc-700 rounded-md py-2 px-3 text-sm outline-none" /></div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-8 bg-black p-8 rounded-3xl border border-zinc-800">
          <div className="text-3xl font-black italic uppercase">Totalbelopp: <span className="text-orange-dynex">{totalPrice.toLocaleString('sv-SE')} KR</span></div>
          <button type="submit" className="bg-orange-dynex hover:bg-orange-600 text-black font-black py-4 px-12 rounded-xl uppercase tracking-widest shadow-[0_0_20px_rgba(255,102,0,0.3)] transition-all">Skapa Offert</button>
        </div>
      </form>
    </div>
  );
}