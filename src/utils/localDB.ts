const DB_NAME = 'AdminAuthDB';
const STORE_NAME = 'secrets';
const PASSWORD_KEY = 'admin_password';

// Additional store for Channels & Videos
const CHANNELS_STORE_NAME = 'channels';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2); // upgrade version to 2 for channels store
    request.onupgradeneeded = (event: any) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
      if (!db.objectStoreNames.contains(CHANNELS_STORE_NAME)) {
        db.createObjectStore(CHANNELS_STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getStoredPassword(): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(PASSWORD_KEY);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB Error (getPassword):', err);
    return null;
  }
}

export async function saveStoredPassword(password: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(password, PASSWORD_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB Error (savePassword):', err);
  }
}

export async function clearStoredPassword(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(PASSWORD_KEY);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB Error (clearPassword):', err);
  }
}

// Client-side authentication check (no backend required!)
export function verifyPasswordLocally(password: string): boolean {
  return password === '#nagiz' || password === 'admin123';
}

// Initial fallback channels when indexedDB is empty
const INITIAL_CHANNELS = [
  {
    id: 'main',
    name: 'القناة الرئيسية',
    videos: [
      { id: 'b3O3XMEkE0M', title: 'الجزيرة مباشر', category: 'أخبار وتغطيات', uid: 'initial-1' },
      { id: 'q76bMs-NwRk', title: 'بث مكة المكرمة المباشر', category: 'قنوات دينية', uid: 'initial-2' },
      { id: '9Auq9mYxFEE', title: 'سكاي نيوز عربية', category: 'أخبار وتغطيات', uid: 'initial-3' },
      { id: 'jfKfPfyJRdk', title: 'موسيقى لوفي هادئة (Lofi Girl)', category: 'موسيقى واسترخاء', uid: 'initial-4' }
    ],
    startTime: new Date().toISOString()
  }
];

export async function getLocalChannels(): Promise<any[]> {
  try {
    const db = await openDB();
    const channels = await new Promise<any[]>((resolve, reject) => {
      const transaction = db.transaction(CHANNELS_STORE_NAME, 'readonly');
      const store = transaction.objectStore(CHANNELS_STORE_NAME);
      const request = store.get('channels_data');
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });

    if (!channels || channels.length === 0) {
      // Save and return initial set
      await saveLocalChannels(INITIAL_CHANNELS);
      return INITIAL_CHANNELS;
    }
    return channels;
  } catch (err) {
    console.error('IndexedDB Error (getLocalChannels):', err);
    return INITIAL_CHANNELS;
  }
}

export async function saveLocalChannels(channels: any[]): Promise<void> {
  try {
    const db = await openDB();
    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(CHANNELS_STORE_NAME, 'readwrite');
      const store = transaction.objectStore(CHANNELS_STORE_NAME);
      const request = store.put(channels, 'channels_data');
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error('IndexedDB Error (saveLocalChannels):', err);
  }
}
