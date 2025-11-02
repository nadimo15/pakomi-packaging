import React from 'react';
import { Language, SiteSettings } from '../types';
import { useLocalization } from '../hooks/useLocalization';
import { PencilRulerIcon, CheckCircle2Icon, TruckIcon } from './Icons';

interface HowItWorksSectionProps {
  language: Language;
  settings: SiteSettings['howItWorks'];
}

const iconMap: { [key: string]: React.FC<any> } = {
    select: PencilRulerIcon,
    order: CheckCircle2Icon,
    ship: TruckIcon,
};


const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ language, settings }) => {
    const { t } = useLocalization(language);

    if (!settings.enabled || settings.steps.length === 0) {
        return null;
    }

    return (
        <section className="bg-slate-50 py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">{settings.title || t('howItWorks')}</h2>
                    <p className="text-lg text-gray-600 mb-16">
                        From concept to delivery, our process is designed to be simple, transparent, and efficient.
                    </p>
                </div>

                <div className="relative">
                    {/* Dashed connector line for desktop */}
                    <div 
                        className="hidden md:block absolute top-12 left-0 w-full h-px" 
                        style={{
                            background: "repeating-linear-gradient(to right, transparent, transparent 5px, #cbd5e1 5px, #cbd5e1 15px)"
                        }}
                        aria-hidden="true"
                    />

                    <div className="relative grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                        {settings.steps.map((step, index) => {
                            const Icon = iconMap[step.icon] || PencilRulerIcon;
                            
                            // Remove number from title if it exists, e.g., "1. Title" -> "Title"
                            const stepTitle = step.title.replace(/^\d+\.\s*/, '');

                            return (
                                <div key={step.id} className="flex flex-col items-center text-center">
                                    {/* Icon and Number Badge */}
                                    <div className="relative mb-6 z-10">
                                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center ring-8 ring-slate-50">
                                            <Icon className="w-12 h-12 text-primary" />
                                        </div>
                                    </div>
                                    
                                    {/* Card Content */}
                                    <div className="relative -mt-12 pt-16 px-6 pb-8 bg-white rounded-xl shadow-lg w-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col">
                                        <span className="text-primary font-bold mb-2 block">Step {index + 1}</span>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">{stepTitle}</h3>
                                        <p className="text-gray-600 text-sm leading-relaxed flex-grow">{step.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HowItWorksSection;