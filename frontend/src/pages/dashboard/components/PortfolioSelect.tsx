import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface PortfolioOption {
  id: string;
  name: string;
}

interface PortfolioSelectProps {
  options: PortfolioOption[];
  value: string | null;
  onChange: (id: string) => void;
}

export default function PortfolioSelect({ options, value, onChange }: PortfolioSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.id === value);

  // Close when clicking outside.
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={containerRef} className="portfolio-select">
      <button
        type="button"
        className={`portfolio-select__trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="portfolio-select__value">{selected?.name ?? '—'}</span>
        <svg
          className={`portfolio-select__chevron${open ? ' is-open' : ''}`}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1L6 7L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            className="portfolio-select__list"
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {options.map((option) => {
              const isSelected = option.id === value;
              return (
                <li
                  key={option.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`portfolio-select__option${isSelected ? ' is-selected' : ''}`}
                  onClick={() => {
                    onChange(option.id);
                    setOpen(false);
                  }}
                >
                  {isSelected && (
                    <svg width="13" height="10" viewBox="0 0 13 10" fill="none" aria-hidden="true">
                      <path
                        d="M1 5L5 9L12 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {!isSelected && <span className="portfolio-select__optionSpacer" />}
                  {option.name}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

