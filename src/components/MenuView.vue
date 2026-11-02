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
        <VCol v-if="isAdmin" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            max-width="100%"
            width="100%"
            @click="goToUserManagement"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar color="primary" variant="tonal" size="56">
                  <VIcon icon="mdi-account-group" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Administrar Usuarios</VCardTitle>
                  <VCardSubtitle class="px-0">Gestiona los usuarios del sistema</VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            max-width="100%"
            width="100%"
            @click="goToStatistics"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar color="primary" variant="tonal" size="56">
                  <VIcon icon="mdi-calendar-range" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Gestión de Períodos de Reporte</VCardTitle>
                  <VCardSubtitle class="px-0">Organizar los datos ministeriales por períodos</VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            max-width="100%"
            width="100%"
            @click="goToDistrictManagement"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar color="primary" variant="tonal" size="56">
                  <VIcon icon="mdi-office-building-marker" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Gestión de Distritos</VCardTitle>
                  <VCardSubtitle class="px-0">Administra los distritos del ministerio</VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin || isSecretary" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            max-width="100%"
            width="100%"
            @click="goToDistrictReports"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar color="primary" variant="tonal" size="56">
                  <VIcon icon="mdi-chart-box" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Reportes por Distrito</VCardTitle>
                  <VCardSubtitle class="px-0">Ver historial de reportes por distrito y período</VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin || isSecretary" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            max-width="100%"
            width="100%"
            @click="goToReportMatrix"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar color="primary" variant="tonal" size="56">
                  <VIcon icon="mdi-table" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Matriz de Reportes</VCardTitle>
                  <VCardSubtitle class="px-0">Ver matriz de reportes por distrito y período</VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin || isSecretary" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            max-width="100%"
            width="100%"
            @click="goToBirthdayList"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar color="primary" variant="tonal" size="56">
                  <VIcon icon="mdi-cake-variant" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Lista de Cumpleaños</VCardTitle>
                  <VCardSubtitle class="px-0">Ver líderes por fecha de cumpleaños</VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin || isSecretary" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            max-width="100%"
            width="100%"
            @click="goToLeadersList"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar color="primary" variant="tonal" size="56">
                  <VIcon icon="mdi-account-supervisor" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Directorio de Líderes</VCardTitle>
                  <VCardSubtitle class="px-0">Ver información completa de todos los líderes</VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin || isSecretary" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            max-width="100%"
            width="100%"
            @click="goToTrainingModules"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar color="primary" variant="tonal" size="56">
                  <VIcon icon="mdi-book-education" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Módulos de Formación</VCardTitle>
                  <VCardSubtitle class="px-0">Gestiona la ruta de formación y sus módulos</VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isAdmin || isSecretary" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            max-width="100%"
            width="100%"
            @click="goToTrainingEnrollments"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar color="primary" variant="tonal" size="56">
                  <VIcon icon="mdi-certificate" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Inscripciones y Certificados</VCardTitle>
                  <VCardSubtitle class="px-0">Registra notas, estadísticas y genera certificados</VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isLeader" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            :style="{ opacity: personalDataComplete ? 1 : 0.7, transition: 'all 0.3s ease' }"
            :class="{ 'disabled-card': !personalDataComplete }"
            max-width="100%"
            width="100%"
            @click="goToPersonalData"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar :color="personalDataComplete ? 'success' : 'warning'" variant="tonal" size="56">
                  <VIcon :icon="personalDataComplete ? 'mdi-account-check' : 'mdi-account'" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Datos del Líder</VCardTitle>
                  <VCardSubtitle class="px-0" :class="personalDataComplete ? 'text-success' : 'text-warning'">
                    {{ personalDataComplete ? 'Información completa' : 'Actualiza tu información personal' }}
                  </VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isLeader" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            :style="{ opacity: personalDataComplete ? 1 : 0.7, transition: 'all 0.3s ease' }"
            :class="{ 'disabled-card': !personalDataComplete }"
            max-width="100%"
            width="100%"
            @click="goToMinisterialData"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar :color="hasPendingReport ? 'warning' : 'success'" variant="tonal" size="56">
                  <VIcon :icon="hasPendingReport ? 'mdi-alert' : 'mdi-chart-box'" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Datos Estadísticos</VCardTitle>
                  <VCardSubtitle class="px-0" :class="personalDataComplete ? (hasPendingReport ? 'text-warning' : 'text-success') : 'text-medium-emphasis'">
                    {{
                      !personalDataComplete
                        ? 'Complete sus datos personales primero'
                        : (hasPendingReport
                            ? 'Tienes un período de reporte pendiente.'
                            : 'Gestiona tu información estadística del distrito')
                    }}
                  </VCardSubtitle>
                </div>
              </div>
            </VCardText>
          </VCard>
        </VCol>

        <VCol v-if="isLeader" cols="12" sm="12" md="4" class="d-flex">
          <VCard
            class="mx-auto mb-4 pa-2 leader-card h-100"
            :style="{ opacity: personalDataComplete ? 1 : 0.7, transition: 'all 0.3s ease' }"
            :class="{ 'disabled-card': !personalDataComplete }"
            max-width="100%"
            width="100%"
            @click="goToTrainingProgress"
          >
            <VCardText class="d-flex align-center h-100">
              <div class="d-flex align-center ga-4">
                <VAvatar :color="personalDataComplete ? 'primary' : 'grey-lighten-2'" variant="tonal" size="56">
                  <VIcon icon="mdi-school" :color="personalDataComplete ? 'primary' : 'grey'" size="28" />
                </VAvatar>
                <div class="flex-grow-1" style="min-width: 0;">
                  <VCardTitle class="px-0 pt-0 pb-1">Ruta de Formación</VCardTitle>
                  <VCardSubtitle class="px-0" :class="personalDataComplete ? '' : 'text-grey-darken-1'">
                    {{ personalDataComplete ? 'Ver módulos, notas y certificados de tu distrito' : 'Complete sus datos personales primero' }}
                  </VCardSubtitle>
                </div>
              </div>
            </VCardText>
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
const isSecretary = computed(() => authStore.user?.role === "secretaria");

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

const goToLeadersList = () => {
  router.push("/leaders-list");
};

const goToTrainingModules = () => {
  router.push("/admin/training-modules");
};

const goToTrainingEnrollments = () => {
  router.push("/admin/training-enrollments");
};

const goToTrainingProgress = () => {
  if (!personalDataComplete.value) return;
  router.push("/training-progress");
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
  cursor: pointer;
}

.leader-card :deep(.v-card-title),
.leader-card :deep(.v-card-subtitle) {
  white-space: normal;
}

.v-card:not(.disabled-card):hover {
  transform: translateY(-5px);
}
</style>
