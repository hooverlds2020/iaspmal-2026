// src/components/admin/TrasladosManager.jsx
// Panel de administración: registros de "Traslados del aeropuerto" por día y horario.
import React, { useState, useEffect } from 'react';
import { Trash2, Download, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const DIAS = [
  { key: '2026-09-26', label: 'Sábado 26' },
  { key: '2026-09-27', label: 'Domingo 27' },
  { key: '2026-09-28', label: 'Lunes 28' },
  { key: '2026-09-29', label: 'Martes 29' },
];

const TrasladosManager = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroDia, setFiltroDia] = useState('todos');

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    setLoading(true);
    const { data, error } = await supabase
      .from('traslados_aeropuerto')
      .select('*')
      .order('dia', { ascending: true })
      .order('horario', { ascending: true })
      .order('created_at', { ascending: true });
    if (!error) setRegistros(data || []);
    setLoading(false);
  }

  async function eliminar(id) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    const { error } = await supabase.from('traslados_aeropuerto').delete().eq('id', id);
    if (!error) setRegistros((prev) => prev.filter((r) => r.id !== id));
  }

  function exportarCSV() {
    const filas = [['Día', 'Horario', 'Nombre', 'Vuelo']];
    registrosFiltrados.forEach((r) => {
      filas.push([r.dia, r.horario, r.nombre, r.vuelo || '']);
    });
    const csv = filas.map((f) => f.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `traslados_aeropuerto_${filtroDia}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const registrosFiltrados =
    filtroDia === 'todos' ? registros : registros.filter((r) => r.dia === filtroDia);

  // Conteo por día + horario para vista resumen
  const resumen = {};
  registrosFiltrados.forEach((r) => {
    const key = `${r.dia}__${r.horario}`;
    resumen[key] = (resumen[key] || 0) + 1;
  });

  const diaLabel = (dia) => DIAS.find((d) => d.key === dia)?.label || dia;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h2 className="text-xl font-black text-[#1e3a5f]">Traslados del aeropuerto</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={cargar}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
          >
            <RefreshCw size={14} /> Actualizar
          </button>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-[#1e3a5f] hover:bg-[#16283f] rounded-lg transition"
          >
            <Download size={14} /> Exportar CSV
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFiltroDia('todos')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition ${
            filtroDia === 'todos' ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos
        </button>
        {DIAS.map((d) => (
          <button
            key={d.key}
            onClick={() => setFiltroDia(d.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filtroDia === d.key ? 'bg-[#1e3a5f] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Cargando...</p>
      ) : registrosFiltrados.length === 0 ? (
        <p className="text-sm text-gray-400 italic">Aún no hay registros.</p>
      ) : (
        <>
          {/* Resumen por horario, para decidir cuántas vans y a qué hora */}
          <div className="mb-6">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
              Resumen por horario
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {Object.entries(resumen)
                .sort((a, b) => b[1] - a[1])
                .map(([key, count]) => {
                  const [dia, horario] = key.split('__');
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2 bg-gray-50"
                    >
                      <span className="text-sm text-gray-700">
                        {diaLabel(dia)} · {horario}
                      </span>
                      <span className="text-sm font-black text-[#1e3a5f]">{count}</span>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Tabla detallada */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-200">
                  <th className="py-2 pr-3">Día</th>
                  <th className="py-2 pr-3">Horario</th>
                  <th className="py-2 pr-3">Nombre</th>
                  <th className="py-2 pr-3">Vuelo</th>
                  <th className="py-2 pr-3"></th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((r) => (
                  <tr key={r.id} className="border-b border-gray-100">
                    <td className="py-2 pr-3">{diaLabel(r.dia)}</td>
                    <td className="py-2 pr-3">{r.horario}</td>
                    <td className="py-2 pr-3 font-medium text-gray-800">{r.nombre}</td>
                    <td className="py-2 pr-3">{r.vuelo || '—'}</td>
                    <td className="py-2 pr-3 text-right">
                      <button
                        onClick={() => eliminar(r.id)}
                        className="text-red-500 hover:text-red-700"
                        title="Eliminar registro"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default TrasladosManager;
