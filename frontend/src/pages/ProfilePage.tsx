import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { useAuth } from '../hooks/useAuth';
// This would need to be a new API endpoint if we want to fetch only user-specific orders
// For now, we'll filter on the client, but a real app would have `api.getMyOrders()`
import { getOrders } from '../api'; 
import type { Language, Order, OrderStatus } from '../types';

interface ProfilePageProps {
  language: Language;
  navigate: (path: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ language, navigate }) => {
  const { t } = useLocalization(language);
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const fetchOrders = async () => {
        try {
            // In a real-world scenario, you'd have an endpoint like /api/my-orders
            // that uses the auth token to return only the current user's orders.
            // Here, we fetch all and filter, which is insecure but works for this demo.
            const allOrders = await getOrders();
            const userOrders = allOrders
                .filter(o => o.userId === currentUser.id)
                .sort((a,b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
            setOrders(userOrders);
        } catch (error) {
            console.error("Failed to fetch user orders:", error);
        } finally {
            setIsLoading(false);
        }
    };
    fetchOrders();

  }, [currentUser, navigate]);

  if (!currentUser) {
    return null; // Redirecting
  }

  if (isLoading) {
      return <div className="text-center p-12">Loading profile...</div>
  }
  
  const statusColor = (status: OrderStatus) => {
    switch (status) {
        case 'Pending': return 'bg-yellow-100 text-yellow-800';
        case 'Designing': return 'bg-purple-100 text-purple-800';
        case 'Printing': return 'bg-pink-100 text-pink-800';
        case 'In Production': return 'bg-blue-100 text-blue-800';
        case 'Shipped': return 'bg-indigo-100 text-indigo-800';
        case 'Completed': return 'bg-green-100 text-green-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800">{t('myAccount')}</h1>
          <div className="mt-4 bg-white p-6 rounded-lg shadow-sm">
            <p><strong>{t('fullName')}:</strong> {currentUser.name}</p>
            <p><strong>{t('emailAddress')}:</strong> {currentUser.email}</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">{t('myOrders')}</h2>
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {orders.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 hidden md:table-header-group">
                            <tr>
                                <th scope="col" className="px-6 py-3">{t('orderId')}</th>
                                <th scope="col" className="px-6 py-3">{t('orderDate')}</th>
                                <th scope="col" className="px-6 py-3">{t('totalPrice')}</th>
                                <th scope="col" className="px-6 py-3">{t('status')}</th>
                                <th scope="col" className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} className="bg-white block mb-4 rounded-lg shadow md:table-row md:shadow-none md:border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 flex justify-between items-center md:table-cell font-mono font-medium text-gray-900 border-b md:border-none">
                                        <span className="font-bold md:hidden">{t('orderId')}</span>
                                        <span>{order.id}</span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-between items-center md:table-cell border-b md:border-none">
                                        <span className="font-bold md:hidden">{t('orderDate')}</span>
                                        <span>{new Date(order.submittedAt).toLocaleDateString(language)}</span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-between items-center md:table-cell border-b md:border-none">
                                        <span className="font-bold md:hidden">{t('totalPrice')}</span>
                                        <span>{order.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-between items-center md:table-cell border-b md:border-none">
                                        <span className="font-bold md:hidden">{t('status')}</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(order.status as OrderStatus)}`}>
                                            {t(order.status.toLowerCase())}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 flex justify-end items-center md:table-cell text-right">
                                        <a href={`#/track?id=${order.id}`} onClick={(e) => { e.preventDefault(); navigate(`/track?id=${order.id}`); }} className="font-medium text-primary hover:underline">{t('track')}</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="text-center p-12 text-gray-500">
                    <p>{t('noOrdersYet')}</p>
                    <button onClick={() => navigate('/')} className="mt-4 px-5 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-focus text-sm">
                        {t('continueShopping')}
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
