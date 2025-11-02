// api.ts
// This file acts as a service layer for all data interactions.
// Currently, it's a proxy to the localStorage database (db.ts).
// When migrating to a real backend, only this file needs to be changed.

import { 
    getSiteSettings as dbGetSiteSettings,
    updateSiteSettings as dbUpdateSiteSettings,
    getManagedProducts as dbGetManagedProducts,
    updateManagedProducts as dbUpdateManagedProducts,
    getProductSizes as dbGetProductSizes,
    updateProductSizes as dbUpdateProductSizes,
    getOrders as dbGetOrders,
    updateOrder as dbUpdateOrder,
    updateBulkOrders as dbUpdateBulkOrders,
    getTasks as dbGetTasks,
    updateTasks as dbUpdateTasks,
    getFormConfig as dbGetFormConfig,
    updateFormConfig as dbUpdateFormConfig,
    getUsers as dbGetUsers,
    updateUser as dbUpdateUser,
    deleteUser as dbDeleteUser,
    getRoles as dbGetRoles,
    updateRole as dbUpdateRole,
    deleteRole as dbDeleteRole,
} from './db';
import type { SiteSettings, Product, ProductType, ProductSize, Order, Task, FormConfig, User, Role } from './types';

// Site Settings
export const getSiteSettings = (): Promise<SiteSettings> => {
    return Promise.resolve(dbGetSiteSettings());
};
export const updateSiteSettings = (settings: SiteSettings): Promise<void> => {
    dbUpdateSiteSettings(settings);
    return Promise.resolve();
};

// Products & Sizes
export const getManagedProducts = (): Promise<Product[]> => {
    return Promise.resolve(dbGetManagedProducts());
};
export const updateManagedProducts = (products: Product[]): Promise<void> => {
    dbUpdateManagedProducts(products);
    return Promise.resolve();
};
export const getProductSizes = (): Promise<Record<ProductType, ProductSize[]>> => {
    return Promise.resolve(dbGetProductSizes());
};
export const updateProductSizes = (sizes: Record<ProductType, ProductSize[]>): Promise<void> => {
    dbUpdateProductSizes(sizes);
    return Promise.resolve();
};

// Orders
export const getOrders = (): Promise<Order[]> => {
    return Promise.resolve(dbGetOrders());
};
export const updateOrder = (orderId: string, updates: Partial<Order>): Promise<void> => {
    dbUpdateOrder(orderId, updates);
    return Promise.resolve();
};
export const updateBulkOrders = (orderIds: string[], updates: Partial<Order>): Promise<void> => {
    dbUpdateBulkOrders(orderIds, updates);
    return Promise.resolve();
};

// Tasks
export const getTasks = (): Promise<Task[]> => {
    return Promise.resolve(dbGetTasks());
};
export const updateTasks = (tasks: Task[]): Promise<void> => {
    dbUpdateTasks(tasks);
    return Promise.resolve();
};

// Form Config
export const getFormConfig = (): Promise<FormConfig> => {
    return Promise.resolve(dbGetFormConfig());
};
export const updateFormConfig = (config: FormConfig): Promise<void> => {
    dbUpdateFormConfig(config);
    return Promise.resolve();
};

// Users & Roles
export const getUsers = (): Promise<User[]> => {
    return Promise.resolve(dbGetUsers());
};
export const updateUser = (user: User): Promise<void> => {
    dbUpdateUser(user);
    return Promise.resolve();
};
export const deleteUser = (userId: string): Promise<void> => {
    dbDeleteUser(userId);
    return Promise.resolve();
};
export const getRoles = (): Promise<Role[]> => {
    return Promise.resolve(dbGetRoles());
};
export const updateRole = (role: Role): Promise<void> => {
    dbUpdateRole(role);
    return Promise.resolve();
};
export const deleteRole = (roleId: string, t: (key: string, options?: any) => string): Promise<void> => {
    dbDeleteRole(roleId, t);
    return Promise.resolve();
};

// We keep the external API calls here as well.
export { createShipment, trackShipment } from './api-external';