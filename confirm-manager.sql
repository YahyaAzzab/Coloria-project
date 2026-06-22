-- Exécutez cette commande dans l'éditeur SQL de Supabase pour confirmer l'email du manager sans avoir à cliquer sur le lien envoyé par email.

UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'managercoloria@gmail.com';
