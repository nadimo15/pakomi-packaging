import { useMemo } from 'react';
import { CustomizationDetails, ProductType, ProductSize } from '../types';

export const usePriceCalculator = (details: CustomizationDetails, allSizes: Record<ProductType, ProductSize[]>) => {
    const { productType, width, height, depth, quantity } = details;

    const priceInfo = useMemo(() => {
        const availableSizes = allSizes[productType] || [];
        
        const matchedSize = availableSizes.find(size => 
            size.width === width &&
            size.height === height &&
            (size.depth ?? 0) === depth
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
            // Should not happen if pricing is set up correctly with a base tier
            return { pricePerItem: null, totalPrice: null, discountApplied: false, isCustomSize: false, itemWeight: null };
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

    }, [productType, width, height, depth, quantity, allSizes]);

    return priceInfo;
};
