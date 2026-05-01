const fs = require('fs');
const filePath = '/home/rsilvano/dockerdata/iaspmal_2026/src/App.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Primero, quitamos la entrada original de Instituciones Convocantes (está al final)
content = content.replace(/ \/\/ --- NUEVO NIVEL: INSTITUCIONES CONVOCANTES ---\n\s*{ id: 'instituciones-convocantes', label: 'Instituciones convocantes', label_pt: 'Instituições convocantes' },\n/, '');

// Ahora, buscamos 'presentaciones-libros' y agregamos Instituciones justo debajo
content = content.replace(
  /{ id: 'presentaciones-libros', label: 'Presentaciones de libros', label_pt: 'Apresentações de livros' },/,
  "{ id: 'presentaciones-libros', label: 'Presentaciones de libros', label_pt: 'Apresentações de livros' },\n    { id: 'instituciones-convocantes', label: 'Instituciones convocantes', label_pt: 'Instituições convocantes' },"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Menú actualizado con éxito.');
