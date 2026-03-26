import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import WhyChooseUs from './components/WhyChooseUs';
import Services from './components/Services';
import Booking from './components/Booking';
import Testimonials from './components/Testimonials';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-brand-black">
      <Header />
      <Hero />
      <About />
      <Experience />
      <WhyChooseUs />
      <Services />
      <Booking />
      <Testimonials />
      <FinalCTA />
      <Footer />
    </div>
  );
}

export default App;
