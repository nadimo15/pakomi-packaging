
// This is a mock database using localStorage for persistence.
import { 
    SiteSettings, Product, ProductType, ProductSize, CartItem, Order, 
    CustomizationDetails, ChatMessage, User, Role, Review, Task, FormConfig, OrderLineItem, Permission 
} from './types';
import { 
    CARTON_BOX_IMAGE_B64, CARTON_BOX_IMAGE_B64_OPEN,
    PLASTIC_MAILER_IMAGE_B64, 
    PAPER_SHOPPING_BAG_IMAGE_B64, PAPER_SHOPPING_BAG_IMAGE_B64_SIDE,
    KRAFT_SHOPPING_BAG_IMAGE_B64, 
    PLASTIC_SHOPPING_BAG_IMAGE_B64, 
    BUSINESS_CARD_IMAGE_B64, BUSINESS_CARD_IMAGE_B64_STACK,
    THANK_YOU_CARD_IMAGE_B64 
} from './assets';
import { testimonials as defaultTestimonials } from './testimonials';
import { sendEmail } from './email';

const DB_KEY = 'pakoumi_db_v2';
const CART_KEY = 'pakoumi_cart_v2';
const CURRENT_USER_KEY = 'pakoumi_user_v2';

const CUSTOMER_ROLE_ID = 'role-customer';

interface Database {
    siteSettings: SiteSettings;
    products: Product[];
    sizes: Record<ProductType, ProductSize[]>;
    orders: Order[];
    chats: Record<string, ChatMessage[]>; // key is orderId
    users: User[];
    roles: Role[];
    reviews: Review[];
    tasks: Task[];
    formConfig: FormConfig;
}

