import React, { useState, useRef, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useTranslation } from "react-i18next";
import { Input } from "./input";
import { Button } from "./button";

// Custom debounce hook
const useDebounce = (callback: (value: string) => void, delay: number) => {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const debouncedCallback = useCallback(
    (value: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const newTimer = setTimeout(() => {
        callback(value);
      }, delay);

      setDebounceTimer(newTimer);
    },
    [callback, delay, debounceTimer]
  );

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return debouncedCallback;
};

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, placeholder, className = "", onClear }) => {
  const { t } = useTranslation('common');
  const [internalValue, setInternalValue] = useState(value);
  
  const defaultPlaceholder = placeholder || t('actions.search');

  // Debounced onChange to prevent excessive API calls
  const debouncedOnChange = useDebounce(onChange, 300);

  const handleClear = () => {
    setInternalValue("");
    onChange("");
    onClear?.();
  };

  const handleInputChange = (newValue: string) => {
    setInternalValue(newValue);
    debouncedOnChange(newValue);
  };

  // Sync internal value with external value changes
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Check if this is icon-only mode (when className contains specific dimensions)
  const isIconOnly = className.includes("w-12 h-12");
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  const handleIconClick = () => {
    if (isIconOnly) {
      setIsExpanded(true);
    }
  };

  const handleBlur = () => {
    if (isIconOnly && !internalValue) {
      setIsExpanded(false);
    }
  };

  if (isIconOnly) {
    return (
      <div className="relative">
        <AnimatePresence mode="wait">
          {!isExpanded ? (
            <motion.div
              key="search-icon"
              initial={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{
                duration: 0.2,
                ease: "easeOut",
              }}
              className={className}
            >
              <Button variant="outline" onClick={handleIconClick} className="w-12 h-12 p-0 rounded-full border-gray-300 hover:border-brand-deep-green-600 hover:bg-brand-deep-green-50 transition-colors duration-200" title={defaultPlaceholder}>
                <Search className="w-5 h-5 text-gray-600" />
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="search-input"
              initial={{
                scale: 0.8,
                opacity: 0,
                width: 48,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                width: 256,
              }}
              exit={{
                scale: 0.8,
                opacity: 0,
                width: 48,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
                width: {
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                },
              }}
              className="relative"
            >
              <div className="relative">
                <motion.div initial={{ x: -10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.2 }} className="absolute left-3 top-0 bottom-0 flex items-center justify-center w-6">
                  <Search className="text-gray-400 w-5 h-5" />
                </motion.div>
                <Input
                  ref={inputRef}
                  type="text"
                  value={internalValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  onBlur={handleBlur}
                  placeholder={defaultPlaceholder}
                  className="pl-11 pr-12 h-12 w-full border-gray-300 focus:border-brand-deep-green-600 focus:ring-brand-deep-green-600/20 rounded-lg"
                />
                <AnimatePresence>
                  {internalValue && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-3 top-0 bottom-0 flex items-center justify-center"
                    >
                      <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full transition-colors duration-150">
                        <X className="w-4 h-4 text-gray-400" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center w-6">
          <Search className="text-gray-400 w-5 h-5" />
        </div>
        <Input
          type="text"
          value={internalValue}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder={defaultPlaceholder}
          className="pl-11 pr-12 h-12 border-gray-300 focus:border-brand-deep-green-600 focus:ring-brand-deep-green-600/20 rounded-lg"
        />
        {internalValue && (
          <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="absolute right-3 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
