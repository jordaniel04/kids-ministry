import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { auth } from '../firebase/config';
import DistrictReportsView from '../views/admin/DistrictReportsView.vue'
import { clearAllFirestoreListeners } from '../composables/useFirestoreListeners';
import { useAuthStore } from '../stores/auth';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/auth/LoginView.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('../views/dashboard/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/manage-users',
    name: 'UserManagement',
    component: () => import('../views/dashboard/UserManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/personal-data',
    name: 'PersonalData',
    component: () => import('../views/dashboard/PersonalDataForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/ministerial-data',
    name: 'MinisterialData',
    component: () => import('../views/dashboard/MinisterialDataView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/manage-districts',
    name: 'manage-districts',
    component: () => import('../views/admin/DistrictManagementView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/statistics/report-periods',
    name: 'ReportPeriods',
    component: () => import('../views/admin/ReportPeriodsView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/district-reports',
    name: 'district-reports',
    component: DistrictReportsView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/district-historical',
    name: 'district-historical',
    component: () => import('../views/admin/DistrictHistoricalView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/birthday-list',
    name: 'BirthdayList',
    component: () => import('../views/dashboard/BirthdayListView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/report-matrix',
    name: 'report-matrix',
    component: () => import('../views/admin/ReportMatrixView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

// Limpiar todos los listeners antes de cada cambio de ruta
router.beforeEach((to, from, next) => {
  // Limpiar todos los listeners de Firestore
  clearAllFirestoreListeners();
  
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

  const isAuthenticated = auth.currentUser;

  if (requiresAuth && !isAuthenticated) {
    // Redirigir a login si la ruta requiere autenticación
    next('/login');
    return;
  }

  if (!requiresAuth && isAuthenticated) {
    // Si ya está autenticado, evitar ir a login
    next('/');
    return;
  }

  if (requiresAdmin) {
    // Verificar rol usando Pinia
    const authStore = useAuthStore();
    const role = authStore.user?.role;
    if (role !== 'admin' && role !== 'secretaria') {
      // Si no tiene permisos, redirigir al dashboard
      next('/');
      return;
    }
  }

  next();
});

export default router; 