import React from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { Language, Product } from '../types';

interface ProductSelectorProps {
  language: Language;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

const ProductSelector: React.FC<ProductSelectorProps> = ({ language, products, onSelectProduct }) => {
    const { t } = useLocalization(language);

    return (
        <div className="mb-8">
            <h2 id="product-selector-label" className="text-xl font-semibold text-gray-800 text-center mb-6">{t('selectYourProduct')}</h2>
            <div role="group" aria-labelledby="product-selector-label" className="flex justify-center flex-wrap gap-8">
                {products.map((product) => {
                    return (
                        <button
                            key={product.id}
                            type="button"
                            onClick={() => onSelectProduct(product)}
                            className="flex flex-col items-center justify-between p-6 w-52 h-52 rounded-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary bg-white border-gray-200 hover:border-primary hover:shadow-lg hover:scale-105"
                        >
                            <div className="w-32 h-32 flex items-center justify-center">
                                <img src={product.galleryImagesB64[0]} alt={product.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <span className="font-semibold text-base text-center text-gray-700 mt-2">{product.name}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};

export default ProductSelector;