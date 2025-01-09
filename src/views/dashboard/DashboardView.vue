<template>
  <div>
    <!-- Botón volver cuando no estemos en el menú -->
    <VContainer v-if="!isMenuView">
      <VRow>
        <VCol cols="12">
          <VBtn
            color="primary"
            variant="text"
            prepend-icon="mdi-arrow-left"
            @click="goBack"
          >
            Volver
          </VBtn>
        </VCol>
      </VRow>
    </VContainer>
    
    <MenuView></MenuView>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const MenuView = defineAsyncComponent(() => import('../../components/MenuView.vue'));
const router = useRouter();
const route = useRoute();

const isMenuView = computed(() => route.path === '/');

const goBack = () => {
  router.push('/');
};
</script>

<style scoped>
/* Estilos específicos para la vista del Dashboard */
</style>
