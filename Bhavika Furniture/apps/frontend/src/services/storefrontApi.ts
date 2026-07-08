import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/store';
const CACHE_TTL = 10_000;

type CacheEntry = {
  expiresAt: number;
  promise: Promise<any>;
};

const requestCache = new Map<string, CacheEntry>();

function cachedGet(url: string) {
  const now = Date.now();
  const cached = requestCache.get(url);

  if (cached && cached.expiresAt > now) return cached.promise;

  const promise = axios
    .get(url)
    .then(response => response.data.data)
    .catch(error => {
      requestCache.delete(url);
      throw error;
    });

  requestCache.set(url, { expiresAt: now + CACHE_TTL, promise });
  return promise;
}

export function getStoreCatalog() {
  return cachedGet(`${API_BASE}/catalog`);
}

export function getStoreContent(entity: string) {
  return cachedGet(`${API_BASE}/content/${entity}`);
}

export function invalidateStorefrontCache() {
  requestCache.clear();
}
