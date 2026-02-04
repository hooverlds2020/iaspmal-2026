-- Primero, deshabilitar RLS temporalmente para limpiar
ALTER TABLE registrations DISABLE ROW LEVEL SECURITY;

-- Eliminar TODAS las políticas existentes
DROP POLICY IF EXISTS "Permitir lectura pública" ON registrations;
DROP POLICY IF EXISTS "Permitir inserción pública" ON registrations;
DROP POLICY IF EXISTS "Permitir actualización admin" ON registrations;
DROP POLICY IF EXISTS "Permitir actualización para autenticados" ON registrations;
DROP POLICY IF EXISTS "Enable read access for all users" ON registrations;
DROP POLICY IF EXISTS "Enable insert for all users" ON registrations;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON registrations;

-- Habilitar RLS de nuevo
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;

-- Crear políticas nuevas y simples
-- 1. Permitir SELECT (lectura) para todos
CREATE POLICY "allow_select_all" 
ON registrations FOR SELECT 
TO public
USING (true);

-- 2. Permitir INSERT (inserción) para todos
CREATE POLICY "allow_insert_all" 
ON registrations FOR INSERT 
TO public
WITH CHECK (true);

-- 3. Permitir UPDATE (actualización) para usuarios autenticados
CREATE POLICY "allow_update_authenticated" 
ON registrations FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Permitir DELETE para usuarios autenticados
CREATE POLICY "allow_delete_authenticated" 
ON registrations FOR DELETE 
TO authenticated
USING (true);
