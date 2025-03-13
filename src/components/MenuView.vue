<template>
  <VContainer>
    <VOverlay v-model="loading" class="align-center justify-center">
      <VProgressCircular indeterminate />
    </VOverlay>

    <template v-if="!loading">
      <VRow class="mb-4">
        <VCol cols="12" class="d-flex justify-end">
          <VBtn
            color="error"
            variant="outlined"
            prepend-icon="mdi-logout"
            @click="handleLogout"
          >
            Cerrar Sesión
          </VBtn>
        </VCol>
      </VRow>

      <VRow>
        <VCol v-if="isAdmin" cols="12" sm="12" md="4">
          <VCard
            class="mx-auto mb-4"
            color="surface-variant"
            max-width="100%"
            @click="goToUserManagement"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon class="me-2">mdi-account-group</VIcon>
              Administrar Usuarios
            </VCardTitle>
            <VCardSubtitle> Gestiona los usuarios del sistema </VCardSubtitle>
            <template v-slot:actions>
              <VBtn variant="text" @click="goToUserManagement">
                Ir a Gestión
              </VBtn>
            </template>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin" cols="12" sm="12" md="4">
          <VCard
            class="mx-auto mb-4"
            color="surface-variant"
            max-width="100%"
            @click="goToStatistics"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon class="me-2">mdi-account-group</VIcon>
              Gestión de Períodos de Reporte
            </VCardTitle>
            <VCardSubtitle> Organizar los datos ministeriales por períodos </VCardSubtitle>
            <template v-slot:actions>
              <VBtn variant="text" @click="goToStatistics">
                Gestión de Períodos
              </VBtn>
            </template>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin" cols="12" sm="12" md="4">
          <VCard
            class="mx-auto mb-4"
            color="surface-variant"
            max-width="100%"
            @click="goToDistrictManagement"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon class="me-2">mdi-office-building-marker</VIcon>
              Gestión de Distritos
            </VCardTitle>
            <VCardSubtitle>
              Administra los distritos del ministerio
            </VCardSubtitle>
            <template v-slot:actions>
              <VBtn variant="text" @click="goToDistrictManagement">
                Gestionar Distritos
              </VBtn>
            </template>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin" cols="12" sm="12" md="4">
          <VCard
            class="mx-auto mb-4"
            color="surface-variant"
            max-width="100%"
            @click="goToDistrictReports"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon class="me-2">mdi-chart-box</VIcon>
              Reportes por Distrito
            </VCardTitle>
            <VCardSubtitle>
              Ver historial de reportes por distrito y período
            </VCardSubtitle>
            <template v-slot:actions>
              <VBtn variant="text" @click="goToDistrictReports">
                Ver Reportes
              </VBtn>
            </template>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin" cols="12" sm="12" md="4">
          <VCard
            class="mx-auto mb-4"
            color="surface-variant"
            max-width="100%"
            @click="goToReportMatrix"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon class="me-2">mdi-table</VIcon>
              Matriz de Reportes
            </VCardTitle>
            <VCardSubtitle>
              Ver matriz de reportes por distrito y período
            </VCardSubtitle>
            <template v-slot:actions>
              <VBtn variant="text" @click="goToReportMatrix">
                Ver Matriz
              </VBtn>
            </template>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin" cols="12" sm="12" md="4">
          <VCard
            class="mx-auto mb-4"
            color="surface-variant"
            max-width="100%"
            @click="goToBirthdayList"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon class="me-2">mdi-cake-variant</VIcon>
              Lista de Cumpleaños
            </VCardTitle>
            <VCardSubtitle>Ver líderes por fecha de cumpleaños</VCardSubtitle>
            <template v-slot:actions>
              <VBtn variant="text" @click="goToBirthdayList">
                Ver Lista
              </VBtn>
            </template>
          </VCard>
        </VCol>

        <VCol v-if="isLeader" cols="12" sm="12" md="4">
          <VCard
            class="mx-auto mb-4"
            :style="{ 
              backgroundColor: personalDataComplete ? '#E8F5E9' : '#FFF3E0',
              transition: 'all 0.3s ease'
            }"
            :elevation="2"
            max-width="100%"
            @click="goToPersonalData"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon 
                class="me-2" 
                :color="personalDataComplete ? 'success-darken-2' : 'warning'"
              >
                mdi-account
              </VIcon>
              Datos Personales
            </VCardTitle>
            <VCardSubtitle :class="personalDataComplete ? 'text-success' : 'text-warning'">
              {{ personalDataComplete ? 'Información completa' : 'Actualiza tu información personal' }}
            </VCardSubtitle>
            <VCardActions>
              <VBtn 
                variant="tonal"
                :color="personalDataComplete ? 'success' : 'warning'"
                @click="goToPersonalData"
              >
                Ir a Datos
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>

        <VCol v-if="isLeader" cols="12" sm="12" md="4">
          <VCard
            class="mx-auto mb-4"
            :style="{ 
              backgroundColor: hasPendingReport ? '#FFF3E0' : (personalDataComplete ? '#E8F5E9' : '#FAFAFA'),
              opacity: personalDataComplete ? 1 : 0.7,
              transition: 'all 0.3s ease'
            }"
            :elevation="2"
            max-width="100%"
            :class="{ 'disabled-card': !personalDataComplete }"
            @click="goToMinisterialData"
          >
            <VCardTitle class="d-flex align-center">
              <VIcon 
                :color="hasPendingReport ? 'warning' : 'success'"
                class="mr-2"
              >
                {{ hasPendingReport ? 'mdi-alert' : 'mdi-chart-box' }}
              </VIcon>
              Datos Estadísticos
            </VCardTitle>
            <VCardSubtitle :class="personalDataComplete ? (hasPendingReport ? 'text-warning' : 'text-success-darken-1') : 'text-grey-darken-1'">
              {{ 
                !personalDataComplete 
                  ? 'Complete sus datos personales primero' 
                  : (hasPendingReport 
                      ? 'Tienes un período de reporte pendiente.'
                      : 'Gestiona tu información estadística del distrito')
              }}
            </VCardSubtitle>
            <VCardActions>
              <VBtn 
                variant="tonal"
                :color="personalDataComplete ? (hasPendingReport ? 'warning' : 'success') : 'grey'"
                :disabled="!personalDataComplete"
              >
                Ir a Estadísticas Distritales
              </VBtn>
            </VCardActions>
          </VCard>
        </VCol>
      </VRow>
    </template>
  </VContainer>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { doc, getDoc, getDocs, query, collection, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const authStore = useAuthStore();
const router = useRouter();
const personalDataComplete = ref(false);
const loading = ref(true);
const hasPendingReport = ref(false);

const isAdmin = computed(() => authStore.user?.role === "admin");
const isLeader = computed(() => authStore.user?.role === "lider");

// Función para cargar los datos una sola vez
const loadData = async () => {
  if (!authStore.user) return;
  
  try {
    // Verificar datos personales
    const userDoc = await getDoc(doc(db, 'users', authStore.user.id));
    
    // Verificar si el usuario tiene datos personales completos
    if (userDoc.exists() && userDoc.data()?.personalDataComplete === true) {
      personalDataComplete.value = true;
    } else {
      // Si no existe el documento de usuario o no tiene la bandera, verificar en la colección leaders
      const leaderDoc = await getDoc(doc(db, 'leaders', authStore.user.id));
      if (leaderDoc.exists()) {
        const leaderData = leaderDoc.data();
        // Verificar si todos los campos requeridos están completos
        personalDataComplete.value = Boolean(
          leaderData.personalData?.firstName &&
          leaderData.personalData?.lastName &&
          leaderData.personalData?.birthDate &&
          leaderData.personalData?.maritalStatus &&
          leaderData.personalData?.phoneNumber
        );
      } else {
        personalDataComplete.value = false;
      }
    }

    // Verificar reportes pendientes solo si es líder
    if (isLeader.value) {
      const reportsQuery = query(
        collection(db, 'reports'),
        where('userId', '==', authStore.user.id),
        where('status', '==', 'pending'),
        limit(1)
      );
      const reportsSnapshot = await getDocs(reportsQuery);
      hasPendingReport.value = !reportsSnapshot.empty;
    }
  } catch (error) {
    console.error('Error al cargar datos:', error);
  } finally {
    loading.value = false;
  }
};

// Cargar datos solo al montar el componente
onMounted(() => {
  loadData();
});

const goToUserManagement = () => {
  router.push("/manage-users");
};

const goToPersonalData = () => {
  router.push("/personal-data");
};

const goToMinisterialData = () => {
  if (!personalDataComplete.value) {
    alert('Por favor, complete sus datos personales antes de acceder a los datos estadísticos.');
    return;
  }
  router.push("/ministerial-data");
};

const goToStatistics = () => {
  router.push("/statistics/report-periods");
};

const goToDistrictManagement = () => {
  router.push("/manage-districts");
};

const goToDistrictReports = () => {
  router.push("/admin/district-reports");
};

const goToReportMatrix = () => {
  router.push("/admin/report-matrix");
};

const goToBirthdayList = () => {
  router.push("/birthday-list");
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
  }
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.disabled-card {
  opacity: 0.7;
  cursor: not-allowed;
}

.disabled-card:hover {
  transform: none !important;
  cursor: not-allowed;
}

.v-card {
  transition: all 0.3s ease;
}

.v-card:not(.disabled-card):hover {
  transform: translateY(-5px);
}
</style>
