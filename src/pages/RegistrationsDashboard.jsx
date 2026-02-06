// src/pages/RegistrationsDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sendPaymentApproval, sendRejectionNotice } from '../lib/resendClient';
// Agregamos el icono 'Send'
import { Download, Eye, Check, X, RefreshCw, Search, QrCode, ExternalLink, Award, Lock, WifiOff, AlertTriangle, Send } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

// ... (El componente TableSkeleton sigue igual) ...
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
        <div className="w-24 h-8 bg-gray-200 rounded"></div>
      </div>
    ))}
  </div>
);

const RegistrationsDashboard = () => {
  // ... (Estados y useEffects siguen igual) ...
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorState, setErrorState] = useState(false);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('MXN');
  const [paymentMethod, setPaymentMethod] = useState('transferencia');
  
  const selectedRegistrationRef = useRef(selectedRegistration);

  useEffect(() => {
    selectedRegistrationRef.current = selectedRegistration;
  }, [selectedRegistration]);

  // ... (fetchRegistrations y Realtime siguen igual) ...
  const fetchRegistrations = async () => {
    try {
      setErrorState(false);
      if (registrations.length === 0) setLoading(true);
      let query = supabase.from('registrations').select('*').order('created_at', { ascending: false });
      if (filter !== 'all') query = query.eq('status', filter);
      const { data, error } = await query;
      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error:', error);
      setErrorState(true);
      toast.error('No se pudieron cargar los datos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
    const channel = supabase.channel('registrations-updates')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'registrations' }, (payload) => {
          setRegistrations(currentRegs => currentRegs.map(reg => reg.id === payload.new.id ? payload.new : reg));
          if (selectedRegistrationRef.current && selectedRegistrationRef.current.id === payload.new.id) {
            setSelectedRegistration(payload.new);
          }
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter]);

  // ... (generateCertificate sigue igual) ...
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
        doc.save(`Constancia_${reg.full_name.replace(/\s+/g, '_')}.pdf`);
        toast.success('Constancia descargada correctamente');
    } catch (e) { toast.error('Ocurrió un error al generar el PDF'); }
  };

  // --- NUEVA FUNCIÓN: REENVIAR CORREO ---
  const handleResendEmail = async (reg) => {
    if (!reg.attendance_code) {
        toast.error('Este usuario aún no tiene código generado. Espera unos segundos.');
        return;
    }
    
    const promise = sendPaymentApproval(reg.email, reg.full_name, reg.attendance_code, reg.category);
    
    toast.promise(promise, {
        loading: 'Reenviando correo de confirmación...',
        success: '¡Correo reenviado con éxito!',
        error: 'Error al enviar el correo.'
    });
  };

  const updateStatus = async (id, newStatus) => {
    if (newStatus === 'paid' && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
      toast.warning('Por favor ingresa el monto del pago.'); return;
    }
    const promise = async () => {
      const registration = registrations.find(r => r.id === id);
      const updateData = { status: newStatus, payment_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null };
      if (newStatus === 'paid') {
        updateData.payment_amount = parseFloat(paymentAmount);
        updateData.payment_currency = paymentCurrency;
        updateData.payment_method = paymentMethod;
      }
      const { error } = await supabase.from('registrations').update(updateData).eq('id', id);
      if (error) throw error;
      if (newStatus === 'paid') { await sendPaymentApproval(registration.email, registration.full_name, registration.attendance_code, registration.category); } 
      else if (newStatus === 'rejected') { await sendRejectionNotice(registration.email, registration.full_name); }
      setPaymentAmount('');
      return newStatus === 'paid' ? 'Pago aprobado' : 'Registro rechazado';
    };
    toast.promise(promise(), { loading: 'Actualizando...', success: (msg) => msg, error: 'Error al actualizar.' });
  };

  const confirmAttendance = async (id) => {
    const promise = supabase.from('registrations').update({ attendance_confirmed: true, attendance_date: new Date().toISOString() }).eq('id', id);
    toast.promise(promise, { loading: 'Confirmando...', success: 'Asistencia confirmada', error: 'Error al confirmar' });
  };

  const updateNotes = async (id, notes) => {
    const { error } = await supabase.from('registrations').update({ notes }).eq('id', id);
    if (error) toast.error('Error al guardar nota'); else toast.success('Nota guardada');
  };

  const getCategoryLabel = (cat) => { const map = { 'sur_global': 'Sur Global', 'norte_global': 'Norte Global', 'institucion_convocante': 'Institución Convocante', 'estudiante': 'Estudiante', 'asistente': 'Asistente' }; return map[cat] || cat; };
  const getStatusBadge = (status) => { const styles = { pending: 'bg-yellow-100 text-yellow-800 border-yellow-200', paid: 'bg-green-100 text-green-800 border-green-200', rejected: 'bg-red-100 text-red-800 border-red-200' }; const labels = { pending: 'Pendiente', paid: 'Pagado', rejected: 'Rechazado' }; return <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>{labels[status]}</span>; };
  const filteredRegistrations = registrations.filter(reg => reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || reg.email.toLowerCase().includes(searchTerm.toLowerCase()) || (reg.attendance_code && reg.attendance_code.toLowerCase().includes(searchTerm.toLowerCase())));
  const stats = { total: registrations.length, pending: registrations.filter(r => r.status === 'pending').length, paid: registrations.filter(r => r.status === 'paid').length, rejected: registrations.filter(r => r.status === 'rejected').length };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8"><h1 className="text-3xl font-bold text-gray-800">Gestión de Inscripciones</h1><p className="text-gray-500 mt-1">Panel de control del XVII Congreso IASPM-AL 2026</p></div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"><p className="text-sm font-medium text-gray-500">Total Registros</p><p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p></div>
           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-yellow-400"><p className="text-sm font-medium text-gray-500">Pendientes</p><p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pending}</p></div>
           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500"><p className="text-sm font-medium text-gray-500">Pagados</p><p className="text-3xl font-bold text-green-600 mt-2">{stats.paid}</p></div>
           <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500"><p className="text-sm font-medium text-gray-500">Rechazados</p><p className="text-3xl font-bold text-red-600 mt-2">{stats.rejected}</p></div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
              {['all', 'pending', 'paid'].map(f => ( <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filter === f ? 'bg-teal-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes de Pago' : 'Pagados'}</button> ))}
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" /><input type="text" placeholder="Buscar por nombre, correo o código..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition" /></div>
              <button onClick={() => { setLoading(true); fetchRegistrations(); }} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition border border-gray-300" title="Actualizar datos"><RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /></button>
            </div>
        </div>

        {/* Tabla */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
          {loading ? <TableSkeleton /> : errorState ? <div className="flex flex-col items-center justify-center py-20 text-center"><WifiOff className="w-16 h-16 text-gray-300 mb-4" /><h3 className="text-xl font-bold text-gray-700">Error de conexión</h3><button onClick={() => fetchRegistrations()} className="bg-teal-600 text-white px-6 py-2 rounded-lg mt-4">Reintentar</button></div> : filteredRegistrations.length === 0 ? <div className="flex flex-col items-center justify-center py-20 text-center"><Search className="w-16 h-16 text-gray-200 mb-4" /><h3 className="text-lg font-medium text-gray-900">No se encontraron resultados</h3></div> : (
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
                      <td className="px-6 py-4 text-center"><button onClick={() => setSelectedRegistration(reg)} className="text-teal-600 hover:text-teal-800 hover:bg-teal-50 px-3 py-1.5 rounded-md text-sm font-medium transition flex items-center justify-center gap-1 mx-auto"><Eye className="w-4 h-4" /> Detalles</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal Detalle */}
        {selectedRegistration && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
                <div><h2 className="text-xl font-bold text-gray-800">{selectedRegistration.full_name}</h2><p className="text-sm text-gray-500">{selectedRegistration.email}</p></div>
                <button onClick={() => setSelectedRegistration(null)} className="p-2 hover:bg-gray-100 rounded-full transition"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="p-6 space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Detalles Generales</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div><p className="text-xs text-gray-500">País</p><p className="font-medium">{selectedRegistration.country}</p></div>
                            <div><p className="text-xs text-gray-500">Categoría</p><p className="font-medium">{getCategoryLabel(selectedRegistration.category)}</p></div>
                            <div className="col-span-2"><p className="text-xs text-gray-500">Comprobante</p>{selectedRegistration.payment_proof_url ? <a href={selectedRegistration.payment_proof_url} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline flex items-center gap-1"><Download className="w-3 h-3" /> Ver archivo</a> : <span className="text-sm text-gray-400">No adjuntado</span>}</div>
                        </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">Estado del Pago {getStatusBadge(selectedRegistration.status)}</h3>
                        {selectedRegistration.status !== 'paid' && (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-2"><input type="number" placeholder="Monto" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)} className="text-sm border rounded px-2 py-1" /><select value={paymentCurrency} onChange={e => setPaymentCurrency(e.target.value)} className="text-sm border rounded px-2 py-1"><option value="MXN">MXN</option><option value="USD">USD</option></select></div>
                                <div className="flex gap-2"><button onClick={() => updateStatus(selectedRegistration.id, 'paid')} className="flex-1 bg-green-600 text-white py-1.5 rounded text-sm hover:bg-green-700 transition">Aprobar</button><button onClick={() => updateStatus(selectedRegistration.id, 'rejected')} className="flex-1 bg-white border border-red-200 text-red-600 py-1.5 rounded text-sm hover:bg-red-50 transition">Rechazar</button></div>
                            </div>
                        )}
                        {/* BOTÓN DE REENVIAR CORREO - SOLO APARECE SI ESTÁ PAGADO */}
                        {selectedRegistration.status === 'paid' && (
                            <div className="space-y-2">
                                <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100">Pago aprobado el {selectedRegistration.payment_date}.</div>
                                <button 
                                    onClick={() => handleResendEmail(selectedRegistration)}
                                    className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-1.5 rounded text-sm hover:bg-gray-50 transition"
                                >
                                    <Send className="w-3 h-3" /> Reenviar Correo de Gafete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={`border-2 rounded-xl p-5 ${selectedRegistration.attendance_confirmed ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200'}`}>
                    <div className="flex flex-col md:flex-row gap-6 items-center">
                        <div className="bg-white p-2 rounded shadow-sm border border-gray-100">
                             <QRCodeCanvas value={`https://iaspm-al-2026.clickwebhoover.online/asistencia?code=${selectedRegistration.attendance_code}`} size={140} />
                             <p className="text-center text-xs font-mono font-bold mt-2 tracking-widest">{selectedRegistration.attendance_code}</p>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-3">
                            <div><h3 className="text-lg font-bold text-gray-800">Control de Acceso</h3><p className="text-sm text-gray-500">Escanea el QR para registrar entrada</p></div>
                            {selectedRegistration.attendance_confirmed ? <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold"><Check className="w-5 h-5" /> Entrada Registrada</div> : (selectedRegistration.status === 'paid' ? <button onClick={() => confirmAttendance(selectedRegistration.id)} className="w-full md:w-auto bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm">Confirmar Entrada Manualmente</button> : <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-sm border border-amber-200"><AlertTriangle className="w-4 h-4" /><span>Requiere pago para registrar asistencia</span></div>)}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${selectedRegistration.attendance_confirmed && selectedRegistration.status === 'paid' ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-400'}`}><Award className="w-6 h-6" /></div><div><h4 className="font-bold text-gray-800">Certificado Digital</h4><p className="text-xs text-gray-500">Disponible tras completar pago y asistencia.</p></div></div>
                    {selectedRegistration.attendance_confirmed && selectedRegistration.status === 'paid' ? <button onClick={() => generateCertificate(selectedRegistration)} className="text-teal-600 hover:text-teal-800 font-semibold text-sm flex items-center gap-1 border border-teal-200 px-3 py-1.5 rounded-lg bg-white hover:bg-teal-50 transition"><Download className="w-4 h-4" /> Descargar</button> : <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200 flex items-center gap-1"><Lock className="w-3 h-3" /> Bloqueado</span>}
                </div>

                <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Notas Privadas</label><textarea defaultValue={selectedRegistration.notes} onBlur={(e) => updateNotes(selectedRegistration.id, e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none" rows={2} placeholder="Escribe notas internas sobre este participante..." /></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationsDashboard;
