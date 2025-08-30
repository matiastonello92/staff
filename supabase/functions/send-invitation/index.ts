import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const SITE_URL = Deno.env.get('SITE_URL') || 'http://localhost:3000'

interface InvitationRequest {
  email: string
  firstName: string
  lastName: string
  locations: string[]
  roles: { locationId: string; roleId: string }[]
  permissions: { locationId: string; permissionId: string }[]
  notes?: string
  expiresInDays?: number
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing authorization header')
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    // Verify the user has permission to invite
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Check if user can invite
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('can_invite_users')
      .eq('id', user.id)
      .single()

    if (!profile?.can_invite_users) {
      // Check if user has invite_users permission
      const { data: permissions } = await supabase
        .from('user_roles_locations')
        .select(`
          role_permissions!inner(
            permissions!inner(name)
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true)

      const hasInvitePermission = permissions?.some(p => 
        p.role_permissions.permissions.name === 'invite_users'
      )

      if (!hasInvitePermission) {
        throw new Error('Insufficient permissions to invite users')
      }
    }

    const invitationData: InvitationRequest = await req.json()

    // Generate secure token
    const token = crypto.randomUUID() + '-' + Date.now().toString(36)
    
    // Calculate expiration date
    const expiresInDays = invitationData.expiresInDays || 7
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expiresInDays)

    // Create invitation record
    const { data: invitation, error: inviteError } = await supabase
      .from('invitations')
      .insert({
        email: invitationData.email,
        first_name: invitationData.firstName,
        last_name: invitationData.lastName,
        invited_by: user.id,
        token,
        expires_at: expiresAt.toISOString(),
        notes: invitationData.notes,
        status: 'pending'
      })
      .select()
      .single()

    if (inviteError) {
      throw new Error(`Failed to create invitation: ${inviteError.message}`)
    }

    // Insert role assignments
    if (invitationData.roles.length > 0) {
      const { error: rolesError } = await supabase
        .from('invitation_roles_locations')
        .insert(
          invitationData.roles.map(role => ({
            invitation_id: invitation.id,
            role_id: role.roleId,
            location_id: role.locationId
          }))
        )

      if (rolesError) {
        throw new Error(`Failed to assign roles: ${rolesError.message}`)
      }
    }

    // Insert permission assignments
    if (invitationData.permissions.length > 0) {
      const { error: permissionsError } = await supabase
        .from('invitation_permissions')
        .insert(
          invitationData.permissions.map(perm => ({
            invitation_id: invitation.id,
            permission_id: perm.permissionId,
            location_id: perm.locationId
          }))
        )

      if (permissionsError) {
        throw new Error(`Failed to assign permissions: ${permissionsError.message}`)
      }
    }

    // Generate invitation link
    const invitationLink = `${SITE_URL}/onboarding?token=${token}`

    // Send email via Resend
    if (RESEND_API_KEY) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Pecora Negra <noreply@pecoranegra.fr>',
          to: [invitationData.email],
          subject: 'Welcome to Pecora Negra - Complete Your Profile',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                <div style="background: #000; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                  <div style="background: #fff; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                    <div style="background: #000; width: 15px; height: 15px; border-radius: 50%;"></div>
                  </div>
                </div>
                <h1 style="color: #000; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Pecora Negra</h1>
                <p style="color: #000; margin: 10px 0 0; opacity: 0.8;">Multi-Location Restaurant Management</p>
              </div>
              
              <div style="background: #fff; padding: 40px 20px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <h2 style="color: #111827; margin: 0 0 20px;">You've been invited!</h2>
                <p style="color: #6b7280; line-height: 1.6; margin: 0 0 20px;">
                  Hello ${invitationData.firstName} ${invitationData.lastName},
                </p>
                <p style="color: #6b7280; line-height: 1.6; margin: 0 0 30px;">
                  You've been invited to join the Pecora Negra team management system. 
                  Click the button below to complete your profile and get started.
                </p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${invitationLink}" 
                     style="background: #111827; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 500; display: inline-block;">
                    Complete Your Profile
                  </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px; margin: 30px 0 0;">
                  This invitation will expire on ${expiresAt.toLocaleDateString()}. 
                  If you have any questions, please contact your manager.
                </p>
                
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                
                <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
                  This email was sent by Pecora Negra Restaurant Management System.
                </p>
              </div>
            </div>
          `,
        }),
      })

      if (!emailResponse.ok) {
        const errorText = await emailResponse.text()
        console.error('Failed to send email:', errorText)
        // Don't throw error - invitation is created, email sending is secondary
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        invitation: {
          id: invitation.id,
          email: invitation.email,
          token: invitation.token,
          expires_at: invitation.expires_at,
          invitation_link: invitationLink
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in send-invitation function:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
