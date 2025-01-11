<template>
  <VContainer class="fill-height">
    <VRow justify="center" align="center">
      <VCol cols="12" sm="8" md="6" lg="4">
        <VCard class="elevation-12">
          <VCardTitle class="text-center pt-6">
            <h2>Iniciar Sesión</h2>
          </VCardTitle>

          <VCardText>
            <VForm @submit.prevent="handleLogin">
              <VTextField
                v-model="email"
                label="Correo Electrónico"
                type="email"
                required
                prepend-icon="mdi-email"
                :rules="emailRules"
                @input="clearErrors"
              ></VTextField>

              <VTextField
                v-model="password"
                label="Contraseña"
                :type="showPassword ? 'text' : 'password'"
                required
                prepend-icon="mdi-lock"
                :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append="showPassword = !showPassword"
                :rules="passwordRules"
                @input="clearErrors"
              ></VTextField>

              <VAlert
                v-if="error"
                type="error"
                variant="tonal"
                class="mt-3 mb-3"
                density="compact"
              >
                {{ error }}
              </VAlert>

              <VBtn
                type="submit"
                color="primary"
                block
                class="mt-4"
                :loading="loading"
              >
                Iniciar Sesión
              </VBtn>
            </VForm>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VContainer>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '../../composables/useAuth';
import { useRouter } from 'vue-router';

const { login, error } = useAuth();
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const router = useRouter();

const emailRules = [
  (v: string): string | boolean => !!v || 'El correo es requerido',
  (v: string): string | boolean => /.+@.+\..+/.test(v) || 'El formato del correo no es válido'
];

const passwordRules = [
  (v: string): string | boolean => !!v || 'La contraseña es requerida',
  (v: string): string | boolean => v.length >= 6 || 'La contraseña debe tener al menos 6 caracteres'
];

const clearErrors = () => {
  error.value = '';
};

const handleLogin = async () => {
  clearErrors();

  // Validar campos requeridos
  if (!email.value || !password.value) {
    error.value = 'Por favor, complete todos los campos requeridos';
    return;
  }

  // Validar formato de email
  if (!/.+@.+\..+/.test(email.value)) {
    error.value = 'El formato del correo no es válido';
    return;
  }

  // Validar longitud de contraseña
  if (password.value.length < 6) {
    error.value = 'La contraseña debe tener al menos 6 caracteres';
    return;
  }

  loading.value = true;
  try {
    const success = await login(email.value, password.value);
    if (success) {
      router.push('/');
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Estilos específicos para la vista de Login */
</style>