const getDefaultData = (): Database => ({
    siteSettings: {
        brandName: "Pakomi",
        logoB64: "",
        // FIX: Added missing currency property
        currency: "USD",
        hero: {
            title: "Custom Packaging That Makes an Impression",
            subtitle: "From boxes to bags, design and order high-quality, personalized packaging for your brand.",
            ctaText: "Start Designing",
            heroImageB64: ""
        },
        services: {
            enabled: true,
            title: "What We Offer",
            items: [
                { id: 's1', title: "Custom Sizing", description: "Get the perfect fit for your products with fully customizable dimensions." },
                { id: 's2', title: "High-Quality Printing", description: "Bring your brand to life with vibrant, full-color printing options." },
                { id: 's3', title: "Low Minimums", description: "Order as few as 50 units to get started without a large investment." },
                { id: 's4', title: "Fast Turnaround", description: "Receive your custom packaging quickly with our efficient production process." },
            ]
        },
        howItWorks: {
            enabled: true,
            title: "How It Works",
            steps: [
                {id: 'h1', icon: 'select', title: "1. Select & Customize", description: "Choose your product and use our live preview tool to customize the size, color, and design."},
                {id: 'h2', icon: 'order', title: "2. Place Your Order", description: "Confirm your design, provide your details, and securely place your order in just a few clicks."},
                {id: 'h3', icon: 'ship', title: "3. We Produce & Ship", description: "Our team gets to work producing your custom packaging and ships it directly to your door."},
            ]
        },
        testimonials: {
            enabled: true,
            title: "What Our Clients Say",
            items: defaultTestimonials.map((t, i) => ({...t, id: `t${i+1}`}))
        },
        faq: {
            enabled: true,
            title: "Frequently Asked Questions",
            items: [
                {id: 'f1', question: "What is the minimum order quantity?", answer: "Our minimum order quantity starts at just 50 pieces for most products."},
                {id: 'f2', question: "Can I get a sample?", answer: "Yes, please contact our support team to inquire about sample availability for your specific product."},
                {id: 'f3', question: "What file formats do you accept for logos?", answer: "We accept PNG, JPEG, and SVG files. For best results, please use a high-resolution image."},
            ]
        },
        thankYouPage: {
            title: "Thank You For Your Order!",
            message: "We've received your order and are getting to work on it right away. You can use the tracking ID below to check its status."
        },
        upsell: {
            enabled: true,
            title: "You Might Also Like...",
            productIds: ['businessCard', 'thankYouCard']
        },
        tracking: {
            facebookPixelId: "",
            tiktokPixelId: "",
            snapchatPixelId: "",
            googleAnalyticsId: ""
        },
        footer: {
            address: "Lot N100 zone d'activité, Dar El Beïda, Algeria",
            email: "contact@pakomi.com",
            phone: "+213 555 123 456",
            links: [
                {id: 'fl1', platform: 'facebook', url: 'https://facebook.com'},
                {id: 'fl2', platform: 'instagram', url: 'https://instagram.com'},
            ]
        }
    },
    products: [
        { id: 'cartonBox', name: 'Carton Box', galleryImagesB64: [CARTON_BOX_IMAGE_B64, CARTON_BOX_IMAGE_B64_OPEN], availableColors: [{name: 'Kraft', value: '#D2B48C'}, {name: 'White', value: '#FFFFFF'}, {name: 'Black', value: '#000000'}] },
        { id: 'plasticMailer', name: 'Plastic Mailer', galleryImagesB64: [PLASTIC_MAILER_IMAGE_B64], availableColors: [{name: 'White', value: '#FFFFFF'}, {name: 'Pink', value: '#FFC0CB'}, {name: 'Black', value: '#000000'}] },
        { id: 'paperShoppingBag', name: 'Paper Shopping Bag', galleryImagesB64: [PAPER_SHOPPING_BAG_IMAGE_B64, PAPER_SHOPPING_BAG_IMAGE_B64_SIDE], availableColors: [{name: 'White', value: '#FFFFFF'}, {name: 'Black', value: '#000000'}] },
        { id: 'kraftShoppingBag', name: 'Kraft Shopping Bag', galleryImagesB64: [KRAFT_SHOPPING_BAG_IMAGE_B64], availableColors: [{name: 'Kraft', value: '#D2B48C'}] },
        { id: 'plasticShoppingBag', name: 'Plastic Shopping Bag', galleryImagesB64: [PLASTIC_SHOPPING_BAG_IMAGE_B64], availableColors: [{name: 'White', value: '#FFFFFF'}] },
        { id: 'businessCard', name: 'Business Card', galleryImagesB64: [BUSINESS_CARD_IMAGE_B64, BUSINESS_CARD_IMAGE_B64_STACK], availableColors: [{name: 'White', value: '#FFFFFF'}] },
        { id: 'thankYouCard', name: 'Thank You Card', galleryImagesB64: [THANK_YOU_CARD_IMAGE_B64], availableColors: [{name: 'White', value: '#FFFFFF'}] },
    ],
    sizes: {
        cartonBox: [
            { id: 'cb1', width: 15, height: 10, depth: 5, weight: 50, pricing: [{ minQuantity: 50, price: 1.2 }, { minQuantity: 200, price: 1.0 }] },
            { id: 'cb2', width: 25, height: 15, depth: 10, weight: 100, pricing: [{ minQuantity: 50, price: 2.0 }, { minQuantity: 200, price: 1.8 }] },
        ],
        plasticMailer: [
            { id: 'pm1', width: 20, height: 30, weight: 15, pricing: [{ minQuantity: 50, price: 0.5 }, { minQuantity: 200, price: 0.4 }] },
        ],
        paperShoppingBag: [
             { id: 'psb1', width: 20, height: 25, depth: 10, weight: 80, pricing: [{ minQuantity: 50, price: 1.5 }, { minQuantity: 200, price: 1.3 }] },
        ],
        kraftShoppingBag: [
             { id: 'ksb1', width: 20, height: 25, depth: 10, weight: 75, pricing: [{ minQuantity: 50, price: 1.4 }, { minQuantity: 200, price: 1.2 }] },
        ],
        plasticShoppingBag: [
             { id: 'plsb1', width: 30, height: 40, depth: 10, weight: 25, pricing: [{ minQuantity: 50, price: 0.8 }, { minQuantity: 200, price: 0.6 }] },
        ],
        businessCard: [
             { id: 'bc1', width: 8.5, height: 5.5, weight: 5, pricing: [{ minQuantity: 100, price: 0.2 }, { minQuantity: 500, price: 0.15 }] },
        ],
        thankYouCard: [
             { id: 'tyc1', width: 14.8, height: 10.5, weight: 10, pricing: [{ minQuantity: 100, price: 0.4 }, { minQuantity: 500, price: 0.3 }] },
        ],
    },
    orders: [],
    chats: {},
    users: [
        {id: 'user-admin', name: 'Admin User', email: 'admin@pakomi.com', passwordHash: 'admin123', roleId: 'role-admin'}
    ],
    roles: [
        {id: 'role-admin', name: 'Admin', permissions: ['manage_orders', 'manage_products', 'manage_settings', 'manage_users_roles']},
        {id: CUSTOMER_ROLE_ID, name: 'Customer', permissions: []},
        {id: 'role-staff', name: 'Staff', permissions: ['manage_orders']},
    ],
    reviews: [],
    tasks: [
        { id: 'task-1', text: 'Follow up with client for order #F45K2', priority: 'High', isCompleted: false, createdAt: new Date().toISOString() },
        { id: 'task-2', text: 'Order new ink cartridges for printer', priority: 'Medium', isCompleted: false, createdAt: new Date().toISOString() },
    ],
    formConfig: {
        sectionOrder: ['specifications', 'quantityAndPrice', 'yourDetails'],
        specifications: {
            enabled: true,
            fields: [
                {id: 'dimensions', labelKey: 'dimensions', enabled: true, required: true},
                {id: 'color', labelKey: 'color', enabled: true, required: true},
            ]
        },
        quantityAndPrice: {
            enabled: true,
            fields: [
                {id: 'quantity', labelKey: 'quantity', enabled: true, required: true},
                {id: 'priceDisplay', labelKey: 'priceDisplay', enabled: true, required: false},
            ]
        },
        yourDetails: {
            enabled: true,
            fields: [
                {id: 'clientName', labelKey: 'clientName', enabled: true, required: true},
                {id: 'emailAddress', labelKey: 'emailAddress', enabled: true, required: true},
                {id: 'phone', labelKey: 'phone', enabled: true, required: true},
                {id: 'wilaya', labelKey: 'wilaya', enabled: true, required: true},
                {id: 'commune', labelKey: 'commune', enabled: true, required: true},
                {id: 'address', labelKey: 'address', enabled: true, required: true},
                {id: 'whatsapp', labelKey: 'whatsapp', enabled: true, required: false},
                {id: 'viber', labelKey: 'viber', enabled: true, required: false},
                {id: 'facebook', labelKey: 'facebook', enabled: true, required: false},
                {id: 'instagram', labelKey: 'instagram', enabled: true, required: false},
                {id: 'tiktok', labelKey: 'tiktok', enabled: true, required: false},
                {id: 'otherSocials', labelKey: 'otherSocials', enabled: true, required: false},
            ]
        }
    },
});


