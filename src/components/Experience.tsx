import { motion } from 'framer-motion';

const features = [
  {
    image: '/images/leather-seats.jpg',
    title: 'Sièges en cuir spacieux',
    desc: 'Pour une relaxation optimale durant chaque trajet, avec un confort digne des plus grands hôtels.',
  },
  {
    image: '/images/van-interior.jpg',
    title: 'Boissons & gourmandises',
    desc: 'Friandises et boissons rafraîchissantes soigneusement sélectionnées, à votre disposition.',
  },
  {
    image: '/images/star-ceiling.jpg',
    title: 'Ciel étoilé',
    desc: 'Admirez notre toit étoilé pour un voyage tout en élégance et en magie.',
  },
];

export default function Experience() {
  return (
    <section id="experience" className="py-28 lg:py-40 bg-brand-dark">
      <div className="section-padding max-w-[1400px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16 lg:mb-24"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="gold-line" />
            <span className="text-[11px] tracking-[0.3em] uppercase text-brand-gold font-medium">
              L'expérience
            </span>
            <div className="gold-line" />
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.1]">
            Un intérieur pensé
            <br />
            <em className="text-gradient-gold italic font-medium">pour vous</em>
          </h2>
          <p className="text-[15px] text-brand-cream/45 mt-5 max-w-lg mx-auto leading-[1.8]">
            Profitez d'un espace intérieur raffiné équipé des dernières technologies
            pour un voyage agréable et divertissant.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5 lg:gap-7">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.12 }}
              className="group relative"
            >
              <div className="relative overflow-hidden aspect-[3/4]">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]"
                  loading="lazy"
                />
                {/* Overlay with text */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-black/90 via-brand-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                  <h3 className="font-display text-xl lg:text-[1.4rem] font-medium mb-2 leading-tight">{f.title}</h3>
                  <p className="text-[13px] text-brand-cream/50 leading-[1.7]">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
