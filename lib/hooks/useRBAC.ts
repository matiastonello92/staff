'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../supabase/browserClient'
import { useAuth } from './useAuth'
import type {
  Location,
  Role,
  Permission,
  UserProfile,
  UserRoleLocation,
  UserPermission,
  Invitation,
  InvitationWithDetails,
  UserWithDetails
} from '../types/rbac'

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLocations() {
      try {
        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('is_active', true)
          .order('name')

        if (error) throw error
        setLocations(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch locations')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  return { locations, loading, error }
}

export function useRoles() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRoles() {
      try {
        const { data, error } = await supabase
          .from('roles')
          .select('*')
          .eq('is_active', true)
          .order('level', { ascending: false })

        if (error) throw error
        setRoles(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch roles')
      } finally {
        setLoading(false)
      }
    }

    fetchRoles()
  }, [])

  return { roles, loading, error }
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPermissions() {
      try {
        const { data, error } = await supabase
          .from('permissions')
          .select('*')
          .order('category, display_name')

        if (error) throw error
        setPermissions(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch permissions')
      } finally {
        setLoading(false)
      }
    }

    fetchPermissions()
  }, [])

  return { permissions, loading, error }
}

export function useUserProfile(userId?: string) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const targetUserId = userId || user?.id

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false)
      return
    }

    async function fetchProfile() {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', targetUserId)
          .single()

        if (error) throw error
        setProfile(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [targetUserId])

  return { profile, loading, error }
}

export function useUsers() {
  const [users, setUsers] = useState<UserWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUsers() {
      try {
        // Fetch user profiles with auth data
        const { data: profiles, error: profilesError } = await supabase
          .from('user_profiles')
          .select(`
            *,
            user_roles_locations!inner(
              *,
              role:roles(*),
              location:locations(*)
            ),
            user_permissions(
              *,
              permission:permissions(*),
              location:locations(*)
            )
          `)
          .eq('is_active', true)

        if (profilesError) throw profilesError

        // Get auth users to get email
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
        if (authError) throw authError

        // Combine profile and auth data
        const usersWithDetails: UserWithDetails[] = profiles?.map(profile => {
          const authUser = authUsers.users.find(u => u.id === profile.id)
          return {
            ...profile,
            email: authUser?.email,
            roles: profile.user_roles_locations || [],
            permissions: profile.user_permissions || []
          }
        }) || []

        setUsers(usersWithDetails)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const refetch = async () => {
    setLoading(true)
    setError(null)
    // Re-run the fetch logic
    useEffect(() => {}, [])
  }

  return { users, loading, error, refetch }
}

export function useInvitations() {
  const [invitations, setInvitations] = useState<InvitationWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchInvitations() {
      try {
        const { data, error } = await supabase
          .from('invitations')
          .select(`
            *,
            invited_by_profile:user_profiles!invitations_invited_by_fkey(*),
            roles:invitation_roles_locations(
              *,
              role:roles(*),
              location:locations(*)
            ),
            permissions:invitation_permissions(
              *,
              permission:permissions(*),
              location:locations(*)
            )
          `)
          .order('created_at', { ascending: false })

        if (error) throw error
        setInvitations(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch invitations')
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()
  }, [])

  const refetch = async () => {
    setLoading(true)
    setError(null)
    // Re-run the fetch logic
    useEffect(() => {}, [])
  }

  return { invitations, loading, error, refetch }
}

export function useUserPermissions(userId?: string) {
  const { user } = useAuth()
  const [userPermissions, setUserPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const targetUserId = userId || user?.id

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false)
      return
    }

    async function fetchUserPermissions() {
      try {
        // Get permissions from roles
        const { data: rolePermissions, error: roleError } = await supabase
          .from('user_roles_locations')
          .select(`
            role_permissions!inner(
              permissions!inner(name)
            )
          `)
          .eq('user_id', targetUserId)
          .eq('is_active', true)

        if (roleError) throw roleError

        // Get direct user permissions
        const { data: directPermissions, error: directError } = await supabase
          .from('user_permissions')
          .select(`
            granted,
            permissions!inner(name)
          `)
          .eq('user_id', targetUserId)

        if (directError) throw directError

        // Combine permissions
        const rolePerms = rolePermissions?.flatMap(rp => 
          rp.role_permissions.permissions.name
        ) || []

        const directPerms = directPermissions?.filter(dp => dp.granted)
          .map(dp => dp.permissions.name) || []

        const revokedPerms = directPermissions?.filter(dp => !dp.granted)
          .map(dp => dp.permissions.name) || []

        // Final permissions = role permissions + direct granted - direct revoked
        const finalPermissions = [...new Set([...rolePerms, ...directPerms])]
          .filter(perm => !revokedPerms.includes(perm))

        setUserPermissions(finalPermissions)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user permissions')
      } finally {
        setLoading(false)
      }
    }

    fetchUserPermissions()
  }, [targetUserId])

  const hasPermission = (permission: string) => userPermissions.includes(permission)

  return { userPermissions, hasPermission, loading, error }
}
