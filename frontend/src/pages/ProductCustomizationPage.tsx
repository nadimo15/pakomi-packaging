import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization.ts';
import CustomizationForm from '../components/CustomizationForm.tsx';
import LivePreview from '../components/LivePreview.tsx';
import type { Language, CustomizationDetails, Product, FormConfig, ProductSize, ProductColor } from '../types.ts';
import { getProductSizes, getManagedProducts, getFormConfig } from '../api.ts';

interface ProductCustomizationPageProps {
  language: Language;
  productType: string; // This is now productId e.g. 'carton-box'
  navigate: (path: string) => void;
}

const ProductCustomizationPage: React.FC<ProductCustomizationPageProps> = ({ language, productType, navigate }) => {
  const { t } = useLocalization(language);
  const [details, setDetails] = useState<CustomizationDetails | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [allSizes, setAllSizes] = useState<Record<string, ProductSize[]>>({});
  const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsData, sizesData, formConfigData] = await Promise.all([
          getManagedProducts(),
          getProductSizes(),
          getFormConfig(),
        ]);

        setAllProducts(productsData);
        setAllSizes(sizesData);
        setFormConfig(formConfigData);

        const productInfo = productsData.find(p => p.id === productType);
        if (!productInfo) {
            navigate('/');
            return;
        }

        const productSpecificSizes = sizesData[productInfo.id] || [];
        const firstSize = productSpecificSizes[0];

        setDetails({
            productType: productInfo.id,
            productName: productInfo.name,
            width: firstSize?.width ?? 10,
            height: firstSize?.height ?? 10,
            depth: firstSize?.depth ?? 0,
            quantity: 50,
            logoUrl: null,
            logoProps: { x: 50, y: 50, scale: 1, rotation: 0 },
            color: productInfo.availableColors?.[0]?.value || '#FFFFFF',
            description: '',
            clientName: '', phone: '', email: '', address: '', wilaya: '', commune: '',
            socials: { facebook: '', instagram: '', tiktok: '', whatsapp: '', viber: '', others: [] },
        });

      } catch (error) {
        console.error("Failed to load customization data:", error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [productType, navigate]);

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

  if (isLoading || !details || !formConfig) {
      return <div className="text-center p-12">Loading product...</div>;
  }

  const selectedProduct = allProducts.find(p => p.id === details.productType);
  const availableColors = (selectedProduct?.availableColors as ProductColor[]) || [];
  const productSizesForForm = (selectedProduct && allSizes[selectedProduct.id]) ? allSizes[selectedProduct.id] as ProductSize[] : [];

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 py-8">
          <div className="lg:sticky lg:top-24 self-start">
            <LivePreview 
              language={language} 
              details={details}
              allProducts={allProducts}
              onColorClick={highlightColorPicker}
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{details.productName}</h1>
            <p className="text-gray-500 mb-8">{t('customizeYourPackaging')}</p>
            <CustomizationForm 
              language={language} 
              details={details} 
              setDetails={setDetails}
              allSizes={productSizesForForm}
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
