// src/components/admin/CertificatesManager.jsx
import { exportarExcel, exportarPDF } from '../../utils/exportLista';
import { FileSpreadsheet as IconXls, FileText as IconPdf } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { generateOfficialCertificatePDF } from '../../lib/certificateTemplates';
import { jsPDF } from 'jspdf';
import {
  Plus, Edit2, Trash2, Search, Award, Save, ArrowLeft, User, CheckCircle2, XCircle, Copy, Pencil, Check, X as XIcon, Eye, Image as ImageIcon, UploadCloud
} from 'lucide-react';
import { toast } from 'sonner';

const CERT_TYPES = [
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
  { value: 'sitio_web', label: 'Desarrollo y Administración del Sitio Web' },
];

const certTypeLabel = (value) => CERT_TYPES.find(t => t.value === value)?.label || value;

// Genera un folio legible: IASP-2026-PON-A1B2C3
const generateFolio = (certType) => {
  const prefix = {
    ponente: 'PON', coordinador: 'COO', moderador: 'MOD', estelar: 'EST',
    conversatorio: 'CNV', concierto: 'CNC', publicacion: 'PUB',
    logistica: 'LOG', coordinacion_congreso: 'CGE', comite_organizador: 'CMO',
  }[certType] || 'GEN';
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `IASP-2026-${prefix}-${rand}`;
};

