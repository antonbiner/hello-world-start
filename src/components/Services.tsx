import { motion } from 'framer-motion';

const services = [
  {
    title: 'Transferts aéroport',
    desc: 'Marseille, Nice, Toulon — on vous dépose ou on vient vous chercher, à l\'heure.',
    image: '/images/airport-transfer.jpg',
  },
  {
    title: 'Déplacements pro',
    desc: 'Réunions, séminaires, rendez-vous clients. Arrivez détendu et à l\'heure.',
    image: '/images/chauffeur.jpg',
  },
  {
    title: 'Soirées & événements',
    desc: 'Mariage, gala, anniversaire — profitez de votre soirée, on gère le transport.',
    image: '/images/experience-interior.jpg',
  },
  {
    title: 'Balades & excursions',
    desc: 'Découvrez la Côte d\'Azur et la Provence à votre rythme, sans vous soucier de la route.',
    image: '/images/van-exterior.jpg',
  },
];

export default function Services() {
  return (
    <section id="services" className="py-28 lg:py-40 bg-brand-dark">
      <div className="section-padding max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16 lg:mb-24"
        >
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-[2px] bg-brand-gold rounded-full" />
              <span className="text-[12px] tracking-[0.25em] uppercase text-brand-gold font-semibold">
                Nos services
              </span>
            </div>
            <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.1]">
              Un van, mille
              <br />
              <em className="text-gradient-gold italic font-semibold">occasions</em>
            </h2>
          </div>
          <p className="text-[15px] text-brand-cream/50 leading-[1.8] max-w-md lg:text-right">
            Quel que soit votre besoin, on a le trajet qu'il vous faut.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-4 lg:gap-5">
          {services.map((s, i) => (
            <motion.a
              href="#booking"
              key={s.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="group relative overflow-hidden aspect-[16/10] block"
            >
              <img
                src={s.image}
                alt={s.title}
                className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/40 to-brand-black/10 group-hover:from-brand-black/95 transition-all duration-500" />
              
              <div className="absolute bottom-0 left-0 right-0 p-7 lg:p-9">
                <h3 className="font-display text-xl lg:text-2xl font-medium mb-2">
                  {s.title}
                </h3>
                <p className="text-[13px] text-brand-cream/55 leading-[1.7] max-w-sm">
                  {s.desc}
                </p>
                <span className="inline-block mt-3 text-[12px] text-brand-gold font-semibold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  Demander un devis →
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
