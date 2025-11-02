

import type { Request, Response } from 'express';
// FIX: Corrected PrismaClient and Prisma import path for ESM compatibility
import { PrismaClient, Prisma } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

const generateOrderId = () => `PKM-${randomBytes(3).toString('hex').toUpperCase()}`;

export const createOrder = async (req: Request, res: Response) => {
    const { clientDetails, cartItems, userId } = req.body;

    if (!clientDetails || !cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).json({ message: 'Invalid order data' });
    }

    try {
        const totalWeight = cartItems.reduce((sum: number, item: any) => sum + (item.itemWeight * item.quantity), 0);
        const totalPrice = cartItems.reduce((sum: number, item: any) => sum + (item.unitPrice * item.quantity), 0);
        
        const newOrder = await prisma.order.create({
            data: {
                id: generateOrderId(),
                clientName: clientDetails.clientName,
                phone: clientDetails.phone,
                email: clientDetails.email,
                address: clientDetails.address,
                wilaya: clientDetails.wilaya,
                commune: clientDetails.commune,
                socials: clientDetails.socials as Prisma.JsonObject,
                totalPrice,
                totalWeight,
                userId: userId,
                lineItems: {
                    create: cartItems.map((item: any) => ({
                        productType: item.productType,
                        productName: item.productName,
                        width: item.width,
                        height: item.height,
                        depth: item.depth,
                        quantity: item.quantity,
                        logoUrl: item.logoUrl,
                        logoProps: item.logoProps as Prisma.JsonObject,
                        color: item.color,
                        description: item.description,
                        unitPrice: item.unitPrice,
                        itemWeight: item.itemWeight,
                    })),
                },
            },
            include: {
                lineItems: true,
            },
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Failed to create order' });
    }
};

export const getOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const order = await prisma.order.findUnique({
            where: { id },
            include: { lineItems: true },
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error(`Error fetching order ${id}:`, error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: updates,
        });
        res.status(200).json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update order' });
    }
};

export const updateBulkOrders = async (req: Request, res: Response) => {
    const { orderIds, updates } = req.body as { orderIds: string[], updates: { status: string } };
    try {
        await prisma.order.updateMany({
            where: { id: { in: orderIds } },
            data: {
                status: updates.status,
            },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to bulk update orders' });
    }
};

export const getChat = async (req: Request, res: Response) => {
    const { id: orderId } = req.params;
    try {
        const messages = await prisma.chatMessage.findMany({
            where: { orderId },
            orderBy: { timestamp: 'asc' },
        });
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch chat messages' });
    }
};

export const postChatMessage = async (req: Request, res: Response) => {
    const { id: orderId } = req.params;
    const { text, sender } = req.body;
    const file = req.file;

    // In a real app, you would upload the file to a storage service (like S3)
    // and get a URL. Here, we'll just simulate it by storing a path.
    const fileUrl = file ? `/uploads/mock/${orderId}-${Date.now()}-${file.originalname}` : undefined;

    try {
        const message = await prisma.chatMessage.create({
            data: {
                orderId,
                text,
                sender,
                fileUrl,
                fileName: file?.originalname,
                fileType: file?.mimetype,
            },
        });
        // In a real app, you would use WebSockets to push this message to connected clients.
        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Failed to send message' });
    }
};
