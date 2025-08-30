-- RLS Policies for RBAC system

-- Locations policies
CREATE POLICY "Users can view locations they have access to" ON locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      WHERE url.user_id = auth.uid() AND url.location_id = id AND url.is_active = true
    )
  );

CREATE POLICY "Admins can manage all locations" ON locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN roles r ON url.role_id = r.id
      WHERE url.user_id = auth.uid() AND r.name = 'admin' AND url.is_active = true
    )
  );

-- Roles policies (read-only for most users)
CREATE POLICY "Users can view roles" ON roles
  FOR SELECT USING (true);

-- Permissions policies (read-only for most users)
CREATE POLICY "Users can view permissions" ON permissions
  FOR SELECT USING (true);

CREATE POLICY "Users can view role permissions" ON role_permissions
  FOR SELECT USING (true);

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users with manage_users permission can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name IN ('manage_users', 'view_users')
        AND url.is_active = true
    )
  );

CREATE POLICY "Users with manage_users permission can update profiles" ON user_profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name = 'manage_users'
        AND url.is_active = true
    )
  );

CREATE POLICY "System can insert user profiles" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- User roles locations policies
CREATE POLICY "Users can view their own role assignments" ON user_roles_locations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users with view_users permission can view role assignments" ON user_roles_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name IN ('manage_users', 'view_users', 'assign_roles')
        AND url.is_active = true
    )
  );

CREATE POLICY "Users with assign_roles permission can manage role assignments" ON user_roles_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name = 'assign_roles'
        AND url.is_active = true
    )
  );

-- User permissions policies
CREATE POLICY "Users can view their own permissions" ON user_permissions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users with manage_users permission can view all permissions" ON user_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name IN ('manage_users', 'assign_roles')
        AND url.is_active = true
    )
  );

CREATE POLICY "Users with assign_roles permission can manage permissions" ON user_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name = 'assign_roles'
        AND url.is_active = true
    )
  );

-- Invitations policies
CREATE POLICY "Users with invite_users permission can view invitations" ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name = 'invite_users'
        AND url.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.can_invite_users = true
    )
  );

CREATE POLICY "Users with invite_users permission can manage invitations" ON invitations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name = 'invite_users'
        AND url.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.can_invite_users = true
    )
  );

-- Invitation roles locations policies
CREATE POLICY "Users with invite_users permission can view invitation roles" ON invitation_roles_locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name = 'invite_users'
        AND url.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.can_invite_users = true
    )
  );

CREATE POLICY "Users with invite_users permission can manage invitation roles" ON invitation_roles_locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name = 'invite_users'
        AND url.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.can_invite_users = true
    )
  );

-- Invitation permissions policies
CREATE POLICY "Users with invite_users permission can view invitation permissions" ON invitation_permissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name = 'invite_users'
        AND url.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.can_invite_users = true
    )
  );

CREATE POLICY "Users with invite_users permission can manage invitation permissions" ON invitation_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles_locations url
      JOIN role_permissions rp ON url.role_id = rp.role_id
      JOIN permissions p ON rp.permission_id = p.id
      WHERE url.user_id = auth.uid() 
        AND p.name = 'invite_users'
        AND url.is_active = true
    ) OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid() AND up.can_invite_users = true
    )
  );
