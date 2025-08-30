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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useUsers, useLocations, useRoles, useUserPermissions } from '@/lib/hooks/useRBAC'
import { Search, UserPlus, Edit, Trash2, Shield, MapPin } from 'lucide-react'
import InviteUserDialog from '@/components/invitations/InviteUserDialog'
import { sendInvitation } from '@/lib/api/invitations'
import type { UserWithDetails } from '@/lib/types/rbac'

export default function UsersPage() {
  const { users, loading, error, refetch } = useUsers()
  const { locations } = useLocations()
  const { roles } = useRoles()
  const { hasPermission } = useUserPermissions()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<UserWithDetails | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)

  const canManageUsers = hasPermission('manage_users')
  const canViewUsers = hasPermission('view_users') || canManageUsers

  if (!canViewUsers) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view users.</p>
        </div>
      </div>
    )
  }

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase()
    return (
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower)
    )
  })

  const getUserRolesByLocation = (user: UserWithDetails) => {
    const rolesByLocation: Record<string, string[]> = {}
    
    user.roles.forEach(role => {
      if (!rolesByLocation[role.location_id]) {
        rolesByLocation[role.location_id] = []
      }
      if (role.role) {
        rolesByLocation[role.location_id].push(role.role.display_name)
      }
    })
    
    return rolesByLocation
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

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Unknown Location'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="text-gray-600">Manage team members and their permissions</p>
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
          <div className="text-red-500 mb-4">Error loading users</div>
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
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage team members and their permissions</p>
        </div>
        {canManageUsers && (
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members ({filteredUsers.length})</CardTitle>
          <CardDescription>
            All users with their assigned roles and locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Locations & Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                const rolesByLocation = getUserRolesByLocation(user)
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">
                        {user.first_name} {user.last_name}
                      </div>
                      {user.phone && (
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {Object.entries(rolesByLocation).map(([locationId, roleNames]) => (
                          <div key={locationId} className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span className="text-sm font-medium">
                              {getLocationName(locationId)}:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {roleNames.map((roleName, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {roleName}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_active ? "default" : "secondary"}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        {canManageUsers && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user)
                                setIsEditSheetOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
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

      {/* Edit User Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
            <SheetDescription>
              Update user information and permissions
            </SheetDescription>
          </SheetHeader>
          {selectedUser && (
            <div className="space-y-6 mt-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">First Name</label>
                  <Input defaultValue={selectedUser.first_name || ''} />
                </div>
                <div>
                  <label className="text-sm font-medium">Last Name</label>
                  <Input defaultValue={selectedUser.last_name || ''} />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input defaultValue={selectedUser.phone || ''} />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select defaultValue={selectedUser.is_active ? "active" : "inactive"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsInviteDialogOpen(true)}>Save Changes</Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Invite User Dialog */}
      <InviteUserDialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        onInvite={handleInviteUser}
      />
    </div>
  )
}
