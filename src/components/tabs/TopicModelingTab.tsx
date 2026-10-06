import React from 'react';
import { PlotlyChart } from '../PlotlyChart';
import { TopicInfo } from '../../types';

interface TopicModelingTabProps {
  topics: TopicInfo[];
}

export const TopicModelingTab: React.FC<TopicModelingTabProps> = ({ topics }) => {
  const safeTopics = topics && topics.length > 0 ? topics : [
    { id: 1, name: 'Battery & Battery Life', keywords: ['battery', 'charge', 'drain', 'life', 'day'], weight: 35, sampleReview: 'Battery lasts full day easily.' },
    { id: 2, name: 'Camera & Photo Quality', keywords: ['camera', 'photo', 'picture', 'night', 'lens'], weight: 28, sampleReview: 'Camera photos are super sharp.' },
    { id: 3, name: 'Display & Screen Clarity', keywords: ['screen', 'display', 'bright', 'color', 'oled'], weight: 22, sampleReview: 'Display is very bright outdoors.' },
    { id: 4, name: 'Performance & Gaming', keywords: ['speed', 'fast', 'lag', 'game', 'processor'], weight: 15, sampleReview: 'No lag while running heavy games.' },
  ];

  // 46. Bar Chart: Top Topics
  const chart46Data: Plotly.Data[] = [
    {
      type: 'bar',
      x: safeTopics.map(t => t.name),
      y: safeTopics.map(t => t.weight),
      marker: { color: '#8b5cf6' },
    },
  ];

  // 47. Treemap: Topic Keywords
  const treemapLabels: string[] = ['All Discovered Topics'];
  const treemapParents: string[] = [''];
  const treemapValues: number[] = [safeTopics.reduce((a, b) => a + b.weight, 0)];

  safeTopics.forEach(t => {
    treemapLabels.push(t.name);
    treemapParents.push('All Discovered Topics');
    treemapValues.push(t.weight);

    t.keywords.forEach((kw, kwIdx) => {
      treemapLabels.push(`${kw} (${t.name})`);
      treemapParents.push(t.name);
      treemapValues.push(Math.max(1, Math.round(t.weight / (kwIdx + 1))));
    });
  });

  const chart47Data: Plotly.Data[] = [
    {
      type: 'treemap',
      labels: treemapLabels,
      parents: treemapParents,
      values: treemapValues,
      textinfo: 'label+value',
      marker: { colorscale: 'Spectral' },
    },
  ];

  // 48. Bubble Chart: Topic Importance vs Keyword Count vs Weight
  const chart48Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'text+markers',
      x: safeTopics.map(t => t.id),
      y: safeTopics.map(t => t.weight),
      text: safeTopics.map(t => t.name),
      textposition: 'top center',
      marker: {
        size: safeTopics.map(t => Math.max(20, Math.min(70, t.weight * 1.8))),
        color: safeTopics.map(t => t.weight),
        colorscale: 'Plasma',
        showscale: true,
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Topic Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {safeTopics.map(t => (
          <div key={t.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  Topic #{t.id}
                </span>
                <span className="text-xs font-bold text-slate-500">{t.weight}% Weight</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mb-2">{t.name}</h4>
              <div className="flex flex-wrap gap-1 mb-3">
                {t.keywords.map(kw => (
                  <span key={kw} className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-2 line-clamp-2">
              "{t.sampleReview}"
            </div>
          </div>
        ))}
      </div>

      {/* Part 8 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 46. Bar Chart - Top Topics */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>46. Topic Prevalence &amp; Weight Distribution</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Discovered Latent Dirichlet Allocation (LDA) / NMF topic weights.</p>
          </div>
          <PlotlyChart
            data={chart46Data}
            layout={{ xaxis: { title: 'Topic Cluster' }, yaxis: { title: 'Topic Weight %' } }}
            height={300}
          />
        </div>

        {/* 48. Bubble Chart - Topic Importance */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>48. Topic Importance &amp; Weight Bubble Map</span>
              <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-semibold">
                Bubble Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Topic prevalence mapped to bubble scale.</p>
          </div>
          <PlotlyChart
            data={chart48Data}
            layout={{ xaxis: { title: 'Topic Cluster ID' }, yaxis: { title: 'Weight %' } }}
            height={300}
          />
        </div>

      </div>

      {/* 47. Treemap - Topic Keywords */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>47. Topic Keywords Hierarchy Treemap</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
              Interactive Treemap
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Visual decomposition of topic clusters into underlying token terms.</p>
        </div>
        <PlotlyChart data={chart47Data} height={380} />
      </div>
    </div>
  );
};
