'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useInvitations, useLocations, useRoles, useUserPermissions } from '@/lib/hooks/useRBAC'
import { Search, Send, X, RotateCcw, Shield, MapPin, Clock } from 'lucide-react'
import InviteUserDialog from '@/components/invitations/InviteUserDialog'
import { sendInvitation, resendInvitation, revokeInvitation } from '@/lib/api/invitations'
import type { InvitationWithDetails } from '@/lib/types/rbac'

export default function InvitationsPage() {
  const { invitations, loading, error, refetch } = useInvitations()
  const { locations } = useLocations()
  const { roles } = useRoles()
  const { hasPermission } = useUserPermissions()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvitation, setSelectedInvitation] = useState<InvitationWithDetails | null>(null)
  const [actionDialog, setActionDialog] = useState<{
    open: boolean
    type: 'resend' | 'revoke' | null
    invitation: InvitationWithDetails | null
  }>({
    open: false,
    type: null,
    invitation: null
  })
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  const canInviteUsers = hasPermission('invite_users')

  if (!canInviteUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to manage invitations.</p>
        </div>
      </div>
    )
  }

  const filteredInvitations = invitations.filter(invitation => {
    const searchLower = searchTerm.toLowerCase()
    return (
      invitation.email.toLowerCase().includes(searchLower) ||
      invitation.first_name?.toLowerCase().includes(searchLower) ||
      invitation.last_name?.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: { variant: 'default' as const, color: 'bg-yellow-100 text-yellow-800' },
      accepted: { variant: 'default' as const, color: 'bg-green-100 text-green-800' },
      expired: { variant: 'secondary' as const, color: 'bg-gray-100 text-gray-800' },
      revoked: { variant: 'destructive' as const, color: 'bg-red-100 text-red-800' }
    }
    
    return variants[status as keyof typeof variants] || variants.pending
  }

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Unknown Location'
  }

  const getRoleName = (roleId: string) => {
    return roles.find(role => role.id === roleId)?.display_name || 'Unknown Role'
  }

  const isExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  const handleInviteUser = async (data: any) => {
    try {
      const result = await sendInvitation(data)
      if (result.success) {
        refetch()
      } else {
        console.error("Failed to send invitation:", result.error)
      }
    } catch (error) {
      console.error("Error sending invitation:", error)
    }
  }

  const handleResendInvitation = async (invitation: InvitationWithDetails) => {
    try {
      const result = await resendInvitation(invitation.id)
      if (result.success) {
        refetch()
      } else {
        console.error("Failed to resend invitation:", result.error)
      }
    } catch (error) {
      console.error("Error resending invitation:", error)
    }
    console.log('Resending invitation:', invitation.id)
    setActionDialog({ open: false, type: null, invitation: null })
    refetch()
  }

  const handleRevokeInvitation = async (invitation: InvitationWithDetails) => {
    try {
      const result = await revokeInvitation(invitation.id)
      if (result.success) {
        refetch()
      } else {
        console.error("Failed to revoke invitation:", result.error)
      }
    } catch (error) {
      console.error("Error revoking invitation:", error)
    }
    console.log('Revoking invitation:', invitation.id)
    setActionDialog({ open: false, type: null, invitation: null })
    refetch()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
            <p className="text-gray-600">Manage pending and sent invitations</p>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-red-500 mb-4">Error loading invitations</div>
          <Button onClick={refetch}>Try Again</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invitations</h1>
          <p className="text-gray-600">Manage pending and sent invitations</p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)}>
          <Send className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search invitations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Invitations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Sent Invitations ({filteredInvitations.length})</CardTitle>
          <CardDescription>
            Track the status of all sent invitations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invitee</TableHead>
                <TableHead>Locations & Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvitations.map((invitation) => {
                const statusInfo = getStatusBadge(invitation.status)
                const expired = isExpired(invitation.expires_at)
                
                return (
                  <TableRow key={invitation.id}>
                    <TableCell>
                      <div className="font-medium">
                        {invitation.first_name} {invitation.last_name}
                      </div>
                      <div className="text-sm text-gray-500">{invitation.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {invitation.roles.map((roleLocation) => (
                          <div key={`${roleLocation.role_id}-${roleLocation.location_id}`} 
                               className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm">
                              {getLocationName(roleLocation.location_id)}:
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {getRoleName(roleLocation.role_id)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={statusInfo.variant}
                        className={expired && invitation.status === 'pending' ? 'bg-red-100 text-red-800' : ''}
                      >
                        {expired && invitation.status === 'pending' ? 'Expired' : invitation.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(invitation.created_at)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">{formatDate(invitation.expires_at)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {invitation.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActionDialog({
                              open: true,
                              type: 'resend',
                              invitation
                            })}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        {invitation.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActionDialog({
                              open: true,
                              type: 'revoke',
                              invitation
                            })}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => 
        setActionDialog({ open, type: null, invitation: null })
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.type === 'resend' ? 'Resend Invitation' : 'Revoke Invitation'}
            </DialogTitle>
            <DialogDescription>
              {actionDialog.type === 'resend' 
                ? `Are you sure you want to resend the invitation to ${actionDialog.invitation?.email}? This will generate a new invitation link.`
                : `Are you sure you want to revoke the invitation for ${actionDialog.invitation?.email}? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setActionDialog({ open: false, type: null, invitation: null })}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.type === 'revoke' ? 'destructive' : 'default'}
              onClick={() => {
                if (actionDialog.invitation) {
                  if (actionDialog.type === 'resend') {
                    handleResendInvitation(actionDialog.invitation)
                  } else {
                    handleRevokeInvitation(actionDialog.invitation)
                  }
                }
              }}
            >
              {actionDialog.type === 'resend' ? 'Resend' : 'Revoke'}
            </Button>
          </DialogFooter>
        </DialogContent>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInvite={handleInviteUser}
      />
      </Dialog>
    </div>
  )
}
