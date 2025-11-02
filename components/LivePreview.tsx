
import React, { useState, useRef, useEffect } from 'react';
import { useLocalization } from '../hooks/useLocalization';
import type { Language, CustomizationDetails, Product } from '../types';

interface LivePreviewProps {
  language: Language;
  details: CustomizationDetails;
  allProducts: Product[];
  onColorClick: () => void;
}

const LivePreview: React.FC<LivePreviewProps> = ({ language, details, allProducts, onColorClick }) => {
  const { t } = useLocalization(language);
  const { productType, color } = details;

  const [dynamicStyle, setDynamicStyle] = useState<React.CSSProperties & { '--light-x'?: string; '--light-y'?: string }>({});
  const animationFrame = useRef<number | null>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const product = allProducts.find(p => p.id === productType);
  const gallery = product?.galleryImagesB64 || [];

  useEffect(() => {
    // Reset to the first image when the product type changes
    setCurrentImageIndex(0);
  }, [productType]);


  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (animationFrame.current !== null) {
          cancelAnimationFrame(animationFrame.current);
      }
      animationFrame.current = requestAnimationFrame(() => {
          if (!previewContainerRef.current) return;
          const { clientX, clientY } = e;
          const { top, left, width, height } = previewContainerRef.current.getBoundingClientRect();
          
          const x = clientX - left;
          const y = clientY - top;

          const rotateY = (x - width / 2) / (width / 2) * 12; // Max 12 deg rotation
          const rotateX = -(y - height / 2) / (height / 2) * 12;

          const lightX = (x / width) * 100;
          const lightY = (y / height) * 100;

          setDynamicStyle({
              transform: `perspective(1500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
              '--light-x': `${lightX}%`,
              '--light-y': `${lightY}%`,
          });
      });
  };

  const handleMouseLeave = () => {
      if (animationFrame.current !== null) {
          cancelAnimationFrame(animationFrame.current);
      }
      setDynamicStyle({});
  };

  const renderDimensionsText = () => {
    let dims = [
        `${t('width')} ${details.width}cm`,
        `${t('height')} ${details.height}cm`
    ];
    if (details.productType.toLowerCase().includes('box') || details.productType.toLowerCase().includes('bag')) {
        dims.push(`${details.productType.toLowerCase().includes('bag') ? t('gusset') : t('depth')} ${details.depth}cm`);
    }
    return dims.join(` <span class="mx-1 text-gray-400">&times;</span> `);
  }
  
  const showColorOverlay = 
    (productType.toLowerCase().includes('box') && color !== '#D2B48C') ||
    (productType.toLowerCase().includes('bag') && color !== '#FFFFFF' && !productType.toLowerCase().includes('kraft')) ||
    (productType.toLowerCase().includes('mailer') && color !== '#FFFFFF') ||
    (productType.toLowerCase().includes('card'));

  return (
    <section aria-labelledby="live-preview-heading">
      <h3 id="live-preview-heading" className="text-xl font-semibold text-gray-800 mb-4 text-center sr-only">{t('livePreview')}</h3>
      <div 
        className="bg-slate-100 p-6 rounded-xl flex flex-col items-center justify-center"
      >
        <div 
            ref={previewContainerRef}
            className="relative w-full h-80 flex items-center justify-center group" 
            style={{ perspective: '1500px' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <div 
                className="relative w-full h-full transition-transform duration-300 ease-out"
                style={{ ...dynamicStyle, transformStyle: 'preserve-3d' }}
            >
                <div 
                    onClick={onColorClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onColorClick(); }}
                    aria-label={t('changeColor')}
                    className="absolute inset-0 cursor-pointer z-0"
                ></div>

                <img
                    src={gallery[currentImageIndex]}
                    alt={details.productName}
                    className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl"
                    style={{ transform: 'translateZ(0px)' }}
                />

                {showColorOverlay && (
                    <div
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    style={{
                        backgroundColor: color,
                        mixBlendMode: 'multiply',
                        opacity: productType.toLowerCase().includes('kraft') ? 0.7 : 1,
                        transform: 'translateZ(1px)',
                    }}
                    />
                )}

                <div 
                    className="absolute inset-0 w-full h-full rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at var(--light-x, 50%) var(--light-y, 50%), rgba(255, 255, 255, 0.3), transparent 50%)`,
                        transform: 'translateZ(50px)',
                    }}
                />
            </div>
        </div>
        
        {gallery.length > 1 && (
            <div className="flex justify-center gap-2 mt-4 p-2 bg-slate-200/50 rounded-lg">
                {gallery.map((imgSrc, index) => (
                    <button 
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-16 h-16 rounded-md p-1 transition-all duration-200 ${currentImageIndex === index ? 'bg-primary/20 ring-2 ring-primary' : 'bg-white hover:bg-slate-50'}`}
                        aria-label={`View image ${index + 1}`}
                    >
                        <img 
                            src={imgSrc} 
                            alt={`Product view ${index + 1}`} 
                            className="w-full h-full object-contain" 
                        />
                    </button>
                ))}
            </div>
        )}

        <div 
          className="w-full mt-6 text-center text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: renderDimensionsText() }}
          aria-live="polite"
        />
      </div>
    </section>
  );
};

export default LivePreview;
