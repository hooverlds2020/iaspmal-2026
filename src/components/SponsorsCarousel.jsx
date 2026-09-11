import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function SponsorLogo({ sponsor }) {
  return (
    <a
      href={sponsor.website_url || undefined}
      target={sponsor.website_url ? '_blank' : undefined}
      rel={sponsor.website_url ? 'noopener noreferrer' : undefined}
      className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-80 hover:opacity-100"
      title={sponsor.name}
    >
      <img
        src={sponsor.logo_url}
        alt={sponsor.name}
        className="h-16 md:h-20 w-auto object-contain"
        loading="lazy"
      />
    </a>
  );
}

const MIN_ITEMS_FOR_MARQUEE = 5;

function LogoRow({ items, label, speed = 30 }) {
  if (!items.length) return null;

  const shouldAnimate = items.length >= MIN_ITEMS_FOR_MARQUEE;
  const track = shouldAnimate ? [...items, ...items] : items;

  return (
    <div className="mb-10">
      {label && (
        <h3 className="text-center text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
          {label}
        </h3>
      )}
      <div className="relative overflow-hidden w-full">
        {shouldAnimate ? (
          <div
            className="flex items-center gap-12 w-max animate-marquee"
            style={{ animationDuration: `${speed}s` }}
          >
            {track.map((sponsor, i) => (
              <SponsorLogo key={`${sponsor.id}-${i}`} sponsor={sponsor} />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center flex-wrap gap-12">
            {track.map((sponsor) => (
              <SponsorLogo key={sponsor.id} sponsor={sponsor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SponsorsCarousel() {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, []);

  async function fetchSponsors() {
    const { data, error } = await supabase
      .schema('public')
      .from('sponsors')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: true });

    if (!error && data) setSponsors(data);
    setLoading(false);
  }

  if (loading) return null;
  if (!sponsors.length) return null;

  const educativas = sponsors.filter((s) => s.category === 'educativa');
  const comerciales = sponsors.filter((s) => s.category === 'comercial');

  return (
    <section id="patrocinios" className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
          Patrocinios y colaboraciones
        </h2>
        <LogoRow items={educativas} label="Instituciones educativas" speed={35} />
        <LogoRow items={comerciales} label="Colaboradores" speed={28} />
      </div>
    </section>
  );
}
