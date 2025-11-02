import React from 'react';
import { CheckIcon } from './Icons';
import { useLocalization } from '../hooks/useLocalization';
import { Language, ProductColor } from '../types';

interface ColorPickerProps {
    selectedColor: string;
    onColorChange: (color: string) => void;
    language: Language;
    colors: ProductColor[];
}

const ColorPicker: React.FC<ColorPickerProps> = ({ selectedColor, onColorChange, language, colors }) => {
    const { t } = useLocalization(language);

    return (
        <div className="flex flex-wrap gap-4">
            {colors.map((color) => {
                const isSelected = selectedColor === color.value;
                return (
                    <div key={color.value} className="flex flex-col items-center">
                        <button
                            type="button"
                            onClick={() => onColorChange(color.value)}
                            className={`w-14 h-14 rounded-full border-2 transition-all duration-200 transform hover:scale-110 flex items-center justify-center ${
                                isSelected ? 'border-primary ring-2 ring-primary ring-offset-2' : 'border-gray-200'
                            }`}
                            style={{ backgroundColor: color.value }}
                            aria-label={`${t('selectColor')} ${color.name}`}
                            aria-pressed={isSelected}
                        >
                            {isSelected && <CheckIcon className="w-6 h-6 text-white" style={{ filter: color.value === '#FFFFFF' ? 'invert(1)' : 'none' }} aria-hidden="true" />}
                        </button>
                        <span className={`mt-2 text-sm font-medium ${isSelected ? 'text-primary' : 'text-gray-500'}`}>{color.name}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default ColorPicker;
