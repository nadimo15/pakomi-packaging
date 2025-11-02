import React from 'react';
import { PlusIcon, MinusIcon } from './Icons';
import { useLocalization } from '../hooks/useLocalization';
import { Language } from '../types';

interface QuantityInputProps {
  id?: string;
  quantity: number;
  setQuantity: (quantity: number) => void;
  language: Language;
  min?: number;
  step?: number;
}

const QuantityInput: React.FC<QuantityInputProps> = ({ id, quantity, setQuantity, language, min = 1, step = 50 }) => {
    const { t } = useLocalization(language);
    
    const handleIncrement = () => {
        setQuantity(quantity + step);
    };

    const handleDecrement = () => {
        setQuantity(Math.max(min, quantity - step));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= min) {
            setQuantity(value);
        } else if (e.target.value === '') {
            setQuantity(min);
        }
    };

    return (
        <div className="flex items-center">
            <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= min}
                className="p-3 rounded-s-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label={t('decrementQuantity')}
            >
                <MinusIcon className="w-5 h-5" />
            </button>
            <input
                type="number"
                id={id}
                value={quantity}
                onChange={handleChange}
                min={min}
                className="w-24 text-center text-lg font-semibold border-t border-b border-gray-300 h-[50px] focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none [-moz-appearance:textfield]"
            />
            <button
                type="button"
                onClick={handleIncrement}
                className="p-3 rounded-e-lg border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label={t('incrementQuantity')}
            >
                <PlusIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

export default QuantityInput;
