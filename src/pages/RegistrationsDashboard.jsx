import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sendPaymentApproval, sendRejectionNotice } from '../lib/resendClient';
import { Download, Eye, Check, X, RefreshCw, Search } from 'lucide-react';

const RegistrationsDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, paid, rejected
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('MXN');
  const [paymentMethod, setPaymentMethod] = useState('transferencia');


  const fetchRegistrations = async () => {
    try {
      setLoading(true);
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
    fetchRegistrations();
  }, [filter]);

  const updateStatus = async (id, newStatus) => {
    try {
      // Validar monto si se marca como pagado
      if (newStatus === 'paid' && (!paymentAmount || parseFloat(paymentAmount) <= 0)) {
        alert('Por favor ingresa el monto del pago');
        return;
      }
      
      const registration = registrations.find(r => r.id === id);
      
      // Preparar datos de actualización
      const updateData = { 
        status: newStatus,
        payment_date: newStatus === 'paid' ? new Date().toISOString().split('T')[0] : null
      };
      
      // Agregar información de pago si se aprueba
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
      
      fetchRegistrations();
      setSelectedRegistration(null);
      setPaymentAmount('');
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar el estado');
    }
  };

  const updateNotes = async (id, notes) => {
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ notes })
        .eq('id', id);

      if (error) throw error;
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating notes:', error);
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
            <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="text-sm text-gray-600 mb-1">Pendientes</div>
            <div className="text-3xl font-bold text-gray-800">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="text-sm text-gray-600 mb-1">Pagados</div>
            <div className="text-3xl font-bold text-gray-800">{stats.paid}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-500">
            <div className="text-sm text-gray-600 mb-1">Rechazados</div>
            <div className="text-3xl font-bold text-gray-800">{stats.rejected}</div>
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
                onClick={fetchRegistrations}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
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
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRegistrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50">
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
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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


                  {/* Información de Pago */}
                  {selectedRegistration.status !== 'paid' && (
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-gray-800 mb-3">Información de Pago</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Monto *</label>
                          <input
                            type="number"
                            step="0.01"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="0.00"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-semibold text-gray-600">Moneda</label>
                          <select
                            value={paymentCurrency}
                            onChange={(e) => setPaymentCurrency(e.target.value)}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="MXN">MXN (Pesos Mexicanos)</option>
                            <option value="USD">USD (Dólares)</option>
                          </select>
                        </div>
                      </div>
                      <div className="mt-3">
                        <label className="text-sm font-semibold text-gray-600">Método de Pago</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                        >
                          <option value="transferencia">Transferencia Bancaria</option>
                          <option value="deposito">Depósito en Efectivo</option>
                          <option value="tarjeta">Tarjeta de Crédito/Débito</option>
                          <option value="otro">Otro</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {selectedRegistration.status === 'paid' && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h3 className="font-semibold text-gray-800 mb-2">Pago Confirmado</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">Monto:</span>
                          <span className="ml-2 font-semibold">{selectedRegistration.payment_currency} ${selectedRegistration.payment_amount?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Método:</span>
                          <span className="ml-2 font-semibold capitalize">{selectedRegistration.payment_method || '-'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => updateStatus(selectedRegistration.id, 'paid')}
                      disabled={selectedRegistration.status === 'paid'}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Marcar como Pagado
                    </button>
                    <button
                      onClick={() => updateStatus(selectedRegistration.id, 'rejected')}
                      disabled={selectedRegistration.status === 'rejected'}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Rechazar
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
