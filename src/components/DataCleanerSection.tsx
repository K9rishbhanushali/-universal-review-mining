import React from 'react';
import { CleanedReviewRow, CleaningConfig, CleaningMetrics } from '../types';
import { SlidersHorizontal, Download, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface DataCleanerSectionProps {
  config: CleaningConfig;
  onChangeConfig: (newConfig: CleaningConfig) => void;
  metrics: CleaningMetrics;
  sampleCleanedRows: CleanedReviewRow[];
  onDownloadCsv: () => void;
}

export const DataCleanerSection: React.FC<DataCleanerSectionProps> = ({
  config,
  onChangeConfig,
  metrics,
  sampleCleanedRows,
  onDownloadCsv
}) => {
  const handleToggle = (key: keyof CleaningConfig) => {
    onChangeConfig({
      ...config,
      [key]: !config[key]
    });
  };

  return (
    <div className="space-y-6">
      {/* Cleaning Config Controls & Before vs After Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Config Toggles */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-600" /> NLP & Data Cleaning Controls
            </h3>
            <span className="text-xs text-slate-500 font-medium">Recomputes in real-time</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer bg-slate-50/50">
              <input
                type="checkbox"
                checked={config.removeMissing}
                onChange={() => handleToggle('removeMissing')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">Remove Missing / Empty Reviews</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer bg-slate-50/50">
              <input
                type="checkbox"
                checked={config.removeDuplicates}
                onChange={() => handleToggle('removeDuplicates')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">Deduplicate Identical Text</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer bg-slate-50/50">
              <input
                type="checkbox"
                checked={config.removeHtml}
                onChange={() => handleToggle('removeHtml')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">Strip HTML Tags (&lt;br&gt;, &lt;p&gt;)</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer bg-slate-50/50">
              <input
                type="checkbox"
                checked={config.removeUrls}
                onChange={() => handleToggle('removeUrls')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">Strip Web URLs & Links</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer bg-slate-50/50">
              <input
                type="checkbox"
                checked={config.removeSpecialChars}
                onChange={() => handleToggle('removeSpecialChars')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">Remove Special Symbols & Punctuation</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200 hover:border-blue-300 cursor-pointer bg-slate-50/50">
              <input
                type="checkbox"
                checked={config.lowercaseText}
                onChange={() => handleToggle('lowercaseText')}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="font-medium text-slate-800">Lowercase Normalization</span>
            </label>
          </div>

          {/* Min Length & Custom Stopwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Min Review Length Threshold ({config.minLength} characters)
              </label>
              <input
                type="range"
                min="1"
                max="30"
                value={config.minLength}
                onChange={(e) => onChangeConfig({ ...config, minLength: Number(e.target.value) })}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Custom Stopwords (Comma-separated)
              </label>
              <input
                type="text"
                placeholder="e.g. phone, hotel, product, Samsung, Apple"
                value={config.customStopwords}
                onChange={(e) => onChangeConfig({ ...config, customStopwords: e.target.value })}
                className="w-full text-xs p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Cleaning Pipeline Summary Card */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Pipeline Transformation
            </h4>
            
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">Rows Before Cleaning:</span>
                <span className="font-mono font-bold text-slate-200">{metrics.rowsBefore.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">Rows After Cleaning:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{metrics.rowsAfter.toLocaleString()}</span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                <span className="text-slate-400">Total Filtered / Removed:</span>
                <span className="font-mono font-bold text-rose-400">-{metrics.rowsRemoved}</span>
              </div>

              <div className="text-[11px] text-slate-400 pt-1 space-y-1">
                <div>• Duplicates removed: {metrics.duplicatesRemoved}</div>
                <div>• Empty reviews removed: {metrics.emptyReviewsRemoved}</div>
                <div>• Short reviews removed (&lt;{config.minLength} chars): {metrics.shortReviewsRemoved}</div>
              </div>
            </div>
          </div>

          <button
            onClick={onDownloadCsv}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download Cleaned Dataset (.CSV)
          </button>
        </div>

      </div>

      {/* Side-by-Side Comparison Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ArrowRight className="w-4 h-4 text-blue-600" /> Before vs After Cleaning Transformation
          </h4>
          <span className="text-xs text-slate-500">Showing first {sampleCleanedRows.slice(0, 5).length} cleaned records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/80 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-12">#</th>
                <th className="p-3 w-2/5">Original Raw Review</th>
                <th className="p-3 w-2/5">Cleaned Text & Token Vector</th>
                <th className="p-3 w-24">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {sampleCleanedRows.slice(0, 5).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-mono text-slate-400">{row.id}</td>
                  <td className="p-3 text-slate-900 leading-relaxed">
                    {row.originalText}
                  </td>
                  <td className="p-3 bg-blue-50/20">
                    <div className="font-semibold text-blue-900 leading-relaxed">
                      {row.cleanText}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {row.tokens.slice(0, 8).map((tok, tidx) => (
                        <span key={tidx} className="bg-blue-100 text-blue-800 text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {tok}
                        </span>
                      ))}
                      {row.tokens.length > 8 && (
                        <span className="text-[10px] text-slate-400 font-mono">+{row.tokens.length - 8} more</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    {row.rating ? (
                      <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 font-bold text-xs">
                        {row.rating} ★
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
