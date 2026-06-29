import React from 'react';
import { StreamInfo } from '../types';
import { Headphones, Rocket, Globe, Tv, PlayCircle } from 'lucide-react';

interface StreamListProps {
  streams: StreamInfo[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

const iconMap: Record<string, React.ReactNode> = {
  Headphones: <Headphones className="w-5 h-5" />,
  Rocket: <Rocket className="w-5 h-5" />,
  Globe: <Globe className="w-5 h-5" />,
  Tv: <Tv className="w-5 h-5" />
};

export default function StreamList({ streams, activeId, onSelect }: StreamListProps) {
  return (
    <div className="bg-[#0F0F0F] rounded-2xl border border-white/10 p-5 sticky top-28">
      <h3 className="text-xs uppercase text-white/40 font-bold mb-4 tracking-widest px-2">
        القنوات المقترحة
      </h3>
      <div className="flex flex-col gap-2.5">
        {streams.map((stream) => {
          const isActive = stream.id === activeId;
          return (
            <button
              key={stream.id}
              onClick={() => onSelect(stream.id)}
              className={`w-full text-right flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                isActive 
                ? 'bg-white/5 border border-white/10 text-white shadow-sm' 
                : 'bg-transparent border border-transparent hover:bg-white/5 hover:border-white/10 text-white/80 hover:text-white'
              }`}
            >
              <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-red-600/20 text-red-500' : 'bg-white/10 text-white/60 group-hover:text-white group-hover:bg-white/20'}`}>
                {stream.icon && iconMap[stream.icon] ? iconMap[stream.icon] : <PlayCircle className="w-5 h-5" />}
              </div>
              <div className="flex flex-col">
                <span className={`font-semibold ${isActive ? 'text-white' : ''} text-sm`}>{stream.title}</span>
                <span className="text-xs text-white/40 mt-1">{stream.category}</span>
              </div>
              {isActive && (
                <div className="mr-auto">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
