-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Italy',
  phone VARCHAR(50),
  email VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create roles table
CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0, -- Higher number = higher authority
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create permissions table
CREATE TABLE IF NOT EXISTS permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create role_permissions table
CREATE TABLE IF NOT EXISTS role_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(role_id, permission_id)
);

-- Create user_profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  can_invite_users BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles_locations table (many-to-many-to-many)
CREATE TABLE IF NOT EXISTS user_roles_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  UNIQUE(user_id, role_id, location_id)
);

-- Create user_permissions table (granular permissions override)
CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  granted BOOLEAN DEFAULT true, -- true = grant, false = revoke
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, permission_id, location_id)
);

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted_at TIMESTAMP WITH TIME ZONE,
  revoked_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invitation_roles_locations table
CREATE TABLE IF NOT EXISTS invitation_roles_locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  UNIQUE(invitation_id, role_id, location_id)
);

-- Create invitation_permissions table
CREATE TABLE IF NOT EXISTS invitation_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  UNIQUE(invitation_id, permission_id, location_id)
);

-- Enable RLS on all tables
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_roles_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_permissions ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invitations_updated_at BEFORE UPDATE ON invitations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Insert default locations
INSERT INTO locations (id, name, address, city, country, phone, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Rome Center', 'Via del Corso 123', 'Rome', 'Italy', '+39 06 1234567', 'rome@pecoranegra.fr'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Milan Brera', 'Via Brera 45', 'Milan', 'Italy', '+39 02 7654321', 'milan@pecoranegra.fr'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Florence Center', 'Piazza del Duomo 10', 'Florence', 'Italy', '+39 055 9876543', 'florence@pecoranegra.fr')
ON CONFLICT (id) DO NOTHING;

-- Insert roles with hierarchy levels
INSERT INTO roles (id, name, display_name, description, level) VALUES
  ('550e8400-e29b-41d4-a716-446655440010', 'admin', 'Admin', 'Full system access and management', 100),
  ('550e8400-e29b-41d4-a716-446655440011', 'general_manager', 'General Manager', 'Overall restaurant operations management', 90),
  ('550e8400-e29b-41d4-a716-446655440012', 'assistant_manager', 'Assistant Manager', 'Assists in daily operations management', 80),
  ('550e8400-e29b-41d4-a716-446655440013', 'chef_de_cuisine', 'Chef de Cuisine', 'Head chef responsible for kitchen operations', 70),
  ('550e8400-e29b-41d4-a716-446655440014', 'head_pizzaiolo', 'Head Pizzaiolo', 'Lead pizza chef', 65),
  ('550e8400-e29b-41d4-a716-446655440015', 'second_pizzaiolo', 'Second Pizzaiolo', 'Second pizza chef', 60),
  ('550e8400-e29b-41d4-a716-446655440016', 'commis_pizzaiolo', 'Commis Pizzaiolo', 'Junior pizza chef', 55),
  ('550e8400-e29b-41d4-a716-446655440017', 'floor_manager', 'Floor Manager', 'Front of house operations manager', 70),
  ('550e8400-e29b-41d4-a716-446655440018', 'chef_de_rang', 'Chef de Rang', 'Senior waiter/waitress', 50),
  ('550e8400-e29b-41d4-a716-446655440019', 'runner', 'Runner', 'Food runner and support staff', 30),
  ('550e8400-e29b-41d4-a716-446655440020', 'bartender', 'Bartender', 'Bar operations specialist', 45),
  ('550e8400-e29b-41d4-a716-446655440021', 'handyman', 'Handyman', 'Maintenance and repairs', 35),
  ('550e8400-e29b-41d4-a716-446655440022', 'dishwasher', 'Dishwasher', 'Kitchen cleaning and dishwashing', 20),
  ('550e8400-e29b-41d4-a716-446655440023', 'accountant', 'Accountant', 'Financial management and accounting', 75),
  ('550e8400-e29b-41d4-a716-446655440024', 'hr', 'HR', 'Human resources management', 75),
  ('550e8400-e29b-41d4-a716-446655440025', 'marketing', 'Marketing', 'Marketing and promotions', 60)
ON CONFLICT (name) DO NOTHING;

-- Insert permissions by category
INSERT INTO permissions (id, name, display_name, description, category) VALUES
  -- User Management
  ('650e8400-e29b-41d4-a716-446655440001', 'invite_users', 'Invite Users', 'Can invite new users to the system', 'user_management'),
  ('650e8400-e29b-41d4-a716-446655440002', 'manage_users', 'Manage Users', 'Can edit and manage user accounts', 'user_management'),
  ('650e8400-e29b-41d4-a716-446655440003', 'view_users', 'View Users', 'Can view user list and profiles', 'user_management'),
  ('650e8400-e29b-41d4-a716-446655440004', 'assign_roles', 'Assign Roles', 'Can assign roles to users', 'user_management'),
  
  -- Inventory Management
  ('650e8400-e29b-41d4-a716-446655440010', 'manage_inventory', 'Manage Inventory', 'Can add, edit, and delete inventory items', 'inventory'),
  ('650e8400-e29b-41d4-a716-446655440011', 'view_inventory', 'View Inventory', 'Can view inventory levels and items', 'inventory'),
  ('650e8400-e29b-41d4-a716-446655440012', 'update_stock', 'Update Stock', 'Can update stock levels', 'inventory'),
  
  -- Order Management
  ('650e8400-e29b-41d4-a716-446655440020', 'manage_orders', 'Manage Orders', 'Can create, edit, and manage supplier orders', 'orders'),
  ('650e8400-e29b-41d4-a716-446655440021', 'view_orders', 'View Orders', 'Can view order history and status', 'orders'),
  ('650e8400-e29b-41d4-a716-446655440022', 'approve_orders', 'Approve Orders', 'Can approve high-value orders', 'orders'),
  
  -- HACCP & Safety
  ('650e8400-e29b-41d4-a716-446655440030', 'manage_haccp', 'Manage HACCP', 'Can manage HACCP checklists and procedures', 'haccp'),
  ('650e8400-e29b-41d4-a716-446655440031', 'view_haccp', 'View HACCP', 'Can view HACCP reports and checklists', 'haccp'),
  ('650e8400-e29b-41d4-a716-446655440032', 'complete_checklists', 'Complete Checklists', 'Can complete safety checklists', 'haccp'),
  
  -- Maintenance
  ('650e8400-e29b-41d4-a716-446655440040', 'manage_maintenance', 'Manage Maintenance', 'Can schedule and manage maintenance tasks', 'maintenance'),
  ('650e8400-e29b-41d4-a716-446655440041', 'view_maintenance', 'View Maintenance', 'Can view maintenance schedules and history', 'maintenance'),
  
  -- Financial
  ('650e8400-e29b-41d4-a716-446655440050', 'view_financials', 'View Financials', 'Can view financial reports and data', 'financial'),
  ('650e8400-e29b-41d4-a716-446655440051', 'manage_financials', 'Manage Financials', 'Can manage financial data and reports', 'financial'),
  
  -- Settings
  ('650e8400-e29b-41d4-a716-446655440060', 'manage_settings', 'Manage Settings', 'Can modify system settings', 'settings'),
  ('650e8400-e29b-41d4-a716-446655440061', 'view_settings', 'View Settings', 'Can view system settings', 'settings')
ON CONFLICT (name) DO NOTHING;

-- Assign permissions to roles
INSERT INTO role_permissions (role_id, permission_id) VALUES
  -- Admin gets all permissions
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440001'), -- invite_users
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440002'), -- manage_users
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440003'), -- view_users
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440004'), -- assign_roles
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440010'), -- manage_inventory
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440011'), -- view_inventory
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440012'), -- update_stock
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440020'), -- manage_orders
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440021'), -- view_orders
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440022'), -- approve_orders
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440030'), -- manage_haccp
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440031'), -- view_haccp
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440032'), -- complete_checklists
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440040'), -- manage_maintenance
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440041'), -- view_maintenance
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440050'), -- view_financials
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440051'), -- manage_financials
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440060'), -- manage_settings
  ('550e8400-e29b-41d4-a716-446655440010', '650e8400-e29b-41d4-a716-446655440061'), -- view_settings
  
  -- General Manager permissions
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440001'), -- invite_users
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440003'), -- view_users
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440010'), -- manage_inventory
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440011'), -- view_inventory
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440020'), -- manage_orders
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440021'), -- view_orders
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440022'), -- approve_orders
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440030'), -- manage_haccp
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440031'), -- view_haccp
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440040'), -- manage_maintenance
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440041'), -- view_maintenance
  ('550e8400-e29b-41d4-a716-446655440011', '650e8400-e29b-41d4-a716-446655440050'), -- view_financials
  
  -- Chef de Cuisine permissions
  ('550e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440011'), -- view_inventory
  ('550e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440012'), -- update_stock
  ('550e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440021'), -- view_orders
  ('550e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440030'), -- manage_haccp
  ('550e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440031'), -- view_haccp
  ('550e8400-e29b-41d4-a716-446655440013', '650e8400-e29b-41d4-a716-446655440032') -- complete_checklists
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Create user profile for existing admin user
INSERT INTO user_profiles (id, first_name, last_name, can_invite_users)
SELECT id, 'Matias', 'Tonello', true
FROM auth.users 
WHERE email = 'matias@pecoranegra.fr'
ON CONFLICT (id) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  can_invite_users = EXCLUDED.can_invite_users;

-- Assign admin role to existing admin user for all locations
INSERT INTO user_roles_locations (user_id, role_id, location_id)
SELECT 
  u.id,
  '550e8400-e29b-41d4-a716-446655440010', -- admin role
  l.id
FROM auth.users u
CROSS JOIN locations l
WHERE u.email = 'matias@pecoranegra.fr'
ON CONFLICT (user_id, role_id, location_id) DO NOTHING;
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
