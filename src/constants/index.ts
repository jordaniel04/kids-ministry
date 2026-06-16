/**
 * Constantes centralizadas del proyecto Kids Ministry
 *
 * Este archivo contiene todos los valores constantes usados en la aplicación
 * para evitar duplicación y facilitar el mantenimiento.
 */

// ============================================
// CONFIGURACIÓN DE CACHÉ
// ============================================

/**
 * Duración del tiempo de vida del caché (TTL)
 * 5 minutos = 5 * 60 * 1000 milisegundos
 */
export const CACHE_TTL = 5 * 60 * 1000;

// ============================================
// NOMBRES DE COLECCIONES DE FIRESTORE
// ============================================

/**
 * Nombres de las colecciones en Firestore
 * Usar siempre estas constantes en lugar de strings literales
 */
export const COLLECTIONS = {
  /** Colección de usuarios del sistema */
  USERS: 'users',

  /** Colección de líderes ministeriales */
  LEADERS: 'leaders',

  /** Colección de distritos */
  DISTRICTS: 'districts',

  /** Colección de asignaciones de líderes a distritos */
  DISTRICT_LEADERS: 'district_leaders',

  /** Colección de iglesias */
  CHURCHES: 'churches',

  /** Colección de períodos de reporte */
  REPORT_PERIODS: 'report_periods',

  /** Colección de confirmaciones de distrito */
  DISTRICT_CONFIRMATIONS: 'district_confirmations',

  /** Colección de confirmaciones de iglesia */
  CHURCH_CONFIRMATIONS: 'church_confirmations'
} as const;

// ============================================
// ROLES DE USUARIO
// ============================================

/**
 * Roles disponibles en el sistema
 */
export const ROLES = {
  /** Administrador con acceso completo */
  ADMIN: 'admin',

  /** Secretaria con acceso a rutas admin */
  SECRETARIA: 'secretaria',

  /** Líder de distrito con acceso limitado a dashboard */
  LIDER: 'lider'
} as const;

// ============================================
// ESTADOS DE CONFIRMACIÓN
// ============================================

/**
 * Estados posibles para confirmaciones de distrito/iglesia
 */
export const CONFIRMATION_STATES = {
  /** Pendiente de confirmación */
  PENDING: 'pending',

  /** Confirmado */
  CONFIRMED: 'confirmed',

  /** Rechazado */
  REJECTED: 'rejected'
} as const;

// ============================================
// TIPOS DERIVADOS
// ============================================

/** Tipo para nombres de colecciones */
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];

/** Tipo para roles de usuario */
export type UserRole = typeof ROLES[keyof typeof ROLES];

/** Tipo para estados de confirmación */
export type ConfirmationState = typeof CONFIRMATION_STATES[keyof typeof CONFIRMATION_STATES];
