export interface Testimonial {
    quote: string;
    author: string;
    company: string;
    image: string; // URL or data URI
}

export const testimonials: Testimonial[] = [
    {
        quote: "The quality of the custom boxes we ordered was outstanding. Our products look so professional now. The team was incredibly helpful throughout the entire process.",
        author: "Sarah L.",
        company: "Glow & Co. Candles",
        image: "https://i.pravatar.cc/150?u=sarah"
    },
    {
        quote: "Pakoumi delivered exactly what we needed, on time and with excellent craftsmanship. Our new shopping bags have received so many compliments from customers!",
        author: "Ahmed K.",
        company: "Modern Threads Boutique",
        image: "https://i.pravatar.cc/150?u=ahmed"
    },
    {
        quote: "I was impressed by the live preview feature and the ease of customization. The final product was even better than I imagined. Highly recommend their services.",
        author: "Fatima A.",
        company: "Sweet Delights Bakery",
        image: "https://i.pravatar.cc/150?u=fatima"
    }
];
