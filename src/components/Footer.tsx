export default function Footer() {
  return (
    <footer id="contact" className="py-16 lg:py-20 section-padding border-t border-brand-charcoal/15">
      <div className="max-w-[1400px] mx-auto">
        <div className="grid md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <img src="/images/logo.png" alt="L.S Transport" className="h-10 mb-5" />
            <p className="text-[13px] text-brand-cream/35 leading-[1.8] max-w-xs mb-6">
              Service de transport privé exclusif dans la région PACA.
              Confort, élégance et fiabilité pour chaque trajet.
            </p>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
              <span className="text-[12px] text-brand-cream/40">Disponible 24/7</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/50 font-medium mb-5">
              Navigation
            </h4>
            <nav className="flex flex-col gap-2.5">
              {[
                { href: '#about', label: 'À propos' },
                { href: '#experience', label: 'Expérience' },
                { href: '#services', label: 'Services' },
                { href: '#booking', label: 'Réservation' },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-[13px] text-brand-cream/35 hover:text-brand-gold transition-colors duration-300"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[11px] tracking-[0.2em] uppercase text-brand-cream/50 font-medium mb-5">
              Contact
            </h4>
            <div className="space-y-2.5 text-[13px] text-brand-cream/35">
              <p>Région PACA, France</p>
              <a href="tel:+33600000000" className="block hover:text-brand-gold transition-colors duration-300">
                +33 6 00 00 00 00
              </a>
              <a href="mailto:contact@lstransport.fr" className="block hover:text-brand-gold transition-colors duration-300">
                contact@lstransport.fr
              </a>
            </div>
          </div>
        </div>

        <div className="divider-gold mt-14 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-brand-muted/40">
            © {new Date().getFullYear()} L.S Transport — Van Prestige. Tous droits réservés.
          </p>
          <p className="text-[11px] text-brand-muted/40">
            Transport privé de luxe · Région PACA
          </p>
        </div>
      </div>

      {/* Bottom padding for mobile sticky CTA */}
      <div className="lg:hidden h-16" />
    </footer>
  );
}
