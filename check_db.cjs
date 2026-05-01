const { createClient } = require('@supabase/supabase-client');
const fs = require('fs');

// Asumiendo que tus credenciales están en un archivo .env o las tienes a la mano
// Para esta prueba rápida, las leeremos del archivo de configuración si es posible
// O si prefieres, simplemente revisa el tipo de dato con este SQL:

console.log("Ejecuta este SQL en el 'SQL Editor' de Supabase para estar seguro:");
console.log("------------------------------------------------------------------");
console.log("SELECT column_name, data_type, check_clause ");
console.log("FROM information_schema.columns c ");
console.log("LEFT JOIN information_schema.check_constraints cc ON c.table_name = 'registrations' ");
console.log("WHERE c.table_name = 'registrations' AND column_name = 'payment_currency';");
console.log("------------------------------------------------------------------");
