// src/components/pages/HomeLanding.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Calendar, MapPin, Users, Search, CheckCircle, Ticket, AlertCircle, 
  Clock, Flag, FileText, Mic, ChevronLeft, ChevronRight, ArrowRight,
  UserPlus, Book, Edit3, DollarSign, CreditCard 
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// Importamos el nuevo componente modular
import InstitutionCarousel from '../common/InstitutionCarousel';

// --- 1. COMPONENTE DEL SLIDER INTELIGENTE (CONECTADO A SUPABASE) ---
const MainHeroSlider = ({ lang, setCurrentPage }) => {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const autoPlayRef = useRef();

  useEffect(() => {
    const fetchSliders = async () => {
      try {
        const { data, error } = await supabase
          .from('slider_home')
          .select('*')
          .eq('activo', true)
          .order('orden', { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;

        const now = new Date();
        const activeSlides = data.filter(slide => {
          const startDate = slide.fecha_inicio ? new Date(slide.fecha_inicio) : null;
          const endDate = slide.fecha_fin ? new Date(slide.fecha_fin) : null;
          
          if (startDate && now < startDate) return false;
          if (endDate && now > endDate) return false;
          return true;
        });

        if (activeSlides.length > 0) {
          setSlides(activeSlides);
        } else {
          setSlides([{
            id: 'default',
            image_url: '/images/facultad-derecho.jpg',
            titulo: lang === 'es' ? 'XVII Congreso IASPM-AL' : 'XVII Congresso IASPM-AL',
            descripcion: 'San Cristóbal de Las Casas 2026',
            enlace_url: 'programa',
            abrir_nueva_pestana: false
          }]);
        }
      } catch (error) {
        console.error('Error fetching sliders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSliders();
  }, [lang]);

  const nextSlide = () => setCurrent(current === slides.length - 1 ? 0 : current + 1);
  const prevSlide = () => setCurrent(current === 0 ? slides.length - 1 : current - 1);
  const goToSlide = (index) => setCurrent(index);

  const minSwipeDistance = 50;
  const onTouchStart = (e) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) nextSlide();
    if (distance < -minSwipeDistance) prevSlide();
  };

  useEffect(() => { autoPlayRef.current = nextSlide; });
  useEffect(() => {
    if (slides.length <= 1) return;
    const play = () => { autoPlayRef.current(); };
    const interval = setInterval(play, 6000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const handleLinkClick = (url, newTab) => {
    if (!url) return;
    if (url.startsWith('http')) {
      window.open(url, newTab ? '_blank' : '_self');
    } else {
      setCurrentPage(url);
    }
  };

  if (loading) {
    return <div className="w-full h-[450px] md:h-[550px] bg-gray-900 rounded-2xl animate-pulse flex items-center justify-center"><Calendar className="text-gray-700 w-12 h-12" /></div>;
  }

  return (
    <div 
      className="relative w-full h-[450px] md:h-[550px] overflow-hidden rounded-2xl group shadow-xl bg-gray-900 select-none"
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
    >
      {slides.map((slide, index) => {
        const hasText = slide.titulo || slide.descripcion;
        const isClickableImage = !hasText && slide.enlace_url;

        return (
          <div key={slide.id} className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
            <div 
               className={`absolute inset-0 w-full h-full transform transition-transform duration-[8000ms] ease-linear ${index === current ? 'scale-110' : 'scale-100'} ${isClickableImage ? 'cursor-pointer' : ''}`}
               onClick={() => isClickableImage && handleLinkClick(slide.enlace_url, slide.abrir_nueva_pestana)}
            >
               <img src={slide.image_url} alt={slide.titulo || 'Slider IASPM-AL'} className="w-full h-full object-cover" />
            </div>
            
            {hasText && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a5f]/95 via-[#1e3a5f]/50 to-transparent pointer-events-none"></div>
                <div className="absolute inset-0 z-20 flex items-end md:items-center justify-start px-6 md:px-16 pb-16 md:pb-0 pointer-events-none">
                  <div className="max-w-2xl space-y-3 md:space-y-5 pointer-events-auto">
                    {slide.titulo && (
                       <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight drop-shadow-lg animate-in slide-in-from-bottom-4 duration-700 fade-in delay-200">
                         {slide.titulo}
                       </h1>
                    )}
                    {slide.descripcion && (
                       <p className="text-gray-200 text-sm md:text-lg font-medium leading-relaxed max-w-lg drop-shadow-md line-clamp-3 md:line-clamp-none animate-in slide-in-from-bottom-4 duration-700 fade-in delay-300">
                         {slide.descripcion}
                       </p>
                    )}
                    {slide.enlace_url && (
                      <div className="pt-2 animate-in slide-in-from-bottom-4 duration-700 fade-in delay-500">
                        <button onClick={() => handleLinkClick(slide.enlace_url, slide.abrir_nueva_pestana)} className="bg-[#f97316] hover:bg-orange-600 text-white px-6 md:px-8 py-3 rounded-xl font-bold uppercase text-xs tracking-widest transition-all shadow-lg hover:shadow-orange-500/30 flex items-center gap-2 hover:-translate-y-1 active:scale-95">
                          <span>{lang === 'es' ? 'Saber Más' : 'Saiba Mais'}</span> <ArrowRight size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}

      {slides.length > 1 && (
        <>
          <button onClick={prevSlide} className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all hover:scale-110 z-30 group">
            <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button onClick={nextSlide} className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all hover:scale-110 z-30 group">
            <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
          </button>

          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 z-30">
            {slides.map((_, idx) => (
              <button key={idx} onClick={() => goToSlide(idx)} className={`h-1.5 rounded-full transition-all duration-500 shadow-sm ${idx === current ? 'w-8 bg-[#f97316]' : 'w-2 bg-white/40 hover:bg-white/80'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// --- 2. COMPONENTE DE LÍNEA DE TIEMPO ---
const TimelineItem = ({ date, title, desc, icon: Icon, status, align, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setIsVisible(entry.isIntersecting));
    if (domRef.current) observer.observe(domRef.current);
    return () => observer.disconnect();
  }, []);

  const colors = {
    done: 'bg-blue-100 text-[#1e3a5f] border-blue-200',
    active: 'bg-orange-100 text-orange-700 border-orange-200 animate-pulse',
    future: 'bg-gray-50 text-gray-400 border-gray-100'
  };

  const isLeft = align === 'left';

  return (
    <div ref={domRef} className={`relative flex flex-col md:flex-row items-center justify-between mb-12 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
      <div className="hidden md:block w-1/2 pr-12 text-right">
        {isLeft && (
          <div>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${status === 'done' ? 'bg-blue-100 text-[#1e3a5f]' : 'bg-gray-100 text-gray-500'}`}>{date}</span>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{desc}</p>
          </div>
        )}
      </div>

      <div className="absolute left-4 md:left-1/2 md:-translate-x-1/2 flex items-center justify-center">
        <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10 ${colors[status] || colors.future}`}>
          <Icon size={20} />
        </div>
      </div>

      <div className="w-full pl-20 md:w-1/2 md:pl-12 text-left">
        <div className="md:hidden">
          <span className="text-xs font-bold text-[#1e3a5f] block mb-1 uppercase tracking-wider">{date}</span>
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>
          <p className="text-gray-500 text-sm">{desc}</p>
        </div>
        {!isLeft && (
          <div className="hidden md:block">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 ${status === 'done' ? 'bg-blue-100 text-[#1e3a5f]' : 'bg-gray-100 text-gray-500'}`}>{date}</span>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">{desc}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- 3. COMPONENTE PRINCIPAL (HOMELANDING) ---
const HomeLanding = ({ lang, setCurrentPage }) => {
  const [emailCheck, setEmailCheck] = useState('');
  const [statusResult, setStatusResult] = useState(null);
  const [loadingCheck, setLoadingCheck] = useState(false);
  
  const [lineProgress, setLineProgress] = useState(0);
  const timelineRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollPercentage = ((windowHeight / 2) - rect.top) / rect.height * 100;
      const clampedPercentage = Math.max(0, Math.min(100, scrollPercentage));
      setLineProgress(clampedPercentage);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    { date: lang === 'es' ? '8 de Febrero 2026' : '8 de Fevereiro 2026', title: lang === 'es' ? 'Ponencias Aceptadas' : 'Trabalhos Aceitos', desc: lang === 'es' ? 'Publicación de resultados de trabajos aceptados.' : 'Publicação dos resultados dos trabajos aceitos.', icon: CheckCircle, status: 'done' },
    { date: lang === 'es' ? 'Abril 2026' : 'Abril 2026', title: lang === 'es' ? 'Inicio de Inscripciones' : 'Início das Inscrições', desc: lang === 'es' ? 'Registro disponible para asistentes y ponentes.' : 'Registro disponível para participantes e palestrantes.', icon: UserPlus, status: 'active' },
    { date: '31 Mayo 2026', title: lang === 'es' ? 'Concluye 1er plazo de pago' : 'Encerra 1º prazo de pagamento', desc: lang === 'es' ? 'Último día para aprovechar el mayor descuento.' : 'Último dia para aproveitar o maior desconto.', icon: DollarSign, status: 'future' },
    { date: '15 de Junio 2026', title: lang === 'es' ? 'Presentaciones de libros' : 'Apresentações de livros', desc: lang === 'es' ? 'Finaliza el plazo para enviar propuestas.' : 'Encerra o prazo para envio de propostas.', icon: Book, status: 'future' },
    { date: '22 de Junio 2026', title: lang === 'es' ? 'Resúmenes y títulos definitivos' : 'Resumos e títulos definitivos', desc: lang === 'es' ? 'Remitirlos a las y los coordinadores de simposio.' : 'Enviá-los aos coordenadores de simpósio.', icon: Edit3, status: 'future' },
    { date: '31 de Julio 2026', title: lang === 'es' ? 'Finaliza 2o plazo de pago' : 'Encerra 2º prazo de pagamento', desc: lang === 'es' ? 'Concluye el descuento por pago anticipado.' : 'Encerra o desconto por pagamento antecipado.', icon: CreditCard, status: 'future' },
    { date: '15 de Agosto 2026', title: lang === 'es' ? 'Programa general' : 'Programa geral', desc: lang === 'es' ? 'Horario de las mesas de los simposios y de todo lo demás.' : 'Horários das mesas de simpósios e de todas as atividades.', icon: Mic, status: 'future' },
    { date: '28 Sept 2026', title: lang === 'es' ? 'Comienza el Congreso' : 'Começa o Congresso', desc: lang === 'es' ? 'El registro, desde las 9am en la Casa Mazariegos.' : 'O credenciamento começa às 9h na Casa Mazariegos.', icon: Flag, status: 'future' }
  ];

  return (
    <div className="space-y-16 animate-in fade-in duration-500">

      {/* 1. HERO SLIDER */}
      <div className="mb-4">
        <MainHeroSlider lang={lang} setCurrentPage={setCurrentPage} />
      </div>

      {/* 2. TARJETAS DE ACCESO RÁPIDO */}
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { id: 'programa', icon: Calendar, color: 'blue', title: { es: 'Agenda Académica', pt: 'Agenda Acadêmica' }, desc: { es: 'Consulta los simposios, ponencias y actividades.', pt: 'Consulte os simpósios, palestras e atividades.' } },
          { id: 'sedes', icon: MapPin, color: 'orange', title: { es: 'Sedes y Mapas', pt: 'Sedes e Mapas' }, desc: { es: 'Ubica los auditorios en el centro histórico.', pt: 'Localize os auditórios no centro histórico.' } },
          { id: 'cuotas', icon: Users, color: 'blue', title: { es: 'Inscripción y Costos', pt: 'Inscrição e Custos' }, desc: { es: 'Revisa costos para estudiantes e investigadores.', pt: 'Verifique os custos para estudantes e pesquisadores.' } }
        ].map((item) => (
          <button key={item.id} onClick={() => setCurrentPage(item.id)} className="text-left group bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-[#1e3a5f] transition-all duration-300 hover:-translate-y-1">
            <div className={`w-12 h-12 bg-blue-50 text-[#1e3a5f] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
              <item.icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-[#1e3a5f] transition-colors">{lang === 'es' ? item.title.es : item.title.pt}</h3>
            <p className="text-sm text-gray-500 leading-snug">{lang === 'es' ? item.desc.es : item.desc.pt}</p>
          </button>
        ))}
      </div>

      {/* 3. LÍNEA DE TIEMPO CON SCROLL MÁGICO */}
      <div className="relative py-8">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
             <Clock className="text-[#1e3a5f]" />
             {lang === 'es' ? 'Camino al Congreso' : 'Caminho ao Congresso'}
           </h2>
           <p className="text-gray-500 mt-2 font-medium">
             {lang === 'es' ? 'Fechas clave para tu participación' : 'Datas-chave para sua participação'}
           </p>
        </div>
        
        <div className="relative" ref={timelineRef}>
           <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 -translate-x-1/2 rounded-full"></div>
           <div 
             className="absolute left-4 md:left-1/2 top-0 w-1 bg-[#1e3a5f] -translate-x-1/2 rounded-b-full shadow-[0_0_10px_rgba(30,58,95,0.4)] transition-all duration-150 ease-out z-0"
             style={{ height: `${lineProgress}%` }}
           ></div>

           <div className="relative z-10 pt-4 pb-4">
             {timelineEvents.map((event, index) => (
               <TimelineItem key={index} index={index} {...event} align={index % 2 === 0 ? 'left' : 'right'} />
             ))}
           </div>
        </div>
      </div>

      {/* 4. VERIFICADOR DE INSCRIPCIÓN */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 space-y-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Search className="w-6 h-6 text-[#1e3a5f]" />
            {lang === 'es' ? 'Verifica tu Inscripción' : 'Verificar Inscrição'}
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            {lang === 'es' ? 'Si ya realizaste tu pago, ingresa tu correo para verificar tu estatus.' : 'Se você ya realizó su pago, insira seu e-mail para verificar seu status.'}
          </p>
        </div>
        <div className="flex-1 w-full max-w-md bg-white p-6 rounded-xl shadow-lg border border-gray-100 ring-1 ring-gray-100">        
          <form onSubmit={checkStatus} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">{lang === 'es' ? 'Correo Electrónico' : 'Endereço de E-mail'}</label>
              <div className="flex gap-2">
                <input type="email" required placeholder="ejemplo@correo.com" value={emailCheck} onChange={(e) => setEmailCheck(e.target.value)} className="flex-1 min-w-0 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent outline-none transition-all" />
                <button disabled={loadingCheck} type="submit" className="shrink-0 bg-[#1e3a5f] hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg flex items-center justify-center">
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
                          {statusResult.status === 'paid' ? (lang === 'es' ? 'Aprobado' : 'Aprovado') : (lang === 'es' ? 'En Revisión' : 'Pendente')}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3"><AlertCircle className="w-5 h-5 flex-shrink-0" /><p>{lang === 'es' ? 'No encontramos registros.' : 'Nenhum registro encontrado.'}</p></div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* 5. SECCIÓN DE LOGOS (Usando el nuevo componente modular) */}
      <InstitutionCarousel lang={lang} />

    </div>
  );
};

export default HomeLanding;
