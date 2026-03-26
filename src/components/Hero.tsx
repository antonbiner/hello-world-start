import { motion } from 'framer-motion';
import { useState } from 'react';

const serviceOptions = [
  { value: 'airport', label: 'Aéroport' },
  { value: 'business', label: 'Pro' },
  { value: 'event', label: 'Événement' },
  { value: 'excursion', label: 'Excursion' },
  { value: 'other', label: 'Autre' },
];

export default function Hero() {
  const [date, setDate] = useState('');
  const [passengers, setPassengers] = useState('');
  const [service, setService] = useState('');

  const handleQuickBooking = () => {
    const text = `Bonjour, je souhaite réserver :\n📅 Date : ${date || 'À définir'}\n👥 Passagers : ${passengers || 'À définir'}\n🚐 Service : ${serviceOptions.find(s => s.value === service)?.label || 'À définir'}`;
    window.open(`https://wa.me/33600000000?text=${encodeURIComponent(text)}`, '_blank');
  };

  const selectClass =
    'bg-brand-charcoal/60 border border-brand-charcoal/50 text-brand-cream text-[13px] font-body rounded-md px-3 py-3 focus:border-brand-gold/50 focus:outline-none transition-colors appearance-none cursor-pointer w-full';

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-bg.jpg"
          alt="Van confortable en déplacement"
          className="w-full h-full object-cover object-center"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black/90 via-brand-black/50 to-brand-black/15" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-brand-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 section-padding w-full max-w-[1400px] mx-auto pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="max-w-[680px]"
        >
          {/* Tag */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-[2px] bg-brand-gold rounded-full" />
            <span className="text-[12px] font-body font-semibold tracking-[0.25em] uppercase text-brand-gold">
              Transport privé · Région PACA
            </span>
          </div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-display text-[clamp(2.6rem,5.5vw,4.8rem)] font-light leading-[1] mb-6 tracking-[-0.02em]"
          >
            On vous emmène
            <br />
            <em className="text-gradient-gold font-semibold italic">où vous voulez.</em>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-base lg:text-lg text-brand-cream/60 font-light leading-[1.7] max-w-[460px] mb-10"
          >
            Aéroport, soirée, excursion ou déplacement pro — 
            un van confortable avec chauffeur, disponible quand vous en avez besoin.
          </motion.p>

          {/* Quick booking inline form */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="card-glass rounded-xl p-5 lg:p-6 mb-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {/* Date */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-brand-muted/60 mb-1.5 block font-semibold">
                  📅 Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={selectClass}
                />
              </div>

              {/* Passengers */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-brand-muted/60 mb-1.5 block font-semibold">
                  👥 Passagers
                </label>
                <select
                  value={passengers}
                  onChange={(e) => setPassengers(e.target.value)}
                  className={selectClass}
                  style={{ backgroundColor: 'transparent' }}
                >
                  <option value="" className="bg-brand-charcoal text-brand-cream">Combien ?</option>
                  <option value="1-2" className="bg-brand-charcoal text-brand-cream">1–2 personnes</option>
                  <option value="3-4" className="bg-brand-charcoal text-brand-cream">3–4 personnes</option>
                  <option value="5-6" className="bg-brand-charcoal text-brand-cream">5–6 personnes</option>
                  <option value="7+" className="bg-brand-charcoal text-brand-cream">7+ personnes</option>
                </select>
              </div>

              {/* Service type */}
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-brand-muted/60 mb-1.5 block font-semibold">
                  🚐 Trajet
                </label>
                <select
                  value={service}
                  onChange={(e) => setService(e.target.value)}
                  className={selectClass}
                  style={{ backgroundColor: 'transparent' }}
                >
                  <option value="" className="bg-brand-charcoal text-brand-cream">Quel type ?</option>
                  {serviceOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-brand-charcoal text-brand-cream">
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#booking" className="btn-primary flex-1 text-center rounded-md">
                <span>Demander un devis gratuit</span>
              </a>
              <button
                onClick={handleQuickBooking}
                className="btn-outline rounded-md gap-2 flex-shrink-0"
              >
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Réserver via WhatsApp
              </button>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-[13px] text-brand-cream/35 font-body"
          >
            ★★★★★ Noté 5/5 par nos clients · Réponse en moins de 30 min
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
