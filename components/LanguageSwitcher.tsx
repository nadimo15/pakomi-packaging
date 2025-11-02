import React from 'react';
import type { Language } from '../types';
import { useLocalization } from '../hooks/useLocalization';

interface LanguageSwitcherProps {
  currentLanguage: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ currentLanguage, setLanguage }) => {
    const { t } = useLocalization(currentLanguage);

    const buttonClasses = (lang: Language) => 
        `px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            currentLanguage === lang
            ? 'bg-primary text-white'
            : 'text-gray-600 hover:bg-gray-200'
        }`;

    return (
        <div className="flex items-center space-x-2 rtl:space-x-reverse bg-gray-100 p-1 rounded-lg">
            <button onClick={() => setLanguage('en')} className={buttonClasses('en')}>
                {t('english')}
            </button>
            <button onClick={() => setLanguage('ar')} className={buttonClasses('ar')}>
                {t('arabic')}
            </button>
        </div>
    );
}

export default LanguageSwitcher;
