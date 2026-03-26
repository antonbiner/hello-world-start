import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Booking() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    service: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneNumber = '33600000000';
    const text = `Nouvelle demande L.S Transport\n\nNom: ${formData.name}\nTéléphone: ${formData.phone}\nEmail: ${formData.email}\nDate: ${formData.date}\nService: ${formData.service}\nMessage: ${formData.message}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`, '_blank');
    setSubmitted(true);
  };

  const inputClass =
    'w-full bg-transparent border-b border-brand-charcoal/40 py-4 text-brand-cream text-[14px] placeholder:text-brand-muted/40 focus:border-brand-gold/60 focus:outline-none transition-colors duration-500 font-body';

  return (
    <section id="booking" className="py-28 lg:py-40 section-padding relative">
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-brand-dark/50 to-transparent pointer-events-none" />

      <div className="max-w-[1400px] mx-auto grid lg:grid-cols-[1fr_1.2fr] gap-16 lg:gap-24 relative">
        {/* Left — Copy */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lg:sticky lg:top-32 lg:self-start"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-[2px] bg-brand-gold rounded-full" />
            <span className="text-[12px] tracking-[0.25em] uppercase text-brand-gold font-semibold">
              Devis gratuit
            </span>
          </div>
          <h2 className="font-display text-[clamp(2rem,4vw,3.2rem)] font-light leading-[1.1] mb-5">
            Dites-nous où
            <br />
            <em className="text-gradient-gold italic font-semibold">vous allez</em>
          </h2>
          <p className="text-[15px] text-brand-cream/50 leading-[1.8] mb-10 max-w-sm">
            Remplissez le formulaire, on vous répond en moins de 30 minutes 
            avec un devis personnalisé. Aucun engagement.
          </p>

          <div className="space-y-3 mb-10">
            {[
              'Réponse rapide, même le week-end',
              'Devis transparent, sans surprise',
              'Annulation gratuite jusqu\'à 24h avant',
              'Paiement flexible : CB, espèces, virement',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <svg className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-[13px] text-brand-cream/55 leading-[1.7]">{item}</span>
              </div>
            ))}
          </div>

          {/* WhatsApp alternative */}
          <div className="card-glass inline-flex items-center gap-3 px-5 py-3.5 rounded-lg">
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] flex-shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div>
              <span className="text-[12px] text-brand-cream/70 font-medium block">Préférez WhatsApp ?</span>
              <a href="https://wa.me/33600000000" target="_blank" rel="noopener noreferrer" className="text-[12px] text-brand-gold hover:underline">
                Écrivez-nous directement →
              </a>
            </div>
          </div>
        </motion.div>

        {/* Right — Form */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {submitted ? (
            <div className="card-glass p-12 text-center rounded-lg">
              <div className="w-14 h-14 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-brand-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="font-display text-2xl font-medium mb-3">Demande envoyée !</div>
              <p className="text-[14px] text-brand-cream/50">On vous recontacte très vite avec votre devis personnalisé.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="card-glass p-8 lg:p-10 space-y-5 rounded-lg">
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Nom complet</label>
                  <input name="name" type="text" placeholder="Votre nom" required value={formData.name} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Téléphone</label>
                  <input name="phone" type="tel" placeholder="+33 6 00 00 00 00" required value={formData.phone} onChange={handleChange} className={inputClass} />
                </div>
              </div>

              <div>
                <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Email</label>
                <input name="email" type="email" placeholder="votre@email.com" required value={formData.email} onChange={handleChange} className={inputClass} />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Date souhaitée</label>
                  <input name="date" type="date" required value={formData.date} onChange={handleChange} className={inputClass} />
                </div>
                <div>
                  <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Type de trajet</label>
                  <select name="service" required value={formData.service} onChange={handleChange} className={`${inputClass} bg-transparent`} style={{ backgroundColor: 'transparent' }}>
                    <option value="" className="bg-brand-charcoal text-brand-cream">Sélectionnez</option>
                    <option value="airport" className="bg-brand-charcoal text-brand-cream">Transfert aéroport</option>
                    <option value="business" className="bg-brand-charcoal text-brand-cream">Déplacement pro</option>
                    <option value="event" className="bg-brand-charcoal text-brand-cream">Soirée ou événement</option>
                    <option value="excursion" className="bg-brand-charcoal text-brand-cream">Excursion / balade</option>
                    <option value="other" className="bg-brand-charcoal text-brand-cream">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] tracking-[0.15em] uppercase text-brand-muted/60 mb-2 block font-medium">Précisions (optionnel)</label>
                <textarea
                  name="message"
                  placeholder="Nombre de passagers, adresse de départ, détails..."
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <button type="submit" className="btn-primary w-full mt-2">
                <span>Envoyer ma demande</span>
              </button>

              <p className="text-[11px] text-brand-muted/50 text-center pt-1">
                Devis gratuit · Sans engagement · Réponse rapide garantie
              </p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
