// This file contains all the core type definitions for the application.

export type Language = 'en' | 'ar';

export type ProductType = string;

export interface PriceTier {
  minQuantity: number;
  price: number;
}

export interface ProductSize {
  id: string;
  width: number;
  height: number;
  depth?: number;
  weight: number; // in grams
  pricing: PriceTier[];
}

export interface ProductColor {
    name: string;
    value: string;
}

export interface Product {
    id: ProductType;
    name: string;
    galleryImagesB64: string[];
    availableColors: ProductColor[];
}

export interface Socials {
  facebook: string;
  instagram: string;
  tiktok: string;
  whatsapp: string;
  viber: string;
  others: { platform: string; url: string }[];
}

export interface LogoProperties {
    x: number; // percentage
    y: number; // percentage
    scale: number; // multiplier
    rotation: number; // degrees
}

export interface CustomizationDetails {
  productType: ProductType;
  productName: string;
  width: number;
  height: number;
  depth: number;
  quantity: number;
  // FIX: Changed type from `string | File | null` to `string | null` to reflect that it holds a data URI, not a File object.
  logoUrl: string | null;
  logoProps: LogoProperties;
  color: string;
  description: string;
  clientName: string;
  phone: string;
  email?: string;
  address: string;
  wilaya: string;
  commune: string;
  socials: Socials;
}

export interface CartItem extends CustomizationDetails {
  cartItemId: string;
  unitPrice: number;
  itemWeight: number; // in grams
}

export interface OrderLineItem extends Omit<CustomizationDetails, 'quantity' | 'logoUrl' | 'clientName' | 'phone' | 'address' | 'wilaya' | 'commune' | 'socials' | 'email'> {
    logoUrl: string | null; // Keep logoUrl for order details
    quantity: number;
    unitPrice: number;
    itemWeight: number;
}

export type OrderStatus = 'Pending' | 'Designing' | 'Printing' | 'In Production' | 'Shipped' | 'Completed' | 'Cancelled';

export interface ShippingInfo {
    carrier: string;
    trackingNumber: string;
    shippedAt?: string;
    lastUpdate?: string;
}

export interface Order {
  id: string;
  submittedAt: string;
  clientName: string;
  phone: string;
  email: string;
  address: string;
  wilaya: string;
  commune: string;
  socials: Socials;
  lineItems: OrderLineItem[];
  totalPrice: number;
  totalWeight: number; // in grams
  status: OrderStatus;
  shippingInfo?: ShippingInfo;
  userId?: string;
}

export interface ChatMessage {
  id: string;
  orderId: string;
  text: string;
  sender: 'user' | 'admin';
  timestamp: string;
  file?: File | null;
  fileName?: string;
  fileType?: string;
  fileUrl?: string;
}

export type Permission = 'manage_orders' | 'manage_products' | 'manage_settings' | 'manage_users_roles';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  roleId: string | null; // null for a regular customer
}

export interface Role {
    id: string;
    name: string;
    permissions: Permission[];
}

export interface Baladiya {
  id: number;
  name: string;
}

export interface Wilaya {
  id: number;
  name: string;
  baladiyas: Baladiya[];
}

export interface Review {
    orderId: string;
    rating: number;
    comment: string;
}

// Site Settings Types
export interface ServiceItem {
    id: string;
    title: string;
    description: string;
}

export interface HowItWorksStep {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export interface Testimonial {
    id: string;
    quote: string;
    author: string;
    company: string;
    image: string;
}

export interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface FooterLink {
    id: string;
    platform: string;
    url: string;
}

export interface SiteSettings {
    brandName: string;
    logoB64: string;
    currency: string;
    hero: {
        title: string;
        subtitle: string;
        ctaText: string;
        heroImageB64: string;
    };
    services: {
        enabled: boolean;
        title: string;
        items: ServiceItem[];
    };
    howItWorks: {
        enabled: boolean;
        title: string;
        steps: HowItWorksStep[];
    };
    testimonials: {
        enabled: boolean;
        title: string;
        items: Testimonial[];
    };
    faq: {
        enabled: boolean;
        title: string;
        items: FaqItem[];
    };
    thankYouPage: {
        title: string;
        message: string;
    };
    upsell: {
        enabled: boolean;
        title: string;
        productIds: string[];
    };
    tracking: {
        facebookPixelId: string;
        tiktokPixelId: string;
        snapchatPixelId: string;
        googleAnalyticsId: string;
    };
    footer: {
        address: string;
        email: string;
        phone: string;
        links: FooterLink[];
    };
}

// Form Editor Types
export interface FormField {
    id: string;
    labelKey: string;
    enabled: boolean;
    required: boolean;
}

export interface FormSection {
    enabled: boolean;
    fields: FormField[];
}

export type FormSectionKey = 'specifications' | 'quantityAndPrice' | 'yourDetails';

export interface FormConfig {
    specifications: FormSection;
    quantityAndPrice: FormSection;
    yourDetails: FormSection;
    sectionOrder: FormSectionKey[];
}

// Task Manager Types
export type TaskPriority = 'High' | 'Medium' | 'Low';

export interface Task {
    id: string;
    text: string;
    priority: TaskPriority;
    isCompleted: boolean;
    createdAt: string;
}

// Delivery Company API Types
export interface DeliveryCompany {
    id: string;
    name: string;
    api?: {
        createShipmentUrl: string;
        trackShipmentUrl: string;
        apiKey: string;
    };
}