import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { getOrderById, getChatMessages, addChatMessage, updateOrder, getManagedProducts, trackShipment } from '../api';
import type { Language, Order, ChatMessage, OrderStatus, OrderLineItem } from '../types';
import { 
    SendIcon, PaperClipIcon, FileIcon, DownloadIcon, XCircleIcon, RefreshCwIcon,
    FileTextIcon, PencilRulerIcon, PrinterIcon, PackageIcon, TruckIcon, CheckCircle2Icon
} from '../components/Icons';
import { DELIVERY_COMPANIES } from '../constants';

interface TrackOrderPageProps {
  language: Language;
  navigate: (path: string) => void;
}

const statusSteps: OrderStatus[] = ['Pending', 'Designing', 'Printing', 'In Production', 'Shipped', 'Completed'];

const statusDetails: Record<OrderStatus, { icon: React.FC<any>, labelKey: string }> = {
    'Pending': { icon: FileTextIcon, labelKey: 'orderPlaced' },
    'Designing': { icon: PencilRulerIcon, labelKey: 'designing' },
    'Printing': { icon: PrinterIcon, labelKey: 'printing' },
    'In Production': { icon: PackageIcon, labelKey: 'packaging' },
    'Shipped': { icon: TruckIcon, labelKey: 'shipped' },
    'Completed': { icon: CheckCircle2Icon, labelKey: 'completed' },
    'Cancelled': { icon: XCircleIcon, labelKey: 'cancelled' },
};

