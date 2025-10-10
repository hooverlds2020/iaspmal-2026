// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

// Admin pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

const MainLayout = ({ lang, setLang }) => {
  const [currentPage, setCurrentPage] = useState('llamada');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({
    'actividades-congreso': false,
    'info-complementaria': false
  });

  // Menu items
  const menuItems = [
    { 
      id: 'llamada', 
      label: 'Acerca del Congreso',
      label_en: 'About the Congress'
    },
    { 
      id: 'formatos', 
      label: 'Formatos admitidos',
      label_en: 'Accepted Formats'
    },
    { 
      id: 'conferenciantes', 
      label: 'Conferencias magistrales y mesas plenarias',
      label_en: 'Keynote lectures and plenary sessions'
    },
    { 
      id: 'cuotas', 
      label: 'Cuotas de inscripción',
      label_en: 'Registration Fees'
    },
    { 
      id: 'comite-academico', 
      label: 'Comité Académico',
      label_en: 'Academic Committee'
    },
    { 
      id: 'comite-organizador', 
      label: 'Comité Organizador',
      label_en: 'Organizing Committee'
    },
    { 
      id: 'programa', 
      label: 'Programa',
      label_en: 'Program'
    },
    { 
      id: 'inscripcion', 
      label: 'Inscripción',
      label_en: 'Registration'
    },
    { 
      id: 'talleres', 
      label: 'Talleres',
      label_en: 'Workshops'
    },
    { 
      id: 'presentaciones-libros', 
      label: 'Presentaciones de libros',
      label_en: 'Book presentations'
    },
    {
      id: 'actividades-congreso',
      label: 'Actividades previas y posteriores al Congreso',
      label_en: 'Pre- and post-Congress activities',
      submenu: [
        { id: 'actividad1', label: 'Actividad 1', label_en: 'Activity 1' },
        { id: 'actividad2', label: 'Actividad 2', label_en: 'Activity 2' }
      ]
    },
    {
      id: 'info-complementaria',
      label: 'Información complementaria',
      label_en: 'Additional Information',
      submenu: [
        { id: 'sedes', label: 'Las sedes del Congreso', label_en: 'Congress Venues' },
        { id: 'instituciones-convocantes', label: 'Instituciones convocantes', label_en: 'Convening Institutions' },
        { id: 'organizaciones', label: 'Organizaciones colaboradoras', label_en: 'Partner Organizations' },
        { id: 'alojamiento', label: 'Alojamiento', label_en: 'Accommodation' },
        { id: 'san-cristobal', label: 'San Cristóbal de Las Casas', label_en: 'San Cristóbal de Las Casas' },
        { id: 'cartel', label: 'Cartel del congreso', label_en: 'Congress Poster' }
      ]
    }
  ];

  const toggleSubmenu = (id) => {
    setSubmenuOpen(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'llamada':
        return <CallForParticipation lang={lang} />;
      
      case 'formatos':
        return <AcceptedFormats lang={lang} />;
      
      case 'conferenciantes':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Información sobre conferencias magistrales y mesas plenarias próximamente.'
                : 'Information about keynote lectures and plenary sessions coming soon.'}
            </p>
          </div>
        );
      
      case 'cuotas':
        return (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-teal-600 text-white">
                <tr>
                  <th className="p-3 text-left">
                    {lang === 'es' ? 'Categoría' : 'Category'}
                  </th>
                  <th className="p-3 text-right">
                    {lang === 'es' ? 'Cuota' : 'Fee'}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t bg-white hover:bg-gray-50">
                  <td className="p-3">
                    {lang === 'es' ? 'Investigador/a del sur global' : 'Researcher from the Global South'}
                  </td>
                  <td className="p-3 text-right font-semibold">$800.00 MXN</td>
                </tr>
                <tr className="border-t bg-white hover:bg-gray-50">
                  <td className="p-3">
                    {lang === 'es' ? 'Investigador/a del norte global' : 'Researcher from the Global North'}
                  </td>
                  <td className="p-3 text-right font-semibold">$1,500.00 MXN</td>
                </tr>
                <tr className="border-t bg-white hover:bg-gray-50">
                  <td className="p-3">
                    {lang === 'es' ? 'Investigador/a de institución convocante' : 'Researcher from convening institution'}
                  </td>
                  <td className="p-3 text-right font-semibold">$600.00 MXN</td>
                </tr>
                <tr className="border-t bg-white hover:bg-gray-50">
                  <td className="p-3">
                    {lang === 'es' ? 'Estudiante' : 'Student'}
                  </td>
                  <td className="p-3 text-right font-semibold">$500.00 MXN</td>
                </tr>
                <tr className="border-t bg-white hover:bg-gray-50">
                  <td className="p-3">
                    {lang === 'es' ? 'Asistente' : 'Attendee'}
                  </td>
                  <td className="p-3 text-right font-semibold">$300.00 MXN</td>
                </tr>
                <tr className="border-t bg-white hover:bg-gray-50">
                  <td className="p-3">
                    {lang === 'es' ? 'Participante en la Muestra de Músicas Locales' : 'Local Music Showcase Participant'}
                  </td>
                  <td className="p-3 text-right font-semibold">$300.00 MXN</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      
      case 'comite-academico':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">Lizette Alegre</p>
                <p className="text-sm text-gray-600">Facultad de Música, UNAM, México</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">Natalia Bieletto Bueno</p>
                <p className="text-sm text-gray-600">Centro de Investigación en Artes y Humanidades, Universidad Mayor, Chile</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">Carlos Bonfim</p>
                <p className="text-sm text-gray-600">Instituto de Humanidades, Artes y Ciencias Prof. Milton Santos, UFBA, Brasil</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">María Luisa de la Garza Chávez</p>
                <p className="text-sm text-gray-600">CESMECA - UNICACH, México</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">Mercedes Liska</p>
                <p className="text-sm text-gray-600">CONICET - Universidad de Buenos Aires, Argentina</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">Fernando Elías Llanos</p>
                <p className="text-sm text-gray-600">Escuela de Música y Artes Escénicas, UFG, Brasil</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">Darío Tejeda</p>
                <p className="text-sm text-gray-600">Instituto de Estudios Caribeños, República Dominicana</p>
              </div>
            </div>
          </div>
        );
      
      case 'comite-organizador':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">María Luisa de la Garza Chávez</p>
                <p className="text-sm text-gray-600">CESMECA-UNICACH</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">Roberto Campos Velázquez</p>
                <p className="text-sm text-gray-600">CIMSUR-UNAM</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">Yoimí Castañeda Seijas</p>
                <p className="text-sm text-gray-600">UNICH</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">Alain Basail Rodríguez</p>
                <p className="text-sm text-gray-600">CESMECA-UNICACH</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition">
                <p className="font-semibold text-gray-900">María Elena Martínez</p>
                <p className="text-sm text-gray-600">CIESAS Sureste</p>
              </div>
            </div>
          </div>
        );
      
      case 'programa':
        return <Program lang={lang} />;
      
      case 'inscripcion':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'El proceso de inscripción estará disponible próximamente.'
                : 'The registration process will be available soon.'}
            </p>
          </div>
        );
      
      case 'talleres':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Información sobre talleres próximamente.'
                : 'Information about workshops coming soon.'}
            </p>
          </div>
        );
      
      case 'presentaciones-libros':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Información sobre presentaciones de libros próximamente.'
                : 'Information about book presentations coming soon.'}
            </p>
          </div>
        );
      
      case 'actividad1':
      case 'actividad2':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Información sobre actividades próximamente.'
                : 'Information about activities coming soon.'}
            </p>
          </div>
        );
      
      case 'sedes':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Información sobre las sedes del congreso próximamente.'
                : 'Information about congress venues coming soon.'}
            </p>
          </div>
        );
      
      case 'instituciones-convocantes':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Información sobre instituciones convocantes próximamente.'
                : 'Information about convening institutions coming soon.'}
            </p>
          </div>
        );
      
      case 'organizaciones':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Información sobre organizaciones colaboradoras próximamente.'
                : 'Information about partner organizations coming soon.'}
            </p>
          </div>
        );
      
      case 'alojamiento':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Información sobre alojamiento próximamente.'
                : 'Information about accommodation coming soon.'}
            </p>
          </div>
        );
      
      case 'san-cristobal':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Información sobre San Cristóbal de Las Casas próximamente.'
                : 'Information about San Cristóbal de Las Casas coming soon.'}
            </p>
          </div>
        );
      
      case 'cartel':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">
              {lang === 'es' 
                ? 'Cartel del congreso próximamente.'
                : 'Congress poster coming soon.'}
            </p>
          </div>
        );

      default:
        return (
          <p className="text-gray-600">
            {lang === 'es' 
              ? 'Contenido en preparación.'
              : 'Content in preparation.'}
          </p>
        );
    }
  };

  const getPageTitle = () => {
    const titles = {
      'llamada': { es: 'Acerca del Congreso', en: 'About the Congress' },
      'formatos': { es: 'Formatos admitidos', en: 'Accepted Formats' },
      'conferenciantes': { es: 'Conferencias magistrales y mesas plenarias', en: 'Keynote lectures and plenary sessions' },
      'cuotas': { es: 'Cuotas de inscripción', en: 'Registration Fees' },
      'comite-academico': { es: 'Comité Académico', en: 'Academic Committee' },
      'comite-organizador': { es: 'Comité Organizador', en: 'Organizing Committee' },
      'programa': { es: 'Programa', en: 'Program' },
      'inscripcion': { es: 'Inscripción', en: 'Registration' },
      'talleres': { es: 'Talleres', en: 'Workshops' },
      'presentaciones-libros': { es: 'Presentaciones de libros', en: 'Book presentations' },
      'actividad1': { es: 'Actividad 1', en: 'Activity 1' },
      'actividad2': { es: 'Actividad 2', en: 'Activity 2' },
      'sedes': { es: 'Las sedes del Congreso', en: 'Congress Venues' },
      'instituciones-convocantes': { es: 'Instituciones convocantes', en: 'Convening Institutions' },
      'organizaciones': { es: 'Organizaciones colaboradoras', en: 'Partner Organizations' },
      'alojamiento': { es: 'Alojamiento', en: 'Accommodation' },
      'san-cristobal': { es: 'San Cristóbal de Las Casas', en: 'San Cristóbal de Las Casas' },
      'cartel': { es: 'Cartel del congreso', en: 'Congress Poster' }
    };
    return titles[currentPage]?.[lang] || (lang === 'es' ? 'Contenido' : 'Content');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" dir="ltr">
      <TopBar 
        lang={lang} 
        setLang={setLang} 
        onMobileMenuOpen={() => setIsMobileOpen(true)} 
      />
      
      <Header lang={lang} />

      <main className="flex-1 max-w-7xl mx-auto px-6 pb-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-[280px,1fr] gap-6 items-start">
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

          <section className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h2 className="text-teal-700 text-xl font-bold">{getPageTitle()}</h2>
            </div>
            <div className="p-6">
              <div className="prose max-w-none">
                {renderContent()}
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

  // Check if user is logged in
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
      <Routes>
        <Route path="/" element={<MainLayout lang={lang} setLang={setLang} />} />
        <Route path="/schedule" element={<ScheduleView />} />
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
