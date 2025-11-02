import React, { useState, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import { getSiteSettings } from '../db';
import type { Language, SiteSettings } from '../types';
import { FacebookIcon, InstagramIcon, TikTokIcon, LinkedInIcon, YouTubeIcon, XIcon, PinterestIcon, LinkIcon } from './Icons';

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
    const [settings, setSettings] = useState<SiteSettings['footer'] | null>(null);

    useEffect(() => {
        const handleStorageChange = () => {
             setSettings(getSiteSettings().footer);
        };
        setSettings(getSiteSettings().footer);
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);


    if (!settings) return null;

    return (
        <footer className="bg-gray-800 text-white mt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-xl font-bold mb-4">{t('brandName')}</h3>
                        <p className="text-gray-400">Your one-stop shop for custom packaging solutions.</p>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-2 text-gray-300">
                            {settings.address && <li>{settings.address}</li>}
                            {settings.email && <li><a href={`mailto:${settings.email}`} className="hover:text-primary">{settings.email}</a></li>}
                            {settings.phone && <li><a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="hover:text-primary">{settings.phone}</a></li>}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
                        <div className="flex space-x-4">
                            {settings.links.map(link => {
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
                    <p>&copy; {new Date().getFullYear()} {t('brandName')}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;