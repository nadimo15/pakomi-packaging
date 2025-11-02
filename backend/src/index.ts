
import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';

import * as authController from './controllers/authController.js';
import * as dataController from './controllers/dataController.js';
import * as orderController from './controllers/orderController.js';
import * as reviewController from './controllers/reviewController.js';
import * as shippingController from './controllers/shippingController.js';
import { authMiddleware } from './middleware/auth.js';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// --- Routes ---
// FIX: Explicitly type req and res to resolve type inference issues.
app.get('/api', (req: express.Request, res: express.Response) => {
    res.send('Pakomi Backend is running!');
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


// --- Server ---
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
