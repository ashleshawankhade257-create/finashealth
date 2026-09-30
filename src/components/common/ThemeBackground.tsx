import React, { useMemo } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeBackground: React.FC = () => {
  const { config, isDark } = useTheme();
  const { wallpaperEnabled, wallpaperOpacity, wallpaperBlur, floatingParticles, preset } = config;

  const isPinkTheme = preset === 'light-pink' || preset === 'dark-rose-pink';
  const wallpaperUrl = isPinkTheme ? '/themes/light-pink-path.jpg' : '/themes/mystic-path.jpg';

  // Generate random particles / sakura petals
  const particles = useMemo(() => {
    return Array.from({ length: 26 }).map((_, i) => ({
      id: i,
      size: Math.random() * 5 + 3, // 3px - 8px
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      color: isPinkTheme
        ? i % 3 === 0
          ? 'rgba(251, 113, 133, 0.75)'
          : i % 3 === 1
          ? 'rgba(244, 114, 182, 0.8)'
          : 'rgba(253, 164, 175, 0.7)'
        : i % 3 === 0
        ? 'rgba(34, 211, 238, 0.7)'
        : i % 3 === 1
        ? 'rgba(192, 132, 252, 0.8)'
        : 'rgba(232, 121, 249, 0.7)',
      boxShadow: isPinkTheme
        ? i % 2 === 0
          ? '0 0 12px 2px rgba(244, 114, 182, 0.8)'
          : '0 0 10px 3px rgba(251, 113, 133, 0.7)'
        : i % 2 === 0
        ? '0 0 10px 2px rgba(6, 182, 212, 0.8)'
        : '0 0 12px 3px rgba(168, 85, 247, 0.8)',
      duration: Math.random() * 12 + 10,
      delay: Math.random() * 5,
    }));
  }, [isPinkTheme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* Dynamic Theme Base Background Fill */}
      <div className="absolute inset-0 theme-base-bg transition-colors duration-500" />

      {/* Wallpaper */}
      {wallpaperEnabled && (
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out"
          style={{
            backgroundImage: `url('${wallpaperUrl}')`,
            opacity: wallpaperOpacity / 100,
            filter: `blur(${wallpaperBlur}px)`,
            transform: 'scale(1.02)',
          }}
        />
      )}

      {/* Ambient Gradient Overlays for Depth & Cinematic Contrast */}
      {isDark ? (
        <>
          {/* Dark Mode Overlays */}
          <div
            className={`absolute top-0 inset-x-0 h-96 bg-gradient-to-b ${
              isPinkTheme ? 'from-pink-950/40 via-rose-950/20' : 'from-purple-950/40 via-violet-900/10'
            } to-transparent transition-opacity duration-500`}
          />
          <div
            className={`absolute bottom-0 inset-x-0 h-96 bg-gradient-to-t ${
              isPinkTheme ? 'from-rose-950/40 via-pink-900/15' : 'from-cyan-950/40 via-teal-900/10'
            } to-transparent transition-opacity duration-500`}
          />
          <div
            className={`absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,${
              isPinkTheme ? 'rgba(244,114,182,0.12)' : 'rgba(168,85,247,0.12)'
            },transparent_70%)]`}
          />
        </>
      ) : (
        <>
          {/* Light Theme Ethereal / Sakura Mist Gradients */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${
              isPinkTheme ? 'from-pink-100/60 via-rose-50/40 to-pink-50/70' : 'from-purple-50/70 via-transparent to-cyan-50/60'
            }`}
          />
          <div
            className={`absolute inset-0 bg-[radial-gradient(ellipse_70%_70%_at_50%_10%,${
              isPinkTheme ? 'rgba(244,114,182,0.18)' : 'rgba(192,132,252,0.15)'
            },transparent_70%)]`}
          />
        </>
      )}

      {/* Subtle Floating Sakura Petals / Particles */}
      {floatingParticles && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full animate-float-mystic"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: p.left,
                top: p.top,
                backgroundColor: p.color,
                boxShadow: p.boxShadow,
                animationDuration: `${p.duration}s`,
                animationDelay: `-${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
