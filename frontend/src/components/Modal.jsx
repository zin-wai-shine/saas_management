import { X } from 'lucide-react';
import { useEffect, useState } from 'react';

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setShouldRender(true);
      setIsAnimating(false);
      setContentVisible(false);
      
      // Staggered animation with delays for cool effect:
      // 1. Backdrop fades in (150ms delay)
      // 2. Modal bounces in (300ms delay)
      // 3. Content fades up (450ms delay)
      setTimeout(() => setIsAnimating(true), 150);
      setTimeout(() => setContentVisible(true), 400);
    } else {
      setIsAnimating(false);
      setContentVisible(false);
      // Wait for animation to complete before unmounting
      setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = 'unset';
      }, 500);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!shouldRender) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '6col': 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Background overlay - Glass design with fade-in animation */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-md transition-all duration-600 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0,
          transitionDuration: '600ms'
        }}
        onClick={onClose}
      ></div>

      {/* Modal panel with scale, fade, and bounce animation */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className={`relative bg-gray-800/90 backdrop-blur-xl dark:bg-gray-800/90 rounded border border-white/10 dark:border-white/10 shadow-xl ${
            sizeClasses[size]
          } w-full max-h-[90vh] overflow-hidden`}
          onClick={(e) => e.stopPropagation()}
          style={{ 
            zIndex: 10000,
            opacity: isAnimating ? 1 : 0,
            transform: isAnimating 
              ? 'scale(1) translateY(0)' 
              : 'scale(0.95) translateY(5px)',
            transition: 'all 0.4s ease-out',
            transitionDelay: isAnimating ? '0.1s' : '0s'
          }}
        >

          {/* Add keyframes animation */}
          <style>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(15px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .modal-content-enter {
              animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
          `}</style>
          {/* Header with fade-in animation */}
          {title && (
            <div 
              className="sticky top-0 bg-gray-800/80 backdrop-blur-sm flex items-center justify-between px-6 py-4 border-b border-white/10 z-10"
              style={{
                opacity: contentVisible ? 1 : 0,
                transform: contentVisible ? 'translateY(0)' : 'translateY(-10px)',
                transition: 'all 0.4s ease-out',
                transitionDelay: contentVisible ? '0.25s' : '0s'
              }}
            >
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-all p-1 hover:bg-white/10 rounded hover:rotate-90 duration-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          {!title && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 text-gray-500 hover:text-white transition-all p-1 hover:bg-white/10 rounded hover:rotate-90 duration-300"
              style={{
                opacity: contentVisible ? 1 : 0,
                transition: 'all 0.4s ease-out',
                transitionDelay: '0.5s'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Content with staggered fade-in animation */}
          <div 
            className={`px-6 py-4 ${
              contentVisible ? 'modal-content-enter' : ''
            }`}
            style={{
              opacity: contentVisible ? 1 : 0,
              transitionDelay: contentVisible ? '0.35s' : '0s'
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