// --- DB HELPER FUNCTIONS ---
const readDb = (): Database => {
    try {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : getDefaultData();
    } catch (error) {
        console.error("Failed to read from localStorage", error);
        return getDefaultData();
    }
};

const writeDb = (db: Database) => {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        // Dispatch custom event to notify other hooks/components in the same tab
        window.dispatchEvent(new Event('storage'));
    } catch (error) {
        console.error("Failed to write to localStorage", error);
    }
};

export const initializeDb = () => {
    if (!localStorage.getItem(DB_KEY)) {
        console.info("Initializing database with default data.");
        writeDb(getDefaultData());
    }
};

const dispatchStorageEvent = () => window.dispatchEvent(new Event('storage'));

// --- SITE SETTINGS ---
export const getSiteSettings = (): SiteSettings => readDb().siteSettings;
export const updateSiteSettings = (settings: SiteSettings) => {
    const db = readDb();
    db.siteSettings = settings;
    writeDb(db);
};

// --- PRODUCTS & SIZES ---
export const getManagedProducts = (): Product[] => readDb().products;
export const updateManagedProducts = (products: Product[]) => {
    const db = readDb();
    db.products = products;
    writeDb(db);
};
export const getProductSizes = (): Record<ProductType, ProductSize[]> => readDb().sizes;
export const updateProductSizes = (sizes: Record<ProductType, ProductSize[]>) => {
    const db = readDb();
    db.sizes = sizes;
    writeDb(db);
};

// --- CART ---
export const getCartItems = (): CartItem[] => {
    try {
        const data = localStorage.getItem(CART_KEY);
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
};
const writeCart = (cart: CartItem[]) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    dispatchStorageEvent();
};
export const addToCart = (itemDetails: CustomizationDetails, unitPrice: number, itemWeight: number) => {
    const cart = getCartItems();
    const newItem: CartItem = {
        ...itemDetails,
        // FIX: Removed `instanceof File` check as `logoUrl` is now always a string (data URI) or null.
        logoUrl: itemDetails.logoUrl,
        cartItemId: `cart-${Date.now()}`,
        unitPrice,
        itemWeight
    };
    cart.push(newItem);
    writeCart(cart);
};
export const removeFromCart = (cartItemId: string) => {
    let cart = getCartItems();
    cart = cart.filter(item => item.cartItemId !== cartItemId);
    writeCart(cart);
};
export const updateCartItemQuantity = (cartItemId: string, newQuantity: number) => {
    const cart = getCartItems();
    const itemIndex = cart.findIndex(item => item.cartItemId === cartItemId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity = newQuantity;
        writeCart(cart);
    }
};
export const clearCart = () => {
    writeCart([]);
};

