// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner'; // Mantenemos el Toaster para las notificaciones lindas
import AttendanceCheck from './pages/AttendanceCheck';
import StaffAttendance from './pages/StaffAttendance';
import CertificateDownload from './pages/CertificateDownload';
import { supabase } from './lib/supabaseClient';

// Layout components
import TopBar from './components/layout/TopBar';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileSidebar from './components/layout/MobileSidebar';
import Footer from './components/layout/Footer';

// Page components
import CallForParticipation from './components/pages/CallForParticipation';
import ScientificCommittee from './components/pages/ScientificCommittee';
import AcceptedFormats from './components/pages/AcceptedFormats';
import Program from './components/pages/Program';
import ScheduleView from './components/pages/ScheduleView';
import RegistrationForm from './components/pages/RegistrationForm';
import VenuesPage from './components/pages/VenuesPage';

// Admin pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard'; // <--- IMPORTANTE: Volvemos a usar este

const MainLayout = ({ lang, setLang }) => {
  const [currentPage, setCurrentPage] = useState('llamada');
  const [showRegistration, setShowRegistration] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({
    'actividades-congreso': false,
    'info-complementaria': false
  });

  const menuItems = [
    { id: 'llamada', label: 'Acerca del Congreso', label_pt: 'Sobre o Congresso' },
    { id: 'conferenciantes', label: 'Conferencias magistrales y conversatorios', label_pt: 'Conferências magistrais e conversatórios' },
    { id: 'cuotas', label: 'Cuotas de inscripción', label_pt: 'Taxas de inscrição' },
    { id: 'comite-academico', label: 'Comité Académico', label_pt: 'Comitê Acadêmico' },
    { id: 'comite-organizador', label: 'Comité Organizador', label_pt: 'Comitê Organizador' },
    { id: 'programa', label: 'Programa', label_pt: 'Programa' },
    { id: 'inscripcion', label: 'Inscripción', label_pt: 'Inscrição' },
    { id: 'talleres', label: 'Talleres', label_pt: 'Oficinas' },
    { id: 'presentaciones-libros', label: 'Presentaciones de libros', label_pt: 'Apresentações de livros' },
    {
      id: 'actividades-congreso',
      label: 'Actividades previas y posteriores al Congreso',
      label_pt: 'Atividades pré e pós-Congresso',
      submenu: [
        { id: 'actividad1', label: 'Actividad 1', label_pt: 'Atividade 1' },
        { id: 'actividad2', label: 'Actividad 2', label_pt: 'Atividade 2' }
      ]
    },
    {
      id: 'info-complementaria',
      label: 'Información complementaria',
      label_pt: 'Informação complementar',
      submenu: [
        { id: 'sedes', label: 'Las sedes del Congreso', label_pt: 'Locais do Congresso' },
        { id: 'instituciones-convocantes', label: 'Instituciones convocantes', label_pt: 'Instituições convocantes' },
        { id: 'organizaciones', label: 'Organizaciones colaboradoras', label_pt: 'Organizações colaboradoras' },
        { id: 'alojamiento', label: 'Alojamiento', label_pt: 'Hospedagem' },
        { id: 'san-cristobal', label: 'San Cristóbal de Las Casas', label_pt: 'San Cristóbal de Las Casas' },
        { id: 'cartel', label: 'Cartel del congreso', label_pt: 'Cartaz do congresso' }
      ]
    }
  ];

  const toggleSubmenu = (id) => {
    setSubmenuOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'llamada': return <CallForParticipation lang={lang} />;
      case 'formatos': return <AcceptedFormats lang={lang} />;
      case 'conferenciantes': return <div className="space-y-4"><p className="text-gray-700">{lang === 'es' ? 'Información sobre conferencias magistrales y mesas plenarias próximamente.' : 'Information about keynote lectures and plenary sessions coming soon.'}</p></div>;
      case 'cuotas': return (
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-teal-600 text-white">
                  <tr>
                    <th className="p-3 text-left">{lang === 'es' ? 'Categoría' : 'Categoria'}</th>
                    <th className="p-3 text-center">{lang === 'es' ? 'Pago antes del 31/05/26' : 'Pagamento antes de 31/05/26'}</th>
                    <th className="p-3 text-center">{lang === 'es' ? 'Después del 01/06/26' : 'Depois de 01/06/26'}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t bg-white hover:bg-gray-50"><td className="p-3">{lang === 'es' ? 'Investigador/a del sur global' : 'Pesquisador/a do sul global'}</td><td className="p-3 text-center font-semibold">$800</td><td className="p-3 text-center font-semibold">$1,000</td></tr>
                  <tr className="border-t bg-white hover:bg-gray-50"><td className="p-3">{lang === 'es' ? 'Investigador/a del norte global' : 'Pesquisador/a do norte global'}</td><td className="p-3 text-center font-semibold">$1,300</td><td className="p-3 text-center font-semibold">$1,500</td></tr>
                  <tr className="border-t bg-white hover:bg-gray-50"><td className="p-3">{lang === 'es' ? 'Investigador/a de institución convocante' : 'Pesquisador/a de institución convocante'}</td><td className="p-3 text-center font-semibold">$400</td><td className="p-3 text-center font-semibold">$600</td></tr>
                  <tr className="border-t bg-white hover:bg-gray-50"><td className="p-3">{lang === 'es' ? 'Estudiante' : 'Estudante'}</td><td className="p-3 text-center font-semibold">$300</td><td className="p-3 text-center font-semibold">$500</td></tr>
                  <tr className="border-t bg-white hover:bg-gray-50"><td className="p-3">{lang === 'es' ? 'Asistente' : 'Assistente'}</td><td className="p-3 text-center font-semibold">$200</td><td className="p-3 text-center font-semibold">$300</td></tr>
                </tbody>
              </table>
            </div>
            <div className="flex justify-center">
              <button onClick={() => setShowRegistration(true)} className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition shadow-lg hover:shadow-xl">
                📝 {lang === 'es' ? 'Registrarse al Congreso' : 'Inscrever-se no Congresso'}
              </button>
            </div>
            {showRegistration && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
                <div className="bg-white rounded-xl max-w-3xl w-full my-8 relative">
                  <button onClick={() => setShowRegistration(false)} className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center font-bold text-gray-600 z-10">✕</button>
                  <div className="p-6"><RegistrationForm lang={lang} onSuccess={() => setShowRegistration(false)} /></div>
                </div>
              </div>
            )}
          </div>
        );
      case 'comite-academico': return <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Lizette Alegre</p><p className="text-sm text-gray-600">Facultad de Música, UNAM, México</p></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Natalia Bieletto Bueno</p><p className="text-sm text-gray-600">Centro de Investigación en Artes y Humanidades, Universidad Mayor, Chile</p></div></div></div>;
      case 'comite-organizador': return <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">María Luisa de la Garza Chávez</p><p className="text-sm text-gray-600">CESMECA-UNICACH</p></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Roberto Campos Velázquez</p><p className="text-sm text-gray-600">CIMSUR-UNAM</p></div></div></div>;
      case 'programa': return <Program lang={lang} />;
      case 'talleres': return <div className="space-y-4"><p className="text-gray-700">{lang === 'es' ? 'Información sobre talleres próximamente.' : 'Information about workshops coming soon.'}</p></div>;
      case 'presentaciones-libros': return <div className="space-y-4"><p className="text-gray-700">{lang === 'es' ? 'Información sobre presentaciones de libros próximamente.' : 'Information about book presentations coming soon.'}</p></div>;
      case 'actividad1': case 'actividad2': return <div className="space-y-4"><p className="text-gray-700">{lang === 'es' ? 'Información sobre actividades próximamente.' : 'Information about activities coming soon.'}</p></div>;
      case 'sedes': return <VenuesPage lang={lang} />;
      case 'instituciones-convocantes': return <div className="space-y-4"><p className="text-gray-700">{lang === 'es' ? 'Información sobre instituciones convocantes próximamente.' : 'Information about convening institutions coming soon.'}</p></div>;
      case 'organizaciones': return <div className="space-y-4"><p className="text-gray-700">{lang === 'es' ? 'Información sobre organizaciones colaboradoras próximamente.' : 'Information about partner organizations coming soon.'}</p></div>;
      case 'alojamiento': return <div className="space-y-4"><p className="text-gray-700">{lang === 'es' ? 'Información sobre alojamiento próximamente.' : 'Information about accommodation coming soon.'}</p></div>;
      case 'san-cristobal': return <div className="space-y-4"><p className="text-gray-700">{lang === 'es' ? 'Información sobre San Cristóbal de Las Casas próximamente.' : 'Information about San Cristóbal de Las Casas coming soon.'}</p></div>;
      case 'cartel': return <div className="space-y-4"><p className="text-gray-700">{lang === 'es' ? 'Cartel del congreso próximamente.' : 'Congress poster coming soon.'}</p></div>;
      default: return <p className="text-gray-600">{lang === 'es' ? 'Contenido en preparación.' : 'Content in preparation.'}</p>;
    }
  };

  const getPageTitle = () => {
    const titles = {
      'llamada': { es: 'Acerca del Congreso', en: 'Sobre o Congresso' },
      'formatos': { es: 'Formatos admitidos', en: 'Formatos aceitos' },
      'conferenciantes': { es: 'Conferencias magistrales y conversatorios', en: 'Conferências magistrais e conversatórios' },
      'cuotas': { es: 'Cuotas de inscripción', en: 'Taxas de inscrição' },
      'comite-academico': { es: 'Comité Académico', en: 'Comitê Acadêmico' },
      'comite-organizador': { es: 'Comité Organizador', en: 'Comitê Organizador' },
      'programa': { es: 'Programa', en: 'Programa' },
      'inscripcion': { es: 'Inscripción', en: 'Inscrição' },
      'talleres': { es: 'Talleres', en: 'Oficinas' },
      'presentaciones-libros': { es: 'Presentaciones de libros', en: 'Apresentações de livros' },
      'actividad1': { es: 'Actividad 1', en: 'Atividade 1' },
      'actividad2': { es: 'Actividad 2', en: 'Atividade 2' },
      'sedes': { es: 'Las sedes del Congreso', en: 'Locais do Congresso' },
      'instituciones-convocantes': { es: 'Instituciones convocantes', en: 'Instituições convocantes' },
      'organizaciones': { es: 'Organizaciones colaboradoras', en: 'Organizações colaboradoras' },
      'alojamiento': { es: 'Alojamiento', en: 'Hospedagem' },
      'san-cristobal': { es: 'San Cristóbal de Las Casas', en: 'San Cristóbal de Las Casas' },
      'cartel': { es: 'Cartel del congreso', en: 'Cartaz do congresso' }
    };
    return titles[currentPage]?.[lang] || (lang === 'es' ? 'Contenido' : 'Content');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="ltr">
      <TopBar lang={lang} setLang={setLang} onMobileMenuOpen={() => setIsMobileOpen(true)} />
      <Header lang={lang} />
      <main className="flex-1 max-w-7xl mx-auto px-6 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6 items-start">
          <Sidebar menuItems={menuItems} currentPage={currentPage} setCurrentPage={setCurrentPage} submenuOpen={submenuOpen} toggleSubmenu={toggleSubmenu} lang={lang} />
          <MobileSidebar isOpen={isMobileOpen} onClose={() => setIsMobileOpen(false)} menuItems={menuItems} currentPage={currentPage} setCurrentPage={setCurrentPage} submenuOpen={submenuOpen} toggleSubmenu={toggleSubmenu} lang={lang} />
          <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-teal-700 text-xl font-bold">{getPageTitle()}</h2>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">{renderContent()}</div>
            </div>
          </section>
        </div>
      </main>
      <Footer lang={lang} />
    </div>
  );
};

const App = () => {
  const [lang, setLang] = useState('es');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <Router>
      {/* 2. AGREGAMOS EL TOASTER AQUÍ */}
      <Toaster position="top-center" richColors />
      <Routes>
        <Route path="/" element={<MainLayout lang={lang} setLang={setLang} />} />
        <Route path="/schedule" element={<ScheduleView />} />
        <Route path="/asistencia" element={<AttendanceCheck />} />
        <Route path="/constancias" element={<CertificateDownload />} />
        <Route path="/staff/attendance" element={<StaffAttendance />} />
        
        {/* --- CORRECCIÓN AQUÍ: Usamos AdminDashboard de nuevo --- */}
        <Route 
          path="/admin" 
          element={
            user ? (
              <AdminDashboard user={user} onLogout={() => setUser(null)} />
            ) : (
              <Login onLogin={setUser} />
            )
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
