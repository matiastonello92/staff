'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRoles, usePermissions, useUserPermissions } from '@/lib/hooks/useRBAC'
import { Shield, Users, Key, Info } from 'lucide-react'
import { PERMISSION_CATEGORIES } from '@/lib/types/rbac'
import type { Role, Permission } from '@/lib/types/rbac'

export default function RolesPage() {
  const { roles, loading: rolesLoading } = useRoles()
  const { permissions, loading: permissionsLoading } = usePermissions()
  const { hasPermission } = useUserPermissions()
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const canViewSettings = hasPermission('view_settings')

  if (!canViewSettings) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-500">You don't have permission to view roles and permissions.</p>
        </div>
      </div>
    )
  }

  const groupPermissionsByCategory = (permissions: Permission[]) => {
    return permissions.reduce((acc, permission) => {
      if (!acc[permission.category]) {
        acc[permission.category] = []
      }
      acc[permission.category].push(permission)
      return acc
    }, {} as Record<string, Permission[]>)
  }

  const getRoleLevel = (level: number) => {
    if (level >= 90) return { label: 'Executive', color: 'bg-purple-100 text-purple-800' }
    if (level >= 70) return { label: 'Management', color: 'bg-blue-100 text-blue-800' }
    if (level >= 50) return { label: 'Supervisor', color: 'bg-green-100 text-green-800' }
    if (level >= 30) return { label: 'Staff', color: 'bg-yellow-100 text-yellow-800' }
    return { label: 'Entry Level', color: 'bg-gray-100 text-gray-800' }
  }

  if (rolesLoading || permissionsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600">View system roles and their associated permissions</p>
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  const permissionsByCategory = groupPermissionsByCategory(permissions)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
        <p className="text-gray-600">View system roles and their associated permissions</p>
      </div>

      <Tabs defaultValue="roles" className="space-y-6">
        <TabsList>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Roles</span>
          </TabsTrigger>
          <TabsTrigger value="permissions" className="flex items-center space-x-2">
            <Key className="h-4 w-4" />
            <span>Permissions</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => {
              const levelInfo = getRoleLevel(role.level)
              
              return (
                <Card 
                  key={role.id} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedRole?.id === role.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{role.display_name}</CardTitle>
                      <Badge className={levelInfo.color}>
                        {levelInfo.label}
                      </Badge>
                    </div>
                    <CardDescription>{role.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Authority Level</span>
                      <span className="font-medium">{role.level}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {selectedRole && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>{selectedRole.display_name} Permissions</span>
                </CardTitle>
                <CardDescription>
                  Permissions automatically granted to users with this role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start space-x-2">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        Role-based Permissions
                      </p>
                      <p className="text-sm text-blue-700">
                        These permissions are automatically assigned based on the role. 
                        Individual users can have additional granular permissions granted or revoked.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="text-center text-gray-500 py-8">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Role permission mapping will be implemented in the next phase</p>
                  <p className="text-sm">Currently showing role hierarchy and structure</p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="permissions" className="space-y-6">
          {Object.entries(permissionsByCategory).map(([category, categoryPermissions]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Key className="h-5 w-5" />
                  <span>{PERMISSION_CATEGORIES[category as keyof typeof PERMISSION_CATEGORIES] || category}</span>
                </CardTitle>
                <CardDescription>
                  {categoryPermissions.length} permissions in this category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {categoryPermissions.map((permission) => (
                    <div 
                      key={permission.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{permission.display_name}</h4>
                        <Badge variant="outline" className="text-xs">
                          {permission.name}
                        </Badge>
                      </div>
                      {permission.description && (
                        <p className="text-sm text-gray-600">{permission.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
