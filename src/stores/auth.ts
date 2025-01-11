import { defineStore } from 'pinia';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import type { User } from '../types/User';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: null | string;
  userData: any;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    userData: null as any
  }),
  
  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, "users", userCredential.user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          this.user = {
            id: userCredential.user.uid,
            email: userData.email,
            lastLogin: Timestamp.now(),
            role: userData.role,
            createdAt: userData.createdAt,
            updatedAt: Timestamp.now()
          };
        } else {
          console.error("No se encontró el documento del usuario en Firestore");
        }

        // Actualiza el documento del usuario
        await setDoc(userRef, {
          lastLogin: Timestamp.now(),
        }, { merge: true });

        return this.user;
      } catch (error: any) {
        this.error = this.parseAuthError(error.code);
        throw this.error;
      } finally {
        this.loading = false;
      }
    },

    parseAuthError(errorCode: string): string {
      switch (errorCode) {
        case 'auth/invalid-email':
          return 'El correo electrónico no es válido.';
        case 'auth/user-disabled':
          return 'Esta cuenta ha sido deshabilitada.';
        case 'auth/user-not-found':
          return 'No existe una cuenta con este correo electrónico.';
        case 'auth/wrong-password':
          return 'Contraseña incorrecta.';
        case 'auth/network-request-failed':
          return 'Error de conexión. Verifica tu conexión a internet.';
        default:
          return 'Error al iniciar sesión. Por favor, intenta de nuevo.';
      }
    },

    async logout() {
      try {
        await signOut(auth);
        this.user = null;
      } catch (error: any) {
        this.error = error.message;
        throw error;
      }
    },

    async getUserData() {
      if (!this.user?.id) return null;
      
      try {
        const leaderRef = doc(db, "leaders", this.user.id);
        const leaderDoc = await getDoc(leaderRef);
        
        if (leaderDoc.exists()) {
          this.userData = leaderDoc.data();
          return this.userData;
        }
        return null;
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        return null;
      }
    },

    async updateUserData(data: any) {
      if (!this.user?.id) throw new Error("Usuario no autenticado");
      
      try {
        const leaderRef = doc(db, "leaders", this.user.id);
        await setDoc(leaderRef, data, { merge: true });
        this.userData = { ...this.userData, ...data };
      } catch (error) {
        console.error("Error al actualizar datos:", error);
        throw error;
      }
    }
  }
}); 