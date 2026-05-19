'use client';

export default function PrintButton() {
  return (
    <button onClick={() => window.print()} className="bg-orange-dynex hover:bg-orange-600 text-black font-bold py-2 px-6 rounded-md">
      Skriv ut
    </button>
  );
}