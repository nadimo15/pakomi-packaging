import React, { useState, useEffect } from 'react';
import LanguageSwitcher from './LanguageSwitcher.tsx';
import { useLocalization } from '../hooks/useLocalization.ts';
import type { Language, SiteSettings } from '../types.ts';
import { useCart } from '../hooks/useCart.ts';
import { useAuth } from '../hooks/useAuth.ts';
import { CartIcon, MenuIcon, XIcon } from './Icons.tsx';
import { getSiteSettings } from '../api.ts';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  navigate: (path: string) => void;
}

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  navigate: (path: string) => void;
  onClick?: () => void;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, navigate, onClick, className = '' }) => (
  <a
    href={`#${href}`}
    onClick={(e) => {
      e.preventDefault();
      navigate(href);
      if (onClick) onClick();
    }}
    className={className || "text-sm font-medium text-gray-600 hover:text-primary transition-colors"}
  >
    {children}
  </a>
);

const Header: React.FC<HeaderProps> = ({ language, setLanguage, navigate }) => {
  const { t } = useLocalization(language);
  const { itemCount } = useCart();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const { currentUser, currentUserRole, logout, isLoading: isAuthLoading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const siteSettings = await getSiteSettings();
        setSettings(siteSettings);
      } catch (error) {
        console.error("Failed to fetch site settings for header:", error);
      }
    };
    fetchSettings();

    const handleStorageChange = async () => {
        const updatedSettings = await getSiteSettings();
        setSettings(updatedSettings);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);


  const isAdmin = currentUserRole && currentUserRole.permissions.length > 0;

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    navigate('/'); // Redirect to home after logout
  };

  const commonNavLinks = (isMobile: boolean) => (
    <>
      {!isAuthLoading && (
        <>
          {currentUser ? (
            <>
              <NavLink href="/profile" navigate={navigate} onClick={() => setIsMenuOpen(false)} className={isMobile ? 'text-2xl text-gray-800' : undefined}>{t('myAccount')}</NavLink>
              <button onClick={handleLogout} className={isMobile ? 'text-2xl text-gray-800' : "text-sm font-medium text-gray-600 hover:text-primary transition-colors"}>{t('logout')}</button>
            </>
          ) : (
            <>
              <NavLink href="/login" navigate={navigate} onClick={() => setIsMenuOpen(false)} className={isMobile ? 'text-2xl text-gray-800' : undefined}>{t('login')}</NavLink>
              <NavLink href="/register" navigate={navigate} onClick={() => setIsMenuOpen(false)} className={isMobile ? 'text-2xl text-gray-800' : undefined}>{t('signUp')}</NavLink>
            </>
          )}
        </>
      )}
      <NavLink href="/track" navigate={navigate} onClick={() => setIsMenuOpen(false)} className={isMobile ? 'text-2xl text-gray-800' : undefined}>{t('trackOrder')}</NavLink>
      {isAdmin && <NavLink href="/admin" navigate={navigate} onClick={() => setIsMenuOpen(false)} className={isMobile ? 'text-2xl text-gray-800' : undefined}>{t('adminPanel')}</NavLink>}
    </>
  );

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <a 
              href="#/"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              className={`text-2xl font-bold text-primary cursor-pointer flex items-center gap-2 ${language === 'en' ? 'font-display tracking-wide' : ''}`}
            >
              {settings?.logoB64 && <img src={settings.logoB64} alt="logo" className="h-8 w-auto" />}
              <span>{settings?.brandName || t('brandName')}</span>
            </a>
            <div className="flex items-center gap-2 md:gap-4">
               {/* Desktop Navigation */}
               <nav className="hidden md:flex items-center gap-6">
                  {commonNavLinks(false)}
               </nav>

              <a 
                href="#/cart"
                onClick={(e) => {e.preventDefault(); navigate('/cart');}}
                className="relative p-2 text-gray-600 hover:text-primary transition-colors"
                aria-label={t('shoppingCart')}
              >
                <CartIcon className="w-6 h-6" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
                    {itemCount}
                  </span>
                )}
              </a>
              <LanguageSwitcher currentLanguage={language} setLanguage={setLanguage} />

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="p-2 text-gray-600 hover:text-primary transition-colors md:hidden"
                aria-label="Open menu"
              >
                <MenuIcon className="w-6 h-6" />
              </button>

            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center md:hidden animate-fade-in-form">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-600 hover:text-primary"
              aria-label="Close menu"
            >
              <XIcon className="w-8 h-8" />
            </button>
            <nav className="flex flex-col items-center gap-8">
              {commonNavLinks(true)}
            </nav>
        </div>
      )}
    </>
  );
};

export default Header;
