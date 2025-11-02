import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Language, SiteSettings } from '../types';

interface ServicesSectionProps {
    language: Language;
    settings: SiteSettings['services'];
}

const ServicesSection: React.FC<ServicesSectionProps> = ({ language, settings }) => {
    const { t } = useLocalization(language);
    
    if (!settings.enabled || settings.items.length === 0) {
        return null;
    }

    return (
        <section className="bg-white py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">{settings.title || t('ourServices')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {settings.items.map(service => (
                        <div key={service.id} className="text-center p-6">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                            <p className="text-gray-600">{service.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;