import React, { useState, useEffect, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { Language, Order, OrderLineItem, Product, Socials, Baladiya, CustomizationDetails } from '../../types';
import { XCircleIcon, TrashIcon, PlusIcon, ChevronDownIcon, ChevronUpIcon } from '../Icons';
import { getManagedProducts, getProductSizes } from '../../db';
import { WILAYAS } from '../../algeria-locations';
import { usePriceCalculator } from '../../hooks/usePriceCalculator';
import QuantityInput from '../QuantityInput';
import SizeInput from '../SizeInput';
import ColorPicker from '../ColorPicker';
import LogoUploader from '../LogoUploader';
import SocialInput from '../SocialInput';
import { FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, ViberIcon } from '../Icons';
import { SOCIAL_PLATFORMS } from '../../constants';


interface OrderEditModalProps {
    language: Language;
    order: Order;
    onClose: () => void;
    onSave: (updatedOrder: Order) => void;
}

const allProducts = getManagedProducts();
const allSizes = getProductSizes();

const OrderEditModal: React.FC<OrderEditModalProps> = ({ language, order, onClose, onSave }) => {
    const { t } = useLocalization(language);
    const [editedOrder, setEditedOrder] = useState<Order>(() => JSON.parse(JSON.stringify(order)));
    const [availableCommunes, setAvailableCommunes] = useState<Baladiya[]>([]);
    const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
    const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

    useEffect(() => {
        const selectedWilaya = WILAYAS.find(w => w.name === editedOrder.wilaya);
        setAvailableCommunes(selectedWilaya ? selectedWilaya.baladiyas : []);
    }, [editedOrder.wilaya]);

    const handleClientDetailChange = (field: keyof Omit<Order, 'lineItems'>, value: any) => {
        setEditedOrder(prev => ({...prev, [field]: value}));
    };

    const handleSocialChange = (platform: keyof Omit<Socials, 'others'>, value: string) => {
        setEditedOrder(prev => ({...prev, socials: {...prev.socials, [platform]: value }}));
    };

    const handleLineItemChange = (index: number, updates: Partial<OrderLineItem>) => {
        setEditedOrder(prev => {
            const newItems = [...prev.lineItems];
            newItems[index] = { ...newItems[index], ...updates };
            return { ...prev, lineItems: newItems };
        });
    };

    const handleRemoveItem = (index: number) => {
        if (window.confirm(t('confirmRemoveItem'))) {
            setEditedOrder(prev => ({ ...prev, lineItems: prev.lineItems.filter((_, i) => i !== index) }));
        }
    };

    const handleAddItem = (product: Product) => {
        const firstSize = allSizes[product.id]?.[0];
        const newItem: OrderLineItem = {
            productType: product.id,
            productName: product.name,
            width: firstSize?.width ?? 10,
            height: firstSize?.height ?? 10,
            depth: firstSize?.depth ?? 0,
            color: product.availableColors[0]?.value || '#FFFFFF',
            description: '',
            logoUrl: null,
            logoProps: { x: 50, y: 50, scale: 1, rotation: 0 },
            quantity: 50,
            unitPrice: 0, // Will be recalculated
            itemWeight: 0, // Will be recalculated
        };
        setEditedOrder(prev => ({ ...prev, lineItems: [...prev.lineItems, newItem] }));
        setExpandedItems(prev => new Set(prev).add(editedOrder.lineItems.length));
        setIsAddProductModalOpen(false);
    };

    const handleSubmit = () => {
        if (editedOrder.lineItems.length === 0) {
            alert(t('cannotSaveEmptyOrder'));
            return;
        }
        onSave(editedOrder);
    };
    
    // Recalculate totals whenever items change
    useEffect(() => {
        const newTotalWeight = editedOrder.lineItems.reduce((sum, item) => sum + (item.itemWeight * item.quantity), 0);
        const newTotalPrice = editedOrder.lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
        setEditedOrder(prev => ({
            ...prev,
            totalWeight: newTotalWeight,
            totalPrice: newTotalPrice,
        }));
    }, [editedOrder.lineItems]);
    
    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col" role="dialog" aria-modal="true">
            <header className="flex-shrink-0 flex items-center justify-between p-4 border-b bg-gray-50 sticky top-0">
                <h2 className="text-xl font-bold text-gray-800">{t('editOrder')} <span className="font-mono text-primary">{order.id}</span></h2>
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                    <button onClick={handleSubmit} className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus">{t('saveOrder')}</button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-6 space-y-8">
                {/* Client Details */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('contactInformation')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder={t('clientName')} value={editedOrder.clientName} onChange={e => handleClientDetailChange('clientName', e.target.value)} className="w-full p-2 border rounded" />
                        <input type="text" placeholder={t('phone')} value={editedOrder.phone} onChange={e => handleClientDetailChange('phone', e.target.value)} className="w-full p-2 border rounded" />
                        <input type="email" placeholder={t('emailAddress')} value={editedOrder.email} onChange={e => handleClientDetailChange('email', e.target.value)} className="w-full p-2 border rounded" />
                        <input type="text" placeholder={t('address')} value={editedOrder.address} onChange={e => handleClientDetailChange('address', e.target.value)} className="w-full p-2 border rounded" />
                        <select value={editedOrder.wilaya} onChange={e => handleClientDetailChange('wilaya', e.target.value)} className="w-full p-2 border rounded bg-white"><option value="">{t('selectWilaya')}</option>{WILAYAS.map(w => <option key={w.id} value={w.name}>{w.id} - {w.name}</option>)}</select>
                        <select value={editedOrder.commune} onChange={e => handleClientDetailChange('commune', e.target.value)} disabled={!editedOrder.wilaya} className="w-full p-2 border rounded bg-white disabled:bg-gray-100"><option value="">{t('selectCommune')}</option>{availableCommunes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}</select>
                    </div>
                </section>
                
                {/* Line Items */}
                <section>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">{t('products')}</h3>
                    <div className="space-y-4">
                        {editedOrder.lineItems.map((item, index) => (
                            <EditableLineItem 
                                key={index} 
                                item={item} 
                                index={index}
                                language={language}
                                onUpdate={handleLineItemChange}
                                onRemove={handleRemoveItem}
                                isExpanded={expandedItems.has(index)}
                                onToggleExpand={() => setExpandedItems(prev => {
                                    const newSet = new Set(prev);
                                    if (newSet.has(index)) newSet.delete(index);
                                    else newSet.add(index);
                                    return newSet;
                                })}
                            />
                        ))}
                    </div>
                    <button onClick={() => setIsAddProductModalOpen(true)} className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary font-semibold rounded-lg hover:bg-primary/20"><PlusIcon />{t('addProduct')}</button>
                </section>
            </main>

            {/* Footer Summary */}
            <footer className="flex-shrink-0 flex items-center justify-end p-4 border-t bg-gray-50 space-x-6">
                <div className="text-sm"><strong>{t('totalWeight')}:</strong> {(editedOrder.totalWeight / 1000).toFixed(2)} kg</div>
                <div className="font-bold text-lg">
                    <span>{t('totalPrice')}: </span>
                    <span className="text-primary">{editedOrder.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </div>
            </footer>
            
            {isAddProductModalOpen && (
                <AddProductModal 
                    language={language} 
                    onClose={() => setIsAddProductModalOpen(false)} 
                    onSelect={handleAddItem} 
                />
            )}
        </div>
    );
};


const EditableLineItem: React.FC<{
    item: OrderLineItem; 
    index: number; 
    language: Language; 
    onUpdate: (index: number, updates: Partial<OrderLineItem>) => void;
    onRemove: (index: number) => void;
    isExpanded: boolean;
    onToggleExpand: () => void;
}> = ({ item, index, language, onUpdate, onRemove, isExpanded, onToggleExpand }) => {
    const { t } = useLocalization(language);
    const productInfo = allProducts.find(p => p.id === item.productType);
    
    // Create a details object compatible with the price calculator
    const calcDetails = useMemo<CustomizationDetails>(() => ({
        ...item,
        clientName: '', phone: '', address: '', wilaya: '', commune: '', email: '', socials: { facebook: '', instagram: '', tiktok: '', whatsapp: '', viber: '', others: [] }
    }), [item]);

    const { pricePerItem, itemWeight } = usePriceCalculator(calcDetails, allSizes);

    // Update unitPrice and itemWeight when calculator values change
    useEffect(() => {
        const updates: Partial<OrderLineItem> = {};
        if (pricePerItem !== null && pricePerItem !== item.unitPrice) {
            updates.unitPrice = pricePerItem;
        }
        if (itemWeight !== null && itemWeight !== item.itemWeight) {
            updates.itemWeight = itemWeight;
        }
        if (Object.keys(updates).length > 0) {
            onUpdate(index, updates);
        }
    }, [pricePerItem, itemWeight, item.unitPrice, item.itemWeight, onUpdate, index]);

    if (!productInfo) return <div>Error: Product not found</div>;

    const totalPrice = (item.unitPrice || 0) * item.quantity;

    return (
        <div className="border rounded-lg bg-white shadow-sm">
            <header className="flex items-center p-3 cursor-pointer hover:bg-gray-50" onClick={onToggleExpand}>
                <div className="flex-grow font-semibold">{item.productName} <span className="font-normal text-gray-600">x{item.quantity}</span></div>
                <div className="font-semibold text-primary">{totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</div>
                <button className="p-1 ml-2 text-gray-500 hover:text-primary"><ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} /></button>
            </header>
            {isExpanded && (
                <div className="p-4 border-t space-y-6 animate-fade-in-up">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <QuantityInput language={language} quantity={item.quantity} setQuantity={q => onUpdate(index, { quantity: q })} />
                            <div className="grid grid-cols-3 gap-2">
                                <SizeInput label={t('width')} value={item.width} onChange={e => onUpdate(index, { width: parseFloat(e.target.value) || 0 })} />
                                <SizeInput label={t('height')} value={item.height} onChange={e => onUpdate(index, { height: parseFloat(e.target.value) || 0 })} />
                                {(productInfo.id.includes('Box') || productInfo.id.includes('Bag')) &&
                                 <SizeInput label={t('depth')} value={item.depth} onChange={e => onUpdate(index, { depth: parseFloat(e.target.value) || 0 })} />}
                            </div>
                        </div>
                        <LogoUploader language={language} hasLogo={!!item.logoUrl} onLogoUpload={b64 => onUpdate(index, {logoUrl: b64})} onLogoRemove={() => onUpdate(index, {logoUrl: null})}/>
                    </div>
                    <ColorPicker language={language} selectedColor={item.color} onColorChange={c => onUpdate(index, {color: c})} colors={productInfo.availableColors} />
                    <div className="flex justify-end pt-4 border-t">
                        <button onClick={() => onRemove(index)} className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-600 text-sm font-semibold rounded-md hover:bg-red-100"><TrashIcon />{t('removeItem')}</button>
                    </div>
                </div>
            )}
        </div>
    )
};

const AddProductModal: React.FC<{language: Language, onClose: () => void, onSelect: (product: Product) => void}> = ({language, onClose, onSelect}) => {
    const { t } = useLocalization(language);
    return (
         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-2xl w-full" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-center mb-6">{t('selectYourProduct')}</h3>
                <div className="flex justify-center flex-wrap gap-4 max-h-[60vh] overflow-y-auto">
                    {allProducts.map(product => (
                        <button key={product.id} onClick={() => onSelect(product)} className="flex flex-col items-center p-4 w-40 h-40 rounded-lg border hover:border-primary hover:shadow-lg">
                             <div className="w-24 h-24 flex items-center justify-center">
                                <img src={product.galleryImagesB64[0]} alt={product.name} className="max-w-full max-h-full object-contain" />
                            </div>
                            <span className="font-semibold text-sm text-center mt-2">{product.name}</span>
                        </button>
                    ))}
                </div>
            </div>
         </div>
    );
}

export default OrderEditModal;