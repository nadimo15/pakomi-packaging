import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization.ts';
import { useCart } from '../hooks/useCart.ts';
import type { Language, Product } from '../types.ts';
import { TrashIcon } from '../components/Icons.tsx';
import QuantityInput from '../components/QuantityInput.tsx';
import { getManagedProducts } from '../api.ts';

interface CartPageProps {
  language: Language;
  navigate: (path: string) => void;
}

const CartPage: React.FC<CartPageProps> = ({ language, navigate }) => {
    const { t } = useLocalization(language);
    const { cartItems, removeFromCart, updateCartItemQuantity } = useCart();
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        getManagedProducts()
            .then(setAllProducts)
            .catch(console.error)
            .finally(() => setIsLoading(false));
    }, []);
    
    const total = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
                <h1 className="text-3xl font-bold text-gray-800">{t('shoppingCart')}</h1>
                <p className="mt-4 text-lg text-gray-600">{t('emptyCart')}</p>
                <button 
                    onClick={() => navigate('/')} 
                    className="mt-6 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus transition-colors shadow-md"
                >
                    {t('continueShopping')}
                </button>
            </div>
        );
    }
    
    if (isLoading) {
        return <div className="text-center p-20">Loading cart...</div>;
    }

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('shoppingCart')}</h1>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md space-y-4 mb-32 lg:mb-0">
                        {cartItems.map(item => {
                            const product = allProducts.find(p => p.id === item.productType);
                            const imageUrl = item.logoUrl || product?.galleryImagesB64[0];
                            return (
                                <div key={item.cartItemId} className="flex flex-col sm:flex-row items-center gap-4 border-b pb-4 last:border-b-0 last:pb-0">
                                    <div className="w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center p-2">
                                        {imageUrl && <img src={imageUrl} alt={item.productName} className="max-w-full max-h-full object-contain" />}
                                    </div>
                                    <div className="flex-grow text-center sm:text-left">
                                        <h2 className="font-bold text-lg text-gray-800">{item.productName}</h2>
                                        <p className="text-sm text-gray-600">{item.width} x {item.height} {item.depth ? `x ${item.depth}` : ''} cm</p>
                                        <p className="text-sm text-gray-600 flex items-center justify-center sm:justify-start gap-2">
                                            {t('color')}: <span style={{backgroundColor: item.color}} className="w-4 h-4 rounded-full border"></span>
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 flex-wrap justify-center">
                                        <QuantityInput 
                                            quantity={item.quantity}
                                            setQuantity={(newQuantity: number) => updateCartItemQuantity(item.cartItemId, newQuantity)}
                                            language={language}
                                        />
                                        <div className="text-center w-24">
                                            <p className="font-semibold text-gray-800">
                                                {(item.unitPrice * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                            </p>
                                            <p className="text-xs text-gray-500">{t('pricePerItem')}: {item.unitPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                        </div>
                                        <button onClick={() => removeFromCart(item.cartItemId)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors" aria-label={t('removeLogo')}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                    <div className="lg:col-span-1">
                         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:sticky md:top-24 md:p-6 md:rounded-lg md:border-none md:shadow-md z-10">
                            <h2 className="text-xl font-bold border-b pb-3 mb-4 hidden md:block">{t('orderSummary')}</h2>
                            <div className="space-y-2">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>{t('totalPrice')}</span>
                                    <span>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                </div>
                            </div>
                            <button 
                                onClick={() => navigate('/checkout')}
                                className="mt-4 w-full bg-primary text-white font-bold text-lg py-3 rounded-lg hover:bg-primary-focus transition-colors shadow-md"
                            >
                                {t('proceedToCheckout')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
