import React, { useState, useEffect, useRef } from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import { addChatMessage } from '../../api.ts'; // Use API directly
import type { Language, Order, ChatMessage } from '../../types.ts';
import { XCircleIcon, SendIcon, PaperClipIcon, FileIcon, DownloadIcon, WhatsAppIcon, ViberIcon } from '../Icons.tsx';

interface ChatModalProps {
    language: Language;
    order: Order;
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ language, order, onClose }) => {
    const { t } = useLocalization(language);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Chat messages for admin should be fetched when modal opens, not from a static db
        // This is a placeholder - a real app would fetch this.
        // setMessages(getChatMessages(order.id));
    }, [order.id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() || file) {
            const message = await addChatMessage({
                orderId: order.id,
                text: newMessage.trim(),
                sender: 'admin',
                file: file,
            });
            setMessages(prev => [...prev, message]);
            setNewMessage('');
            setFile(null);
            if(fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile && selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
          alert('File is too large. Maximum size is 5MB.');
          return;
        }
        setFile(selectedFile);
    };

    const renderChatMessage = (msg: ChatMessage) => {
        if (msg.fileUrl) {
          if (msg.fileType?.startsWith('image/')) {
            return (
              <>
                {msg.text && <p className="text-sm mb-2">{msg.text}</p>}
                <img src={msg.fileUrl} alt={msg.fileName} className="rounded-lg max-w-xs max-h-48" />
              </>
            );
          }
          return (
            <div className="flex flex-col gap-2">
                {msg.text && <p className="text-sm">{msg.text}</p>}
                <a 
                    href={msg.fileUrl} 
                    download={msg.fileName}
                    className="flex items-center gap-2 p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                    <FileIcon className="w-6 h-6 flex-shrink-0" />
                    <span className="text-sm truncate">{msg.fileName}</span>
                    <DownloadIcon className="w-5 h-5 ml-auto flex-shrink-0" />
                </a>
            </div>
          );
        }
        return <p className="text-sm">{msg.text}</p>;
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[80vh] flex flex-col transform transition-all" 
                onClick={e => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="chat-modal-title"
            >
                <div className="flex justify-between items-start p-4 border-b">
                    <div>
                        <h2 id="chat-modal-title" className="text-xl font-bold text-gray-800">{t('chatWithCustomer')} - <span className="text-primary">{order.id}</span></h2>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                            <span><strong>{t('phone')}:</strong> {order.phone}</span>
                            {(order.socials as any).whatsapp && (
                                <span className="flex items-center gap-1.5">
                                    <WhatsAppIcon className="w-4 h-4 text-green-500" />
                                    {(order.socials as any).whatsapp}
                                </span>

                            )}
                            {(order.socials as any).viber && (
                                <span className="flex items-center gap-1.5">
                                    <ViberIcon className="w-4 h-4 text-purple-600" />
                                    {(order.socials as any).viber}
                                </span>
                            )}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0" aria-label={t('close')}>
                        <XCircleIcon className="w-7 h-7" />
                    </button>
                </div>
                
                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-sm px-4 py-2 rounded-2xl ${msg.sender === 'admin' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>
                                {renderChatMessage(msg)}
                                <p className={`text-xs opacity-70 mt-1 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}>
                                    {new Date(msg.timestamp).toLocaleTimeString(language, { hour: 'numeric', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>

                <div className="p-4 border-t bg-gray-50">
                    {file && (
                        <div className="flex items-center justify-between p-2 mb-2 bg-gray-200 rounded-lg">
                           <div className="flex items-center gap-2 truncate">
                                <FileIcon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                            </div>
                            <button
                                onClick={() => { setFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}
                                className="p-1 text-gray-500 hover:text-red-600 rounded-full"
                                aria-label={t('removeFile')}
                            >
                                <XCircleIcon className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                        <input 
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="p-3 text-gray-500 hover:text-primary border border-gray-300 bg-white rounded-full transition-colors flex-shrink-0"
                            aria-label={t('attachFile')}
                        >
                           <PaperClipIcon className="w-5 h-5" />
                        </button>
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={t('typeYourMessage')}
                            className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-primary"
                            autoFocus
                        />
                        <button type="submit" className="bg-primary text-white rounded-full p-3 hover:bg-primary-focus transition-colors flex-shrink-0" aria-label={t('sendMessage')}>
                            <SendIcon className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatModal;
