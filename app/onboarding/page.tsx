'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/lib/supabase/browserClient'
import { Eye, EyeOff, MapPin, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import type { InvitationWithDetails } from '@/lib/types/rbac'

export default function OnboardingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  
  const [invitation, setInvitation] = useState<InvitationWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    phone: ''
  })

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    fetchInvitation()
  }, [token])

  const fetchInvitation = async () => {
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select(`
          *,
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
        .eq('token', token)
        .eq('status', 'pending')
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Invitation not found or already used')
        } else {
          setError('Failed to load invitation')
        }
        return
      }

      // Check if invitation is expired
      if (new Date(data.expires_at) < new Date()) {
        setError('This invitation has expired')
        return
      }

      setInvitation(data)
    } catch (err) {
      setError('Failed to load invitation')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invitation) return

    // Validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invitation.email,
        password: formData.password,
        options: {
          data: {
            first_name: invitation.first_name,
            last_name: invitation.last_name,
            phone: formData.phone
          }
        }
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData.user) {
        throw new Error('Failed to create user account')
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          first_name: invitation.first_name,
          last_name: invitation.last_name,
          phone: formData.phone,
          is_active: true,
          can_invite_users: false
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // Continue anyway, profile might be created by trigger
      }

      // Assign roles
      if (invitation.roles.length > 0) {
        const roleAssignments = invitation.roles.map(role => ({
          user_id: authData.user.id,
          role_id: role.role_id,
          location_id: role.location_id,
          assigned_by: invitation.invited_by,
          is_active: true
        }))

        const { error: rolesError } = await supabase
          .from('user_roles_locations')
          .insert(roleAssignments)

        if (rolesError) {
          console.error('Role assignment error:', rolesError)
        }
      }

      // Assign additional permissions
      if (invitation.permissions.length > 0) {
        const permissionAssignments = invitation.permissions.map(perm => ({
          user_id: authData.user.id,
          permission_id: perm.permission_id,
          location_id: perm.location_id,
          granted: true,
          granted_by: invitation.invited_by
        }))

        const { error: permissionsError } = await supabase
          .from('user_permissions')
          .insert(permissionAssignments)

        if (permissionsError) {
          console.error('Permission assignment error:', permissionsError)
        }
      }

      // Mark invitation as accepted
      const { error: updateError } = await supabase
        .from('invitations')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('id', invitation.id)

      if (updateError) {
        console.error('Invitation update error:', updateError)
      }

      // Redirect to dashboard
      router.push('/dashboard')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete profile')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="w-full" 
              onClick={() => router.push('/login')}
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
              <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-black"></div>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Pecora Negra</h1>
          <p className="text-gray-600">Complete your profile to get started</p>
        </div>

        {/* Invitation Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Invitation Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="font-medium">
                {invitation.first_name} {invitation.last_name}
              </p>
              <p className="text-sm text-gray-500">{invitation.email}</p>
            </div>

            {invitation.roles.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Assigned Roles</h4>
                <div className="space-y-2">
                  {invitation.roles.map((role, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {role.location?.name}:
                      </span>
                      <Badge variant="secondary">
                        {role.role?.display_name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {invitation.permissions.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Additional Permissions</h4>
                <div className="space-y-2">
                  {invitation.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">
                        {permission.location?.name}:
                      </span>
                      <Badge variant="outline">
                        {permission.permission?.display_name}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
            <CardDescription>
              Set up your account to access the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm password"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={submitting}
              >
                {submitting ? 'Creating Account...' : 'Complete Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
