import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { auth } from '../firebase/config';
import DistrictReportsView from '../views/admin/DistrictReportsView.vue'

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
  }
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