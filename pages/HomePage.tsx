
import React, { useState, useEffect } from 'react';
import type { Language } from '../types';
import { getSiteSettings, getManagedProducts } from '../db';
import HeroSection from '../components/HeroSection';
import ProductSelector from '../components/ProductSelector';
import ServicesSection from '../components/ServicesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import FaqSection from '../components/FaqSection';
import type { Product } from '../types';

interface HomePageProps {
  language: Language;
  navigate: (path: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ language, navigate }) => {
  const [settings, setSettings] = useState(getSiteSettings());
  const [products] = useState<Product[]>(getManagedProducts());

  useEffect(() => {
    const handleStorageChange = () => setSettings(getSiteSettings());
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleSelectProduct = (product: Product) => {
    navigate(`/product/${product.id}`);
  };

  return (
    <>
      <HeroSection language={language} settings={settings.hero} />
      
      <div id="product-section" className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ProductSelector
          language={language}
          products={products}
          onSelectProduct={handleSelectProduct}
        />
      </div>

      {settings.services.enabled && <ServicesSection language={language} settings={settings.services} />}
      {settings.howItWorks.enabled && <HowItWorksSection language={language} settings={settings.howItWorks} />}
      {settings.testimonials.enabled && <TestimonialsSection language={language} settings={settings.testimonials} />}
      {settings.faq.enabled && <FaqSection language={language} settings={settings.faq} />}
    </>
  );
};

export default HomePage;
