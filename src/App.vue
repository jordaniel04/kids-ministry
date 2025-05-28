<template>
  <VApp>
    <router-view />
  </VApp>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { useDistrictStore } from './stores/district';

const authStore = useAuthStore();
const districtStore = useDistrictStore();

onMounted(async () => {
    if (authStore.user?.role === 'lider') {
        await districtStore.loadDistrictData();
    }
});
</script>

<style scoped>
/* Estilos específicos para la aplicación */
</style>
