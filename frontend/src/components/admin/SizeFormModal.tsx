import React, { useState, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import type { Language, ProductSize, ProductType, PriceTier } from '../../types.ts';
import { PlusIcon, TrashIcon, XCircleIcon } from '../Icons.tsx';

interface SizeFormModalProps {
    language: Language;
    isOpen: boolean;
    onClose: () => void;
    onSave: (productType: ProductType, size: ProductSize) => void;
    productType: ProductType;
    productName: string;
    initialSize: ProductSize | null;
}

const SizeFormModal: React.FC<SizeFormModalProps> = ({ language, isOpen, onClose, onSave, productType, productName, initialSize }) => {
    const { t } = useLocalization(language);
    const [size, setSize] = useState<Omit<ProductSize, 'id'>>({ width: 0, height: 0, depth: 0, weight: 0, pricing: [{ minQuantity: 50, price: 0 }] });
    
    useEffect(() => {
        if (initialSize) {
            setSize(initialSize);
        } else {
            setSize({ width: 0, height: 0, depth: 0, weight: 0, pricing: [{ minQuantity: 50, price: 0 }] });
        }
    }, [initialSize, isOpen]);

    if (!isOpen) return null;

    const handleDimensionChange = (field: 'width' | 'height' | 'depth' | 'weight', value: string) => {
        setSize(prev => ({ ...prev, [field]: Number(value) || 0 }));
    };

    const handleTierChange = (index: number, field: 'minQuantity' | 'price', value: string) => {
        const newPricing = [...size.pricing];
        newPricing[index] = { ...newPricing[index], [field]: Number(value) || 0 };
        setSize(prev => ({ ...prev, pricing: newPricing }));
    };
    
    const addTier = () => {
        setSize(prev => ({ ...prev, pricing: [...prev.pricing, { minQuantity: 0, price: 0 }] }));
    };

    const removeTier = (index: number) => {
        if (size.pricing.length > 1) {
            setSize(prev => ({ ...prev, pricing: prev.pricing.filter((_, i) => i !== index) }));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(productType, { ...size, id: initialSize?.id || '' });
    };

    const hasDepth = productType.toLowerCase().includes('box') || productType.toLowerCase().includes('bag');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full transform transition-all" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="size-form-modal-title"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 id="size-form-modal-title" className="text-2xl font-bold text-gray-800">{initialSize ? t('editSize') : t('addNewSize')}</h2>
                        <p className="text-primary font-semibold">{productName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label={t('close')}><XCircleIcon className="w-7 h-7" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('dimensions')} & {t('weightGrams')}</h3>
                        <div className={`grid gap-4 grid-cols-2 ${hasDepth ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
                            <input type="number" placeholder={t('width')} value={size.width || ''} onChange={e => handleDimensionChange('width', e.target.value)} className="w-full p-2 border rounded" required />
                            <input type="number" placeholder={t('height')} value={size.height || ''} onChange={e => handleDimensionChange('height', e.target.value)} className="w-full p-2 border rounded" required />
                            {hasDepth && <input type="number" placeholder={t('depth')} value={size.depth || ''} onChange={e => handleDimensionChange('depth', e.target.value)} className="w-full p-2 border rounded" />}
                            <input type="number" placeholder={t('weightGrams')} value={size.weight || ''} onChange={e => handleDimensionChange('weight', e.target.value)} className="w-full p-2 border rounded" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3">{t('pricingTiers')}</h3>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {size.pricing.map((tier, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="number" placeholder={t('minQuantity')} value={tier.minQuantity || ''} onChange={e => handleTierChange(index, 'minQuantity', e.target.value)} className="w-full p-2 border rounded" required />
                                <input type="number" step="0.01" placeholder={t('price')} value={tier.price || ''} onChange={e => handleTierChange(index, 'price', e.target.value)} className="w-full p-2 border rounded" required />
                                <button type="button" onClick={() => removeTier(index)} disabled={size.pricing.length <= 1} className="p-2 text-gray-500 hover:text-red-600 disabled:opacity-50" aria-label={t('removeSocialLink')}><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        ))}
                        </div>
                        <button type="button" onClick={addTier} className="mt-3 flex items-center gap-2 text-sm font-semibold text-primary"><PlusIcon className="w-5 h-5"/>{t('addTier')}</button>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                        <button type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus">{t('saveChanges')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SizeFormModal;
