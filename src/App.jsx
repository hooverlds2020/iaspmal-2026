// src/App.jsx
import React, { useState, useEffect } from 'react';
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
import Program from './components/pages/Program';

// Admin pages
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  const [currentPage, setCurrentPage] = useState('comite-cientifico');
  const [lang, setLang] = useState('es');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState({
    'lenguas-cooficiales': false,
    'info-complementaria': false
  });

  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if we're on admin route
  const isAdminRoute = window.location.pathname === '/admin' || window.location.hash === '#/admin';

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Admin route handling
  if (isAdminRoute) {
    if (!user) {
      return <Login onLogin={setUser} />;
    }
    return <AdminDashboard user={user} onLogout={() => setUser(null)} />;
  }

  // Public site (existing code)
  const menuItems = [
    { 
      id: 'llamada', 
      label: 'Llamada a la participación',
      label_en: 'Call for Participation'
    },
    { 
      id: 'formatos', 
      label: 'Formatos admitidos',
      label_en: 'Accepted Formats'
    },
    { 
      id: 'conferenciantes', 
      label: 'Conferenciantes',
      label_en: 'Keynote Speakers'
    },
    { 
      id: 'cuotas', 
      label: 'Cuotas de inscripción',
      label_en: 'Registration Fees'
    },
    { 
      id: 'comite-cientifico', 
      label: 'Comité Científico',
      label_en: 'Scientific Committee'
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
      id: 'lila-gnawa', 
      label: 'Lila Gnawa',
      label_en: 'Lila Gnawa'
    },
    {
      id: 'lenguas-cooficiales',
      label: 'Llamada en lenguas cooficiales',
      label_en: 'Call in Co-official Languages',
      submenu: [
        { id: 'euskara', label: 'Parte hartzeko deia (Euskara)' },
        { id: 'galego', label: 'Chamamento á participación (Galego)' },
        { id: 'catala', label: 'Crida a la participació (Català)' }
      ]
    },
    {
      id: 'info-complementaria',
      label: 'Información complementaria',
      label_en: 'Additional Information',
      submenu: [
        { id: 'posters', label: 'Indicaciones para pósters', label_en: 'Poster Guidelines' },
        { id: 'como-llegar', label: 'Cómo llegar', label_en: 'How to Get There' },
        { id: 'alojamiento', label: 'Alojamiento', label_en: 'Accommodation' },
        { id: 'lugares', label: 'Lugares para visitar', label_en: 'Places to Visit' },
        { id: 'instituciones', label: 'Instituciones colaboradoras', label_en: 'Partner Institutions' },
        { id: 'cartel', label: 'Cartel del congreso', label_en: 'Congress Poster' },
        { id: 'cena', label: 'Cena del congreso', label_en: 'Congress Dinner' }
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
      
      case 'comite-cientifico':
        return <ScientificCommittee lang={lang} />;
      
      case 'programa':
        return <Program lang={lang} />;
      
      case 'euskara':
        return (
          <div>
            <p className="mb-4">SIBE kongresuko XVIII. edizioak gizarte gatazka eta musika arteko harremana aztertzeko gonbidapena luzatzen du.</p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p>Musika, ikur-indar handia duen elementu gisa, gatazka-egoera horietan parte hartzen du.</p>
            </div>
          </div>
        );

      case 'galego':
        return (
          <div>
            <p className="mb-4">Esta edición do Congreso de SIBE busca promover a reflexión crítica e a produción de coñecemento.</p>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p>A música, como elemento de gran potencial simbólico, forma parte destes escenarios de conflito.</p>
            </div>
          </div>
        );

      case 'catala':
        return (
          <div>
            <p className="mb-4">Aquesta edició del Congrés de SIBE busca promoure la reflexió crítica i la producció de coneixement.</p>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <p>La música forma part d'aquests escenaris de conflicte.</p>
            </div>
          </div>
        );

      case 'posters':
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-bold mb-2">
                {lang === 'es' ? 'Dimensiones' : 'Dimensions'}
              </h3>
              <p>
                {lang === 'es' 
                  ? 'Los pósters deberán tener un tamaño máximo de 90 cm × 120 cm (formato vertical).'
                  : 'Posters must have a maximum size of 90 cm × 120 cm (vertical format).'}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-bold mb-2">
                {lang === 'es' ? 'Contenido' : 'Content'}
              </h3>
              <p>
                {lang === 'es'
                  ? 'Debe incluir: título, autor/es, afiliación institucional, introducción, metodología, resultados.'
                  : 'Must include: title, author(s), institutional affiliation, introduction, methodology, results.'}
              </p>
            </div>
          </div>
        );

      case 'como-llegar':
        return (
          <div>
            <h3 className="font-bold mb-3">
              {lang === 'es' 
                ? 'Ubicación del Congreso'
                : 'Congress Location'}
            </h3>
            <p className="mb-4">San Cristóbal de Las Casas, Chiapas, México</p>
            <div className="space-y-3">
              <div className="border-l-4 border-teal-600 pl-4">
                <h4 className="font-bold">
                  {lang === 'es' ? 'Por Avión' : 'By Plane'}
                </h4>
                <p>
                  {lang === 'es'
                    ? 'Aeropuerto Internacional Ángel Albino Corzo (TGZ) - 1 hora en auto'
                    : 'Ángel Albino Corzo International Airport (TGZ) - 1 hour by car'}
                </p>
              </div>
            </div>
          </div>
        );

      case 'cuotas':
        return (
          <table className="w-full border border-gray-200 rounded-lg overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left">
                  {lang === 'es' ? 'Tipo' : 'Type'}
                </th>
                <th className="p-3 text-right">
                  {lang === 'es' ? 'Importe' : 'Amount'}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="p-3">
                  {lang === 'es' ? 'General' : 'General'}
                </td>
                <td className="p-3 text-right">€150</td>
              </tr>
              <tr className="border-t">
                <td className="p-3">
                  {lang === 'es' ? 'Estudiantes' : 'Students'}
                </td>
                <td className="p-3 text-right">€80</td>
              </tr>
            </tbody>
          </table>
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
      'llamada': { es: 'Llamada a la participación', en: 'Call for Participation' },
      'formatos': { es: 'Formatos admitidos', en: 'Accepted Formats' },
      'conferenciantes': { es: 'Conferenciantes', en: 'Keynote Speakers' },
      'cuotas': { es: 'Cuotas de inscripción', en: 'Registration Fees' },
      'comite-cientifico': { es: 'Comité científico', en: 'Scientific Committee' },
      'comite-organizador': { es: 'Comité Organizador', en: 'Organizing Committee' },
      'programa': { es: 'Programa', en: 'Program' },
      'inscripcion': { es: 'Inscripción', en: 'Registration' },
      'talleres': { es: 'Talleres', en: 'Workshops' },
      'lila-gnawa': { es: 'Lila Gnawa', en: 'Lila Gnawa' },
      'euskara': { es: 'Parte hartzeko deia (Euskara)', en: 'Call (Basque)' },
      'galego': { es: 'Chamamento á participación (Galego)', en: 'Call (Galician)' },
      'catala': { es: 'Crida a la participació (Català)', en: 'Call (Catalan)' },
      'posters': { es: 'Indicaciones para pósters', en: 'Poster Guidelines' },
      'como-llegar': { es: 'Cómo llegar', en: 'How to Get There' },
      'alojamiento': { es: 'Alojamiento', en: 'Accommodation' },
      'lugares': { es: 'Lugares para visitar', en: 'Places to Visit' },
      'instituciones': { es: 'Instituciones colaboradoras', en: 'Partner Institutions' },
      'cartel': { es: 'Cartel del congreso', en: 'Congress Poster' },
      'cena': { es: 'Cena del congreso', en: 'Congress Dinner' }
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

export default App;
