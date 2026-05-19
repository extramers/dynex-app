'use client';

import { useState, useEffect } from 'react';
import { createQuotation } from '../actions';

interface LineItem {
  description: string;
  quantity: number;
  price: number;
}

const BRAND_MODELS: Record<string, string[]> = {
  'Volvo': ['V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'S60', 'S90'],
  'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'e-tron'],
  'BMW': ['1-serie', '2-serie', '3-serie', '4-serie', '5-serie', '6-serie', '7-serie', 'X1', 'X3', 'X5', 'X7', 'i3', 'i4', 'iX'],
  'Volkswagen': ['Golf', 'Passat', 'Polo', 'Tiguan', 'Touareg', 'ID.3', 'ID.4', 'ID.5', 'Caddy', 'Transporter'],
  'Toyota': ['Yaris', 'Corolla', 'Camry', 'RAV4', 'Land Cruiser', 'Hilux', 'Proace'],
  'Tesla': ['Model 3', 'Model S', 'Model X', 'Model Y'],
  'Mercedes-Benz': ['A-Klass', 'B-Klass', 'C-Klass', 'E-Klass', 'S-Klass', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQA', 'EQB', 'EQC', 'EQE', 'EQS'],
  'Ford': ['Fiesta', 'Focus', 'Mondeo', 'Mustang', 'Explorer', 'Kuga', 'Transit', 'Ranger'],
  'Kia': ['Picanto', 'Ceed', 'Niro', 'Sportage', 'Sorento', 'EV6', 'EV9'],
  'Hyundai': ['i10', 'i20', 'i30', 'Kona', 'Tucson', 'Santa Fe', 'IONIQ 5', 'IONIQ 6'],
  'Skoda': ['Fabia', 'Scala', 'Octavia', 'Superb', 'Kamiq', 'Karoq', 'Kodiaq', 'Enyaq'],
  'Seat': ['Ibiza', 'Leon', 'Arona', 'Ateca', 'Tarraco'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'Partner', 'Expert'],
  'Renault': ['Clio', 'Megane', 'Captur', 'Kadjar', 'Zoe', 'Kangoo', 'Master']
};

export default function QuotationForm() {
  const [laborItems, setLaborItems] = useState<LineItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [partsItems, setPartsItems] = useState<LineItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [optimizationItems, setOptimizationItems] = useState<LineItem[]>([{ description: '', quantity: 1, price: 0 }]);
  const [partsMode, setPartsMode] = useState<'parts' | 'optimization'>('parts');
  const [totalPrice, setTotalPrice] = useState(0);
  
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  useEffect(() => {
    const laborTotal = laborItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const partsTotal = partsItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const optimizationTotal = optimizationItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    setTotalPrice(laborTotal + partsTotal + optimizationTotal);
  }, [laborItems, partsItems, optimizationItems]);

  const handleBrandChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const brand = e.target.value;
    setSelectedBrand(brand);
    if (BRAND_MODELS[brand]) {
      setAvailableModels(BRAND_MODELS[brand]);
    } else {
      setAvailableModels([]);
    }
  };

  const addLaborItem = () => setLaborItems([...laborItems, { description: '', quantity: 1, price: 0 }]);
  const addPartsItem = () => setPartsItems([...partsItems, { description: '', quantity: 1, price: 0 }]);
  const addOptimizationItem = () => setOptimizationItems([...optimizationItems, { description: '', quantity: 1, price: 0 }]);

  const updateLaborItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...laborItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLaborItems(newItems);
  };

  const updatePartsItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...partsItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setPartsItems(newItems);
  };

  const updateOptimizationItem = (index: number, field: keyof LineItem, value: string | number) => {
    const newItems = [...optimizationItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setOptimizationItems(newItems);
  };

  const removeLaborItem = (index: number) => {
    if (laborItems.length > 1) setLaborItems(laborItems.filter((_, i) => i !== index));
  };

  const removePartsItem = (index: number) => {
    if (partsItems.length > 1) setPartsItems(partsItems.filter((_, i) => i !== index));
  };

  const removeOptimizationItem = (index: number) => {
    if (optimizationItems.length > 1) setOptimizationItems(optimizationItems.filter((_, i) => i !== index));
  };

  return (
    <form action={createQuotation} className="space-y-8 bg-zinc-900 p-8 rounded-3xl border border-zinc-800 shadow-2xl">
      {/* Hidden inputs for structured data */}
      <input type="hidden" name="laborData" value={JSON.stringify(laborItems)} />
      <input type="hidden" name="partsData" value={JSON.stringify(partsItems)} />
      <input type="hidden" name="optimizationData" value={JSON.stringify(optimizationItems)} />
      <input type="hidden" name="totalPrice" value={totalPrice.toString()} />

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-orange-dynex border-b border-orange-dynex/20 pb-2 uppercase tracking-widest">FORDON</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Bilmärke</label>
            <div className="relative">
              <select 
                name="carBrand" 
                required 
                onChange={handleBrandChange}
                value={selectedBrand}
                className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 focus:border-orange-dynex outline-none transition-all appearance-none cursor-pointer" 
              >
                <option value="">Välj...</option>
                {Object.keys(BRAND_MODELS).sort().map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
                <option value="Annat">Annat...</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
            {selectedBrand === 'Annat' && (
               <input
                 name="customCarBrand"
                 placeholder="Ange bilmärke"
                 required
                 className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 mt-2 focus:border-orange-dynex outline-none transition-all"
               />
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Modell</label>
            {!selectedBrand ? (
              <div className="relative">
                <select disabled className="w-full bg-black border border-zinc-800 text-zinc-600 rounded-md py-2 px-4 appearance-none cursor-not-allowed">
                  <option>Välj bilmärke först...</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-600">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            ) : availableModels.length > 0 ? (
              <>
                <div className="relative">
                  <select 
                    name="carModel" 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    required
                    className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 focus:border-orange-dynex outline-none transition-all appearance-none cursor-pointer" 
                  >
                    <option value="">Välj modell...</option>
                    {availableModels.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                    <option value="Annat">Annat...</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-zinc-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {selectedModel === 'Annat' && (
                  <input
                    name="customCarModel"
                    placeholder="Ange modell"
                    required
                    className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 mt-2 focus:border-orange-dynex outline-none transition-all"
                  />
                )}
              </>
            ) : (
              <input 
                name="carModel" 
                placeholder="Skriv modell..."
                required
                className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 focus:border-orange-dynex outline-none transition-all" 
              />
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Årsmodell</label>
            <input 
              name="carYear" 
              type="text" 
              list="years"
              required 
              placeholder="Sök eller skriv..."
              className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 focus:border-orange-dynex outline-none transition-all" 
            />
            <datalist id="years">
              {Array.from({ length: 30 }, (_, i) => (new Date().getFullYear() + 1) - i).map(year => (
                <option key={year} value={year.toString()} />
              ))}
            </datalist>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Reg-nummer (REGNR)</label>
            <input 
              name="registrationNumber" 
              placeholder="ABC 123"
              className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 focus:border-orange-dynex outline-none transition-all uppercase" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Mätarställning (mil)</label>
            <input 
              name="mileage" 
              type="text" 
              list="mileages"
              required 
              placeholder="Sök eller skriv..."
              className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 focus:border-orange-dynex outline-none transition-all" 
            />
            <datalist id="mileages">
              {[0, 500, 1000, 2500, 5000, 7500, 10000, 12500, 15000, 17500, 20000, 25000, 30000].map(m => (
                <option key={m} value={m.toString()} />
              ))}
            </datalist>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-orange-dynex border-b border-orange-dynex/20 pb-2 uppercase tracking-widest">KUND</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Kundnamn</label>
            <input name="customerName" required className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 focus:border-orange-dynex outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Telefon</label>
            <input name="customerPhone" className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 focus:border-orange-dynex outline-none transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">E-post</label>
            <input name="customerEmail" type="email" className="w-full bg-black border border-zinc-700 rounded-md py-2 px-4 focus:border-orange-dynex outline-none transition-all" />
          </div>
        </div>
      </div>

      {/* Labor Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-orange-dynex uppercase tracking-widest border-b border-orange-dynex/20 pb-2">Arbete</h3>
        <div className="space-y-3">
          {laborItems.map((item, index) => (
            <div key={index} className="flex gap-4 items-end bg-black/20 p-4 rounded-xl border border-zinc-800/50">
              <div className="flex-[3]">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Beskrivning</label>
                <input 
                  value={item.description} 
                  onChange={(e) => updateLaborItem(index, 'description', e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 outline-none focus:border-orange-dynex transition-all" 
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Timmar</label>
                <input 
                  type="number" 
                  step="0.5"
                  value={item.quantity} 
                  onChange={(e) => updateLaborItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 outline-none focus:border-orange-dynex transition-all" 
                />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase">Pris/tim</label>
                <input 
                  type="number" 
                  value={item.price} 
                  onChange={(e) => updateLaborItem(index, 'price', parseFloat(e.target.value) || 0)}
                  className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 outline-none focus:border-orange-dynex transition-all" 
                />
              </div>
              <button type="button" onClick={() => removeLaborItem(index)} className="text-zinc-600 hover:text-red-500 transition-colors mb-2">✕</button>
            </div>
          ))}
        </div>
        <button type="button" onClick={addLaborItem} className="text-xs font-bold text-orange-dynex hover:text-orange-400 transition-colors flex items-center gap-1">
          <span className="text-lg">+</span> LÄGG TILL ARBETE
        </button>
      </div>

      {/* Parts/Optimization Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-8 border-b border-orange-dynex/20 pb-2">
          <button 
            type="button" 
            onClick={() => setPartsMode('parts')}
            className={`text-xl font-bold transition-all uppercase tracking-widest ${partsMode === 'parts' ? 'text-orange-dynex border-b-2 border-orange-dynex pb-1' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Reservdelar
          </button>
          <button 
            type="button" 
            onClick={() => setPartsMode('optimization')}
            className={`text-xl font-bold transition-all uppercase tracking-widest ${partsMode === 'optimization' ? 'text-orange-dynex border-b-2 border-orange-dynex pb-1' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Optimering
          </button>
        </div>

        {partsMode === 'parts' ? (
          <div className="space-y-4">
            <div className="space-y-3">
              {partsItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-end bg-black/20 p-4 rounded-xl border border-zinc-800/50">
                  <div className="flex-[3]">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Del</label>
                    <input 
                      value={item.description} 
                      onChange={(e) => updatePartsItem(index, 'description', e.target.value)}
                      className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 outline-none focus:border-orange-dynex transition-all" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Antal</label>
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updatePartsItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 outline-none focus:border-orange-dynex transition-all" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Pris/st</label>
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => updatePartsItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-black border border-zinc-700 rounded-md py-1 px-3 outline-none focus:border-orange-dynex transition-all" 
                    />
                  </div>
                  <button type="button" onClick={() => removePartsItem(index)} className="text-zinc-600 hover:text-red-500 transition-colors mb-2">✕</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addPartsItem} className="text-xs font-bold text-orange-dynex hover:text-orange-400 transition-colors flex items-center gap-1">
              <span className="text-lg">+</span> LÄGG TILL DEL
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {optimizationItems.map((item, index) => (
                <div key={index} className="flex gap-4 items-end bg-orange-dynex/5 p-4 rounded-xl border border-orange-dynex/20">
                  <div className="flex-[3]">
                    <label className="text-[10px] font-bold text-orange-dynex uppercase">Optimering / Programvara</label>
                    <input 
                      value={item.description} 
                      onChange={(e) => updateOptimizationItem(index, 'description', e.target.value)}
                      className="w-full bg-black border border-orange-dynex/20 rounded-md py-1 px-3 outline-none focus:border-orange-dynex transition-all" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-orange-dynex uppercase">Antal</label>
                    <input 
                      type="number" 
                      value={item.quantity} 
                      onChange={(e) => updateOptimizationItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full bg-black border border-orange-dynex/20 rounded-md py-1 px-3 outline-none focus:border-orange-dynex transition-all" 
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-orange-dynex uppercase">Pris</label>
                    <input 
                      type="number" 
                      value={item.price} 
                      onChange={(e) => updateOptimizationItem(index, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-black border border-orange-dynex/20 rounded-md py-1 px-3 outline-none focus:border-orange-dynex transition-all" 
                    />
                  </div>
                  <button type="button" onClick={() => removeOptimizationItem(index)} className="text-zinc-600 hover:text-red-500 transition-colors mb-2">✕</button>
                </div>
              ))}
            </div>
            <button type="button" onClick={addOptimizationItem} className="text-xs font-bold text-orange-dynex hover:text-orange-400 transition-colors flex items-center gap-1">
              <span className="text-lg">+</span> LÄGG TILL OPTIMERING
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-between items-center pt-8 border-t border-zinc-800">
        <div className="text-3xl font-black">
          TOTALT: <span className="text-orange-dynex">{totalPrice.toLocaleString('sv-SE')} KR</span>
        </div>
        <button type="submit" className="bg-orange-dynex hover:bg-orange-600 text-black font-black py-4 px-12 rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,102,0,0.3)] uppercase tracking-widest">
          Skapa Offert
        </button>
      </div>
    </form>
  );
}