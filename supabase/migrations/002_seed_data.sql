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
