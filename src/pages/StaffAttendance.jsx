// src/pages/StaffAttendance.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { CheckCircle, XCircle, User, Search, Loader, RefreshCw } from 'lucide-react';

const StaffAttendance = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState(null);
  const [manualCode, setManualCode] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [paidParticipants, setPaidParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0 });
  const inputRef = useRef(null);

  useEffect(() => {
    checkUser();
    fetchPaidParticipants();

    // ENFOCAR AUTOMÁTICAMENTE EL CAMPO AL CARGAR
    // Esto permite usar lectores USB sin tocar el mouse
    if(inputRef.current) inputRef.current.focus();

    // DETECTAR CÓDIGO EN LA URL (Para "Magic Links" desde el Dashboard)
    // Ejemplo: /staff/attendance?code=IASP-123
    const codeFromUrl = searchParams.get('code');
    if (codeFromUrl) {
      setManualCode(codeFromUrl);
      confirmAttendance(codeFromUrl);
      setSearchParams({}); // Limpiar URL
    }
  }, [searchParams]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchPaidParticipants = async () => {
    try {
      // Cargamos TODOS los participantes pagados para búsqueda rápida local
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .not('approved_at', 'is', null)
        .order('full_name');
      
      if (error) throw error;
      setPaidParticipants(data || []);
      
      const total = data?.length || 0;
      const confirmed = data?.filter(p => p.attendance_confirmed).length || 0;
      setStats({ total, confirmed, pending: total - confirmed });
    } catch (error) { console.error(error); }
  };

  const confirmAttendance = async (code) => {
    if (!code || !code.trim()) return;
    
    // Limpieza básica del código
    const cleanCode = code.toUpperCase().trim();
    
    setLoading(true);
    setResult(null);

    try {
      // 1. Buscar participante
      const { data: registration, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('attendance_code', cleanCode)
        .single();

      if (error || !registration) {
        setResult({ success: false, message: `Código no encontrado: ${cleanCode}` });
        setLoading(false); 
        // Re-enfocar para el siguiente intento
        if(inputRef.current) inputRef.current.focus();
        return;
      }

      // 2. Validar pago
      if (!registration.approved_at) {
        setResult({ success: false, message: `⚠️ Pago NO confirmado: ${registration.full_name}`, data: registration });
        setLoading(false); return;
      }

      // 3. Validar si ya entró
      if (registration.attendance_confirmed) {
        setResult({
          success: true, alreadyRegistered: true,
          message: `${registration.full_name} ya está registrado.`,
          data: registration,
          previousDate: new Date(registration.attendance_date).toLocaleString('es-MX')
        });
        setLoading(false); return;
      }

      // 4. Registrar Asistencia
      const updateData = { attendance_confirmed: true, attendance_date: new Date().toISOString() };
      if (user?.id) updateData.attendance_confirmed_by = user.id;

      const { error: updateError } = await supabase
        .from('registrations').update(updateData).eq('id', registration.id);

      if (updateError) throw updateError;

      // 5. Éxito
      setResult({
        success: true, message: `¡Bienvenido/a!`,
        data: { ...registration, ...updateData }
      });
      
      // Actualizar lista local sin recargar todo
      updateLocalList(registration.id);
      
      setManualCode('');
      // Mantener el foco para el siguiente escaneo rápido
      if(inputRef.current) inputRef.current.focus();

      // Limpiar mensaje a los 5 segundos
      setTimeout(() => setResult(null), 5000);

    } catch (error) {
      setResult({ success: false, message: error.message });
    } finally {
      setLoading(false);
    }
  };

  const updateLocalList = (id) => {
    setPaidParticipants(prev => prev.map(p => 
      p.id === id ? { ...p, attendance_confirmed: true } : p
    ));
    setStats(prev => ({ ...prev, confirmed: prev.confirmed + 1, pending: prev.pending - 1 }));
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualCode.trim()) confirmAttendance(manualCode);
  };

  // Filtrado inteligente
  const filteredParticipants = paidParticipants.filter(p => {
    const term = searchTerm.toLowerCase();
    const matches = p.full_name.toLowerCase().includes(term) ||
                    p.email.toLowerCase().includes(term) ||
                    (p.attendance_code && p.attendance_code.toLowerCase().includes(term));
    // Mostrar solo pendientes a menos que se busque específicamente
    return matches && (!p.attendance_confirmed || term.length > 0);
  });

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* COLUMNA IZQUIERDA: ESTADÍSTICAS Y ESCÁNER */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-teal-600">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Control de Acceso</h1>
            <div className="space-y-4">
               <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                 <span className="text-blue-700 font-medium">Total Pagados</span>
                 <span className="text-2xl font-bold text-blue-800">{stats.total}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                 <span className="text-green-700 font-medium">En el evento</span>
                 <span className="text-2xl font-bold text-green-800">{stats.confirmed}</span>
               </div>
               <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                 <span className="text-orange-700 font-medium">Pendientes</span>
                 <span className="text-2xl font-bold text-orange-800">{stats.pending}</span>
               </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
             <h2 className="text-lg font-bold text-gray-700 mb-3">Entrada Rápida</h2>
             <form onSubmit={handleManualSubmit}>
               <div className="relative">
                 <input
                    ref={inputRef}
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                    placeholder="Código (o Escáner USB)..."
                    className="w-full px-4 py-4 border-2 border-gray-300 rounded-xl text-lg font-mono uppercase focus:ring-4 focus:ring-teal-100 focus:border-teal-500 transition-all text-center"
                    maxLength="13"
                    autoComplete="off"
                 />
               </div>
               <button 
                  type="submit" 
                  disabled={loading || !manualCode} 
                  className="w-full mt-3 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl transition flex justify-center items-center gap-2"
               >
                  {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'REGISTRAR ENTRADA'}
               </button>
             </form>
             <p className="text-xs text-gray-400 mt-3 text-center">
               Conecta un lector USB y escanea el código directamente en la caja de texto.
             </p>
          </div>

          {/* TARJETA DE RESULTADO */}
          {result && (
            <div className={`p-6 rounded-xl border-2 shadow-lg animate-in zoom-in duration-200 ${result.success ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
              <div className="flex flex-col items-center text-center">
                {result.success ? <CheckCircle className="w-16 h-16 text-green-600 mb-3" /> : <XCircle className="w-16 h-16 text-red-600 mb-3" />}
                <h3 className={`text-xl font-bold ${result.success ? 'text-green-900' : 'text-red-900'}`}>{result.message}</h3>
                
                {result.data && (
                   <div className="mt-4 w-full bg-white/60 p-4 rounded-lg">
                     <p className="text-2xl font-bold text-gray-800">{result.data.full_name}</p>
                     <p className="text-gray-600 font-medium">{result.data.category}</p>
                     <p className="text-sm text-gray-500">{result.data.country}</p>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: LISTA DE BÚSQUEDA */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md flex flex-col h-[85vh]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center gap-4">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <User className="text-teal-600" /> Lista de Asistentes
            </h2>
            <button onClick={fetchPaidParticipants} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Actualizar lista">
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Buscar por nombre, correo o país..." 
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white shadow-sm" 
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-2">
            {filteredParticipants.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-gray-400">
                 <Search className="w-12 h-12 mb-2 opacity-20" />
                 <p>No se encontraron participantes</p>
               </div>
            ) : (
               filteredParticipants.map((p) => (
                <div key={p.id} className={`flex flex-col sm:flex-row justify-between items-center p-4 rounded-xl border transition group ${p.attendance_confirmed ? 'bg-green-50 border-green-100 opacity-70' : 'bg-white border-gray-100 hover:border-teal-200 hover:shadow-md'}`}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <p className="font-bold text-gray-900 truncate">{p.full_name}</p>
                       {p.attendance_confirmed && <span className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded-full font-bold">✓ Adentro</span>}
                    </div>
                    <p className="text-sm text-gray-600">{p.category} • {p.country}</p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{p.attendance_code}</p>
                  </div>
                  
                  {!p.attendance_confirmed && (
                    <button 
                      onClick={() => confirmAttendance(p.attendance_code)} 
                      className="mt-3 sm:mt-0 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg font-bold shadow-sm transition transform active:scale-95 whitespace-nowrap"
                    >
                      Confirmar Entrada
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
          <div className="p-3 text-center text-xs text-gray-400 border-t">
             Mostrando {filteredParticipants.length} resultados
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffAttendance;
