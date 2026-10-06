import React from 'react';
import { PlotlyChart } from '../PlotlyChart';
import { TextMiningResult } from '../../types';

interface TextAnalysisTabProps {
  textMining: TextMiningResult;
}

export const TextAnalysisTab: React.FC<TextAnalysisTabProps> = ({ textMining }) => {
  // Helper to render WordCloud simulation using Treemap / Scatter / Word Tags
  const renderWordCloudBox = (title: string, words: { text: string; value: number; color?: string }[]) => {
    if (!words || words.length === 0) {
      return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center text-slate-400 text-xs">
          No words extracted for {title}.
        </div>
      );
    }

    const topWords = words.slice(0, 30);
    const maxVal = Math.max(...topWords.map(w => w.value)) || 1;

    return (
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col h-full">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">{title}</h4>
        <div className="flex-1 bg-slate-950 p-4 rounded-lg flex flex-wrap items-center justify-center gap-2 overflow-hidden min-h-[220px]">
          {topWords.map((w, idx) => {
            const relSize = Math.max(0.7, Math.min(2.2, (w.value / maxVal) * 2 + 0.6));
            return (
              <span
                key={idx}
                style={{
                  fontSize: `${relSize}rem`,
                  color: w.color || ['#38bdf8', '#34d399', '#f472b6', '#a78bfa', '#fbbf24', '#f87171'][idx % 6],
                  opacity: Math.max(0.65, w.value / maxVal),
                }}
                className="font-bold tracking-tight hover:scale-110 transition-transform cursor-pointer select-none px-1"
                title={`${w.text}: ${w.value} mentions`}
              >
                {w.text}
              </span>
            );
          })}
        </div>
      </div>
    );
  };

  // 22. Bar Chart: Top 20 Frequent Words
  const top20Words = textMining.frequentWords?.slice(0, 20) || [];
  const chart22Data: Plotly.Data[] = [
    {
      type: 'bar',
      x: top20Words.map(w => w.word),
      y: top20Words.map(w => w.count),
      marker: { color: '#6366f1' },
    },
  ];

  // 23. Horizontal Bar Chart: Top Positive Words
  const topPosWords = textMining.topPositiveWords?.slice(0, 15).reverse() || [];
  const chart23Data: Plotly.Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: topPosWords.map(w => w.count),
      y: topPosWords.map(w => w.word),
      marker: { color: '#10b981' },
    },
  ];

  // 24. Horizontal Bar Chart: Top Negative Words
  const topNegWords = textMining.topNegativeWords?.slice(0, 15).reverse() || [];
  const chart24Data: Plotly.Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: topNegWords.map(w => w.count),
      y: topNegWords.map(w => w.word),
      marker: { color: '#f43f5e' },
    },
  ];

  // 25. Bar Chart: Top 20 Bigrams
  const topBigrams = textMining.bigrams?.slice(0, 20) || [];
  const chart25Data: Plotly.Data[] = [
    {
      type: 'bar',
      x: topBigrams.map(b => b.ngram),
      y: topBigrams.map(b => b.count),
      marker: { color: '#8b5cf6' },
    },
  ];

  // 26. Bar Chart: Top 20 Trigrams
  const topTrigrams = textMining.trigrams?.slice(0, 20) || [];
  const chart26Data: Plotly.Data[] = [
    {
      type: 'bar',
      x: topTrigrams.map(t => t.ngram),
      y: topTrigrams.map(t => t.count),
      marker: { color: '#ec4899' },
    },
  ];

  // 27. Treemap: Most Mentioned Keywords
  const treemapWords = top20Words.slice(0, 15);
  const chart27Data: Plotly.Data[] = [
    {
      type: 'treemap',
      labels: ['Keywords', ...treemapWords.map(w => w.word)],
      parents: ['', ...treemapWords.map(() => 'Keywords')],
      values: [treemapWords.reduce((sum, w) => sum + w.count, 0), ...treemapWords.map(w => w.count)],
      textinfo: 'label+value',
      marker: { colorscale: 'Portland' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 19, 20, 21. WordCloud Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          {renderWordCloudBox(
            '19. WordCloud - All Frequent Words',
            textMining.wordCloudAll || []
          )}
        </div>
        <div>
          {renderWordCloudBox(
            '20. WordCloud - Positive Review Terms',
            textMining.wordCloudPositive || []
          )}
        </div>
        <div>
          {renderWordCloudBox(
            '21. WordCloud - Negative Review Terms',
            textMining.wordCloudNegative || []
          )}
        </div>
      </div>

      {/* Part 4 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 22. Bar Chart - Top 20 Frequent Words */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>22. Top 20 Frequent Words</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Most common single tokens across review text.</p>
          </div>
          <PlotlyChart
            data={chart22Data}
            layout={{ xaxis: { title: 'Word Token' }, yaxis: { title: 'Count' } }}
            height={300}
          />
        </div>

        {/* 23. Horizontal Bar Chart - Top Positive Words */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>23. Top Positive Driver Words</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Horizontal Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Most frequent terms inside positive feedback.</p>
          </div>
          <PlotlyChart
            data={chart23Data}
            layout={{ xaxis: { title: 'Count' }, yaxis: { title: '' } }}
            height={300}
          />
        </div>

        {/* 24. Horizontal Bar Chart - Top Negative Words */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>24. Top Negative Pain-Point Words</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                Horizontal Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Most frequent terms inside negative complaints.</p>
          </div>
          <PlotlyChart
            data={chart24Data}
            layout={{ xaxis: { title: 'Count' }, yaxis: { title: '' } }}
            height={300}
          />
        </div>

        {/* 25. Bar Chart - Top 20 Bigrams */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>25. Top 20 Bigrams (2-Word Phrases)</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Frequent 2-word phrase combinations.</p>
          </div>
          <PlotlyChart
            data={chart25Data}
            layout={{ xaxis: { title: 'Bigram Phrase' }, yaxis: { title: 'Count' } }}
            height={300}
          />
        </div>

        {/* 26. Bar Chart - Top 20 Trigrams */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>26. Top 20 Trigrams (3-Word Phrases)</span>
              <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-semibold">
                Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Frequent 3-word phrase combinations.</p>
          </div>
          <PlotlyChart
            data={chart26Data}
            layout={{ xaxis: { title: 'Trigram Phrase' }, yaxis: { title: 'Count' } }}
            height={300}
          />
        </div>

        {/* 27. Treemap - Most Mentioned Keywords */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>27. Most Mentioned Keywords Treemap</span>
              <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                Treemap
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Keywords scaled visually by occurrence weight.</p>
          </div>
          <PlotlyChart data={chart27Data} height={300} />
        </div>

      </div>
    </div>
  );
};
