/**
 * Composable para gestionar el distrito del usuario actual
 *
 * Este composable encapsula la lógica común de obtener el distrito
 * asignado a un líder basándose en su userId.
 */

import { ref } from 'vue';
import { collection, query, where, getDocs, getDoc, doc, limit } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuthStore } from '@/stores/auth';
import { COLLECTIONS } from '@/constants';

export interface DistrictLeader {
  userId: string;
  districtId: string;
  isActive: boolean;
  assignedAt?: any;
}

export interface District {
  id: string;
  location: string;
  name?: string;
  isActive?: boolean;
}

export interface UserDistrictResult {
  districtLeader: DistrictLeader | null;
  district: District | null;
}

export function useUserDistrict() {
  const authStore = useAuthStore();
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Obtiene el distrito activo del usuario actual
   *
   * @returns DistrictLeader o null si no se encuentra
   */
  const getActiveDistrictLeader = async (): Promise<DistrictLeader | null> => {
    if (!authStore.user?.id) {
      console.warn('No hay usuario autenticado');
      return null;
    }

    loading.value = true;
    error.value = null;

    try {
      const districtLeadersRef = collection(db, COLLECTIONS.DISTRICT_LEADERS);
      const q = query(
        districtLeadersRef,
        where('userId', '==', authStore.user.id),
        where('isActive', '==', true),
        limit(1)
      );

      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const data = snapshot.docs[0].data();
      return {
        userId: data.userId,
        districtId: data.districtId,
        isActive: data.isActive,
        assignedAt: data.assignedAt
      };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener distrito del líder';
      console.error('Error en getActiveDistrictLeader:', err);
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Obtiene el distrito activo del usuario con información completa del distrito
   *
   * @returns Objeto con districtLeader y district, o null si no se encuentra
   */
  const getActiveDistrict = async (): Promise<UserDistrictResult> => {
    const districtLeader = await getActiveDistrictLeader();

    if (!districtLeader) {
      return { districtLeader: null, district: null };
    }

    try {
      const districtDoc = await getDoc(
        doc(db, COLLECTIONS.DISTRICTS, districtLeader.districtId)
      );

      if (!districtDoc.exists()) {
        return { districtLeader, district: null };
      }

      const districtData = districtDoc.data();
      const district: District = {
        id: districtDoc.id,
        location: districtData.location || '',
        name: districtData.name,
        isActive: districtData.isActive
      };

      return { districtLeader, district };
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error al obtener información del distrito';
      console.error('Error en getActiveDistrict:', err);
      return { districtLeader, district: null };
    }
  };

  /**
   * Obtiene solo el ID del distrito activo del usuario
   * Método de conveniencia para casos donde solo necesitas el ID
   *
   * @returns districtId string o null
   */
  const getActiveDistrictId = async (): Promise<string | null> => {
    const districtLeader = await getActiveDistrictLeader();
    return districtLeader?.districtId || null;
  };

  return {
    loading,
    error,
    getActiveDistrictLeader,
    getActiveDistrict,
    getActiveDistrictId
  };
}
