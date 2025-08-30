-- Aggiorna l'ID dell'utente admin per farlo corrispondere a Supabase Auth
UPDATE user_profiles 
SET id = 'd4d256ba-390c-4712-981e-319516634b55'
WHERE email = 'matias@pecoranegra.fr';

UPDATE user_roles_locations 
SET user_id = 'd4d256ba-390c-4712-981e-319516634b55'
WHERE user_id = '550e8400-e29b-41d4-a716-446655440000';
