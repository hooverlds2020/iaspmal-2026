// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner'; // Librería de alertas
import { Ticket } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

// Pages - Tools
import AttendanceCheck from './pages/AttendanceCheck';
import StaffAttendance from './pages/StaffAttendance';
import CertificateDownload from './pages/CertificateDownload';

// Layout Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileSidebar from './components/layout/MobileSidebar';
import Footer from './components/layout/Footer';

// Page Components
import HomeLanding from './components/pages/HomeLanding';
import CallForParticipation from './components/pages/CallForParticipation';
import ScientificCommittee from './components/pages/ScientificCommittee';
import AcceptedFormats from './components/pages/AcceptedFormats';
import Program from './components/pages/Program';
import ScheduleView from './components/pages/ScheduleView';
import RegistrationForm from './components/pages/RegistrationForm';
import VenuesPage from './components/pages/VenuesPage';

// Admin Pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

const MainLayout = ({ lang, setLang }) => {
  const getInitialPage = () => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      return hash || 'home';
    }
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState(getInitialPage);
  const [showRegistration, setShowRegistration] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({
    'actividades-congreso': false,
    'info-complementaria': false
  });

  useEffect(() => {
    window.location.hash = currentPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setCurrentPage(hash);
      } else {
        setCurrentPage('home');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const menuItems = [
    { id: 'home', label: 'Inicio', label_pt: 'Início' },
    { id: 'llamada', label: 'Acerca del Congreso', label_pt: 'Sobre o Congresso' },
    { id: 'conferenciantes', label: 'Conferencias magistrales', label_pt: 'Conferências magistrais' },
    { id: 'cuotas', label: 'Inscripción', label_pt: 'Inscrição' },
    { id: 'comite-academico', label: 'Comité Académico', label_pt: 'Comitê Acadêmico' },
    { id: 'comite-organizador', label: 'Comité Organizador', label_pt: 'Comitê Organizador' },
    { id: 'programa', label: 'Programa', label_pt: 'Programa' },
    { id: 'talleres', label: 'Talleres', label_pt: 'Oficinas' },
    { id: 'presentaciones-libros', label: 'Presentaciones de libros', label_pt: 'Apresentações de livros' },
    {
      id: 'actividades-congreso',
      label: 'Actividades previas y posteriores',
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

  const getPageTitle = () => {
    const titles = {
      'home': { es: 'Bienvenidos', pt: 'Bem-vindos' },
      'llamada': { es: 'Acerca del Congreso', pt: 'Sobre o Congresso' },
      'conferenciantes': { es: 'Conferencias magistrales', pt: 'Conferências magistrais' },
      'cuotas': { es: 'Inscripción y Costos', pt: 'Inscrição e Custos' },
      'comite-academico': { es: 'Comité Académico', pt: 'Comitê Acadêmico' },
      'comite-organizador': { es: 'Comité Organizador', pt: 'Comitê Organizador' },
      'programa': { es: 'Programa General', pt: 'Programa Geral' },
      'inscripcion': { es: 'Inscripción', pt: 'Inscrição' },
      'talleres': { es: 'Talleres', pt: 'Oficinas' },
      'presentaciones-libros': { es: 'Presentaciones de libros', pt: 'Apresentações de livros' },
      'actividad1': { es: 'Actividad 1', pt: 'Atividade 1' },
      'actividad2': { es: 'Actividad 2', pt: 'Atividade 2' },
      'sedes': { es: 'Sedes del Congreso', pt: 'Locais do Congresso' },
      'instituciones-convocantes': { es: 'Instituciones convocantes', pt: 'Instituições convocantes' },
      'organizaciones': { es: 'Organizaciones colaboradoras', pt: 'Organizações colaboradoras' },
      'alojamiento': { es: 'Alojamiento', pt: 'Hospedagem' },
      'san-cristobal': { es: 'San Cristóbal de Las Casas', pt: 'San Cristóbal de Las Casas' },
      'cartel': { es: 'Cartel Oficial', pt: 'Cartaz Oficial' }
    };
    const titleObj = titles[currentPage];
    if (!titleObj) return lang === 'es' ? 'Contenido' : 'Conteúdo';
    return titleObj[lang];
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'home': return <HomeLanding lang={lang} setCurrentPage={setCurrentPage} />;
      case 'llamada': return <CallForParticipation lang={lang} />;
      case 'formatos': return <AcceptedFormats lang={lang} />;
      case 'conferenciantes': return <div className="space-y-4 text-gray-600"><p>{lang === 'es' ? 'Información próximamente.' : 'Informação em breve.'}</p></div>;

      case 'cuotas': return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="overflow-x-auto shadow-sm rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-[#1e3a5f] text-white uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{lang === 'es' ? 'Categoría' : 'Categoria'}</th>
                    <th className="px-6 py-4 text-center">{lang === 'es' ? 'Hasta 31/05/26' : 'Até 31/05/26'}</th>
                    <th className="px-6 py-4 text-center">{lang === 'es' ? 'Desde 01/06/26' : 'Desde 01/06/26'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white hover:bg-gray-50 transition"><td className="px-6 py-5 font-bold text-gray-700">{lang === 'es' ? 'Investigador/a del sur global' : 'Pesquisador/a do sul global'}</td><td className="px-6 py-5 text-center font-black text-[#1e3a5f] text-lg">$800</td><td className="px-6 py-5 text-center font-bold text-gray-400">$1,000</td></tr>
                  <tr className="bg-white hover:bg-gray-50 transition"><td className="px-6 py-5 font-bold text-gray-700">{lang === 'es' ? 'Investigador/a del norte global' : 'Pesquisador/a do norte global'}</td><td className="px-6 py-5 text-center font-black text-[#1e3a5f] text-lg">$1,300</td><td className="px-6 py-5 text-center font-bold text-gray-400">$1,500</td></tr>
                  <tr className="bg-white hover:bg-gray-50 transition"><td className="px-6 py-5 font-bold text-gray-700">{lang === 'es' ? 'Investigador/a de institución convocante' : 'Pesquisador/a de instituição convocante'}</td><td className="px-6 py-5 text-center font-black text-[#1e3a5f] text-lg">$400</td><td className="px-6 py-5 text-center font-bold text-gray-400">$600</td></tr>
                  <tr className="bg-white hover:bg-gray-50 transition"><td className="px-6 py-5 font-bold text-gray-700">{lang === 'es' ? 'Asistente / Estudiante' : 'Assistente / Estudante'}</td><td className="px-6 py-5 text-center font-black text-[#1e3a5f] text-lg">$200</td><td className="px-6 py-5 text-center font-bold text-gray-400">$300</td></tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-center py-6">
              <button
                onClick={() => setShowRegistration(true)}
                className="group relative bg-[#1e3a5f] hover:bg-black text-white font-bold py-4 px-10 rounded-full text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <Ticket className="w-6 h-6" />
                <span className="tracking-wide uppercase text-sm font-black">{lang === 'es' ? 'Registrarse Ahora' : 'Inscrever-se Agora'}</span>
              </button>
            </div>

            {showRegistration && (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <div className="absolute inset-0 bg-[#1e3a5f]/80 backdrop-blur-sm transition-opacity" onClick={() => setShowRegistration(false)}></div>
                <div className="relative w-full max-w-xl z-10 animate-in zoom-in-95 duration-200">
                    <RegistrationForm
                        lang={lang}
                        onClose={() => setShowRegistration(false)}
                        onSuccess={() => setShowRegistration(false)}
                    />
                </div>
              </div>
            )}
          </div>
        );

      case 'comite-academico': return <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Lizette Alegre</p><p className="text-sm text-gray-600">Facultad de Música, UNAM, México</p></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Natalia Bieletto Bueno</p><p className="text-sm text-gray-600">Centro de Investigación en Artes y Humanidades, Universidad Mayor, Chile</p></div></div></div>;
      case 'comite-organizador': return <div className="space-y-4"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">María Luisa de la Garza Chávez</p><p className="text-sm text-gray-600">CESMECA-UNICACH</p></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Roberto Campos Velázquez</p><p className="text-sm text-gray-600">CIMSUR-UNAM</p></div></div></div>;
      case 'programa': return <Program lang={lang} />;
      case 'sedes': return <VenuesPage lang={lang} />;

      default: return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">{lang === 'es' ? 'Contenido en preparación.' : 'Conteúdo em preparação.'}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900" dir="ltr">

      <Header
        lang={lang}
        setLang={setLang}
        onMobileMenuOpen={() => setIsMobileOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full py-6 md:py-8">

        <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-8 items-start">

          <Sidebar
            menuItems={menuItems}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            submenuOpen={submenuOpen}
            toggleSubmenu={toggleSubmenu}
            lang={lang}
          />

          <MobileSidebar
            isOpen={isMobileOpen}
            onClose={() => setIsMobileOpen(false)}
            menuItems={menuItems}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            submenuOpen={submenuOpen}
            toggleSubmenu={toggleSubmenu}
            lang={lang}
          />

          <section className="bg-white rounded-2xl shadow-xl min-h-[600px] relative overflow-hidden transition-all duration-300">      
            <div className="absolute inset-0 z-0 opacity-[0.02] bg-[url('/images/Marimba_Watermark.png')] bg-cover bg-center bg-no-repeat pointer-events-none"></div>

            <div className="relative z-10 flex flex-col h-full">

                {currentPage !== 'home' && (
                    <div className="bg-white/95 backdrop-blur-sm px-6 sm:px-8 py-6 border-b border-gray-100 sticky top-0 z-20">        
                      <h2 className="text-[#1e3a5f] text-xl sm:text-2xl font-black font-sans tracking-tight uppercase italic">        
                        {getPageTitle()}
                      </h2>
                      <div className="h-1.5 w-16 bg-iaspm-orange mt-2 rounded-full"></div>
                    </div>
                )}

                <div className="p-4 sm:p-10 flex-1">
                  <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-[#1e3a5f] prose-a:text-iaspm-orange hover:prose-a:text-orange-600 prose-img:rounded-xl">
                    {renderContent()}
                  </div>
                </div>
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
        <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#1e3a5f]"></div>
            <p className="text-gray-400 text-sm font-bold tracking-widest uppercase">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* CONFIGURACIÓN DE ALERTAS MEJORADA (Visible en móvil y PC) */}
      <Toaster 
        position="top-center" 
        richColors 
        closeButton 
        expand={true}
        theme="light"
        gap={12}
        toastOptions={{
          style: { 
            marginTop: '16px', 
            padding: '16px 20px', // Más relleno para que sea "grandecito"
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            fontSize: '15px' // Letra base un poco más grande
          },
          classNames: {
            title: 'text-base font-black tracking-tight mb-1',
            description: 'text-sm font-medium opacity-90',
            closeButton: 'bg-black/10 hover:bg-black/20 border-0 transform scale-110 top-4 right-4',
          }
        }}
      />
      
      <Routes>
        <Route path="/" element={<MainLayout lang={lang} setLang={setLang} />} />
        <Route path="/schedule" element={<ScheduleView />} />
        <Route path="/asistencia" element={<AttendanceCheck />} />
        <Route path="/constancias" element={<CertificateDownload />} />
        <Route path="/staff/attendance" element={<StaffAttendance />} />
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
