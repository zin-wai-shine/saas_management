import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

export const Dropdown = ({ value, onChange, options, placeholder = 'Select...', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 border border-white/10 rounded bg-gray-800/20 backdrop-blur-md text-white focus:outline-none focus:border-teal-glass/50 focus:bg-gray-800/30 text-sm flex items-center justify-between gap-2 hover:bg-gray-800/30 transition-all"
      >
        <span className="flex-1 text-left">{selectedOption ? selectedOption.label : placeholder}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400 transition-transform duration-200" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 transition-transform duration-200" />
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800/90 backdrop-blur-md border border-white/10 rounded overflow-hidden">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option) => {
              const isSelected = value === option.value;
              
              return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-2 text-sm transition-all relative ${
                    isSelected
                      ? 'bg-teal-glass/20 text-teal-glass border-l-2 border-teal-glass'
                      : 'text-white hover:bg-gray-700/40'
                }`}
              >
                  <div className="flex items-center justify-between">
                    <span>{option.label}</span>
                    {isSelected && (
                      <Check className="w-4 h-4 text-teal-glass" />
                    )}
                  </div>
              </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

