// src/components/pages/TrasladosAeropuerto.jsx
// Tabla administrada (Supabase) para que los congresistas se apunten a un transporte
// según su horario de llegada. Reemplaza el sistema hardcodeado.
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';

const DIAS = [
  { key: '2026-09-26', label: 'Sábado 26', horarios: ['7:15am', '10:15am', '1:00pm', '3:00pm', '4:00pm', '5:30pm', '7:30pm', '10:15pm', '24hrs'] },
  { key: '2026-09-27', label: 'Domingo 27', horarios: ['7:15am', '10:15am', '1:00pm', '3:30pm', '6:00pm', '7:30pm', '10:15pm', '24hrs'] },
  { key: '2026-09-28', label: 'Lunes 28', horarios: ['7:15am', '10:30am', '1:00pm', '3:00pm', '4:00pm', '5:30pm', '7:30pm', '10:15pm', '24hrs'] },
  { key: '2026-09-29', label: 'Martes 29', horarios: ['7:15am', '10:30am', '1:00pm', '4:00pm', '5:30pm', '6:00pm', '7:30pm', '10:15pm'] },
];

export default function TrasladosAeropuerto() {
  const [diaActivo, setDiaActivo] = useState(DIAS[0].key);
  const [registros, setRegistros] = useState([]);
  const [form, setForm] = useState({ horario: '', nombre: '', vuelo: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    cargarRegistros();
  }, [diaActivo]);

  async function cargarRegistros() {
    const { data, error: err } = await supabase
      .from('traslados_aeropuerto')
      .select('*')
      .eq('dia', diaActivo)
      .order('created_at', { ascending: true });
    if (!err) setRegistros(data || []);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.horario || !form.nombre) return;
    setLoading(true);
    const { error: err } = await supabase.from('traslados_aeropuerto').insert({
      dia: diaActivo,
      horario: form.horario,
      nombre: form.nombre,
      vuelo: form.vuelo || null,
    });
    setLoading(false);
    if (err) {
      setError('No se pudo guardar tu registro, intenta de nuevo.');
      return;
    }
    setForm({ horario: form.horario, nombre: '', vuelo: '' });
    cargarRegistros();
  }

  const diaInfo = DIAS.find((d) => d.key === diaActivo);

  return (
    <div className="mt-8 border-t border-gray-200 pt-6">
      <h3 className="text-base font-black text-[#1e3a5f] uppercase tracking-wide mb-3">
        Apúntate a un transporte
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Apunta tu nombre y número de vuelo en la salida que más te convenga. Así sabemos en qué
        horarios conviene organizar transportes con costo compartido para la comunidad IASPM-AL.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {DIAS.map((d) => (
          <button
            key={d.key}
            type="button"
            onClick={() => setDiaActivo(d.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              diaActivo === d.key
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 mb-6">
        {diaInfo.horarios.map((hora) => {
          const personas = registros.filter((r) => r.horario === hora);
          return (
            <div key={hora} className="border border-gray-200 rounded-xl p-3 bg-white">
              <div className="font-bold text-[#1e3a5f] mb-1.5">{hora}</div>
              {personas.length === 0 ? (
                <p className="text-xs text-gray-400 italic">Nadie registrado aún</p>
              ) : (
                <ul className="text-sm space-y-1">
                  {personas.map((p) => (
                    <li key={p.id} className="text-gray-700">
                      {p.nombre}
                      {p.vuelo ? ` — ${p.vuelo}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end bg-amber-50 border border-amber-100 rounded-xl p-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1">Horario</label>
          <select
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.horario}
            onChange={(e) => setForm({ ...form, horario: e.target.value })}
            required
          >
            <option value="">Selecciona...</option>
            {diaInfo.horarios.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Nombre</label>
          <input
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Vuelo</label>
          <input
            className="border border-gray-300 rounded px-3 py-2 text-sm"
            value={form.vuelo}
            onChange={(e) => setForm({ ...form, vuelo: e.target.value })}
            placeholder="ej. AM123"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? 'Guardando...' : 'Apuntarme'}
        </button>
      </form>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
}
