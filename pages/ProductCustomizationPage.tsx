import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import CustomizationForm from '../components/CustomizationForm';
import LivePreview from '../components/LivePreview';
import type { Language, CustomizationDetails, ProductType, ProductSize, Product, FormConfig } from '../types';
import { getProductSizes, getManagedProducts, getFormConfig } from '../db';

interface ProductCustomizationPageProps {
  language: Language;
  productType: ProductType;
  navigate: (path: string) => void;
}

const ProductCustomizationPage: React.FC<ProductCustomizationPageProps> = ({ language, productType, navigate }) => {
  const { t } = useLocalization(language);
  const [allSizes] = useState(getProductSizes());
  const [allManagedProducts] = useState<Product[]>(getManagedProducts());
  const [formConfig] = useState<FormConfig>(getFormConfig());
  
  const [details, setDetails] = useState<CustomizationDetails | null>(null);

  useEffect(() => {
    const productInfo = allManagedProducts.find(p => p.id === productType);
    if (!productInfo) {
        // Handle product not found, maybe navigate to a 404 page or home
        navigate('/');
        return;
    }

    const productSpecificSizes = allSizes[productType] || [];
    const firstSize = productSpecificSizes[0];

    setDetails({
        productType: productInfo.id,
        productName: productInfo.name,
        width: firstSize?.width ?? 10,
        height: firstSize?.height ?? 10,
        depth: firstSize?.depth ?? 0,
        quantity: 50,
        logoUrl: null, // Logo functionality removed
        logoProps: { x: 50, y: 50, scale: 1, rotation: 0 },
        color: productInfo.availableColors?.[0]?.value || '#FFFFFF',
        description: '',
        clientName: '',
        phone: '',
        email: '',
        address: '',
        wilaya: '',
        commune: '',
        socials: {
          facebook: '',
          instagram: '',
          tiktok: '',
          whatsapp: '',
          viber: '',
          others: [],
        },
    });
  }, [productType, allManagedProducts, allSizes, navigate]);

  const colorPickerRef = useRef<HTMLDivElement>(null);

  const highlightColorPicker = () => {
    const el = colorPickerRef.current;
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.add('ring-2', 'ring-primary', 'ring-offset-2', 'rounded-lg', 'transition-all');
    setTimeout(() => {
        el.classList.remove('ring-2', 'ring-primary', 'ring-offset-2', 'rounded-lg');
    }, 1500);
  };

  if (!details) {
      return <div className="text-center p-12">Loading product...</div>;
  }

  const selectedProduct = allManagedProducts.find(p => p.id === details.productType);
  const availableColors = selectedProduct?.availableColors || [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 py-8">
          {/* Preview Panel */}
          <div className="lg:sticky lg:top-24 self-start">
            <LivePreview 
              language={language} 
              details={details}
              allProducts={allManagedProducts}
              onColorClick={highlightColorPicker}
            />
          </div>

          {/* Form Panel */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{details.productName}</h1>
            <p className="text-gray-500 mb-8">{t('customizeYourPackaging')}</p>
            <CustomizationForm 
              language={language} 
              details={details} 
              setDetails={setDetails}
              allSizes={allSizes}
              formConfig={formConfig}
              colorPickerRef={colorPickerRef}
              availableColors={availableColors}
              navigate={navigate}
            />
          </div>
        </div>
    </div>
  );
};

export default ProductCustomizationPage;