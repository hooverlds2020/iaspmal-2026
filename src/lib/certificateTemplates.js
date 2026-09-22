// src/lib/certificateTemplates.js
// Lógica compartida para generar el texto y el PDF de las constancias,
// usada tanto por el panel admin (CertificatesManager) como por la
// página pública de descarga (CertificateDownload).
import { jsPDF } from 'jspdf';

export const CERT_TYPES = [
  { value: 'ponente', label: 'Ponente' },
  { value: 'coordinador', label: 'Coordinador/a de Simposio' },
  { value: 'moderador', label: 'Moderador/a de Mesa' },
  { value: 'estelar', label: 'Actuación Estelar' },
  { value: 'conversatorio', label: 'Participante en Conversatorio' },
  { value: 'concierto', label: 'Participante en Concierto' },
  { value: 'publicacion', label: 'Presentación de Publicación' },
  { value: 'logistica', label: 'Apoyo Logístico' },
  { value: 'coordinacion_congreso', label: 'Coordinación del Congreso' },
  { value: 'comite_organizador', label: 'Comité Organizador' },
];

export const certTypeLabel = (value) => CERT_TYPES.find(t => t.value === value)?.label || value;

const stripSurroundingQuotes = (text) => {
  if (!text) return text;
  // Normaliza saltos de línea y espacios múltiples a un solo espacio
  // (algunos títulos vienen con \n pegados en medio del texto, no solo al final)
  const normalized = text.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  // El título completo SIEMPRE se envuelve aparte en comillas dobles al
  // mostrarse (ver wrapInQuotes), así que cualquier comilla doble que ya
  // traiga el título -- ya sea al inicio, al final o en medio (por ejemplo
  // una sola palabra entrecomillada) -- se convierte a comilla simple.
  // Así se evita adivinar si una comilla "envuelve todo el título" o no.
  return normalized.replace(/[\u0022\u201C\u201D]/g, "'");
};

// Construye la lista de "runs" (fragmentos con estilo) que forman el párrafo
// principal de la constancia: "a NOMBRE por haber participado con la ponencia
// "TÍTULO", en el simposio SIMPOSIO, de su XVII Congreso...", con negritas en
// el nombre y el título de ponencia, y cursivas en el título del simposio —
// tal como en la plantilla oficial de Word.
// Envuelve el título entre comillas dobles, agregando un espacio si el
// título ya termina o empieza con comilla simple (evita que queden pegadas
// como 'regionalizadas'" y se confundan con una sola marca).
const wrapInQuotes = (title) => {
  const startsWithQuote = title.startsWith("'");
  const endsWithQuote = title.endsWith("'");
  return `"${startsWithQuote ? ' ' : ''}${title}${endsWithQuote ? ' ' : ''}"`;
};

