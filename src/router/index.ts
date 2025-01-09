import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { auth } from '../firebase/config';

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
  // {
  //   path: '/statistics',
  //   name: 'Statistics',
  //   component: () => import('../views/dashboard/StatisticsView.vue'),
  //   meta: { requiresAuth: true }
  // }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Guardia de navegación
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = auth.currentUser;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (!requiresAuth && isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

export default router; 