
import type { Request, Response } from 'express';
// FIX: Corrected PrismaClient import path for ESM compatibility
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

export const addReview = async (req: Request, res: Response) => {
    const { orderId, rating, comment } = req.body;

    if (!orderId || !rating) {
        return res.status(400).json({ message: "Order ID and rating are required." });
    }

    try {
        const existingReview = await prisma.review.findUnique({ where: { orderId } });
        if (existingReview) {
            return res.status(409).json({ message: "A review for this order has already been submitted." });
        }

        const newReview = await prisma.review.create({
            data: {
                orderId,
                rating,
                comment,
            },
        });
        res.status(201).json(newReview);
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Failed to add review' });
    }
};

export const getReviewByOrderId = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    try {
        const review = await prisma.review.findUnique({
            where: { orderId },
        });
        res.status(200).json(review);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch review' });
    }
};