// Construye el texto de la constancia según el tipo (borrador de contenido, sin diseño final)
const buildCertificateText = (cert) => {
  const nombre = cert.participant_name || '[nombre]';
  const intro = 'La rama latinoamericana de la Asociación Internacional para el Estudio de la Música Popular otorga la presente';
  const fechas = 'de su XVII Congreso, celebrado en San Cristóbal de Las Casas, México, del 28 de septiembre al 2 de octubre de 2026';
  const fechasChis = fechas.replace('México,', 'Chiapas,');
  const temaGeneral = 'cuyo tema general fue "Ética, política y música popular"';

  let body;
  switch (cert.certificate_type) {
    case 'ponente':
      body = `por haber participado con la ponencia "${cert.presentation_title || '[título de la ponencia]'}", en el simposio ${cert.symposium_title || '[título del simposio]'}, ${fechas}.`;
      break;
    case 'coordinador':
      body = `por haber coordinado el simposio ${cert.symposium_title || '[título del simposio]'}, ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'moderador':
      body = `por haber moderado la mesa [PENDIENTE: falta texto oficial de la Dra. María Luisa para este tipo] — simposio/mesa: ${cert.symposium_title || '[título]'}, ${fechasChis}.`;
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
      body = `por haber presentado la publicación "${cert.presentation_title || '[título de la publicación]'}", ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'logistica':
      body = `[BORRADOR — pendiente de confirmar] por su valioso apoyo logístico durante ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'coordinacion_congreso':
      body = `[BORRADOR — pendiente de confirmar] por su labor de coordinación general del XVII Congreso, ${fechasChis}, ${temaGeneral}.`;
      break;
    case 'comite_organizador':
      body = `[BORRADOR — pendiente de confirmar] por su participación como integrante del Comité Organizador del XVII Congreso, ${fechasChis}, ${temaGeneral}.`;
      break;
    default:
      body = '.';
  }

  return { intro, titulo: 'CONSTANCIA', a: 'a', nombre, body };
};

// Convierte una imagen pública (misma URL de origen) a data URL para insertarla en el PDF
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

const generatePreviewPDF = async (cert) => {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const t = buildCertificateText(cert);

  // Marca de agua de fondo (marimba, opacidad baja) — no debe distraer del texto
  try {
    const watermarkDataUrl = await loadImageAsDataUrl('/images/marimba-watermark.png');
    const wmImg = new Image(); wmImg.src = watermarkDataUrl;
    await new Promise(r => { wmImg.onload = r; });
    // Cubre el ancho completo de la página, centrada verticalmente en la mitad inferior
    const pageWidth = 297, pageHeight = 210;
    const wmWidth = pageWidth;
    const wmHeight = wmWidth * (wmImg.height / wmImg.width);
    doc.addImage(watermarkDataUrl, 'PNG', 0, pageHeight - wmHeight, wmWidth, wmHeight);
  } catch (e) {
    console.error('No se pudo cargar la marca de agua:', e);
  }

  doc.setFontSize(9);
  doc.setTextColor(180, 130, 0);
  doc.text('VISTA PREVIA — SOLO TEXTO, SIN DISEÑO NI LOGOS FINALES (FIRMAS DE MUESTRA)', 148.5, 15, { align: 'center' });

  // Intro
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  const introWrapped = doc.splitTextToSize(t.intro, 210);
  doc.text(introWrapped, 148.5, 32, { align: 'center' });

  // CONSTANCIA
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(30, 58, 95);
  doc.text(t.titulo, 148.5, 50, { align: 'center' });

  // "a"
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  doc.text(t.a, 148.5, 60, { align: 'center' });

  // NOMBRE (grande, destacado)
  doc.setFont('times', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(0, 0, 0);
  doc.text(t.nombre.toUpperCase(), 148.5, 72, { align: 'center' });

  // Cuerpo: "Por haber participado..." (con mayúscula inicial)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  const bodyCapitalized = t.body.charAt(0).toUpperCase() + t.body.slice(1);
  const bodyWrapped = doc.splitTextToSize(bodyCapitalized, 220);
  doc.text(bodyWrapped, 148.5, 88, { align: 'center' });

  // Firmas al pie (mismo origen: se cargan desde public/images/firmas)
  try {
    const [darioDataUrl, mariaLuisaDataUrl] = await Promise.all([
      loadImageAsDataUrl('/images/firmas/firma-dario-tejeda.png'),
      loadImageAsDataUrl('/images/firmas/firma-maria-luisa-de-la-garza.png'),
    ]);

    // Ancho fijo en mm, alto proporcional
    const sigWidth = 45;
    const darioImg = new Image(); darioImg.src = darioDataUrl;
    const mlImg = new Image(); mlImg.src = mariaLuisaDataUrl;
    await Promise.all([
      new Promise(r => { darioImg.onload = r; }),
      new Promise(r => { mlImg.onload = r; }),
    ]);
    const darioHeight = sigWidth * (darioImg.height / darioImg.width);
    const mlHeight = sigWidth * (mlImg.height / mlImg.width);

    const sigY = 160;
    // La firma de Ma. Luisa tiene bastante espacio en blanco arriba del trazo principal;
    // su trazo horizontal cae al ~33% de la altura de la imagen contando desde abajo.
    // Calculamos el offset para que ese trazo quede justo sobre la línea (sigY + 3),
    // con un ajuste fino manual porque el remolino/cola de la firma se extendía
    // por debajo del trazo principal. -3 baja un poco respecto a -5 sin volver a cruzar la línea.
    const mlStrokeFractionFromBottom = 0.33;
    const mlManualCorrection = -3;
    const mlOffsetY = 3 + mlStrokeFractionFromBottom * mlHeight + mlManualCorrection;
    doc.addImage(darioDataUrl, 'PNG', 90 - sigWidth / 2, sigY - darioHeight, sigWidth, darioHeight);
    doc.addImage(mariaLuisaDataUrl, 'PNG', 207 - sigWidth / 2, sigY - mlHeight + mlOffsetY, sigWidth, mlHeight);

    doc.setDrawColor(150, 150, 150);
    doc.setLineWidth(0.3);
    doc.line(65, sigY + 3, 115, sigY + 3);
    doc.line(182, sigY + 3, 232, sigY + 3);

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Darío Tejeda', 90, sigY + 8, { align: 'center' });
    doc.text('Presidente de la IASPM-AL', 90, sigY + 13, { align: 'center' });
    doc.text('Ma. Luisa de la Garza', 207, sigY + 8, { align: 'center' });
    doc.text('Coordinadora del Comité Organizador', 207, sigY + 13, { align: 'center' });
  } catch (e) {
    console.error('No se pudieron cargar las firmas de muestra:', e);
  }

  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Folio: ${cert.folio || '(sin folio aún)'} — Tipo: ${certTypeLabel(cert.certificate_type)}`, 148.5, 190, { align: 'center' });

  // Abre en una pestaña nueva del navegador en vez de forzar la descarga
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
};

const emptyForm = {
  registration_id: '',
  certificate_type: 'ponente',
  participant_name: '',
  participant_email: '',
  presentation_title: '',
  symposium_title: '',
  fecha_participacion: '',
};

