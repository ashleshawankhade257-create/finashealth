import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  showTagline?: boolean;
  variant?: 'standard' | 'icon-only' | 'full-graphic';
  to?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = true,
  variant = 'standard',
  to,
  className = '',
}) => {
  const sizeMap = {
    sm: { img: 'w-7 h-7', full: 'h-8', title: 'text-sm', tagline: 'text-[8px]' },
    md: { img: 'w-9 h-9', full: 'h-11', title: 'text-base', tagline: 'text-[9px]' },
    lg: { img: 'w-12 h-12', full: 'h-16', title: 'text-xl', tagline: 'text-[10px]' },
  };

  const { img, full, title, tagline } = sizeMap[size];

  if (variant === 'full-graphic') {
    const fullGraphic = (
      <div className={`inline-flex items-center justify-center p-1 rounded-2xl bg-white/95 dark:bg-white/90 shadow-md border border-pink-300/40 ${className}`}>
        <img
          src="/logo.png"
          alt="finashealth - Better Money • Healthier Future"
          className={`${full} w-auto object-contain`}
        />
      </div>
    );

    if (to) {
      return (
        <Link to={to} className="group inline-flex items-center">
          {fullGraphic}
        </Link>
      );
    }
    return fullGraphic;
  }

  const content = (
    <div className={`flex items-center space-x-2.5 ${className}`}>
      <div className={`${img} rounded-xl overflow-hidden bg-white/95 dark:bg-white/90 p-1 border border-pink-400/40 shadow-md shadow-pink-500/20 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105`}>
        <img
          src="/logo-icon.png"
          alt="finashealth icon"
          className="w-full h-full object-contain"
        />
      </div>

      {showText && variant !== 'icon-only' && (
        <div className="flex flex-col">
          <div className={`font-extrabold ${title} tracking-tight theme-title font-['Outfit'] leading-none`}>
            <span>finas</span>
            <span className="text-pink-500">health</span>
          </div>
          {showTagline && (
            <span className={`${tagline} text-pink-600 dark:text-pink-300 font-bold tracking-wider uppercase mt-1`}>
              Better Money • Healthier Future
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="group inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
};
