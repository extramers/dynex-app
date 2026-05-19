'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PrintButton from './PrintButton';
import DescriptionEditor from './DescriptionEditor';
import { updateInvoiceDetails, updateOrderList, updateOrderItems, updateNotes } from '../../actions';

interface LineItem {
  description: string;
  quantity: number;
  price: number;
  note?: string;
}

interface Order {
  id: string;
  car_brand: string;
  car_model?: string;
  car_year: string | number;
  registration_number?: string;
  mileage: string | number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  status: string;
  created_at: string;
  job_description: string;
  total_price: number;
  labor_list: string;
  parts_list: string;
  optimization_list: string;
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  our_reference?: string;
  your_reference?: string;
  payment_terms?: string;
  customer_number?: string;
  quote_notes?: string;
  general_notes?: string;
}

export default function OrderTabs({ order }: { order: Order }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'offert' | 'faktura' | 'workshop' | 'kvitto'>('offert');
  const [currentStatus, setCurrentStatus] = useState(order.status);
  
  const [carBrand, setCarBrand] = useState(order.car_brand);
  const [carModel, setCarModel] = useState(order.car_model || '');
  const [carYear, setCarYear] = useState(order.car_year.toString());
  const [regNr, setRegNr] = useState(order.registration_number || '');
  const [mileage, setMileage] = useState(order.mileage.toString());

  const [custName, setCustName] = useState(order.customer_name);
  const [custPhone, setCustPhone] = useState(order.customer_phone);
  const [custEmail, setCustEmail] = useState(order.customer_email);

  const [quoteNotes, setQuoteNotes] = useState(order.quote_notes || '');
  const [generalNotes, setGeneralNotes] = useState(order.general_notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  
  // Invoice states
  const [invoiceNumber, setInvoiceNumber] = useState((order.invoice_number || '').replace('-', ''));
  const [invoiceDate, setInvoiceDate] = useState(order.invoice_date || '');
  const [dueDate, setDueDate] = useState(order.due_date || '');
  const [ourReference, setOurReference] = useState(order.our_reference || order.registration_number || 'Dynex Performance');
  const [yourReference, setYourReference] = useState(order.your_reference || order.registration_number || order.customer_name);
  const [paymentTerms, setPaymentTerms] = useState(order.payment_terms || '10 dagar netto');
  const [isSavingInvoice, setIsSavingInvoice] = useState(false);
  
  const [invCustomerName, setInvCustomerName] = useState(order.customer_name || '');
  const [invCustomerPhone, setInvCustomerPhone] = useState(order.customer_phone || '');
  const [invCustomerEmail, setInvCustomerEmail] = useState(order.customer_email || '');
  
  const [reminderLevel, setReminderLevel] = useState<0 | 1 | 2>(0);
  const [reminderFee, setReminderFee] = useState(60);
  const [paymentMethod, setPaymentMethod] = useState<'Swish' | 'Banköverföring'>('Swish');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [invTotalPrice, setInvTotalPrice] = useState('');

  const [laborItems, setLaborItems] = useState<LineItem[]>(JSON.parse(order.labor_list || '[]'));
  const [partsItems, setPartsItems] = useState<LineItem[]>(JSON.parse(order.parts_list || '[]'));
  const [optimizationItems, setOptimizationItems] = useState<LineItem[]>(JSON.parse(order.optimization_list || '[]'));
  const [totalPrice, setTotalPrice] = useState(order.total_price || 0);
  const [isEditingOffert, setIsEditingOffert] = useState(false);
  const [isSavingOffert, setIsSavingOffert] = useState(false);
  const [showGeneralNotes, setShowGeneralNotes] = useState(false);
  const [jobDescription, setJobDescription] = useState(order.job_description || '');
  
  const [editingNote, setEditingNote] = useState<{ type: 'labor' | 'optimization', index: number } | null>(null);
  const [tempNote, setTempNote] = useState('');

  const canEditDescription = currentStatus === 'Pågående' || currentStatus === 'Klar' || currentStatus === 'Väntar Betalning';
  const currentTotal = (totalPrice || 0) + (reminderLevel > 0 ? reminderFee : 0);
  const displayTotal = invTotalPrice || currentTotal.toString();
  
  const baseTotal = Number(displayTotal) || 0;
  const vatableAmount = reminderLevel > 0 ? baseTotal - reminderFee : baseTotal;
  const netto = (vatableAmount / 1.25) + (reminderLevel > 0 ? reminderFee : 0);
  const moms = vatableAmount - (vatableAmount / 1.25);

  const invoiceItems = [
    ...laborItems.map(item => ({ type: 'Arbete', desc: item.description, qty: item.quantity, price: item.price / 1.25, total: (item.quantity * item.price) / 1.25, unit: 'h' })),
    ...partsItems.map(item => ({ type: 'Reservdel', desc: item.description, qty: item.quantity, price: item.price / 1.25, total: (item.quantity * item.price) / 1.25, unit: 'st' })),
    ...optimizationItems.map(item => ({ type: 'Optimering', desc: item.description, qty: 1, price: (item.quantity * item.price) / 1.25, total: (item.quantity * item.price) / 1.25, unit: 'st' }))
  ];
  
  if (reminderLevel > 0) {
    invoiceItems.push({ type: 'Avgift', desc: 'Påminnelseavgift', qty: 1, price: reminderFee, total: reminderFee, unit: 'st' });
  }

  const handleSaveNote = async () => {
    if (!editingNote) return;
    try {
      const { type, index } = editingNote;
      if (type === 'labor') {
        const newItems = [...laborItems];
        newItems[index].note = tempNote;
        setLaborItems(newItems);
        await updateOrderList(order.id, 'labor_list', JSON.stringify(newItems));
      } else {
        const newItems = [...optimizationItems];
        newItems[index].note = tempNote;
        setOptimizationItems(newItems);
        await updateOrderList(order.id, 'optimization_list', JSON.stringify(newItems));
      }
      setEditingNote(null);
    } catch (error) {
      console.error('Failed to save note', error);
      alert('Kunde inte spara anteckningen. Försök igen.');
    }
  };

  const handleSaveInvoice = async () => {
    setIsSavingInvoice(true);
    try {
      await updateInvoiceDetails(order.id, invoiceNumber, invoiceDate, dueDate, ourReference, yourReference, paymentTerms);
      alert('Fakturauppgifter sparade!');
    } catch (error) {
      console.error(error);
      alert('Kunde inte spara fakturauppgifter.');
    } finally {
      setIsSavingInvoice(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    try {
      await updateNotes(order.id, quoteNotes, generalNotes);
      alert('Anteckningar sparade!');
    } catch (error) {
      console.error(error);
      alert('Kunde inte spara anteckningar.');
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleUpdateItems = async () => {
    setIsSavingOffert(true);
    try {
      await import('../../actions').then(m => m.updateCarDetails(order.id, carBrand, carModel, carYear, regNr, mileage));
      await import('../../actions').then(m => m.updateCustomerDetails(order.id, custName, custPhone, custEmail));

      const newTotal = [
        ...laborItems.map(i => Number(i.quantity) * Number(i.price)),
        ...partsItems.map(i => Number(i.quantity) * Number(i.price)),
        ...optimizationItems.map(i => Number(i.quantity) * Number(i.price))
      ].reduce((sum, val) => sum + val, 0);
      
      setTotalPrice(newTotal);
      await updateOrderItems(
        order.id, 
        JSON.stringify(laborItems), 
        JSON.stringify(partsItems), 
        JSON.stringify(optimizationItems), 
        newTotal
      );
      setIsEditingOffert(false);
      alert('Offert uppdaterad!');
    } catch (error) {
      console.error(error);
      alert('Kunde inte uppdatera offert.');
    } finally {
      setIsSavingOffert(false);
    }
  };

  const addItem = (type: 'labor' | 'parts' | 'optimization') => {
    const newItem = { description: '', quantity: 1, price: 0 };
    if (type === 'labor') setLaborItems([...laborItems, newItem]);
    if (type === 'parts') setPartsItems([...partsItems, newItem]);
    if (type === 'optimization') setOptimizationItems([...optimizationItems, newItem]);
  };

  const removeItem = (type: 'labor' | 'parts' | 'optimization', index: number) => {
    if (window.confirm('Är du säker på att du vill ta bort raden?')) {
      if (type === 'labor') setLaborItems(laborItems.filter((_, i) => i !== index));
      if (type === 'parts') setPartsItems(partsItems.filter((_, i) => i !== index));
      if (type === 'optimization') setOptimizationItems(optimizationItems.filter((_, i) => i !== index));
    }
  };

  const updateItem = (type: 'labor' | 'parts' | 'optimization', index: number, field: keyof LineItem, value: any) => {
    if (type === 'labor') {
      const newItems = [...laborItems];
      (newItems[index] as any)[field] = field === 'description' ? value : Number(value);
      setLaborItems(newItems);
    }
    if (type === 'parts') {
      const newItems = [...partsItems];
      (newItems[index] as any)[field] = field === 'description' ? value : Number(value);
      setPartsItems(newItems);
    }
    if (type === 'optimization') {
      const newItems = [...optimizationItems];
      (newItems[index] as any)[field] = field === 'description' ? value : Number(value);
      setOptimizationItems(newItems);
    }
  };

  const renderItemsTables = (titlePrefix: string) => {
    const offertItems = [
      ...laborItems.map(item => ({ type: 'Arbete', desc: item.description, qty: item.quantity, price: item.price, total: item.quantity * item.price, unit: 'h' })),
      ...partsItems.map(item => ({ type: 'Reservdel', desc: item.description, qty: item.quantity, price: item.price, total: item.quantity * item.price, unit: 'st' })),
      ...optimizationItems.map(item => ({ type: 'Optimering', desc: item.description, qty: 1, price: item.quantity * item.price, total: item.quantity * item.price, unit: 'st' }))
    ];

    return (
      <div className="space-y-8 print:space-y-4 flex flex-col h-full print:block">
        {offertItems.length > 0 && (
          <div className="mb-4 overflow-x-auto print:overflow-visible print:mb-4">
            <table className="w-full table-fixed text-left text-sm print:text-xs mb-10 print:mb-4">
              <colgroup>
                <col className="w-[52%]" />
                <col className="w-[14%]" />
                <col className="w-[17%]" />
                <col className="w-[17%]" />
              </colgroup>
              <thead>
                <tr className="border-y-2 border-zinc-800 print:border-black uppercase text-[10px] font-black text-zinc-500 print:text-zinc-900 tracking-widest">
                  <th className="w-[52%] py-3 print:py-2 pl-2 text-left">Produkt / tjänst</th>
                  <th className="w-[14%] py-3 print:py-2 text-right">Antal</th>
                  <th className="w-[17%] py-3 print:py-2 text-right">À-pris</th>
                  <th className="w-[17%] py-3 print:py-2 text-right pr-2">Belopp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 print:divide-zinc-200">
                {offertItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-zinc-800/20 print:hover:bg-transparent transition-colors print:break-inside-avoid">
                    <td className="w-[52%] py-4 print:py-2 pl-2 text-zinc-200 print:text-black align-top">
                      <span className="italic text-zinc-500 print:text-zinc-600 text-xs mr-2">({item.type})</span>
                      <span className="font-bold">{item.desc}</span>
                    </td>
                    <td className="py-4 print:py-2 text-right text-zinc-400 print:text-black font-medium">{item.qty} {item.unit}</td>
                    <td className="py-4 print:py-2 text-right text-zinc-400 print:text-black font-medium">{item.price.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}</td>
                    <td className="py-4 print:py-2 text-right font-black text-zinc-200 print:text-black pr-2">{item.total.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-12 pt-8 print:mt-6 print:pt-4 border-t-2 border-orange-dynex text-right print:border-black print:page-break-inside-avoid">
          <p className="text-zinc-500 print:text-zinc-500 uppercase tracking-widest text-xs font-bold mb-1">{titlePrefix}</p>
          <p className="text-5xl print:text-3xl font-black text-orange-dynex">{(order.total_price || 0).toLocaleString('sv-SE')} kr</p>
          <p className="text-xs print:text-[10px] text-zinc-600 print:text-zinc-500 mt-2 print:mt-1 font-bold uppercase">Belopp inkl. moms</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* GLOBAL PRINT STYLES - Ensures exact colors and safe margins for printers */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: auto; margin: 12mm !important; }
          body { 
            -webkit-print-color-adjust: exact !important; 
            print-color-adjust: exact !important; 
            background-color: white !important;
          }
        }
      `}} />

      {/* Header with Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 print:hidden">
        <Link href="/jobbordrar" className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 font-bold text-sm">
          <span>←</span> TILLBAKA
        </Link>
        
        <div className="flex flex-wrap sm:flex-nowrap bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('offert')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'offert' ? 'bg-orange-dynex text-black' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            OFFERT
          </button>
          <button
            onClick={() => setActiveTab('workshop')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'workshop' ? 'bg-orange-dynex text-black' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            ARBETSBESKRIVNING
          </button>
          <button
            onClick={() => setActiveTab('faktura')}
            className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'faktura' ? 'bg-orange-dynex text-black' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            FAKTURA
          </button>
          {currentStatus === 'Klar' && (
            <button
              onClick={() => setActiveTab('kvitto')}
              className={`px-6 py-2 text-xs font-bold rounded-lg transition-all ${
                activeTab === 'kvitto' ? 'bg-orange-dynex text-black' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              KVITTO
            </button>
          )}
        </div>

        <PrintButton />
      </div>

      {/* Content Area */}
      <div className="bg-zinc-900 border border-zinc-800 p-4 sm:p-8 md:p-12 rounded-3xl shadow-2xl print:shadow-none print:border-none print:bg-transparent print:p-0 relative z-10 overflow-hidden md:overflow-visible print:overflow-visible">
        
        {/* Top Branding Section */}
        <div className={`flex flex-col md:flex-row print:flex-row justify-between items-start border-b border-zinc-800 pb-8 mb-8 print:pb-4 print:mb-6 print:border-black ${activeTab === 'faktura' || activeTab === 'kvitto' ? 'hidden' : ''} ${activeTab === 'workshop' ? 'print:hidden' : ''}`}>
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-orange-dynex mb-2 print:text-4xl leading-none">DYNEX</h1>
            <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 print:text-[10px] print:text-zinc-600">Performance Umeå</p>
            <div className="flex gap-4 items-center mt-6">
              <p className="text-zinc-500 print:text-black font-mono text-xs uppercase tracking-widest font-bold">
                {activeTab === 'offert' ? 'Offert' : `Jobborder #${order.id.slice(0,8)}`}
              </p>
              {activeTab !== 'offert' && (
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                  currentStatus === 'Offert' ? 'bg-zinc-800 text-zinc-400 border-zinc-700 print:bg-zinc-100 print:text-zinc-600 print:border-zinc-300' :
                  currentStatus === 'Pågående' ? 'bg-orange-dynex/10 text-orange-dynex border-orange-dynex/20' :
                  currentStatus === 'Väntar Betalning' ? 'bg-blue-900/20 text-blue-400 border-blue-500/20 print:bg-blue-50 print:text-blue-600 print:border-blue-200' :
                  'bg-green-900/20 text-green-500 border-green-500/20 print:bg-green-50 print:text-green-600 print:border-green-200'
                }`}>
                  {currentStatus}
                </span>
              )}
            </div>
            <p className="text-zinc-400 print:text-black mt-4 print:mt-1 text-sm print:text-xs font-medium">Orderdatum: {new Date(order.created_at).toLocaleDateString('sv-SE')}</p>
          </div>
          <div className="text-left md:text-right print:text-right mt-6 md:mt-0 print:mt-0">
            <h2 className="text-xl print:text-base font-bold text-white print:text-black uppercase tracking-tight">Dynex Performance Umeå</h2>
            <p className="text-zinc-400 print:text-black text-sm print:text-xs">Konvaljvägen 8, 911 35 Vännäsby</p>
            <p className="text-zinc-400 print:text-black text-sm print:text-xs">info@dynexperformance.se</p>
            <p className="text-zinc-400 print:text-black text-sm print:text-xs">072-20 70 333</p>
            <p className="text-zinc-500 text-xs mt-2 font-bold uppercase tracking-widest print:text-black">Org.nr: 559378-2567</p>
          </div>
        </div>

        {activeTab === 'offert' && (
          <div className="animate-in fade-in duration-300 flex flex-col print:block print:w-full print:max-w-full">
            <div className="mb-6 flex justify-between items-center print:hidden">
              <h3 className="text-orange-dynex font-bold uppercase tracking-widest text-xs">
                Offert förhandsgranskning
              </h3>
              <div className="flex gap-4">
                {isEditingOffert ? (
                  <>
                    <button 
                      onClick={() => setIsEditingOffert(false)}
                      className="px-4 py-2 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
                    >
                      Avbryt
                    </button>
                    <button 
                      onClick={handleUpdateItems}
                      disabled={isSavingOffert}
                      className="px-4 py-2 text-[10px] font-bold bg-green-600 text-white rounded-lg uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-600/10"
                    >
                      {isSavingOffert ? 'Sparar...' : 'Spara ändringar'}
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => setIsEditingOffert(true)}
                    className="px-4 py-2 text-[10px] font-bold bg-zinc-800 text-zinc-300 rounded-lg uppercase tracking-widest hover:bg-orange-dynex hover:text-black transition-all"
                  >
                    Redigera innehåll
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-black/20 p-6 print:p-0 print:bg-transparent rounded-2xl border border-zinc-800/50 print:border-none mb-12 print:mb-8 flex flex-col md:flex-row print:flex-row gap-8 print:gap-4 justify-between">
              {/* Left side: Fordon */}
              <div className="flex-1 border-b md:border-b-0 print:border-b-0 md:border-r print:border-r border-zinc-800/50 print:border-zinc-300 pb-6 md:pb-0 print:pb-0 pr-0 md:pr-6 print:pr-6">
                <h3 className="text-orange-dynex font-bold uppercase tracking-widest text-[10px] mb-3">Fordon</h3>
                {isEditingOffert ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={carBrand} onChange={e => setCarBrand(e.target.value)} className="bg-black border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-orange-dynex" placeholder="Märke" />
                      <input value={carModel} onChange={e => setCarModel(e.target.value)} className="bg-black border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-orange-dynex" placeholder="Modell" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <input value={carYear} onChange={e => setCarYear(e.target.value)} className="bg-black border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-orange-dynex" placeholder="År" />
                      <input value={regNr} onChange={e => setRegNr(e.target.value)} className="bg-black border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-orange-dynex" placeholder="Reg.nr" />
                      <input value={mileage} onChange={e => setMileage(e.target.value)} className="bg-black border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-orange-dynex" placeholder="Mil" />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xl print:text-base font-bold print:text-black">{carBrand} {carModel} ({carYear})</p>
                    <p className="text-orange-dynex font-bold text-sm print:text-xs tracking-widest uppercase mb-1">{regNr}</p>
                    <p className="text-zinc-400 print:text-zinc-600 text-sm print:text-xs">Mätarställning: {mileage} mil</p>
                  </>
                )}
              </div>
              {/* Right side: Kund */}
              <div className="flex-1 text-left md:text-right print:text-right">
                <h3 className="text-orange-dynex font-bold uppercase tracking-widest text-[10px] mb-3">Kund</h3>
                {isEditingOffert ? (
                  <div className="space-y-3">
                    <input value={custName} onChange={e => setCustName(e.target.value)} className="w-full bg-black border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-orange-dynex text-left md:text-right" placeholder="Namn" />
                    <div className="grid grid-cols-2 gap-2">
                      <input value={custPhone} onChange={e => setCustPhone(e.target.value)} className="bg-black border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-orange-dynex text-left md:text-right" placeholder="Telefon" />
                      <input value={custEmail} onChange={e => setCustEmail(e.target.value)} className="bg-black border border-zinc-700 rounded p-1.5 text-xs text-white outline-none focus:border-orange-dynex text-left md:text-right" placeholder="E-post" />
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xl print:text-base font-bold print:text-black">{custName}</p>
                    <p className="text-zinc-400 print:text-zinc-600 text-sm print:text-xs">{custPhone}</p>
                    <p className="text-zinc-400 print:text-zinc-600 text-sm print:text-xs">{custEmail}</p>
                  </>
                )}
              </div>
            </div>

            {/* Offert-anteckning */}
            <div className="mb-6 print:mb-6">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest print:hidden mb-2">
                Offert-anteckning (syns bara på utskrift om ifylld)
              </label>
              <textarea
                value={quoteNotes}
                onChange={(e) => setQuoteNotes(e.target.value)}
                className="w-full bg-black/20 border border-zinc-800/50 rounded-xl p-3 text-sm text-zinc-200 focus:border-orange-dynex outline-none print:hidden"
                rows={2}
                placeholder="Skriv in en anteckning här så hamnar den under fordonsinformationen..."
              />
              
              {quoteNotes && (
                <div className="hidden print:block text-left mb-6 print:mb-6 border-l-4 border-orange-dynex pl-4">
                  <h4 className="text-[10px] font-bold text-black uppercase tracking-widest mb-1">Anteckning:</h4>
                  <p className="text-sm text-black whitespace-pre-wrap">{quoteNotes}</p>
                </div>
              )}
            </div>

            {isEditingOffert ? (
              <div className="space-y-8 animate-in fade-in">
                <div className="space-y-6">
                  {/* Moments (Labor) Section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Moment</h4>
                    <ul className="space-y-3">
                      {laborItems.map((item, idx) => (
                        <li key={idx} className="bg-black/30 p-4 rounded-xl border border-zinc-800/50 hover:border-orange-dynex/30 transition-all group/item">
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <input 
                                value={item.description}
                                onChange={e => updateItem('labor', idx, 'description', e.target.value)}
                                className="flex-1 bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                placeholder="Beskrivning"
                              />
                              <button 
                                onClick={() => removeItem('labor', idx)}
                                className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                                title="Ta bort rad"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Timmar</label>
                                <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={e => updateItem('labor', idx, 'quantity', e.target.value)}
                                  className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Pris (inkl. moms)</label>
                                <input 
                                  type="number"
                                  value={item.price}
                                  onChange={e => updateItem('labor', idx, 'price', e.target.value)}
                                  className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => addItem('labor')}
                      className="mt-4 w-full py-2 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:border-orange-dynex/50 hover:text-orange-dynex transition-all"
                    >
                      + Lägg till Arbetsmoment
                    </button>
                  </div>

                  {/* Parts Section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Reservdelar</h4>
                    <ul className="space-y-3">
                      {partsItems.map((item, idx) => (
                        <li key={idx} className="bg-black/30 p-4 rounded-xl border border-zinc-800/50 group/item">
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <input 
                                value={item.description}
                                onChange={e => updateItem('parts', idx, 'description', e.target.value)}
                                className="flex-1 bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                placeholder="Reservdel"
                              />
                              <button 
                                onClick={() => removeItem('parts', idx)}
                                className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                                title="Ta bort rad"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Antal</label>
                                <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={e => updateItem('parts', idx, 'quantity', e.target.value)}
                                  className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Pris/st (inkl. moms)</label>
                                <input 
                                  type="number"
                                  value={item.price}
                                  onChange={e => updateItem('parts', idx, 'price', e.target.value)}
                                  className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => addItem('parts')}
                      className="mt-4 w-full py-2 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:border-orange-dynex/50 hover:text-orange-dynex transition-all"
                    >
                      + Lägg till Reservdel
                    </button>
                  </div>

                  {/* Optimization Section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Optimering</h4>
                    <ul className="space-y-3">
                      {optimizationItems.map((item, idx) => (
                        <li key={idx} className="bg-orange-dynex/5 p-4 rounded-xl border border-orange-dynex/20 hover:border-orange-dynex transition-all group/item">
                          <div className="space-y-3">
                            <div className="flex gap-3">
                              <input 
                                value={item.description}
                                onChange={e => updateItem('optimization', idx, 'description', e.target.value)}
                                className="flex-1 bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                placeholder="Optimeringstyp"
                              />
                              <button 
                                onClick={() => removeItem('optimization', idx)}
                                className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                                title="Ta bort rad"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Antal</label>
                                <input 
                                  type="number"
                                  value={item.quantity}
                                  onChange={e => updateItem('optimization', idx, 'quantity', e.target.value)}
                                  className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Pris (inkl. moms)</label>
                                <input 
                                  type="number"
                                  value={item.price}
                                  onChange={e => updateItem('optimization', idx, 'price', e.target.value)}
                                  className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => addItem('optimization')}
                      className="mt-4 w-full py-2 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:border-orange-dynex/50 hover:text-orange-dynex transition-all"
                    >
                      + Lägg till Optimering
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              renderItemsTables("Preliminärt Offert Pris")
            )}
          </div>
        )}

        {activeTab === 'faktura' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex justify-between items-center print:hidden">
              <h3 className="text-orange-dynex font-bold uppercase tracking-widest text-xs">
                Faktura förhandsgranskning
              </h3>
              <div className="flex gap-2">
                <div className="relative">
                  <select
                    value={currentStatus}
                    onChange={async (e) => {
                      const newStatus = e.target.value;
                      if (window.confirm(`Ändra status till ${newStatus}?`)) {
                        setCurrentStatus(newStatus);
                        await import('../../actions').then(m => m.updateJobStatus(order.id, newStatus));
                        router.refresh();
                      }
                    }}
                    className={`appearance-none cursor-pointer pl-4 pr-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none transition-colors ${
                      currentStatus === 'Offert' ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700' :
                      currentStatus === 'Pågående' ? 'bg-orange-dynex/20 text-orange-dynex hover:bg-orange-dynex/30' :
                      currentStatus === 'Väntar Betalning' ? 'bg-blue-900/40 text-blue-400 hover:bg-blue-900/60' :
                      'bg-green-900/40 text-green-500 hover:bg-green-900/60'
                    }`}
                  >
                    <option value="Offert">Offert</option>
                    <option value="Pågående">Pågående</option>
                    <option value="Väntar Betalning">Väntar Betalning</option>
                    <option value="Klar">Klar</option>
                  </select>
                  <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${
                    currentStatus === 'Offert' ? 'text-zinc-400' :
                    currentStatus === 'Pågående' ? 'text-orange-dynex' :
                    currentStatus === 'Väntar Betalning' ? 'text-blue-400' :
                    'text-green-500'
                  }`}>
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>

                <div className="relative">
                  <select
                    value={reminderLevel}
                    onChange={(e) => setReminderLevel(Number(e.target.value) as 0 | 1 | 2)}
                    className={`appearance-none cursor-pointer pl-4 pr-8 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest outline-none transition-colors ${
                      reminderLevel > 0 ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    <option value={0}>Ingen påminnelse</option>
                    <option value={1}>Påminnelse 1</option>
                    <option value={2}>Påminnelse 2 (Inkasso)</option>
                  </select>
                  <div className={`pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 ${reminderLevel > 0 ? 'text-white' : 'text-zinc-400'}`}>
                    <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
                <button
                  onClick={handleSaveInvoice}
                  disabled={isSavingInvoice}
                  className="bg-orange-dynex text-black text-[10px] font-black px-6 py-2 rounded-lg hover:bg-orange-600 transition-all uppercase tracking-widest shadow-lg shadow-orange-dynex/20"
                >
                  {isSavingInvoice ? 'SPARAR...' : 'SPARA ÄNDRINGAR'}
                </button>
              </div>
            </div>

            {/* PREVIEW VIEW (The "A4 Paper"). print:w-auto & max-w-none completely releases fixed widths! */}
            <div className="w-full overflow-x-auto overflow-y-hidden pb-4 mb-4 print:overflow-visible print:pb-0 print:mb-0">
              <div className="bg-white text-black p-8 sm:p-12 md:p-14 rounded-sm shadow-2xl w-full max-w-full md:w-[210mm] mx-auto min-h-[297mm] flex flex-col font-sans relative print:shadow-none print:p-0 print:w-full print:max-w-none print:min-w-0 print:min-h-0 print:h-auto print:block">
              
              <div className="flex justify-between items-start mb-10 print:mb-8">
                <div>
                  <h1 className="text-5xl print:text-4xl font-black text-orange-dynex leading-none">DYNEX</h1>
                  <p className="text-sm print:text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 print:text-zinc-500">Performance Umeå</p>
                </div>
                <div className="text-right">
                  <h2 className="text-6xl print:text-4xl font-light uppercase tracking-tighter text-zinc-200 print:text-zinc-400">Faktura</h2>
                </div>
              </div>

              <div className="flex flex-col gap-8 print:gap-6 mb-10 print:mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 md:gap-12 print:gap-8">
                  <div className="flex flex-col h-full gap-4 print:gap-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 print:gap-y-1 text-xs content-start">
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600">Kundnr</span>
                      <span className="font-medium text-sm text-zinc-800 print:text-black">{order.customer_number || `100${order.id.slice(0,4)}`}</span>
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600">Fakturanr</span>
                      <input 
                        value={invoiceNumber} 
                        onChange={e => setInvoiceNumber(e.target.value)}
                        className="font-medium text-sm text-zinc-800 bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-orange-dynex outline-none w-full print:border-none print:p-0 print:text-black"
                        placeholder="Ange nr"
                      />
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600">Fakturadatum</span>
                      <input 
                        type="date"
                        value={invoiceDate} 
                        onChange={e => setInvoiceDate(e.target.value)}
                        className="font-medium text-sm text-zinc-800 bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-orange-dynex outline-none w-full print:border-none print:p-0 print:appearance-none print:text-black"
                      />
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600 border-b border-zinc-100 print:border-zinc-300 pb-1">Förfallodatum</span>
                      <input 
                        type="date"
                        value={dueDate} 
                        onChange={e => setDueDate(e.target.value)}
                        className="font-bold text-sm text-zinc-900 bg-transparent border-b border-zinc-100 print:border-zinc-300 hover:border-zinc-300 focus:border-orange-dynex outline-none w-full pb-1 print:border-none print:p-0 print:appearance-none print:text-black"
                      />
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600 mt-1">Vår referens</span>
                      <input 
                        value={ourReference} 
                        onChange={e => setOurReference(e.target.value)}
                        className="font-medium text-sm text-zinc-800 bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-orange-dynex outline-none w-full print:border-none print:p-0 print:text-black mt-1"
                      />
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600">Er referens</span>
                      <input 
                        value={yourReference} 
                        onChange={e => setYourReference(e.target.value)}
                        className="font-medium text-sm text-zinc-800 bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-orange-dynex outline-none w-full print:border-none print:p-0 print:text-black"
                      />

                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600">Villkor</span>
                      <input 
                        value={paymentTerms} 
                        onChange={e => setPaymentTerms(e.target.value)}
                        className="font-medium text-sm text-zinc-800 bg-transparent border-b border-transparent hover:border-zinc-200 focus:border-orange-dynex outline-none w-full print:border-none print:p-0 print:text-black"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 print:gap-2 h-full">
                    <div>
                      <p className="font-bold uppercase text-[10px] text-orange-dynex mb-3 print:mb-2 border-b border-zinc-100 print:border-zinc-300 pb-2 print:pb-1 tracking-widest">Fakturaadress</p>
                      <input
                        value={invCustomerName}
                        onChange={e => setInvCustomerName(e.target.value)}
                        className="text-2xl font-black leading-tight text-zinc-900 print:text-black w-full bg-transparent border-none outline-none hover:bg-zinc-50 focus:bg-zinc-50 p-1 print:p-0 -ml-1 print:ml-0 rounded print:rounded-none"
                      />
                      <div className="mt-1 space-y-0.5">
                        <input
                          value={invCustomerEmail}
                          onChange={e => setInvCustomerEmail(e.target.value)}
                          className="text-zinc-600 print:text-black text-xs font-medium w-full bg-transparent border-none outline-none hover:bg-zinc-50 focus:bg-zinc-50 p-1 print:p-0 -ml-1 print:ml-0 rounded print:rounded-none"
                        />
                        <input
                          value={invCustomerPhone}
                          onChange={e => setInvCustomerPhone(e.target.value)}
                          className="text-zinc-600 print:text-black text-sm font-medium w-full bg-transparent border-none outline-none hover:bg-zinc-50 focus:bg-zinc-50 p-1 print:p-0 -ml-1 print:ml-0 rounded print:rounded-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 md:gap-12 print:gap-8 items-stretch">
                  <div>
                    {reminderLevel > 0 && (
                      <div className="bg-red-50 p-4 print:p-3 border-[3px] print:border-2 border-red-500 shadow-[8px_8px_0_0_rgba(239,68,68,0.2)] print:shadow-none h-full w-full flex flex-col justify-between">
                        <div>
                          <p className="font-bold uppercase text-[10px] text-red-600 mb-2 print:mb-1 tracking-widest">
                            {reminderLevel === 1 ? 'Betalningspåminnelse' : 'Sista Betalningspåminnelsen'}
                          </p>
                          <p className="text-xs text-red-800 font-medium mb-3 print:mb-2">
                            {reminderLevel === 1 
                              ? 'Vi saknar betalning för denna faktura. Vänligen betala omgående för att undvika ytterligare kostnader.' 
                              : 'Om inte betalningen inkommit innan detta förfallodatum så kommer ärendet att överlämnas till inkasso, vilket medför ytterligare kostnader.'}
                          </p>
                        </div>
                        <div className="mt-auto flex items-center gap-2">
                          <span className="text-[10px] text-red-600 font-bold uppercase">Påminnelseavgift:</span>
                          <input 
                            type="number" 
                            value={reminderFee} 
                            onChange={e => setReminderFee(Number(e.target.value))}
                            className="w-16 bg-white border border-red-200 text-red-800 text-xs p-1 rounded outline-none print:border-none print:w-auto"
                          />
                          <span className="text-[10px] text-red-600">kr</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-[3px] border-black p-5 print:p-4 w-full max-w-sm print:max-w-none bg-zinc-50/50 print:bg-transparent shadow-[8px_8px_0_0_rgba(0,0,0,0.05)] print:shadow-none h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4 print:mb-2">
                        <span className="uppercase font-bold text-xs tracking-widest text-zinc-400 print:text-zinc-600">Att betala</span>
                        <div className="flex items-center justify-end text-4xl print:text-3xl font-black text-zinc-900 print:text-black text-right">
                          <input
                            value={displayTotal}
                            onChange={e => setInvTotalPrice(e.target.value)}
                            className="w-40 text-right bg-transparent border-none outline-none hover:bg-zinc-100 focus:bg-zinc-100 p-1 print:p-0 rounded"
                          />
                          <span className="ml-2">kr</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="uppercase text-zinc-400 print:text-zinc-600 font-bold text-[10px]">Förfallodatum</span>
                        <span className="font-bold text-zinc-800 print:text-black">{dueDate}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="uppercase text-zinc-400 print:text-zinc-600 font-bold text-[10px]">Referensnummer</span>
                        <span className="font-mono font-bold tracking-wider text-orange-dynex bg-orange-dynex/5 px-2 py-0.5 rounded">{invoiceNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-2 print:mb-6">
                <table className="w-full table-fixed text-sm print:text-xs mb-8 print:mb-0">
                  <colgroup>
                    <col className="w-[52%]" />
                    <col className="w-[14%]" />
                    <col className="w-[17%]" />
                    <col className="w-[17%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-y-2 border-black text-left uppercase text-[10px] font-black text-zinc-900 tracking-widest">
                      <th className="w-[52%] py-3 print:py-2 pl-2 text-left">Produkt / tjänst</th>
                      <th className="w-[14%] py-3 print:py-2 text-right">Antal</th>
                      <th className="w-[17%] py-3 print:py-2 text-right">À-pris</th>
                      <th className="w-[17%] py-3 print:py-2 text-right pr-2">Belopp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 print:divide-zinc-200">
                    {invoiceItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 transition-colors print:break-inside-avoid">
                        <td className="w-[52%] py-4 print:py-3 pl-2 font-bold text-zinc-800 print:text-black align-top">
                            <span className="italic text-zinc-500 print:text-zinc-600 text-xs mr-2 font-normal">({item.type})</span>
                            {item.desc}
                            {item.desc !== 'Påminnelseavgift' && (
                              <span className="text-zinc-400 print:text-zinc-500 font-normal text-xs ml-2 print:hidden">
                                (moms: {(item.price * 0.25).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr)
                              </span>
                            )}
                          </td>
                        <td className="py-4 print:py-3 text-right text-zinc-600 print:text-black font-medium">{item.qty} {item.unit}</td>
                        <td className="py-4 print:py-3 text-right text-zinc-600 print:text-black font-medium">{item.price.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 print:py-3 text-right font-black text-zinc-900 print:text-black pr-2">{item.total.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-2 print:mb-8 flex-col items-end gap-2 print:gap-1">
                <div className="w-full md:w-80 print:w-80 space-y-2 print:space-y-1 bg-zinc-50/80 print:bg-transparent p-5 print:p-0 rounded-2xl print:rounded-none border border-zinc-100 print:border-none">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400 print:text-zinc-600 uppercase text-[10px] font-black tracking-widest">Netto</span>
                    <span className="font-medium text-zinc-700 print:text-black">{netto.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400 print:text-zinc-600 uppercase text-[10px] font-black tracking-widest">Moms 25%</span>
                    <span className="font-medium text-zinc-700 print:text-black">{moms.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-zinc-200 print:border-black pb-2">
                    <span className="text-zinc-400 print:text-zinc-600 uppercase text-[10px] font-black tracking-widest">Öresutjämning</span>
                    <span className="font-medium text-zinc-700 print:text-black">0,00 kr</span>
                  </div>
                  <div className="flex justify-between text-3xl print:text-2xl font-black pt-2 text-orange-dynex">
                    <span className="uppercase text-[11px] self-center text-zinc-400 print:text-zinc-600 tracking-tighter">Summa totalt</span>
                    <span>{Number(displayTotal).toLocaleString('sv-SE')} kr</span>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-4 print:gap-2 border-t-2 border-black pt-5 print:pt-4 text-[10px] print:text-[8px] text-zinc-500 print:text-zinc-800 leading-tight uppercase font-medium">
                <div>
                  <p className="font-black mb-2 text-zinc-900 print:text-black tracking-widest text-xs print:text-[10px]">Adress</p>
                  <p>Dynex Performance Umeå</p>
                  <p>Konvaljvägen 8</p>
                  <p>911 35 Vännäsby</p>
                  <p className="mt-1 normal-case font-black text-orange-dynex text-sm print:text-xs tracking-tight">dynexperformance.se</p>
                </div>
                <div>
                  <p className="font-black mb-2 text-zinc-900 print:text-black tracking-widest text-xs print:text-[10px]">Kontakt</p>
                  <p className="mb-0.5">Telefon: <span className="text-zinc-800 print:text-black font-bold">072-20 70 333</span></p>
                  <p>E-post: <span className="text-zinc-800 print:text-black font-bold">info@dynexperformance.se</span></p>
                </div>
                <div>
                  <p className="font-black mb-2 text-zinc-900 print:text-black tracking-widest text-xs print:text-[10px]">Betalning</p>
                  <p className="mb-0.5">Bankgiro: <span className="text-zinc-800 print:text-black font-bold">5871-9600</span></p>
                  <p className="mb-0.5 normal-case">Mottagare: Måleri 1 by Leif Andersson AB</p>
                  <p className="mb-0.5 normal-case">Ange Referensnummer <span className="font-bold text-black">({invoiceNumber || order.id})</span> vid betalning</p>
                  <p className="mb-0.5 mt-2">Swish: <span className="text-zinc-800 print:text-black font-bold">123 423 08 27</span></p>
                  <p className="mb-0.5 normal-case">Mottagare: Dynex motoroptimering by Daniel</p>
                  <p className="mt-2">Org.nr: <span className="text-zinc-800 print:text-black font-bold">559378-2567</span></p>
                </div>
                <div className="relative">
                  <p className="font-black mb-2 text-zinc-900 print:text-black tracking-widest text-xs print:text-[10px]">Bank & Info</p>
                  <p className="mb-0.5">IBAN: <span className="text-zinc-800 print:text-black font-bold">43 60 00 00 00 00 00 17 78 00 28</span></p>
                  <div className="bg-zinc-50 print:bg-transparent p-2 print:p-0 border border-zinc-200 print:border-none rounded-lg print:rounded-none normal-case text-zinc-600 print:text-zinc-800 italic text-[9px] print:text-[8px] leading-snug print:leading-tight">
                    Dynex Performance Umeå är en verksamhetsgren inom Måleri 1 by Leif Andersson AB. 
                    Vid bankgirobetalning till Dynex visas därför Måleri 1 by Leif Andersson AB som mottagare.
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}

        {activeTab === 'kvitto' && (
          <div className="animate-in fade-in duration-300">
            <div className="mb-6 flex justify-between items-center print:hidden">
              <h3 className="text-orange-dynex font-bold uppercase tracking-widest text-xs">
                Kvitto förhandsgranskning
              </h3>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Betalsätt:</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as 'Swish' | 'Banköverföring')}
                    className="bg-zinc-800 text-zinc-200 text-xs px-3 py-1.5 rounded outline-none"
                  >
                    <option value="Swish">Swish</option>
                    <option value="Banköverföring">Banköverföring</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Betaldatum:</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="bg-zinc-800 text-zinc-200 text-xs px-3 py-1.5 rounded outline-none"
                  />
                </div>
              </div>
            </div>

            {/* PREVIEW VIEW KVITTO */}
            <div className="w-full overflow-x-auto overflow-y-hidden pb-4 mb-4 print:overflow-visible print:pb-0 print:mb-0">
              <div className="bg-white text-black p-8 sm:p-12 md:p-14 rounded-sm shadow-2xl w-full max-w-full md:w-[210mm] mx-auto min-h-[297mm] flex flex-col font-sans relative print:shadow-none print:p-0 print:w-full print:max-w-none print:min-w-0 print:min-h-0 print:h-auto print:block">
              
              <div className="flex justify-between items-start mb-10 print:mb-8">
                <div>
                  <h1 className="text-5xl print:text-4xl font-black text-orange-dynex leading-none">DYNEX</h1>
                  <p className="text-sm print:text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 print:text-zinc-500">Performance Umeå</p>
                </div>
                <div className="text-right">
                  <h2 className="text-6xl print:text-4xl font-light uppercase tracking-tighter text-zinc-200 print:text-zinc-400">Kvitto</h2>
                </div>
              </div>

              <div className="flex flex-col gap-8 print:gap-6 mb-10 print:mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 md:gap-12 print:gap-8">
                  <div className="flex flex-col h-full gap-4 print:gap-2">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 print:gap-y-1 text-xs content-start">
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600">Kundnr</span>
                      <span className="font-medium text-sm text-zinc-800 print:text-black">{order.customer_number || `100${order.id.slice(0,4)}`}</span>
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600">Fakturanr</span>
                      <span className="font-medium text-sm text-zinc-800 print:text-black">{invoiceNumber || 'Ej angivet'}</span>
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600">Kvitto utskrivet</span>
                      <span className="font-medium text-sm text-zinc-800 print:text-black">{new Date().toISOString().split('T')[0]}</span>
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600 border-b border-zinc-100 print:border-zinc-300 pb-1">Betalningsdatum</span>
                      <span className="font-bold text-sm text-zinc-900 border-b border-zinc-100 print:border-zinc-300 print:text-black pb-1">{paymentDate}</span>
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600 mt-1">Vår referens</span>
                      <span className="font-medium text-sm text-zinc-800 print:text-black mt-1">{ourReference || 'Dynex Performance'}</span>
                      
                      <span className="font-bold uppercase text-[10px] text-zinc-400 print:text-zinc-600">Er referens</span>
                      <span className="font-medium text-sm text-zinc-800 print:text-black">{yourReference || order.customer_name}</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 print:gap-2 h-full">
                    <div>
                      <p className="font-bold uppercase text-[10px] text-orange-dynex mb-3 print:mb-2 border-b border-zinc-100 print:border-zinc-300 pb-2 print:pb-1 tracking-widest">Kund</p>
                      <p className="text-2xl font-black leading-tight text-zinc-900 print:text-black">{invCustomerName || order.customer_name}</p>
                      <div className="mt-1 space-y-0.5">
                        <p className="text-zinc-600 print:text-black text-xs font-medium">{invCustomerEmail || order.customer_email}</p>
                        <p className="text-zinc-600 print:text-black text-sm font-medium">{invCustomerPhone || order.customer_phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 md:gap-12 print:gap-8 items-stretch">
                  <div>
                    {/* Empty block to keep grid alignment */}
                  </div>

                  <div className="border-[3px] print:border-2 border-green-600 p-5 print:p-4 w-full max-w-sm print:max-w-none bg-green-50 shadow-[8px_8px_0_0_rgba(22,163,74,0.1)] print:shadow-none h-full flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-4 print:mb-2">
                        <span className="uppercase font-black text-xs tracking-widest text-green-700">Betalt Belopp</span>
                        <div className="flex items-center justify-end text-4xl print:text-3xl font-black text-green-700 text-right">
                          <span>{Number(displayTotal).toLocaleString('sv-SE')}</span>
                          <span className="ml-2">kr</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center text-xs mb-2">
                        <span className="uppercase text-green-600 font-bold text-[10px]">Betalsätt</span>
                        <span className="font-bold text-green-800 bg-green-200/50 px-2 py-0.5 rounded uppercase tracking-wider">{paymentMethod}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="uppercase text-green-600 font-bold text-[10px]">Betalningsdatum</span>
                        <span className="font-bold tracking-wider text-green-800">{paymentDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-2 print:mb-6">
                <table className="w-full table-fixed text-sm print:text-xs mb-8 print:mb-0">
                  <colgroup>
                    <col className="w-[52%]" />
                    <col className="w-[14%]" />
                    <col className="w-[17%]" />
                    <col className="w-[17%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-y-2 border-black text-left uppercase text-[10px] font-black text-zinc-900 tracking-widest">
                      <th className="w-[52%] py-3 print:py-2 pl-2 text-left">Produkt / tjänst</th>
                      <th className="w-[14%] py-3 print:py-2 text-right">Antal</th>
                      <th className="w-[17%] py-3 print:py-2 text-right">À-pris</th>
                      <th className="w-[17%] py-3 print:py-2 text-right pr-2">Belopp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 print:divide-zinc-200">
                    {invoiceItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50/50 transition-colors print:break-inside-avoid">
                        <td className="w-[52%] py-4 print:py-3 pl-2 font-bold text-zinc-800 print:text-black align-top">
                            <span className="italic text-zinc-500 print:text-zinc-600 text-xs mr-2 font-normal">({item.type})</span>
                            {item.desc}
                            {item.desc !== 'Påminnelseavgift' && (
                              <span className="text-zinc-400 print:text-zinc-500 font-normal text-xs ml-2 print:hidden">
                                (moms: {(item.price * 0.25).toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr)
                              </span>
                            )}
                          </td>
                        <td className="py-4 print:py-3 text-right text-zinc-600 print:text-black font-medium">{item.qty} {item.unit}</td>
                        <td className="py-4 print:py-3 text-right text-zinc-600 print:text-black font-medium">{item.price.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}</td>
                        <td className="py-4 print:py-3 text-right font-black text-zinc-900 print:text-black pr-2">{item.total.toLocaleString('sv-SE', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-2 print:mb-8 flex-col items-end gap-2 print:gap-1">
                <div className="w-full md:w-80 print:w-80 space-y-2 print:space-y-1 bg-zinc-50/80 print:bg-transparent p-5 print:p-0 rounded-2xl print:rounded-none border border-zinc-100 print:border-none">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400 print:text-zinc-600 uppercase text-[10px] font-black tracking-widest">Netto</span>
                    <span className="font-medium text-zinc-700 print:text-black">{netto.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-400 print:text-zinc-600 uppercase text-[10px] font-black tracking-widest">Moms 25%</span>
                    <span className="font-medium text-zinc-700 print:text-black">{moms.toLocaleString('sv-SE', { minimumFractionDigits: 2 })} kr</span>
                  </div>
                  <div className="flex justify-between text-sm border-b border-zinc-200 print:border-black pb-2">
                    <span className="text-zinc-400 print:text-zinc-600 uppercase text-[10px] font-black tracking-widest">Öresutjämning</span>
                    <span className="font-medium text-zinc-700 print:text-black">0,00 kr</span>
                  </div>
                  <div className="flex justify-between text-3xl print:text-2xl font-black pt-2 text-green-600">
                    <span className="uppercase text-[11px] self-center text-zinc-400 print:text-zinc-600 tracking-tighter">Betalt totalt</span>
                    <span>{Number(displayTotal).toLocaleString('sv-SE')} kr</span>
                  </div>
                </div>
              </div>

              {/* FOOTER */}
              <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-4 print:gap-2 border-t-2 border-black pt-5 print:pt-4 text-[10px] print:text-[8px] text-zinc-500 print:text-zinc-800 leading-tight uppercase font-medium">
                <div>
                  <p className="font-black mb-2 text-zinc-900 print:text-black tracking-widest text-xs print:text-[10px]">Adress</p>
                  <p>Dynex Performance Umeå</p>
                  <p>Konvaljvägen 8</p>
                  <p>911 35 Vännäsby</p>
                  <p className="mt-1 normal-case font-black text-orange-dynex text-sm print:text-xs tracking-tight">dynexperformance.se</p>
                </div>
                <div>
                  <p className="font-black mb-2 text-zinc-900 print:text-black tracking-widest text-xs print:text-[10px]">Kontakt</p>
                  <p className="mb-0.5">Telefon: <span className="text-zinc-800 print:text-black font-bold">072-20 70 333</span></p>
                  <p>E-post: <span className="text-zinc-800 print:text-black font-bold">info@dynexperformance.se</span></p>
                </div>
                <div>
                  <p className="font-black mb-2 text-zinc-900 print:text-black tracking-widest text-xs print:text-[10px]">Betalning</p>
                  <p className="mb-0.5">Bankgiro: <span className="text-zinc-800 print:text-black font-bold">5871-9600</span></p>
                  <p className="mb-0.5 normal-case">Mottagare: Måleri 1 by Leif Andersson AB</p>
                  <p className="mb-0.5 normal-case">Ange Referensnummer <span className="font-bold text-black">({invoiceNumber || order.id})</span> vid betalning</p>
                  <p className="mb-0.5 mt-2">Swish: <span className="text-zinc-800 print:text-black font-bold">123 423 08 27</span></p>
                  <p className="mb-0.5 normal-case">Mottagare: Dynex motoroptimering by Daniel</p>
                  <p className="mt-2">Org.nr: <span className="text-zinc-800 print:text-black font-bold">559378-2567</span></p>
                </div>
                <div className="relative">
                  <p className="font-black mb-2 text-zinc-900 print:text-black tracking-widest text-xs print:text-[10px]">Bank & Info</p>
                  <p className="mb-0.5">IBAN: <span className="text-zinc-800 print:text-black font-bold">43 60 00 00 00 00 00 17 78 00 28</span></p>
                  <div className="bg-zinc-50 print:bg-transparent p-2 print:p-0 border border-zinc-200 print:border-none rounded-lg print:rounded-none normal-case text-zinc-600 print:text-zinc-800 italic text-[9px] print:text-[8px] leading-snug print:leading-tight">
                    Dynex Performance Umeå är en verksamhetsgren inom Måleri 1 by Leif Andersson AB.
                    Vid bankgirobetalning till Dynex visas därför Måleri 1 by Leif Andersson AB som mottagare.
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        )}

        {activeTab === 'workshop' && (
          <div className="animate-in slide-in-from-right-4 duration-300 print:hidden">
            <div className="flex flex-col md:flex-row justify-between items-start mb-6 border-b border-orange-dynex/20 pb-6 print:border-none print:mb-2 print:pb-2">
              <div>
                <h3 className="text-orange-dynex font-black uppercase tracking-tighter text-3xl mb-2">
                  Arbetsinstruktioner
                </h3>
                <div className="flex flex-wrap gap-x-6 gap-y-2 items-center">
                  <p className="text-xl font-bold text-zinc-300">{carBrand} {carModel} ({carYear})</p>
                  <p className="text-orange-dynex font-bold tracking-widest uppercase bg-orange-dynex/10 px-3 py-1 rounded border border-orange-dynex/20">{regNr}</p>
                  <p className="text-sm text-zinc-500 font-mono italic">{mileage} mil</p>
                </div>
              </div>
              <div className="flex flex-col items-start md:items-end gap-4 mt-6 md:mt-0 print:hidden">
              <select
                value={currentStatus}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  if (window.confirm(`Ändra status till ${newStatus}?`)) {
                    setCurrentStatus(newStatus);
                    await import('../../actions').then(m => m.updateJobStatus(order.id, newStatus));
                    router.refresh();
                  }
                }}
                className={`appearance-none cursor-pointer pl-3 pr-8 py-1.5 rounded-full text-[10px] font-bold uppercase border outline-none transition-colors ${
                  currentStatus === 'Offert' ? 'bg-zinc-800 text-zinc-400 border-zinc-700' :
                  currentStatus === 'Pågående' ? 'bg-orange-dynex/10 text-orange-dynex border-orange-dynex/30' :
                  currentStatus === 'Väntar Betalning' ? 'bg-blue-900/20 text-blue-400 border-blue-500/30' :
                  'bg-green-900/20 text-green-500 border-green-500/30'
                }`}
              >
                <option value="Offert">Offert</option>
                <option value="Pågående">Pågående</option>
                <option value="Väntar Betalning">Väntar Betalning</option>
                <option value="Klar">Klar</option>
              </select>

                <div className="flex gap-4">
                  {isEditingOffert ? (
                    <>
                      <button
                        onClick={() => setIsEditingOffert(false)}
                        className="px-4 py-2 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
                      >
                        Avbryt
                      </button>
                      <button
                        onClick={handleUpdateItems}
                        disabled={isSavingOffert}
                        className="px-4 py-2 text-[10px] font-bold bg-green-600 text-white rounded-lg uppercase tracking-widest hover:bg-green-700 transition-colors shadow-lg shadow-green-600/10"
                      >
                        {isSavingOffert ? 'Sparar...' : 'Spara ändringar'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setIsEditingOffert(true)}
                      className="px-4 py-2 text-[10px] font-bold bg-zinc-800 text-zinc-300 rounded-lg uppercase tracking-widest hover:bg-orange-dynex hover:text-black transition-all"
                    >
                      Redigera innehåll
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 print:hidden">
              <div className="space-y-8 print:space-y-2">
                <div className="space-y-6">
                  {/* Moments (Labor) Section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Moment</h4>
                    <ul className="space-y-3">
                      {laborItems.map((item, idx) => (
                        <li key={idx} className="bg-black/30 p-4 rounded-xl border border-zinc-800/50 hover:border-orange-dynex/30 transition-all group/item">
                          {isEditingOffert ? (
                            <div className="space-y-3">
                              <div className="flex gap-3">
                                <input 
                                  value={item.description}
                                  onChange={e => updateItem('labor', idx, 'description', e.target.value)}
                                  className="flex-1 bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                  placeholder="Beskrivning"
                                />
                                <button 
                                  onClick={() => removeItem('labor', idx)}
                                  className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                                  title="Ta bort rad"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Timmar</label>
                                  <input 
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => updateItem('labor', idx, 'quantity', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Pris (inkl. moms)</label>
                                  <input 
                                    type="number"
                                    value={item.price}
                                    onChange={e => updateItem('labor', idx, 'price', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="flex items-start gap-3 cursor-pointer"
                              onClick={() => {
                                setEditingNote({ type: 'labor', index: idx });
                                setTempNote(item.note || '');
                              }}
                            >
                              <div className="mt-1.5 w-2 h-2 rounded-full bg-orange-dynex shadow-[0_0_8px_rgba(255,102,0,0.5)] flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-lg text-zinc-100 font-medium group-hover/item:text-orange-dynex transition-colors">{item.description}</span>
                                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest opacity-0 group-hover/item:opacity-100 transition-opacity">Klicka för att {item.note ? 'ändra' : 'skriva'} anteckning</span>
                                </div>
                                {item.note && (
                                  <p className="text-sm text-orange-dynex/70 italic mt-1 font-medium">{item.note}</p>
                                )}
                              </div>
                            </div>
                          )}

                            {editingNote?.type === 'labor' && editingNote.index === idx && (
                              <div className="mt-4 pt-4 border-t border-zinc-800 animate-in fade-in slide-in-from-top-2 duration-200">
                                <textarea
                                  value={tempNote}
                                  onChange={(e) => setTempNote(e.target.value)}
                                  autoFocus
                                  className="w-full bg-black border border-zinc-700 rounded-lg p-4 text-zinc-200 text-sm focus:border-orange-dynex outline-none min-h-[100px] mb-3 shadow-inner"
                                  placeholder="Specifik anteckning för detta moment..."
                                />
                                <div className="flex justify-end gap-3">
                                  <button 
                                    onClick={() => setEditingNote(null)}
                                    className="px-4 py-2 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
                                  >
                                    Avbryt
                                  </button>
                                  <button 
                                    onClick={handleSaveNote}
                                    className="px-4 py-2 text-[10px] font-bold bg-orange-dynex text-black rounded-lg uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-orange-dynex/10"
                                  >
                                    Spara anteckning
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    {isEditingOffert && (
                      <button 
                        onClick={() => addItem('labor')}
                        className="mt-4 w-full py-2 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:border-orange-dynex/50 hover:text-orange-dynex transition-all"
                      >
                        + Lägg till Arbetsmoment
                      </button>
                    )}
                  </div>

                  {/* Parts Section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Reservdelar</h4>
                    <ul className="space-y-3">
                      {partsItems.map((item, idx) => (
                        <li key={idx} className="bg-black/30 p-4 rounded-xl border border-zinc-800/50 group/item">
                          {isEditingOffert ? (
                            <div className="space-y-3">
                              <div className="flex gap-3">
                                <input 
                                  value={item.description}
                                  onChange={e => updateItem('parts', idx, 'description', e.target.value)}
                                  className="flex-1 bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                  placeholder="Reservdel"
                                />
                                <button 
                                  onClick={() => removeItem('parts', idx)}
                                  className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                                  title="Ta bort rad"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Antal</label>
                                  <input 
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => updateItem('parts', idx, 'quantity', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Pris/st (inkl. moms)</label>
                                  <input 
                                    type="number"
                                    value={item.price}
                                    onChange={e => updateItem('parts', idx, 'price', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start gap-3">
                              <div className="mt-1.5 w-2 h-2 rounded-full bg-zinc-600 flex-shrink-0" />
                              <span className="text-lg text-zinc-200">{item.description} ({item.quantity}st)</span>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                    {isEditingOffert && (
                      <button 
                        onClick={() => addItem('parts')}
                        className="mt-4 w-full py-2 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:border-orange-dynex/50 hover:text-orange-dynex transition-all"
                      >
                        + Lägg till Reservdel
                      </button>
                    )}
                  </div>

                  {/* Optimization Section */}
                  <div>
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Optimering</h4>
                    <ul className="space-y-3">
                      {optimizationItems.map((item, idx) => (
                        <li key={idx} className="bg-orange-dynex/5 p-4 rounded-xl border border-orange-dynex/20 hover:border-orange-dynex transition-all group/item">
                          {isEditingOffert ? (
                            <div className="space-y-3">
                              <div className="flex gap-3">
                                <input 
                                  value={item.description}
                                  onChange={e => updateItem('optimization', idx, 'description', e.target.value)}
                                  className="flex-1 bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                  placeholder="Optimeringstyp"
                                />
                                <button 
                                  onClick={() => removeItem('optimization', idx)}
                                  className="text-zinc-600 hover:text-red-500 transition-colors p-2"
                                  title="Ta bort rad"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Antal</label>
                                  <input 
                                    type="number"
                                    value={item.quantity}
                                    onChange={e => updateItem('optimization', idx, 'quantity', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-zinc-500 uppercase font-bold block mb-1">Pris (inkl. moms)</label>
                                  <input 
                                    type="number"
                                    value={item.price}
                                    onChange={e => updateItem('optimization', idx, 'price', e.target.value)}
                                    className="w-full bg-black border border-zinc-700 rounded p-2 text-sm text-zinc-200 focus:border-orange-dynex outline-none"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="flex items-start gap-3 cursor-pointer"
                              onClick={() => {
                                setEditingNote({ type: 'optimization', index: idx });
                                setTempNote(item.note || '');
                              }}
                            >
                              <div className="mt-1.5 w-2 h-2 rounded-full bg-orange-dynex flex-shrink-0" />
                              <div className="flex-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-lg text-orange-dynex font-bold group-hover/item:text-orange-500 transition-colors">{item.description}</span>
                                  <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest opacity-0 group-hover/item:opacity-100 transition-opacity">Klicka för att {item.note ? 'ändra' : 'skriva'} anteckning</span>
                                </div>
                                {item.note && (
                                  <p className="text-sm text-zinc-400 italic mt-1">{item.note}</p>
                                )}
                              </div>
                            </div>
                          )}

                            {editingNote?.type === 'optimization' && editingNote.index === idx && (
                              <div className="mt-4 pt-4 border-t border-orange-dynex/10 animate-in fade-in slide-in-from-top-2 duration-200">
                                <textarea
                                  value={tempNote}
                                  onChange={(e) => setTempNote(e.target.value)}
                                  autoFocus
                                  className="w-full bg-black border border-zinc-700 rounded-lg p-4 text-zinc-200 text-sm focus:border-orange-dynex outline-none min-h-[100px] mb-3 shadow-inner"
                                  placeholder="Specifik anteckning för optimering..."
                                />
                                <div className="flex justify-end gap-3">
                                  <button 
                                    onClick={() => setEditingNote(null)}
                                    className="px-4 py-2 text-[10px] font-bold text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
                                  >
                                    Avbryt
                                  </button>
                                  <button 
                                    onClick={handleSaveNote}
                                    className="px-4 py-2 text-[10px] font-bold bg-orange-dynex text-black rounded-lg uppercase tracking-widest hover:bg-orange-600 transition-colors shadow-lg shadow-orange-dynex/10"
                                  >
                                    Spara anteckning
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                      {isEditingOffert && (
                        <button 
                          onClick={() => addItem('optimization')}
                          className="mt-4 w-full py-2 border-2 border-dashed border-zinc-800 rounded-xl text-zinc-500 text-[10px] font-bold uppercase tracking-widest hover:border-orange-dynex/50 hover:text-orange-dynex transition-all"
                        >
                          + Lägg till Optimering
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              <div className="space-y-6">
                <button 
                  onClick={() => setShowGeneralNotes(!showGeneralNotes)}
                  className="w-full p-6 bg-zinc-950 rounded-2xl border border-zinc-800 flex justify-between items-center hover:border-orange-dynex/50 transition-colors group"
                >
                  <div className="text-left">
                    <h4 className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1 group-hover:text-orange-dynex transition-colors">Allmänna arbetsanteckningar</h4>
                    <p className="text-sm text-zinc-400">Klicka för att {showGeneralNotes ? 'dölja' : 'visa/redigera'} anteckningar</p>
                  </div>
                  <span className={`text-orange-dynex transition-transform duration-300 ${showGeneralNotes ? 'rotate-180' : ''}`}>
                    ▼
                  </span>
                </button>

                {showGeneralNotes && (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-black/40 p-8 rounded-3xl border border-zinc-800 shadow-inner">
                      <DescriptionEditor 
                        id={order.id} 
                        initialDescription={jobDescription} 
                        canEdit={canEditDescription} 
                        onSave={setJobDescription}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
      
      {/* Hidden print Section ONLY for Workshop/Arbetsbeskrivning */}
      <div className={`hidden print:flex print:flex-col mt-0 print:mt-0 ${activeTab !== 'workshop' ? 'print:hidden' : ''}`}>
         <div className="flex-grow">
           
           <div className="mb-8 flex justify-between items-start border-b-2 border-black pb-4">
             <div>
               <h1 className="text-4xl font-black text-orange-dynex leading-none mb-1">DYNEX</h1>
               <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500 mb-6">Performance Umeå</p>
               <div className="flex items-center gap-3 mb-1">
                 <p className="text-sm uppercase tracking-widest text-black font-bold">Jobborder #{order.id.slice(0,8)}</p>
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  currentStatus === 'Offert' ? 'bg-zinc-50 text-zinc-600 border-zinc-300' :
                  currentStatus === 'Pågående' ? 'bg-orange-dynex/10 text-orange-dynex border-orange-dynex/20' :
                  currentStatus === 'Väntar Betalning' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                  'bg-green-50 text-green-600 border-green-200'
                }`}>
                   {currentStatus}
                 </span>
               </div>
               <p className="text-xs text-zinc-600 font-medium">Orderdatum: {new Date(order.created_at).toLocaleDateString('sv-SE')}</p>
             </div>
             <div className="text-right flex flex-col items-end">
               <h3 className="text-black font-black uppercase tracking-tighter text-2xl mb-4">
                 Arbetsinstruktioner
               </h3>
               <p className="text-lg font-bold text-black">{carBrand} {carModel} ({carYear})</p>
               <p className="font-bold tracking-widest uppercase border border-orange-dynex/30 bg-orange-dynex/10 px-2 py-0.5 rounded text-orange-dynex inline-block mt-1">{regNr}</p>
               <p className="text-sm text-zinc-600 font-mono italic mt-1">{mileage} mil</p>
             </div>
           </div>
           
           {laborItems.length > 0 && (
             <div className="mb-6">
               <h4 className="font-bold text-sm uppercase text-zinc-500 mb-2 border-b border-zinc-200 pb-1">Arbetsmoment</h4>
               <ul className="list-disc pl-6 space-y-3 mb-4">
                 {laborItems.map((item, idx) => (
                   <li key={`print-labor-${idx}`} className="text-black print:break-inside-avoid">
                     <span className="font-bold text-base">{item.description} ({item.quantity}h)</span>
                     {item.note && <p className="italic text-zinc-700 text-sm mt-1 whitespace-pre-wrap">↳ Anteckning: {item.note}</p>}
                   </li>
                 ))}
               </ul>
             </div>
           )}

           {partsItems.length > 0 && (
             <div className="mb-6">
               <h4 className="font-bold text-sm uppercase text-zinc-500 mb-2 border-b border-zinc-200 pb-1">Reservdelar</h4>
               <ul className="list-disc pl-6 space-y-2 mb-4">
                 {partsItems.map((item, idx) => (
                   <li key={`print-part-${idx}`} className="text-black print:break-inside-avoid">
                     <span className="font-bold text-base">{item.description}</span> <span className="text-sm text-zinc-600">({item.quantity} st)</span>
                   </li>
                 ))}
               </ul>
             </div>
           )}

           {optimizationItems.length > 0 && (
             <div className="mb-6">
               <h4 className="font-bold text-sm uppercase text-zinc-500 mb-2 border-b border-zinc-200 pb-1">Optimering</h4>
               <ul className="list-disc pl-6 space-y-3 mb-4">
                 {optimizationItems.map((item, idx) => (
                   <li key={`print-opt-${idx}`} className="text-black print:break-inside-avoid">
                     <span className="font-bold text-base">{item.description}</span>
                     {item.note && <p className="italic text-zinc-700 text-sm mt-1 whitespace-pre-wrap">↳ Anteckning: {item.note}</p>}
                   </li>
                 ))}
               </ul>
             </div>
           )}

           <div className="text-black whitespace-pre-wrap text-base leading-relaxed mt-8 print:mt-6 print:break-inside-avoid">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-200 pb-2">Allmänna arbetsanteckningar</p>
              {jobDescription || <span className="text-zinc-400 italic">Inga allmänna arbetsanteckningar sparade.</span>}
           </div>
         </div>
      </div>
    </div>
  );
}