const TrackOrderPage: React.FC<TrackOrderPageProps> = ({ language, navigate }) => {
  const { t } = useLocalization(language);
  const [orderIdInput, setOrderIdInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    getManagedProducts().then(setAllProducts);
  }, []);

  const handleRefreshStatus = async (orderToRefresh: Order) => {
    if (!orderToRefresh.shippingInfo?.trackingNumber) return;
    setIsLoadingStatus(true);
    try {
        const { status, lastUpdate } = await trackShipment(orderToRefresh.id);
        const updatedShippingInfo = { ...orderToRefresh.shippingInfo, lastUpdate };
        // We only update status on the frontend. The backend call just fetches.
        // A better system might have the backend update its own status from the delivery API.
        setOrder(prevOrder => prevOrder ? { ...prevOrder, status, shippingInfo: updatedShippingInfo } : null);
    } catch (err) {
        console.error(`Failed to refresh status for order ${orderToRefresh.id}:`, err);
    } finally {
        setIsLoadingStatus(false);
    }
  };

  const handleTrackOrder = async (idToTrack?: string) => {
    const finalId = (idToTrack || orderIdInput).trim().toUpperCase();
    if (!finalId) {
        setError(t('enterOrderId'));
        setOrder(null);
        return;
    }

    setIsLoading(true);
    setError('');

    try {
        const foundOrder = await getOrderById(finalId);
        const chatMessages = await getChatMessages(finalId);
        setOrder(foundOrder);
        setMessages(chatMessages);
        if (!window.location.hash.includes(`id=${foundOrder.id}`)) {
            navigate(`/track?id=${foundOrder.id}`);
        }
    } catch (err) {
        setError(t('orderNotFound'));
        setOrder(null);
        setMessages([]);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    const hash = window.location.hash;
    const searchPart = hash.substring(hash.indexOf('?'));
    const params = new URLSearchParams(searchPart);
    const idFromUrl = params.get('id');
    if (idFromUrl) {
      handleTrackOrder(idFromUrl);
      setOrderIdInput(idFromUrl);
    }
  }, []);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (order && (newMessage.trim() || file)) {
        const message = await addChatMessage({ orderId: order.id, text: newMessage.trim(), sender: 'user', file: file });
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setFile(null);
        if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files ? event.target.files[0] : null;
    if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
      alert('File is too large. Maximum size is 5MB.');
      return;
    }
    setFile(selectedFile);
  };

  const currentStatusIndex = order ? statusSteps.indexOf(order.status as OrderStatus) : -1;
  
  const OrderItem: React.FC<{item: OrderLineItem}> = ({item}) => {
    const product = allProducts.find(p => p.productId === item.productType);
    return (
        <div className="flex gap-4 p-4 bg-slate-50 rounded-lg">
             <div className="w-20 h-20 bg-gray-100 rounded-md flex-shrink-0 flex items-center justify-center p-2">
                 <img src={item.logoUrl || product?.galleryImagesB64[0]} alt={item.productName} className="max-w-full max-h-full object-contain" />
            </div>
            <div>
                <p className="font-bold text-gray-800">{item.productName} <span className="font-normal text-gray-600">x{item.quantity}</span></p>
                <p className="text-sm text-gray-600">{item.width} x {item.height} {item.depth ? `x ${item.depth}`: ''} cm</p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                    {t('color')}: <span style={{backgroundColor: item.color}} className="w-4 h-4 rounded-full border"></span>
                </p>
                 <p className="text-sm text-gray-600">{t('totalPrice')}: {(item.unitPrice * item.quantity).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}</p>
            </div>
        </div>
    )
  };

  return (
    <div className="bg-slate-50 min-h-full">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center text-gray-800">{t('trackYourOrder')}</h1>
          <p className="mt-2 text-center text-gray-600">{t('trackOrderPrompt')}</p>
          
          <form onSubmit={(e) => { e.preventDefault(); handleTrackOrder(); }} className="mt-8 flex gap-2 max-w-lg mx-auto">
            <input
              type="text" value={orderIdInput} onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder={t('enterOrderId')}
              className="flex-grow px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
              aria-label={t('enterOrderId')}
            />
            <button type="submit" disabled={isLoading} className="px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-focus transition-colors shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:bg-gray-400">
              {isLoading ? '...' : t('track')}
            </button>
          </form>

          {error && <p className="mt-4 text-center text-red-600 font-semibold">{error}</p>}
          {isLoading && !order && <p className="mt-4 text-center text-gray-600">Searching for your order...</p>}

          {order && (
             <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in-up">
              <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('orderDetails')}</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><strong className="text-gray-600">{t('orderId')}:</strong> <span className="font-mono text-gray-800">{order.id}</span></div>
                        <div className="flex justify-between"><strong className="text-gray-600">{t('clientName')}:</strong> <span className="text-gray-800 text-right">{order.clientName}</span></div>
                        <div className="flex justify-between"><strong className="text-gray-600">{t('submittedOn')}:</strong> <span className="text-gray-800">{new Date(order.submittedAt).toLocaleDateString(language)}</span></div>
                    </div>
                 </div>

                 {order.shippingInfo && (
                    <div className="bg-white p-6 rounded-xl shadow-lg">
                      <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        {t('shippingInfo')}
                        <button onClick={() => handleRefreshStatus(order)} disabled={isLoadingStatus} className="p-1 text-gray-500 hover:text-primary disabled:opacity-50 disabled:cursor-wait" aria-label="Refresh status">
                            <RefreshCwIcon className={`w-4 h-4 ${isLoadingStatus ? 'animate-spin' : ''}`} />
                        </button>
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><strong className="text-gray-600">{t('carrier')}:</strong> <span className="text-gray-800">{order.shippingInfo.carrier}</span></div>
                        <div className="flex justify-between"><strong className="text-gray-600">{t('trackingNumber')}:</strong> <span className="font-mono text-gray-800">{order.shippingInfo.trackingNumber}</span></div>
                      </div>
                      {order.shippingInfo.lastUpdate && (
                          <p className="text-xs text-gray-500 mt-2">Last update: {new Date(order.shippingInfo.lastUpdate).toLocaleString(language)}</p>
                      )}
                    </div>
                )}
                
                <div className="bg-white p-6 rounded-xl shadow-lg">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">{t('products')}</h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {order.lineItems.map((item, i) => <OrderItem key={i} item={item} />)}
                    </div>
                </div>
              </div>
              
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-lg">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">{t('status')}</h2>
                  <ol className="relative border-l-2 border-primary/20 rtl:border-l-0 rtl:border-r-2 ml-4 rtl:ml-0 rtl:mr-4">
                    {statusSteps.map((status, index) => {
                        const Icon = statusDetails[status].icon;
                        const isCompleted = currentStatusIndex >= index;
                        const isCurrent = currentStatusIndex === index;

                        return (
                            <li key={status} className={`mb-10 ml-8 rtl:mr-8 ${!isCompleted && 'opacity-50'}`}>
                                <span className={`absolute -left-4 rtl:-right-4 flex items-center justify-center w-8 h-8 rounded-full ring-4 ring-white ${isCompleted ? 'bg-primary' : 'bg-gray-300'}`}>
                                    <Icon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-600'}`} />
                                </span>
                                <h3 className={`font-semibold ${isCompleted ? 'text-primary' : 'text-gray-700'}`}>
                                    {t(statusDetails[status].labelKey)}
                                </h3>
                                {isCurrent && (
                                  <time className="block mb-2 text-sm font-normal leading-none text-gray-500">
                                      {t('status')}: {t(order.status.toLowerCase())} - {new Date(order.submittedAt).toLocaleDateString(language)}
                                  </time>
                                )}
                            </li>
                        );
                    })}
                  </ol>
                </div>
              </div>

              <div className="lg:col-span-3 mt-4 bg-white rounded-xl shadow-lg flex flex-col h-[60vh]">
                <h2 className="text-xl font-bold text-gray-800 p-4 border-b">{t('chatWithUs')}</h2>
                <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-slate-50">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-sm px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                            {/* Render logic needs to be updated when file uploads are handled by backend */}
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs opacity-70 mt-1 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString(language, { hour: 'numeric', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-4 border-t bg-white">
                  {file && (
                      <div className="flex items-center justify-between p-2 mb-2 bg-gray-100 rounded-lg">
                          <div className="flex items-center gap-2 truncate"> <FileIcon className="w-5 h-5 text-gray-600 flex-shrink-0" /> <span className="text-sm text-gray-700 truncate">{file.name}</span> </div>
                          <button onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1 text-gray-500 hover:text-red-600 rounded-full" aria-label={t('removeFile')}> <XCircleIcon className="w-5 h-5" /> </button>
                      </div>
                  )}
                  <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-gray-500 hover:text-primary border border-gray-300 bg-white rounded-full transition-colors flex-shrink-0" aria-label={t('attachFile')}> <PaperClipIcon className="w-5 h-5" /> </button>
                      <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t('typeYourMessage')} className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary" />
                      <button type="submit" className="bg-primary text-white rounded-full p-3 hover:bg-primary-focus transition-colors flex-shrink-0" aria-label={t('sendMessage')}> <SendIcon className="w-5 h-5" /> </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
