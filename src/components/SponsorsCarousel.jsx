import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

function SponsorLogo({ sponsor }) {
  return (
    <a
      href={sponsor.website_url || undefined}
      target={sponsor.website_url ? '_blank' : undefined}
      rel={sponsor.website_url ? 'noopener noreferrer' : undefined}
      className="flex-shrink-0"
      title={sponsor.name}
    >
      <img
        src={sponsor.logo_url}
        alt={sponsor.name}
        className="h-32 md:h-40 w-auto object-contain"
        loading="lazy"
      />
    </a>
  );
}

const MIN_ITEMS_FOR_MARQUEE = 5;

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

  const shouldAnimate = sponsors.length >= MIN_ITEMS_FOR_MARQUEE;
  const track = shouldAnimate ? [...sponsors, ...sponsors] : sponsors;

  return (
    <section id="patrocinios" className="py-16 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="relative overflow-hidden w-full">
          {shouldAnimate ? (
            <div
              className="flex items-center gap-12 w-max animate-marquee"
              style={{ animationDuration: '30s' }}
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
    </section>
  );
}
