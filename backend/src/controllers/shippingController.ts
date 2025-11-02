
import type { Request, Response } from 'express';
// FIX: Corrected PrismaClient import path for ESM compatibility
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// In a real app, you'd import the delivery companies config from a shared file.
const DELIVERY_COMPANIES = [
    {
        id: 'zr-express',
        name: 'ZR Express',
        api: {
            createShipmentUrl: 'https://api.zrexpress.com/create',
            trackShipmentUrl: 'https://api.zrexpress.com/track',
            apiKey: 'ZR-API-KEY-PLACEHOLDER'
        }
    },
    // ... other companies
];

const prisma = new PrismaClient();

export const createShipment = async (req: Request, res: Response) => {
    const { orderId, companyId } = req.body;
    try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        const company = DELIVERY_COMPANIES.find(c => c.id === companyId);

        if (!order || !company || !company.api) {
            return res.status(404).json({ message: 'Order or delivery company not found or does not support API integration.' });
        }

        // MOCK API CALL
        console.log(`Simulating createShipment call to ${company.api.createShipmentUrl} for order ${order.id}`);
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // In a real app, the fetch call would be here, and it would succeed because it's server-to-server.
        const trackingNumber = `SRV-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;

        res.status(200).json({ trackingNumber });

    } catch (error) {
        console.error("Failed to create shipment on backend:", error);
        res.status(500).json({ message: "Internal server error during shipment creation." });
    }
};

export const trackShipment = async (req: Request, res: Response) => {
    const { orderId } = req.params;
     try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order || !order.shippingInfo) {
            return res.status(404).json({ message: 'Order or shipping information not found.' });
        }
        
        const shippingInfo = order.shippingInfo as { carrier: string; trackingNumber: string };
        const company = DELIVERY_COMPANIES.find(c => c.name === shippingInfo.carrier);

        if (!company || !company.api) {
            return res.status(400).json({ message: 'This carrier does not support API tracking.' });
        }

        // MOCK API CALL
        console.log(`Simulating trackShipment call for order ${order.id}`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let newStatus = order.status;
        if (order.status === 'Shipped' && Math.random() > 0.7) {
            newStatus = 'Completed';
        }

        res.status(200).json({ status: newStatus, lastUpdate: new Date().toISOString() });

    } catch (error) {
        console.error("Failed to track shipment on backend:", error);
        res.status(500).json({ message: "Internal server error during shipment tracking." });
    }
};
