import React from 'react';
import { EDAMetrics, SentimentAnalysisResult } from '../types';
import { BarChart3, Star, ShoppingBag, Layers, TrendingUp, Clock, AlignLeft, DollarSign } from 'lucide-react';

interface EDADashboardProps {
  eda: EDAMetrics;
  sentiment: SentimentAnalysisResult;
}

export const EDADashboard: React.FC<EDADashboardProps> = ({ eda, sentiment }) => {
  const maxRatingCount = Math.max(...eda.ratingDistribution.map(d => d.value), 1);
  const maxProdCount = Math.max(...eda.reviewsByProduct.map(d => d.value), 1);
  const maxCatCount = Math.max(...eda.reviewsByCategory.map(d => d.value), 1);
  const maxLenCount = Math.max(...eda.reviewLengthDistribution.map(d => d.value), 1);

  return (
    <div className="space-y-6">
      {/* 1. Top KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Total Reviews</span>
            <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {eda.totalReviews.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Dataset volume</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Avg Rating</span>
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-600 mt-1">
            {eda.avgRating} <span className="text-xs font-normal text-slate-400">/ 5</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Mean customer score</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Products</span>
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {eda.totalProducts || '1'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Catalog items</div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Categories</span>
            <Layers className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {eda.totalCategories || '1'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Product segments</div>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200/80 shadow-sm">
          <div className="text-[11px] text-emerald-800 font-bold uppercase">
            Positive Reviews
          </div>
          <div className="text-xl font-bold text-emerald-700 mt-1">
            {sentiment.positiveCount}
          </div>
          <div className="text-[10px] text-emerald-600 mt-0.5 font-semibold">{sentiment.positivePct}% of total</div>
        </div>

        <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-200/80 shadow-sm">
          <div className="text-[11px] text-rose-800 font-bold uppercase">
            Negative Reviews
          </div>
          <div className="text-xl font-bold text-rose-700 mt-1">
            {sentiment.negativeCount}
          </div>
          <div className="text-[10px] text-rose-600 mt-0.5 font-semibold">{sentiment.negativePct}% of total</div>
        </div>

        <div className="bg-slate-100 p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-[11px] text-slate-600 font-bold uppercase">
            Neutral Reviews
          </div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {sentiment.neutralCount}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">{sentiment.neutralPct}% of total</div>
        </div>
      </div>

      {/* 2. Interactive Chart Panels Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Chart 1: Rating Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> 1. Star Rating Distribution
            </h4>
            <span className="text-xs text-slate-400 font-mono">1 to 5 Stars</span>
          </div>

          <div className="space-y-3 pt-1">
            {eda.ratingDistribution.map((item, idx) => {
              const pct = Number(((item.value / (eda.totalReviews || 1)) * 100).toFixed(1));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.label}</span>
                    <span className="font-mono">{item.value} ({pct}%)</span>
                  </div>
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${(item.value / maxRatingCount) * 100}%`,
                        backgroundColor: item.color || '#2563eb'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chart 2: Reviews by Product */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-blue-600" /> 2. Review Volume by Product / Model
            </h4>
            <span className="text-xs text-slate-400 font-mono">Top Catalog Items</span>
          </div>

          <div className="space-y-3 pt-1">
            {eda.reviewsByProduct.length > 0 ? (
              eda.reviewsByProduct.map((prod, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span className="truncate max-w-[240px]" title={prod.label}>{prod.label}</span>
                    <span className="font-mono text-blue-600">{prod.value} reviews</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${(prod.value / maxProdCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic py-6 text-center">No specific product column detected</div>
            )}
          </div>
        </div>

        {/* Chart 3: Average Rating by Product */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" /> 3. Average Rating Score by Product
            </h4>
            <span className="text-xs text-slate-400 font-mono">Max 5.0</span>
          </div>

          <div className="space-y-3 pt-1">
            {eda.avgRatingByProduct.length > 0 ? (
              eda.avgRatingByProduct.map((prod, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-800">
                    <span className="truncate max-w-[240px]" title={prod.label}>{prod.label}</span>
                    <span className="font-mono text-emerald-600 font-bold">{prod.value} ★</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(prod.value / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-400 italic py-6 text-center">No product rating data available</div>
            )}
          </div>
        </div>

        {/* Chart 4: Review Length Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlignLeft className="w-4 h-4 text-purple-600" /> 4. Review Length Distribution Histogram
            </h4>
            <span className="text-xs text-slate-400 font-mono">Character Buckets</span>
          </div>

          <div className="space-y-3 pt-1">
            {eda.reviewLengthDistribution.map((bin, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>{bin.label}</span>
                  <span className="font-mono text-purple-600">{bin.value} reviews</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${(bin.value / maxLenCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Conditional Timeline & Price Scatter Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 5: Reviews over Time */}
        {eda.timelineData.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> 5. Review Volume Over Time
              </h4>
              <span className="text-xs text-slate-400">Monthly breakdown</span>
            </div>

            <div className="flex items-end gap-2 h-40 pt-4">
              {eda.timelineData.map((t, idx) => {
                const maxVal = Math.max(...eda.timelineData.map(d => d.value), 1);
                const barHeightPct = (t.value / maxVal) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.value}
                    </div>
                    <div className="w-full bg-slate-100 rounded-t overflow-hidden h-32 flex items-end">
                      <div
                        className="w-full bg-indigo-600 hover:bg-indigo-500 transition-all rounded-t"
                        style={{ height: `${barHeightPct}%` }}
                      />
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 truncate w-full text-center">
                      {t.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Chart 6: Rating vs Price Scatter */}
        {eda.ratingVsPriceData.length > 0 && (
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" /> 6. Rating vs Product Price Analysis
              </h4>
              <span className="text-xs text-slate-400">Correlation view</span>
            </div>

            <div className="space-y-2 pt-2 max-h-48 overflow-y-auto pr-1">
              {eda.ratingVsPriceData.map((pt, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                  <span className="font-medium text-slate-800 truncate max-w-[200px]">{pt.product}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-emerald-700 font-bold">${pt.price}</span>
                    <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{pt.rating} ★</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
