import React from 'react';
import { Language, SiteSettings } from '../types';

interface HeroSectionProps {
  language: Language;
  settings: SiteSettings['hero'];
}

const HeroSection: React.FC<HeroSectionProps> = ({ language, settings }) => {
    
    const handleCtaClick = () => {
        document.getElementById('product-section')?.scrollIntoView({ behavior: 'smooth' });
    };

    const hasImage = !!settings.heroImageB64;

    return (
        <section 
            className={`relative text-center bg-cover bg-center ${hasImage ? 'py-28 md:py-36 text-white' : 'bg-primary/10 py-20 text-gray-900'}`}
            style={{ backgroundImage: hasImage ? `url(${settings.heroImageB64})` : 'none' }}
        >
            {hasImage && <div className="absolute inset-0 bg-black/50"></div>}
            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ textShadow: hasImage ? '0 2px 4px rgba(0,0,0,0.5)' : 'none' }}>
                    {settings.title}
                </h1>
                <p className="mt-4 max-w-2xl mx-auto text-lg" style={{ textShadow: hasImage ? '0 1px 3px rgba(0,0,0,0.5)' : 'none' }}>
                    {hasImage ? settings.subtitle : <span className="text-gray-600">{settings.subtitle}</span>}
                </p>
                <div className="mt-8">
                    <button
                        onClick={handleCtaClick}
                        className="px-8 py-3 bg-primary text-white font-bold rounded-lg text-lg hover:bg-primary-focus shadow-lg transition-all transform hover:scale-105"
                    >
                        {settings.ctaText}
                    </button>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;