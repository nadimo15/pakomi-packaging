import { useMemo } from 'react';
import { CustomizationDetails, ProductSize } from '../types.ts';

export const usePriceCalculator = (details: CustomizationDetails, availableSizes: ProductSize[]) => {
    const { productType, width, height, depth, quantity } = details;

    const priceInfo = useMemo(() => {
        const matchedSize = availableSizes.find(size => 
            size.width === width &&
            size.height === height &&
            (size.depth ?? 0) === (depth ?? 0)
        );

        if (!matchedSize) {
            return {
                pricePerItem: null,
                totalPrice: null,
                discountApplied: false,
                isCustomSize: true,
                itemWeight: null,
            };
        }
        
        const pricingTiers = matchedSize.pricing || [];
        const sortedTiers = [...pricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
        const applicableTier = sortedTiers.find(tier => quantity >= tier.minQuantity);
        
        if (!applicableTier) {
            const fallbackTier = sortedTiers[sortedTiers.length - 1];
            if (!fallbackTier) {
                 return { pricePerItem: null, totalPrice: null, discountApplied: false, isCustomSize: false, itemWeight: matchedSize.weight || 0 };
            }
            const pricePerItem = fallbackTier.price;
            const totalPrice = pricePerItem * quantity;
            return { pricePerItem, totalPrice, discountApplied: false, isCustomSize: false, itemWeight: matchedSize.weight || 0 };
        }
        
        const pricePerItem = applicableTier.price;
        const totalPrice = pricePerItem * quantity;
        const discountApplied = applicableTier !== sortedTiers[sortedTiers.length - 1];

        return {
            pricePerItem,
            totalPrice,
            discountApplied,
            isCustomSize: false,
            itemWeight: matchedSize.weight || 0,
        };

    }, [productType, width, height, depth, quantity, availableSizes]);

    return priceInfo;
};
