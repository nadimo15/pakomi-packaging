import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization.ts';
import { getSiteSettings } from '../api.ts';
import type { Language, SiteSettings } from '../types.ts';
import { FacebookIcon, InstagramIcon, TikTokIcon, LinkedInIcon, YouTubeIcon, XIcon, PinterestIcon, LinkIcon } from './Icons.tsx';

const iconMap: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    tiktok: TikTokIcon,
    linkedin: LinkedInIcon,
    youtube: YouTubeIcon,
    x: XIcon,
    pinterest: PinterestIcon,
    website: LinkIcon,
};

const Footer: React.FC<{ language: Language }> = ({ language }) => {
    const { t } = useLocalization(language);
    const [settings, setSettings] = useState<SiteSettings | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const siteSettings = await getSiteSettings();
                setSettings(siteSettings);
            } catch (error) {
                console.error("Failed to fetch site settings for footer:", error);
            }
        };
        fetchSettings();
    }, []);


    if (!settings) return null;

    const { footer, brandName } = settings;

    return (
        <footer className="bg-gray-800 text-white mt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">{brandName || t('brandName')}</h3>
                        <p className="text-gray-400">Your one-stop shop for custom packaging solutions.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-gray-300">
                            {footer.address && <li>{footer.address}</li>}
                            {footer.email && <li><a href={`mailto:${footer.email}`} className="hover:text-primary">{footer.email}</a></li>}
                            {footer.phone && <li><a href={`tel:${footer.phone.replace(/\s/g, '')}`} className="hover:text-primary">{footer.phone}</a></li>}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            {footer.links.map(link => {
                                const Icon = iconMap[link.platform] || LinkIcon;
                                return (
                                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-colors">
                                        <Icon className="w-6 h-6" />
                                        <span className="sr-only">{link.platform}</span>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-500 text-sm">
                    <p>&copy; {new Date().getFullYear()} {brandName || t('brandName')}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