const CertificatesManager = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('todas');
  const [currentPage, setCurrentPage] = useState(1);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  // Buscador de persona (registrations)
  const [personQuery, setPersonQuery] = useState('');
  const [personResults, setPersonResults] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [searchingPerson, setSearchingPerson] = useState(false);
  const [manualMode, setManualMode] = useState(false); // Persona sin registro en la plataforma

  // Ponencias de la persona seleccionada (para autocompletar en tipo "ponente")
  const [personPresentations, setPersonPresentations] = useState([]);

  // Edición inline del nombre en registrations (corrige el dato maestro)
  const [editingNameId, setEditingNameId] = useState(null);
  const [editingNameValue, setEditingNameValue] = useState('');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setCertificates(data || []);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar constancias');
    } finally {
      setLoading(false);
    }
  };

  // --- Plantilla de diseño (fondo JPG usado en el PDF oficial) ---
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [templatePreviewUrl, setTemplatePreviewUrl] = useState(
    `https://rvpovifwugksrsmgabcj.supabase.co/storage/v1/object/public/constancias-assets/plantilla-fondo.jpg?t=${Date.now()}`
  );

  const handleUploadTemplate = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.includes('jpeg') && !file.type.includes('jpg')) {
      toast.error('El archivo debe ser un JPG');
      return;
    }
    try {
      setUploadingTemplate(true);
      const { error } = await supabase.storage
        .from('constancias-assets')
        .upload('plantilla-fondo.jpg', file, { upsert: true, contentType: 'image/jpeg' });
      if (error) throw error;
      setTemplatePreviewUrl(
        `https://rvpovifwugksrsmgabcj.supabase.co/storage/v1/object/public/constancias-assets/plantilla-fondo.jpg?t=${Date.now()}`
      );
      toast.success('Plantilla actualizada. Los próximos PDF generados usarán este diseño.');
    } catch (error) {
      console.error(error);
      toast.error('Error al subir la plantilla');
    } finally {
      setUploadingTemplate(false);
      e.target.value = '';
    }
  };

  // --- Buscar persona en registrations ---
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (personQuery.trim().length >= 2) {
        searchPeople(personQuery.trim());
      } else {
        setPersonResults([]);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [personQuery]);

  const searchPeople = async (q) => {
    try {
      setSearchingPerson(true);
      const isEmailLike = q.includes('@');

      let data, error;
      if (isEmailLike) {
        // Búsqueda explícita por correo
        ({ data, error } = await supabase
          .from('registrations')
          .select('id, full_name, email, category')
          .ilike('email', `%${q}%`)
          .order('full_name', { ascending: true })
          .limit(15));
      } else {
        // Búsqueda por nombre: prioriza coincidencias que empiezan con el texto,
        // y solo si no hay suficientes, complementa con "contiene" (evita que
        // coincidencias falsas en el dominio del correo, ej. "gmail.com", desplacen resultados reales)
        const [startsWith, contains] = await Promise.all([
          supabase.from('registrations').select('id, full_name, email, category')
            .ilike('full_name', `${q}%`).order('full_name', { ascending: true }).limit(15),
          supabase.from('registrations').select('id, full_name, email, category')
            .ilike('full_name', `%${q}%`).order('full_name', { ascending: true }).limit(15),
        ]);
        if (startsWith.error) throw startsWith.error;
        if (contains.error) throw contains.error;
        const seen = new Set();
        data = [...(startsWith.data || []), ...(contains.data || [])]
          .filter(p => (seen.has(p.id) ? false : (seen.add(p.id), true)))
          .slice(0, 15);
      }

      if (error) throw error;
      setPersonResults(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setSearchingPerson(false);
    }
  };

  const handleSelectPerson = async (person) => {
    setSelectedPerson(person);
    setPersonResults([]);
    setPersonQuery('');
    setFormData(prev => ({
      ...prev,
      registration_id: person.id,
      participant_name: person.full_name || '',
      participant_email: person.email || '',
    }));

    // Traer ponencias de esta persona vía registration_presentations (vínculo formal)
    try {
      const { data, error } = await supabase
        .from('registration_presentations')
        .select('presentation_id, presentations(title, symposium_id, symposiums(name), sessions(date))')
        .eq('registration_id', person.id);
      if (error) throw error;

      if (data && data.length > 0) {
        setPersonPresentations(data);
        return;
      }

      // Respaldo: no hay vínculo formal (frecuente — ~mitad de las ponencias no
      // están vinculadas), buscamos por coincidencia de nombre en el campo de
      // autores como texto. Es una sugerencia a verificar, no una certeza.
      const nameWords = (person.full_name || '')
        .split(/\s+/)
        .filter(w => w.length > 2);

      if (nameWords.length === 0) {
        setPersonPresentations([]);
        return;
      }

      const orClause = nameWords.map(w => `authors.ilike.%${w}%`).join(',');
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('presentations')
        .select('id, title, symposium_id, authors, symposiums(name), sessions(date)')
        .or(orClause)
        .limit(10);

      if (fallbackError) throw fallbackError;

      const mapped = (fallbackData || []).map(p => ({
        presentation_id: p.id,
        presentations: p,
        fallback: true,
      }));
      setPersonPresentations(mapped);
    } catch (error) {
      console.error(error);
      setPersonPresentations([]);
    }
  };

  const handleStartEditName = (person, e) => {
    e.stopPropagation();
    setEditingNameId(person.id);
    setEditingNameValue(person.full_name || '');
  };

  const handleCancelEditName = (e) => {
    e?.stopPropagation();
    setEditingNameId(null);
    setEditingNameValue('');
  };

  const handleSaveEditName = async (person, e) => {
    e.stopPropagation();
    const newName = editingNameValue.trim();
    if (!newName) {
      toast.error('El nombre no puede quedar vacío');
      return;
    }
    try {
      setSavingName(true);
      const { error } = await supabase
        .from('registrations')
        .update({ full_name: newName })
        .eq('id', person.id);
      if (error) throw error;

      // Refleja el cambio en los resultados de búsqueda visibles
      setPersonResults(prev => prev.map(p => p.id === person.id ? { ...p, full_name: newName } : p));
      // Si es la persona ya seleccionada en el formulario, refleja el cambio ahí también
      if (selectedPerson?.id === person.id) {
        setSelectedPerson(prev => ({ ...prev, full_name: newName }));
        setFormData(prev => ({ ...prev, participant_name: newName }));
      }

      toast.success('Nombre corregido en Inscripciones — se reflejará en todo el sistema');
      setEditingNameId(null);
      setEditingNameValue('');
    } catch (error) {
      toast.error('Error al corregir el nombre: ' + error.message);
    } finally {
      setSavingName(false);
    }
  };

  const handleAutofillPresentation = (rp) => {
    const fecha = rp.presentations?.sessions?.date || '';
    setFormData(prev => ({
      ...prev,
      presentation_title: rp.presentations?.title || '',
      symposium_title: rp.presentations?.symposiums?.name || '',
      fecha_participacion: fecha,
    }));
    toast.success(fecha ? 'Título, simposio y fecha autocompletados' : 'Título y simposio autocompletados (sin fecha de sesión asignada aún)');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!manualMode && !formData.registration_id) {
        toast.error('Selecciona a la persona antes de guardar');
        return;
      }
      if (!formData.participant_name?.trim()) {
        toast.error('Falta el nombre de la persona');
        return;
      }

      if (editingId) {
        const updatePayload = { ...formData, fecha_participacion: formData.fecha_participacion || null };
        const { error } = await supabase
          .from('certificates')
          .update(updatePayload)
          .eq('id', editingId);
        if (error) throw error;
        toast.success('Constancia actualizada correctamente');
      } else {
        const folio = generateFolio(formData.certificate_type);
        const payload = {
          ...formData,
          registration_id: formData.registration_id || null,
          fecha_participacion: formData.fecha_participacion || null,
          folio,
          qr_data: `${formData.registration_id || folio}|${formData.certificate_type}`,
          generated_date: new Date().toISOString(),
          verified: true,
        };
        const { error } = await supabase.from('certificates').insert([payload]);
        if (error) throw error;
        toast.success('Constancia registrada con éxito');
      }

      resetForm();
      setIsEditorOpen(false);
      fetchCertificates();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      toast.error('Error al guardar: ' + error.message);
    }
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setSelectedPerson(null);
    setPersonQuery('');
    setPersonResults([]);
    setPersonPresentations([]);
    setManualMode(false);
  };

  const handleActivateManualMode = () => {
    setManualMode(true);
    setPersonResults([]);
    setPersonQuery('');
    // Marcamos como "seleccionada" con datos vacíos para mostrar el bloque de edición manual
    setSelectedPerson({ id: null, manual: true });
    setFormData(prev => ({ ...prev, registration_id: null, participant_name: '', participant_email: '' }));
  };

  const handleEdit = async (cert) => {
    setEditingId(cert.id);
    setFormData({
      registration_id: cert.registration_id || '',
      certificate_type: cert.certificate_type || 'ponente',
      participant_name: cert.participant_name || '',
      participant_email: cert.participant_email || '',
      presentation_title: cert.presentation_title || '',
      symposium_title: cert.symposium_title || '',
      fecha_participacion: cert.fecha_participacion || '',
    });
    setSelectedPerson({ id: cert.registration_id, full_name: cert.participant_name, email: cert.participant_email });
    setManualMode(!cert.registration_id);
    setPersonPresentations([]);
    setIsEditorOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Si es ponente vinculado a una persona real y le falta la fecha, intenta rellenarla
    // automáticamente buscando la sesión de su ponencia (sin sobrescribir si ya tiene una).
    if (cert.registration_id && cert.certificate_type === 'ponente' && !cert.fecha_participacion) {
      try {
        const { data, error } = await supabase
          .from('registration_presentations')
          .select('presentations(title, sessions(date))')
          .eq('registration_id', cert.registration_id);
        if (!error && data) {
          const match = data.find(rp => rp.presentations?.title === cert.presentation_title);
          const fecha = match?.presentations?.sessions?.date;
          if (fecha) {
            setFormData(prev => ({ ...prev, fecha_participacion: fecha }));
          }
        }
      } catch (e) {
        console.error('No se pudo recuperar la fecha de sesión al editar:', e);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta constancia permanentemente?')) return;
    try {
      const { error } = await supabase.from('certificates').delete().eq('id', id);
      if (error) throw error;
      toast.success('Constancia eliminada');
      fetchCertificates();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleCopyFolio = (folio) => {
    navigator.clipboard.writeText(folio);
    toast.success('Folio copiado');
  };

  const filtered = certificates.filter(c => {
    const matchesSearch =
      c.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.participant_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.folio?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'todas' || c.certificate_type === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const PAGE_SIZE = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPageSafe = Math.min(currentPage, totalPages);
  const paginated = filtered.slice((currentPageSafe - 1) * PAGE_SIZE, currentPageSafe * PAGE_SIZE);

  const countByType = (typeValue) => certificates.filter(c => c.certificate_type === typeValue).length;

  const catLabel = (c) =>
    (CERT_TYPES.find(t => t.value === c.certificate_type)?.label || c.certificate_type || 'Sin categoría').split(' (')[0];
  const filtroNombre = categoryFilter === 'todas' ? 'Todas' : catLabel({ certificate_type: categoryFilter });
  const slug = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

  // Estilos auxiliares (mismos patrones que PresentationsManager)
  const Label = ({ children }) => (
    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1.5">{children}</label>
  );
  const InputClasses = "w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#1e3a5f] focus:ring-4 focus:ring-blue-50 outline-none text-sm font-bold text-gray-700 transition-all bg-white";

  const needsPresentationFields = formData.certificate_type === 'ponente';
  const needsSymposiumOnly = formData.certificate_type === 'coordinador' || formData.certificate_type === 'moderador';
  const needsEventTitle = formData.certificate_type === 'estelar';

  // --- VISTA 2: EDITOR ---
  if (isEditorOpen) {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full max-w-5xl mx-auto pb-10">
        <button
          onClick={() => { resetForm(); setIsEditorOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="mb-5 flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] font-bold text-sm transition-colors group bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm w-fit"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Volver a la lista de constancias
        </button>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col">

          <div className="p-6 md:p-8 border-b border-blue-900/10 bg-[#1e3a5f] text-white shrink-0">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-3 rounded-2xl text-blue-100">
                <Award size={28} />
              </div>
              <div>
                <h3 className="font-black uppercase italic tracking-widest text-2xl md:text-3xl">
                  {editingId ? 'Editar Constancia' : 'Nueva Constancia'}
                </h3>
                <p className="text-xs font-medium text-blue-200 uppercase tracking-wide mt-1.5">
                  {editingId ? `Editando registro ID: ${editingId}` : 'Selecciona a la persona y el tipo de constancia'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6 md:space-y-8 bg-gray-50/30">

            {/* BLOQUE 1: Persona */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <Label>Persona (buscar por nombre o correo en Inscripciones)</Label>

              {manualMode ? (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-3">
                  <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest">
                    Persona sin registro en la plataforma — captura sus datos manualmente
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nombre completo</Label>
                      <input required className={InputClasses} value={formData.participant_name} onChange={e => setFormData({ ...formData, participant_name: e.target.value })} placeholder="Nombre de la persona" />
                    </div>
                    <div>
                      <Label>Correo (opcional)</Label>
                      <input type="email" className={InputClasses} value={formData.participant_email} onChange={e => setFormData({ ...formData, participant_email: e.target.value })} placeholder="correo@ejemplo.com" />
                    </div>
                  </div>
                  {!editingId && (
                    <button
                      type="button"
                      onClick={() => { setSelectedPerson(null); setManualMode(false); setFormData(prev => ({ ...prev, registration_id: '', participant_name: '', participant_email: '' })); }}
                      className="text-xs font-black uppercase text-amber-700 hover:text-amber-900"
                    >
                      Buscar en inscripciones en su lugar
                    </button>
                  )}
                </div>
              ) : selectedPerson ? (
                editingNameId === selectedPerson.id ? (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <input
                      autoFocus
                      className="flex-1 p-2.5 rounded-lg border border-amber-300 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-200"
                      value={editingNameValue}
                      onChange={e => setEditingNameValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveEditName(selectedPerson, e); if (e.key === 'Escape') handleCancelEditName(e); }}
                    />
                    <button type="button" disabled={savingName} onClick={(e) => handleSaveEditName(selectedPerson, e)} className="p-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50">
                      <Check size={16} />
                    </button>
                    <button type="button" onClick={handleCancelEditName} className="p-2.5 rounded-lg bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                      <XIcon size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 rounded-xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-lg text-[#1e3a5f] border border-blue-100"><User size={18} /></div>
                      <div>
                        <p className="font-black text-[#1e3a5f] text-sm">{formData.participant_name}</p>
                        <p className="text-xs text-gray-500 font-bold">{formData.participant_email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleStartEditName(selectedPerson, e)}
                        title="Corregir nombre (afecta todo el sistema)"
                        className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors"
                      >
                        <Pencil size={15} />
                      </button>
                      {!editingId && (
                        <button
                          type="button"
                          onClick={() => { setSelectedPerson(null); setPersonPresentations([]); setFormData(prev => ({ ...prev, registration_id: '', participant_name: '', participant_email: '' })); }}
                          className="text-xs font-black uppercase text-red-500 hover:text-red-700"
                        >
                          Cambiar
                        </button>
                      )}
                    </div>
                  </div>
                )
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      className={`${InputClasses} pl-11`}
                      placeholder="Escribe un nombre o correo..."
                      value={personQuery}
                      onChange={e => setPersonQuery(e.target.value)}
                    />
                  </div>
                  {searchingPerson && <p className="text-xs text-gray-400 mt-1.5 font-bold">Buscando...</p>}
                  {personResults.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 shadow-lg">
                      {personResults.map(p => (
                        editingNameId === p.id ? (
                          <div key={p.id} className="p-3.5 flex items-center gap-2 bg-amber-50">
                            <input
                              autoFocus
                              className="flex-1 p-2 rounded-lg border border-amber-300 text-sm font-bold outline-none focus:ring-2 focus:ring-amber-200"
                              value={editingNameValue}
                              onChange={e => setEditingNameValue(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveEditName(p, e); if (e.key === 'Escape') handleCancelEditName(e); }}
                              onClick={e => e.stopPropagation()}
                            />
                            <button type="button" disabled={savingName} onClick={(e) => handleSaveEditName(p, e)} className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50">
                              <Check size={16} />
                            </button>
                            <button type="button" onClick={handleCancelEditName} className="p-2 rounded-lg bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 transition-colors">
                              <XIcon size={16} />
                            </button>
                          </div>
                        ) : (
                          <div key={p.id} className="w-full flex items-center hover:bg-blue-50 transition-colors group/result">
                            <button
                              type="button"
                              onClick={() => handleSelectPerson(p)}
                              className="flex-1 text-left p-3.5 flex items-center justify-between"
                            >
                              <div>
                                <p className="font-bold text-sm text-gray-800">{p.full_name}</p>
                                <p className="text-xs text-gray-400">{p.email}</p>
                              </div>
                              <span className="text-[10px] font-black uppercase text-gray-400 mr-2">{p.category}</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleStartEditName(p, e)}
                              title="Corregir nombre (afecta todo el sistema)"
                              className="p-2 mr-2 rounded-lg text-gray-300 hover:text-blue-600 hover:bg-blue-100 transition-colors opacity-0 group-hover/result:opacity-100 shrink-0"
                            >
                              <Pencil size={15} />
                            </button>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleActivateManualMode}
                    className="mt-2 text-xs font-black uppercase text-blue-600 hover:text-blue-800"
                  >
                    ¿No la encuentras? Registrar persona externa
                  </button>
                </div>
              )}
            </div>

            {/* BLOQUE 2: Tipo de constancia */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
              <div>
                <Label>Tipo de Constancia</Label>
                <select
                  required
                  className={InputClasses}
                  value={formData.certificate_type}
                  onChange={e => setFormData({ ...formData, certificate_type: e.target.value, presentation_title: '', symposium_title: '' })}
                >
                  {CERT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              {/* Autocompletar desde ponencias, solo para tipo ponente */}
              {needsPresentationFields && personPresentations.length > 0 && (
                <div className={`border rounded-xl p-4 space-y-2 ${personPresentations[0]?.fallback ? 'bg-amber-50/50 border-amber-200' : 'bg-blue-50/50 border-blue-100'}`}>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${personPresentations[0]?.fallback ? 'text-amber-600' : 'text-blue-600'}`}>
                    {personPresentations[0]?.fallback
                      ? 'Sugeridas por coincidencia de nombre — verifica antes de usar'
                      : 'Ponencias registradas de esta persona — clic para autocompletar'}
                  </p>
                  {personPresentations.map(rp => (
                    <button
                      type="button"
                      key={rp.presentation_id}
                      onClick={() => handleAutofillPresentation(rp)}
                      className={`w-full text-left p-3 bg-white rounded-lg border transition-colors ${rp.fallback ? 'border-amber-100 hover:border-amber-400' : 'border-blue-100 hover:border-blue-400'}`}
                    >
                      <p className="text-sm font-bold text-gray-800">{rp.presentations?.title}</p>
                      <p className="text-xs text-gray-400">
                        {rp.presentations?.symposiums?.name}
                        {rp.presentations?.sessions?.date && ` · ${rp.presentations.sessions.date}`}
                        {rp.fallback && rp.presentations?.authors && ` · Autores: ${rp.presentations.authors}`}
                      </p>
                    </button>
                  ))}
                </div>
              )}

              {needsPresentationFields && (
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <Label>Título de la Ponencia</Label>
                    <input className={InputClasses} value={formData.presentation_title} onChange={e => setFormData({ ...formData, presentation_title: e.target.value })} placeholder='Ej: "La cumbia en la frontera sur"' />
                  </div>
                  <div>
                    <Label>Título del Simposio</Label>
                    <input className={InputClasses} value={formData.symposium_title} onChange={e => setFormData({ ...formData, symposium_title: e.target.value })} placeholder="Nombre del simposio" />
                  </div>
                </div>
              )}

              {needsSymposiumOnly && (
                <div>
                  <Label>Título del Simposio</Label>
                  <input className={InputClasses} value={formData.symposium_title} onChange={e => setFormData({ ...formData, symposium_title: e.target.value })} placeholder="Nombre del simposio coordinado/moderado" />
                </div>
              )}

              {needsEventTitle && (
                <div>
                  <Label>Título del Concierto / Conversatorio</Label>
                  <input className={InputClasses} value={formData.symposium_title} onChange={e => setFormData({ ...formData, symposium_title: e.target.value })} placeholder="Ej: Concierto de clausura" />
                </div>
              )}

              <div>
                <Label>Fecha de participación (opcional)</Label>
                <input
                  type="date"
                  className={InputClasses}
                  value={formData.fecha_participacion}
                  onChange={e => setFormData({ ...formData, fecha_participacion: e.target.value })}
                  min="2026-09-28"
                  max="2026-10-02"
                />
                <p className="text-[10px] text-gray-400 font-bold mt-1.5 uppercase tracking-wide">
                  Si se define, la persona podrá descargar su constancia públicamente a partir del día siguiente. Si se deja vacía, estará disponible desde el cierre del congreso (3 de octubre).
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <button type="button" onClick={() => { resetForm(); setIsEditorOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="px-6 py-3.5 rounded-xl font-bold text-sm text-gray-600 bg-white border border-gray-300 hover:bg-gray-50 transition-colors uppercase tracking-wide">
                Cancelar
              </button>
              <button type="submit" className="px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest text-white bg-[#1e3a5f] hover:bg-black shadow-lg hover:shadow-xl transition-all flex items-center gap-2 active:scale-95">
                <Save size={18} /> {editingId ? 'Actualizar Constancia' : 'Guardar Constancia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --- VISTA 1: LISTADO ---
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 pl-2">
          <div className="bg-blue-50 p-3 rounded-2xl text-[#1e3a5f]">
            <Award size={28} />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-[#1e3a5f] uppercase italic tracking-tight">Gestión de Constancias</h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              {certificates.length} Registros Totales
            </p>
          </div>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o folio..."
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-[#1e3a5f] bg-gray-50 focus:bg-white shadow-sm text-sm font-bold transition-all"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <button
            onClick={() => { resetForm(); setIsEditorOpen(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 font-black text-xs uppercase tracking-widest"
          >
            <Plus size={18} /> Nueva
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
        <img
          src={templatePreviewUrl}
          alt="Plantilla de diseño actual"
          className="w-40 h-auto rounded-xl border border-gray-200 shadow-sm object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="flex-1">
          <p className="text-sm font-black text-[#1e3a5f] uppercase tracking-wide">Plantilla de diseño</p>
          <p className="text-xs text-gray-400 font-bold mt-1">
            Fondo (JPG) usado como base de todas las constancias oficiales. Al reemplazarlo, los próximos PDF generados usarán el nuevo diseño automáticamente.
          </p>
        </div>
        <label className="bg-[#1e3a5f] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95 font-black text-xs uppercase tracking-widest cursor-pointer">
          {uploadingTemplate ? 'Subiendo...' : <><UploadCloud size={18} /> Reemplazar JPG</>}
          <input type="file" accept="image/jpeg" className="hidden" onChange={handleUploadTemplate} disabled={uploadingTemplate} />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mr-2">Exportar</span>
        <button
          onClick={() => exportarExcel(certificates, catLabel, 'constancias-iaspmal2026-completo', true)}
          disabled={!certificates.length}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-green-700 text-white hover:bg-green-800 disabled:opacity-40">
          <IconXls size={14} /> Excel completo
        </button>
        <button
          onClick={() => exportarPDF(certificates, catLabel, 'Constancias por categoría', true)}
          disabled={!certificates.length}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-700 text-white hover:bg-red-800 disabled:opacity-40">
          <IconPdf size={14} /> PDF completo
        </button>
        <span className="text-gray-300 mx-1">|</span>
        <button
          onClick={() => exportarExcel(filtered, catLabel, `constancias-${slug(filtroNombre)}`, false)}
          disabled={!filtered.length}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40">
          <IconXls size={14} /> Excel: {filtroNombre} ({filtered.length})
        </button>
        <button
          onClick={() => exportarPDF(filtered, catLabel, `Constancias: ${filtroNombre}`, false)}
          disabled={!filtered.length}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-40">
          <IconPdf size={14} /> PDF: {filtroNombre}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={() => { setCategoryFilter('todas'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === 'todas' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
        >
          Todas ({certificates.length})
        </button>
        {CERT_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => { setCategoryFilter(t.value); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${categoryFilter === t.value ? 'bg-[#1e3a5f] text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
          >
            {t.label} ({countByType(t.value)})
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 text-gray-400 border-b border-gray-100">
            <tr>
              <th className="p-4 pl-6 text-[10px] font-black uppercase tracking-widest">Participante</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Tipo</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Folio</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest">Verificada</th>
              <th className="p-4 pr-6 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan="5" className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest text-sm animate-pulse">Cargando datos...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">No hay constancias registradas todavía.</td></tr>
            ) : (
              paginated.map(cert => (
                <tr key={cert.id} className="hover:bg-blue-50/30 transition-colors group/row">
                  <td className="p-4 pl-6 align-top">
                    <p className="font-bold text-[#1e3a5f] text-sm">{cert.participant_name}</p>
                    <p className="text-xs text-gray-400">{cert.participant_email}</p>
                  </td>
                  <td className="p-4 align-top">
                    <span className="text-[10px] font-black px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-500 uppercase">
                      {certTypeLabel(cert.certificate_type)}
                    </span>
                  </td>
                  <td className="p-4 align-top">
                    <button onClick={() => handleCopyFolio(cert.folio)} className="flex items-center gap-1.5 text-xs font-mono font-bold text-gray-600 hover:text-blue-600 transition-colors">
                      {cert.folio} <Copy size={12} />
                    </button>
                  </td>
                  <td className="p-4 align-top">
                    {cert.verified ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-xs font-black uppercase"><CheckCircle2 size={14} /> Sí</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-xs font-black uppercase"><XCircle size={14} /> No</span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right align-top">
                    <div className="flex justify-end gap-2 opacity-0 group-hover/row:opacity-100 transition-opacity">
                      <button onClick={() => generateOfficialCertificatePDF(cert, 'open')} title="Vista previa PDF (diseño oficial)" className="p-2 text-amber-600 bg-white hover:bg-amber-600 hover:text-white rounded-lg transition-all border border-amber-100 shadow-sm"><Eye size={16} /></button>
                      <button onClick={() => handleEdit(cert)} className="p-2 text-blue-600 bg-white hover:bg-blue-600 hover:text-white rounded-lg transition-all border border-blue-100 shadow-sm"><Edit2 size={16} /></button>
                      <button onClick={() => handleDelete(cert.id)} className="p-2 text-red-600 bg-white hover:bg-red-600 hover:text-white rounded-lg transition-all border border-red-100 shadow-sm"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && filtered.length > 0 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Mostrando {(currentPageSafe - 1) * PAGE_SIZE + 1}–{Math.min(currentPageSafe * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPageSafe === 1}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-xs font-bold text-gray-500 px-2">
              Página {currentPageSafe} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPageSafe === totalPages}
              className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all bg-gray-50 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificatesManager;
