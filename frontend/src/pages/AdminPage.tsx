import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization.ts';
import { Language, SiteSettings, Product, ProductType, ProductSize, Order, Task, FormConfig, User, Role } from '../types.ts';
import * as api from '../api.ts';

import OrderManager from '../components/admin/OrderManager.tsx';
import ProductEditor from '../components/admin/ProductEditor.tsx';
import SiteSettingsEditor from '../components/admin/SiteSettingsEditor.tsx';
import FormEditor from '../components/admin/FormEditor.tsx';
import TodoManager from '../components/admin/TodoManager.tsx';
import UsersAndRolesPage from '../components/admin/UsersAndRolesPage.tsx';

interface AdminPageProps {
  language: Language;
}

type AdminTab = 'dashboard' | 'orders' | 'products' | 'form' | 'settings' | 'tasks' | 'users';

const AdminPage: React.FC<AdminPageProps> = ({ language }) => {
    const { t } = useLocalization(language);
    const [activeTab, setActiveTab] = useState<AdminTab>('orders');

    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [sizes, setSizes] = useState<Record<ProductType, ProductSize[]>>({});
    const [orders, setOrders] = useState<Order[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadAllData = async () => {
        setIsLoading(true);
        try {
            const [settingsData, productsData, sizesData, adminData] = await Promise.all([
                api.getSiteSettings(),
                api.getManagedProducts(),
                api.getProductSizes(),
                api.getAdminDashboardData(), 
            ]);

            setSiteSettings(settingsData);
            setProducts(productsData);
            setSizes(sizesData);
            setOrders(adminData.orders);
            setTasks(adminData.tasks);
            setFormConfig(adminData.formConfig);
            setUsers(adminData.users);
            setRoles(adminData.roles);
        } catch (error) {
            console.error("Failed to load admin data:", error);
            alert("Failed to load admin data. You may need to log in again.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    const handleSettingsUpdate = (newSettings: SiteSettings) => api.updateSiteSettings(newSettings).then(loadAllData);
    const handleProductsUpdate = (newProducts: Product[]) => api.updateManagedProducts(newProducts).then(loadAllData);
    const handleSizesUpdate = (newSizes: Record<ProductType, ProductSize[]>) => api.updateProductSizes(newSizes).then(loadAllData);
    const handleOrderUpdate = (orderId: string, updates: Partial<Order>) => api.updateOrder(orderId, updates).then(loadAllData);
    const handleBulkOrderUpdate = (orderIds: string[], updates: Partial<Order>) => api.updateBulkOrders(orderIds, updates).then(loadAllData);
    const handleTasksUpdate = (newTasks: Task[]) => api.updateTasks(newTasks).then(loadAllData);
    const handleFormConfigUpdate = (newConfig: FormConfig) => api.updateFormConfig(newConfig).then(loadAllData);
    const handleUserUpdate = (updatedUser: User) => api.updateUser(updatedUser).then(loadAllData);
    const handleUserDelete = (userId: string) => window.confirm(t('confirmDeleteUser')) && api.deleteUser(userId).then(loadAllData);
    const handleRoleUpdate = (updatedRole: Role) => api.updateRole(updatedRole).then(loadAllData);
    const handleRoleDelete = (roleId: string) => window.confirm(t('confirmDeleteRole')) && api.deleteRole(roleId).then(loadAllData);

    const renderContent = () => {
        if (isLoading || !siteSettings || !formConfig) {
            return <div className="text-center p-8">Loading...</div>;
        }

        switch (activeTab) {
            case 'orders':
                return <OrderManager language={language} orders={orders} onOrderUpdate={handleOrderUpdate} onBulkOrderUpdate={handleBulkOrderUpdate} />;
            case 'products':
                return <ProductEditor language={language} managedProducts={products} productSizes={sizes} onProductsUpdate={handleProductsUpdate} onSizesUpdate={handleSizesUpdate} />;
            case 'form':
                return <FormEditor language={language} config={formConfig} onConfigUpdate={handleFormConfigUpdate} />;
            case 'settings':
                return <SiteSettingsEditor language={language} settings={siteSettings} onUpdate={handleSettingsUpdate} />;
            case 'tasks':
                return <TodoManager language={language} tasks={tasks} onTasksUpdate={handleTasksUpdate} />;
            case 'users':
                 return <UsersAndRolesPage language={language} users={users} roles={roles} onUserUpdate={handleUserUpdate} onUserDelete={handleUserDelete} onRoleUpdate={handleRoleUpdate} onRoleDelete={handleRoleDelete} />;
            default:
                return <div>Dashboard Content</div>;
        }
    };

    const TabButton: React.FC<{tab: AdminTab, label: string}> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-600 hover:bg-gray-200'}`}
        >
            {label}
        </button>
    );

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('adminPanel')}</h1>
                <div className="flex space-x-2 rtl:space-x-reverse overflow-x-auto mb-6 p-2 bg-gray-200 rounded-lg">
                    <TabButton tab="orders" label={t('manageOrders')} />
                    <TabButton tab="products" label={t('productEditor')} />
                    <TabButton tab="form" label={t('formEditor')} />
                    <TabButton tab="users" label={t('usersAndRoles')} />
                    <TabButton tab="settings" label={t('generalSettings')} />
                    <TabButton tab="tasks" label={t('toDo')} />
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
