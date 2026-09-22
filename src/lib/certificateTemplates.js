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
  const quoteChars = '\u0022\u201C\u201D\u0027\u2018\u2019';
  const re = new RegExp('^[' + quoteChars + ']+|[' + quoteChars + ']+$', 'g');
  return text.trim().replace(re, '');
};

export const buildCertificateText = (cert) => {
  const nombre = cert.participant_name || '[nombre]';
  const presentationTitle = stripSurroundingQuotes(cert.presentation_title);
  const intro = 'La rama latinoamericana de la Asociación Internacional para el Estudio de la Música Popular otorga la presente';
  const fechas = 'de su XVII Congreso, celebrado en San Cristóbal de Las Casas, México, del 28 de septiembre al 2 de octubre de 2026';
  const fechasChis = fechas.replace('México,', 'Chiapas,');
  const temaGeneral = 'cuyo tema general fue "Ética, política y música popular"';

  let body;
  switch (cert.certificate_type) {
    case 'ponente':
      body = `por haber participado con la ponencia "${presentationTitle || '[título de la ponencia]'}", en el simposio ${cert.symposium_title || '[título del simposio]'}, ${fechas}.`;
      break;
    case 'coordinador':
      body = `por haber coordinado el simposio ${cert.symposium_title || '[título del simposio]'}, ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'moderador':
      body = `por haber moderado la mesa — simposio/mesa: ${cert.symposium_title || '[título]'}, ${fechasChis}.`;
      break;
    case 'estelar':
      body = `por haber participado en el ${cert.symposium_title || '[título del concierto/conversatorio]'}, ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'conversatorio':
      body = `por haber participado en el conversatorio "${cert.symposium_title || '[título del conversatorio]'}", ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'concierto':
      body = `por haber participado en el concierto "${cert.symposium_title || '[título del concierto]'}", ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'publicacion':
      body = `por haber presentado la publicación "${presentationTitle || '[título de la publicación]'}", ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'logistica':
      body = `por su valioso apoyo logístico durante ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'coordinacion_congreso':
      body = `por su labor de coordinación general del XVII Congreso, ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'comite_organizador':
      body = `por su participación como integrante del Comité Organizador del XVII Congreso, ${fechasChis}, ${temaGeneral}.`;
      break;
    default:
      body = '.';
  }

  return { intro, titulo: 'CONSTANCIA', a: 'a', nombre, body };
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

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const introWrapped = doc.splitTextToSize(t.intro, 200);
  doc.text(introWrapped, 148.5, 65, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 95);
  doc.text(t.titulo, 148.5, 80, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(t.a, 148.5, 89, { align: 'center' });

  doc.setFont('times', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text(t.nombre.toUpperCase(), 148.5, 100, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(20, 20, 20);
  const bodyCapitalized = t.body.charAt(0).toUpperCase() + t.body.slice(1);
  const bodyWrapped = doc.splitTextToSize(bodyCapitalized, 235);
  doc.text(bodyWrapped, 148.5, 115, { align: 'center', lineHeightFactor: 1.35 });

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
