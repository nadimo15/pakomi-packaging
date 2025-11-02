
import React, { useState, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { Language, Product, ProductType, ProductSize, PriceTier } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, DragHandleIcon } from '../Icons';
import SizeFormModal from './SizeFormModal';
import { ProductFormModal } from './ProductFormModal';

// FIX: Renamed props interface to match component name
interface ProductEditorProps {
    language: Language;
    managedProducts: Product[];
    productSizes: Record<ProductType, ProductSize[]>;
    onProductsUpdate: (products: Product[]) => void;
    onSizesUpdate: (sizes: Record<ProductType, ProductSize[]>) => void;
}

const formatPriceRange = (pricing: PriceTier[]): string => {
    if (!pricing || pricing.length === 0) {
        return 'No pricing set';
    }
    const prices = pricing.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const formatCurrency = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    if (minPrice === maxPrice) {
        return formatCurrency(minPrice);
    }

    return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
};

// FIX: Renamed component to ProductEditor to match the default import in AdminPage.tsx
const ProductEditor: React.FC<ProductEditorProps> = ({ language, managedProducts, productSizes, onProductsUpdate, onSizesUpdate }) => {
    const { t } = useLocalization(language);
    const [isSizeModalOpen, setIsSizeModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    
    const [editingSize, setEditingSize] = useState<{productType: ProductType, size: ProductSize | null} | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(managedProducts[0] || null);

    // Drag and Drop state
    const dragItemIndex = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [draggingItem, setDraggingItem] = useState<Product | null>(null);

    const handleOpenSizeModal = (productType: ProductType, size: ProductSize | null = null) => {
        setEditingSize({ productType, size });
        setIsSizeModalOpen(true);
    };

    const handleOpenProductModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleSaveProduct = (productToSave: Product) => {
        let updatedProducts;
        if (editingProduct) { // Editing
            updatedProducts = managedProducts.map(p => p.id === productToSave.id ? productToSave : p);
        } else { // Adding
            const newProduct = { ...productToSave, id: productToSave.name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now() };
            updatedProducts = [...managedProducts, newProduct];
            const newSizes = { ...productSizes, [newProduct.id]: [] };
            onSizesUpdate(newSizes);
        }
        onProductsUpdate(updatedProducts);
        setIsProductModalOpen(false);
        setEditingProduct(null);
    };

    const handleDeleteProduct = (productId: ProductType) => {
        if (window.confirm(t('confirmDeleteProduct'))) {
            const updatedProducts = managedProducts.filter(p => p.id !== productId);
            onProductsUpdate(updatedProducts);
            
            const updatedSizes = { ...productSizes };
            delete updatedSizes[productId];
            onSizesUpdate(updatedSizes);

            if (selectedProduct?.id === productId) {
                setSelectedProduct(updatedProducts[0] || null);
            }
        }
    };

    const handleSaveSize = (productType: ProductType, sizeToSave: ProductSize) => {
        const updatedSizes = { ...productSizes };
        const sizes = updatedSizes[productType] || [];
        
        if (editingSize?.size) { // Editing existing size
            const index = sizes.findIndex(s => s.id === editingSize.size?.id);
            if (index > -1) sizes[index] = sizeToSave;
        } else { // Adding new size
            sizes.push({ ...sizeToSave, id: `${productType}-${new Date().getTime()}` });
        }
        
        updatedSizes[productType] = sizes;
        onSizesUpdate(updatedSizes);
        setIsSizeModalOpen(false);
        setEditingSize(null);
    };

    const handleDeleteSize = (productType: ProductType, sizeId: string) => {
        if (window.confirm(t('confirmDelete'))) {
            const updatedSizes = { ...productSizes };
            updatedSizes[productType] = (updatedSizes[productType] || []).filter(s => s.id !== sizeId);
            onSizesUpdate(updatedSizes);
        }
    };

    const handleDrop = () => {
        if (dragItemIndex.current === null || dragOverIndex === null || dragItemIndex.current === dragOverIndex) {
            return;
        }
        const items = [...managedProducts];
        const [reorderedItem] = items.splice(dragItemIndex.current, 1);
        items.splice(dragOverIndex, 0, reorderedItem);
        onProductsUpdate(items);
    };

    const handleDragEnd = () => {
        dragItemIndex.current = null;
        setDragOverIndex(null);
        setDraggingItem(null);
    };
    
    return (
        <div className="flex flex-col md:flex-row gap-8">
            {isProductModalOpen && (
                <ProductFormModal
                    language={language}
                    isOpen={isProductModalOpen}
                    onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }}
                    onSave={handleSaveProduct}
                    initialProduct={editingProduct}
                />
            )}
            {isSizeModalOpen && editingSize && selectedProduct && (
                <SizeFormModal
                    language={language}
                    isOpen={isSizeModalOpen}
                    onClose={() => { setIsSizeModalOpen(false); setEditingSize(null); }}
                    onSave={handleSaveSize}
                    productType={editingSize.productType}
                    productName={selectedProduct.name}
                    initialSize={editingSize.size}
                />
            )}

            {/* Product List */}
            <div className="md:w-1/3 lg:w-1/4">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{t('products')}</h3>
                    <button onClick={() => handleOpenProductModal(null)} className="flex items-center gap-1 px-3 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-focus shadow-sm transition-colors">
                        <PlusIcon className="w-4 h-4" />
                        {t('addNewProduct')}
                    </button>
                </div>
                <div className="space-y-2 bg-white p-2 rounded-lg shadow-md">
                    {managedProducts.map((product, index) => (
                        <div 
                            key={product.id}
                            className="relative group"
                            draggable
                            onDragStart={() => { dragItemIndex.current = index; setDraggingItem(product); }}
                            onDragEnter={() => setDragOverIndex(index)}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                        >
                             {dragOverIndex === index && draggingItem && draggingItem.id !== product.id && (
                                <div className="absolute -top-1 left-0 right-0 h-1.5 bg-primary rounded-full" aria-hidden="true" />
                            )}
                            <div 
                                onClick={() => setSelectedProduct(product)} 
                                className={`w-full p-2 rounded-md cursor-pointer border-2 transition-all duration-200 flex items-center justify-between ${selectedProduct?.id === product.id ? 'bg-primary/10 border-primary' : 'bg-transparent border-transparent hover:bg-gray-100'} ${draggingItem?.id === product.id ? 'opacity-50 shadow-lg' : ''}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="text-gray-400 cursor-move" title={t('dragToReorder')}>
                                        <DragHandleIcon className="w-5 h-5" />
                                    </div>
                                    <img src={product.galleryImagesB64[0]} alt={product.name} className="w-10 h-10 object-contain rounded-md bg-gray-200 flex-shrink-0"/>
                                    <span className="font-semibold text-sm text-gray-800">{product.name}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={(e) => { e.stopPropagation(); handleOpenProductModal(product); }} className="p-1.5 text-gray-500 hover:text-primary rounded-full hover:bg-gray-200" aria-label={t('editProduct')}><PencilIcon className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteProduct(product.id); }} className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-200" aria-label={t('confirmDelete')}><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {dragOverIndex === managedProducts.length && (
                        <div className="relative h-1.5">
                            <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-primary rounded-full" aria-hidden="true" />
                        </div>
                    )}
                </div>
            </div>

            {/* Size Editor for Selected Product */}
            <div className="md:w-2/3 lg:w-3/4">
                {selectedProduct ? (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b">
                            <h3 className="text-xl font-bold text-gray-800">{selectedProduct.name} - {t('sizes')}</h3>
                            <button onClick={() => handleOpenSizeModal(selectedProduct.id)} className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-focus shadow-sm transition-colors">
                                <PlusIcon className="w-5 h-5" />
                                {t('addNewSize')}
                            </button>
                        </div>
                        <div className="space-y-3">
                            {(productSizes[selectedProduct.id] || []).map(size => (
                                <div key={size.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-md hover:bg-slate-100 transition-colors group">
                                    <div>
                                        <p className="font-semibold text-gray-800">{size.width} x {size.height} {size.depth ? `x ${size.depth}` : ''} cm</p>
                                        <p className="text-xs text-gray-600 font-medium">{formatPriceRange(size.pricing)}</p>
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleOpenSizeModal(selectedProduct.id, size)} className="p-2 text-gray-500 hover:text-primary hover:bg-white rounded-full" aria-label={t('editSize')}>
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => handleDeleteSize(selectedProduct.id, size.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-white rounded-full" aria-label={t('deleteSize')}>
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                             {(productSizes[selectedProduct.id] || []).length === 0 && (
                                <p className="text-center text-gray-500 py-4">{t('No sizes configured for this product.')}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full bg-white rounded-lg shadow-md">
                        <p className="text-gray-500">{t('selectYourProduct')} {t('to manage its sizes')}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductEditor;
