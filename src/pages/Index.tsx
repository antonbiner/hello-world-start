import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Index = () => {
  const [date, setDate] = useState("");
  const [passengers, setPassengers] = useState("");
  const [tripType, setTripType] = useState("");

  return (
    <div className="min-h-screen bg-primary">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <span className="text-primary-foreground font-semibold text-xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
          VTC Prestige
        </span>
        <div className="hidden md:flex items-center gap-8 text-primary-foreground/70 text-sm font-medium">
          <a href="#" className="hover:text-primary-foreground transition-colors">Services</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Flotte</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Tarifs</a>
          <a href="#" className="hover:text-primary-foreground transition-colors">Contact</a>
        </div>
        <Button variant="outline" size="sm" className="border-primary-foreground/20 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 hover:text-primary-foreground text-sm">
          Connexion
        </Button>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 pt-16 pb-24 md:pt-24 md:pb-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left — Copy */}
          <div className="space-y-6">
            <p className="text-accent text-sm font-semibold tracking-widest uppercase">
              Transport privé avec chauffeur
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-[1.1] tracking-tight">
              Voyagez avec
              <br />
              élégance & confort
            </h1>
            <p className="text-primary-foreground/60 text-lg max-w-md leading-relaxed">
              Service de transport haut de gamme à des tarifs accessibles. Ponctualité, discrétion et véhicules premium pour tous vos déplacements.
            </p>
            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-foreground">4.9</p>
                <p className="text-primary-foreground/50 text-xs">Note clients</p>
              </div>
              <div className="w-px h-10 bg-primary-foreground/15" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-foreground">24/7</p>
                <p className="text-primary-foreground/50 text-xs">Disponibilité</p>
              </div>
              <div className="w-px h-10 bg-primary-foreground/15" />
              <div className="text-center">
                <p className="text-2xl font-bold text-primary-foreground">15min</p>
                <p className="text-primary-foreground/50 text-xs">Réponse moy.</p>
              </div>
            </div>
          </div>

          {/* Right — Booking Card */}
          <div className="bg-card rounded-2xl p-8 shadow-2xl shadow-black/20">
            <h2 className="text-xl font-semibold text-card-foreground mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Réservez votre trajet
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Devis gratuit en moins de 2 minutes
            </p>

            <div className="space-y-5">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="text-card-foreground text-sm font-medium">
                  Date du trajet
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="bg-muted/50 border-border h-11"
                />
              </div>

              {/* Passengers */}
              <div className="space-y-2">
                <Label className="text-card-foreground text-sm font-medium">
                  Nombre de passagers
                </Label>
                <Select value={passengers} onValueChange={setPassengers}>
                  <SelectTrigger className="bg-muted/50 border-border h-11">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2">1 – 2 passagers</SelectItem>
                    <SelectItem value="3-4">3 – 4 passagers</SelectItem>
                    <SelectItem value="5-6">5 – 6 passagers</SelectItem>
                    <SelectItem value="7+">7+ passagers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Trip type */}
              <div className="space-y-2">
                <Label className="text-card-foreground text-sm font-medium">
                  Type de trajet
                </Label>
                <Select value={tripType} onValueChange={setTripType}>
                  <SelectTrigger className="bg-muted/50 border-border h-11">
                    <SelectValue placeholder="Sélectionnez" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="airport">Transfert aéroport</SelectItem>
                    <SelectItem value="business">Déplacement professionnel</SelectItem>
                    <SelectItem value="event">Événement</SelectItem>
                    <SelectItem value="excursion">Excursion</SelectItem>
                    <SelectItem value="other">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* CTA */}
              <Button className="w-full h-12 bg-accent text-accent-foreground hover:bg-accent/90 font-semibold text-sm tracking-wide mt-2">
                Demander un devis gratuit
              </Button>

              <p className="text-center text-muted-foreground text-xs">
                Sans engagement · Réponse sous 15 minutes
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
