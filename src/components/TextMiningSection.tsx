import React, { useState } from 'react';
import { TextMiningResult } from '../types';
import { FileText, Sparkles, Hash, BarChart } from 'lucide-react';

interface TextMiningSectionProps {
  textMining: TextMiningResult;
}

export const TextMiningSection: React.FC<TextMiningSectionProps> = ({ textMining }) => {
  const [cloudFilter, setCloudFilter] = useState<'all' | 'positive' | 'negative'>('all');

  const activeCloud =
    cloudFilter === 'positive'
      ? textMining.wordCloudPositive
      : cloudFilter === 'negative'
      ? textMining.wordCloudNegative
      : textMining.wordCloudAll;

  const maxCloudValue = Math.max(...activeCloud.map(w => w.value), 1);

  return (
    <div className="space-y-6">
      {/* WordCloud Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> Interactive WordCloud Generator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizes the most prominent tokens weighted by frequency and sentiment polarity.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setCloudFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                cloudFilter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => setCloudFilter('positive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                cloudFilter === 'positive' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Positive Words
            </button>
            <button
              onClick={() => setCloudFilter('negative')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                cloudFilter === 'negative' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Negative Words
            </button>
          </div>
        </div>

        {/* WordCloud Render Area */}
        <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-center gap-3 min-h-[220px]">
          {activeCloud.length > 0 ? (
            activeCloud.map((item, idx) => {
              // Scale font size between 12px and 38px
              const size = Math.max(12, Math.min(38, 12 + (item.value / maxCloudValue) * 26));
              return (
                <span
                  key={idx}
                  style={{
                    fontSize: `${size}px`,
                    color: item.color,
                    fontWeight: size > 24 ? 800 : size > 18 ? 600 : 400
                  }}
                  className="hover:scale-110 transition-transform cursor-pointer px-2 py-1 select-none"
                  title={`${item.text}: ${item.value} occurrences`}
                >
                  {item.text}
                </span>
              );
            })
          ) : (
            <div className="text-xs text-slate-400 italic">No tokens available for selected filter</div>
          )}
        </div>
      </div>

      {/* Word Frequencies & N-Grams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Top 10 Words */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <Hash className="w-4 h-4 text-blue-600" /> Top Frequent Words
          </h4>
          <div className="space-y-2">
            {textMining.frequentWords.slice(0, 10).map((w, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-slate-800">{idx + 1}. {w.word}</span>
                <span className="font-mono font-bold text-blue-600">{w.count}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Bigrams (2-word phrases) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <FileText className="w-4 h-4 text-indigo-600" /> Top Bigrams (2-Word Phrases)
          </h4>
          <div className="space-y-2">
            {textMining.bigrams.slice(0, 10).map((bg, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-indigo-900">"{bg.ngram}"</span>
                <span className="font-mono font-bold text-indigo-600">{bg.count}x</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Trigrams (3-word phrases) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2 pb-2 border-b border-slate-100">
            <BarChart className="w-4 h-4 text-purple-600" /> Top Trigrams (3-Word Phrases)
          </h4>
          <div className="space-y-2">
            {textMining.trigrams.slice(0, 10).map((tg, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50">
                <span className="font-semibold text-purple-900">"{tg.ngram}"</span>
                <span className="font-mono font-bold text-purple-600">{tg.count}x</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* TF-IDF Term Weight Matrix Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-sm">TF-IDF Term Importance Weights</h4>
          <span className="text-xs text-slate-500">Term Frequency × Inverse Document Frequency</span>
        </div>

        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {textMining.tfidfWords.slice(0, 15).map((tf, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-center">
              <div className="font-bold text-xs text-slate-900 truncate">{tf.word}</div>
              <div className="font-mono font-extrabold text-blue-600 text-sm mt-1">{tf.score}</div>
              <div className="text-[10px] text-slate-400">TF-IDF Score</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
