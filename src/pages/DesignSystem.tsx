export default function DesignSystem() {
  return (
    <div className="min-h-screen bg-brand-black text-brand-white">
      {/* Header */}
      <header className="border-b border-brand-charcoal/20">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/images/logo.png" alt="L.S Transport" className="h-9" />
            <span className="text-[11px] tracking-[0.2em] uppercase text-brand-muted font-semibold">Design System</span>
          </a>
          <a href="/" className="text-[13px] text-brand-cream/50 hover:text-brand-gold transition-colors font-body">
            ← Retour au site
          </a>
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-8 py-16 space-y-28">

        {/* ─── Colors ─── */}
        <section>
          <SectionTitle title="Couleurs" subtitle="Palette de couleurs de la marque" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-10">
            {[
              { name: 'Black', var: '--brand-black', className: 'bg-brand-black border border-brand-charcoal/30' },
              { name: 'Dark', var: '--brand-dark', className: 'bg-brand-dark' },
              { name: 'Charcoal', var: '--brand-charcoal', className: 'bg-brand-charcoal' },
              { name: 'Gold', var: '--brand-gold', className: 'bg-brand-gold' },
              { name: 'Gold Light', var: '--brand-gold-light', className: 'bg-brand-gold-light' },
              { name: 'Gold Dark', var: '--brand-gold-dark', className: 'bg-brand-gold-dark' },
              { name: 'Cream', var: '--brand-cream', className: 'bg-brand-cream' },
              { name: 'White', var: '--brand-white', className: 'bg-brand-white' },
              { name: 'Muted', var: '--brand-muted', className: 'bg-brand-muted' },
            ].map((c) => (
              <div key={c.name} className="group">
                <div className={`${c.className} w-full aspect-square rounded-lg mb-3 transition-transform group-hover:scale-105`} />
                <div className="text-[13px] font-body font-semibold text-brand-cream/80">{c.name}</div>
                <div className="text-[11px] font-body text-brand-muted/50 font-mono">{c.var}</div>
              </div>
            ))}
          </div>

          {/* Gradients */}
          <h3 className="font-display text-xl font-medium mt-14 mb-5">Dégradés</h3>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <div className="w-full h-20 rounded-lg mb-2" style={{ background: 'linear-gradient(135deg, hsl(var(--brand-gold)), hsl(var(--brand-gold-light)))' }} />
              <div className="text-[12px] text-brand-muted/60 font-body">Gold gradient (primary)</div>
            </div>
            <div>
              <div className="w-full h-20 rounded-lg mb-2" style={{ background: 'linear-gradient(135deg, hsl(var(--brand-gold)), hsl(var(--brand-gold-dark)))' }} />
              <div className="text-[12px] text-brand-muted/60 font-body">Gold dark gradient (buttons)</div>
            </div>
            <div>
              <div className="w-full h-20 rounded-lg mb-2 text-gradient-gold flex items-center justify-center font-display text-2xl font-semibold italic">Texte doré</div>
              <div className="text-[12px] text-brand-muted/60 font-body">Text gradient gold</div>
            </div>
          </div>
        </section>

        {/* ─── Typography ─── */}
        <section>
          <SectionTitle title="Typographie" subtitle="Hiérarchie typographique et styles de texte" />

          <div className="space-y-10 mt-10">
            {/* Display font */}
            <div className="border-b border-brand-charcoal/15 pb-8">
              <div className="text-[11px] tracking-[0.2em] uppercase text-brand-gold font-semibold mb-4">Font Display — Cormorant Garamond</div>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] text-brand-muted/50 font-mono block mb-1">H1 — clamp(2.6rem, 5.5vw, 4.8rem) · font-light</span>
                  <h1 className="font-display text-[clamp(2.6rem,5.5vw,4.8rem)] font-light leading-[1]">L'art du transport</h1>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted/50 font-mono block mb-1">H2 — clamp(2rem, 4vw, 3.2rem) · font-light</span>
                  <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.1]">Un service d'exception</h2>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted/50 font-mono block mb-1">H3 — text-xl / text-2xl · font-medium</span>
                  <h3 className="font-display text-2xl font-medium">Transferts aéroport</h3>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted/50 font-mono block mb-1">Italic emphasis with gold gradient</span>
                  <p className="font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.1]">
                    Voyagez <em className="text-gradient-gold italic font-semibold">avec style</em>
                  </p>
                </div>
              </div>
            </div>

            {/* Body font */}
            <div className="border-b border-brand-charcoal/15 pb-8">
              <div className="text-[11px] tracking-[0.2em] uppercase text-brand-gold font-semibold mb-4">Font Body — DM Sans</div>
              <div className="space-y-4 max-w-xl">
                <div>
                  <span className="text-[10px] text-brand-muted/50 font-mono block mb-1">Body — text-[15px] · text-brand-cream/60</span>
                  <p className="text-[15px] text-brand-cream/60 leading-[1.9] font-body">
                    Chez L.S Transport, on croit que se déplacer devrait être simple et agréable. Notre objectif est de vous offrir un trajet confortable et ponctuel.
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted/50 font-mono block mb-1">Small — text-[13px] · text-brand-cream/50</span>
                  <p className="text-[13px] text-brand-cream/50 leading-[1.7] font-body">
                    Réponse garantie sous 30 minutes · Disponible 24/7 · Sans engagement
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted/50 font-mono block mb-1">Label — text-[11px] · tracking-[0.15em] · uppercase</span>
                  <span className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 font-medium font-body">Nom complet</span>
                </div>
                <div>
                  <span className="text-[10px] text-brand-muted/50 font-mono block mb-1">Tag — text-[12px] · tracking-[0.25em] · uppercase · text-brand-gold</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-[2px] bg-brand-gold rounded-full" />
                    <span className="text-[12px] font-body font-semibold tracking-[0.25em] uppercase text-brand-gold">Section tag</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Buttons ─── */}
        <section>
          <SectionTitle title="Boutons" subtitle="Variantes et états des boutons" />
          <div className="mt-10 space-y-8">
            {/* Primary */}
            <div>
              <div className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-4 font-semibold">Primary (btn-primary)</div>
              <div className="flex flex-wrap gap-4 items-center">
                <a href="#" className="btn-primary"><span>Demander un devis gratuit</span></a>
                <a href="#" className="btn-primary text-[13px] !py-3 !px-7"><span>Devis gratuit</span></a>
                <a href="#" className="btn-primary w-64 text-center"><span>Full width example</span></a>
              </div>
            </div>

            {/* Outline */}
            <div>
              <div className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-4 font-semibold">Outline (btn-outline)</div>
              <div className="flex flex-wrap gap-4 items-center">
                <a href="#" className="btn-outline">Découvrir le service</a>
                <a href="#" className="btn-outline gap-2">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current opacity-70"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
                <a href="#" className="btn-outline text-[13px] !py-3 !px-7">Compact</a>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Cards ─── */}
        <section>
          <SectionTitle title="Cartes" subtitle="Composants de carte avec effet glass" />
          <div className="grid sm:grid-cols-3 gap-5 mt-10">
            <div className="card-glass p-7 rounded-lg">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-brand-gold text-[13px]">★</span>
                ))}
              </div>
              <p className="text-[14px] text-brand-cream/65 leading-[1.8] mb-5">
                « Un service au top, ponctuel et professionnel. »
              </p>
              <div className="pt-4 border-t border-brand-charcoal/20">
                <div className="font-display text-base font-medium">Sophie M.</div>
                <div className="text-[11px] text-brand-muted/60 tracking-wider mt-1">Particulier</div>
              </div>
            </div>

            <div className="card-glass p-7 rounded-lg flex flex-col items-center text-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mb-3" />
              <span className="text-[12px] text-brand-cream/60 font-medium">Disponible maintenant</span>
              <p className="text-[13px] text-brand-cream/40 mt-2">Badge de disponibilité</p>
            </div>

            <div className="card-glass p-7 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366]"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                <span className="text-[12px] text-brand-cream/70 font-medium">WhatsApp card</span>
              </div>
              <a href="#" className="text-[12px] text-brand-gold hover:underline">Écrivez-nous directement →</a>
            </div>
          </div>
        </section>

        {/* ─── Form Elements ─── */}
        <section>
          <SectionTitle title="Formulaires" subtitle="Champs de saisie et éléments de formulaire" />
          <div className="mt-10 max-w-lg space-y-5">
            <div>
              <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Input text</label>
              <input
                type="text"
                placeholder="Votre nom"
                className="w-full bg-transparent border-b border-brand-charcoal/40 py-4 text-brand-cream text-[14px] placeholder:text-brand-muted/40 focus:border-brand-gold/60 focus:outline-none transition-colors duration-500 font-body"
              />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Select</label>
              <select className="w-full bg-transparent border-b border-brand-charcoal/40 py-4 text-brand-cream text-[14px] focus:border-brand-gold/60 focus:outline-none transition-colors duration-500 font-body" style={{ backgroundColor: 'transparent' }}>
                <option className="bg-brand-charcoal text-brand-cream">Option 1</option>
                <option className="bg-brand-charcoal text-brand-cream">Option 2</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Textarea</label>
              <textarea
                placeholder="Votre message..."
                rows={3}
                className="w-full bg-transparent border-b border-brand-charcoal/40 py-4 text-brand-cream text-[14px] placeholder:text-brand-muted/40 focus:border-brand-gold/60 focus:outline-none transition-colors duration-500 font-body resize-none"
              />
            </div>
            <div>
              <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Quick booking input (glass card)</label>
              <div className="card-glass rounded-xl p-5">
                <div className="grid grid-cols-3 gap-3">
                  <input type="date" className="bg-brand-charcoal/60 border border-brand-charcoal/50 text-brand-cream text-[13px] font-body rounded-md px-3 py-3 focus:border-brand-gold/50 focus:outline-none transition-colors w-full" />
                  <select className="bg-brand-charcoal/60 border border-brand-charcoal/50 text-brand-cream text-[13px] font-body rounded-md px-3 py-3 focus:border-brand-gold/50 focus:outline-none transition-colors w-full appearance-none" style={{ backgroundColor: 'transparent' }}>
                    <option className="bg-brand-charcoal text-brand-cream">1–2 pers.</option>
                  </select>
                  <select className="bg-brand-charcoal/60 border border-brand-charcoal/50 text-brand-cream text-[13px] font-body rounded-md px-3 py-3 focus:border-brand-gold/50 focus:outline-none transition-colors w-full appearance-none" style={{ backgroundColor: 'transparent' }}>
                    <option className="bg-brand-charcoal text-brand-cream">Aéroport</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Decorative Elements ─── */}
        <section>
          <SectionTitle title="Éléments décoratifs" subtitle="Lignes, séparateurs et badges" />
          <div className="mt-10 space-y-8">
            <div>
              <div className="text-[11px] text-brand-muted/50 mb-3 font-mono">gold-line (48px)</div>
              <div className="gold-line" />
            </div>
            <div>
              <div className="text-[11px] text-brand-muted/50 mb-3 font-mono">Rounded gold line (w-10 h-[2px])</div>
              <div className="w-10 h-[2px] bg-brand-gold rounded-full" />
            </div>
            <div>
              <div className="text-[11px] text-brand-muted/50 mb-3 font-mono">divider-gold (full width)</div>
              <div className="divider-gold" />
            </div>
            <div>
              <div className="text-[11px] text-brand-muted/50 mb-3 font-mono">Stars rating</div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="text-brand-gold text-[13px]">★</span>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-brand-muted/50 mb-3 font-mono">Availability badge</div>
              <div className="card-glass inline-flex items-center gap-3 px-5 py-3 rounded-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[12px] text-brand-cream/60 font-medium">Disponible maintenant</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-brand-muted/50 mb-3 font-mono">Checkmark list</div>
              <div className="space-y-2">
                {['Réponse rapide', 'Devis transparent', 'Annulation gratuite'].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <svg className="w-4 h-4 text-brand-gold flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-[13px] text-brand-cream/55">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Spacing ─── */}
        <section>
          <SectionTitle title="Espacement" subtitle="Paddings de section et grilles" />
          <div className="mt-10 space-y-6">
            <div>
              <div className="text-[11px] text-brand-muted/50 mb-2 font-mono">section-padding: px-6 md:px-12 lg:px-20 xl:px-32</div>
              <div className="bg-brand-charcoal/20 border border-brand-charcoal/30 rounded-lg p-4">
                <div className="section-padding bg-brand-gold/10 rounded py-4 text-[12px] text-brand-cream/50 text-center">
                  Contenu avec section-padding
                </div>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-brand-muted/50 mb-2 font-mono">max-w-[1400px] mx-auto (container)</div>
            </div>
            <div>
              <div className="text-[11px] text-brand-muted/50 mb-2 font-mono">Section vertical rhythm: py-28 lg:py-40</div>
            </div>
          </div>
        </section>

        {/* ─── Language Switcher ─── */}
        <section>
          <SectionTitle title="Language Switcher" subtitle="Sélecteur de langue avec drapeaux" />
          <div className="mt-10 flex items-center gap-6">
            <div className="flex items-center gap-2">
              {[
                { code: 'fr', label: 'FR', flag: '🇫🇷' },
                { code: 'en', label: 'EN', flag: '🇬🇧' },
                { code: 'ar', label: 'AR', flag: '🇸🇦' },
                { code: 'it', label: 'IT', flag: '🇮🇹' },
              ].map((lang, i) => (
                <div
                  key={lang.code}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-md border transition-colors ${
                    i === 0 ? 'border-brand-gold/50 bg-brand-gold/10' : 'border-brand-charcoal/30'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span className="text-[11px] font-semibold text-brand-cream/70">{lang.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-brand-charcoal/15 py-8 px-8 text-center">
        <p className="text-[11px] text-brand-muted/40">
          L.S Transport Design System · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-[2px] bg-brand-gold rounded-full" />
        <span className="text-[12px] font-body font-semibold tracking-[0.25em] uppercase text-brand-gold">
          {title}
        </span>
      </div>
      <p className="text-[15px] text-brand-cream/50 font-body">{subtitle}</p>
    </div>
  );
}
