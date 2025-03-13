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
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { doc, getDoc, getDocs, query, collection, where, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

const authStore = useAuthStore();
const router = useRouter();
const personalDataComplete = ref(false);
const loading = ref(true);
const hasPendingReport = ref(false);

// Variable para controlar si el componente está montado
const isMounted = ref(true);
// Variable para controlar si ya se han cargado los datos
const dataLoaded = ref(false);

const isAdmin = computed(() => authStore.user?.role === "admin");
const isLeader = computed(() => authStore.user?.role === "lider");

const cardColor = computed(() => {
  return personalDataComplete.value ? 'success-lighten-1' : 'grey-lighten-1';
});

onMounted(async () => {
  isMounted.value = true;
  
  // Evitar cargar datos si ya se han cargado previamente
  if (dataLoaded.value) {
    loading.value = false;
    return;
  }
  
  try {
    if (isLeader.value) {
      await loadLeaderData();
    } else {
      // Si es admin, no necesitamos cargar datos de líder
      loading.value = false;
    }
    
    // Marcar que los datos ya se han cargado
    dataLoaded.value = true;
  } catch (error) {
    console.error("Error en la carga inicial:", error);
  } finally {
    if (isMounted.value) {
      loading.value = false;
    }
  }
});

onUnmounted(() => {
  // Marcar el componente como desmontado para evitar actualizaciones de estado
  isMounted.value = false;
});

// Función unificada para cargar datos de líder
const loadLeaderData = async () => {
  if (!authStore.user?.id) return;
  
  try {
    // 1. Cargar datos del líder (una sola consulta)
    const leaderDoc = await getDoc(doc(db, "leaders", authStore.user.id));
    
    if (leaderDoc.exists()) {
      const data = leaderDoc.data();
      processLeaderData(data);
      
      // 2. Cargar datos de período activo y distrito en una sola operación
      await checkPendingReportsOptimized();
    }
  } catch (error) {
    console.error("Error al cargar datos del líder:", error);
  }
};

// Procesar datos del líder (sin hacer consultas adicionales)
const processLeaderData = (data: { 
  personalData?: {
    firstName?: string;
    lastName?: string;
    birthDate?: Date;
    maritalStatus?: string;
    phoneNumber?: string;
    [key: string]: any;
  };
  ministerialData?: {
    baptized?: boolean;
    appointmentDate?: Date;
    courses?: any[];
    [key: string]: any;
  };
}) => {
  const personalData = data.personalData || {};
  const ministerialData = data.ministerialData || {};
  
  // Verificar campos personales
  const requiredPersonalFields = [
    'firstName',
    'lastName',
    'birthDate',
    'maritalStatus',
    'phoneNumber'
  ];
  
  const hasAllPersonalFields = requiredPersonalFields.every(field => 
    personalData[field] && 
    (field === 'birthDate' ? true : personalData[field].toString().trim() !== '')
  );

  // Verificar campos ministeriales
  const requiredMinisterialFields = [
    'baptized',
    'appointmentDate'
  ];

  const hasAllMinisterialFields = requiredMinisterialFields.every(field => 
    ministerialData[field] && 
    (field === 'appointmentDate' ? true : ministerialData[field].toString().trim() !== '')
  );

  // Verificar cursos
  const hasCourses = Array.isArray(ministerialData.courses) && ministerialData.courses.length > 0;

  // Actualizar estado
  personalDataComplete.value = hasAllPersonalFields && hasAllMinisterialFields && hasCourses;
};

// Versión optimizada de checkPendingReports
const checkPendingReportsOptimized = async () => {
  if (!authStore.user?.id) return;
  
  try {
    // Consulta combinada: obtener período activo y distrito del líder en paralelo
    const [periodSnapshot, districtLeaderSnapshot] = await Promise.all([
      getDocs(query(
        collection(db, "report_periods"),
        where("isActive", "==", true),
        // Añadir límite explícito
        limit(1)
      )),
      getDocs(query(
        collection(db, "district_leaders"),
        where("userId", "==", authStore.user.id),
        where("isActive", "==", true),
        // Añadir límite explícito
        limit(1)
      ))
    ]);

    if (!periodSnapshot.empty && !districtLeaderSnapshot.empty) {
      const districtLeader = districtLeaderSnapshot.docs[0].data();
      const activePeriod = periodSnapshot.docs[0];

      // Verificar si existe confirmación
      const confirmationSnapshot = await getDocs(query(
        collection(db, "district_confirmations"),
        where("districtId", "==", districtLeader.districtId),
        where("periodId", "==", activePeriod.id),
        // Añadir límite explícito
        limit(1)
      ));

      hasPendingReport.value = confirmationSnapshot.empty;
    }
  } catch (error) {
    console.error("Error al verificar reportes pendientes:", error);
  }
};

// Mantener estos métodos como referencia pero ya no se usan
const checkPersonalDataCompletion = async () => {
  // Esta función ya no se usa directamente
  console.warn("Esta función está obsoleta, usar loadLeaderData en su lugar");
};

const checkPendingReports = async () => {
  // Esta función ya no se usa directamente
  console.warn("Esta función está obsoleta, usar checkPendingReportsOptimized en su lugar");
};

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
