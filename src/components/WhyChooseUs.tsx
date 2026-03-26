import { motion } from 'framer-motion';

const reasons = [
  {
    title: 'Toujours disponibles',
    desc: 'Tôt le matin, tard le soir, week-end — on est là quand vous avez besoin de nous.',
  },
  {
    title: 'Chauffeurs de confiance',
    desc: 'Professionnels, ponctuels et connaisseurs de chaque recoin de la région PACA.',
  },
  {
    title: 'Vans spacieux et confortables',
    desc: 'De la place pour vos bagages, vos jambes, et même pour vous détendre en route.',
  },
  {
    title: 'Prix transparents',
    desc: 'Devis gratuit, pas de frais cachés. Le prix annoncé est le prix final.',
  },
  {
    title: 'Pour tous les budgets',
    desc: 'Du transfert simple à la prestation sur mesure, on s\'adapte à vos besoins et votre budget.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-28 lg:py-40 section-padding">
      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-16 lg:gap-28 items-start">
        {/* Left column */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-brand-gold rounded-full" />
              <span className="text-[12px] tracking-[0.25em] uppercase text-brand-gold font-semibold">
                Pourquoi nous
              </span>
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.1] mb-5">
              Simple, fiable,
              <br />
              <em className="text-gradient-gold italic font-semibold">agréable</em>
            </h2>
            <p className="text-[15px] text-brand-cream/50 leading-[1.8] max-w-md">
              Pas de chichi, juste un bon service de transport 
              qui fait ce qu'il promet.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-12 relative"
          >
            <img
              src="/images/chauffeur.jpg"
              alt="Chauffeur professionnel"
              className="w-full aspect-[4/5] object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-black/30 to-transparent" />
          </motion.div>
        </div>

        {/* Right column */}
        <div className="lg:pt-6">
          {reasons.map((r, i) => (
            <motion.div
              key={r.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="group py-7 border-b border-brand-charcoal/20 first:border-t"
            >
              <div className="flex items-start gap-5">
                <span className="font-display text-[1.6rem] font-light text-brand-gold/25 leading-none mt-0.5 flex-shrink-0 w-8">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-display text-lg lg:text-xl font-medium mb-1.5 group-hover:text-brand-gold transition-colors duration-300">
                    {r.title}
                  </h3>
                  <p className="text-[13px] text-brand-cream/50 leading-[1.8]">{r.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10"
          >
            <a href="#booking" className="btn-primary">
              <span>Demander un devis gratuit</span>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
