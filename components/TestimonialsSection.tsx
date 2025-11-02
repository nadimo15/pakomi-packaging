import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Language, SiteSettings } from '../types';

interface TestimonialsSectionProps {
    language: Language;
    settings: SiteSettings['testimonials'];
}

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ language, settings }) => {
    const { t } = useLocalization(language);
    
    if (!settings.enabled || settings.items.length === 0) {
        return null;
    }
    
    return (
        <section className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">{settings.title || t('whatOurClientsSay')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {settings.items.map((testimonial, index) => (
                        <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                            <p className="text-gray-600 mb-6">"{testimonial.quote}"</p>
                            <div className="flex items-center">
                                <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4 object-cover bg-gray-200" />
                                <div>
                                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;