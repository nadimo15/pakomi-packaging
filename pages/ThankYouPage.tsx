import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { getOrders, getManagedProducts, getSiteSettings } from '../db';
import type { Language, Order, Product, SiteSettings } from '../types';
import { CheckCircleIcon } from '../components/Icons';

interface ThankYouPageProps {
  language: Language;
  navigate: (path: string) => void;
}

const ThankYouPage: React.FC<ThankYouPageProps> = ({ language, navigate }) => {
  const { t } = useLocalization(language);
  const [order, setOrder] = useState<Order | null>(null);
  const [copied, setCopied] = useState(false);
  const [upsellProducts, setUpsellProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    const siteSettings = getSiteSettings();
    setSettings(siteSettings);
    
    const hash = window.location.hash;
    const searchPart = hash.substring(hash.indexOf('?'));
    const params = new URLSearchParams(searchPart);
    const orderId = params.get('id');
    
    if (orderId) {
      const allOrders = getOrders();
      const foundOrder = allOrders.find(o => o.id === orderId) || null;
      setOrder(foundOrder);

      if (foundOrder && siteSettings.upsell.enabled) {
          const allProducts = getManagedProducts();
          const productTypesInOrder = new Set(foundOrder.lineItems.map(item => item.productType));
          
          let potentialUpsells = allProducts.filter(p => !productTypesInOrder.has(p.id));

          // If specific upsell products are configured, use them
          if (siteSettings.upsell.productIds && siteSettings.upsell.productIds.length > 0) {
              const upsellIdSet = new Set(siteSettings.upsell.productIds);
              // Filter from the already-filtered list to respect both conditions
              potentialUpsells = potentialUpsells.filter(p => upsellIdSet.has(p.id));
          }

          setUpsellProducts(potentialUpsells.slice(0, 3));
      }
    }
  }, []);

  const handleCopy = () => {
    if (order) {
      navigator.clipboard.writeText(order.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCustomizeClick = (product: Product) => {
    // This ideally would navigate to a specific product page, 
    // but for now, it navigates to the homepage to open the customization modal.
    navigate('/');
  };

  if (!order || !settings) {
    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <h1 className="text-2xl font-bold text-gray-800">Loading order details...</h1>
            <p className="text-gray-600 mt-2">If this page doesn't load, please verify your order ID or contact support.</p>
        </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in-up">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">{settings.thankYouPage.title}</h1>
            <p className="mt-4 text-gray-600">{settings.thankYouPage.message}</p>
            
            <div className="mt-6">
                <p className="text-gray-600">{t('yourTrackingIdIs')}</p>
                <div className="my-4 p-3 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-xl font-mono font-bold text-primary tracking-widest">{order.id}</p>
                </div>
                <button
                    onClick={handleCopy}
                    className="w-full sm:w-auto bg-primary text-white font-bold py-3 px-6 rounded-lg hover:bg-primary-focus transition-colors"
                >
                    {copied ? t('copied') : t('copyId')}
                </button>
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <a href={`#/track?id=${order.id}`} onClick={(e) => { e.preventDefault(); navigate(`/track?id=${order.id}`); }} className="font-semibold text-primary hover:underline">{t('trackOrder')}</a>
                <a href={`#/feedback?id=${order.id}`} onClick={(e) => { e.preventDefault(); navigate(`/feedback?id=${order.id}`); }} className="font-semibold text-primary hover:underline">{t('leaveAReview')}</a>
            </div>
        </div>

        {upsellProducts.length > 0 && (
            <div className="max-w-4xl mx-auto mt-16 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">{settings.upsell.title}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {upsellProducts.map(product => (
                        <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden text-center transition-transform transform hover:scale-105">
                            <div className="w-full h-48 flex items-center justify-center p-4 bg-gray-100">
                                <img src={product.galleryImagesB64[0]} alt={product.name} className="max-h-full max-w-full object-contain" />
                            </div>
                            <div className="p-6">
                                <h3 className="font-bold text-lg text-gray-800">{product.name}</h3>
                                <button 
                                    onClick={() => handleCustomizeClick(product)}
                                    className="mt-4 px-6 py-2 bg-primary text-white font-bold rounded-full hover:bg-primary-focus transition-colors text-sm"
                                >
                                    {t('customize')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default ThankYouPage;