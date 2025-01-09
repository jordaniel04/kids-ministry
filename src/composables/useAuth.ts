import { ref } from "vue";
import { useAuthStore } from "../stores/auth";

export const useAuth = () => {
  const authStore = useAuthStore();
  const error = ref<string | null>(null);

  const login = async (email: string, password: string) => {
    try {
      await authStore.login(email, password);
      error.value = null;
      return true;
    } catch (err: any) {
      if (err.code) {
        error.value = authStore.parseAuthError(err.code);
      } else {
        error.value = "Correo y/o contraseña incorrectos";
      }
      return false;
    }
  };

  const logout = async () => {
    await authStore.logout();
  };

  return { login, logout, error };
};