// --- ORDERS ---
export const getOrders = (): Order[] => readDb().orders;
export const getOrdersByUserId = (userId: string): Order[] => readDb().orders.filter(o => o.userId === userId);

export const addOrder = (clientDetails: Omit<Order, 'id'|'submittedAt'|'lineItems'|'totalPrice'|'totalWeight'|'status'|'userId'>, cartItems: CartItem[], userId?: string): Order => {
    const db = readDb();
    const totalWeight = cartItems.reduce((sum, item) => sum + (item.itemWeight * item.quantity), 0);
    const totalPrice = cartItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    const lineItems: OrderLineItem[] = cartItems.map(cartItem => {
        const { cartItemId, clientName, phone, address, wilaya, commune, socials, email, logoUrl, ...rest } = cartItem;
        return {
            ...rest,
            logoUrl: typeof logoUrl === 'string' ? logoUrl : null, // Only store string URLs in order
        };
    });

    const newOrder: Order = {
        id: `PKM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        submittedAt: new Date().toISOString(),
        ...clientDetails,
        lineItems,
        totalPrice,
        totalWeight,
        status: 'Pending',
        userId,
    };
    db.orders.unshift(newOrder);
    // Initialize chat for the order
    db.chats[newOrder.id] = [];
    writeDb(db);

    // Send confirmation email
    const emailBody = `
        Hi ${newOrder.clientName},
        
        Thank you for your order! We've received it and will start processing it shortly.
        
        Order ID: ${newOrder.id}
        Total Price: ${newOrder.totalPrice.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
        
        You can track your order status here: ${window.location.origin}#/track?id=${newOrder.id}
        
        Thanks,
        The Pakomi Team
    `;
    sendEmail(newOrder.email, `Pakomi Order Confirmation #${newOrder.id}`, emailBody).catch(console.error);


    return newOrder;
};
export const updateOrder = (orderId: string, updates: Partial<Order>) => {
    const db = readDb();
    const orderIndex = db.orders.findIndex(o => o.id === orderId);
    if (orderIndex > -1) {
        const oldStatus = db.orders[orderIndex].status;
        db.orders[orderIndex] = { ...db.orders[orderIndex], ...updates };
        const newOrder = db.orders[orderIndex];
        writeDb(db);

        // Check if status changed to 'Shipped' to send email
        if (updates.status === 'Shipped' && oldStatus !== 'Shipped' && newOrder.shippingInfo) {
            const emailBody = `
                Hi ${newOrder.clientName},
                
                Great news! Your order #${newOrder.id} has been shipped.
                
                Carrier: ${newOrder.shippingInfo.carrier}
                Tracking Number: ${newOrder.shippingInfo.trackingNumber}
                
                You can track your order status here: ${window.location.origin}#/track?id=${newOrder.id}
                
                Thanks,
                The Pakomi Team
            `;
            sendEmail(newOrder.email, `Your Pakomi Order #${newOrder.id} Has Shipped!`, emailBody).catch(console.error);
        }
    }
};

export const updateBulkOrders = (orderIds: string[], updates: Partial<Order>) => {
    const db = readDb();
    db.orders.forEach((order, index) => {
        if (orderIds.includes(order.id)) {
            const oldStatus = order.status;
            const updatedOrder = { ...order, ...updates };
            db.orders[index] = updatedOrder;

            // Send shipping email if status changes
            if (updates.status === 'Shipped' && oldStatus !== 'Shipped') {
                const emailBody = `
                    Hi ${updatedOrder.clientName},
                    
                    Great news! Your order #${updatedOrder.id} has been shipped.
                    
                    ${updatedOrder.shippingInfo ? 
                        `Carrier: ${updatedOrder.shippingInfo.carrier}
                         Tracking Number: ${updatedOrder.shippingInfo.trackingNumber}` 
                        : 'Tracking information will be updated shortly.'
                    }
                    
                    You can track your order status here: ${window.location.origin}#/track?id=${updatedOrder.id}
                    
                    Thanks,
                    The Pakomi Team
                `;
                sendEmail(updatedOrder.email, `Your Pakomi Order #${updatedOrder.id} Has Shipped!`, emailBody).catch(console.error);
            }
        }
    });
    writeDb(db);
};


// --- CHAT ---
export const getChatMessages = (orderId: string): ChatMessage[] => readDb().chats[orderId] || [];
export const addChatMessage = async (msg: Omit<ChatMessage, 'id'|'timestamp'|'fileUrl'|'fileName'|'fileType'>): Promise<ChatMessage> => {
    const db = readDb();
    let fileData: Partial<ChatMessage> = {};

    if (msg.file) {
        fileData.fileUrl = URL.createObjectURL(msg.file);
        fileData.fileName = msg.file.name;
        fileData.fileType = msg.file.type;
    }

    const newMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        ...msg,
        ...fileData,
        file: null, // Don't store the file object itself in localStorage
    };
    
    if (!db.chats[msg.orderId]) {
        db.chats[msg.orderId] = [];
    }
    db.chats[msg.orderId].push(newMessage);
    writeDb(db);
    return newMessage;
};

// --- AUTH ---
export const getCurrentUser = (): User | null => {
    try {
        const data = localStorage.getItem(CURRENT_USER_KEY);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        return null;
    }
};
export const login = (email: string, password: string): User => {
    const { users } = readDb();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.passwordHash !== password) { // Simple text comparison for this mock DB
        throw new Error('Invalid email or password');
    }
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    dispatchStorageEvent();
    return user;
};
export const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    dispatchStorageEvent();
};
export const registerUser = (name: string, email: string, password: string): User => {
    const db = readDb();
    if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('An account with this email already exists.');
    }
    const newUser: User = {
        id: `user-${Date.now()}`,
        name,
        email,
        passwordHash: password, // Not hashing in this mock DB
        roleId: CUSTOMER_ROLE_ID
    };
    db.users.push(newUser);
    writeDb(db);
    return newUser;
};

