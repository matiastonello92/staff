import { ROLES } from './roles'

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view_dashboard',
  MANAGE_STAFF: 'manage_staff',
  MANAGE_ORDERS: 'manage_orders',
  VIEW_HACCP: 'view_haccp',
  MANAGE_HACCP: 'manage_haccp',
  MANAGE_MAINTENANCE: 'manage_maintenance',
  MANAGE_LOCATIONS: 'manage_locations',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

export const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.MANAGE_STAFF,
    PERMISSIONS.MANAGE_ORDERS,
    PERMISSIONS.VIEW_HACCP,
    PERMISSIONS.MANAGE_HACCP,
    PERMISSIONS.MANAGE_MAINTENANCE,
  ],
  [ROLES.STAFF]: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_HACCP,
  ],
}
