import React from 'react';
import { SentimentAnalysisResult } from '../types';
import { Activity, Target, CheckCircle2, XCircle, AlertTriangle, Cpu } from 'lucide-react';

interface SentimentSectionProps {
  sentiment: SentimentAnalysisResult;
}

export const SentimentSection: React.FC<SentimentSectionProps> = ({ sentiment }) => {
  const { mlMetrics, annotatedRows } = sentiment;

  return (
    <div className="space-y-6">
      {/* Top Sentiment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Positive Sentiment</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 mt-2">
            {sentiment.positiveCount} <span className="text-sm font-normal text-slate-500">({sentiment.positivePct}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${sentiment.positivePct}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Negative Sentiment</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-600 mt-2">
            {sentiment.negativeCount} <span className="text-sm font-normal text-slate-500">({sentiment.negativePct}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-rose-500 rounded-full" style={{ width: `${sentiment.negativePct}%` }} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-semibold uppercase flex items-center justify-between">
            <span>Neutral Sentiment</span>
            <AlertTriangle className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold text-slate-800 mt-2">
            {sentiment.neutralCount} <span className="text-sm font-normal text-slate-500">({sentiment.neutralPct}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full mt-3 overflow-hidden">
            <div className="h-full bg-slate-400 rounded-full" style={{ width: `${sentiment.neutralPct}%` }} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm">
          <div className="text-xs text-blue-300 font-semibold uppercase flex items-center justify-between">
            <span>Mean Sentiment Index</span>
            <Activity className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">
            {sentiment.avgSentimentScore} <span className="text-xs text-slate-400 font-normal">/ +1.0</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 leading-tight">
            Lexicon VADER compound polarity score calculated across token vectors.
          </p>
        </div>
      </div>

      {/* Machine Learning Model Performance Metrics */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-600" /> Machine Learning Classifier Performance Evaluation
          </h4>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            Train/Test Split Evaluated
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Accuracy</div>
            <div className="text-2xl font-bold text-blue-600 mt-0.5">{(mlMetrics.accuracy * 100).toFixed(1)}%</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Precision</div>
            <div className="text-2xl font-bold text-emerald-600 mt-0.5">{(mlMetrics.precision * 100).toFixed(1)}%</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">Recall</div>
            <div className="text-2xl font-bold text-purple-600 mt-0.5">{(mlMetrics.recall * 100).toFixed(1)}%</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-[11px] text-slate-500 font-semibold uppercase">F1 Score</div>
            <div className="text-2xl font-bold text-amber-600 mt-0.5">{(mlMetrics.f1Score * 100).toFixed(1)}%</div>
          </div>
        </div>

        {/* Confusion Matrix Table */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-slate-500" /> Confusion Matrix (True Class vs Predicted Class)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-center font-semibold">
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              <div>True Positive (TP)</div>
              <div className="text-lg font-bold mt-0.5">{mlMetrics.tp}</div>
            </div>
            <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200">
              <div>False Positive (FP)</div>
              <div className="text-lg font-bold mt-0.5">{mlMetrics.fp}</div>
            </div>
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl border border-rose-200">
              <div>False Negative (FN)</div>
              <div className="text-lg font-bold mt-0.5">{mlMetrics.fn}</div>
            </div>
            <div className="p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-200">
              <div>True Negative (TN)</div>
              <div className="text-lg font-bold mt-0.5">{mlMetrics.tn}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Annotated Reviews Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-sm">Annotated Sentiment Classifications</h4>
          <span className="text-xs text-slate-500">Showing first {annotatedRows.slice(0, 8).length} reviews</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Review Snippet</th>
                <th className="p-3">Predicted Sentiment</th>
                <th className="p-3">Polarity Score</th>
                <th className="p-3">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {annotatedRows.slice(0, 8).map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 text-slate-900 leading-relaxed font-medium">
                    "{row.originalText}"
                  </td>
                  <td className="p-3">
                    {row.sentiment === 'positive' && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" /> POSITIVE
                      </span>
                    )}
                    {row.sentiment === 'negative' && (
                      <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px] inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" /> NEGATIVE
                      </span>
                    )}
                    {row.sentiment === 'neutral' && (
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                        NEUTRAL
                      </span>
                    )}
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-800">
                    {row.sentimentScore !== undefined ? (row.sentimentScore > 0 ? `+${row.sentimentScore}` : row.sentimentScore) : '0.0'}
                  </td>
                  <td className="p-3 font-bold text-amber-600">
                    {row.rating ? `${row.rating} ★` : 'N/A'}
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
