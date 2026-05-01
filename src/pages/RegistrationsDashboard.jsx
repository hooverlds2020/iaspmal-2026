// src/pages/RegistrationsDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sendPaymentApproval, sendRejectionNotice } from '../lib/resendClient';
import { Download, Eye, Check, X, RefreshCw, Search, Award, Lock, WifiOff, AlertTriangle, Send, FileSpreadsheet, History, User, Trash2, Edit, Save, Bell, ShieldAlert } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

const generateSixCharID = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const TableSkeleton = () => (
  <div className="animate-pulse space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 border-b border-gray-100 bg-white">
        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-3 bg-gray-100 rounded w-1/4"></div>
        </div>
        <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
      </div>
    ))}
  </div>
);

const RegistrationsDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('MXN');
  const [paymentMethod, setPaymentMethod] = useState('transferencia');

  const [showForceAuth, setShowForceAuth] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [activeTab, setActiveTab] = useState('details');
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  const selectedRegistrationRef = useRef(selectedRegistration);

  useEffect(() => {
    selectedRegistrationRef.current = selectedRegistration;
  }, [selectedRegistration]);

  useEffect(() => {
    if (selectedRegistration) {
        setEditForm({
            full_name: selectedRegistration.full_name,
            email: selectedRegistration.email,
            country: selectedRegistration.country,
            category: selectedRegistration.category
        });
        setIsEditing(false);
        setShowForceAuth(false);
        setShowDeleteConfirm(false);
    }
  }, [selectedRegistration]);

  const updateAppBadge = (count) => {
    if ('setAppBadge' in navigator) {
      if (count > 0) navigator.setAppBadge(count).catch(e => console.error(e));
      else navigator.clearAppBadge().catch(e => console.error(e));
    }
    document.title = count > 0 ? `(${count}) Admin IASPM` : 'Panel Admin - IASPM';
  };

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) { toast.error("Navegador no soporta notificaciones"); return; }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') toast.success("Notificaciones activadas");
  };

  const fetchRegistrations = async () => {
    try {
      setErrorState(false);
      if (registrations.length === 0) setLoading(true);
      let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('status', filter);
      const { data, error } = await query;
      if (error) throw error;
      setRegistrations(data || []);
      const pendingCount = (data || []).filter(r => r.status === 'pending').length;
      updateAppBadge(pendingCount);
    } catch (error) {
      console.error('Error:', error);
      setErrorState(true);
      toast.error('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuditLogs = async (recordId) => {
    setLoadingLogs(true);
    try {
        const { data, error } = await supabase.from('audit_logs').select('*').eq('record_id', recordId).order('created_at', { ascending: false });
        if (error) throw error;
        setAuditLogs(data || []);
    } catch (e) { console.error("Logs error", e); } finally { setLoadingLogs(false); }
  };

  useEffect(() => {
      if (selectedRegistration && activeTab === 'history') fetchAuditLogs(selectedRegistration.id);
  }, [activeTab, selectedRegistration]);

  useEffect(() => {
    fetchRegistrations();
    const channel = supabase.channel('registrations-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'registrations' }, (payload) => {
          setRegistrations(currentRegs => {
              const updated = currentRegs.map(reg => reg.id === payload.new.id ? payload.new : reg);
              updateAppBadge(updated.filter(r => r.status === 'pending').length);
              return updated;
          });
          if (selectedRegistrationRef.current && selectedRegistrationRef.current.id === payload.new.id) {
            setSelectedRegistration(payload.new);
          }
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'registrations' }, (payload) => {
          setRegistrations(currentRegs => [payload.new, ...currentRegs]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  const handleSaveChanges = async () => {
      try {
          const { error } = await supabase.from('registrations').update(editForm).eq('id', selectedRegistration.id);
          if (error) throw error;
          toast.success("Datos actualizados");
          setIsEditing(false);
          setSelectedRegistration({ ...selectedRegistration, ...editForm });
          setRegistrations(prev => prev.map(r => r.id === selectedRegistration.id ? { ...r, ...editForm } : r));
      } catch (error) { toast.error("Error al guardar cambios"); }
  };

  const openDeleteModal = () => {
      setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
      try {
          const { error } = await supabase.from('registrations').delete().eq('id', selectedRegistration.id);
          if (error) throw error;

          toast.success("Registro eliminado correctamente");
          setShowDeleteConfirm(false);
          setSelectedRegistration(null);
          setRegistrations(prev => prev.filter(r => r.id !== selectedRegistration.id));
      } catch (error) {
          console.error(error);
          toast.error("Error al eliminar el registro");
      }
  };

  const attemptApproval = () => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.warning('Por favor ingresa el monto del pago.');
      return;
    }
    // ✅ AJUSTE: También validamos si dice "pendiente_comprobante" para lanzar la alerta manual
    if (!selectedRegistration.payment_proof_url || selectedRegistration.payment_proof_url === 'pendiente_comprobante' || selectedRegistration.payment_proof_url === 'null') {
      setShowForceAuth(true);
    } else {
      executeStatusUpdate(selectedRegistration.id, 'paid');
    }
  };

  const executeStatusUpdate = async (id, newStatus) => {
    setShowForceAuth(false);
    const { data: currentReg } = await supabase.from('registrations').select('*').eq('id', id).single();

    const processUpdate = async () => {
      const updateData = {
        status: newStatus,
        payment_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
      };

      let finalCode = currentReg.attendance_code;

      if (newStatus === 'paid') {
        updateData.payment_amount = parseFloat(paymentAmount);
        updateData.payment_currency = paymentCurrency;
        updateData.payment_method = paymentMethod;

        if (!finalCode || finalCode.length > 6 || finalCode.startsWith('IASP')) {
            finalCode = generateSixCharID();
            updateData.attendance_code = finalCode;
        }
      }

      const { error } = await supabase.from('registrations').update(updateData).eq('id', id);
      if (error) throw error;

      if (newStatus === 'paid') {
        await sendPaymentApproval(currentReg.email, currentReg.full_name, finalCode, currentReg.category);
      } else if (newStatus === 'rejected') {
        await sendRejectionNotice(currentReg.email, currentReg.full_name);
        const note = currentReg.payment_proof_url && currentReg.payment_proof_url !== 'pendiente_comprobante' ? "Rechazado por Admin" : "Rechazado: Faltaba archivo adjunto";
        await supabase.from('registrations').update({ notes: (currentReg.notes || '') + '\n' + note }).eq('id', id);
      }
      setPaymentAmount('');
      return newStatus === 'paid' ? 'Pago aprobado y QR enviado' : 'Aviso enviado al participante';
    };

    toast.promise(processUpdate(), {
      loading: newStatus === 'paid' ? 'Generando QR de 6 dígitos...' : 'Actualizando...',
      success: (msg) => msg,
      error: 'Error al actualizar.'
    });
  };

  const handleResendEmail = async (reg) => {
    if (!reg.attendance_code) { toast.error('Sin código generado aún.'); return; }

    let codeToUse = reg.attendance_code;
    if (codeToUse.length > 6 || codeToUse.startsWith('IASP')) {
        const newCode = generateSixCharID();
        await supabase.from('registrations').update({ attendance_code: newCode }).eq('id', reg.id);
        codeToUse = newCode;
        toast.info("Código corregido a 6 dígitos automáticamente.");
    }

    const process = async () => {
        await sendPaymentApproval(reg.email, reg.full_name, codeToUse, reg.category);
        const timeLog = new Date().toLocaleString('es-MX');
        const newNote = (reg.notes || '') + `\n[Sistema] Correo reenviado el: ${timeLog}`;
        const { error } = await supabase.from('registrations').update({ notes: newNote }).eq('id', reg.id);
        if (error) throw error;
        return 'Correo enviado';
    };
    toast.promise(process(), { loading: 'Enviando...', success: (msg) => msg, error: 'Error al enviar' });
  };

  const confirmAttendance = async (id) => {
    const promise = supabase.from('registrations').update({ attendance_confirmed: true, attendance_date: new Date().toISOString() }).eq('id', id);
    toast.promise(promise, { loading: 'Confirmando...', success: 'Asistencia confirmada', error: 'Error' });
  };

  const updateNotes = async (id, notes) => {
    const { error } = await supabase.from('registrations').update({ notes }).eq('id', id);
    if (error) toast.error('Error al guardar nota'); else toast.success('Nota guardada');
  };

  const exportToCSV = () => {
    const dataToExport = filteredRegistrations;
    if (dataToExport.length === 0) { toast.error("Sin datos"); return; }
    const headers = ["ID", "Nombre", "Email", "País", "Categoría", "Estado", "Monto", "Moneda", "Código", "Asistencia", "Fecha Asistencia", "Notas"];
    const csvRows = [headers.join(","), ...dataToExport.map(row => [row.id, `"${row.full_name}"`, row.email, row.country, getCategoryLabel(row.category), row.status, row.payment_amount || 0, row.payment_currency || 'MXN', row.attendance_code, row.attendance_confirmed ? "SI" : "NO", row.attendance_date, `"${row.notes || ''}"`].join(","))].join("\n");
    const bom = "\uFEFF"; const blob = new Blob([bom + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.setAttribute("download", `Registros_IASPM_${filter}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link); toast.success('Exportación completada');
  };

  const generateCertificate = (reg) => {
    try {
        const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
        const primaryColor = [5, 150, 105]; const darkColor = [31, 41, 55];
        doc.setLineWidth(2); doc.setDrawColor(...primaryColor); doc.rect(10, 10, 277, 190);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(28); doc.setTextColor(...primaryColor);
        doc.text('CONSTANCIA DE PARTICIPACIÓN', 148.5, 40, { align: 'center' });
        doc.setFont('helvetica', 'normal'); doc.setFontSize(14); doc.setTextColor(...darkColor);
        doc.text('El Comité Organizador del XVII Congreso de la IASPM-AL otorga la presente a:', 148.5, 60, { align: 'center' });
        doc.setFont('times', 'bold'); doc.setFontSize(32); doc.setTextColor(0, 0, 0);
        doc.text(reg.full_name, 148.5, 85, { align: 'center' });
        doc.setDrawColor(200, 200, 200); doc.setLineWidth(0.5); doc.line(70, 90, 227, 90);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(16); doc.setTextColor(...darkColor);
        const categoryText = getCategoryLabel(reg.category).toUpperCase();
        doc.text(`Por su valiosa participación en calidad de ${categoryText}`, 148.5, 105, { align: 'center' });
        doc.text('en el XVII Congreso de la Asociación Internacional para el Estudio', 148.5, 120, { align: 'center' });
        doc.text('de la Música Popular - Rama Latinoamericana (IASPM-AL).', 148.5, 130, { align: 'center' });
        doc.setFontSize(14); doc.setTextColor(100, 100, 100);
        doc.text('Celebrado en San Cristóbal de Las Casas, Chiapas, México', 148.5, 150, { align: 'center' });
        doc.text('del 28 de septiembre al 2 de octubre de 2026.', 148.5, 160, { align: 'center' });
        doc.setFontSize(12); doc.setTextColor(0, 0, 0);
        doc.text('_________________________', 90, 180, { align: 'center' }); doc.text('_________________________', 207, 180, { align: 'center' });
        doc.setFontSize(10); doc.text('Comité Organizador', 90, 185, { align: 'center' }); doc.text('Presidencia IASPM-AL', 207, 185, { align: 'center' });
        doc.setFontSize(8); doc.setTextColor(150, 150, 150);
        const validationUrl = `iaspmal2026.com/constancias`;
        doc.text(`Autenticidad: ${validationUrl} | Código: ${reg.attendance_code}`, 148.5, 196, { align: 'center' });
        doc.save(`Constancia_${reg.full_name.replace(/\s+/g, '_')}.pdf`);
        toast.success('PDF Generado');
    } catch (e) { toast.error('Error al generar PDF'); }
  };

  const getCategoryLabel = (cat) => {
    const map = {
      'sur_global': 'Sur Global',
      'norte_global': 'Norte Global',
      'institucion_convocante': 'Inst. Convocante',
      'estudiante': 'Estudiante',
      'asistente': 'Asistente'
    };
    return map[cat] || cat;
  };

  const getStatusBadge = (status) => { const styles = { pending: 'bg-yellow-100 text-yellow-800 border-yellow-200', paid: 'bg-green-100 text-green-800 border-green-200', rejected: 'bg-red-100 text-red-800 border-red-200' }; const labels = { pending: 'Pendiente', paid: 'Pagado', rejected: 'Rechazado' }; return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>{labels[status]}</span>; };
  const filteredRegistrations = registrations.filter(reg => reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || reg.email.toLowerCase().includes(searchTerm.toLowerCase()) || (reg.attendance_code && reg.attendance_code.toLowerCase().includes(searchTerm.toLowerCase())));
  const stats = { total: registrations.length, pending: registrations.filter(r => r.status === 'pending').length, paid: registrations.filter(r => r.status === 'paid').length, rejected: registrations.filter(r => r.status === 'rejected').length };

  const renderAuditLogs = () => {
      if (loadingLogs) return <div className="p-8 text-center"><RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600"/></div>;
      if (auditLogs.length === 0) return <div className="p-8 text-center text-gray-500">No hay historial de cambios registrado aún.</div>;
      return (
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {auditLogs.map((log) => {
                  const changes = [];
                  if (log.operation === 'UPDATE' && log.old_data && log.new_data) {
                      Object.keys(log.new_data).forEach(key => {
                          if (JSON.stringify(log.new_data[key]) !== JSON.stringify(log.old_data[key]) && key !== 'updated_at') {
                              changes.push({ key, old: log.old_data[key], new: log.new_data[key] });
                          }
                      });
                  }
                  return (
                      <div key={log.id} className="border-l-2 border-teal-500 pl-4 py-2 bg-gray-50 rounded-r-lg text-sm">
                          <div className="flex justify-between items-start mb-1">
                              <span className={`font-bold uppercase text-xs px-2 py-0.5 rounded ${log.operation === 'INSERT' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{log.operation}</span>
                              <span className="text-gray-400 text-xs">{new Date(log.created_at).toLocaleString()}</span>
                          </div>
                          {log.operation === 'INSERT' && <p className="text-gray-600 mt-1">Registro creado inicialmente.</p>}
                          {changes.map((change, idx) => (
                              <div key={idx} className="mt-2">
                                  <span className="font-semibold text-gray-700 capitalize block">{change.key.replace(/_/g, ' ')}</span>
                                  <div className="flex items-center gap-2 text-xs mt-1">
                                      <span className="text-red-500 line-through bg-red-50 px-1.5 py-0.5 rounded">{String(change.old || 'Vacío')}</span>
                                      <span className="text-gray-400">➜</span>
                                      <span className="text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded">{String(change.new)}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Inscripciones</h1>
                <p className="text-gray-500 mt-1">Panel de control del XVII Congreso IASPM-AL 2026</p>
            </div>
            <button onClick={requestNotificationPermission} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm">
                <Bell className="w-4 h-4" /> Activar Alertas
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><p className="text-sm font-medium text-gray-500">Total Registros</p><p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400"><p className="text-sm font-medium text-gray-500">Pendientes</p><p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500"><p className="text-sm font-medium text-gray-500">Pagados</p><p className="text-3xl font-bold text-green-600 mt-2">{stats.paid}</p></div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500"><p className="text-sm font-medium text-gray-500">Rechazados</p><p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p></div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              {['all', 'pending', 'paid'].map(f => ( <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filter === f ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes de Pago' : 'Pagados'}</button> ))}
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition" /></div>
              <button onClick={exportToCSV} className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-sm" title="Descargar Excel"><FileSpreadsheet className="w-4 h-4" /><span className="hidden md:inline">Excel</span></button>
              <button onClick={() => { setLoading(true); fetchRegistrations(); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition border border-gray-300" title="Actualizar datos"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
            </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
          {loading ? <TableSkeleton /> : errorState ? <div className="flex flex-col items-center justify-center py-20 text-center"><WifiOff className="w-16 h-16 text-gray-300 mb-4" /><h3 className="text-xl font-bold text-gray-700">Error de conexión</h3><button onClick={() => fetchRegistrations()} className="bg-teal-600 text-white px-6 py-2 rounded-lg hover:bg-teal-700 transition">Reintentar</button></div> : filteredRegistrations.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center"><Search className="w-16 h-16 text-gray-200 mb-4" /><h3 className="text-lg font-medium text-gray-900">No se encontraron resultados</h3></div> : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200"><tr><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Participante</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Categoría</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Código</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Estado</th><th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Asistencia</th><th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Acciones</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition group">
                      <td className="px-6 py-4"><div className="font-medium text-gray-900">{reg.full_name}</div><div className="text-xs text-gray-500">{reg.email}</div><div className="text-xs text-gray-400 mt-0.5">{reg.country}</div></td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getCategoryLabel(reg.category)}</td>
                      <td className="px-6 py-4"><span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">{reg.attendance_code}</span></td>
                      <td className="px-6 py-4">{getStatusBadge(reg.status)}</td>
                      <td className="px-6 py-4">{reg.attendance_confirmed ? <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Check className="w-3 h-3" /> Confirmada</span> : <span className="text-xs text-gray-400">Pendiente</span>}</td>
                      <td className="px-6 py-4 text-center"><button onClick={() => { setSelectedRegistration(reg); setActiveTab('details'); }} className="text-teal-600 hover:text-teal-800 hover:bg-teal-50 px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center justify-center gap-1 mx-auto"><Eye className="w-4 h-4" /> Detalles</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {selectedRegistration && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">

              <div className="shrink-0 bg-white border-b px-6 py-4 flex justify-between items-center z-30 relative shadow-sm">
                <div className="flex-1">
                    {isEditing ? (
                       <input type="text" value={editForm.full_name} onChange={(e) => setEditForm({...editForm, full_name: e.target.value})} className="text-xl font-bold text-gray-800 border-b border-teal-500 focus:outline-none w-full" placeholder="Nombre completo" />
                    ) : ( <h2 className="text-xl font-bold text-gray-800">{selectedRegistration.full_name}</h2> )}
                    {isEditing ? (
                        <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} className="text-sm text-gray-500 border-b border-gray-300 focus:outline-none w-full mt-1" placeholder="Correo electrónico" />
                    ) : ( <p className="text-sm text-gray-500">{selectedRegistration.email}</p> )}
                </div>
                <div className="flex items-center gap-2">
                    {!isEditing && (
                        <>
                            <button onClick={() => setIsEditing(true)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition" title="Editar datos"><Edit className="w-4 h-4" /></button>
                            <button onClick={openDeleteModal} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition" title="Eliminar registro"><Trash2 className="w-4 h-4" /></button>
                        </>
                    )}
                    {isEditing && (
                        <>
                            <button onClick={handleSaveChanges} className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-full transition" title="Guardar"><Save className="w-4 h-4" /></button>
                            <button onClick={() => setIsEditing(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition" title="Cancelar"><X className="w-4 h-4" /></button>
                        </>
                    )}
                    <div className="w-px h-6 bg-gray-200 mx-2"></div>
                    <button onClick={() => setSelectedRegistration(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
                </div>
              </div>

              <div className="shrink-0 flex border-b border-gray-200 bg-white z-20 relative">
                  <button onClick={() => setActiveTab('details')} className={`flex-1 py-3 text-sm font-bold text-center transition ${activeTab === 'details' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' : 'text-gray-500 hover:text-gray-700'}`}><span className="flex items-center justify-center gap-2"><User className="w-4 h-4"/> Detalles</span></button>
                  <button onClick={() => setActiveTab('history')} className={`flex-1 py-3 text-sm font-bold text-center transition ${activeTab === 'history' ? 'text-teal-600 border-b-2 border-teal-600 bg-teal-50' : 'text-gray-500 hover:text-gray-700'}`}><span className="flex items-center justify-center gap-2"><History className="w-4 h-4"/> Historial</span></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white relative z-10">
                {activeTab === 'details' ? (
                    <div className="space-y-8 animate-in fade-in">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Información</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">País</p>
                                        {isEditing ? <input type="text" value={editForm.country} onChange={(e) => setEditForm({...editForm, country: e.target.value})} className="font-medium border-b w-full" /> : <p className="font-medium">{selectedRegistration.country}</p>}
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Categoría</p>
                                        {isEditing ? (
                                            <select value={editForm.category} onChange={(e) => setEditForm({...editForm, category: e.target.value})} className="font-medium border-b w-full bg-white">
                                                <option value="sur_global">Sur Global</option>
                                                <option value="norte_global">Norte Global</option>
                                                <option value="institucion_convocante">Inst. Convocante</option>
                                                <option value="asistente">Asistente</option>
                                            </select>
                                            ) : <p className="font-medium">{getCategoryLabel(selectedRegistration.category)}</p>}
                                    </div>
                                    <div className="col-span-2">
                                      <p className="text-xs text-gray-500">Comprobante</p>
                                      {/* ✅ AJUSTE APLICADO AQUÍ PARA RECHAZAR "pendiente_comprobante" VISUALMENTE */}
                                      {selectedRegistration.payment_proof_url && selectedRegistration.payment_proof_url !== 'pendiente_comprobante' && selectedRegistration.payment_proof_url !== 'null' ? <a href={selectedRegistration.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline flex items-center gap-1"><Download className="w-3 h-3" /> Ver archivo</a> : <span className="text-sm text-red-500 bg-red-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit"><AlertTriangle className="w-3 h-3"/> Archivo no adjunto</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">Pagos {getStatusBadge(selectedRegistration.status)}</h3>
                                {selectedRegistration.status !== 'paid' && (
                                    <div className="space-y-3">
                                            <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Monto" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="text-sm border rounded px-2 py-1" /><select value={paymentCurrency} onChange={e => setPaymentCurrency(e.target.value)} className="text-sm border rounded px-2 py-1"><option value="MXN">MXN</option><option value="USD">USD</option></select></div>
                                            <div className="flex gap-2">
                                                <button onClick={attemptApproval} className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700 transition">Aprobar</button>
                                                <button onClick={() => executeStatusUpdate(selectedRegistration.id, 'rejected')} className="flex-1 bg-white border border-red-200 text-red-600 py-1.5 rounded text-sm hover:bg-red-50 transition">Rechazar</button>
                                            </div>
                                    </div>
                                )}
                                {selectedRegistration.status === 'paid' && (
                                    <div className="space-y-2">
                                            <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">Aprobado: {selectedRegistration.payment_date}</div>
                                            <button onClick={() => handleResendEmail(selectedRegistration)} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-1.5 rounded text-sm hover:bg-gray-50"><Send className="w-3 h-3" /> Reenviar Email</button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className={`border-2 rounded-xl p-5 ${selectedRegistration.attendance_confirmed ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'}`}>
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                                     <QRCodeCanvas value={`https://iaspmal2026.com/asistencia?code=${selectedRegistration.attendance_code}`} size={140} />
                                     <p className="text-center text-xs font-mono font-bold mt-2 tracking-widest">{selectedRegistration.attendance_code}</p>
                                </div>
                                <div className="flex-1 text-center md:text-left space-y-3">
                                    <div><h3 className="text-lg font-bold text-gray-800">Acceso</h3><p className="text-sm text-gray-500">Escanea el QR para entrar</p></div>
                                    {selectedRegistration.attendance_confirmed ? <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold"><Check className="w-5 h-5" /> Entrada Registrada</div> : (selectedRegistration.status === 'paid' ? <button onClick={() => confirmAttendance(selectedRegistration.id)} className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">Confirmar Manualmente</button> : <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm border border-amber-200"><AlertTriangle className="w-4 h-4" /><span>Requiere pago</span></div>)}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${selectedRegistration.attendance_confirmed && selectedRegistration.status === 'paid' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-400'}`}><Award className="w-6 h-6" /></div><div><h4 className="font-bold text-gray-800">Certificado</h4><p className="text-xs text-gray-500">Disponible tras completar proceso.</p></div></div>
                            {selectedRegistration.attendance_confirmed && selectedRegistration.status === 'paid' ? <button onClick={() => generateCertificate(selectedRegistration)} className="text-teal-600 hover:text-teal-800 font-semibold text-sm flex items-center gap-1 border border-teal-200 px-3 py-1.5 rounded-lg bg-white hover:bg-teal-50 transition"><Download className="w-4 h-4" /> Descargar</button> : <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 flex items-center gap-1"><Lock className="w-3 h-3" /> Bloqueado</span>}
                        </div>
                        <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Notas Privadas</label><textarea defaultValue={selectedRegistration.notes} onBlur={(e) => updateNotes(selectedRegistration.id, e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none" rows={2} placeholder="Escribe notas internas..." /></div>
                    </div>
                ) : (
                    <div className="animate-in fade-in">{renderAuditLogs()}</div>
                )}
              </div>
            </div>

            {showForceAuth && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border border-gray-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-4">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Aprobación Manual</h3>
                    <p className="text-sm text-gray-500 mb-6">Este usuario <strong>no adjuntó comprobante</strong>.<br/><br/>¿Confirmas que verificaste el pago de <strong>${paymentAmount} {paymentCurrency}</strong> en el banco?</p>
                    <div className="flex gap-3 w-full">
                      <button onClick={() => setShowForceAuth(false)} className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition">Cancelar</button>
                      <button onClick={() => executeStatusUpdate(selectedRegistration.id, 'paid')} className="flex-1 px-4 py-2 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition shadow-sm">Confirmar</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {showDeleteConfirm && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in zoom-in-95 duration-200">
                <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full border-2 border-red-100">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 border-4 border-red-50">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">¿Estás seguro?</h3>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                      Estás a punto de eliminar el registro de <br/>
                      <strong className="text-gray-800">{selectedRegistration.full_name}</strong>.
                      <br/><br/>
                      <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-bold text-xs">Esta acción es irreversible</span>
                    </p>
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={confirmDelete}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition shadow-lg shadow-red-200"
                      >
                        Sí, eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationsDashboard;