export const buildCertificateText = (cert) => {
  const nombre = cert.participant_name || '[nombre]';
  const presentationTitle = stripSurroundingQuotes(cert.presentation_title) || '[título de la ponencia]';
  const simposio = cert.symposium_title || '[título del simposio]';
  const fechas = 'de su XVII Congreso, celebrado en San Cristóbal de Las Casas, México, del 28 de septiembre al 2 de octubre de 2026';
  const fechasChis = fechas.replace('México,', 'Chiapas,');
  const temaGeneral = 'cuyo tema general fue "Ética, política y música popular"';
  const intro = 'La rama latinoamericana de la Asociación Internacional para el Estudio de la Música Popular otorga la presente';

  const runA = { t: 'a ', b: false, i: false };
  const runNombre = { t: nombre + ' ', b: true, i: false };

  let rest;
  switch (cert.certificate_type) {
    case 'ponente':
      rest = [
        { t: 'por haber participado con la ponencia ', b: false, i: false },
        { t: `${wrapInQuotes(presentationTitle)},`, b: false, i: false },
        { t: ' en el simposio ', b: false, i: false },
        { t: simposio, b: false, i: true },
        { t: `, ${fechas}.`, b: false, i: false },
      ];
      break;
    case 'coordinador':
      rest = [
        { t: 'por haber coordinado el simposio ', b: false, i: false },
        { t: simposio, b: false, i: true },
        { t: `, ${fechasChis}, ${temaGeneral}.`, b: false, i: false },
      ];
      break;
    case 'moderador':
      rest = [
        { t: 'por haber moderado la mesa del simposio ', b: false, i: false },
        { t: simposio, b: false, i: true },
        { t: `, ${fechasChis}.`, b: false, i: false },
      ];
      break;
    case 'estelar':
      rest = [
        { t: 'por haber participado en el ', b: false, i: false },
        { t: simposio, b: false, i: true },
        { t: `, ${fechasChis}, ${temaGeneral}.`, b: false, i: false },
      ];
      break;
    case 'conversatorio':
      rest = [
        { t: 'por haber participado en el conversatorio ', b: false, i: false },
        { t: simposio, b: false, i: true },
        { t: `, ${fechasChis}, ${temaGeneral}.`, b: false, i: false },
      ];
      break;
    case 'concierto':
      rest = [
        { t: 'por haber participado en el concierto ', b: false, i: false },
        { t: simposio, b: false, i: true },
        { t: `, ${fechasChis}, ${temaGeneral}.`, b: false, i: false },
      ];
      break;
    case 'publicacion':
      rest = [
        { t: 'por haber presentado la publicación ', b: false, i: false },
        { t: `${wrapInQuotes(presentationTitle)},`, b: false, i: false },
        { t: ` ${fechasChis}, ${temaGeneral}.`, b: false, i: false },
      ];
      break;
    case 'logistica':
      rest = [{ t: `por su valioso apoyo logístico durante ${fechasChis}, ${temaGeneral}.`, b: false, i: false }];
      break;
    case 'coordinacion_congreso':
      rest = [{ t: `por su labor de coordinación general del XVII Congreso, ${fechasChis}, ${temaGeneral}.`, b: false, i: false }];
      break;
    case 'comite_organizador':
      rest = [{ t: `por su participación como integrante del Comité Organizador del XVII Congreso, ${fechasChis}, ${temaGeneral}.`, b: false, i: false }];
      break;
    default:
      rest = [{ t: '.', b: false, i: false }];
  }

  const runs = [runA, runNombre, ...rest];
  return { intro, titulo: 'CONSTANCIA', nombre, runs };
};

// Convierte una lista de runs (fragmentos con estilo) en una lista de tokens
// palabra por palabra, uniendo signos de puntuación sueltos a la palabra
// anterior (para que no quede un espacio antes de una coma o punto).
const tokenizeRuns = (runs) => {
  const tokens = [];
  runs.forEach(run => {
    run.t.split(' ').forEach(word => {
      if (word === '') return;
      tokens.push({ text: word, b: run.b, i: run.i });
    });
  });
  for (let idx = 1; idx < tokens.length; idx++) {
    if (/^[,.;:]+$/.test(tokens[idx].text)) {
      tokens[idx - 1].text += tokens[idx].text;
      tokens.splice(idx, 1);
      idx--;
    }
  }
  return tokens;
};

// Dibuja un párrafo con estilos mixtos (negritas/cursivas por palabra),
// justificado (ambos márgenes parejos, salvo la última línea), con salto
// de línea automático. Devuelve la coordenada Y donde terminó.
const drawRichParagraph = (doc, runs, x, yStart, maxWidth, lineHeight) => {
  const tokens = tokenizeRuns(runs);
  const spaceWidth = doc.getTextWidth(' ');

  // Primera pasada: medir cada token con su estilo real y agrupar en líneas
  const measured = tokens.map(tok => {
    doc.setFont('helvetica', tok.i ? 'italic' : (tok.b ? 'bold' : 'normal'));
    return { ...tok, width: doc.getTextWidth(tok.text) };
  });

  const lines = [];
  let current = [];
  let curWidth = 0;
  measured.forEach(tok => {
    const projected = curWidth === 0 ? tok.width : curWidth + spaceWidth + tok.width;
    if (projected > maxWidth && current.length > 0) {
      lines.push(current);
      current = [];
      curWidth = 0;
    }
    current.push(tok);
    curWidth = curWidth === 0 ? tok.width : curWidth + spaceWidth + tok.width;
  });
  if (current.length) lines.push(current);

  // Segunda pasada: dibujar, justificando todas las líneas menos la última
  let cy = yStart;
  lines.forEach((line, li) => {
    const isLast = li === lines.length - 1;
    const naturalWidth = line.reduce((s, t) => s + t.width, 0) + spaceWidth * (line.length - 1);
    const extraSpace = (!isLast && line.length > 1) ? (maxWidth - naturalWidth) / (line.length - 1) : 0;
    let cx = x;
    line.forEach(tok => {
      doc.setFont('helvetica', tok.i ? 'italic' : (tok.b ? 'bold' : 'normal'));
      doc.text(tok.text, cx, cy);
      cx += tok.width + spaceWidth + extraSpace;
    });
    cy += lineHeight;
  });
  return cy;
};

