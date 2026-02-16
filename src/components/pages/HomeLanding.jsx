// src/components/pages/HomeLanding.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, Users, Search, CheckCircle, Ticket, AlertCircle, 
  Clock, Flag, FileText, Mic, ChevronLeft, ChevronRight, ArrowRight 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// --- 1. COMPONENTE DEL SLIDER TÁCTIL (NUEVO) ---
const MainHeroSlider = ({ lang, setCurrentPage }) => {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const autoPlayRef = useRef();

  const slides = [
    {
      id: 1,
      image: '/images/facultad-derecho.jpg', 
      title: lang === 'es' ? 'Convocatoria Abierta' : 'Chamada Aberta',
      subtitle: lang === 'es' ? '18 Simposios Temáticos Aprobados' : '18 Simpósios Temáticos Aprovados',
      description: lang === 'es' 
        ? 'Participa en el XVII Congreso de la IASPM-AL. Envía tu ponencia y sé parte del debate sobre música popular en América Latina.'
        : 'Participe do XVII Congresso da IASPM-AL. Envie seu trabalho e faça parte do debate sobre música popular na América Latina.',
      cta: lang === 'es' ? 'Ver Simposios' : 'Ver Simpósios',
      link: 'programa',
      icon: Calendar
    },
    {
      id: 2,
      image: '/images/el-carmen.jpg',
      title: 'XVII Congreso IASPM-AL',
      subtitle: 'San Cristóbal de Las Casas 2026',
      description: lang === 'es'
        ? 'Un encuentro para debatir sobre ética, política y música popular en el corazón de Chiapas.'
        : 'Um encontro para debater ética, política e música popular no coração de Chiapas.',
      cta: lang === 'es' ? 'Conocer la Sede' : 'Conhecer a Sede',
      link: 'sedes',
      icon: MapPin
    },
    {
      id: 3,
      image: '/images/teatro.jpg',
      title: lang === 'es' ? 'Inscripciones Abiertas' : 'Inscrições Abertas',
      subtitle: lang === 'es' ? 'Asegura tu participación' : 'Garanta sua participação',
      description: lang === 'es'
        ? 'Consulta las cuotas para investigadores y estudiantes. Aprovecha los descuentos por pago anticipado.'
        : 'Consulte as taxas para pesquisadores e estudantes. Aproveite os descontos para pagamento antecipado.',
      cta: lang === 'es' ? 'Ver Costos' : 'Ver Custos',
      link: 'cuotas',
      icon: Ticket
    }
  ];

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);
  const goToSlide = (index) => setCurrent(index);

  // Lógica Swipe
  const minSwipeDistance = 50;
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance) prevSlide();
  };

  // Autoplay
  useEffect(() => { autoPlayRef.current = nextSlide; });
  useEffect(() => {
    const play = () => { autoPlayRef.current(); };
    const interval = setInterval(play, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className="relative w-full h-[450px] md:h-[550px] overflow-hidden rounded-2xl group shadow-xl bg-gray-900 select-none"
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, index) => (
        <div key={slide.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <div className={`absolute inset-0 w-full h-full transform transition-transform duration-[8000ms] ease-linear ${index === current ? 'scale-110' : 'scale-100'}`}>
             <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/95 via-[#1e3a5f]/50 to-transparent"></div>
        </div>
      ))}

      <div className="absolute inset-0 z-20 flex items-end md:items-center justify-start px-6 md:px-16 pb-16 md:pb-0">
        <div className="max-w-2xl space-y-3 md:space-y-5">
          <div className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-white border border-white/20 shadow-sm animate-in slide-in-from-left duration-700 fade-in delay-100`}>
            {React.createElement(slides[current].icon, { size: 14, className: "text-iaspm-orange" })}
            <span className="text-[10px] md:text-xs font-bold tracking-widest uppercase">{slides[current].subtitle}</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg animate-in slide-in-from-bottom-4 duration-700 fade-in delay-200">
            {slides[current].title}
          </h1>
          <p className="text-gray-200 text-sm md:text-lg font-medium leading-relaxed max-w-lg drop-shadow-md line-clamp-3 md:line-clamp-none animate-in slide-in-from-bottom-4 duration-700 fade-in delay-300">
            {slides[current].description}
          </p>
          <div className="pt-2 animate-in slide-in-from-bottom-4 duration-700 fade-in delay-500">
            <button onClick={() => setCurrentPage(slides[current].link)} className="bg-iaspm-orange hover:bg-orange-600 text-white px-6 md:px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 hover:-translate-y-1 active:scale-95">
              <span>{slides[current].cta}</span> <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all hover:scale-110 z-30 group">
        <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all hover:scale-110 z-30 group">
        <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => goToSlide(idx)} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === current ? 'w-8 bg-iaspm-orange' : 'w-2 bg-white/40 hover:bg-white/80'}`} />
        ))}
      </div>
    </div>
  );
};

