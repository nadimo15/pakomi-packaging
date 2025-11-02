import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../../hooks/useLocalization.ts';
import type { Language, SiteSettings, ServiceItem, Testimonial, FooterLink, Product, HowItWorksStep, FaqItem } from '../../types.ts';
import { PlusIcon, TrashIcon, DragHandleIcon, ChevronDownIcon, ChevronUpIcon } from '../Icons.tsx';
import { SOCIAL_PLATFORMS } from '../../constants.ts';
import { getManagedProducts } from '../../api.ts';
import ImageUploader from './ImageUploader.tsx';

interface SiteSettingsEditorProps {
    language: Language;
    settings: SiteSettings;
    onUpdate: (settings: SiteSettings) => void;
}

const SiteSettingsEditor: React.FC<SiteSettingsEditorProps> = ({ language, settings, onUpdate }) => {
    const { t } = useLocalization(language);
    const [localSettings, setLocalSettings] = useState<SiteSettings>(settings);
    const [isSaved, setIsSaved] = useState(false);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [activeAccordion, setActiveAccordion] = useState<string | null>('general');
    
    useEffect(() => {
        getManagedProducts().then(setAllProducts).catch(console.error);
    }, []);
    
    // Force re-render on drop to update visuals
    const [dragCounter, setDragCounter] = useState(0);

    const handleUpdate = <T extends keyof SiteSettings>(section: T, data: SiteSettings[T]) => {
        setLocalSettings(prev => ({ ...prev, [section]: data }));
    };

    const handleSave = () => {
        onUpdate(localSettings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    const AccordionItem: React.FC<{ title: string; id: string; children: React.ReactNode }> = ({ title, id, children }) => (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
                onClick={() => setActiveAccordion(activeAccordion === id ? null : id)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100"
                aria-expanded={activeAccordion === id}
                aria-controls={`content-${id}`}
            >
                <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                {activeAccordion === id ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
            </button>
            <div id={`content-${id}`} className={`p-6 bg-white ${activeAccordion === id ? 'block' : 'hidden'}`}>
                {children}
            </div>
        </div>
    );
    
    return (
        <div className="max-w-4xl mx-auto" key={dragCounter}>
            <div className="space-y-4">
                <AccordionItem title={t('generalSettings')} id="general">
                    <GeneralSettings settings={localSettings} setSettings={setLocalSettings} t={t} language={language} />
                </AccordionItem>

                <AccordionItem title={t('homepageContent')} id="homepage">
                    <HomepageSettings settings={localSettings} setSettings={setLocalSettings} t={t} setDragCounter={setDragCounter} language={language} />
                </AccordionItem>

                <AccordionItem title={t('thankYouPageSettings')} id="thankyou">
                    <ThankYouSettings settings={localSettings.thankYouPage} upsellSettings={localSettings.upsell} onUpdate={handleUpdate} allProducts={allProducts} t={t} />
                </AccordionItem>

                <AccordionItem title={t('trackingAndAnalytics')} id="tracking">
                    <TrackingSettings settings={localSettings.tracking} onUpdate={handleUpdate} t={t} />
                </AccordionItem>

                <AccordionItem title={t('footerContent')} id="footer">
                    <FooterSettings settings={localSettings.footer} onUpdate={handleUpdate} t={t} />
                </AccordionItem>
            </div>

            <div className="mt-8 text-right">
                <button 
                    onClick={handleSave} 
                    className={`px-8 py-3 font-bold text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg ${isSaved ? 'bg-green-500 hover:bg-green-600' : 'bg-primary hover:bg-primary-focus'}`}
                >
                    {isSaved ? t('saved') : t('saveChanges')}
                </button>
            </div>
        </div>
    );
};

// Sub-components for each section to keep the main component clean

const InputField: React.FC<{label: string; value: string; onChange: (val: string) => void; placeholder?: string; type?: string;}> = ({label, value, onChange, placeholder, type="text"}) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary" />
    </div>
);

const TextareaField: React.FC<{label: string; value: string; onChange: (val: string) => void; placeholder?: string; rows?: number}> = ({label, value, onChange, placeholder, rows=3}) => (
    <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">{label}</label>
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-primary" />
    </div>
);

const ToggleSwitch: React.FC<{id: string, isChecked: boolean, onChange: (val: boolean) => void, label: string}> = ({ id, isChecked, onChange, label }) => (
   <div className="flex items-center">
     <label htmlFor={id} className="flex items-center cursor-pointer">
       <div className="relative">
         <input type="checkbox" id={id} className="sr-only" checked={isChecked} onChange={(e) => onChange(e.target.checked)} />
         <div className="block bg-gray-200 w-10 h-6 rounded-full"></div>
         <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isChecked ? 'translate-x-full bg-primary' : ''}`}></div>
       </div>
       <div className="ml-3 text-gray-700 text-sm font-medium">{label}</div>
     </label>
   </div>
);

// Generic Draggable List Component
interface DraggableListProps<T> {
    items: T[];
    onItemsChange: (items: T[]) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    setDragCounter: React.Dispatch<React.SetStateAction<number>>;
}
const DraggableList = <T extends {id: string}>({ items, onItemsChange, renderItem, setDragCounter }: DraggableListProps<T>) => {
    const dragItemIndex = useRef<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDrop = () => {
        if (dragItemIndex.current === null || dragOverIndex === null || dragItemIndex.current === dragOverIndex) return;
        const newItems = [...items];
        const [reorderedItem] = newItems.splice(dragItemIndex.current, 1);
        newItems.splice(dragOverIndex, 0, reorderedItem);
        onItemsChange(newItems);
    };

    const handleDragEnd = () => {
        dragItemIndex.current = null;
        setDragOverIndex(null);
        setDragCounter(c => c + 1);
    };

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div 
                    key={item.id}
                    className="relative"
                    draggable
                    onDragStart={() => dragItemIndex.current = index}
                    onDragEnter={() => setDragOverIndex(index)}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                >
                    {dragOverIndex === index && (
                        <div className="absolute -top-1.5 left-0 right-0 h-1.5 bg-primary rounded-full" aria-hidden="true" />
                    )}
                    {renderItem(item, index)}
                </div>
            ))}
            {dragOverIndex === items.length && (
                <div className="relative h-1.5">
                    <div className="absolute -bottom-1.5 left-0 right-0 h-1.5 bg-primary rounded-full" aria-hidden="true" />
                </div>
            )}
        </div>
    );
};


const GeneralSettings: React.FC<{settings: SiteSettings, setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>, t: (key: string) => string, language: Language}> = ({ settings, setSettings, t, language }) => (
    <div className="space-y-4">
        <InputField label={t('brandName')} value={settings.brandName} onChange={val => setSettings(p => ({...p, brandName: val}))} />
        <ImageUploader
            language={language}
            label={t('logo')}
            imageB64={settings.logoB64}
            onImageUpload={b64 => setSettings(p => ({ ...p, logoB64: b64 || '' }))}
            helpText={t('logoHelper')}
        />
    </div>
);

const HomepageSettings: React.FC<{settings: SiteSettings, setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>, t: (key: string) => string, setDragCounter: React.Dispatch<React.SetStateAction<number>>, language: Language}> = ({ settings, setSettings, t, setDragCounter, language }) => {
    
    const handleSectionChange = (section: keyof SiteSettings, field: string, value: any) => {
        setSettings(prev => ({...prev, [section]: {...(prev[section] as any), [field]: value}}));
    };

    const getItemProp = (sectionKey: 'services' | 'howItWorks' | 'testimonials' | 'faq'): 'items' | 'steps' => {
        return sectionKey === 'howItWorks' ? 'steps' : 'items';
    };

    const handleItemListChange = (section: 'services' | 'howItWorks' | 'testimonials' | 'faq', newItems: any[]) => {
        const prop = getItemProp(section);
        setSettings(prev => ({ ...prev, [section]: { ...(prev[section] as any), [prop]: newItems }}));
    };
    
    const handleAddItem = (section: 'services' | 'howItWorks' | 'testimonials' | 'faq') => {
        let newItem: any;
        switch(section) {
            case 'services': newItem = { id: `s-${Date.now()}`, title: '', description: '' }; break;
            case 'howItWorks': newItem = { id: `h-${Date.now()}`, icon: 'select', title: '', description: '' }; break;
            case 'testimonials': newItem = { id: `t-${Date.now()}`, quote: '', author: '', company: '', image: '' }; break;
            case 'faq': newItem = { id: `f-${Date.now()}`, question: '', answer: '' }; break;
        }
        const prop = getItemProp(section);
        const currentItems = (settings[section] as any)[prop] || [];
        handleItemListChange(section, [...currentItems, newItem]);
    };
    
    const handleRemoveItem = (section: 'services' | 'howItWorks' | 'testimonials' | 'faq', index: number) => {
        const prop = getItemProp(section);
        const currentItems = (settings[section] as any)[prop] as any[];
        handleItemListChange(section, currentItems.filter((_, i) => i !== index));
    };

    const handleItemFieldChange = (section: 'services' | 'howItWorks' | 'testimonials' | 'faq', index: number, field: string, value: string) => {
        const prop = getItemProp(section);
        const newItems = [...((settings[section] as any)[prop] as any[])];
        newItems[index] = { ...newItems[index], [field]: value };
        handleItemListChange(section, newItems);
    };

    const sectionConfig = {
        hero: { title: t('heroSection') },
        services: { title: t('ourServices') },
        howItWorks: { title: t('howItWorks') },
        testimonials: { title: t('whatOurClientsSay') },
        faq: { title: t('faqSection') }
    };
    
    const renderItemFields = (sectionKey: 'services' | 'howItWorks' | 'testimonials' | 'faq', item: any, index: number) => {
        switch (sectionKey) {
            case 'services':
                return (
                    <>
                        <InputField label={t('title')} value={item.title} onChange={val => handleItemFieldChange(sectionKey, index, 'title', val)} />
                        <TextareaField label={t('description')} value={item.description} onChange={val => handleItemFieldChange(sectionKey, index, 'description', val)} />
                    </>
                );
            case 'howItWorks':
                return (
                    <>
                        <InputField label={t('title')} value={item.title} onChange={val => handleItemFieldChange(sectionKey, index, 'title', val)} />
                        <TextareaField label={t('description')} value={item.description} onChange={val => handleItemFieldChange(sectionKey, index, 'description', val)} />
                        <InputField label={t('icon')} value={item.icon} onChange={val => handleItemFieldChange(sectionKey, index, 'icon', val)} />
                    </>
                );
            case 'testimonials':
                return (
                     <>
                        <TextareaField label={t('quote')} value={item.quote} onChange={val => handleItemFieldChange(sectionKey, index, 'quote', val)} />
                        <InputField label={t('author')} value={item.author} onChange={val => handleItemFieldChange(sectionKey, index, 'author', val)} />
                        <InputField label={t('company')} value={item.company} onChange={val => handleItemFieldChange(sectionKey, index, 'company', val)} />
                        <InputField label={t('imageUrl')} value={item.image} onChange={val => handleItemFieldChange(sectionKey, index, 'image', val)} />
                    </>
                );
            case 'faq':
                 return (
                    <>
                        <InputField label={t('question')} value={item.question} onChange={val => handleItemFieldChange(sectionKey, index, 'question', val)} />
                        <TextareaField label={t('answer')} value={item.answer} onChange={val => handleItemFieldChange(sectionKey, index, 'answer', val)} />
                    </>
                );
            default: return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="p-4 border rounded-md">
                <h4 className="font-semibold text-lg mb-3">{t('heroSection')}</h4>
                <div className="space-y-3">
                    <InputField label={t('mainHeadline')} value={settings.hero.title} onChange={val => handleSectionChange('hero', 'title', val)} />
                    <TextareaField label={t('subHeadline')} value={settings.hero.subtitle} onChange={val => handleSectionChange('hero', 'subtitle', val)} />
                    <InputField label={t('ctaButtonText')} value={settings.hero.ctaText} onChange={val => handleSectionChange('hero', 'ctaText', val)} />
                    <ImageUploader
                        language={language}
                        label={t('heroImage')}
                        imageB64={settings.hero.heroImageB64}
                        onImageUpload={b64 => handleSectionChange('hero', 'heroImageB64', b64 || '')}
                        helpText="Recommended: 1920x1080px"
                    />
                </div>
            </div>
            {/* Other Sections */}
            {['services', 'howItWorks', 'testimonials', 'faq'].map(key => {
                const sectionKey = key as 'services' | 'howItWorks' | 'testimonials' | 'faq';
                const sectionData = settings[sectionKey] as any;
                const sectionTitle = sectionConfig[sectionKey].title;
                const itemType = sectionKey === 'testimonials' ? 'testimonial' : sectionKey === 'faq' ? 'question' : sectionKey === 'howItWorks' ? 'step' : 'service';
                const itemsProp = getItemProp(sectionKey);
                return (
                    <div key={sectionKey} className="p-4 border rounded-md">
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="font-semibold text-lg">{sectionTitle}</h4>
                            <ToggleSwitch id={`${sectionKey}-enabled`} isChecked={sectionData.enabled} onChange={val => handleSectionChange(sectionKey, 'enabled', val)} label={t('enabled')} />
                        </div>
                        <div className="space-y-3">
                            <InputField label={t('title')} value={sectionData.title} onChange={val => handleSectionChange(sectionKey, 'title', val)} />
                            <DraggableList
                                items={sectionData[itemsProp] || []}
                                onItemsChange={(newItems) => handleItemListChange(sectionKey, newItems)}
                                setDragCounter={setDragCounter}
                                renderItem={(item: any, index: number) => (
                                    <div className="p-3 border rounded-md bg-slate-50 flex items-start gap-3">
                                        <div className="text-gray-400 cursor-move pt-2"><DragHandleIcon className="w-5 h-5"/></div>
                                        <div className="flex-grow space-y-2">
                                            {renderItemFields(sectionKey, item, index)}
                                        </div>
                                        <button onClick={() => handleRemoveItem(sectionKey, index)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                                    </div>
                                )}
                            />
                            <button onClick={() => handleAddItem(sectionKey)} className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-md hover:bg-primary/20"><PlusIcon className="w-4 h-4"/>{t(`addNew${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`)}</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const ThankYouSettings: React.FC<{settings: SiteSettings['thankYouPage'], upsellSettings: SiteSettings['upsell'], onUpdate: Function, allProducts: Product[], t: (key: string) => string}> = ({ settings, upsellSettings, onUpdate, allProducts, t }) => (
    <div className="space-y-4">
        <InputField label={t('thankYouTitle')} value={settings.title} onChange={val => onUpdate('thankYouPage', {...settings, title: val})} />
        <TextareaField label={t('thankYouMessage')} value={settings.message} onChange={val => onUpdate('thankYouPage', {...settings, message: val})} />
        <div className="pt-4 mt-4 border-t">
            <h4 className="text-lg font-semibold text-gray-700 mb-2">{t('upsellSection')}</h4>
            <div className="space-y-4">
                <ToggleSwitch id="upsell-enabled" isChecked={upsellSettings.enabled} onChange={val => onUpdate('upsell', {...upsellSettings, enabled: val})} label={t('enableUpsell')} />
                <InputField label={t('upsellTitle')} value={upsellSettings.title} onChange={val => onUpdate('upsell', {...upsellSettings, title: val})} />
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">{t('productsToShow')}</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-3 border rounded-md max-h-48 overflow-y-auto bg-slate-50">
                        {allProducts.map(product => (
                            <label key={product.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-100 cursor-pointer">
                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" checked={(upsellSettings.productIds || []).includes(product.id)} onChange={e => onUpdate('upsell', {...upsellSettings, productIds: e.target.checked ? [...upsellSettings.productIds, product.id] : upsellSettings.productIds.filter(id => id !== product.id)})}/>
                                <span className="text-sm">{product.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TrackingSettings: React.FC<{settings: SiteSettings['tracking'], onUpdate: Function, t: (key: string) => string}> = ({ settings, onUpdate, t }) => (
    <div className="space-y-4">
        <InputField label={t('facebookPixelId')} value={settings.facebookPixelId} onChange={val => onUpdate('tracking', {...settings, facebookPixelId: val})} placeholder="123456789012345" />
        <InputField label={t('tiktokPixelId')} value={settings.tiktokPixelId} onChange={val => onUpdate('tracking', {...settings, tiktokPixelId: val})} placeholder="C1234567890" />
        <InputField label={t('snapchatPixelId')} value={settings.snapchatPixelId} onChange={val => onUpdate('tracking', {...settings, snapchatPixelId: val})} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"/>
        <InputField label={t('googleAnalyticsId')} value={settings.googleAnalyticsId} onChange={val => onUpdate('tracking', {...settings, googleAnalyticsId: val})} placeholder="G-XXXXXXXXXX" />
    </div>
);

const FooterSettings: React.FC<{settings: SiteSettings['footer'], onUpdate: Function, t: (key: string) => string}> = ({ settings, onUpdate, t }) => {
    const handleLinkChange = (index: number, field: keyof Omit<FooterLink, 'id'>, value: string) => {
        const newLinks = [...settings.links];
        newLinks[index] = { ...newLinks[index], [field]: value };
        onUpdate('footer', {...settings, links: newLinks});
    };
    const handleAddLink = () => {
        const newLink: FooterLink = { id: `fl-${Date.now()}`, platform: 'website', url: '' };
        onUpdate('footer', {...settings, links: [...settings.links, newLink]});
    };
    const handleRemoveLink = (index: number) => {
        onUpdate('footer', {...settings, links: settings.links.filter((_, i) => i !== index)});
    };
    return (
        <div className="space-y-4">
            <InputField label={t('address')} value={settings.address} onChange={val => onUpdate('footer', {...settings, address: val})} />
            <InputField label={t('email')} value={settings.email} onChange={val => onUpdate('footer', {...settings, email: val})} />
            <InputField label={t('phone')} value={settings.phone} onChange={val => onUpdate('footer', {...settings, phone: val})} />
            <div className="space-y-3 pt-3">
                <h4 className="font-medium text-gray-600">Social Links</h4>
                {settings.links.map((link, index) => (
                    <div key={link.id} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                        <select value={link.platform} onChange={(e) => handleLinkChange(index, 'platform', e.target.value)} className="p-2 border rounded-md bg-white">
                            {SOCIAL_PLATFORMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="url" placeholder={t('urlPlaceholder')} value={link.url} onChange={(e) => handleLinkChange(index, 'url', e.target.value)} className="w-full p-2 border rounded-md" />
                        <button type="button" onClick={() => handleRemoveLink(index)} className="p-2 text-gray-500 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                    </div>
                ))}
                <button onClick={handleAddLink} className="mt-2 flex items-center gap-2 text-sm font-semibold text-primary"><PlusIcon className="w-5 h-5"/>{t('addLink')}</button>
            </div>
        </div>
    );
};

export default SiteSettingsEditor;
