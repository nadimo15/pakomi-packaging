// Resolve backend URL dynamically:
// 1) Use build-time Vite env if set (VITE_BACKEND_URL)
// 2) Else derive from current origin (protocol + hostname) with port 3001
// 3) Fallback to localhost:3001
// Use same-origin /api; Nginx will proxy to the backend service
const API_BASE_URL = `/api`;

import type { 
    SiteSettings, Product, ProductType, ProductSize, Order, Task, FormConfig, User, Role,
    CartItem, Review, OrderStatus, ChatMessage
} from './types.ts';


// --- HELPER FUNCTIONS ---
const getToken = () => localStorage.getItem('pakomi_token');

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getToken();
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `HTTP Error: ${response.statusText}` }));
            throw new Error(errorData.message || 'An unknown API error occurred.');
        }

        if (response.status === 204) {
            return null; // Handle No Content response
        }
        
        return response.json();
    } catch (error) {
        console.error(`API call to ${endpoint} failed:`, error);
        throw error;
    }
};

// --- AUTH API ---
export const login = (email: string, password: string): Promise<{ token: string, user: User & { role: Role } }> => {
    return apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
};

export const register = (name: string, email: string, password: string): Promise<{ token: string, user: User & { role: Role } }> => {
    return apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
};


// --- PUBLIC DATA API ---

let publicDataCache: { settings: SiteSettings; products: Product[]; sizes: Record<ProductType, ProductSize[]> } | null = null;

// Function to clear cache, useful for admin updates
export const clearPublicDataCache = () => {
    publicDataCache = null;
};

export const getPublicData = async (): Promise<{ settings: SiteSettings; products: Product[]; sizes: Record<ProductType, ProductSize[]> }> => {
    if (publicDataCache) {
        return publicDataCache;
    }
    const data = await apiFetch('/data/public');
    publicDataCache = data;
    return data;
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    const data = await getPublicData();
    return data.settings;
};

export const getManagedProducts = async (): Promise<Product[]> => {
    const data = await getPublicData();
    return data.products;
};

export const getProductSizes = async (): Promise<Record<ProductType, ProductSize[]>> => {
    const data = await getPublicData();
    return data.sizes;
};

// --- ORDER & CHAT API ---

export const addOrder = (clientDetails: any, cartItems: CartItem[], userId?: string): Promise<Order> => {
    return apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ clientDetails, cartItems, userId }),
    });
};

export const getOrderById = (orderId: string): Promise<Order> => {
    return apiFetch(`/orders/${orderId}`);
};

export const getChatMessages = (orderId: string): Promise<ChatMessage[]> => {
    return apiFetch(`/orders/${orderId}/chat`);
};

export const addChatMessage = async (msg: { orderId: string; text: string; sender: 'user' | 'admin'; file?: File | null }): Promise<ChatMessage> => {
    const formData = new FormData();
    formData.append('orderId', msg.orderId);
    formData.append('text', msg.text);
    formData.append('sender', msg.sender);
    if (msg.file) {
        formData.append('file', msg.file);
    }
    
    const token = getToken();
    const headers = new Headers();
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}/orders/${msg.orderId}/chat`, {
        method: 'POST',
        body: formData,
        headers,
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to send message');
    }
    return response.json();
};

// --- REVIEW API ---
export const addReview = (review: Review): Promise<void> => {
    return apiFetch('/reviews', { method: 'POST', body: JSON.stringify(review) });
};

export const getReviewByOrderId = (orderId: string): Promise<Review | null> => {
    return apiFetch(`/reviews/${orderId}`);
};

// --- ADMIN API ---
export const getAdminDashboardData = (): Promise<{ orders: Order[], tasks: Task[], formConfig: FormConfig, users: User[], roles: Role[] }> => apiFetch('/admin/data');

export const getOrders = async (): Promise<Order[]> => (await getAdminDashboardData()).orders;
export const getTasks = async (): Promise<Task[]> => (await getAdminDashboardData()).tasks;
export const getFormConfig = async (): Promise<FormConfig> => (await getAdminDashboardData()).formConfig;
export const getUsers = async (): Promise<User[]> => (await getAdminDashboardData()).users;
export const getRoles = async (): Promise<Role[]> => (await getAdminDashboardData()).roles;

export const updateSiteSettings = (settings: SiteSettings): Promise<void> => apiFetch('/admin/data/settings', { method: 'PUT', body: JSON.stringify(settings) }).then(clearPublicDataCache);
export const updateManagedProducts = (products: Product[]): Promise<void> => apiFetch('/admin/data/products', { method: 'PUT', body: JSON.stringify(products) }).then(clearPublicDataCache);
export const updateProductSizes = (sizes: Record<ProductType, ProductSize[]>): Promise<void> => apiFetch('/admin/data/sizes', { method: 'PUT', body: JSON.stringify(sizes) }).then(clearPublicDataCache);
export const updateTasks = (tasks: Task[]): Promise<void> => apiFetch('/admin/data/tasks', { method: 'PUT', body: JSON.stringify(tasks) });
export const updateFormConfig = (config: FormConfig): Promise<void> => apiFetch('/admin/data/form-config', { method: 'PUT', body: JSON.stringify(config) });

export const updateUser = (user: User): Promise<void> => apiFetch(`/admin/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) });
export const deleteUser = (userId: string): Promise<void> => apiFetch(`/admin/users/${userId}`, { method: 'DELETE' });
export const updateRole = (role: Role): Promise<Role> => apiFetch('/admin/roles', { method: 'PUT', body: JSON.stringify(role) });
export const deleteRole = (roleId: string): Promise<void> => apiFetch(`/admin/roles/${roleId}`, { method: 'DELETE' });


export const updateOrder = (orderId: string, updates: Partial<Order>): Promise<void> => {
    return apiFetch(`/admin/orders/${orderId}`, { method: 'PUT', body: JSON.stringify(updates) });
};

export const updateBulkOrders = (orderIds: string[], updates: Partial<Order>): Promise<void> => {
    return apiFetch('/admin/orders/bulk-update', { method: 'PUT', body: JSON.stringify({ orderIds, updates }) });
};

// --- Shipping API (proxied through backend) ---

export const createShipment = (orderId: string, companyId: string): Promise<{ trackingNumber: string }> => {
    return apiFetch('/admin/shipping/create', {
        method: 'POST',
        body: JSON.stringify({ orderId, companyId }),
    });
};

export const trackShipment = (orderId: string): Promise<{ status: OrderStatus, lastUpdate: string }> => {
    return apiFetch(`/admin/shipping/track/${orderId}`);
};
