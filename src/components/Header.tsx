import React from 'react';
import { Play, Tv } from 'lucide-react';

interface HeaderProps {
  inputValue: string;
  setInputValue: (v: string) => void;
  onSubmit: (v: string) => void;
}

export default function Header({ inputValue, setInputValue, onSubmit }: HeaderProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) onSubmit(inputValue);
  };

  return (
    <header className="border-b border-white/10 bg-[#0F0F0F]/95 pt-4 pb-4 px-6 sticky top-0 z-10 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-red-600/10 p-2.5 rounded-xl text-red-600">
            <Tv className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">مشغل يوتيوب <span className="text-red-600">المباشر</span></h1>
        </div>
        <form onSubmit={handleSubmit} className="flex w-full sm:w-auto mt-2 sm:mt-0 gap-2">
          <input
            type="text"
            dir="auto"
            placeholder="أدخل رابط يوتيوب أو Video ID..."
            className="flex-1 sm:w-[22rem] px-6 py-2.5 rounded-full bg-[#1F1F1F] border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-red-600/50 focus:ring-1 focus:ring-red-600/50 transition-all font-sans text-sm"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <button 
            type="submit" 
            className="bg-red-600 hover:bg-red-500 text-white px-6 py-2.5 rounded-full flex items-center gap-2 transition-colors font-medium shadow-lg shadow-red-900/20 text-sm"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>تشغيل</span>
          </button>
        </form>
      </div>
    </header>
  );
}
