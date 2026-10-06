import React, { useState } from 'react';
import {
  Filter,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Package,
  Folder,
  Star,
  Smile,
  Calendar,
  DollarSign,
  Type,
  Tag,
  Sparkles
} from 'lucide-react';
import { SentimentType } from '../types';

export interface DashboardFilterState {
  products: string[];
  categories: string[];
  ratings: number[];
  sentiments: SentimentType[];
  startDate: string;
  endDate: string;
  minPrice: number;
  maxPrice: number;
  minReviewLength: number;
  maxReviewLength: number;
  topics: string[];
  aspects: string[];
}

interface SidebarFiltersProps {
  filters: DashboardFilterState;
  onFilterChange: (newFilters: DashboardFilterState) => void;
  onResetFilters: () => void;
  availableProducts: string[];
  availableCategories: string[];
  availableTopics: string[];
  availableAspects: string[];
  minPriceLimit: number;
  maxPriceLimit: number;
  maxReviewLengthLimit: number;
  totalFilteredCount: number;
  totalRawCount: number;
}

export const SidebarFilters: React.FC<SidebarFiltersProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  availableProducts,
  availableCategories,
  availableTopics,
  availableAspects,
  minPriceLimit,
  maxPriceLimit,
  maxReviewLengthLimit,
  totalFilteredCount,
  totalRawCount,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const handleProductToggle = (prod: string) => {
    const exists = filters.products.includes(prod);
    const updated = exists
      ? filters.products.filter(p => p !== prod)
      : [...filters.products, prod];
    onFilterChange({ ...filters, products: updated });
  };

  const handleSelectAllProducts = () => {
    if (filters.products.length === availableProducts.length) {
      onFilterChange({ ...filters, products: [] });
    } else {
      onFilterChange({ ...filters, products: [...availableProducts] });
    }
  };

  const handleCategoryToggle = (cat: string) => {
    const exists = filters.categories.includes(cat);
    const updated = exists
      ? filters.categories.filter(c => c !== cat)
      : [...filters.categories, cat];
    onFilterChange({ ...filters, categories: updated });
  };

  const handleRatingToggle = (star: number) => {
    const exists = filters.ratings.includes(star);
    const updated = exists
      ? filters.ratings.filter(r => r !== star)
      : [...filters.ratings, star];
    onFilterChange({ ...filters, ratings: updated });
  };

  const handleSentimentToggle = (sent: SentimentType) => {
    const exists = filters.sentiments.includes(sent);
    const updated = exists
      ? filters.sentiments.filter(s => s !== sent)
      : [...filters.sentiments, sent];
    onFilterChange({ ...filters, sentiments: updated });
  };

  const handleTopicToggle = (topic: string) => {
    const exists = filters.topics.includes(topic);
    const updated = exists
      ? filters.topics.filter(t => t !== topic)
      : [...filters.topics, topic];
    onFilterChange({ ...filters, topics: updated });
  };

  const handleAspectToggle = (aspect: string) => {
    const exists = filters.aspects.includes(aspect);
    const updated = exists
      ? filters.aspects.filter(a => a !== aspect)
      : [...filters.aspects, aspect];
    onFilterChange({ ...filters, aspects: updated });
  };

  const activeFiltersCount =
    (filters.products.length > 0 ? 1 : 0) +
    (filters.categories.length > 0 ? 1 : 0) +
    (filters.ratings.length > 0 ? 1 : 0) +
    (filters.sentiments.length > 0 ? 1 : 0) +
    (filters.startDate ? 1 : 0) +
    (filters.endDate ? 1 : 0) +
    (filters.minPrice > minPriceLimit ? 1 : 0) +
    (filters.maxPrice < maxPriceLimit ? 1 : 0) +
    (filters.minReviewLength > 0 ? 1 : 0) +
    (filters.maxReviewLength < maxReviewLengthLimit ? 1 : 0) +
    (filters.topics.length > 0 ? 1 : 0) +
    (filters.aspects.length > 0 ? 1 : 0);

  if (isCollapsed) {
    return (
      <div className="bg-slate-900 text-white border-r border-slate-800 w-12 flex flex-col items-center py-4 space-y-6 shrink-0 transition-all duration-300">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors"
          title="Expand BI Filter Pane"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
        <div className="writing-mode-vertical rotate-180 text-xs font-bold uppercase tracking-widest text-slate-400 py-4 flex items-center space-x-2">
          <span>Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-500 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <aside className="bg-slate-900 text-slate-100 border-r border-slate-800 w-72 shrink-0 flex flex-col h-[calc(100vh-64px)] sticky top-16 shadow-xl transition-all duration-300 z-20">
      {/* Pane Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-sm tracking-wide text-white">BI Filter Slicers</span>
          {activeFiltersCount > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeFiltersCount} Active
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onResetFilters}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors"
            title="Reset All Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-md transition-colors"
            title="Collapse Filter Pane"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Status Badge */}
      <div className="px-4 py-2.5 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center justify-between text-xs">
        <span className="text-indigo-200 font-medium">Filtered Subset:</span>
        <span className="font-bold text-indigo-300">
          {totalFilteredCount.toLocaleString()} / {totalRawCount.toLocaleString()}
        </span>
      </div>

      {/* Scrollable Filter Controls */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
        
        {/* 1. Products Slicer */}
        <div>
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-2">
            <span className="flex items-center space-x-1.5">
              <Package className="w-3.5 h-3.5 text-indigo-400" />
              <span>Product</span>
            </span>
            <button
              onClick={handleSelectAllProducts}
              className="text-[10px] text-indigo-400 hover:underline"
            >
              {filters.products.length === availableProducts.length ? 'Clear All' : 'Select All'}
            </button>
          </div>
          <div className="max-h-32 overflow-y-auto bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-1">
            {availableProducts.map(p => {
              const isChecked = filters.products.length === 0 || filters.products.includes(p);
              return (
                <label
                  key={p}
                  className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer select-none py-0.5"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleProductToggle(p)}
                    className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                  />
                  <span className="truncate">{p}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. Category Slicer */}
        {availableCategories.length > 0 && (
          <div>
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-2">
              <Folder className="w-3.5 h-3.5 text-indigo-400" />
              <span>Category</span>
            </div>
            <div className="max-h-28 overflow-y-auto bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-1">
              {availableCategories.map(c => {
                const isChecked = filters.categories.length === 0 || filters.categories.includes(c);
                return (
                  <label
                    key={c}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer select-none py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleCategoryToggle(c)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                    />
                    <span className="truncate">{c}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Rating Slicer */}
        <div>
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-2">
            <Star className="w-3.5 h-3.5 text-amber-400" />
            <span>Star Rating</span>
          </div>
          <div className="grid grid-cols-5 gap-1 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            {[1, 2, 3, 4, 5].map(star => {
              const isSelected = filters.ratings.length === 0 || filters.ratings.includes(star);
              return (
                <button
                  key={star}
                  onClick={() => handleRatingToggle(star)}
                  className={`py-1.5 rounded text-center transition-colors font-semibold flex items-center justify-center space-x-0.5 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{star}</span>
                  <span className="text-[10px]">★</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Sentiment Slicer */}
        <div>
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-2">
            <Smile className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sentiment</span>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1.5 rounded-lg border border-slate-800">
            {[
              { id: 'positive', label: 'Positive', color: 'bg-emerald-600 text-white' },
              { id: 'neutral', label: 'Neutral', color: 'bg-slate-600 text-white' },
              { id: 'negative', label: 'Negative', color: 'bg-rose-600 text-white' }
            ].map(s => {
              const isSelected = filters.sentiments.length === 0 || filters.sentiments.includes(s.id as SentimentType);
              return (
                <button
                  key={s.id}
                  onClick={() => handleSentimentToggle(s.id as SentimentType)}
                  className={`py-1 rounded text-[11px] font-semibold transition-colors ${
                    isSelected
                      ? s.color
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Date Range Slicer */}
        <div>
          <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-2">
            <Calendar className="w-3.5 h-3.5 text-sky-400" />
            <span>Date Range</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="text-[10px] text-slate-400">Start Date</span>
              <input
                type="date"
                value={filters.startDate}
                onChange={e => onFilterChange({ ...filters, startDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <span className="text-[10px] text-slate-400">End Date</span>
              <input
                type="date"
                value={filters.endDate}
                onChange={e => onFilterChange({ ...filters, endDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-slate-200 text-[11px] focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 6. Price Range Slicer */}
        <div>
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-2">
            <span className="flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5 text-teal-400" />
              <span>Price Range</span>
            </span>
            <span className="text-[10px] text-teal-300 font-mono">
              ${filters.minPrice} - ${filters.maxPrice}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min={minPriceLimit}
              max={maxPriceLimit}
              value={filters.maxPrice}
              onChange={e => onFilterChange({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full accent-teal-500 cursor-pointer"
            />
          </div>
        </div>

        {/* 7. Review Length Slicer */}
        <div>
          <div className="flex items-center justify-between text-slate-300 font-semibold mb-2">
            <span className="flex items-center space-x-1.5">
              <Type className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Review Length</span>
            </span>
            <span className="text-[10px] text-fuchsia-300 font-mono">
              Max {filters.maxReviewLength} chars
            </span>
          </div>
          <input
            type="range"
            min={10}
            max={maxReviewLengthLimit}
            value={filters.maxReviewLength}
            onChange={e => onFilterChange({ ...filters, maxReviewLength: Number(e.target.value) })}
            className="w-full accent-fuchsia-500 cursor-pointer"
          />
        </div>

        {/* 8. Topic Slicer */}
        {availableTopics.length > 0 && (
          <div>
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-2">
              <Tag className="w-3.5 h-3.5 text-violet-400" />
              <span>Discovered Topics</span>
            </div>
            <div className="max-h-28 overflow-y-auto bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-1">
              {availableTopics.map(t => {
                const isChecked = filters.topics.length === 0 || filters.topics.includes(t);
                return (
                  <label
                    key={t}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer select-none py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTopicToggle(t)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                    />
                    <span className="truncate">{t}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

        {/* 9. Aspect Slicer */}
        {availableAspects.length > 0 && (
          <div>
            <div className="flex items-center space-x-1.5 text-slate-300 font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Aspects</span>
            </div>
            <div className="max-h-28 overflow-y-auto bg-slate-950/60 p-2 rounded-lg border border-slate-800 space-y-1">
              {availableAspects.map(a => {
                const isChecked = filters.aspects.length === 0 || filters.aspects.includes(a);
                return (
                  <label
                    key={a}
                    className="flex items-center space-x-2 text-slate-300 hover:text-white cursor-pointer select-none py-0.5"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleAspectToggle(a)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-900"
                    />
                    <span className="truncate">{a}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Pane Footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950 text-center">
        <button
          onClick={onResetFilters}
          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset All Filters</span>
        </button>
      </div>
    </aside>
  );
};
