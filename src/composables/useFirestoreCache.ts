import { ref } from "vue";

interface CacheItem {
    data: any;
    timestamp: number;
    expiry: number; // tiempo en milisegundos
}

const cache = ref<Map<string, CacheItem>>(new Map());

export function useFirestoreCache() {
    const getFromCache = (key: string) => {
        const item = cache.value.get(key);
        if (!item) return null;

        const now = Date.now();
        if (now - item.timestamp > item.expiry) {
            cache.value.delete(key);
            return null;
        }

        return item.data;
    };

    const setInCache = (key: string, data: any, expiry = 5 * 60 * 1000) => {
        cache.value.set(key, {
            data,
            timestamp: Date.now(),
            expiry,
        });
    };

    return {
        getFromCache,
        setInCache,
    };
}
