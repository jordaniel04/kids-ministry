import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { collection, query, where, getDocs, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import type { Church } from '../types/Church';
import { useAuthStore } from './auth';
import { COLLECTIONS, CACHE_TTL } from '@/constants';

export const useDistrictStore = defineStore('district', () => {
    const authStore = useAuthStore();
    const districtId = ref<string>('');
    const districtName = ref<string>('');
    const churches = ref<Church[]>([]);
    const lastUpdate = ref<Date | null>(null);
    const isLoading = ref(false);

    const isCacheValid = computed(() => {
        if (!lastUpdate.value) return false;
        return Date.now() - lastUpdate.value.getTime() < CACHE_TTL;
    });

    const loadDistrictData = async (forceRefresh = false) => {
        // Si el caché es válido y no se fuerza la actualización, retornar
        if (isCacheValid.value && !forceRefresh) return;

        isLoading.value = true;
        try {
            // 1. Obtener el distrito del líder
            const districtLeadersRef = collection(db, COLLECTIONS.DISTRICT_LEADERS);
            const q = query(
                districtLeadersRef,
                where("userId", "==", authStore.user?.id),
                where("isActive", "==", true),
                limit(1)
            );
            const districtLeaderSnapshot = await getDocs(q);

            if (!districtLeaderSnapshot.empty) {
                const districtLeader = districtLeaderSnapshot.docs[0].data();
                districtId.value = districtLeader.districtId;

                // 2. Obtener nombre del distrito
                const districtDoc = await getDoc(doc(db, COLLECTIONS.DISTRICTS, districtId.value));
                if (districtDoc.exists()) {
                    districtName.value = districtDoc.data().location;
                }

                // 3. Cargar iglesias del distrito
                const churchesQuery = query(
                    collection(db, COLLECTIONS.CHURCHES),
                    where("districtId", "==", districtId.value),
                    where("isActive", "==", true)
                );
                const churchesSnapshot = await getDocs(churchesQuery);
                
                churches.value = churchesSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data,
                        ministerialData: data.ministerialData?.sort((a: any, b: any) => 
                            b.updatedAt.seconds - a.updatedAt.seconds
                        )
                    } as Church;
                });

                lastUpdate.value = new Date();
            }
        } catch (error) {
            console.error('Error al cargar datos del distrito:', error);
        } finally {
            isLoading.value = false;
        }
    };

    const getLatestMinisterialData = () => {
        return churches.value.map(church => ({
            ...church,
            ministerialData: church.ministerialData?.[0] || null
        }));
    };

    return {
        districtId,
        districtName,
        churches,
        isLoading,
        loadDistrictData,
        getLatestMinisterialData,
        isCacheValid
    };
}); 