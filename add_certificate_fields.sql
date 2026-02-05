-- Agregar campos para certificados y asistencia
ALTER TABLE registrations 
ADD COLUMN IF NOT EXISTS attendance_confirmed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS attendance_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS attendance_code VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS certificate_generated BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS certificate_url TEXT,
ADD COLUMN IF NOT EXISTS certificate_generated_at TIMESTAMP;

-- Generar códigos de asistencia únicos para registros existentes
UPDATE registrations 
SET attendance_code = CONCAT('IASP-', UPPER(SUBSTRING(MD5(RANDOM()::text) FROM 1 FOR 8)))
WHERE attendance_code IS NULL;
