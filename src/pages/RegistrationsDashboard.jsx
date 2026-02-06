// src/pages/RegistrationsDashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sendPaymentApproval, sendRejectionNotice } from '../lib/resendClient';
import { Download, Eye, Check, X, RefreshCw, Search, QrCode, ExternalLink, Award, Lock } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { jsPDF } from 'jspdf'; // Importamos la librería de PDF

const RegistrationsDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
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


  const fetchRegistrations = async () => {
    try {
      let query = supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRegistrations();

    console.log('📡 Conectando a actualizaciones en tiempo real...');
    const channel = supabase
      .channel('registrations-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'registrations',
        },
        (payload) => {
          console.log('⚡ Cambio detectado en la BD:', payload.new.id);
          setRegistrations(currentRegs => 
            currentRegs.map(reg => 
              reg.id === payload.new.id ? payload.new : reg
            )
          );

          if (selectedRegistrationRef.current && selectedRegistrationRef.current.id === payload.new.id) {
            setSelectedRegistration(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // --- FUNCIÓN GENERADORA DE CONSTANCIA (PDF) ---
  const generateCertificate = (reg) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Colores corporativos
    const primaryColor = [5, 150, 105]; // Teal 600
    const darkColor = [31, 41, 55]; // Gray 800

    // Borde decorativo
    doc.setLineWidth(2);
    doc.setDrawColor(...primaryColor);
    doc.rect(10, 10, 277, 190);

    // Encabezado
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.text('CONSTANCIA DE PARTICIPACIÓN', 148.5, 40, { align: 'center' });

    // Texto de otorgamiento
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(14);
    doc.setTextColor(...darkColor);
    doc.text('El Comité Organizador del XVII Congreso de la IASPM-AL otorga la presente a:', 148.5, 60, { align: 'center' });

    // NOMBRE DEL PARTICIPANTE
    doc.setFont('times', 'bold'); // Tipografía más elegante para el nombre
    doc.setFontSize(32);
    doc.setTextColor(0, 0, 0);
    doc.text(reg.full_name, 148.5, 85, { align: 'center' });

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(70, 90, 227, 90);

    // Texto del cuerpo
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(...darkColor);
    const categoryText = getCategoryLabel(reg.category).toUpperCase();
    
    doc.text(`Por su valiosa participación en calidad de ${categoryText}`, 148.5, 105, { align: 'center' });
    
    doc.text('en el XVII Congreso de la Asociación Internacional para el Estudio', 148.5, 120, { align: 'center' });
    doc.text('de la Música Popular - Rama Latinoamericana (IASPM-AL).', 148.5, 130, { align: 'center' });

    // Detalles del evento
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Celebrado en San Cristóbal de Las Casas, Chiapas, México', 148.5, 150, { align: 'center' });
    doc.text('del 28 de septiembre al 2 de octubre de 2026.', 148.5, 160, { align: 'center' });

    // Firmas (Simuladas con texto por ahora)
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('_________________________', 90, 180, { align: 'center' });
    doc.text('_________________________', 207, 180, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text('Comité Organizador', 90, 185, { align: 'center' });
    doc.text('Presidencia IASPM-AL', 207, 185, { align: 'center' });

    // Guardar PDF
    doc.save(`Constancia_${reg.full_name.replace(/\s+/g, '_')}.pdf`);
  };


  const updateStatus = async (id, newStatus) => {
    try {
      if (newStatus === 'paid' && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
        alert('Por favor ingresa el monto del pago');
        return;
      }
      
      const registration = registrations.find(r => r.id === id);
      
      const updateData = { 
        status: newStatus,
        payment_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
      };
      
      if (newStatus === 'paid') {
        updateData.payment_amount = parseFloat(paymentAmount);
        updateData.payment_currency = paymentCurrency;
        updateData.payment_method = paymentMethod;
      }
      
      const { error } = await supabase
        .from('registrations')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      if (newStatus === 'paid') {
        const emailResult = await sendPaymentApproval(
          registration.email, 
          registration.full_name,
          registration.attendance_code,
          registration.category
        );
        if (emailResult.success) console.log('Email enviado');
      } else if (newStatus === 'rejected') {
        sendRejectionNotice(registration.email, registration.full_name);
      }
      
      setPaymentAmount('');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const confirmAttendance = async (id) => {
    try {
      const registration = registrations.find(r => r.id === id);
      
      if (registration.status !== 'paid') {
        alert('Participante sin pago confirmado');
        return;
      }
      
      const { error } = await supabase
        .from('registrations')
        .update({
          attendance_confirmed: true,
          attendance_date: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      alert('Asistencia confirmada');
    } catch (error) {
      console.error('Error:', error);
    }
  };


  const updateNotes = async (id, notes) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ notes })
        .eq('id', id);
      if (error) throw error;
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'sur_global': 'Sur Global',
      'norte_global': 'Norte Global',
      'institucion_convocante': 'Institución Convocante',
      'estudiante': 'Estudiante',
      'asistente': 'Asistente'
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    const labels = {
      pending: 'Pendiente',
      paid: 'Pagado',
      rejected: 'Rechazado'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const filteredRegistrations = registrations.filter(reg => 
    reg.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'pending').length,
    paid: registrations.filter(r => r.status === 'paid').length,
    rejected: registrations.filter(r => r.status === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Gestión de Inscripciones
          </h1>
          <p className="text-gray-600">
            XVII Congreso IASPM-AL 2026
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="text-sm text-gray-600 mb-1">Total</div>
            <div className="text-3xl font-bold text-gray-800 animate-in fade-in">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">Pendientes</div>
            <div className="text-3xl font-bold text-gray-800 animate-in fade-in">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Pagados</div>
            <div className="text-3xl font-bold text-gray-800 animate-in fade-in">{stats.paid}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Rechazados</div>
            <div className="text-3xl font-bold text-gray-800 animate-in fade-in">{stats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'all' ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({stats.total})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pendientes ({stats.pending})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filter === 'paid' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pagados ({stats.paid})
              </button>
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => { setLoading(true); fetchRegistrations(); }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No hay inscripciones {filter !== 'all' && `con estado "${filter}"`}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participante
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      País
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asistencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{reg.full_name}</div>
                        <div className="text-sm text-gray-500">{reg.email}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {reg.country}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {getCategoryLabel(reg.category)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(reg.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                          reg.attendance_confirmed
                            ? 'bg-blue-100 text-blue-800 scale-105'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {reg.attendance_confirmed ? '✓ Confirmada' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(reg.created_at).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setSelectedRegistration(reg)}
                          className="text-teal-600 hover:text-teal-900 font-medium text-sm flex items-center gap-1 mx-auto"
                        >
                          <Eye className="w-4 h-4" />
                          Ver detalles
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de detalles */}
        {selectedRegistration && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-800">
                    Detalles de Inscripción
                  </h2>
                  <button
                    onClick={() => setSelectedRegistration(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* ... Datos personales (igual que antes) ... */}
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Nombre completo</label>
                    <p className="text-gray-900">{selectedRegistration.full_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-600">Email</label>
                    <p className="text-gray-900">{selectedRegistration.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-600">País</label>
                      <p className="text-gray-900">{selectedRegistration.country}</p>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Categoría</label>
                      <p className="text-gray-900">{getCategoryLabel(selectedRegistration.category)}</p>
                    </div>
                  </div>

                  {selectedRegistration.presentation_title && (
                    <div>
                      <label className="text-sm font-semibold text-gray-600">Título de ponencia</label>
                      <p className="text-gray-900">{selectedRegistration.presentation_title}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Comprobante de pago</label>
                    {selectedRegistration.payment_proof_url ? (
                        <a
                        href={selectedRegistration.payment_proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium mt-1"
                      >
                        <Download className="w-4 h-4" />
                        Ver comprobante
                      </a>
                    ) : (
                      <p className="text-gray-500 text-sm">Sin comprobante</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-gray-600">Estado actual</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedRegistration.status)}
                    </div>
                  </div>

                  {/* Sección de Asistencia y QR */}
                  <div className={`bg-gradient-to-br p-6 rounded-xl border-2 transition-all duration-500 ${
                    selectedRegistration.attendance_confirmed 
                      ? 'from-green-50 to-teal-50 border-green-200' 
                      : 'from-blue-50 to-indigo-50 border-blue-200'
                  }`}>
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <QrCode className={`w-5 h-5 ${selectedRegistration.attendance_confirmed ? 'text-green-600' : 'text-blue-600'}`} />
                      Control de Asistencia
                    </h3>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Columna Izquierda: Estado y Botones */}
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Estado</label>
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                            selectedRegistration.attendance_confirmed
                              ? 'bg-green-100 text-green-800 border-2 border-green-300 scale-105'
                              : 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                          }`}>
                            {selectedRegistration.attendance_confirmed ? '✓ Confirmada' : '⏳ Pendiente'}
                          </span>
                        </div>
                        {selectedRegistration.attendance_date && (
                          <p className="text-xs text-gray-500 mt-2 animate-in fade-in">
                            Registrada: {new Date(selectedRegistration.attendance_date).toLocaleString('es-MX', {
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        )}
                        
                        {!selectedRegistration.attendance_confirmed && selectedRegistration.status === 'paid' && (
                          <div className="mt-4 flex flex-col gap-2">
                            <button
                              onClick={() => confirmAttendance(selectedRegistration.id)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                            >
                              <Check className="w-4 h-4" />
                              Confirmar Entrada (Directo)
                            </button>
                            <a 
                                href={`/staff/attendance?code=${selectedRegistration.attendance_code}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2 text-sm"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Abrir en Staff
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Columna Derecha: QR */}
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-2">Código QR Personal</label>
                        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                          <div className="text-center mb-3 border-b border-gray-100 pb-2">
                            <p className="font-bold text-gray-900 text-lg leading-tight">
                              {selectedRegistration.full_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                              {getCategoryLabel(selectedRegistration.category)}
                            </p>
                          </div>
                          <div className="flex justify-center mb-3">
                            <QRCodeCanvas 
                              value={`https://iaspm-al-2026.clickwebhoover.online/asistencia?code=${selectedRegistration.attendance_code}`}
                              size={180} level="H" includeMargin={true}
                            />
                          </div>
                          <div className="text-center">
                            <p className="font-mono font-bold text-xl text-gray-800 tracking-widest bg-gray-100 rounded py-1 mb-1">
                              {selectedRegistration.attendance_code}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- NUEVA SECCIÓN: CONSTANCIAS --- */}
                  <div className="bg-amber-50 p-6 rounded-xl border-2 border-amber-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-amber-600" />
                      Certificado de Participación
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                         <p className="text-sm text-gray-600">
                           {selectedRegistration.attendance_confirmed && selectedRegistration.status === 'paid'
                             ? 'La constancia está lista para generar.'
                             : 'Se requiere confirmar asistencia y pago para desbloquear.'}
                         </p>
                      </div>

                      {/* Botón de Descarga condicional */}
                      {selectedRegistration.attendance_confirmed && selectedRegistration.status === 'paid' ? (
                        <button
                          onClick={() => generateCertificate(selectedRegistration)}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2 px-6 rounded-lg transition flex items-center gap-2 shadow-sm"
                        >
                          <Download className="w-5 h-5" />
                          Descargar PDF
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-200 text-gray-400 font-semibold py-2 px-6 rounded-lg flex items-center gap-2 cursor-not-allowed"
                        >
                          <Lock className="w-5 h-5" />
                          Bloqueado
                        </button>
                      )}
                    </div>
                  </div>
                  {/* --- FIN CONSTANCIAS --- */}


                  <div>
                    <label className="text-sm font-semibold text-gray-600">Notas internas</label>
                    <textarea
                      defaultValue={selectedRegistration.notes || ''}
                      onBlur={(e) => updateNotes(selectedRegistration.id, e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      rows={3}
                      placeholder="Agregar notas..."
                    />
                  </div>

                  {/* Información de Pago (si falta) */}
                  {selectedRegistration.status !== 'paid' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                       <h3 className="font-semibold text-gray-800 mb-3">Información de Pago</h3>
                       {/* ... Inputs de pago ... */}
                       <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Monto *</label>
                          <input type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Moneda</label>
                          <select value={paymentCurrency} onChange={(e) => setPaymentCurrency(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg">
                            <option value="MXN">MXN (Pesos)</option> <option value="USD">USD (Dólares)</option>
                          </select>
                        </div>
                      </div>
                       <div className="mt-3">
                        <label className="text-sm font-semibold text-gray-600">Método</label>
                        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg">
                          <option value="transferencia">Transferencia</option> <option value="deposito">Depósito</option> <option value="tarjeta">Tarjeta</option> <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => updateStatus(selectedRegistration.id, 'paid')}
                      disabled={selectedRegistration.status === 'paid'}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Marcar Pagado
                    </button>
                    <button
                      onClick={() => updateStatus(selectedRegistration.id, 'rejected')}
                      disabled={selectedRegistration.status === 'rejected'}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Rechazar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationsDashboard;
