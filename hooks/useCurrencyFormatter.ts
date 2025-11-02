import { useState, useEffect, useCallback } from 'react';
import { getSiteSettings } from '../db';

export const useCurrencyFormatter = () => {
    const [currency, setCurrency] = useState('USD');
    // A simple locale mapping for better currency display
    const [locale, setLocale] = useState('en-US');

    const updateSettings = useCallback(() => {
        const settings = getSiteSettings();
        const currentCurrency = settings.currency || 'USD';
        setCurrency(currentCurrency);

        // Basic locale mapping based on currency
        switch(currentCurrency) {
            case 'DZD':
                setLocale('fr-DZ'); // Arabic numerals but often uses French formatting
                break;
            case 'EUR':
                setLocale('fr-FR'); // Common Euro format
                break;
            default:
                setLocale('en-US');
        }
    }, []);

    useEffect(() => {
        updateSettings();
        window.addEventListener('storage', updateSettings);
        return () => window.removeEventListener('storage', updateSettings);
    }, [updateSettings]);

    const formatCurrency = useCallback((value: number | null | undefined) => {
        if (value === null || value === undefined) {
            return '';
        }
        try {
            return value.toLocaleString(locale, {
                style: 'currency',
                currency: currency,
            });
        } catch (e) {
            console.warn(`Could not format currency for ${currency}. Defaulting to USD.`);
            return value.toLocaleString('en-US', {
                style: 'currency',
                currency: 'USD',
            });
        }
    }, [currency, locale]);

    return { formatCurrency, currency };
};