// --- 2. COMPONENTE DE LÍNEA DE TIEMPO (EXISTENTE) ---
const TimelineItem = ({ date, title, desc, icon: Icon, status, align, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => setIsVisible(entry.isIntersecting));
    });
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  const colors = {
    done: 'bg-blue-100 text-iaspm-blue border-blue-200',
    active: 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse',
    future: 'bg-gray-50 text-gray-400 border-gray-100'
  };

  const isLeft = align === 'left';

  return (
    <div ref={domRef} className={`relative flex items-center justify-between md:justify-center gap-8 mb-12 transition-all duration-1000 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`} style={{ transitionDelay: `${index * 150}ms` }}>
      <div className={`hidden md:block w-5/12 ${isLeft ? 'text-right' : ''}`}>
        {isLeft && (
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${status === 'done' ? 'bg-blue-100 text-iaspm-blue' : 'bg-gray-100 text-gray-500'}`}>{date}</span>
            <h3 className="text-xl font-bold text-gray-800">{title}</h3>
            <p className="text-gray-500 text-sm mt-1">{desc}</p>
          </div>
        )}
      </div>
      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center">
        <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10 ${colors[status] || colors.future}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className={`w-full pl-20 md:pl-0 md:w-5/12 ${!isLeft ? 'text-left' : ''}`}>
        <div className="block md:hidden">
          <span className="text-xs font-bold text-iaspm-blue block mb-1">{date}</span>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-gray-500 text-sm">{desc}</p>
        </div>
        <div className="hidden md:block">
          {!isLeft && (
            <div>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${status === 'done' ? 'bg-blue-100 text-iaspm-blue' : 'bg-gray-100 text-gray-500'}`}>{date}</span>
              <h3 className="text-xl font-bold text-gray-800">{title}</h3>
              <p className="text-gray-500 text-sm mt-1">{desc}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- 3. COMPONENTE PRINCIPAL (HOMELANDING) ---
const HomeLanding = ({ lang, setCurrentPage }) => {
  const [emailCheck, setEmailCheck] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(false);

  useEffect(() => {
    if (statusResult) {
      const timer = setTimeout(() => { setStatusResult(null); setEmailCheck(''); }, 6000);
      return () => clearTimeout(timer);
    }
  }, [statusResult]);

  const checkStatus = async (e) => {
    e.preventDefault();
    if (!emailCheck) return;
    setLoadingCheck(true);
    setStatusResult(null);
    const cleanEmail = emailCheck.trim().toLowerCase();
    try {
      const { data, error } = await supabase.from('registrations').select('status, full_name').ilike('email', cleanEmail).maybeSingle();
      if (error) throw error;
      if (data) {
        setStatusResult({ found: true, name: data.full_name, status: data.status });
      } else {
        setStatusResult({ found: false });
      }
    } catch (err) {
      console.error(err);
      setStatusResult({ error: true });
    } finally {
      setLoadingCheck(false);
    }
  };

  const timelineEvents = [
    { date: 'Noviembre 2025', title: lang === 'es' ? 'Publicación de Convocatoria' : 'Call for Papers', desc: lang === 'es' ? 'Apertura oficial para recepción de propuestas.' : 'Official opening for proposal submissions.', icon: FileText, status: 'done' },
    { date: 'Febrero 2026', title: lang === 'es' ? 'Inicio de Inscripciones' : 'Registration Opens', desc: lang === 'es' ? 'Registro disponible para asistentes y ponentes.' : 'Registration available for attendees and speakers.', icon: Ticket, status: 'done' },
    { date: '31 Mayo 2026', title: lang === 'es' ? 'Límite Pago Reducido' : 'Early Bird Deadline', desc: lang === 'es' ? 'Último día para aprovechar el descuento.' : 'Last day to take advantage of the discount.', icon: AlertCircle, status: 'active' },
    { date: '15 Julio 2026', title: lang === 'es' ? 'Programa Preliminar' : 'Preliminary Program', desc: lang === 'es' ? 'Publicación de horarios y mesas de trabajo.' : 'Publication of schedules and working tables.', icon: Mic, status: 'future' },
    { date: '28 Sept 2026', title: lang === 'es' ? 'Inauguración del Congreso' : 'Congress Opening', desc: lang === 'es' ? 'Ceremonia de apertura en el Teatro Zebadúa.' : 'Opening ceremony at Zebadúa Theater.', icon: Flag, status: 'future' }
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-500">

      {/* 1. HERO SLIDER (INTEGRADO) */}
      <div className="mb-4">
        <MainHeroSlider lang={lang} setCurrentPage={setCurrentPage} />
      </div>

      {/* 2. TARJETAS DE ACCESO RÁPIDO */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { id: 'programa', icon: Calendar, color: 'blue', title: { es: 'Agenda Académica', en: 'Academic Agenda' }, desc: { es: 'Consulta los simposios, ponencias y actividades.', en: 'Check symposia and activities.' } },
          { id: 'sedes', icon: MapPin, color: 'orange', title: { es: 'Sedes y Mapas', en: 'Venues & Maps' }, desc: { es: 'Ubica los auditorios en el centro histórico.', en: 'Locate auditoriums in the center.' } },
          { id: 'cuotas', icon: Users, color: 'blue', title: { es: 'Inscripción y Costos', en: 'Registration & Fees' }, desc: { es: 'Revisa costos para estudiantes e investigadores.', en: 'Check fees for students and researchers.' } }
        ].map((item) => (
          <button key={item.id} onClick={() => setCurrentPage(item.id)} className="text-left group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-iaspm-blue transition-all duration-300 hover:-translate-y-1">
            <div className={`w-12 h-12 bg-${item.color}-50 text-${item.color}-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-iaspm-blue transition-colors">{lang === 'es' ? item.title.es : item.title.en}</h3>
            <p className="text-sm text-gray-500">{lang === 'es' ? item.desc.es : item.desc.en}</p>
          </button>
        ))}
      </div>

      {/* 3. LÍNEA DE TIEMPO */}
      <div className="relative py-8">
        <div className="text-center mb-12">
           <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
             <Clock className="text-iaspm-blue" />
             {lang === 'es' ? 'Camino al Congreso' : 'Road to Congress'}
           </h2>
           <p className="text-gray-500 mt-2">
             {lang === 'es' ? 'Fechas clave para tu participación' : 'Key dates for your participation'}
           </p>
        </div>
        <div className="absolute left-4 md:left-1/2 top-24 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2"></div>
        <div className="relative">
          {timelineEvents.map((event, index) => (
            <TimelineItem key={index} index={index} {...event} align={index % 2 === 0 ? 'left' : 'right'} />
          ))}
        </div>
      </div>

      {/* 4. VERIFICADOR DE INSCRIPCIÓN */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Search className="w-6 h-6 text-iaspm-blue" />
            {lang === 'es' ? 'Verifica tu Inscripción' : 'Check Registration'}
          </h2>
          <p className="text-gray-600 leading-relaxed">
            {lang === 'es' ? 'Si ya realizaste tu pago, ingresa tu correo para verificar tu estatus.' : 'If you already paid, enter your email to check your status.'}
          </p>
        </div>
        <div className="flex-1 w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-gray-100 ring-1 ring-gray-100">       
          <form onSubmit={checkStatus} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">{lang === 'es' ? 'Correo Electrónico' : 'Email Address'}</label>
              <div className="flex gap-2">
                <input type="email" required placeholder="ejemplo@correo.com" value={emailCheck} onChange={(e) => setEmailCheck(e.target.value)} className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-iaspm-blue focus:border-transparent outline-none transition-all" />
                <button disabled={loadingCheck} type="submit" className="shrink-0 bg-iaspm-blue hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center">
                  {loadingCheck ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Search className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {statusResult && (
              <div className={`mt-4 p-4 rounded-xl text-sm border animate-in slide-in-from-top-2 fade-in duration-500 ${statusResult.found ? (statusResult.status === 'paid' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-yellow-50 text-yellow-800 border-yellow-200') : 'bg-red-50 text-red-800 border-red-200'}`}>
                {statusResult.found ? (
                  <div className="flex gap-3">
                    {statusResult.status === 'paid' ? <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" /> : <AlertCircle className="w-5 h-5 flex-shrink-0 text-yellow-600" />}
                    <div className="flex-1">
                      <p className="font-bold text-base">{statusResult.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span>{lang === 'es' ? 'Estado:' : 'Status:'}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${statusResult.status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                          {statusResult.status === 'paid' ? (lang === 'es' ? 'Aprobado' : 'Approved') : (lang === 'es' ? 'En Revisión' : 'Pending')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 flex-shrink-0" /><p>{lang === 'es' ? 'No encontramos registros.' : 'No registration found.'}</p></div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 5. LOGOS */}
      <div className="border-t border-gray-200 pt-10 pb-4">
        <p className="text-center text-xs text-gray-400 font-bold mb-8 uppercase tracking-[0.2em]">{lang === 'es' ? 'Instituciones Convocantes' : 'Convening Institutions'}</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
           <div className="h-14 px-6 bg-white border-2 border-gray-100 rounded-lg flex items-center justify-center font-black text-gray-300 text-xl shadow-sm select-none hover:border-iaspm-blue hover:text-iaspm-blue hover:shadow-md transition-all">UNICACH</div>        
           <div className="h-14 px-6 bg-white border-2 border-gray-100 rounded-lg flex items-center justify-center font-black text-gray-300 text-xl shadow-sm select-none hover:border-iaspm-blue hover:text-iaspm-blue hover:shadow-md transition-all">IASPM</div>
           <div className="h-14 px-6 bg-white border-2 border-gray-100 rounded-lg flex items-center justify-center font-black text-gray-300 text-xl shadow-sm select-none hover:border-iaspm-blue hover:text-iaspm-blue hover:shadow-md transition-all">CESMECA</div>        
           <div className="h-14 px-6 bg-white border-2 border-gray-100 rounded-lg flex items-center justify-center font-black text-gray-300 text-xl shadow-sm select-none hover:border-iaspm-blue hover:text-iaspm-blue hover:shadow-md transition-all">CHIAPAS</div>        
        </div>
      </div>
    </div>
  );
};

export default HomeLanding;
