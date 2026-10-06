import React from 'react';
import { RatingSentimentMatrix } from '../types';
import { Layers, AlertTriangle, Sparkles, HelpCircle } from 'lucide-react';

interface RatingSentimentSectionProps {
  matrixData: RatingSentimentMatrix;
}

export const RatingSentimentSection: React.FC<RatingSentimentSectionProps> = ({ matrixData }) => {
  const { matrix, mismatches } = matrixData;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Star Rating vs Text Sentiment Cross-Tabulation
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Analyzes how numerical star ratings align with the computed NLP sentiment of review texts.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            Computed from Dataset
          </span>
        </div>

        {/* Matrix Table / Heatmap */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 text-left">Star Rating</th>
                <th className="p-3 bg-emerald-50 text-emerald-800">Positive Count</th>
                <th className="p-3 bg-slate-50 text-slate-700">Neutral Count</th>
                <th className="p-3 bg-rose-50 text-rose-800">Negative Count</th>
                <th className="p-3">Total Reviews</th>
                <th className="p-3">Positive Alignment %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {matrix.map((row) => (
                <tr key={row.rating} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-left font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-amber-500 font-bold text-sm">{row.rating} ★</span>
                    <span className="text-slate-400 font-normal">
                      ({row.rating === 5 ? 'Exceptional' : row.rating === 4 ? 'Good' : row.rating === 3 ? 'Average' : row.rating === 2 ? 'Poor' : 'Terrible'})
                    </span>
                  </td>

                  <td className="p-3 font-semibold text-emerald-700 bg-emerald-50/40">
                    {row.positive}
                  </td>

                  <td className="p-3 font-semibold text-slate-600 bg-slate-50/40">
                    {row.neutral}
                  </td>

                  <td className="p-3 font-semibold text-rose-700 bg-rose-50/40">
                    {row.negative}
                  </td>

                  <td className="p-3 font-bold text-slate-900">
                    {row.total}
                  </td>

                  <td className="p-3 font-bold">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] ${
                      row.positivePct >= 60 ? 'bg-emerald-100 text-emerald-800' : row.negativePct >= 40 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {row.positivePct}% Pos
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sarcasm / Mismatch Detection Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Sarcasm & Rating-Sentiment Mismatch Detector
          </h4>
          <span className="text-xs text-slate-400 font-mono">{mismatches.length} flags detected</span>
        </div>

        {mismatches.length > 0 ? (
          <div className="space-y-3">
            {mismatches.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 text-xs text-slate-800 space-y-1">
                <div className="flex items-center justify-between font-bold">
                  <span className="text-amber-900 flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" /> Mismatch Flag #{idx + 1}
                  </span>
                  <span className="text-slate-600">Rating: {m.rating} ★ | NLP Sentiment: {m.sentiment.toUpperCase()}</span>
                </div>
                <p className="italic text-slate-900 font-medium">"{m.review}"</p>
                <div className="text-[11px] text-amber-800 font-medium">Reason: {m.reason}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            No severe rating-sentiment mismatches detected. Star ratings align closely with review text sentiment!
          </div>
        )}
      </div>
    </div>
  );
};
