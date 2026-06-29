import React, { useEffect, useState } from 'react';
import { extractVideoId } from '../utils';
import { Lock, Trash2, Plus, LogOut, X, Eye, EyeOff, Tv, ChevronDown, Check } from 'lucide-react';
import { 
  getStoredPassword, 
  saveStoredPassword, 
  clearStoredPassword, 
  verifyPasswordLocally, 
  getLocalChannels, 
  saveLocalChannels 
} from '../utils/localDB';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshVideos: () => void;
}

export default function AdminModal({ isOpen, onClose, onRefreshVideos }: AdminModalProps) {
  const [links, setLinks] = useState<string[]>(['']);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [channels, setChannels] = useState<any[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const [newChannelName, setNewChannelName] = useState('');
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);
  const [deletingChannelId, setDeletingChannelId] = useState<string | null>(null);
  const [deletingVideoUid, setDeletingVideoUid] = useState<string | null>(null);

  const fetchChannels = async () => {
    try {
      const res = await fetch('/api/channels');
      if (res.ok) {
        const data = await res.json();
        if (data.channels) {
          setChannels(data.channels);
          await saveLocalChannels(data.channels);
          if (!selectedChannelId && data.channels.length > 0) {
            setSelectedChannelId(data.channels[0].id);
          }
          return;
        }
      }
    } catch (e) {
      console.warn('Backend offline, using local database in Admin:', e);
    }

    const localChans = await getLocalChannels();
    setChannels(localChans);
    if (!selectedChannelId && localChans.length > 0) {
      setSelectedChannelId(localChans[0].id);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (isAuthenticated) {
        fetchChannels();
      }
    }
  }, [isOpen, isAuthenticated]);

  useEffect(() => {
    const attemptAutoLogin = async () => {
      if (isOpen && !isAuthenticated) {
        const storedPass = await getStoredPassword();
        if (storedPass && verifyPasswordLocally(storedPass)) {
          setPassword(storedPass);
          setIsAuthenticated(true);
        } else if (storedPass) {
          await clearStoredPassword();
        }
      }
    };
    
    attemptAutoLogin();
  }, [isOpen, isAuthenticated]);

  if (!isOpen) return null;

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
    
    // Auto-add new empty field if the last one was filled
    if (index === newLinks.length - 1 && value.trim() !== '') {
      setLinks([...newLinks, '']);
    }
  };

  const handleAddVideos = async (e: React.FormEvent | React.MouseEvent, reset: boolean = true) => {
    if (e) e.preventDefault();
    if (!selectedChannelId) return;
    
    const validIds = links
      .map(url => extractVideoId(url))
      .filter((id): id is string => id !== null);

    if (validIds.length === 0) {
      return; // Do nothing if no valid IDs
    }

    // Prepare updated local state
    const updatedChannels = channels.map(chan => {
      if (chan.id === selectedChannelId) {
        const newVids = validIds.map((id, idx) => ({
          id,
          title: `فيديو مضاف جديد #${chan.videos.length + idx + 1}`,
          category: 'دروس تعليمية',
          uid: 'vid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9)
        }));
        return {
          ...chan,
          videos: reset ? newVids : [...chan.videos, ...newVids]
        };
      }
      return chan;
    });

    // Save to IndexedDB and state immediately
    await saveLocalChannels(updatedChannels);
    setChannels(updatedChannels);
    setLinks(['']);
    onRefreshVideos();

    // Try synchronizing with backend
    try {
      await fetch(`/api/channels/${selectedChannelId}/videos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, ids: validIds, reset }),
      });
    } catch (e) {
      console.warn('Backend sync for adding videos failed:', e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isLocalValid = verifyPasswordLocally(password);
    if (isLocalValid) {
      setIsAuthenticated(true);
      await saveStoredPassword(password);
      
      // Try backend verification
      try {
        await fetch('/api/videos/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password }),
        });
      } catch (e) {
        console.warn('Backend password verification offline:', e);
      }
    } else {
      setPassword('');
    }
  };

  const handleDeleteVideo = async (uid: string) => {
    if (!selectedChannelId) return;

    // Update local state copy
    const updatedChannels = channels.map(chan => {
      if (chan.id === selectedChannelId) {
        return {
          ...chan,
          videos: chan.videos.filter((v: any) => v.uid !== uid)
        };
      }
      return chan;
    });

    // Save locally
    await saveLocalChannels(updatedChannels);
    setChannels(updatedChannels);
    onRefreshVideos();

    // Try backend sync
    try {
      await fetch(`/api/channels/${selectedChannelId}/videos/${uid}?password=${encodeURIComponent(password)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
    } catch (e) {
      console.warn('Backend sync for deleting video failed:', e);
    }
  };

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;

    const newChanId = 'chan-' + Date.now();
    const newChan = {
      id: newChanId,
      name: newChannelName.trim(),
      videos: [],
      startTime: new Date().toISOString()
    };

    const updatedChannels = [...channels, newChan];

    // Save locally
    await saveLocalChannels(updatedChannels);
    setChannels(updatedChannels);
    setSelectedChannelId(newChanId);
    setNewChannelName('');
    onRefreshVideos();

    // Auto focus the input
    setTimeout(() => {
      const nextInput = document.getElementById('link-input-0');
      if (nextInput) {
        nextInput.focus();
        nextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    // Try backend sync
    try {
      await fetch('/api/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, name: newChannelName.trim() }),
      });
    } catch (e) {
      console.warn('Backend sync for creating channel failed:', e);
    }
  };

  const handleDeleteChannel = async (id: string) => {
    const updatedChannels = channels.filter(c => c.id !== id);

    // Save locally
    await saveLocalChannels(updatedChannels);
    setChannels(updatedChannels);
    if (selectedChannelId === id) {
      setSelectedChannelId(updatedChannels[0]?.id || null);
    }
    onRefreshVideos();

    // Try backend sync
    try {
      await fetch(`/api/channels/${id}?password=${encodeURIComponent(password)}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
    } catch (e) {
      console.warn('Backend sync for deleting channel failed:', e);
    }
  };

  const currentChannelVideos = channels.find(c => c.id === selectedChannelId)?.videos || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" dir="rtl">
      <div className="bg-neutral-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-neutral-400 hover:text-neutral-800 hover:bg-neutral-200 rounded-full transition-colors z-20 bg-white shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {!isAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-8 bg-white/50">
            <form 
              onSubmit={handleLogin}
              className="bg-white p-8 rounded-2xl shadow-lg border border-neutral-100 max-w-sm w-full"
            >
              <div className="flex justify-center mb-6">
                <div className="bg-indigo-100 p-4 rounded-full">
                  <Lock className="w-8 h-8 text-indigo-600" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-center mb-6 text-neutral-800">تسجيل دخول الإدارة</h1>
              <div className="relative mb-4 ring-1 ring-neutral-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 bg-neutral-50 flex items-center justify-between">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="غير مسموح لغير الأمن"
                  className="w-full bg-transparent text-neutral-800 px-4 py-3 focus:outline-none transition-all text-center placeholder-center flex-1"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors">
                دخول
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white shadow-sm border-b border-neutral-100 p-4 flex items-center justify-between z-10 shrink-0">
              <h1 className="text-xl font-bold text-indigo-600 px-4">لوحة التحكم</h1>
              <button 
                onClick={async () => { 
                  setIsAuthenticated(false); 
                  setPassword(''); 
                  await clearStoredPassword();
                }}
                className="flex items-center gap-2 text-neutral-500 hover:text-red-600 transition-colors pl-12"
              >
                <LogOut className="w-5 h-5" />
                <span>خروج</span>
              </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
              <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Channel Management Panel */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Tv className="w-5 h-5 text-indigo-600" />
                    إدارة القنوات
                  </h2>
                  <div className="flex flex-col gap-4">
                    <div className="relative w-full z-20">
                      {/* Custom Dropdown Button */}
                      <button
                        type="button"
                        onClick={() => setIsAdminDropdownOpen(prev => !prev)}
                        className="w-full bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right text-neutral-900 flex items-center justify-between cursor-pointer"
                      >
                        <span className="font-medium text-sm">
                          {channels.find(c => c.id === selectedChannelId)?.name || 'اختر القناة'}
                        </span>
                        <ChevronDown className="w-5 h-5 text-neutral-400" />
                      </button>

                      {/* Dropdown Options List with individual delete button */}
                      {isAdminDropdownOpen && (
                        <div className="absolute top-[105%] right-0 w-full bg-white border border-neutral-200 rounded-lg shadow-xl p-1.5 z-50 flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200">
                          {channels.length === 0 ? (
                            <div className="px-4 py-3 text-sm text-neutral-500 text-center">لا توجد قنوات</div>
                          ) : (
                            channels.map((chan) => (
                              <div
                                key={chan.id}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                                  selectedChannelId === chan.id ? 'bg-indigo-50/50' : 'hover:bg-neutral-50'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedChannelId(chan.id);
                                    setIsAdminDropdownOpen(false);
                                  }}
                                  className="flex-1 text-right text-sm font-medium text-neutral-700 hover:text-neutral-900 cursor-pointer py-1 truncate ml-2"
                                >
                                  {chan.name}
                                </button>
                                
                                {channels.length > 1 && (
                                  deletingChannelId === chan.id ? (
                                    <div className="flex items-center gap-1 shrink-0 animate-in fade-in zoom-in-95 duration-150">
                                      <span className="text-[10px] text-red-500 font-bold ml-1">تأكيد؟</span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteChannel(chan.id);
                                          setDeletingChannelId(null);
                                        }}
                                        className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer"
                                        title="نعم، احذف"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setDeletingChannelId(null);
                                        }}
                                        className="p-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded transition-colors cursor-pointer"
                                        title="إلغاء"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeletingChannelId(chan.id);
                                      }}
                                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer mr-2 shrink-0"
                                      title="حذف القناة"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  )
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    <form onSubmit={handleCreateChannel} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="إسم القناة الجديدة"
                        className="flex-1 bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all text-right text-neutral-900"
                        value={newChannelName}
                        onChange={(e) => setNewChannelName(e.target.value)}
                      />
                      <button 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                      >
                        إنشاء قناة
                      </button>
                    </form>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100 mb-8">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                     قائمة روابط البث الحالية
                  </h2>
                  {currentChannelVideos.length === 0 ? (
                    <p className="text-neutral-500 text-sm text-center py-4 bg-neutral-50 rounded-lg">لا يوجد روابط</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {currentChannelVideos.map((vid: any, i: number) => (
                        <div key={vid.uid || vid.id || i} className="flex items-center justify-between bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                          <div className="flex items-center gap-4 overflow-hidden">
                            <span className="w-8 h-8 flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold rounded-full shrink-0">
                              {i + 1}
                            </span>
                            <div className="truncate text-left" dir="ltr">
                              <p className="font-mono text-sm text-neutral-800 truncate" title={vid.title}>{vid.title || `https://youtu.be/${vid.id}`}</p>
                              <p className="text-xs text-neutral-500">{new Date(vid.createdAt).toLocaleString('ar-EG')}</p>
                            </div>
                          </div>
                          {deletingVideoUid === (vid.uid || vid.id) ? (
                            <div className="flex items-center gap-1.5 shrink-0 bg-red-50 border border-red-100 p-1.5 rounded-lg animate-in fade-in zoom-in-95 duration-150">
                              <span className="text-xs text-red-600 font-bold px-1">حذف؟</span>
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteVideo(vid.uid || vid.id);
                                  setDeletingVideoUid(null);
                                }}
                                className="p-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer"
                                title="تأكيد الحذف"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingVideoUid(null)}
                                className="p-1 bg-neutral-200 hover:bg-neutral-300 text-neutral-700 rounded transition-colors cursor-pointer"
                                title="إلغاء"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingVideoUid(vid.uid || vid.id)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                              title="حذف"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-sm border border-neutral-100">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <Plus className="w-5 h-5 text-indigo-600" />
                    تعيين قائمة البث
                  </h2>
                  <form onSubmit={(e) => handleAddVideos(e, true)} className="flex flex-col gap-4">
                    {links.map((link, index) => (
                      <input
                        key={index}
                        id={`link-input-${index}`}
                        className="bg-neutral-50 border border-neutral-200 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-left text-neutral-900"
                        dir="ltr"
                        placeholder={`https://youtube.com/watch?v=... (${index + 1} فيديو)`}
                        value={link}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                        onPaste={() => {
                          setTimeout(() => {
                            const nextInput = document.getElementById(`link-input-${index + 1}`);
                            if (nextInput) {
                              nextInput.focus();
                              nextInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }, 50);
                        }}
                        required={index === 0 && links.length === 1}
                      />
                    ))}
                      <div className="flex flex-col md:flex-row gap-2 mt-4">
                        <button 
                          type="button"
                          onClick={(e) => handleAddVideos(e, false)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors font-medium w-full text-center"
                        >
                           إضافة للقائمة
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleAddVideos(e, true)}
                          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors font-medium w-full text-center"
                        >
                           بدء قائمة جديدة
                        </button>
                      </div>
                  </form>
                  <p className="mt-4 text-sm text-neutral-500 text-center">
                    يمكنك إضافة روابط لطابور البث الحالي، أو استبدال القائمة بالكامل لتبدأ الآن.
                  </p>
                </div>
              </div>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