// --- USERS & ROLES (Admin) ---
export const getUsers = (): User[] => readDb().users;
export const updateUser = (updatedUser: User) => {
    const db = readDb();
    const index = db.users.findIndex(u => u.id === updatedUser.id);
    if (index > -1) {
        db.users[index] = updatedUser;
        writeDb(db);
    }
};
export const deleteUser = (userId: string) => {
    const db = readDb();
    db.users = db.users.filter(u => u.id !== userId);
    writeDb(db);
};

export const getRoles = (): Role[] => readDb().roles;
export const updateRole = (updatedRole: Role) => {
    const db = readDb();
    const index = db.roles.findIndex(r => r.id === updatedRole.id);
    if (index > -1) {
        db.roles[index] = updatedRole;
    } else {
        db.roles.push(updatedRole);
    }
    writeDb(db);
};
export const deleteRole = (roleId: string, t: (key: string, options?: any) => string) => {
    const db = readDb();
    const roleToDelete = db.roles.find(r => r.id === roleId);
    if (!roleToDelete) return;

    if (['Admin', 'Customer'].includes(roleToDelete.name)) {
        alert(t('cannotDeleteEssentialRole', { roleName: roleToDelete.name }));
        return;
    }

    // Reassign users with the deleted role to 'Customer'
    db.users = db.users.map(user => {
        if (user.roleId === roleId) {
            return { ...user, roleId: CUSTOMER_ROLE_ID };
        }
        return user;
    });

    db.roles = db.roles.filter(r => r.id !== roleId);
    writeDb(db);
};

// --- REVIEWS ---
export const getReviews = (): Review[] => readDb().reviews;
export const addReview = (review: Review) => {
    const db = readDb();
    db.reviews.push(review);
    writeDb(db);
};

// --- TASKS ---
export const getTasks = (): Task[] => readDb().tasks;
export const updateTasks = (tasks: Task[]) => {
    const db = readDb();
    db.tasks = tasks;
    writeDb(db);
};

// --- FORM CONFIG ---
export const getFormConfig = (): FormConfig => readDb().formConfig;
export const updateFormConfig = (config: FormConfig) => {
    const db = readDb();
    db.formConfig = config;
    writeDb(db);
};
