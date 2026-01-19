import { X } from 'lucide-react';
import { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    '6col': 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Background overlay - Glass design */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      ></div>

      {/* Modal panel */}
      <div className="flex items-center justify-center min-h-screen px-4 py-8">
        <div
          className={`relative bg-gray-800/90 backdrop-blur-xl dark:bg-gray-800/90 rounded shadow-large transform transition-all ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto border border-white/10 dark:border-white/10`}
          onClick={(e) => e.stopPropagation()}
          style={{ zIndex: 10000 }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gray-800/80 backdrop-blur-sm flex items-center justify-between px-6 py-4 border-b border-white/10 z-10">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

