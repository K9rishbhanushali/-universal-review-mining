import React from 'react';
import { AspectSentimentItem } from '../types';
import { Sliders, ThumbsUp, ThumbsDown, Layers } from 'lucide-react';

interface AspectSentimentSectionProps {
  aspects: AspectSentimentItem[];
}

export const AspectSentimentSection: React.FC<AspectSentimentSectionProps> = ({ aspects }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-blue-600" /> Aspect-Based Sentiment Analysis (ABSA)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Extracts customer opinions on specific product dimensions (e.g. Battery, Camera, Display, Food, Service, Cleanliness, Staff, Price).
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {aspects.length} Domain Aspects Discovered
          </span>
        </div>

        {/* Aspects List */}
        <div className="space-y-4 pt-1">
          {aspects.length > 0 ? (
            aspects.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{item.aspect}</span>
                    <span className="text-xs text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 font-mono">
                      {item.total} mentions
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold">
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {item.positivePct}% Positive ({item.positive})
                    </span>
                    <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                      {item.negativePct}% Negative ({item.negative})
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: `${item.positivePct}%` }} title={`Positive: ${item.positivePct}%`} />
                  <div className="bg-slate-400 h-full" style={{ width: `${100 - item.positivePct - item.negativePct}%` }} title="Neutral" />
                  <div className="bg-rose-500 h-full" style={{ width: `${item.negativePct}%` }} title={`Negative: ${item.negativePct}%`} />
                </div>

                {/* Sample Positive and Negative Quotes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  {item.samplePositive && item.samplePositive.length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-emerald-200/80 text-emerald-950 space-y-1">
                      <div className="font-bold text-[11px] text-emerald-700 flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" /> Positive Review Quote:
                      </div>
                      <p className="italic text-slate-800">"{item.samplePositive[0]}"</p>
                    </div>
                  )}

                  {item.sampleNegative && item.sampleNegative.length > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-rose-200/80 text-rose-950 space-y-1">
                      <div className="font-bold text-[11px] text-rose-700 flex items-center gap-1">
                        <ThumbsDown className="w-3.5 h-3.5 text-rose-600" /> Negative Complaint Quote:
                      </div>
                      <p className="italic text-slate-800">"{item.sampleNegative[0]}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400 italic py-6 text-center">No specific domain aspects detected in dataset tokens</div>
          )}
        </div>
      </div>
    </div>
  );
};
