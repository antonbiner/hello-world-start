import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const languages = [
  { code: 'fr', label: 'FR', flag: '🇫🇷' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ar', label: 'AR', flag: '🇸🇦' },
  { code: 'it', label: 'IT', flag: '🇮🇹' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(languages[0]);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const links = [
    { href: '#about', label: 'À propos' },
    { href: '#experience', label: 'Expérience' },
    { href: '#services', label: 'Services' },
    { href: '#booking', label: 'Réserver' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          scrolled
            ? 'bg-brand-black/95 backdrop-blur-xl shadow-[0_1px_0_0_hsl(var(--brand-charcoal)/0.3)]'
            : 'bg-gradient-to-b from-brand-black/60 to-transparent'
        }`}
      >
        <div className="section-padding flex items-center justify-between h-[72px] lg:h-[88px] max-w-[1400px] mx-auto w-full">
          <a href="#" className="flex items-center gap-3 flex-shrink-0">
            <img src="/images/logo.png" alt="L.S Transport" className="h-9 lg:h-11 w-auto" />
          </a>

          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-[13px] font-body font-medium tracking-[0.15em] uppercase text-brand-cream/60 hover:text-brand-cream transition-colors duration-300 py-2"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right side: Language switcher + CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language switcher */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-md border border-brand-charcoal/30 hover:border-brand-gold/40 transition-colors duration-300"
              >
                <span className="text-base leading-none">{currentLang.flag}</span>
                <span className="text-[12px] font-body font-semibold text-brand-cream/70 tracking-wider">
                  {currentLang.label}
                </span>
                <svg
                  className={`w-3 h-3 text-brand-cream/40 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 mt-2 bg-brand-charcoal/95 backdrop-blur-xl border border-brand-charcoal/50 rounded-lg overflow-hidden shadow-2xl min-w-[140px]"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setCurrentLang(lang);
                          setLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-brand-gold/10 transition-colors duration-200 ${
                          currentLang.code === lang.code ? 'bg-brand-gold/5' : ''
                        }`}
                      >
                        <span className="text-lg leading-none">{lang.flag}</span>
                        <span className="text-[13px] font-body font-medium text-brand-cream/80">
                          {lang.label}
                        </span>
                        {currentLang.code === lang.code && (
                          <svg className="w-3.5 h-3.5 text-brand-gold ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a
              href="#booking"
              className="btn-primary text-[13px] !py-3 !px-7"
            >
              <span>Devis gratuit</span>
            </a>
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden flex flex-col justify-center items-center w-10 h-10"
            aria-label="Menu"
          >
            <span className={`block w-5 h-[1.5px] bg-brand-cream transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-[3px]' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-brand-cream transition-all duration-300 mt-[5px] ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-brand-cream transition-all duration-300 mt-[5px] ${menuOpen ? '-rotate-45 -translate-y-[8px]' : ''}`} />
          </button>
        </div>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden bg-brand-black/98 backdrop-blur-2xl border-t border-brand-charcoal/15"
            >
              <nav className="flex flex-col section-padding py-8 gap-5">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="text-base font-body font-medium tracking-[0.12em] uppercase text-brand-cream/70 hover:text-brand-gold transition-colors"
                  >
                    {link.label}
                  </a>
                ))}

                {/* Mobile language selector */}
                <div className="flex items-center gap-2 pt-3 border-t border-brand-charcoal/20">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setCurrentLang(lang)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-md border transition-colors duration-200 ${
                        currentLang.code === lang.code
                          ? 'border-brand-gold/50 bg-brand-gold/10'
                          : 'border-brand-charcoal/30'
                      }`}
                    >
                      <span className="text-base">{lang.flag}</span>
                      <span className="text-[11px] font-semibold text-brand-cream/70">{lang.label}</span>
                    </button>
                  ))}
                </div>

                <a
                  href="#booking"
                  onClick={() => setMenuOpen(false)}
                  className="mt-3 btn-primary w-full text-center"
                >
                  <span>Demander un devis gratuit</span>
                </a>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Floating WhatsApp — gold icon only */}
      <a
        href="https://wa.me/33600000000?text=Bonjour%2C%20je%20souhaite%20réserver%20un%20transport."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--brand-gold)), hsl(var(--brand-gold-dark)))',
          boxShadow: '0 8px 30px -6px hsl(var(--brand-gold) / 0.4)',
        }}
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6 fill-brand-black group-hover:scale-105 transition-transform">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-brand-black/95 backdrop-blur-xl border-t border-brand-charcoal/20 px-4 py-3 safe-area-bottom">
        <a
          href="#booking"
          className="btn-primary w-full text-center block"
        >
          <span>Demander un devis gratuit</span>
        </a>
      </div>
    </>
  );
}
