import type { Order, DeliveryCompany, OrderStatus } from './types';

// This is a mock API call to a third-party delivery service.
export const createShipment = async (order: Order, company: DeliveryCompany): Promise<{ trackingNumber: string }> => {
    if (!company.api) {
        throw new Error("This delivery company does not have API integration configured.");
    }
    
    // Simulate API request
    try {
        console.log(`Simulating createShipment call to ${company.api.createShipmentUrl}`);
        // In a real app, you would use fetch here.
        // This is commented out to prevent actual network requests in the demo.
        
        // Mocking success after a delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // This simulates a CORS error which is common in client-side API calls to third parties without a proxy.
        // We'll throw it to demonstrate the error handling in the component.
        throw new TypeError("Failed to fetch (simulated CORS error)");

    } catch (error) {
        // This catch block is crucial for frontend-only demos where direct 3rd-party API calls would fail due to CORS.
        if (error instanceof TypeError) { // CORS errors often manifest as TypeErrors
            console.warn("A mock tracking number is being used due to a simulated CORS error.");
            const mockTrackingNumber = `MOCK-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
            return { trackingNumber: mockTrackingNumber };
        }
        // Re-throw other errors
        throw error;
    }
};

// This is a mock API call to track a shipment.
export const trackShipment = async (order: Order, company: DeliveryCompany): Promise<{ status: OrderStatus, lastUpdate: string }> => {
    if (!company.api || !order.shippingInfo) {
        throw new Error("This order cannot be tracked via API.");
    }

    try {
        console.log(`Simulating trackShipment call to ${company.api.trackShipmentUrl}`);
        // In a real app, this would be a fetch call.
        
        // Mocking success
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simple mock logic: if it was shipped, maybe now it's completed
        const random = Math.random();
        let newStatus: OrderStatus = order.status;
        if (order.status === 'Shipped' && random > 0.7) {
            newStatus = 'Completed';
        }
        
        return { status: newStatus, lastUpdate: new Date().toISOString() };

    } catch (error) {
        // We don't simulate a CORS error here, to allow for successful status updates in the demo.
        console.error("Error in trackShipment:", error);
        // Re-throw the error to be handled by the component.
        throw error;
    }
};
