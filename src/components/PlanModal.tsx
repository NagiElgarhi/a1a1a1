import React from 'react';
import { X, ListVideo, ExternalLink, Tv, Link2 } from 'lucide-react';

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: any | null;
}

export default function PlanModal({ isOpen, onClose, channel }: PlanModalProps) {
  if (!isOpen || !channel) return null;

  const videos = channel.videos || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300" dir="rtl">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-300 text-right text-neutral-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-800 bg-neutral-950/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 p-2.5 rounded-xl border border-indigo-500/20">
              <ListVideo className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">خطة وجدولة: {channel.name}</h2>
              <p className="text-xs text-neutral-400 mt-1">عرض ومتابعة الروابط والدروس المجدولة</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Section */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          {videos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="bg-neutral-800/50 p-4 rounded-full mb-4 border border-neutral-700/50">
                <Link2 className="w-10 h-10 text-neutral-500" />
              </div>
              <h3 className="text-lg font-semibold text-white">لا توجد خطة مجدولة</h3>
              <p className="text-sm text-neutral-400 max-w-xs mt-1">لا توجد روابط أو دروس مضافة في هذه القناة حتى الآن.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {videos.map((vid: any, index: number) => (
                <div 
                  key={vid.uid || vid.id || index}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-neutral-950/40 border border-neutral-800 hover:border-neutral-700/50 transition-all duration-200 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <span className="w-8 h-8 flex items-center justify-center bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold rounded-xl shrink-0 text-sm">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h4 className="text-sm font-semibold text-white line-clamp-2 leading-relaxed" title={vid.title}>
                        {vid.title || "بث مبرمج"}
                      </h4>
                      {vid.createdAt && (
                        <p className="text-[11px] text-neutral-500">
                          تاريخ الإضافة: {new Date(vid.createdAt).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      )}
                    </div>
                  </div>

                  <a
                    href={`https://www.youtube.com/watch?v=${vid.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-neutral-950 font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/10 transition-all hover:scale-[1.03] active:scale-95 shrink-0 self-end sm:self-center cursor-pointer select-none border border-teal-300/20"
                  >
                    <span>عرض الفيديو</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/40 text-center text-xs text-neutral-500 flex items-center justify-between px-6 shrink-0">
          <span className="flex items-center gap-1 text-neutral-400">
            <Tv className="w-4 h-4 text-indigo-400" />
            جدول قنوات أولى ثانوي التعليمية
          </span>
          <button 
            onClick={onClose}
            className="px-5 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl transition-all cursor-pointer text-xs font-semibold border border-neutral-700"
          >
            إغلاق الجدول
          </button>
        </div>
      </div>
    </div>
  );
}
