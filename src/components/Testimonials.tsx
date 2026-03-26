import { motion } from 'framer-motion';

const testimonials = [
  {
    text: 'Super service ! Le chauffeur était à l\'heure, le van très confortable. Parfait pour notre transfert vers l\'aéroport de Nice.',
    author: 'Sophie M.',
    role: 'Particulier, Marseille',
  },
  {
    text: 'On utilise L.S Transport pour nos clients. Toujours pro, toujours ponctuel. Les retours sont unanimes : un service au top.',
    author: 'Marc D.',
    role: 'Hôtelier, Cannes',
  },
  {
    text: 'J\'avais besoin d\'un transport pour un mariage. Tout était parfait, du premier contact à la fin de la soirée. Je recommande à 100%.',
    author: 'Isabelle R.',
    role: 'Particulier, Aix-en-Provence',
  },
];

export default function Testimonials() {
  return (
    <section className="py-28 lg:py-40 bg-brand-dark section-padding">
      <div className="max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 lg:mb-20"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-brand-gold rounded-full" />
              <span className="text-[12px] tracking-[0.25em] uppercase text-brand-gold font-semibold">
                Avis clients
              </span>
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.1]">
              Ce qu'ils disent
              <br />
              <em className="text-gradient-gold italic font-semibold">de nous</em>
            </h2>
          </div>
          <a href="#booking" className="btn-primary text-[13px] !py-3 !px-7 self-start lg:self-auto">
            <span>Réserver aussi</span>
          </a>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.author}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="card-glass p-7 lg:p-8 flex flex-col justify-between rounded-lg"
            >
              <div>
                <div className="flex gap-0.5 mb-5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="text-brand-gold text-[13px]">★</span>
                  ))}
                </div>
                <p className="text-[14px] text-brand-cream/65 leading-[1.8]">
                  « {t.text} »
                </p>
              </div>

              <div className="mt-7 pt-5 border-t border-brand-charcoal/20">
                <div className="font-display text-base font-medium">{t.author}</div>
                <div className="text-[11px] text-brand-muted/60 tracking-wider mt-1">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
