import React from 'react';
import { useLocalization } from '../hooks/useLocalization.ts';
import SizeInput from './SizeInput.tsx';
import ColorPicker from './ColorPicker.tsx';
import SizeSelector from './SizeSelector.tsx';
import QuantityInput from './QuantityInput.tsx';
import LogoUploader from './LogoUploader.tsx';
import { usePriceCalculator } from '../hooks/usePriceCalculator.ts';
import { addToCart } from '../db.ts';
import type { Language, CustomizationDetails, ProductSize, FormConfig, FormSectionKey, FormField, ProductColor } from '../types.ts';

interface CustomizationFormProps {
  language: Language;
  details: CustomizationDetails;
  setDetails: React.Dispatch<React.SetStateAction<CustomizationDetails | null>>;
  allSizes: ProductSize[];
  formConfig: FormConfig;
  colorPickerRef: React.Ref<HTMLDivElement>;
  availableColors: ProductColor[];
  navigate: (path: string) => void;
}

const CustomizationForm: React.FC<CustomizationFormProps> = ({ language, details, setDetails, allSizes, formConfig, colorPickerRef, availableColors, navigate }) => {
  const { t } = useLocalization(language);
  const { pricePerItem, totalPrice, discountApplied, isCustomSize, itemWeight } = usePriceCalculator(details, allSizes);
  
  const handleDimensionChange = (dimension: 'width' | 'height' | 'depth', value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      setDetails((prev: CustomizationDetails | null) => prev ? ({ ...prev, [dimension]: numValue }) : null);
    } else if (value === '') {
      setDetails((prev: CustomizationDetails | null) => prev ? ({ ...prev, [dimension]: 0 }) : null);
    }
  };

  const handleSizeChange = (size: ProductSize) => {
    setDetails((prev: CustomizationDetails | null) => prev ? ({
      ...prev,
      width: size.width,
      height: size.height,
      depth: size.depth || 0,
    }) : null);
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setDetails((prev: CustomizationDetails | null) => prev ? ({ ...prev, quantity: newQuantity }) : null);
    }
  };
  
  const handleColorChange = (color: string) => {
    setDetails((prev: CustomizationDetails | null) => prev ? ({ ...prev, color }) : null);
  };

  const handleLogoUpload = (logoDataUrl: string) => {
    setDetails((prev: CustomizationDetails | null) => prev ? ({ ...prev, logoUrl: logoDataUrl }) : null);
  };

  const handleLogoRemove = () => {
    setDetails((prev: CustomizationDetails | null) => prev ? ({ ...prev, logoUrl: null }) : null);
  };
  
  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (isCustomSize) {
        alert("Custom sizes cannot be added to the cart directly. Please contact us for a quote.");
        return;
    }
    try {
        addToCart(details, pricePerItem || 0, itemWeight || 0);
        alert(t('itemAddedToCart'));
    } catch (error) {
        console.error('CustomizationForm.tsx: Error adding to cart:', error);
        alert('There was an error adding the item to your cart. Please try again.');
    }
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
     if (isCustomSize) {
        alert("Custom sizes cannot be ordered directly. Please contact us for a quote.");
        return;
    }
    try {
        addToCart(details, pricePerItem || 0, itemWeight || 0);
        navigate('/checkout');
    } catch (error) {
        console.error('CustomizationForm.tsx: Error during order now:', error);
        alert('There was an error processing your order. Please try again.');
    }
  };

  const getTooltipKey = (dimension: 'width' | 'height' | 'depth'): string => {
    const { productType } = details;
    const dimensionCapitalized = dimension.charAt(0).toUpperCase() + dimension.slice(1);
    if (productType.includes('ShoppingBag') && dimension === 'depth') return 'tooltipGussetShoppingBag';
    if (productType.toLowerCase().includes('box')) return `tooltip${dimensionCapitalized}Box`;
    if (productType.toLowerCase().includes('mailer')) return `tooltip${dimensionCapitalized}Mailer`;
    if (productType.toLowerCase().includes('bag')) return `tooltip${dimensionCapitalized}ShoppingBag`;
    if (productType.toLowerCase().includes('card')) return `tooltip${dimensionCapitalized}BusinessCard`;
    return '';
  }

  const productHasDepth = details.productType === 'cartonBox' || details.productType.includes('ShoppingBag');

  const renderField = (field: FormField) => {
    const requiredIndicator = field.required ? <span className="text-red-500" aria-hidden="true"> *</span> : null;
    switch (field.id) {
      case 'dimensions':
        return (
          <div>
            <h4 className="text-lg font-medium text-gray-700 mb-3">{t('dimensions')}</h4>
            <SizeSelector language={language} sizes={allSizes} selectedWidth={details.width} selectedHeight={details.height} onSizeSelect={handleSizeChange} />
            <div className="relative my-4 flex items-center">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">{t('customDimensions')}</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>
            <div className={`grid gap-4 ${productHasDepth ? 'grid-cols-3' : 'grid-cols-2'}`}>
              <SizeInput label={t('width')} value={details.width} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDimensionChange('width', e.target.value)} tooltipText={t(getTooltipKey('width'))} step={details.productType.includes('Card') ? 0.1 : 1} min={details.productType.includes('Card') ? 0.1 : 1} required={field.required} />
              <SizeInput label={t('height')} value={details.height} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDimensionChange('height', e.target.value)} tooltipText={t(getTooltipKey('height'))} step={details.productType.includes('Card') ? 0.1 : 1} min={details.productType.includes('Card') ? 0.1 : 1} required={field.required} />
              {productHasDepth && <SizeInput label={details.productType.includes('ShoppingBag') ? t('gusset') : t('depth')} value={details.depth} onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleDimensionChange('depth', e.target.value)} tooltipText={t(getTooltipKey('depth'))} min={1} required={field.required} />}
            </div>
          </div>
        );
      case 'color':
        return (
          <div ref={colorPickerRef} className="pt-2">
            <h4 className="text-lg font-medium text-gray-700 mb-4">{t('color')}</h4>
            <ColorPicker selectedColor={details.color} onColorChange={handleColorChange} language={language} colors={availableColors} />
          </div>
        );
      case 'quantity':
        return (
          <>
            <label htmlFor="quantity-input" className="font-semibold text-gray-700 text-lg">{t('quantity')}{requiredIndicator}</label>
            <QuantityInput id="quantity-input" quantity={details.quantity} setQuantity={handleQuantityChange} language={language} min={1} />
          </>
        );
      case 'priceDisplay':
        return (
          <div className="w-full mt-4 p-4 border-t border-slate-200">
            {isCustomSize ? (
              <p className="text-center font-semibold text-amber-700 bg-amber-100 p-3 rounded-md">{t('customSizeQuote')}</p>
            ) : pricePerItem !== null && totalPrice !== null ? (
              <div className="space-y-2 text-center">
                  {discountApplied && <p className="text-sm font-semibold text-green-600 animate-pulse">{t('bulkDiscount')}</p>}
                 <div className="flex justify-between items-baseline text-sm">
                   <span className="text-gray-600">{t('pricePerItem')}:</span>
                   <span className="font-medium text-gray-800">{pricePerItem.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                 </div>
                 <div className="flex justify-between items-baseline pt-2">
                   <span className="text-gray-700 font-bold text-lg">{t('totalPrice')}:</span>
                   <span className="font-bold text-3xl text-primary">{totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                 </div>
              </div>
            ) : null}
          </div>
        );
      default:
        return null;
    }
  };
  
  const formSections: Record<FormSectionKey, React.ReactNode> = {
    specifications: (
      <section aria-labelledby="specifications-heading">
          <h3 id="specifications-heading" className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">{t('specifications')}</h3>
          <div className="space-y-8">
            {formConfig.specifications.fields.map(field => field.enabled ? <div key={field.id}>{renderField(field)}</div> : null)}
            <LogoUploader 
              language={language}
              hasLogo={!!details.logoUrl}
              onLogoUpload={handleLogoUpload}
              onLogoRemove={handleLogoRemove}
            />
          </div>
      </section>
    ),
    quantityAndPrice: (
      <section aria-labelledby="quantity-heading">
          <h3 id="quantity-heading" className="text-xl font-semibold text-gray-800 border-b pb-3 mb-6">{t('quantityAndPrice')}</h3>
          <div className="bg-slate-50 rounded-lg p-6 flex flex-col items-center gap-4">
            {formConfig.quantityAndPrice.fields.map((field: FormField) => field.enabled ? <React.Fragment key={field.id}>{renderField(field)}</React.Fragment> : null)}
          </div>
      </section>
    ),
    yourDetails: (<></>), // This section is no longer rendered here
  };

  const sectionsToShow: FormSectionKey[] = ['specifications', 'quantityAndPrice'];

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleAddToCart} className="flex flex-col h-full">
        <div className="flex-1 space-y-12 overflow-y-auto pr-2 -mr-2 pb-32 md:pb-4">
            {sectionsToShow.map(sectionKey => (
                formConfig[sectionKey]?.enabled ? <div key={sectionKey}>{formSections[sectionKey]}</div> : null
            ))}
        </div>

        <div className="sticky bottom-0 left-0 right-0 mt-auto bg-white p-4 border-t shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:static md:bg-transparent md:p-0 md:pt-6 md:border-t md:shadow-none z-10">
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              type="submit" 
              className="w-full bg-primary/10 text-primary border-2 border-primary font-bold text-lg py-3 px-4 rounded-lg hover:bg-primary/20 focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 disabled:bg-gray-300 disabled:text-gray-500 disabled:border-gray-300 disabled:cursor-not-allowed"
              disabled={isCustomSize}
            >
              {t('addToCart')}
            </button>
            <button 
              type="button"
              onClick={handleOrderNow}
              className="w-full bg-primary text-white font-bold text-lg py-3 px-4 rounded-lg hover:bg-primary-focus focus:outline-none focus:ring-4 focus:ring-primary/50 transition-all duration-300 transform hover:scale-[1.01] disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
              disabled={isCustomSize}
            >
              {t('orderNow')}
            </button>
          </div>
          {isCustomSize && (
            <p className="text-center font-semibold text-amber-700 bg-amber-100 p-3 rounded-md mt-4">{t('customSizeQuote')}</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default CustomizationForm;
