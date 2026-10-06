import React from 'react';
import { AutoDetectionResult, ColumnMapping } from '../types';
import { Search, CheckCircle2, AlertTriangle, ShieldCheck, Database, Layers } from 'lucide-react';

interface ColumnDetectionSectionProps {
  autoDetection: AutoDetectionResult;
  columnMapping: ColumnMapping;
  onUpdateMapping: (newMapping: ColumnMapping) => void;
  columns: string[];
}

export const ColumnDetectionSection: React.FC<ColumnDetectionSectionProps> = ({
  autoDetection,
  columnMapping,
  onUpdateMapping,
  columns
}) => {
  const handleSelectChange = (key: keyof ColumnMapping, val: string) => {
    onUpdateMapping({
      ...columnMapping,
      [key]: val
    });
  };

  const getConfidenceBadge = (confidence?: 'high' | 'medium' | 'low') => {
    if (confidence === 'high') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> High Confidence Auto-Detected
        </span>
      );
    }
    if (confidence === 'medium') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
          <AlertTriangle className="w-3 h-3 text-amber-600" /> Medium Confidence Heuristic
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
        Manual Selection Recommended
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" /> Automatic Column Structure Detection
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            The system inspects column headers, data types, string length distribution, and value patterns to automatically map key dataset fields.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" /> Override anytime via dropdowns below
        </div>
      </div>

      {/* Grid of Column Mapping Dropdowns & Detection Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        
        {/* A. Review / Text Column */}
        <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/20 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-blue-900 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-blue-600" /> Review / Text Column *
            </label>
            {getConfidenceBadge(autoDetection.review?.confidence)}
          </div>

          <select
            value={columnMapping.reviewCol}
            onChange={(e) => handleSelectChange('reviewCol', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {columns.map(col => (
              <option key={col} value={col}>
                {col} {autoDetection.review?.detectedCol === col ? '(Auto-Detected)' : ''}
              </option>
            ))}
          </select>

          {autoDetection.review && (
            <div className="text-[11px] text-slate-600 space-y-1 bg-white/80 p-2.5 rounded-lg border border-slate-200">
              <div>Sample snippet: <span className="italic text-slate-800">"{autoDetection.review.sampleValues[0]?.slice(0, 45)}..."</span></div>
              <div className="text-slate-500">Unique text entries: {autoDetection.review.uniqueCount}</div>
            </div>
          )}
        </div>

        {/* B. Rating Column */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" /> Rating Column (Optional)
            </label>
            {getConfidenceBadge(autoDetection.rating?.confidence)}
          </div>

          <select
            value={columnMapping.ratingCol}
            onChange={(e) => handleSelectChange('ratingCol', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- None / No Rating Column --</option>
            {columns.map(col => (
              <option key={col} value={col}>
                {col} {autoDetection.rating?.detectedCol === col ? '(Auto-Detected)' : ''}
              </option>
            ))}
          </select>

          {autoDetection.rating && (
            <div className="text-[11px] text-slate-600 space-y-1 bg-white p-2.5 rounded-lg border border-slate-200">
              <div>Sample rating values: <span className="font-semibold text-slate-800">{autoDetection.rating.sampleValues.join(', ')}</span></div>
            </div>
          )}
        </div>

        {/* C. Product / Item Column */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              Product / Item Column
            </label>
            {getConfidenceBadge(autoDetection.product?.confidence)}
          </div>

          <select
            value={columnMapping.productCol}
            onChange={(e) => handleSelectChange('productCol', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- None / Single Item --</option>
            {columns.map(col => (
              <option key={col} value={col}>
                {col} {autoDetection.product?.detectedCol === col ? '(Auto-Detected)' : ''}
              </option>
            ))}
          </select>

          {autoDetection.product && (
            <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
              Sample items: <span className="font-semibold text-slate-800">{autoDetection.product.sampleValues.slice(0, 2).join(', ')}</span>
            </div>
          )}
        </div>

        {/* D. Date Column */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Date / Timestamp Column
          </label>
          <select
            value={columnMapping.dateCol}
            onChange={(e) => handleSelectChange('dateCol', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- None / No Date --</option>
            {columns.map(col => (
              <option key={col} value={col}>
                {col} {autoDetection.date?.detectedCol === col ? '(Auto-Detected)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* E. Category Column */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Category / Segment Column
          </label>
          <select
            value={columnMapping.categoryCol}
            onChange={(e) => handleSelectChange('categoryCol', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- None / Single Category --</option>
            {columns.map(col => (
              <option key={col} value={col}>
                {col} {autoDetection.category?.detectedCol === col ? '(Auto-Detected)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* F. Price Column */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Price / MSRP Column
          </label>
          <select
            value={columnMapping.priceCol}
            onChange={(e) => handleSelectChange('priceCol', e.target.value)}
            className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- None / No Price --</option>
            {columns.map(col => (
              <option key={col} value={col}>
                {col} {autoDetection.price?.detectedCol === col ? '(Auto-Detected)' : ''}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
};
