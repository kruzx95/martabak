import React, { useRef, useEffect } from 'react';
import type { ProductCategory } from '../../types/pos';

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories: { key: string; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'manis', label: 'Manis' },
  { key: 'tipis_kering', label: 'Tipis Kering' },
  { key: 'asin_ayam', label: 'Asin (Ayam)' },
  { key: 'asin_sapi', label: 'Asin (Sapi)' },
];

export default function CategoryTabs({
  activeCategory,
  onCategoryChange,
}: CategoryTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const activeBtn = scrollRef.current.querySelector('[data-active="true"]');
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    }
  }, [activeCategory]);

  return (
    <div
      ref={scrollRef}
      className="sticky top-[60px] z-20 bg-slate-950/95 backdrop-blur border-b border-slate-800 px-3 py-2 flex gap-2 overflow-x-auto no-scrollbar"
    >
      {categories.map((cat) => (
        <button
          key={cat.key}
          data-active={activeCategory === cat.key ? 'true' : 'false'}
          onClick={() => onCategoryChange(cat.key)}
          className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all shrink-0 ${
            activeCategory === cat.key
              ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
        >
          {cat.label}
        </button>
      ))}

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