const loadImageAsDataUrl = (url) => new Promise((resolve, reject) => {
  fetch(url)
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    })
    .catch(reject);
});

// URL pública del fondo de la plantilla, administrable desde el panel
// (Admin → Constancias → Plantilla de diseño). Se guarda en el bucket
// de Storage 'constancias-assets' con nombre fijo 'plantilla-fondo.jpg'.
export const TEMPLATE_BACKGROUND_URL = 'https://rvpovifwugksrsmgabcj.supabase.co/storage/v1/object/public/constancias-assets/plantilla-fondo.jpg';

// Genera el PDF oficial (sin marca de "vista previa"), listo para el público.
// mode: 'open' abre en pestaña nueva; 'download' fuerza descarga con nombre de archivo.
export const generateOfficialCertificatePDF = async (cert, mode = 'open') => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const t = buildCertificateText(cert);
  const pageWidth = 297, pageHeight = 210;

  try {
    // Cache-busting para que un reemplazo de la imagen se refleje de inmediato
    const bgDataUrl = await loadImageAsDataUrl(`${TEMPLATE_BACKGROUND_URL}?t=${Date.now()}`);
    doc.addImage(bgDataUrl, 'JPEG', 0, 0, pageWidth, pageHeight);
  } catch (e) {
    console.error('No se pudo cargar el fondo de la plantilla:', e);
  }

  const marginX = 55;
  const textWidth = pageWidth - marginX * 2;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(40, 40, 40);
  const introWrapped = doc.splitTextToSize(t.intro, textWidth);
  doc.text(introWrapped, marginX, 68, { align: 'justify', maxWidth: textWidth, lineHeightFactor: 1.3 });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 95);
  doc.text(t.titulo, 148.5, 90, { align: 'center' });

  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  drawRichParagraph(doc, t.runs, marginX, 105, textWidth, 7.2);

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Folio: ${cert.folio || '(sin folio)'} — Autenticidad verificable en iaspmal2026.com/constancias`, 148.5, 207, { align: 'center' });

  if (mode === 'download') {
    doc.save(`Constancia_${(cert.participant_name || 'participante').replace(/\s+/g, '_')}_${certTypeLabel(cert.certificate_type)}.pdf`);
  } else {
    const blobUrl = doc.output('bloburl');
    window.open(blobUrl, '_blank');
  }
};

// Calcula si una constancia ya está disponible para descarga pública.
// Regla: disponible al día siguiente de fecha_participacion; si no hay
// fecha, disponible a partir del cierre del congreso (3 de octubre 2026).
export const isCertificateUnlocked = (cert) => {
  const now = new Date();
  const CIERRE_CONGRESO = new Date('2026-10-03T00:00:00');

  if (!cert.fecha_participacion) {
    return now >= CIERRE_CONGRESO;
  }
  const fechaParticipacion = new Date(`${cert.fecha_participacion}T00:00:00`);
  const disponibleDesde = new Date(fechaParticipacion);
  disponibleDesde.setDate(disponibleDesde.getDate() + 1);
  return now >= disponibleDesde;
};

export const getUnlockDateLabel = (cert) => {
  if (!cert.fecha_participacion) {
    return '3 de octubre de 2026';
  }
  const fechaParticipacion = new Date(`${cert.fecha_participacion}T00:00:00`);
  const disponibleDesde = new Date(fechaParticipacion);
  disponibleDesde.setDate(disponibleDesde.getDate() + 1);
  return disponibleDesde.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
};
