import React, { useState } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { Language } from '../types';
import { CheckCircleIcon } from './Icons';

interface SuccessModalProps {
    language: Language;
    orderId: string;
    onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ language, orderId, onClose }) => {
    const { t } = useLocalization(language);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(orderId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center transform transition-all scale-100 opacity-100"
                role="dialog"
                aria-modal="true"
                aria-labelledby="success-modal-title"
            >
                <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" aria-hidden="true" />
                <h2 id="success-modal-title" className="text-2xl font-bold text-gray-800">{t('orderSubmittedSuccess')}</h2>
                <p className="text-gray-600 mt-4">{t('yourTrackingIdIs')}</p>
                <div className="my-6 p-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-xl font-mono font-bold text-primary tracking-widest">{orderId}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                    <button
                        onClick={handleCopy}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-focus transition-colors"
                    >
                        {copied ? t('copied') : t('copyId')}
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-200 text-gray-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        {t('close')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;
