import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { Language, SiteSettings, Product, ProductType, ProductSize, Order, Task, FormConfig, User, Role } from '../types';
import * as api from '../api';

import OrderManager from '../components/admin/OrderManager';
import ProductEditor from '../components/admin/ProductEditor';
import SiteSettingsEditor from '../components/admin/SiteSettingsEditor';
import FormEditor from '../components/admin/FormEditor';
import TodoManager from '../components/admin/TodoManager';
import UsersAndRolesPage from '../components/admin/UsersAndRolesPage';

interface AdminPageProps {
  language: Language;
}

type AdminTab = 'dashboard' | 'orders' | 'products' | 'form' | 'settings' | 'tasks' | 'users';

const AdminPage: React.FC<AdminPageProps> = ({ language }) => {
    const { t } = useLocalization(language);
    const [activeTab, setActiveTab] = useState<AdminTab>('orders');

    // States for each manager
    const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [sizes, setSizes] = useState<Record<ProductType, ProductSize[]>>({});
    const [orders, setOrders] = useState<Order[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [formConfig, setFormConfig] = useState<FormConfig | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all data on initial component load
    useEffect(() => {
        const loadAllData = async () => {
            setIsLoading(true);
            try {
                const [
                    settingsData, productsData, sizesData, ordersData, 
                    tasksData, formConfigData, usersData, rolesData
                ] = await Promise.all([
                    api.getSiteSettings(),
                    api.getManagedProducts(),
                    api.getProductSizes(),
                    api.getOrders(),
                    api.getTasks(),
                    api.getFormConfig(),
                    api.getUsers(),
                    api.getRoles()
                ]);

                setSiteSettings(settingsData);
                setProducts(productsData);
                setSizes(sizesData);
                setOrders(ordersData);
                setTasks(tasksData);
                setFormConfig(formConfigData);
                setUsers(usersData);
                setRoles(rolesData);
            } catch (error) {
                console.error("Failed to load admin data:", error);
                // Handle error state in UI
            } finally {
                setIsLoading(false);
            }
        };
        loadAllData();
    }, []);


    // Handlers to update state and persist to DB via API layer
    const handleSettingsUpdate = async (newSettings: SiteSettings) => {
        await api.updateSiteSettings(newSettings);
        setSiteSettings(await api.getSiteSettings());
    };

    const handleProductsUpdate = async (newProducts: Product[]) => {
        await api.updateManagedProducts(newProducts);
        setProducts(await api.getManagedProducts());
    };

    const handleSizesUpdate = async (newSizes: Record<ProductType, ProductSize[]>) => {
        await api.updateProductSizes(newSizes);
        setSizes(await api.getProductSizes());
    };
    
    const handleOrderUpdate = async (orderId: string, updates: Partial<Order>) => {
        await api.updateOrder(orderId, updates);
        setOrders(await api.getOrders());
    };
    
    const handleBulkOrderUpdate = async (orderIds: string[], updates: Partial<Order>) => {
        await api.updateBulkOrders(orderIds, updates);
        setOrders(await api.getOrders());
    };

    const handleTasksUpdate = async (newTasks: Task[]) => {
        await api.updateTasks(newTasks);
        setTasks(await api.getTasks());
    };
    
    const handleFormConfigUpdate = async (newConfig: FormConfig) => {
        await api.updateFormConfig(newConfig);
        setFormConfig(await api.getFormConfig());
    };
    
    const handleUserUpdate = async (updatedUser: User) => {
        await api.updateUser(updatedUser);
        setUsers(await api.getUsers());
    };
    
    const handleUserDelete = async (userId: string) => {
        if(window.confirm(t('confirmDeleteUser'))){
            await api.deleteUser(userId);
            setUsers(await api.getUsers());
        }
    };
    
    const handleRoleUpdate = async (updatedRole: Role) => {
        await api.updateRole(updatedRole);
        setRoles(await api.getRoles());
    };
    
    const handleRoleDelete = async (roleId: string) => {
        if(window.confirm(t('confirmDeleteRole'))){
            await api.deleteRole(roleId, t);
            setUsers(await api.getUsers()); // Users might have been reassigned
            setRoles(await api.getRoles());
        }
    };


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
                    {/* <TabButton tab="dashboard" label="Dashboard" /> */}
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