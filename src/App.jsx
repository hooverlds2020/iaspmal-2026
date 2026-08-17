// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Ticket, ArrowLeft, Clock, Library, Info, Menu } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import UploadPhoto from './components/UploadPhoto';

// Pages - Tools
import AttendanceCheck from './pages/AttendanceCheck';
import StaffAttendance from './pages/StaffAttendance';
import CertificateDownload from './pages/CertificateDownload';

// Layout Components
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MobileSidebar from './components/layout/MobileSidebar';
import Footer from './components/layout/Footer';
import WelcomeModal from './components/layout/WelcomeModal';

// Page Components
import HomeLanding from './components/pages/HomeLanding';
import CallForParticipation from './components/pages/CallForParticipation';
import ScientificCommittee from './components/pages/ScientificCommittee';
import AcceptedFormats from './components/pages/AcceptedFormats';
import Program from './components/pages/Program';
import RegistrationForm from './components/pages/RegistrationForm';
import VenuesPage from './components/pages/VenuesPage';
import Alojamiento from './components/pages/Alojamiento';
import Gallery from './components/pages/Gallery';
import IaspmInfo from './components/pages/IaspmInfo';
import Conciertos from './components/pages/Conciertos';

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
    { id: 'conciertos', label: 'Conciertos', label_pt: 'Concertos' },
    { id: 'presentaciones-libros', label: 'Presentaciones de libros', label_pt: 'Apresentações de livros' },
    { id: 'instituciones-convocantes', label: 'Instituciones convocantes', label_pt: 'Instituições convocantes' },
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
      label_pt: 'Informações complementares',
      submenu: [
        { id: 'sedes', label: 'Las sedes del Congreso', label_pt: 'As sedes do Congresso' },
        { id: 'organizaciones', label: 'Entidades colaboradoras', label_pt: 'Entidades colaboradoras' },
        { id: 'alojamiento', label: 'Alojamiento', label_pt: 'Hospedagem' },
        { id: 'san-cristobal', label: 'Lugares para comer', label_pt: 'Lugares para comer' },
        { id: 'musica-vivo', label: 'Música en vivo', label_pt: 'Música ao vivo' },
        { id: 'cartel', label: 'Cartel del congreso', label_pt: 'Pôster do congresso' }
      ]
    },
    //--- NUEVA PESTAÑA: GALERÍA ---
    { id: 'galeria', label: 'Galería', label_pt: 'Galeria' },
    { id: 'iaspm-al', label: 'La IASPM-AL', label_pt: 'A IASPM-AL' }
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
      'organizaciones': { es: 'Entidades colaboradoras', pt: 'Entidades colaboradoras' },
      'alojamiento': { es: 'Alojamiento', pt: 'Hospedagem' },
      'san-cristobal': { es: 'San Cristóbal de Las Casas', pt: 'San Cristóbal de Las Casas' },
      'cartel': { es: 'Cartel Oficial', pt: 'Cartaz Oficial' },
      'galeria': { es: 'Galería', pt: 'Galeria' },
      'iaspm-al': { es: 'La IASPM-AL', pt: 'A IASPM-AL' }
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

      // --- PESTAÑA: INSCRIPCIÓN ---
      case 'cuotas':
        if (showRegistration) {
          return (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 max-w-3xl mx-auto">
              <button
                onClick={() => setShowRegistration(false)}
                className="mb-6 flex items-center gap-2 text-gray-500 hover:text-[#1e3a5f] font-bold text-sm transition-colors group"
              >
                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                {lang === 'es' ? 'Volver a información de costos' : 'Voltar para informações de custos'}
              </button>
              <RegistrationForm
                  lang={lang}
                  onClose={() => setShowRegistration(false)}
              />
            </div>
          );
        }

        return (
          <div className="space-y-8 animate-in fade-in duration-300">
            <div className="overflow-x-auto shadow-sm rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm text-left min-w-[800px]">
                <thead className="bg-[#1e3a5f] text-white uppercase text-xs tracking-wider">
                  <tr>
                    <th className="px-6 py-4">{lang === 'es' ? 'Categoría' : 'Categoria'}</th>
                    <th className="px-6 py-4 text-center">{lang === 'es' ? 'Hasta el 31 de mayo' : 'Até 31 de maio'}</th>
                    <th className="px-6 py-4 text-center">{lang === 'es' ? 'Hasta el 31 de julio' : 'Até 31 de julho'}</th>
                    <th className="px-6 py-4 text-center">{lang === 'es' ? 'A partir del 1º de agos.' : 'A partir de 1º de agos.'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white hover:bg-gray-50 transition">
                    <td className="px-6 py-5 font-bold text-gray-700">{lang === 'es' ? 'Del Sur global' : 'Do Sul global'}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-[#1e3a5f] block text-base">800 MxP</span>
                      <span className="text-xs text-gray-500 font-bold">50 Dls</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-[#1e3a5f] block text-base">1000 MxP</span>
                      <span className="text-xs text-gray-500 font-bold">60 Dls</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-gray-400 block text-base">1200 MxP</span>
                      <span className="text-xs text-gray-400 font-bold">70 Dls</span>
                    </td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50 transition">
                    <td className="px-6 py-5 font-bold text-gray-700">{lang === 'es' ? 'Del Norte global' : 'Do Norte global'}</td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-[#1e3a5f] block text-base">1300 MxP</span>
                      <span className="text-xs text-gray-500 font-bold">75 Dls / 65 €</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-[#1e3a5f] block text-base">1500 MxP</span>
                      <span className="text-xs text-gray-500 font-bold">90 Dls / 75 €</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-gray-400 block text-base">1700 MxP</span>
                      <span className="text-xs text-gray-400 font-bold">100 Dls / 85 €</span>
                    </td>
                  </tr>
                  <tr className="bg-white hover:bg-gray-50 transition">
                    <td className="px-6 py-5 font-bold text-gray-700">
                      {lang === 'es' ? 'Asistente' : 'Assistente'}<br/>
                      <span className="text-xs text-gray-500 font-normal">{lang === 'es' ? '(si desea constancia)' : '(se desejar certificado)'}</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-[#1e3a5f] block text-base">500 MxP</span>
                      <span className="text-xs text-gray-500 font-bold">30 Dls / 25 €</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-[#1e3a5f] block text-base">600 MxP</span>
                      <span className="text-xs text-gray-500 font-bold">35 Dls / 30 €</span>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="font-black text-gray-400 block text-base">700 MxP</span>
                      <span className="text-xs text-gray-400 font-bold">40 Dls / 35 €</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-white border border-blue-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6 text-sm md:text-base text-gray-700 leading-relaxed">
              <p>
                {lang === 'es'
                  ? 'El pago de la cuota deberá hacerse mediante transferencia. Favor de indicar, en el "Concepto", únicamente su nombre (tan completo como quepa). Después, hay que volver a esta página y formalizar la inscripción desde el botón de abajo ("Inscribirse ahora"). Tengan a la mano el comprobante de pago, pues habrá que adjuntarlo.'
                  : 'O pagamento da taxa deve ser feito por transferência. Favor indicar, no "Conceito", apenas o seu nome (o mais completo possível). Depois, é necessário voltar a esta página e formalizar a inscrição pelo botão abaixo ("Inscrever-se Agora"). Tenha em mãos o comprovante de pagamento, pois será necessário anexá-lo.'}
              </p>

              {/* ✅ TEXTO IMPORTANTE AÑADIDO AQUÍ */}
              <p>
                {lang === 'es'
                  ? <><strong>Importante:</strong> No olviden que, para participar en el congreso, deben ser socios de la IASPM-AL y estar al día con las cuotas. Para ello, escribir a Paula Mesa, a <a href="mailto:tesoreria.iaspm.al@gmail.com" className="font-bold underline text-[#1e3a5f] hover:text-orange-600">tesoreria.iaspm.al@gmail.com</a>.</>
                  : <><strong>Importante:</strong> Não se esqueçam que, para participar do congresso, devem ser membros da IASPM-AL e estar em dia com as quotas. Para isso, escreva para Paula Mesa, em <a href="mailto:tesoreria.iaspm.al@gmail.com" className="font-bold underline text-[#1e3a5f] hover:text-orange-600">tesoreria.iaspm.al@gmail.com</a>.</>}
              </p>

              <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100">
                <p className="font-black text-[#1e3a5f] mb-4">
                  {lang === 'es' ? 'Las cuentas para transferencia entre bancos mexicanos son las siguientes:' : 'As contas para transferência entre bancos mexicanos son las siguientes:'}
                </p>
                <ul className="space-y-4">
                  <li className="flex flex-col md:flex-row md:items-center gap-3">
                    <span className="bg-[#004481] text-white px-3 py-1.5 rounded text-xs font-black tracking-wider inline-block w-fit">BANCOMER</span>
                    <span><strong>Clave Interbancaria (CLABE):</strong> 0122 2500 1537 850171, a nombre de Ma. Teresa Chávez Troncoso</span>
                  </li>
                  <li className="flex flex-col md:flex-row md:items-center gap-3">
                    <span className="bg-[#ec0000] text-white px-3 py-1.5 rounded text-xs font-black tracking-wider inline-block w-fit">SANTANDER</span>
                    <span><strong>Clave Interbancaria (CLABE):</strong> 0141 3056 5557 027351, a nombre de Ma Luisa de la Garza Chávez</span>
                  </li>
                </ul>
              </div>

              <div className="bg-amber-50 text-amber-900 p-5 rounded-xl border border-amber-200 flex items-start gap-3">
                <div className="text-amber-500 mt-0.5">ℹ️</div>
                <p>
                  {lang === 'es'
                    ? <span>Para pagos desde el extranjero, favor de escribir al correo <strong className="text-amber-700">iaspm.al.2026.inscripcion@gmail.com</strong> para conocer opciones. No se olvide de indicar su nombre completo y su lugar de residencia.</span>
                    : <span>Para pagamentos do exterior, favor escrever para <strong className="text-amber-700">iaspm.al.2026.inscripcion@gmail.com</strong> para conhecer as opções. Não se esqueça de indicar seu nome completo e local de residência.</span>}
                </p>
              </div>

              <p className="text-xs text-gray-500 italic text-center font-medium mt-4">
                {lang === 'es' ? 'En caso de requerirlo, se emitirá un recibo de pago. No se emitirán facturas.' : 'Se necessário, será emitido um recibo. Não serão emitidas notas fiscais.'}
              </p>
            </div>

            <div className="flex justify-center py-4">
              <button
                onClick={() => {
                  setShowRegistration(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group relative bg-[#1e3a5f] hover:bg-black text-white font-bold py-4 px-10 rounded-full text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                <Ticket className="w-6 h-6" />
                <span className="tracking-wide uppercase text-sm font-black">{lang === 'es' ? 'Inscribirse ahora' : 'Inscrever-se Agora'}</span>
              </button>
            </div>
          </div>
        );

      // --- PESTAÑA: PRESENTACIONES DE LIBROS ---
    case 'presentaciones-libros':
        return (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-6">
                {lang === 'es'
                  ? 'El XVII Congreso invita a exponer la producción bibliográfica de los socios de IASPM-AL y a presentar las obras que hayan sido publicadas de 2023 a la fecha.'
                  : 'O XVII Congresso convida a expor a produção bibliográfica dos sócios da IASPM-AL e a apresentar as obras que tenham sido publicadas de 2023 até a presente data.'}
              </p>

              <div className="mb-8 p-5 md:p-6 bg-blue-50/80 rounded-xl border-l-4 border-[#1e3a5f] shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div>
                  <h4 className="font-black text-[#1e3a5f] uppercase tracking-wide text-sm mb-1.5">
                    {lang === 'es' ? 'Envío de propuestas' : 'Envio de propostas'}
                  </h4>
                  <p className="text-[#1e3a5f] font-medium text-sm md:text-base">
                    {lang === 'es'
                      ? 'Fecha límite: 15 de junio de 2026'
                      : 'Prazo final: 15 de junho de 2026'}
                  </p>
                </div>
                <a href="mailto:iaspm.al.2026@gmail.com" className="shrink-0 bg-[#1e3a5f] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-iaspm-orange transition-all shadow-md">
                  iaspm.al.2026@gmail.com
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <div className="bg-[#1e3a5f] text-white p-3 rounded-lg shrink-0">
                    <Clock size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-[#1e3a5f] uppercase tracking-wide text-sm mb-1.5">
                      {lang === 'es' ? 'Duración y Formato' : 'Duração e Formato'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {lang === 'es'
                        ? 'Las presentaciones de libros durarán hasta 30 minutos, con un máximo de tres presentadores.'
                        : 'As apresentações de livros durarão até 30 minutos, com um máximo de três apresentadores.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <div className="bg-emerald-600 text-white p-3 rounded-lg shrink-0">
                    <Library size={24} />
                  </div>
                  <div>
                    <h4 className="font-black text-emerald-800 uppercase tracking-wide text-sm mb-1.5">
                      {lang === 'es' ? 'Venta y Donación' : 'Venda e Doação'}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {lang === 'es'
                        ? 'Se podrán vender los libros, a cambio de la donación de un ejemplar para consulta pública en biblioteca.'
                        : 'Os livros poderão ser vendidos, em troca da doação de um exemplar para consulta pública na biblioteca.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex items-start gap-4 p-5 md:p-6 bg-amber-50 rounded-xl border border-amber-200">
                <Info className="text-amber-500 shrink-0 mt-0.5" size={24} />
                <p className="text-sm md:text-base text-amber-900 leading-relaxed font-medium">
                  {lang === 'es'
                    ? 'Se agradecerá la organización de presentaciones de más de un libro, ya que se vislumbra una demanda alta de estos espacios. No hay preferencias sobre el eje de vinculación de las publicaciones (tema, país, grupo de investigación, editorial...).'
                    : 'Agradece-se a organização de apresentações de mais de um livro, uma vez que se vislumbra uma alta demanda por esses espaços. Não há preferências sobre o eixo de vinculação das publicações (tema, país, grupo de pesquisa, editora...).'}
                </p>
              </div>
            </div>
          </div>
        );


      case 'comite-academico':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Lizette Alegre', country: 'México' },
                { name: 'Natalia Bieletto', country: 'México / Chile' },
                { name: 'Carlos Bonfim', country: 'Brasil' },
                { name: 'María Luisa de la Garza', country: 'México' },
                { name: 'Fernando Elías Llanos', country: 'Brasil / Perú' },
                { name: 'Mercedes Liska', country: 'Argentina' },
                { name: 'Darío Tejeda', country: 'República Dominicana' }
              ].map((member, idx) => (
                <div key={idx} className="bg-gray-50 p-6 rounded-none border border-gray-200 hover:bg-white transition-colors">
                  <p className="font-bold text-gray-900 text-base">
                    {member.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
                    {member.country}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

    case 'comite-organizador': return <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">María Luisa de la Garza Chávez</p><p className="text-sm text-gray-600">CESMECA-UNICACH, coordinadora</p></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Roberto Campos Velázquez</p><p className="text-sm text-gray-600">FaM-UNICACH, coordinador</p></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Emmanuel Nájera de León</p><p className="text-sm text-gray-600">CESMECA-UNICACH</p></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Alain Basail Rodríguez</p><p className="text-sm text-gray-600">CESMECA-UNICACH</p></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Yoimí Castañeda Ceijas</p><p className="text-sm text-gray-600">UNICH</p></div><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Mónica Bayuelo García</p><p className="text-sm text-gray-600">CIMSUR-UNAM</p></div></div><div className="mt-4"><p className="font-semibold text-gray-700 mb-3">Comisión de logística</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Gabriela Fragoso Samaniego</p><p className="text-sm text-gray-600">CESMECA-UNICACH</p></div></div></div><div className="mt-4"><p className="font-semibold text-gray-700 mb-3">Página web</p><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition"><p className="font-semibold text-gray-900">Roberto Carlos Hoover Silvano</p><p className="text-sm text-gray-600">CESMECA-UNICACH</p></div></div></div></div>;

      case 'programa': return <Program lang={lang} />;
      case 'conciertos': return <Conciertos lang={lang} />;
      case 'sedes': return <VenuesPage lang={lang} />;
      case 'alojamiento': return <Alojamiento lang={lang} />;
      case 'galeria': return <Gallery lang={lang} />;
      case 'iaspm-al': return <IaspmInfo lang={lang} />;
      case 'instituciones-convocantes': return <div className="text-center"><img src="/images/instituciones.png" alt="Instituciones convocantes" className="max-w-full mx-auto" /></div>;

      // --- NUEVO CASO: CARTEL ---
      case 'cartel':
        return (
          <div className="flex justify-center py-8 animate-in fade-in duration-500">
            <img
              src="/images/cartel-congreso.png"
              alt={lang === 'es' ? 'Cartel Oficial' : 'Pôster Oficial'}
              className="w-full h-auto max-w-4xl rounded-xl shadow-2xl border border-gray-200"
            />
          </div>
        );
      // --------------------------

      default: return <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-300">{lang === 'es' ? 'Contenido en preparación.' : 'Conteúdo em preparação.'}</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900" dir="ltr">
      <WelcomeModal lang={lang} />
      <Header
        lang={lang}
        setLang={setLang}
        onMobileMenuOpen={() => setIsMobileOpen(true)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full py-6 md:py-8">

        <div className="grid grid-cols-1 xl:grid-cols-[280px,1fr] gap-8 items-start">

          {/* Botón hamburguesa: ocupa el lugar del sidebar en pantallas < 1280px */}
          <button
            onClick={() => setIsMobileOpen(true)}
            className="xl:hidden flex items-center gap-2 w-full px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm text-[#1e3a5f] font-black text-xs uppercase tracking-widest hover:bg-gray-50 transition-colors"
          >
            <Menu className="w-5 h-5" />
            Menú
          </button>

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

          <section className="min-w-0 bg-white rounded-2xl shadow-xl min-h-[600px] relative overflow-hidden transition-all duration-300">

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
            padding: '16px 20px',
            borderRadius: '16px',
            border: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            fontSize: '15px'
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
