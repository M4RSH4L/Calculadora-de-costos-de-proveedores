'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X, ChevronRight, Package, Tag } from 'lucide-react';
import { ProductNormalized } from '@/lib/types';
import { getSuggestions, searchProducts } from '@/lib/search';
import { formatPrice, getBrandConfig } from '@/lib/brands';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  products: ProductNormalized[];
  onSearch: (query: string, results: ProductNormalized[]) => void;
  onClear: () => void;
}

export default function SearchBar({ products, onSearch, onClear }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ProductNormalized[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const placeholders = [
    'Buscar alimento... (ej: Vitalcan Cachorro 15kg)',
    'Buscar por SKU... (ej: 132000)',
    'Buscar por marca... (ej: Purina, Vitalcan)',
    'Buscar producto... (ej: Nutrique Medium Puppy)',
    'Buscar por categoría... (ej: Excellent Dog)',
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (isFocused) return;
    const interval = setInterval(() => {
      setPlaceholderIndex(i => (i + 1) % placeholders.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused]);

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    setActiveIndex(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      onClear();
      return;
    }

    debounceRef.current = setTimeout(() => {
      const results = getSuggestions(value, products, 8);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    }, 80);
  }, [products, onClear]);

  const handleSubmit = useCallback((selectedQuery?: string) => {
    const q = selectedQuery ?? query;
    if (!q.trim()) return;
    const results = searchProducts(q, products);
    onSearch(q, results);
    setIsOpen(false);
    setSuggestions([]);
  }, [query, products, onSearch]);

  const handleSelectSuggestion = useCallback((product: ProductNormalized) => {
    setQuery(product.producto);
    const results = searchProducts(product.producto, products);
    onSearch(product.producto, results);
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.blur();
  }, [products, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter') handleSubmit();
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0) {
          handleSelectSuggestion(suggestions[activeIndex]);
        } else {
          handleSubmit();
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
    onClear();
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? <mark key={i} className={styles.highlight}>{part}</mark> : part
    );
  };

  return (
    <div className={styles.container} ref={containerRef}>
      <div className={`${styles.searchWrapper} ${isFocused ? styles.focused : ''}`}>
        <div className={styles.searchIcon}>
          <Search size={22} strokeWidth={2} />
        </div>

        <input
          ref={inputRef}
          id="main-search"
          type="text"
          value={query}
          onChange={e => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholders[placeholderIndex]}
          className={styles.input}
          autoComplete="off"
          spellCheck={false}
          aria-label="Buscar productos"
          aria-autocomplete="list"
          aria-expanded={isOpen}
        />

        {query && (
          <button
            className={styles.clearButton}
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        )}

        <button
          className={styles.searchButton}
          onClick={() => handleSubmit()}
          aria-label="Buscar"
        >
          <span>Buscar</span>
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      </div>

      {/* Shortcuts hint */}
      {isFocused && !isOpen && !query && (
        <div className={styles.hints}>
          <span className={styles.hint}><span className={styles.kbd}>↵</span> buscar</span>
          <span className={styles.hint}><span className={styles.kbd}>↑↓</span> navegar</span>
          <span className={styles.hint}><span className={styles.kbd}>Esc</span> cerrar</span>
        </div>
      )}

      {/* Autocomplete dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className={styles.dropdown} role="listbox">
          <div className={styles.dropdownHeader}>
            <span>Sugerencias</span>
            <span className={styles.count}>{suggestions.length} resultados</span>
          </div>
          {suggestions.map((product, index) => {
            const brand = getBrandConfig(product.marca);
            return (
              <button
                key={product.id}
                className={`${styles.suggestion} ${index === activeIndex ? styles.suggestionActive : ''}`}
                onClick={() => handleSelectSuggestion(product)}
                role="option"
                aria-selected={index === activeIndex}
              >
                <div
                  className={styles.suggestionBrand}
                  style={{ background: brand.gradient }}
                >
                  {brand.emoji}
                </div>
                <div className={styles.suggestionContent}>
                  <span className={styles.suggestionName}>
                    {highlightMatch(product.producto, query)}
                  </span>
                  <span className={styles.suggestionMeta}>
                    <Tag size={11} />
                    {product.sku}
                    <span className={styles.dot}>·</span>
                    {product.proveedorLabel}
                    {product.presentacion_kg && (
                      <>
                        <span className={styles.dot}>·</span>
                        {product.presentacion_kg < 1
                          ? `${product.presentacion_kg * 1000}g`
                          : `${product.presentacion_kg}kg`}
                      </>
                    )}
                  </span>
                </div>
                <div className={styles.suggestionPrice}>
                  <span className={styles.priceLabel}>c/ IVA</span>
                  <span className={styles.priceValue}>{formatPrice(product.precio_con_iva)}</span>
                </div>
              </button>
            );
          })}
          <button
            className={styles.seeAllBtn}
            onClick={() => handleSubmit()}
          >
            <Package size={14} />
            Ver todos los resultados para "{query}"
          </button>
        </div>
      )}
    </div>
  );
}
