import React, { useEffect, useState } from 'react';
import { PlayCircle, Tv, Volume2, VolumeX, Play, Pause, ListVideo, Minimize2, Maximize2, X } from 'lucide-react';
import Player from '../components/Player';
import AdminModal from '../components/AdminModal';
import UserGuideModal from '../components/UserGuideModal';
import PlanModal from '../components/PlanModal';
import { getLocalChannels, saveLocalChannels } from '../utils/localDB';

export default function LandingPage() {
  const [channels, setChannels] = useState<any[]>([]);
  const [currentChannelId, setCurrentChannelId] = useState<string | null>(null);
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [startTime, setStartTime] = useState<string | null>(null);
  const [clickCount, setClickCount] = useState(0);
  const [titleClickCount, setTitleClickCount] = useState(0);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [showUI, setShowUI] = useState(true);
  const [volume, setVolume] = useState(80);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlanDropdown, setShowPlanDropdown] = useState(false);
  const [selectedPlanChannel, setSelectedPlanChannel] = useState<any | null>(null);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsExpanded(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    const checkUrlSecret = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const hasSecretParam = 
        searchParams.has('admin') || 
        searchParams.has('control') || 
        searchParams.has('secret') || 
        searchParams.has('schedule') || 
        searchParams.has('panel') || 
        searchParams.has('manage') ||
        searchParams.has('controlpanel') ||
        searchParams.has('جدولة') ||
        searchParams.has('تحكم') ||
        searchParams.has('سر');

      const hash = window.location.hash.toLowerCase();
      const hasSecretHash = 
        hash.includes('admin') || 
        hash.includes('control') || 
        hash.includes('secret') || 
        hash.includes('schedule') || 
        hash.includes('panel') || 
        hash.includes('manage') ||
        hash.includes('controlpanel') ||
        hash.includes('جدولة') ||
        hash.includes('تحكم') ||
        hash.includes('سر');

      if (hasSecretParam || hasSecretHash) {
        setIsAdminOpen(true);
      }
    };

    checkUrlSecret();

    window.addEventListener('hashchange', checkUrlSecret);
    return () => {
      window.removeEventListener('hashchange', checkUrlSecret);
    };
  }, []);

  const toggleFullscreen = () => {
    const elem = document.getElementById('broadcast-container');
    if (!elem) return;

    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch((err) => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
        setIsExpanded(true);
      });
    } else {
      document.exitFullscreen().catch(console.error);
    }
  };

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.json();
        if (data.channels) {
          setChannels(prev => {
            if (JSON.stringify(prev) !== JSON.stringify(data.channels)) {
              return data.channels;
            }
            return prev;
          });
          // Save a copy of backend channels locally to indexedDB so it stays synchronized
          await saveLocalChannels(data.channels);
          
          if (currentChannelId) {
            const activeChannel = data.channels.find((c: any) => c.id === currentChannelId);
            if (activeChannel && activeChannel.startTime) {
              setStartTime(activeChannel.startTime);
            }
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Backend offline, using local database:', e);
    }

    // Fallback to IndexedDB
    const localChans = await getLocalChannels();
    setChannels(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(localChans)) {
        return localChans;
      }
      return prev;
    });
    if (currentChannelId) {
      const activeChannel = localChans.find((c: any) => c.id === currentChannelId);
      if (activeChannel && activeChannel.startTime) {
        setStartTime(activeChannel.startTime);
      }
    }
  };

  const handleFooterClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCount = clickCount + 1;
    setClickCount(newCount);
    if (newCount >= 12) {
      setIsAdminOpen(true);
      setClickCount(0);
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGuideOpen(true);
  };

  const toggleUI = () => {
    setShowUI(prev => !prev);
  };

  useEffect(() => {
    fetchChannels();
    const interval = setInterval(() => {
      fetchChannels();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentChannelId]); // re-bind interval on channel change mapping

  const currentChannel = channels.find(c => c.id === currentChannelId) || channels[0];
  const videos = currentChannel ? currentChannel.videos : [];
  const startOffset = 0;

  return (
    <div dir="rtl" className="h-[100dvh] w-screen bg-black text-white font-sans overflow-hidden relative select-none">
      
      {!isVideoOpen ? (
         <div className="flex flex-col items-center justify-center w-full h-full relative z-20 pointer-events-auto bg-gradient-to-b from-neutral-900 to-black p-4">
          <div className="relative p-1 rounded-[2.5rem] bg-gradient-to-br from-teal-500 via-indigo-500 to-purple-600 animate-in fade-in zoom-in duration-700 shadow-[0_0_60px_rgba(20,184,166,0.3)] w-full max-w-lg">
            <div className="flex flex-col items-center bg-neutral-950/90 backdrop-blur-3xl py-12 px-8 rounded-[2.4rem] border border-white/10 h-full">
              
              {/* أزرار التشغيل والخطط التعليمية */}
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mb-10 z-30 relative justify-center">
                {/* زر اختيار القناة */}
                <div className="relative flex-1 w-full">
                  <button 
                    onClick={() => {
                      setShowPlanDropdown(false); // Close other dropdown
                      if (channels.length > 1) {
                        setShowChannelDropdown(prev => !prev);
                      } else {
                        setCurrentChannelId(channels[0]?.id || null);
                        setIsVideoOpen(true);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-400 hover:from-teal-400 hover:to-teal-300 text-white font-medium py-3.5 px-6 rounded-full shadow-lg shadow-teal-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg border border-teal-300/30 cursor-pointer select-none"
                  >
                    <PlayCircle className="w-6 h-6" />
                    {channels.length > 1 ? "اختر القناة" : "تشغيل البث"}
                  </button>
                  
                  {showChannelDropdown && channels.length > 1 && (
                    <div className="absolute top-[110%] left-0 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1.5 max-h-60 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 fade-in zoom-in-95">
                      {channels.map((chan) => (
                        <button
                          key={chan.id}
                          onClick={() => {
                            setCurrentChannelId(chan.id);
                            setIsVideoOpen(true);
                            setShowChannelDropdown(false);
                          }}
                          className="text-right w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium border border-white/5 flex items-center gap-2.5 cursor-pointer select-none active:bg-white/20 text-sm"
                        >
                          <Tv className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="truncate">{chan.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* زر الخطة */}
                <div className="relative flex-1 w-full">
                  <button 
                    onClick={() => {
                      setShowChannelDropdown(false); // Close other dropdown
                      if (channels.length > 1) {
                        setShowPlanDropdown(prev => !prev);
                      } else if (channels.length === 1) {
                        setSelectedPlanChannel(channels[0]);
                        setIsPlanModalOpen(true);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium py-3.5 px-6 rounded-full shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 text-lg border border-indigo-400/30 cursor-pointer select-none"
                  >
                    <ListVideo className="w-6 h-6 text-indigo-300" />
                    <span>الخطة</span>
                  </button>
                  
                  {showPlanDropdown && channels.length > 1 && (
                    <div className="absolute top-[110%] left-0 w-full bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1.5 max-h-60 overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 fade-in zoom-in-95">
                      {channels.map((chan) => (
                        <button
                          key={chan.id}
                          onClick={() => {
                            setSelectedPlanChannel(chan);
                            setIsPlanModalOpen(true);
                            setShowPlanDropdown(false);
                          }}
                          className="text-right w-full px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors font-medium border border-white/5 flex items-center gap-2.5 cursor-pointer select-none active:bg-white/20 text-sm"
                        >
                          <ListVideo className="w-4 h-4 text-teal-400 shrink-0" />
                          <span className="truncate">{chan.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* اللوغو واسم التطبيق متموقعين تحت زر الاختيار */}
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-teal-500/30 blur-2xl rounded-full scale-150"></div>
                <Tv className="w-24 h-24 text-teal-400 drop-shadow-2xl relative z-10" />
              </div>
              <h1 
                onClick={handleTitleClick}
                className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-wide text-center drop-shadow-lg leading-tight cursor-pointer select-none active:scale-98 transition-transform"
                title="اضغط لفتح دليل الاستخدام والتعريف"
              >
                قناة أولى ثانوى
              </h1>

            </div>
          </div>
          
          <div className="absolute bottom-8">
            <span 
              onClick={handleFooterClick}
              className="cursor-pointer select-none text-white/30 hover:text-white/60 transition-colors inline-block px-4 py-2 text-sm font-light tracking-wide"
            >
              جميع حقوق البث محفوظة © {new Date().getFullYear()} قناة أولى ثانوى
            </span>
          </div>
        </div>
      ) : (
        <div className={`fixed inset-0 z-50 bg-neutral-900/80 backdrop-blur-sm animate-in fade-in duration-500 flex items-center justify-center ${isExpanded ? 'p-0' : 'p-2 sm:p-4'}`}>
          <div 
            id="broadcast-container"
            style={!isExpanded ? { 
              aspectRatio: '16/9', 
              maxHeight: '85vh', 
              maxWidth: 'min(95vw, calc(85vh * 16 / 9))' 
            } : undefined} 
            className={`relative w-full bg-black border-white/10 shadow-2xl overflow-hidden pointer-events-auto flex items-center justify-center ${isExpanded ? 'h-full border-0 rounded-none' : 'border rounded-2xl'}`}
          >
            {/* Background/Video Layer */}
            <div className="absolute inset-0 z-0 bg-black pointer-events-auto flex items-center justify-center">
              {videos.length > 0 ? (
                <Player videos={videos} startOffset={startOffset} volume={volume} isPlaying={isPlaying} onVideoChange={setCurrentVideoId} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500">
                  <PlayCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p>لا يوجد بث متاح حالياً</p>
                </div>
              )}
            </div>

          {/* Screen touch detector to toggle UI. Pointer events transparent when UI is open so they can interact with the player controls */}
          <div 
            className={`absolute inset-0 z-10 ${showUI ? 'pointer-events-none' : 'pointer-events-auto'}`} 
            onClick={toggleUI}
          ></div>
          
          {/* Footer to access admin page (like the welcome screen) */}
          <div className={`absolute bottom-6 w-full flex justify-center z-20 transition-all duration-500 pointer-events-none ${showUI ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
            <span 
              onClick={handleFooterClick}
              className="pointer-events-auto cursor-pointer select-none text-white/30 hover:text-white/60 transition-colors inline-block px-4 py-2 text-xs sm:text-sm font-light tracking-wide bg-black/40 backdrop-blur-md rounded-full border border-white/10"
            >
              جميع حقوق البث محفوظة © {new Date().getFullYear()} قناة أولى ثانوى
            </span>
          </div>

          {/* Header */}
          <header className={`absolute top-0 left-0 w-full z-20 bg-black/60 backdrop-blur-md border-b border-white/10 transition-all duration-500 pointer-events-none ${showUI ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Tv className="w-8 h-8 text-teal-400" />
                <h1 
                  onClick={handleTitleClick}
                  className="text-xl font-bold text-teal-400 cursor-pointer select-none active:scale-98 transition-transform"
                  title="اضغط لفتح دليل الاستخدام والتعريف"
                >
                  قناة أولى ثانوى
                </h1>
              </div>

              {/* Controls */}
              <div className="flex items-center pointer-events-auto gap-3 relative">
                                {/* Volume Slider Group */}
                <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-800/50 backdrop-blur-md rounded-full px-2.5 py-1.5 sm:px-4 sm:py-2 border border-white/10 flex">
                  <button 
                    onClick={() => setVolume(volume === 0 ? 80 : 0)}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    {volume === 0 ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(parseInt(e.target.value))}
                    className="w-14 sm:w-24 h-1 appearance-none bg-neutral-700 rounded-full cursor-pointer outline-none hover:bg-neutral-600 transition-colors [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5 sm:[&::-webkit-slider-thumb]:w-3 sm:[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md"
                  />
                </div>

                {/* Schedule Button containing Schedule Dropdown */}
                <div className="relative group">
                  <button 
                    onClick={() => setIsScheduleOpen(!isScheduleOpen)} 
                    className={`flex items-center gap-2 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium transition-all border border-white/10 ${isScheduleOpen ? 'bg-indigo-500/80 hover:bg-indigo-500' : 'bg-neutral-800/80 hover:bg-neutral-800'}`}
                    title="الجدول"
                  >
                    <ListVideo className="w-5 h-5" />
                    <span className="hidden sm:inline">الجدول</span>
                  </button>

                  {isScheduleOpen && (
                    <div className="absolute top-full left-0 sm:right-0 sm:left-auto mt-2 w-64 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto origin-top-right animate-in fade-in zoom-in-95 z-50">
                      <div className="p-3 border-b border-white/10 bg-neutral-900/50">
                        <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                          <ListVideo className="w-4 h-4 text-indigo-400" />
                          الفيديوهات التالية
                        </h3>
                      </div>
                      <div className="max-h-80 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
                        {videos.slice(videos.findIndex(v => v.id === currentVideoId) + 1).length > 0 ? (
                          videos.slice(videos.findIndex(v => v.id === currentVideoId) + 1).map((vid, idx) => (
                            <div key={vid.uid || idx} className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-xs flex flex-col gap-1 border border-white/5">
                              <span className="text-white/90 font-medium line-clamp-2 leading-relaxed" title={vid.title}>{vid.title || "بث مبرمج"}</span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-white/50">لا يوجد فيديوهات تالية في الجدول</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Play/Pause Button */}
                <button 
                  onClick={() => setIsPlaying(!isPlaying)} 
                  className={`flex items-center gap-2 backdrop-blur-md text-white px-4 py-2 rounded-full font-medium transition-all shadow-lg border border-white/10 ${isPlaying ? 'bg-teal-500/80 hover:bg-teal-500' : 'bg-green-500/80 hover:bg-green-500'}`}
                  title={isPlaying ? "إيقاف مؤقت" : "تشغيل"}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  <span className="hidden sm:inline">{isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}</span>
                </button>

                {/* Expand/Shrink Button */}
                <button 
                  onClick={toggleFullscreen}
                  className="w-10 h-10 rounded-full bg-neutral-800/80 border border-white/10 hover:bg-neutral-600/80 flex items-center justify-center text-white transition-colors ml-2"
                  title={isExpanded ? "تصغير النافذة" : "تكبير النافذة"}
                >
                    {isExpanded ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                </button>

                {/* Close Broadcast Button */}
                <button 
                  onClick={() => {
                    setIsVideoOpen(false);
                    setIsExpanded(false);
                    if (document.fullscreenElement) {
                      document.exitFullscreen().catch(console.error);
                    }
                  }}
                  className="w-10 h-10 rounded-full bg-neutral-800/80 border border-white/10 hover:bg-teal-500/80 flex items-center justify-center text-white transition-colors"
                  title="إغلاق البث"
                >
                    <X className="w-5 h-5" />
                </button>

              </div>
            </div>
          </header>
          </div>
        </div>
      )}

      <AdminModal 
        isOpen={isAdminOpen} 
        onClose={() => setIsAdminOpen(false)} 
        onRefreshVideos={fetchChannels}
      />

      <UserGuideModal 
        isOpen={isGuideOpen} 
        onClose={() => setIsGuideOpen(false)} 
      />

      <PlanModal 
        isOpen={isPlanModalOpen}
        onClose={() => setIsPlanModalOpen(false)}
        channel={selectedPlanChannel ? (channels.find(c => c.id === selectedPlanChannel.id) || selectedPlanChannel) : null}
      />
    </div>
  );
}
