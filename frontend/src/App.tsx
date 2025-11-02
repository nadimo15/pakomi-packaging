
import React, { useState, useEffect, useCallback } from 'react';
import Header from '../../components/Header.tsx';
import Footer from '../../components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import TrackOrderPage from './pages/TrackOrderPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import ThankYouPage from './pages/ThankYouPage.tsx';
import FeedbackPage from './pages/FeedbackPage.tsx';
import CartPage from './pages/CartPage.tsx';
import CheckoutPage from './pages/CheckoutPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import ProductCustomizationPage from './pages/ProductCustomizationPage.tsx';
import { Language } from '../../types.ts';
import { getSiteSettings } from './api.ts';
import { AuthProvider } from './context/AuthContext.tsx';
import { useAuth } from './hooks/useAuth.ts';

// Helper function to get the route from the URL hash
const getRouteFromHash = () => window.location.hash.substring(1) || '/';

const AdminRoute: React.FC<{ language: Language; navigate: (path: string) => void; }> = ({ language, navigate }) => {
    const { currentUser, currentUserRole, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) {
            return; // Wait until authentication check is complete
        }

        if (!currentUser) {
            // Not logged in, redirect to login
            navigate('/login');
        } else if (!currentUserRole || currentUserRole.permissions.length === 0) {
            // Logged in, but no permissions
            alert('Access Denied. You do not have permissions to view this page.');
            navigate('/profile');
        }
    }, [currentUser, currentUserRole, isLoading, navigate]);

    if (isLoading) {
        return <div className="text-center p-12">Loading...</div>;
    }

    // Render AdminPage only if authorized, otherwise render null while redirecting
    if (currentUser && currentUserRole && currentUserRole.permissions.length > 0) {
        return <AdminPage language={language} />;
    }

    return null;
};


function App() {
  const [language, setLanguage] = useState<Language>('ar');
  const [route, setRoute] = useState(getRouteFromHash());

  useEffect(() => {
    const fetchSettingsAndApply = async () => {
        try {
            const siteSettings = await getSiteSettings();
            if (!siteSettings) return;
            
            const { tracking } = siteSettings;
            
            // Clear previous scripts to avoid duplication on hot reload
            document.querySelectorAll('[data-tracking-script]').forEach(e => e.remove());

            if (tracking.googleAnalyticsId) {
                const gtagScript = document.createElement('script');
                gtagScript.async = true;
                gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${tracking.googleAnalyticsId}`;
                gtagScript.dataset.trackingScript = 'true';
                document.head.appendChild(gtagScript);

                const gtagConfigScript = document.createElement('script');
                gtagConfigScript.innerHTML = `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${tracking.googleAnalyticsId}');
                `;
                gtagConfigScript.dataset.trackingScript = 'true';
                document.head.appendChild(gtagConfigScript);
            }
            
            if (tracking.facebookPixelId) {
                const fbScript = document.createElement('script');
                fbScript.dataset.trackingScript = 'true';
                fbScript.innerHTML = `
                    !function(f,b,e,v,n,t,s)
                    {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                    n.queue=[];t=b.createElement(e);t.async=!0;
                    t.src=v;s=b.getElementsByTagName(e)[0];
                    s.parentNode.insertBefore(t,s)}(window, document,'script',
                    'https://connect.facebook.net/en_US/fbevents.js');
                    fbq('init', '${tracking.facebookPixelId}');
                    fbq('track', 'PageView');
                `;
                document.head.appendChild(fbScript);
            }
            
            if (tracking.tiktokPixelId) {
                const tiktokScript = document.createElement('script');
                tiktokScript.dataset.trackingScript = 'true';
                tiktokScript.innerHTML = `
                    !function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
                    ttq.load('${tracking.tiktokPixelId}');
                    ttq.page();
                  }(window,document,'ttq');
                `;
                document.head.appendChild(tiktokScript);
            }
            
            if (tracking.snapchatPixelId) {
                const snapchatScript = document.createElement('script');
                snapchatScript.dataset.trackingScript = 'true';
                snapchatScript.innerHTML = `
                    (function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function()
                    {a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};
                    a.queue=[];var s='https://sc-static.net/scevent.min.js';
                    var r=t.createElement('script');r.async=!0;r.src=s;
                    var u=t.getElementsByTagName('script')[0];
                    u.parentNode.insertBefore(r,u);})(window,document);
                    snaptr('init', '${tracking.snapchatPixelId}');
                    snaptr('track', 'PAGE_VIEW');
                `;
                document.head.appendChild(snapchatScript);
            }
        } catch(error) {
             console.error("Failed to fetch site settings for tracking scripts:", error);
        }
    };
    fetchSettingsAndApply();
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.body.className = language === 'ar' ? 'font-cairo bg-gray-50 text-gray-800' : 'font-sans bg-gray-50 text-gray-800';
  }, [language]);

  const navigate = useCallback((path: string) => {
    window.location.hash = path;
  }, []);

  const renderPage = () => {
    const pathOnly = route.split('?')[0];
    const pathParts = pathOnly.split('/').filter(Boolean);

    if (pathParts[0] === 'product' && pathParts[1]) {
      const productType = pathParts[1];
      return <ProductCustomizationPage language={language} productType={productType} navigate={navigate} />;
    }

    switch (pathOnly) {
      case '/track':
        return <TrackOrderPage language={language} navigate={navigate} />;
      case '/thankyou':
        return <ThankYouPage language={language} navigate={navigate} />;
      case '/feedback':
        return <FeedbackPage language={language} navigate={navigate} />;
      case '/admin':
        return <AdminRoute language={language} navigate={navigate} />;
      case '/cart':
        return <CartPage language={language} navigate={navigate} />;
      case '/checkout':
        return <CheckoutPage language={language} navigate={navigate} />;
      case '/login':
        return <LoginPage language={language} navigate={navigate} />;
      case '/register':
        return <RegisterPage language={language} navigate={navigate} />;
      case '/profile':
        return <ProfilePage language={language} navigate={navigate} />;
      case '/home':
      case '/':
      default:
        return <HomePage language={language} navigate={navigate} />;
    }
  };

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col">
        <Header language={language} setLanguage={setLanguage} navigate={navigate} />
        <main className="flex-grow">
          {renderPage()}
        </main>
        <Footer language={language} />
      </div>
    </AuthProvider>
  );
}

export default App;
