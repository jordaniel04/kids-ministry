<template>
    <VContainer>
        <VRow class="mb-4">
            <VCol cols="12" class="d-flex justify-space-between align-center">
                <VBtn color="primary" variant="text" prepend-icon="mdi-arrow-left" @click="goBack">
                    Volver
                </VBtn>
                <VBtn color="error" variant="outlined" prepend-icon="mdi-logout" @click="handleLogout">
                    Cerrar Sesión
                </VBtn>
            </VCol>
        </VRow>
    </VContainer>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { logout } = useAuth();

const goBack = () => {
    router.push('/');
};

const handleLogout = async () => {
    try {
        await logout();
        router.push('/login');
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
};
</script>

<script lang="ts">
export default {
    name: 'NavigationBar'
}
</script>