

import type { Request, Response } from 'express';
// FIX: Corrected PrismaClient and Prisma import path for ESM compatibility
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// --- PUBLIC DATA ---
export const getPublicData = async (req: Request, res: Response) => {
    try {
        const [settings, products, sizes] = await Promise.all([
            prisma.siteSettings.findUnique({ where: { id: 'singleton' } }),
            prisma.product.findMany({ orderBy: { displayOrder: 'asc' } }),
            prisma.productSize.findMany(),
        ]);

        const sizesByProduct = sizes.reduce((acc, size) => {
            if (!acc[size.productId]) {
                acc[size.productId] = [];
            }
            acc[size.productId].push(size);
            return acc;
        }, {} as Record<string, any[]>);

        res.status(200).json({
            settings: settings?.data,
            products,
            sizes: sizesByProduct,
        });
    } catch (error) {
        console.error("Error fetching public data:", error);
        res.status(500).json({ message: "Failed to fetch public data" });
    }
};

// --- ADMIN DATA ---
export const getAdminDashboardData = async (req: Request, res: Response) => {
    try {
        const [orders, tasks, formConfig, users, roles] = await Promise.all([
            prisma.order.findMany({ include: { lineItems: true }, orderBy: { submittedAt: 'desc' } }),
            prisma.task.findMany({ orderBy: { createdAt: 'desc' } }),
            prisma.formConfig.findUnique({ where: { id: 'singleton' } }),
            prisma.user.findMany(),
            prisma.role.findMany(),
        ]);
        res.status(200).json({ orders, tasks, formConfig: formConfig?.data, users, roles });
    } catch (error) {
         console.error("Error fetching admin data:", error);
        res.status(500).json({ message: "Failed to fetch admin data" });
    }
};

export const updateSiteSettings = async (req: Request, res: Response) => {
    try {
        await prisma.siteSettings.update({
            where: { id: 'singleton' },
            data: { data: req.body as Prisma.JsonObject },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to update site settings' });
    }
};

export const updateManagedProducts = async (req: Request, res: Response) => {
    const products = req.body as any[];
    try {
        await prisma.$transaction(
            products.map((p, index) => 
                prisma.product.upsert({
                    where: { id: p.id },
                    update: { name: p.name, galleryImagesB64: p.galleryImagesB64, availableColors: p.availableColors, displayOrder: index },
                    create: { id: p.id, name: p.name, galleryImagesB64: p.galleryImagesB64, availableColors: p.availableColors, displayOrder: index },
                })
            )
        );
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to update products' });
    }
};

export const updateProductSizes = async (req: Request, res: Response) => {
    const sizesByProduct = req.body as Record<string, any[]>;
     try {
        await prisma.$transaction(async (tx) => {
            for (const productId of Object.keys(sizesByProduct)) {
                await tx.productSize.deleteMany({ where: { productId } });
                if (sizesByProduct[productId].length > 0) {
                    await tx.productSize.createMany({
                        data: sizesByProduct[productId].map(s => ({
                            productId: productId,
                            width: s.width,
                            height: s.height,
                            depth: s.depth,
                            weight: s.weight,
                            pricing: s.pricing as Prisma.JsonObject
                        }))
                    });
                }
            }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to update product sizes' });
    }
};

export const updateTasks = async (req: Request, res: Response) => {
    const tasks = req.body as any[];
    try {
        await prisma.$transaction(async (tx) => {
            await tx.task.deleteMany({});
            if (tasks.length > 0) {
                await tx.task.createMany({ data: tasks.map(t => ({ text: t.text, priority: t.priority, isCompleted: t.isCompleted, createdAt: t.createdAt })) });
            }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to update tasks' });
    }
};

export const updateFormConfig = async (req: Request, res: Response) => {
     try {
        await prisma.formConfig.update({
            where: { id: 'singleton' },
            data: { data: req.body as Prisma.JsonObject },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to update form config' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { roleId } = req.body;
    try {
        await prisma.user.update({
            where: { id },
            data: { roleId },
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to update user' });
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({ where: { id }});
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete user' });
    }
};

export const updateRole = async (req: Request, res: Response) => {
    const { id, name, permissions } = req.body as {id?: string, name: string, permissions: string[]};
    try {
        const role = await prisma.role.upsert({
            where: { id: id || '' },
            update: { name, permissions },
            create: { name, permissions },
        });
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update role' });
    }
};

export const deleteRole = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        // Reassign users to 'Customer' role before deleting
        const customerRole = await prisma.role.findFirst({where: { name: 'Customer' }});
        if (!customerRole) throw new Error("Customer role not found");
        await prisma.user.updateMany({
            where: { roleId: id },
            data: { roleId: customerRole.id },
        });

        await prisma.role.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete role' });
    }
};
