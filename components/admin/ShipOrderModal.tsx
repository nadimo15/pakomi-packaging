
import React, { useState, useMemo } from 'react';
import { useLocalization } from '../../hooks/useLocalization';
import type { Language, Order } from '../../types';
import { XCircleIcon } from '../Icons';
import { DELIVERY_COMPANIES } from '../../constants';
import { createShipment } from '../../api';

interface ShipOrderModalProps {
    language: Language;
    order: Order;
    onClose: () => void;
    onShip: (orderId: string, shippingInfo: { carrier: string; trackingNumber: string; }) => void;
}

const ShipOrderModal: React.FC<ShipOrderModalProps> = ({ language, order, onClose, onShip }) => {
    const { t } = useLocalization(language);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string>(DELIVERY_COMPANIES[0]?.id || '');
    const [manualTrackingNumber, setManualTrackingNumber] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const selectedCompany = useMemo(() => 
        DELIVERY_COMPANIES.find(c => c.id === selectedCompanyId),
        [selectedCompanyId]
    );
    
    const requiresManualTracking = !selectedCompany?.api;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCompany) return;

        setIsLoading(true);
        setError('');

        try {
            let trackingNumber: string;

            if (requiresManualTracking) {
                if (!manualTrackingNumber.trim()) {
                    setError('Tracking number is required for this carrier.');
                    setIsLoading(false);
                    return;
                }
                trackingNumber = manualTrackingNumber.trim();
            } else {
                // This is an API-integrated company
                const shipment = await createShipment(order, selectedCompany);
                trackingNumber = shipment.trackingNumber;
            }

            onShip(order.id, { carrier: selectedCompany.name, trackingNumber });

        } catch (err) {
            console.error("Failed to create shipment:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    
    const isCorsError = error.includes('CORS') || error.includes('Network Error');

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full transform transition-all" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="ship-modal-title"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 id="ship-modal-title" className="text-2xl font-bold text-gray-800">{t('shipOrder')}</h2>
                        <p className="text-primary font-semibold">{order.id}</p>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600" aria-label={t('close')}><XCircleIcon className="w-7 h-7" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div>
                        <label htmlFor="delivery-company" className="block text-sm font-medium text-gray-700 mb-1">{t('deliveryCompany')}</label>
                        <select
                            id="delivery-company"
                            value={selectedCompanyId}
                            onChange={(e) => setSelectedCompanyId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                        >
                            {DELIVERY_COMPANIES.map(company => (
                                <option key={company.id} value={company.id}>
                                    {company.name} {company.api ? '(API)' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {requiresManualTracking && (
                         <div className="animate-fade-in-form">
                            <label htmlFor="tracking-number" className="block text-sm font-medium text-gray-700 mb-1">{t('trackingNumber')}</label>
                            <input
                                id="tracking-number"
                                type="text"
                                value={manualTrackingNumber}
                                onChange={(e) => setManualTrackingNumber(e.target.value)}
                                placeholder="e.g., 123456789"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                                required
                            />
                        </div>
                    )}

                    {error && (
                        <div className="text-sm text-red-700 bg-red-50 p-4 rounded-lg border border-red-200">
                            <p className="font-bold mb-1">{t('failedToCreateShipment')}</p>
                            {isCorsError ? (
                                <>
                                    <p>{t('corsErrorExplanation')}</p>
                                    <p className="mt-2 text-xs text-red-800">{t('corsErrorTechnicalSolution')}</p>
                                </>
                            ) : (
                                <p>{error}</p>
                            )}
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button type="button" onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg hover:bg-gray-300">{t('cancel')}</button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus disabled:bg-gray-400 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? t('creatingShipment') : t('markAsShipped')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShipOrderModal;