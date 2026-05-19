import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <main className="flex flex-col items-center justify-center bg-zinc-900/30 p-12 rounded-xl border border-zinc-800 backdrop-blur-sm w-full max-w-4xl">
        <h1 className="text-6xl font-bold text-orange-dynex mb-8 text-center">
          Välkommen
        </h1>
      <p className="text-2xl mb-12 text-center text-zinc-400 max-w-2xl">
        Hantera dina bilreparationer, offerter och kundorder på ett smidigt sätt.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Link href="/ny-offert" className="group border border-zinc-800 p-8 rounded-xl hover:border-orange-dynex hover:bg-orange-dynex/5 transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4 text-orange-dynex">Skapa Ny Offert</h2>
          <p className="text-zinc-400 group-hover:text-zinc-300">Skapa en professionell offert med specificerade rader för arbete och delar.</p>
        </Link>
        
        <Link href="/jobbordrar" className="group border border-zinc-800 p-8 rounded-xl hover:border-orange-dynex hover:bg-orange-dynex/5 transition-all duration-300">
          <h2 className="text-2xl font-bold mb-4 text-orange-dynex">Visa Jobbordrar</h2>
          <p className="text-zinc-400 group-hover:text-zinc-300">Se status på alla pågående jobb och hantera din orderlogg.</p>
        </Link>
      </div>
      </main>
    </div>
  );
}