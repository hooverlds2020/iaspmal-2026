import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { DollarSign, TrendingUp, Users, Download, Calendar } from 'lucide-react';

const FinancesDashboard = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    totalAmount: 0,
    byCategory: {}
  });

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const regs = data || [];
      setRegistrations(regs);

      // Calcular estadísticas
      const paidRegistrations = regs.filter(r => r.status === 'paid');
      const totalAmount = paidRegistrations.reduce((sum, r) => sum + (parseFloat(r.payment_amount) || 0), 0);

      // Agrupar por categoría
      const byCategory = {};
      paidRegistrations.forEach(r => {
        if (!byCategory[r.category]) {
          byCategory[r.category] = { count: 0, amount: 0 };
        }
        byCategory[r.category].count++;
        byCategory[r.category].amount += parseFloat(r.payment_amount) || 0;
      });

      setStats({
        total: regs.length,
        paid: paidRegistrations.length,
        pending: regs.filter(r => r.status === 'pending').length,
        totalAmount,
        byCategory
      });
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  const exportToCSV = () => {
    const paidRegs = registrations.filter(r => r.status === 'paid');
    const csv = [
      ['Nombre', 'Email', 'Categoría', 'Monto', 'Moneda', 'Fecha de Pago'].join(','),
      ...paidRegs.map(r => [
        r.full_name,
        r.email,
        getCategoryLabel(r.category),
        r.payment_amount || 0,
        r.payment_currency || 'MXN',
        r.payment_date || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzas-iaspmal-2026-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Dashboard Financiero
            </h1>
            <p className="text-gray-600">
              XVII Congreso IASPM-AL 2026
            </p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Inscripciones</div>
                <div className="text-3xl font-bold text-gray-800">{stats.total}</div>
              </div>
              <Users className="w-10 h-10 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Pagos Confirmados</div>
                <div className="text-3xl font-bold text-gray-800">{stats.paid}</div>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Pendientes</div>
                <div className="text-3xl font-bold text-gray-800">{stats.pending}</div>
              </div>
              <Calendar className="w-10 h-10 text-yellow-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-600 mb-1">Total Recaudado</div>
                <div className="text-3xl font-bold text-gray-800">
                  {formatCurrency(stats.totalAmount)}
                </div>
              </div>
              <DollarSign className="w-10 h-10 text-teal-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Ingresos por Categoría */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Ingresos por Categoría
          </h2>
          <div className="space-y-4">
            {Object.entries(stats.byCategory).map(([category, data]) => (
              <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-800">{getCategoryLabel(category)}</div>
                  <div className="text-sm text-gray-600">{data.count} inscripciones</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-teal-600">
                    {formatCurrency(data.amount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabla de Pagos */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">
              Detalle de Pagos Confirmados
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {registrations.filter(r => r.status === 'paid').map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{reg.full_name}</div>
                      <div className="text-sm text-gray-500">{reg.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {getCategoryLabel(reg.category)}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-teal-600">
                      {formatCurrency(parseFloat(reg.payment_amount) || 0)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {reg.payment_date ? new Date(reg.payment_date).toLocaleDateString('es-ES') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancesDashboard;
