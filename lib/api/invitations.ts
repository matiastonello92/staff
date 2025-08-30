import { supabase } from '@/lib/supabase/browserClient'
import type { InviteUserForm } from '@/lib/types/rbac'

export interface InvitationResponse {
  success: boolean
  invitation?: {
    id: string
    email: string
    token: string
    expires_at: string
    invitation_link: string
  }
  error?: string
}

export async function sendInvitation(data: InviteUserForm): Promise<InvitationResponse> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Authentication required')
    }

    // Call the Edge Function
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-invitation`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send invitation')
    }

    return result
  } catch (error) {
    console.error('Error sending invitation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send invitation'
    }
  }
}

export async function resendInvitation(invitationId: string): Promise<InvitationResponse> {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      throw new Error('Authentication required')
    }

    // Get invitation details
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select(`
        *,
        roles:invitation_roles_locations(
          role_id,
          location_id
        ),
        permissions:invitation_permissions(
          permission_id,
          location_id
        )
      `)
      .eq('id', invitationId)
      .single()

    if (invitationError || !invitation) {
      throw new Error('Invitation not found')
    }

    // Prepare data for resending
    const resendData: InviteUserForm = {
      email: invitation.email,
      firstName: invitation.first_name || '',
      lastName: invitation.last_name || '',
      locations: [...new Set(invitation.roles.map((r: any) => r.location_id))],
      roles: invitation.roles.map((r: any) => ({
        locationId: r.location_id,
        roleId: r.role_id
      })),
      permissions: invitation.permissions.map((p: any) => ({
        locationId: p.location_id,
        permissionId: p.permission_id
      })),
      notes: invitation.notes || '',
      expiresInDays: 7 // Default to 7 days for resend
    }

    // Mark old invitation as revoked
    await supabase
      .from('invitations')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    // Send new invitation
    return await sendInvitation(resendData)
  } catch (error) {
    console.error('Error resending invitation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend invitation'
    }
  }
}

export async function revokeInvitation(invitationId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('invitations')
      .update({
        status: 'revoked',
        revoked_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    if (error) {
      throw new Error(error.message)
    }

    return { success: true }
  } catch (error) {
    console.error('Error revoking invitation:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to revoke invitation'
    }
  }
}

export async function getInvitationByToken(token: string) {
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
      throw new Error(error.message)
    }

    // Check if invitation is expired
    if (new Date(data.expires_at) < new Date()) {
      throw new Error('Invitation has expired')
    }

    return { data, error: null }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to get invitation'
    }
  }
}
