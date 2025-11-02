import React, { useState } from 'react';
import { Language, SiteSettings, FaqItem } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { PlusIcon, MinusIcon } from './Icons';

interface FaqSectionProps {
  language: Language;
  settings: SiteSettings['faq'];
}

const FaqItemComponent: React.FC<{ item: FaqItem }> = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-lg text-gray-800">{item.question}</span>
                {isOpen ? <MinusIcon className="w-6 h-6 text-primary" /> : <PlusIcon className="w-6 h-6 text-gray-500" />}
            </button>
            {isOpen && (
                <div className="pb-4 text-gray-600">
                    <p>{item.answer}</p>
                </div>
            )}
        </div>
    );
};

const FaqSection: React.FC<FaqSectionProps> = ({ language, settings }) => {
    const { t } = useLocalization(language);

    if (!settings.enabled || settings.items.length === 0) {
        return null;
    }

    return (
        <section className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">{settings.title || t('faqSection')}</h2>
                <div className="space-y-2">
                    {settings.items.map((item) => (
                        <FaqItemComponent key={item.id} item={item} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FaqSection;