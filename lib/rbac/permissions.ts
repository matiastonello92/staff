import type { UserRoleLocation, UserPermission, Role, Permission } from '@/lib/types/rbac'

export interface UserPermissions {
  roles: UserRoleLocation[]
  permissions: UserPermission[]
}

/**
 * Get all permissions for a user (from roles + direct permissions - revoked permissions)
 */
export function getUserPermissions(
  userRoles: UserRoleLocation[],
  userPermissions: UserPermission[],
  allRoles: Role[],
  allPermissions: Permission[]
): string[] {
  // Get permissions from roles
  const rolePermissions: string[] = []
  
  userRoles.forEach(userRole => {
    if (!userRole.is_active || !userRole.role) return
    
    // In a real implementation, you would fetch role_permissions
    // For now, we'll use a basic mapping based on role level
    const role = userRole.role
    const permissions = getRolePermissions(role)
    rolePermissions.push(...permissions)
  })

  // Get direct permissions (granted - revoked)
  const directGranted = userPermissions
    .filter(up => up.granted)
    .map(up => up.permission?.name)
    .filter(Boolean) as string[]

  const directRevoked = userPermissions
    .filter(up => !up.granted)
    .map(up => up.permission?.name)
    .filter(Boolean) as string[]

  // Combine and deduplicate
  const allUserPermissions = [...new Set([...rolePermissions, ...directGranted])]
  
  // Remove revoked permissions
  return allUserPermissions.filter(perm => !directRevoked.includes(perm))
}

/**
 * Get permissions for a specific role based on role level and type
 */
export function getRolePermissions(role: Role): string[] {
  const permissions: string[] = []

  // Admin gets all permissions
  if (role.name === 'admin') {
    return [
      'invite_users', 'manage_users', 'view_users', 'assign_roles',
      'manage_inventory', 'view_inventory', 'update_stock',
      'manage_orders', 'view_orders', 'approve_orders',
      'manage_haccp', 'view_haccp', 'complete_checklists',
      'manage_maintenance', 'view_maintenance',
      'view_financials', 'manage_financials',
      'manage_settings', 'view_settings'
    ]
  }

  // General Manager permissions
  if (role.name === 'general_manager') {
    return [
      'invite_users', 'view_users',
      'manage_inventory', 'view_inventory', 'update_stock',
      'manage_orders', 'view_orders', 'approve_orders',
      'manage_haccp', 'view_haccp', 'complete_checklists',
      'manage_maintenance', 'view_maintenance',
      'view_financials', 'view_settings'
    ]
  }

  // Assistant Manager permissions
  if (role.name === 'assistant_manager') {
    return [
      'view_users',
      'view_inventory', 'update_stock',
      'view_orders', 'approve_orders',
      'view_haccp', 'complete_checklists',
      'view_maintenance',
      'view_settings'
    ]
  }

  // Chef de Cuisine permissions
  if (role.name === 'chef_de_cuisine') {
    return [
      'view_inventory', 'update_stock',
      'view_orders',
      'manage_haccp', 'view_haccp', 'complete_checklists'
    ]
  }

  // Kitchen staff permissions
  if (['head_pizzaiolo', 'second_pizzaiolo', 'commis_pizzaiolo'].includes(role.name)) {
    return [
      'view_inventory', 'update_stock',
      'view_haccp', 'complete_checklists'
    ]
  }

  // Floor Manager permissions
  if (role.name === 'floor_manager') {
    return [
      'view_users',
      'view_inventory',
      'view_orders',
      'view_haccp', 'complete_checklists'
    ]
  }

  // Service staff permissions
  if (['chef_de_rang', 'runner', 'bartender'].includes(role.name)) {
    return [
      'view_inventory',
      'complete_checklists'
    ]
  }

  // Support staff permissions
  if (['handyman', 'dishwasher'].includes(role.name)) {
    return [
      'view_maintenance',
      'complete_checklists'
    ]
  }

  // Administrative roles
  if (role.name === 'accountant') {
    return [
      'view_financials', 'manage_financials',
      'view_orders'
    ]
  }

  if (role.name === 'hr') {
    return [
      'view_users', 'manage_users',
      'view_settings'
    ]
  }

  if (role.name === 'marketing') {
    return [
      'view_users',
      'view_financials'
    ]
  }

  return permissions
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  userPermissions: string[],
  permission: string
): boolean {
  return userPermissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: string[],
  permissions: string[]
): boolean {
  return permissions.some(perm => userPermissions.includes(perm))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: string[],
  permissions: string[]
): boolean {
  return permissions.every(perm => userPermissions.includes(perm))
}

/**
 * Get user's role level (highest level among all roles)
 */
export function getUserRoleLevel(userRoles: UserRoleLocation[]): number {
  return Math.max(
    ...userRoles
      .filter(ur => ur.is_active && ur.role)
      .map(ur => ur.role!.level),
    0
  )
}

/**
 * Check if user can manage another user based on role hierarchy
 */
export function canManageUser(
  managerRoles: UserRoleLocation[],
  targetUserRoles: UserRoleLocation[]
): boolean {
  const managerLevel = getUserRoleLevel(managerRoles)
  const targetLevel = getUserRoleLevel(targetUserRoles)
  
  // Can manage users with lower role level
  return managerLevel > targetLevel
}

/**
 * Get permissions by category
 */
export function getPermissionsByCategory(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = []
    }
    acc[permission.category].push(permission)
    return acc
  }, {} as Record<string, Permission[]>)
}

/**
 * Filter locations based on user access
 */
export function getUserLocations(userRoles: UserRoleLocation[]): string[] {
  return [...new Set(
    userRoles
      .filter(ur => ur.is_active)
      .map(ur => ur.location_id)
  )]
}

/**
 * Check if user has access to a specific location
 */
export function hasLocationAccess(
  userRoles: UserRoleLocation[],
  locationId: string
): boolean {
  return userRoles.some(ur => 
    ur.is_active && ur.location_id === locationId
  )
}
