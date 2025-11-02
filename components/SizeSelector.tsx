import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { Language, ProductSize } from '../types';

interface SizeSelectorProps {
  language: Language;
  sizes: ProductSize[];
  selectedWidth: number;
  selectedHeight: number;
  onSizeSelect: (size: ProductSize) => void;
}

const SizeSelector: React.FC<SizeSelectorProps> = ({ language, sizes, selectedWidth, selectedHeight, onSizeSelect }) => {
  const { t } = useLocalization(language);

  return (
    <div>
      <p id="size-selector-label" className="text-sm text-gray-600 mb-3">{t('selectSize')}</p>
      <div role="radiogroup" aria-labelledby="size-selector-label" className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {sizes.map((size) => {
          const isSelected = selectedWidth === size.width && selectedHeight === size.height;
          const dimensionString = size.depth 
            ? `${size.width} x ${size.height} x ${size.depth} cm` 
            : `${size.width} x ${size.height} cm`;

          return (
            <button
              key={`${size.width}x${size.height}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSizeSelect(size)}
              className={`text-center p-3 border-2 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                isSelected
                  ? 'bg-primary/10 border-primary shadow-md'
                  : 'bg-white border-gray-200 hover:border-primary/50'
              }`}
            >
              <span className={`block font-semibold text-sm ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                {dimensionString}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SizeSelector;
