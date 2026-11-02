import { defineStore } from 'pinia';
import { auth, db } from '../firebase/config';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import type { User } from '../types/User';
import { COLLECTIONS, CACHE_TTL } from '@/constants';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: null | string;
  userData: any;
}

let authReadyPromise: Promise<void> | null = null;

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    error: null,
    userData: null as any
  }),

  actions: {
    async fetchUserProfile(uid: string): Promise<User | null> {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        id: uid,
        email: userData.email,
        lastLogin: userData.lastLogin,
        role: userData.role,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt
      };
    },

    // Espera a que Firebase restaure (o no) la sesión persistida antes de que
    // el router evalúe auth.currentUser, que de otra forma llega null en la
    // primera carga aunque exista una sesión válida.
    waitForAuthReady() {
      if (!authReadyPromise) {
        authReadyPromise = new Promise<void>((resolve) => {
          onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
              try {
                this.user = await this.fetchUserProfile(firebaseUser.uid);
              } catch (error) {
                console.error('Error al restaurar la sesión:', error);
                this.user = null;
              }
            } else {
              this.user = null;
            }
            resolve();
          });
        });
      }
      return authReadyPromise;
    },

    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const userRef = doc(db, COLLECTIONS.USERS, userCredential.user.uid);

        this.user = await this.fetchUserProfile(userCredential.user.uid);
        if (!this.user) {
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
      
      // Si ya tenemos los datos y no han pasado más de 5 minutos, devolver los datos en caché
      if (this.userData && this.userData._lastFetched) {
        const cacheExpiration = new Date().getTime() - CACHE_TTL;
        if (this.userData._lastFetched > cacheExpiration) {
          return this.userData;
        }
      }

      try {
        const leaderRef = doc(db, COLLECTIONS.LEADERS, this.user.id);
        const leaderDoc = await getDoc(leaderRef);
        
        if (leaderDoc.exists()) {
          // Añadir timestamp para control de caché
          this.userData = {
            ...leaderDoc.data(),
            _lastFetched: new Date().getTime()
          };
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
        const leaderRef = doc(db, COLLECTIONS.LEADERS, this.user.id);
        await setDoc(leaderRef, data, { merge: true });
        
        // Actualizar caché local inmediatamente
        this.userData = { 
          ...this.userData, 
          ...data,
          _lastFetched: new Date().getTime() 
        };
      } catch (error) {
        console.error("Error al actualizar datos:", error);
        throw error;
      }
    }
  }
});