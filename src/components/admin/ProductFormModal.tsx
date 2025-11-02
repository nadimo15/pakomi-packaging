import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import type { Language, Product, ProductColor } from '../../types.ts';
import { XCircleIcon, UploadIcon, TrashIcon, PlusIcon, StarIcon } from '../Icons.tsx';

interface ProductFormModalProps {
    language: Language;
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    initialProduct: Product | null;
}

const fileToB64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const ProductFormModal: React.FC<ProductFormModalProps> = ({ language, isOpen, onSave, onClose, initialProduct }) => {
    const { t } = useLocalization(language);
    const [product, setProduct] = useState<Product>({ id: '', name: '', galleryImagesB64: [], availableColors: [] });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (initialProduct) {
            setProduct({
                ...initialProduct,
                availableColors: initialProduct.availableColors || [],
                galleryImagesB64: initialProduct.galleryImagesB64 || [],
            });
        } else {
            setProduct({ id: '', name: '', galleryImagesB64: [], availableColors: [{ name: 'White', value: '#FFFFFF' }] });
        }
    }, [initialProduct, isOpen]);

    if (!isOpen) return null;

    const handleImageUpload = async (files: FileList | null) => {
        if (files) {
            const b64Promises = Array.from(files).map(fileToB64);
            const newImages = await Promise.all(b64Promises);
            setProduct(prev => ({ ...prev, galleryImagesB64: [...prev.galleryImagesB64, ...newImages] }));
        }
    };
    
    const handleRemoveImage = (indexToRemove: number) => {
        setProduct(prev => ({ ...prev, galleryImagesB64: prev.galleryImagesB64.filter((_, index) => index !== indexToRemove) }));
    };

    const handleSetAsCover = (indexToMove: number) => {
        if (indexToMove === 0) return;
        setProduct(prev => {
            const newGallery = [...prev.galleryImagesB64];
            const [item] = newGallery.splice(indexToMove, 1);
            newGallery.unshift(item);
            return { ...prev, galleryImagesB64: newGallery };
        });
    };
    
    const handleColorChange = (index: number, field: 'name' | 'value', value: string) => {
        setProduct(prev => {
            const newColors = [...(prev.availableColors || [])];
            newColors[index] = { ...newColors[index], [field]: value };
            return { ...prev, availableColors: newColors };
        });
    };

    const handleAddColor = () => {
        setProduct(prev => ({
            ...prev,
            availableColors: [...(prev.availableColors || []), { name: 'New Color', value: '#000000' }]
        }));
    };
    
    const handleRemoveColor = (index: number) => {
        setProduct(prev => ({
            ...prev,
            availableColors: (prev.availableColors || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!product.name || product.galleryImagesB64.length === 0) {
            alert('Product name and at least one image are required.');
            return;
        }
        onSave(product);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full transform transition-all max-h-[90vh] flex flex-col" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-form-modal-title"
            >
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 id="product-form-modal-title" className="text-2xl font-bold text-gray-800">
                        {initialProduct ? t('editProduct') : t('addNewProduct')}
                    </h2>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label={t('close')}><XCircleIcon className="w-7 h-7" /></button>
                </div>
                
                <form onSubmit={handleSubmit} id="product-form" className="space-y-6 overflow-y-auto flex-1 pr-2">
                    <div>
                        <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 mb-1">{t('productName')}</label>
                        <input 
                            id="product-name"
                            type="text" 
                            placeholder={t('productName')}
                            value={product.name}
                            onChange={e => setProduct(p => ({ ...p, name: e.target.value }))}
                            className="w-full p-2 border rounded-md"
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('productImage')}</label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={(e) => handleImageUpload(e.target.files)}
                            className="hidden"
                            accept="image/png, image/jpeg, image/svg+xml"
                            multiple
                        />
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 p-3 border rounded-lg bg-gray-50">
                            {product.galleryImagesB64.map((image, index) => (
                                <div key={index} className="relative group aspect-square">
                                    <img src={image} alt={`Product view ${index + 1}`} className="w-full h-full object-contain rounded-md bg-white border"/>
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                                        <button type="button" onClick={() => handleSetAsCover(index)} disabled={index === 0} className="p-1.5 bg-white/80 rounded-full text-gray-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed" title="Set as cover">
                                            <StarIcon className={`w-4 h-4 ${index === 0 ? 'text-yellow-500' : ''}`} />
                                        </button>
                                        <button type="button" onClick={() => handleRemoveImage(index)} className="p-1.5 bg-white/80 rounded-full text-red-500 hover:bg-white" title="Delete image">
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {index === 0 && <div className="absolute top-1 right-1 px-1.5 py-0.5 text-xs font-bold text-white bg-primary rounded-full">Cover</div>}
                                </div>
                            ))}
                             <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square flex flex-col items-center justify-center p-2 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary hover:bg-gray-100 transition-colors"
                            >
                                <UploadIcon className="w-6 h-6 text-gray-400" />
                                <span className="text-xs text-gray-500 mt-1">{t('add')}</span>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('availableColors')}</label>
                        <div className="space-y-3">
                            {(product.availableColors || []).map((color, index) => (
                                <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                                    <input type="color" value={color.value} onChange={(e) => handleColorChange(index, 'value', e.target.value)} className="w-10 h-10 p-1 border-none rounded-md" aria-label={t('colorValue')} />
                                    <input type="text" placeholder={t('colorName')} value={color.name} onChange={(e) => handleColorChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md" />
                                    <button type="button" onClick={() => handleRemoveColor(index)} className="p-2 text-gray-400 hover:text-red-500" aria-label={t('removeLogo')}><TrashIcon className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                         <button type="button" onClick={handleAddColor} className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-focus"><PlusIcon className="w-5 h-5"/>{t('addColor')}</button>
                    </div>

                </form>

                <div className="flex justify-end gap-3 pt-6 border-t flex-shrink-0">
                    <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                    <button form="product-form" onClick={handleSubmit} type="submit" className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus">{t('saveChanges')}</button>
                </div>
            </div>
        </div>
    );
};
