
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import bcrypt from 'bcryptjs';

import * as authController from './controllers/authController.js';
import * as dataController from './controllers/dataController.js';
import * as orderController from './controllers/orderController.js';
import * as reviewController from './controllers/reviewController.js';
import * as shippingController from './controllers/shippingController.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// --- CORS Configuration ---
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const allowedOrigins = [
    FRONTEND_URL,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:8088',
    'http://127.0.0.1:8088'
];
const corsOptions: cors.CorsOptions = {
    origin(origin, callback) {
        if (!origin) return callback(null, true); // allow same-origin or curl
        if (allowedOrigins.some((o) => origin.startsWith(o))) return callback(null, true);
        return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization']
};

// --- Middleware ---
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// --- Routes ---
// FIX: Explicitly type req and res to resolve type inference issues.
app.get('/api', (req: express.Request, res: express.Response) => {
    res.send('Pakomi Backend is running!');
});

// Lightweight health endpoint (no DB access)
app.get('/health', (_req: express.Request, res: express.Response) => {
    res.status(200).send('OK');
});

// --- Public Routes ---
app.get('/api/data/public', dataController.getPublicData);
app.post('/api/orders', orderController.createOrder);
app.get('/api/orders/:id', orderController.getOrder);
app.get('/api/orders/:id/chat', orderController.getChat);
// FIX: Explicitly type req and res to ensure correct middleware handling.
app.post('/api/orders/:id/chat', upload.single('file'), orderController.postChatMessage);
app.post('/api/reviews', reviewController.addReview);
app.get('/api/reviews/:orderId', reviewController.getReviewByOrderId);
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// --- Authenticated Routes ---
app.use('/api/admin', authMiddleware); // All routes below this are protected

// Admin Data Management
app.get('/api/admin/data', dataController.getAdminDashboardData);
app.put('/api/admin/data/settings', dataController.updateSiteSettings);
app.put('/api/admin/data/products', dataController.updateManagedProducts);
app.put('/api/admin/data/sizes', dataController.updateProductSizes);
app.put('/api/admin/data/tasks', dataController.updateTasks);
app.put('/api/admin/data/form-config', dataController.updateFormConfig);

// Admin User/Role Management
app.put('/api/admin/users/:id', dataController.updateUser);
app.delete('/api/admin/users/:id', dataController.deleteUser);
app.put('/api/admin/roles', dataController.updateRole);
app.delete('/api/admin/roles/:id', dataController.deleteRole);

// Admin Order Management
app.put('/api/admin/orders/:id', orderController.updateOrder);
app.put('/api/admin/orders/bulk-update', orderController.updateBulkOrders);

// Admin Shipping (proxied external API calls)
app.post('/api/admin/shipping/create', shippingController.createShipment);
app.get('/api/admin/shipping/track/:orderId', shippingController.trackShipment);


const prisma = new PrismaClient();
async function seed() {
    const adminRole = await prisma.role.upsert({
        where: { name: 'Admin' },
        update: { permissions: ['admin'] as any },
        create: { name: 'Admin', permissions: ['admin'] as any },
    });
    await prisma.role.upsert({
        where: { name: 'Customer' },
        update: { permissions: [] as any },
        create: { name: 'Customer', permissions: [] as any },
    });
    const email = 'admin@pakomi.com';
    const passwordHash = await bcrypt.hash('123456789', 10);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
        await prisma.user.create({
            data: { name: 'Admin', email, passwordHash, roleId: adminRole.id },
        });
    }
}

seed()
  .catch(() => {})
  .finally(() => {
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  });
