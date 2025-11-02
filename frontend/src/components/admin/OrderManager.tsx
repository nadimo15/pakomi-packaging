import React, { useState, useMemo, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import type { Language, Order, OrderLineItem, OrderStatus, Product, Socials } from '../../types.ts';
import { DELIVERY_COMPANIES, ORDER_STATUSES } from '../../constants.ts';
import ChatModal from './ChatModal.tsx';
import ShipOrderModal from './ShipOrderModal.tsx';
import OrderEditModal from './OrderEditModal.tsx';
import { trackShipment, getManagedProducts } from '../../api.ts';
import { RefreshCwIcon, ChevronDownIcon, ChevronUpIcon, FacebookIcon, InstagramIcon, TikTokIcon, WhatsAppIcon, ViberIcon, LinkIcon, DownloadIcon, FileIcon, PencilIcon } from '../Icons.tsx';

interface OrderManagerProps {
    language: Language;
    orders: Order[];
    onOrderUpdate: (orderId: string, updates: Partial<Order>) => void;
    onBulkOrderUpdate: (orderIds: string[], updates: Partial<Order>) => void;
}

const OrderManager: React.FC<OrderManagerProps> = ({ language, orders, onOrderUpdate, onBulkOrderUpdate }) => {
    const { t } = useLocalization(language);
    const [filter, setFilter] = useState<OrderStatus | 'All'>('All');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [isShipModalOpen, setIsShipModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loadingStatus, setLoadingStatus] = useState<Record<string, boolean>>({});
    const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());
    const [bulkStatus, setBulkStatus] = useState<OrderStatus>('Pending');
    const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [sortConfig, setSortConfig] = useState<{ key: 'submittedAt'; direction: 'asc' | 'desc' }>({
        key: 'submittedAt',
        direction: 'desc',
    });

    useEffect(() => {
        getManagedProducts().then(setAllProducts).catch(console.error);
    }, []);

    const filteredOrders = useMemo(() => {
        if (filter === 'All') return orders;
        return orders.filter(order => order.status === filter);
    }, [orders, filter]);

    const sortedOrders = useMemo(() => {
        return [...filteredOrders].sort((a, b) => {
            const dateA = new Date(a.submittedAt).getTime();
            const dateB = new Date(b.submittedAt).getTime();
            if (sortConfig.direction === 'asc') {
                return dateA - dateB;
            } else {
                return dateB - dateA;
            }
        });
    }, [filteredOrders, sortConfig]);
    
    useEffect(() => {
        setSelectedOrderIds(new Set());
    }, [filter]);

    const handleSort = () => {
        setSortConfig(prevConfig => ({
            key: 'submittedAt',
            direction: prevConfig.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
        if (newStatus === 'Shipped') {
            const orderToShip = orders.find(o => o.id === orderId);
            if(orderToShip) {
                setSelectedOrder(orderToShip);
                setIsShipModalOpen(true);
            }
        } else {
            onOrderUpdate(orderId, { status: newStatus });
        }
    };
    
    const handleShipOrder = (orderId: string, shippingInfo: { carrier: string; trackingNumber: string; }) => {
        onOrderUpdate(orderId, { 
            status: 'Shipped',
            shippingInfo: { ...shippingInfo, shippedAt: new Date().toISOString() }
        });
        setIsShipModalOpen(false);
        setSelectedOrder(null);
    };

    const handleOpenChat = (order: Order) => {
        setSelectedOrder(order);
        setIsChatModalOpen(true);
    };

    const handleOpenEdit = (order: Order) => {
        setSelectedOrder(order);
        setIsEditModalOpen(true);
    };

    const handleSaveOrderEdit = (updatedOrder: Order) => {
        onOrderUpdate(updatedOrder.id, updatedOrder);
        setIsEditModalOpen(false);
        setSelectedOrder(null);
    };

    const handleRefreshStatus = async (order: Order) => {
        if (!order.shippingInfo?.trackingNumber) return;

        setLoadingStatus(prev => ({ ...prev, [order.id]: true }));
        try {
            const { status, lastUpdate } = await trackShipment(order.id);
            onOrderUpdate(order.id, { 
                status: status,
                shippingInfo: { ...(order.shippingInfo as any), lastUpdate }
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Failed to refresh status for order ${order.id}:`, errorMessage);
            alert(`Error refreshing status for ${order.id}: ${errorMessage}`);
        } finally {
            setLoadingStatus(prev => ({ ...prev, [order.id]: false }));
        }
    };

    const handleSelectOne = (orderId: string, isSelected: boolean) => {
        const newSet = new Set(selectedOrderIds);
        if (isSelected) {
            newSet.add(orderId);
        } else {
            newSet.delete(orderId);
        }
        setSelectedOrderIds(newSet);
    };

    const handleSelectAll = (isSelected: boolean) => {
        if (isSelected) {
            const allIds = new Set(filteredOrders.map(o => o.id));
            setSelectedOrderIds(allIds);
        } else {
            setSelectedOrderIds(new Set());
        }
    };

    const handleApplyBulkStatus = () => {
        if (selectedOrderIds.size === 0) return;

        const orderIds = Array.from(selectedOrderIds);
        
        if (bulkStatus === 'Shipped') {
             if (!window.confirm(`Are you sure you want to mark ${orderIds.length} orders as 'Shipped' without adding tracking information?`)) {
                return;
            }
        }

        onBulkOrderUpdate(orderIds, { status: bulkStatus });
        setSelectedOrderIds(new Set());
    };

    const isAllSelected = selectedOrderIds.size > 0 && selectedOrderIds.size === filteredOrders.length;
    
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

    const BulkActionToolbar = () => (
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-primary/10 p-3 rounded-lg border border-primary/20">
            <span className="font-semibold text-primary">{t('ordersSelected').replace('{count}', selectedOrderIds.size.toString())}</span>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                <select 
                    value={bulkStatus}
                    onChange={(e) => setBulkStatus(e.target.value as OrderStatus)}
                    className="p-2 border rounded-md bg-white text-sm"
                    aria-label={t('changeStatus')}
                >
                    {ORDER_STATUSES.map(status => (
                        <option key={status} value={status}>{t(status.toLowerCase())}</option>
                    ))}
                </select>
                <button onClick={handleApplyBulkStatus} className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-md hover:bg-primary-focus transition-colors">
                    {t('apply')}
                </button>
                 <button onClick={() => setSelectedOrderIds(new Set())} className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-md hover:bg-gray-300 transition-colors">
                    {t('deselectAll')}
                </button>
            </div>
        </div>
    );

    return (
        <div className="bg-white rounded-lg">
            {selectedOrder && isChatModalOpen && <ChatModal language={language} order={selectedOrder} onClose={() => setIsChatModalOpen(false)} />}
            {selectedOrder && isShipModalOpen && <ShipOrderModal language={language} order={selectedOrder} onClose={() => setIsShipModalOpen(false)} onShip={handleShipOrder} />}
            {selectedOrder && isEditModalOpen && <OrderEditModal language={language} order={selectedOrder} onClose={() => setIsEditModalOpen(false)} onSave={handleSaveOrderEdit} />}

            {selectedOrderIds.size > 0 ? (
                <BulkActionToolbar />
            ) : (
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{t('manageOrders')}</h2>
                    <div className="flex items-center gap-2">
                        <label htmlFor="status-filter" className="text-sm font-medium">{t('filterByStatus')}:</label>
                        <select
                            id="status-filter"
                            value={filter}
                            onChange={e => setFilter(e.target.value as OrderStatus | 'All')}
                            className="p-2 border rounded-md bg-white"
                        >
                            <option value="All">{t('all')}</option>
                            {ORDER_STATUSES.map(status => (
                                <option key={status} value={status}>{t(status.toLowerCase())}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 hidden md:table-header-group">
                        <tr>
                            <th scope="col" className="p-4">
                                <input 
                                    type="checkbox"
                                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                    checked={isAllSelected}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    aria-label="Select all orders"
                                />
                            </th>
                            <th scope="col" className="px-6 py-3">{t('orderId')}</th>
                            <th scope="col" className="px-6 py-3">
                                <button onClick={handleSort} className="flex items-center gap-1 group font-semibold">
                                    {t('submittedAt')}
                                    <span className="opacity-50 group-hover:opacity-100 transition-opacity">
                                        {sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                                    </span>
                                </button>
                            </th>
                            <th scope="col" className="px-6 py-3">{t('clientName')}</th>
                            <th scope="col" className="px-6 py-3">{t('products')}</th>
                            <th scope="col" className="px-6 py-3">{t('totalPrice')}</th>
                            <th scope="col" className="px-6 py-3">{t('shippingInfo')}</th>
                            <th scope="col" className="px-6 py-3">{t('status')}</th>
                            <th scope="col" className="px-6 py-3 text-right">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedOrders.map(order => {
                            const isExpanded = expandedOrderId === order.id;
                            return (
                                <React.Fragment key={order.id}>
                                    <tr className={`block mb-4 rounded-lg shadow-md md:table-row md:shadow-none md:border-b transition-colors ${selectedOrderIds.has(order.id) ? 'bg-primary/5' : 'bg-white hover:bg-gray-50'}`}>
                                        <td className="p-4 hidden md:table-cell">
                                            <input 
                                                type="checkbox"
                                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                                                checked={selectedOrderIds.has(order.id)}
                                                onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                                                aria-label={`Select order ${order.id}`}
                                            />
                                        </td>
                                        <td className="px-6 pt-4 pb-2 flex justify-between items-center md:table-cell md:py-4 md:px-6 font-mono font-medium text-gray-900 border-b md:border-none">
                                            <span>{order.id}</span>
                                            <input 
                                                type="checkbox"
                                                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary md:hidden"
                                                checked={selectedOrderIds.has(order.id)}
                                                onChange={(e) => handleSelectOne(order.id, e.target.checked)}
                                                aria-label={`Select order ${order.id}`}
                                            />
                                        </td>
                                        <td className="px-6 py-2 flex justify-between items-center md:table-cell md:py-4"><span className="font-bold md:hidden">{t('submittedAt')}:</span> {new Date(order.submittedAt).toLocaleDateString(language)}</td>
                                        <td className="px-6 py-2 flex justify-between items-center md:table-cell md:py-4"><span className="font-bold md:hidden">{t('clientName')}:</span> {order.clientName}</td>
                                        <td className="px-6 py-2 flex justify-between items-center md:table-cell md:py-4"><span className="font-bold md:hidden">{t('products')}:</span> {order.lineItems.length} {order.lineItems.length > 1 ? 'items' : 'item'}</td>
                                        <td className="px-6 py-2 flex justify-between items-center md:table-cell md:py-4"><span className="font-bold md:hidden">{t('totalPrice')}:</span> {order.totalPrice.toLocaleString(undefined, {style: 'currency', currency: 'USD'})}</td>
                                        <td className="px-6 py-2 flex justify-between items-start md:table-cell md:py-4">
                                            <span className="font-bold md:hidden shrink-0 pr-2">{t('shippingInfo')}:</span>
                                            {order.shippingInfo ? (
                                                <div className="text-right md:text-left">
                                                    <p className="font-medium text-gray-700 text-xs">{order.shippingInfo.carrier}</p>
                                                    <div className="flex items-center gap-1 text-gray-500">
                                                        <span className="font-mono text-xs">{order.shippingInfo.trackingNumber}</span>
                                                        {DELIVERY_COMPANIES.some(c => c.name === order.shippingInfo!.carrier && c.api) && (
                                                            <button 
                                                                onClick={() => handleRefreshStatus(order)} 
                                                                disabled={loadingStatus[order.id]}
                                                                className="p-0.5 text-gray-400 hover:text-primary disabled:opacity-50 disabled:cursor-wait"
                                                                aria-label="Refresh status"
                                                            >
                                                                <RefreshCwIcon className={`w-3 h-3 ${loadingStatus[order.id] ? 'animate-spin' : ''}`} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400">-</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-2 flex justify-between items-center md:table-cell md:py-4">
                                            <span className="font-bold md:hidden">{t('status')}:</span>
                                            <select
                                                value={order.status}
                                                onChange={e => handleStatusChange(order.id, e.target.value as OrderStatus)}
                                                className={`w-full max-w-[150px] md:max-w-none text-xs font-semibold p-1.5 rounded border-0 focus:ring-0 ${statusColor(order.status as OrderStatus)}`}
                                            >
                                                {ORDER_STATUSES.map(status => (
                                                    <option key={status} value={status}>{t(status.toLowerCase())}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 flex justify-end items-center md:table-cell text-right border-t md:border-none">
                                            <button onClick={() => handleOpenChat(order)} className="font-medium text-primary hover:underline">{t('chat')}</button>
                                            <button onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} className="p-1 text-gray-500 hover:text-primary" aria-label={t('viewDetails')}>
                                                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-slate-50 border-b md:table-row">
                                            <td colSpan={9} className="p-4 block md:table-cell">
                                                <OrderDetails order={order} t={t} onEditClick={() => handleOpenEdit(order)} allProducts={allProducts} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )
                        })}
                    </tbody>
                </table>
                 {sortedOrders.length === 0 && (
                    <p className="text-center text-gray-500 py-8">{t('noOrdersFound')}</p>
                )}
            </div>
        </div>
    );
};

const OrderDetails: React.FC<{order: Order, t: (key: string) => string, onEditClick: () => void, allProducts: Product[]}> = ({ order, t, onEditClick, allProducts }) => {
    
    const DetailItem: React.FC<{label: string, children: React.ReactNode}> = ({label, children}) => (
        <div>
            <p className="text-xs font-semibold text-gray-500 uppercase">{label}</p>
            <div className="text-sm text-gray-800 mt-1">{children}</div>
        </div>
    );
    
    const LineItem: React.FC<{item: OrderLineItem; orderId: string}> = ({item, orderId}) => {
        const product = allProducts.find(p => p.id === item.productType);
        
        const hasLogo = !!item.logoUrl;
        let logoMime: string | null = null;
        let isImage = false;

        if (hasLogo && item.logoUrl) {
            const match = item.logoUrl.match(/^data:(.+);base64,/);
            if (match) {
                logoMime = match[1];
                isImage = logoMime.startsWith('image/');
            }
        }

        const handleDownloadLogo = () => {
            if (!item.logoUrl || !logoMime) return;

            const link = document.createElement('a');
            link.href = item.logoUrl;
            
            const extension = logoMime.split('/')[1]?.split('+')[0] || 'bin';
            const safeProductName = item.productName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            link.download = `logo_${orderId}_${safeProductName}.${extension}`;

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        return (
            <div className="flex flex-col sm:flex-row gap-4 p-3 bg-slate-100 rounded-lg">
                <div className="w-20 h-20 bg-white rounded-md flex-shrink-0 flex items-center justify-center p-1 border mx-auto sm:mx-0">
                    {product && <img src={product.galleryImagesB64[0]} alt={item.productName} className="max-w-full max-h-full object-contain" />}
                </div>
                <div className="flex-grow text-center sm:text-left">
                    <p className="font-bold">{item.productName} <span className="font-normal text-gray-600">x{item.quantity}</span></p>
                    <p className="text-sm text-gray-600">{item.width} x {item.height} {item.depth ? `x ${item.depth}` : ''} cm</p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-gray-600">
                        {t('color')}: <span style={{backgroundColor: item.color}} className="w-4 h-4 rounded-full border"></span>
                    </div>
                    {item.description && <p className="text-xs text-gray-500 mt-1 italic">"{item.description}"</p>}
                </div>
                <div className="flex-shrink-0 w-full sm:w-28 text-center sm:text-right border-t sm:border-none pt-2 sm:pt-0">
                    <p className="font-semibold">{(item.unitPrice * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
                    <p className="text-xs text-gray-500">{t('itemWeight')}: {(item.itemWeight * item.quantity / 1000).toFixed(2)} kg</p>
                </div>
                {hasLogo && (
                    <div className="flex-shrink-0 w-full sm:w-24 text-center border-t sm:border-none pt-2 sm:pt-0">
                        {isImage ? (
                            <img src={item.logoUrl!} alt="logo" className="w-12 h-12 object-contain mx-auto rounded border bg-white" />
                        ) : (
                            <div className="flex flex-col items-center text-gray-500">
                                <FileIcon className="w-8 h-8"/>
                                {logoMime && <p className="text-xs truncate">{logoMime}</p>}
                            </div>
                        )}
                        <button onClick={handleDownloadLogo} className="mt-1 text-xs text-primary hover:underline flex items-center gap-1 mx-auto">
                            <DownloadIcon className="w-3 h-3"/> {t('downloadLogo')}
                        </button>
                    </div>
                )}
            </div>
        );
    };
    
    const socialIcons = {
        facebook: <FacebookIcon className="w-5 h-5" />,
        instagram: <InstagramIcon className="w-5 h-5" />,
        tiktok: <TikTokIcon className="w-5 h-5" />,
        whatsapp: <WhatsAppIcon className="w-5 h-5" />,
        viber: <ViberIcon className="w-5 h-5" />,
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h4 className="font-bold text-lg">{t('orderDetails')}</h4>
                    <p className="text-sm text-gray-500">{t('orderId')}: <span className="font-mono">{order.id}</span></p>
                </div>
                <button onClick={onEditClick} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg hover:bg-blue-100">
                    <PencilIcon className="w-4 h-4"/>
                    {t('editOrder')}
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <DetailItem label={t('clientName')}>{order.clientName}</DetailItem>
                <DetailItem label={t('phone')}>{order.phone}</DetailItem>
                <DetailItem label={t('emailAddress')}>{order.email}</DetailItem>
                <DetailItem label={t('address')}>{`${order.address}, ${order.commune}, ${order.wilaya}`}</DetailItem>
            </div>
            {Object.values(order.socials).some(val => Array.isArray(val) ? val.length > 0 : !!val) && (
                <div>
                    <h5 className="font-semibold text-gray-600 mb-2">{t('socialMedia')}</h5>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                        {Object.entries(order.socials).map(([key, value]) => {
                            if (key !== 'others' && typeof value === 'string' && value) {
                                let href = '#';
                                switch(key) {
                                    case 'whatsapp': href = `https://wa.me/${String(value).replace(/\D/g, '')}`; break;
                                    case 'viber': href = `viber://chat?number=%2B${String(value).replace(/\D/g, '')}`; break;
                                    default: href = String(value).startsWith('http') ? String(value) : `https://www.${key}.com/${value}`;
                                }
                                return (
                                    <a key={key} href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                                        {socialIcons[key as keyof typeof socialIcons]} {value}
                                    </a>
                                );
                            }
                            return null;
                        })}
                        {(order.socials.others as {platform: string; url: string}[])?.map((item: {platform: string, url: string}, i: number) => (
                             <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-primary">
                                <LinkIcon className="w-5 h-5" /> {item.url}
                             </a>
                        ))}
                    </div>
                </div>
            )}
             <div>
                <h5 className="font-semibold text-gray-600 mb-2">{t('products')}</h5>
                <div className="space-y-2">
                    {order.lineItems.map((item, i) => <LineItem key={i} item={item} orderId={order.id} />)}
                </div>
            </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-4 border-t">
                 <DetailItem label={t('totalWeight')}>
                    <span className="font-bold">{(order.totalWeight / 1000).toFixed(2)} kg</span>
                </DetailItem>
                <DetailItem label={t('totalPrice')}>
                    <span className="font-bold text-lg text-primary">{order.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</span>
                </DetailItem>
             </div>
        </div>
    );
};

export default OrderManager;
