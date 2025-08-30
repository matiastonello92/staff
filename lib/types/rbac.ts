export interface Location {
  id: string
  name: string
  address?: string
  city?: string
  country?: string
  phone?: string
  email?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Role {
  id: string
  name: string
  display_name: string
  description?: string
  level: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Permission {
  id: string
  name: string
  display_name: string
  description?: string
  category: string
  created_at: string
}

export interface RolePermission {
  id: string
  role_id: string
  permission_id: string
  created_at: string
  role?: Role
  permission?: Permission
}

export interface UserProfile {
  id: string
  first_name?: string
  last_name?: string
  phone?: string
  avatar_url?: string
  is_active: boolean
  can_invite_users: boolean
  notes?: string
  created_at: string
  updated_at: string
}

export interface UserRoleLocation {
  id: string
  user_id: string
  role_id: string
  location_id: string
  assigned_by?: string
  assigned_at: string
  is_active: boolean
  role?: Role
  location?: Location
  user_profile?: UserProfile
}

export interface UserPermission {
  id: string
  user_id: string
  permission_id: string
  location_id: string
  granted: boolean
  granted_by?: string
  granted_at: string
  permission?: Permission
  location?: Location
}

export interface Invitation {
  id: string
  email: string
  first_name?: string
  last_name?: string
  invited_by?: string
  status: 'pending' | 'accepted' | 'expired' | 'revoked'
  token: string
  expires_at: string
  accepted_at?: string
  revoked_at?: string
  notes?: string
  created_at: string
  updated_at: string
  invited_by_profile?: UserProfile
}

export interface InvitationRoleLocation {
  id: string
  invitation_id: string
  role_id: string
  location_id: string
  role?: Role
  location?: Location
}

export interface InvitationPermission {
  id: string
  invitation_id: string
  permission_id: string
  location_id: string
  permission?: Permission
  location?: Location
}

export interface InvitationWithDetails extends Invitation {
  roles: InvitationRoleLocation[]
  permissions: InvitationPermission[]
}

export interface UserWithDetails extends UserProfile {
  email?: string
  roles: UserRoleLocation[]
  permissions: UserPermission[]
}

// Form types
export interface InviteUserForm {
  email: string
  firstName: string
  lastName: string
  locations: string[]
  roles: { locationId: string; roleId: string }[]
  permissions: { locationId: string; permissionId: string }[]
  notes?: string
  expiresInDays?: number
}

export interface CompleteProfileForm {
  password: string
  confirmPassword: string
  phone?: string
  avatar?: File
}

// Permission categories
export const PERMISSION_CATEGORIES = {
  user_management: 'User Management',
  inventory: 'Inventory',
  orders: 'Orders',
  haccp: 'HACCP & Safety',
  maintenance: 'Maintenance',
  financial: 'Financial',
  settings: 'Settings'
} as const

export type PermissionCategory = keyof typeof PERMISSION_CATEGORIES

// Role levels for hierarchy
export const ROLE_LEVELS = {
  ADMIN: 100,
  GENERAL_MANAGER: 90,
  ASSISTANT_MANAGER: 80,
  DEPARTMENT_HEAD: 70,
  SUPERVISOR: 60,
  SENIOR_STAFF: 50,
  STAFF: 30,
  JUNIOR: 20
} as const
