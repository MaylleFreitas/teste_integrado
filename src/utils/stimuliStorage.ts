import { AudioPairTrial, MapAudioTrial } from '../types';

const DB_NAME = 'AuditoryExperimentDB';
const DB_VERSION = 1;
const STORE_NAME = 'stimuli';
const STIMULI_KEY = 'current_stimuli';
const LOCALSTORAGE_KEY = 'auditory_experiment_stimuli';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB não suportado neste navegador'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

export async function saveStimuliToStorage(
  audioPairs: AudioPairTrial[],
  mapTrials: MapAudioTrial[]
): Promise<void> {
  // 1. Try IndexedDB first (handles large base64 audio Data URLs easily)
  try {
    const db = await openDB();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put({
        id: STIMULI_KEY,
        audioPairs,
        mapTrials,
        updatedAt: new Date().toISOString(),
      });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Erro ao salvar estímulos no IndexedDB, tentando localStorage:', err);
  }

  // 2. Also try localStorage for quick fallback
  try {
    localStorage.setItem(
      LOCALSTORAGE_KEY,
      JSON.stringify({ audioPairs, mapTrials, updatedAt: new Date().toISOString() })
    );
  } catch (err) {
    // localStorage may quota exceed if base64 audio files are very large, which is fine since IndexedDB handles it
    console.warn('Quota excedida no localStorage (áudios salvos com sucesso no IndexedDB).', err);
  }
}

export async function loadStimuliFromStorage(): Promise<{
  audioPairs: AudioPairTrial[];
  mapTrials: MapAudioTrial[];
} | null> {
  // 1. Try IndexedDB
  try {
    const db = await openDB();
    const data = await new Promise<any>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(STIMULI_KEY);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });

    if (data && Array.isArray(data.audioPairs) && Array.isArray(data.mapTrials)) {
      return {
        audioPairs: data.audioPairs,
        mapTrials: data.mapTrials,
      };
    }
  } catch (err) {
    console.warn('IndexedDB leitura falhou, tentando localStorage:', err);
  }

  // 2. Fallback to localStorage
  try {
    const saved = localStorage.getItem(LOCALSTORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.audioPairs) && Array.isArray(parsed.mapTrials)) {
        return {
          audioPairs: parsed.audioPairs,
          mapTrials: parsed.mapTrials,
        };
      }
    }
  } catch (err) {
    console.warn('localStorage leitura falhou:', err);
  }

  return null;
}

export async function clearStimuliFromStorage(): Promise<void> {
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
  } catch {}

  try {
    const db = await openDB();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(STIMULI_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
    });
  } catch {}
}
