import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { addOrder, getFormConfig } from '../db';
import type { Language, Socials, Baladiya, Order } from '../types';
import { WILAYAS } from '../algeria-locations';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, ViberIcon, PlusIcon, TrashIcon } from '../components/Icons';
import SocialInput from '../components/SocialInput';
import { SOCIAL_PLATFORMS } from '../constants';

interface CheckoutPageProps {
  language: Language;
  navigate: (path: string) => void;
}

const CheckoutPage: React.FC<CheckoutPageProps> = ({ language, navigate }) => {
    const { t } = useLocalization(language);
    const { cartItems, clearCart } = useCart();
    const { currentUser } = useAuth();
    const [clientDetails, setClientDetails] = useState({
        clientName: '',
        phone: '',
        email: '',
        address: '',
        wilaya: '',
        commune: '',
        socials: { facebook: '', instagram: '', tiktok: '', whatsapp: '', viber: '', others: [] } as Socials,
    });
    const [availableCommunes, setAvailableCommunes] = useState<Baladiya[]>([]);
    const [formConfig] = useState(getFormConfig().yourDetails);
    const prevWilayaRef = useRef<string | undefined>(undefined);

    useEffect(() => {
        const firstItem = cartItems[0];
        
        const detailsFromCart = firstItem ? {
            clientName: firstItem.clientName || '',
            phone: firstItem.phone || '',
            email: firstItem.email || '',
            address: firstItem.address || '',
            wilaya: firstItem.wilaya || '',
            commune: firstItem.commune || '',
            socials: firstItem.socials || { facebook: '', instagram: '', tiktok: '', whatsapp: '', viber: '', others: [] },
        } : {
            clientName: '', phone: '', email: '', address: '', wilaya: '', commune: '', 
            socials: { facebook: '', instagram: '', tiktok: '', whatsapp: '', viber: '', others: [] }
        };

        if (currentUser) {
            detailsFromCart.clientName = detailsFromCart.clientName || currentUser.name;
            detailsFromCart.email = detailsFromCart.email || currentUser.email;
        }

        setClientDetails(detailsFromCart);
    }, [cartItems, currentUser]);

    useEffect(() => {
        const selectedWilaya = WILAYAS.find(w => w.name === clientDetails.wilaya);
        setAvailableCommunes(selectedWilaya ? selectedWilaya.baladiyas : []);
        
        if (prevWilayaRef.current !== clientDetails.wilaya && prevWilayaRef.current !== undefined) {
            setClientDetails(prev => ({...prev, commune: ''}));
        }
        prevWilayaRef.current = clientDetails.wilaya;
    }, [clientDetails.wilaya]);

    const handleDetailChange = (field: keyof typeof clientDetails, value: any) => {
        setClientDetails(prev => ({...prev, [field]: value}));
    };
    
    const handleSocialChange = (platform: keyof Omit<Socials, 'others'>, value: string) => {
        setClientDetails(prev => ({...prev, socials: {...prev.socials, [platform]: value }}));
    };
    
    const handleAddOtherSocial = () => {
        setClientDetails(prev => ({...prev, socials: {...prev.socials, others: [...prev.socials.others, { platform: 'website', url: '' }]}}));
    };

    const handleRemoveOtherSocial = (index: number) => {
        setClientDetails(prev => ({...prev, socials: {...prev.socials, others: prev.socials.others.filter((_, i) => i !== index)}}));
    };

    const handleOtherSocialChange = (index: number, field: 'platform' | 'url', value: string) => {
        setClientDetails(prev => {
          const newOthers = [...prev.socials.others];
          newOthers[index] = { ...newOthers[index], [field]: value };
          return { ...prev, socials: { ...prev.socials, others: newOthers } };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Prevent placing an order with an empty cart
        if (cartItems.length === 0) {
            alert("Your cart is empty. Please add items before placing an order.");
            navigate('/');
            return;
        }
        try {
            const orderClientDetails: Omit<Order, 'id'|'submittedAt'|'lineItems'|'totalPrice'|'totalWeight'|'status'|'userId'> = clientDetails;
            const newOrder = addOrder(orderClientDetails, cartItems, currentUser?.id);
            clearCart();
            navigate(`/thankyou?id=${newOrder.id}`);
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('There was an error placing your order. Please try again.');
        }
    };

    const total = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const getField = (id: string) => formConfig.fields.find(f => f.id === id);

    return (
        <div className="bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">{t('checkout')}</h1>
                <form id="checkout-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md mb-40 lg:mb-0">
                        {!currentUser && (
                            <div className="mb-6 p-4 bg-gray-100 rounded-md text-center border">
                                <p className="text-sm text-gray-700">
                                    {t('alreadyHaveAccount')}{' '}
                                    <a href="#/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }} className="font-medium text-primary hover:underline">
                                        {t('login')}
                                    </a>
                                </p>
                            </div>
                        )}
                        <h2 className="text-xl font-bold border-b pb-3 mb-4">{t('yourDetails')}</h2>
                        <div className="space-y-4">
                            {getField('clientName')?.enabled && <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">{t('clientName')}{getField('clientName')?.required && <span className="text-red-500">*</span>}</label>
                                <input type="text" value={clientDetails.clientName} onChange={e => handleDetailChange('clientName', e.target.value)} required={getField('clientName')?.required} className="w-full p-2 border rounded"/>
                            </div>}
                            {getField('emailAddress')?.enabled && <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">{t('emailAddress')}{getField('emailAddress')?.required && <span className="text-red-500">*</span>}</label>
                                <input type="email" value={clientDetails.email} onChange={e => handleDetailChange('email', e.target.value)} required={getField('emailAddress')?.required} className="w-full p-2 border rounded"/>
                            </div>}
                            {getField('phone')?.enabled && <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">{t('phone')}{getField('phone')?.required && <span className="text-red-500">*</span>}</label>
                                <input type="tel" value={clientDetails.phone} onChange={e => handleDetailChange('phone', e.target.value)} required={getField('phone')?.required} className="w-full p-2 border rounded"/>
                            </div>}
                             {getField('wilaya')?.enabled && <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">{t('wilaya')}{getField('wilaya')?.required && <span className="text-red-500">*</span>}</label>
                                <select value={clientDetails.wilaya} onChange={e => handleDetailChange('wilaya', e.target.value)} required={getField('wilaya')?.required} className="w-full p-2 border rounded bg-white">
                                    <option value="">{t('selectWilaya')}</option>
                                    {WILAYAS.map(w => <option key={w.id} value={w.name}>{w.id} - {w.name}</option>)}
                                </select>
                            </div>}
                            {getField('commune')?.enabled && <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">{t('commune')}{getField('commune')?.required && <span className="text-red-500">*</span>}</label>
                                <select value={clientDetails.commune} onChange={e => handleDetailChange('commune', e.target.value)} required={getField('commune')?.required} disabled={!clientDetails.wilaya} className="w-full p-2 border rounded bg-white disabled:bg-gray-100">
                                    <option value="">{t('selectCommune')}</option>
                                    {availableCommunes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>}
                            {getField('address')?.enabled && <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">{t('address')}{getField('address')?.required && <span className="text-red-500">*</span>}</label>
                                <input type="text" value={clientDetails.address} onChange={e => handleDetailChange('address', e.target.value)} required={getField('address')?.required} className="w-full p-2 border rounded"/>
                            </div>}
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {getField('whatsapp')?.enabled && <SocialInput icon={<WhatsAppIcon className="w-5 h-5 text-gray-400"/>} placeholder={t('whatsapp')} value={clientDetails.socials.whatsapp} onChange={e => handleSocialChange('whatsapp', e.target.value)} required={getField('whatsapp')?.required} />}
                                {getField('viber')?.enabled && <SocialInput icon={<ViberIcon className="w-5 h-5 text-gray-400"/>} placeholder={t('viber')} value={clientDetails.socials.viber} onChange={e => handleSocialChange('viber', e.target.value)} required={getField('viber')?.required} />}
                                {getField('facebook')?.enabled && <SocialInput icon={<FacebookIcon className="w-5 h-5 text-gray-400"/>} placeholder="facebook.com/..." value={clientDetails.socials.facebook} onChange={e => handleSocialChange('facebook', e.target.value)} required={getField('facebook')?.required} />}
                                {getField('instagram')?.enabled && <SocialInput icon={<InstagramIcon className="w-5 h-5 text-gray-400"/>} placeholder="instagram.com/..." value={clientDetails.socials.instagram} onChange={e => handleSocialChange('instagram', e.target.value)} required={getField('instagram')?.required} />}
                                {getField('tiktok')?.enabled && <SocialInput icon={<TikTokIcon className="w-5 h-5 text-gray-400"/>} placeholder="tiktok.com/@..." value={clientDetails.socials.tiktok} onChange={e => handleSocialChange('tiktok', e.target.value)} required={getField('tiktok')?.required} />}
                            </div>
                            
                            {getField('otherSocials')?.enabled && <div className="space-y-3">
                                {clientDetails.socials.others.map((social, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                         <select value={social.platform} onChange={(e) => handleOtherSocialChange(index, 'platform', e.target.value)} className="w-full p-2 border rounded bg-white"><option value="">{t('platform')}</option>{SOCIAL_PLATFORMS.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                                        <input type="url" placeholder={t('urlPlaceholder')} value={social.url} onChange={(e) => handleOtherSocialChange(index, 'url', e.target.value)} className="w-full p-2 border rounded" required={getField('otherSocials')?.required} />
                                        <button type="button" onClick={() => handleRemoveOtherSocial(index)} className="p-2 text-gray-500 hover:text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddOtherSocial} className="w-full flex items-center justify-center gap-2 p-2 border-2 border-dashed rounded text-sm font-semibold text-primary hover:border-primary"><PlusIcon className="w-5 h-5" />{t('addSocialLink')}</button>
                            </div>}
                        </div>
                    </div>
                    <div className="lg:col-span-1">
                         <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t shadow-[0_-2px_10px_rgba(0,0,0,0.1)] md:sticky md:top-24 md:p-6 md:rounded-lg md:border-none md:shadow-md z-10">
                            <h2 className="text-xl font-bold border-b pb-3 mb-4">{t('orderSummary')}</h2>
                            <div className="space-y-3 max-h-32 lg:max-h-64 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={item.cartItemId} className="flex justify-between items-start text-sm">
                                        <div>
                                            <p className="font-semibold">{item.productName} <span className="font-normal">x {item.quantity}</span></p>
                                            <p className="text-xs text-gray-500">{item.width}x{item.height}{item.depth ? `x${item.depth}` : ''}cm</p>
                                        </div>
                                        <p className="font-medium">{(item.unitPrice * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-3 border-t mt-3">
                                <span>{t('totalPrice')}</span>
                                <span>{total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                            </div>
                            <button 
                                type="submit"
                                form="checkout-form"
                                className="mt-6 w-full bg-primary text-white font-bold text-lg py-3 rounded-lg hover:bg-primary-focus transition-colors shadow-md"
                            >
                                {t('placeOrder')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CheckoutPage;