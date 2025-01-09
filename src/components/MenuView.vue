<template>
  <VContainer>
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
            Ver Estadísticas
          </VCardTitle>
          <VCardSubtitle> Ver las estadísticas del sistema </VCardSubtitle>
          <template v-slot:actions>
            <VBtn variant="text" @click="goToStatistics">
              Ir a Estadísticas
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

      <VCol v-if="isLeader" cols="12" sm="12" md="4">
        <VCard
          class="mx-auto mb-4"
          color="surface-variant"
          max-width="100%"
          @click="goToPersonalData"
        >
          <VCardTitle class="d-flex align-center">
            <VIcon class="me-2">mdi-account</VIcon>
            Datos Personales
          </VCardTitle>
          <VCardSubtitle> Actualiza tu información personal </VCardSubtitle>
          <template v-slot:actions>
            <VBtn variant="text" @click="goToPersonalData"> Ir a Datos </VBtn>
          </template>
        </VCard>
      </VCol>

      <VCol v-if="isLeader" cols="12" sm="12" md="4">
        <VCard
          class="mx-auto mb-4"
          color="surface-variant"
          max-width="100%"
          @click="goToMinisterialData"
        >
          <VCardTitle class="d-flex align-center">
            <VIcon class="me-2">mdi-chart-box</VIcon>
            Datos Estadísticos
          </VCardTitle>
          <VCardSubtitle>
            Gestiona tu información estadística del distrito
          </VCardSubtitle>
          <template v-slot:actions>
            <VBtn variant="text" @click="goToMinisterialData">
              Ir a Estadísticas Distritales
            </VBtn>
          </template>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";

const authStore = useAuthStore();
const router = useRouter();
const { logout } = useAuth();

const isAdmin = computed(() => authStore.user?.role === "admin");
const isLeader = computed(() => authStore.user?.role === "lider");

const goToUserManagement = () => {
  router.push("/manage-users");
};

const goToPersonalData = () => {
  router.push("/personal-data");
};

const goToMinisterialData = () => {
  router.push("/ministerial-data");
};

const goToStatistics = () => {
  router.push("/statistics");
};

const goToDistrictManagement = () => {
  router.push("/manage-districts");
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
.v-card {
  transition: transform 0.2s;
  height: 100%;
}

.v-card:hover {
  transform: translateY(-5px);
  cursor: pointer;
}

@media (max-width: 600px) {
  .v-card {
    margin-bottom: 16px;
  }
}
</style>
