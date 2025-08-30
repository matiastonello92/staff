'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocations, useRoles, usePermissions } from '@/lib/hooks/useRBAC'
import { UserPlus, MapPin, Shield, Key, Eye, Send } from 'lucide-react'
import { PERMISSION_CATEGORIES } from '@/lib/types/rbac'
import type { InviteUserForm } from '@/lib/types/rbac'

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onInvite: (data: InviteUserForm) => Promise<void>
}

export default function InviteUserDialog({ open, onOpenChange, onInvite }: InviteUserDialogProps) {
  const { locations } = useLocations()
  const { roles } = useRoles()
  const { permissions } = usePermissions()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<InviteUserForm>({
    email: '',
    firstName: '',
    lastName: '',
    locations: [],
    roles: [],
    permissions: [],
    notes: '',
    expiresInDays: 7
  })

  const resetForm = () => {
    setFormData({
      email: '',
      firstName: '',
      lastName: '',
      locations: [],
      roles: [],
      permissions: [],
      notes: '',
      expiresInDays: 7
    })
    setCurrentStep(1)
  }

  const handleLocationToggle = (locationId: string) => {
    setFormData(prev => ({
      ...prev,
      locations: prev.locations.includes(locationId)
        ? prev.locations.filter(id => id !== locationId)
        : [...prev.locations, locationId],
      // Remove roles and permissions for unselected locations
      roles: prev.roles.filter(role => 
        locationId === role.locationId ? false : prev.locations.includes(role.locationId)
      ),
      permissions: prev.permissions.filter(perm => 
        locationId === perm.locationId ? false : prev.locations.includes(perm.locationId)
      )
    }))
  }

  const handleRoleToggle = (locationId: string, roleId: string) => {
    const roleKey = `${locationId}-${roleId}`
    const existingIndex = formData.roles.findIndex(
      role => role.locationId === locationId && role.roleId === roleId
    )

    setFormData(prev => ({
      ...prev,
      roles: existingIndex >= 0
        ? prev.roles.filter((_, index) => index !== existingIndex)
        : [...prev.roles, { locationId, roleId }]
    }))
  }

  const handlePermissionToggle = (locationId: string, permissionId: string) => {
    const existingIndex = formData.permissions.findIndex(
      perm => perm.locationId === locationId && perm.permissionId === permissionId
    )

    setFormData(prev => ({
      ...prev,
      permissions: existingIndex >= 0
        ? prev.permissions.filter((_, index) => index !== existingIndex)
        : [...prev.permissions, { locationId, permissionId }]
    }))
  }

  const getLocationName = (locationId: string) => {
    return locations.find(loc => loc.id === locationId)?.name || 'Unknown Location'
  }

  const getRoleName = (roleId: string) => {
    return roles.find(role => role.id === roleId)?.display_name || 'Unknown Role'
  }

  const getPermissionName = (permissionId: string) => {
    return permissions.find(perm => perm.id === permissionId)?.display_name || 'Unknown Permission'
  }

  const groupPermissionsByCategory = () => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    }, {} as Record<string, typeof permissions>)
  }

  const canProceedToStep2 = formData.email && formData.firstName && formData.lastName
  const canProceedToStep3 = formData.locations.length > 0
  const canSendInvitation = formData.roles.length > 0 || formData.permissions.length > 0

  const handleSendInvitation = async () => {
    if (!canSendInvitation) return

    setLoading(true)
    try {
      await onInvite(formData)
      resetForm()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to send invitation:', error)
    } finally {
      setLoading(false)
    }
  }

  const permissionsByCategory = groupPermissionsByCategory()

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm()
      onOpenChange(newOpen)
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserPlus className="h-5 w-5" />
            <span>Invite New User</span>
          </DialogTitle>
          <DialogDescription>
            Send an invitation to join the Pecora Negra team
          </DialogDescription>
        </DialogHeader>

        <Tabs value={`step-${currentStep}`} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="step-1" disabled={currentStep < 1}>
              1. Basic Info
            </TabsTrigger>
            <TabsTrigger value="step-2" disabled={currentStep < 2}>
              2. Locations & Roles
            </TabsTrigger>
            <TabsTrigger value="step-3" disabled={currentStep < 3}>
              3. Review & Send
            </TabsTrigger>
          </TabsList>

          {/* Step 1: Basic Information */}
          <TabsContent value="step-1" className="space-y-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <Label htmlFor="expiresInDays">Invitation Expires In</Label>
                <Select 
                  value={formData.expiresInDays?.toString()} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, expiresInDays: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days (default)</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any additional notes for the invitee"
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          {/* Step 2: Locations & Roles */}
          <TabsContent value="step-2" className="space-y-6">
            <div className="space-y-6">
              {/* Location Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Select Locations</span>
                  </CardTitle>
                  <CardDescription>
                    Choose which locations this user will have access to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3">
                    {locations.map((location) => (
                      <div key={location.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`location-${location.id}`}
                          checked={formData.locations.includes(location.id)}
                          onCheckedChange={() => handleLocationToggle(location.id)}
                        />
                        <Label htmlFor={`location-${location.id}`} className="flex-1">
                          <div className="font-medium">{location.name}</div>
                          <div className="text-sm text-gray-500">{location.address}</div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Role Assignment */}
              {formData.locations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Assign Roles</span>
                    </CardTitle>
                    <CardDescription>
                      Assign roles for each selected location
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {formData.locations.map((locationId) => (
                        <div key={locationId}>
                          <h4 className="font-medium mb-3">{getLocationName(locationId)}</h4>
                          <div className="grid gap-2 pl-4">
                            {roles.map((role) => (
                              <div key={role.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`role-${locationId}-${role.id}`}
                                  checked={formData.roles.some(
                                    r => r.locationId === locationId && r.roleId === role.id
                                  )}
                                  onCheckedChange={() => handleRoleToggle(locationId, role.id)}
                                />
                                <Label htmlFor={`role-${locationId}-${role.id}`} className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span>{role.display_name}</span>
                                    <Badge variant="outline" className="text-xs">
                                      Level {role.level}
                                    </Badge>
                                  </div>
                                  {role.description && (
                                    <div className="text-sm text-gray-500">{role.description}</div>
                                  )}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Additional Permissions */}
              {formData.locations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Key className="h-4 w-4" />
                      <span>Additional Permissions (Optional)</span>
                    </CardTitle>
                    <CardDescription>
                      Grant specific permissions beyond role-based permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue={Object.keys(permissionsByCategory)[0]} className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        {Object.entries(PERMISSION_CATEGORIES).slice(0, 4).map(([key, label]) => (
                          <TabsTrigger key={key} value={key} className="text-xs">
                            {label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                      
                      {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
                        <TabsContent key={category} value={category} className="space-y-4">
                          {formData.locations.map((locationId) => (
                            <div key={locationId}>
                              <h5 className="font-medium mb-2">{getLocationName(locationId)}</h5>
                              <div className="grid gap-2 pl-4">
                                {categoryPermissions.map((permission) => (
                                  <div key={permission.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`perm-${locationId}-${permission.id}`}
                                      checked={formData.permissions.some(
                                        p => p.locationId === locationId && p.permissionId === permission.id
                                      )}
                                      onCheckedChange={() => handlePermissionToggle(locationId, permission.id)}
                                    />
                                    <Label htmlFor={`perm-${locationId}-${permission.id}`} className="flex-1">
                                      <div>{permission.display_name}</div>
                                      {permission.description && (
                                        <div className="text-sm text-gray-500">{permission.description}</div>
                                      )}
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </TabsContent>
                      ))}
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Step 3: Review & Send */}
          <TabsContent value="step-3" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span>Review Invitation</span>
                </CardTitle>
                <CardDescription>
                  Please review the invitation details before sending
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium">Invitee Information</h4>
                  <p className="text-sm text-gray-600">
                    {formData.firstName} {formData.lastName} ({formData.email})
                  </p>
                  <p className="text-sm text-gray-500">
                    Expires in {formData.expiresInDays} days
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">Assigned Roles</h4>
                  <div className="space-y-2">
                    {formData.roles.map((role, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <span className="text-sm">
                          {getLocationName(role.locationId)}: {getRoleName(role.roleId)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.permissions.length > 0 && (
                  <div>
                    <h4 className="font-medium">Additional Permissions</h4>
                    <div className="space-y-2">
                      {formData.permissions.map((permission, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Key className="h-3 w-3 text-gray-400" />
                          <span className="text-sm">
                            {getLocationName(permission.locationId)}: {getPermissionName(permission.permissionId)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {formData.notes && (
                  <div>
                    <h4 className="font-medium">Notes</h4>
                    <p className="text-sm text-gray-600">{formData.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            
            {currentStep < 3 ? (
              <Button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={
                  (currentStep === 1 && !canProceedToStep2) ||
                  (currentStep === 2 && !canProceedToStep3)
                }
              >
                Next
              </Button>
            ) : (
              <Button 
                onClick={handleSendInvitation}
                disabled={!canSendInvitation || loading}
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Sending...' : 'Send Invitation'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
