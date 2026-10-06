import React, { useState } from 'react';
import { PlotlyChart } from '../PlotlyChart';
import { AspectSentimentItem, CleanedReviewRow } from '../../types';
import { Trophy, Star, ArrowRightLeft } from 'lucide-react';

interface ProductAspectTabProps {
  aspects: AspectSentimentItem[];
  rows: CleanedReviewRow[];
}

export const ProductAspectTab: React.FC<ProductAspectTabProps> = ({ aspects, rows }) => {
  const safeAspects = aspects && aspects.length > 0 ? aspects : [
    { aspect: 'Battery Life', positive: 45, negative: 8, neutral: 5, total: 58, positivePct: 77.6, negativePct: 13.8, samplePositive: ['Battery lasts all day.'], sampleNegative: ['Slow charging.'] },
    { aspect: 'Camera Quality', positive: 52, negative: 4, neutral: 2, total: 58, positivePct: 89.6, negativePct: 6.9, samplePositive: ['Photos look stunning.'], sampleNegative: ['Night photos grainy.'] },
    { aspect: 'Build & Screen', positive: 38, negative: 12, neutral: 6, total: 56, positivePct: 67.8, negativePct: 21.4, samplePositive: ['Sleek metal body.'], sampleNegative: ['Scratches easily.'] },
    { aspect: 'Performance & Speed', positive: 48, negative: 6, neutral: 4, total: 58, positivePct: 82.7, negativePct: 10.3, samplePositive: ['Ultra fast apps.'], sampleNegative: ['Warms up gaming.'] },
  ];

  // 49. Heatmap: Aspect vs Sentiment
  const aspectNames = safeAspects.map(a => a.aspect);
  const matrixZ: number[][] = [
    safeAspects.map(a => a.positive),
    safeAspects.map(a => a.neutral),
    safeAspects.map(a => a.negative),
  ];

  const chart49Data: Plotly.Data[] = [
    {
      type: 'heatmap',
      z: matrixZ,
      x: aspectNames,
      y: ['Positive', 'Neutral', 'Negative'],
      colorscale: 'YlGnBu',
    },
  ];

  // 50. Horizontal Bar Chart: Positive Aspect Score
  const posSortedAspects = [...safeAspects].sort((a, b) => a.positivePct - b.positivePct);
  const chart50Data: Plotly.Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: posSortedAspects.map(a => a.positivePct),
      y: posSortedAspects.map(a => a.aspect),
      marker: { color: '#10b981' },
    },
  ];

  // 51. Horizontal Bar Chart: Negative Aspect Score
  const negSortedAspects = [...safeAspects].sort((a, b) => a.negativePct - b.negativePct);
  const chart51Data: Plotly.Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: negSortedAspects.map(a => a.negativePct),
      y: negSortedAspects.map(a => a.aspect),
      marker: { color: '#f43f5e' },
    },
  ];

  // 52. Radar Chart: Aspect Comparison
  const chart52Data: Plotly.Data[] = [
    {
      type: 'scatterpolar',
      r: safeAspects.map(a => a.positivePct),
      theta: safeAspects.map(a => a.aspect),
      fill: 'toself',
      name: 'Positive %',
      marker: { color: '#10b981' },
    },
    {
      type: 'scatterpolar',
      r: safeAspects.map(a => a.negativePct),
      theta: safeAspects.map(a => a.aspect),
      fill: 'toself',
      name: 'Negative %',
      marker: { color: '#f43f5e' },
    },
  ];

  // Product Comparison Logic (53, 54, 55)
  const productList = Array.from(new Set(rows.map(r => r.product || 'General').filter(Boolean)));
  const [prodA, setProdA] = useState<string>(productList[0] || 'Product A');
  const [prodB, setProdB] = useState<string>(productList[1] || productList[0] || 'Product B');

  const rowsA = rows.filter(r => (r.product || 'General') === prodA);
  const rowsB = rows.filter(r => (r.product || 'General') === prodB);

  const getProdStats = (pRows: CleanedReviewRow[]) => {
    const total = pRows.length || 1;
    const avgRat = pRows.reduce((a, b) => a + (b.rating || 0), 0) / (pRows.filter(r => r.rating).length || 1);
    const posPct = (pRows.filter(r => r.sentiment === 'positive').length / total) * 100;
    const negPct = (pRows.filter(r => r.sentiment === 'negative').length / total) * 100;
    const avgLen = Math.round(pRows.reduce((a, b) => a + (b.originalText?.length || 0), 0) / total);
    return {
      total,
      avgRat: Number(avgRat.toFixed(2)),
      posPct: Number(posPct.toFixed(1)),
      negPct: Number(negPct.toFixed(1)),
      avgLen,
    };
  };

  const statsA = getProdStats(rowsA);
  const statsB = getProdStats(rowsB);

  // 53. Grouped Bar Chart: Product Comparison
  const chart53Data: Plotly.Data[] = [
    {
      type: 'bar',
      name: prodA,
      x: ['Avg Rating (x20)', 'Positive %', 'Negative %', 'Review Count'],
      y: [statsA.avgRat * 20, statsA.posPct, statsA.negPct, statsA.total],
      marker: { color: '#6366f1' },
    },
    {
      type: 'bar',
      name: prodB,
      x: ['Avg Rating (x20)', 'Positive %', 'Negative %', 'Review Count'],
      y: [statsB.avgRat * 20, statsB.posPct, statsB.negPct, statsB.total],
      marker: { color: '#0d9488' },
    },
  ];

  // 54. Radar Chart: Product Feature Comparison
  const chart54Data: Plotly.Data[] = [
    {
      type: 'scatterpolar',
      r: [statsA.avgRat * 20, statsA.posPct, 100 - statsA.negPct, Math.min(100, statsA.total * 2)],
      theta: ['Rating Score', 'Customer Satisfaction', 'Quality Safety', 'Review Volume'],
      fill: 'toself',
      name: prodA,
      marker: { color: '#6366f1' },
    },
    {
      type: 'scatterpolar',
      r: [statsB.avgRat * 20, statsB.posPct, 100 - statsB.negPct, Math.min(100, statsB.total * 2)],
      theta: ['Rating Score', 'Customer Satisfaction', 'Quality Safety', 'Review Volume'],
      fill: 'toself',
      name: prodB,
      marker: { color: '#0d9488' },
    },
  ];

  return (
    <div className="space-y-6">
      {/* 55. Side-by-Side KPI Cards - Product A vs Product B Selector */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">55. Side-by-Side Product Benchmark</h3>
              <p className="text-xs text-slate-500">Select two products from your catalog to compare head-to-head.</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Product A</span>
              <select
                value={prodA}
                onChange={e => setProdA(e.target.value)}
                className="block w-40 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800"
              >
                {productList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <span className="text-xs font-bold text-slate-400 mt-4">VS</span>

            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">Product B</span>
              <select
                value={prodB}
                onChange={e => setProdB(e.target.value)}
                className="block w-40 bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs font-semibold text-slate-800"
              >
                {productList.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Side-by-Side Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Product A */}
          <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">{prodA}</span>
              <Trophy className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-indigo-100">
                <span className="text-[10px] text-slate-500">Avg Rating</span>
                <div className="font-bold text-slate-900 text-sm">{statsA.avgRat} ★</div>
              </div>
              <div className="bg-white p-2 rounded border border-indigo-100">
                <span className="text-[10px] text-slate-500">Positive %</span>
                <div className="font-bold text-emerald-600 text-sm">{statsA.posPct}%</div>
              </div>
              <div className="bg-white p-2 rounded border border-indigo-100">
                <span className="text-[10px] text-slate-500">Negative %</span>
                <div className="font-bold text-rose-600 text-sm">{statsA.negPct}%</div>
              </div>
              <div className="bg-white p-2 rounded border border-indigo-100">
                <span className="text-[10px] text-slate-500">Review Volume</span>
                <div className="font-bold text-slate-900 text-sm">{statsA.total} reviews</div>
              </div>
            </div>
          </div>

          {/* Card Product B */}
          <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-700">{prodB}</span>
              <Star className="w-4 h-4 text-teal-600" />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-teal-100">
                <span className="text-[10px] text-slate-500">Avg Rating</span>
                <div className="font-bold text-slate-900 text-sm">{statsB.avgRat} ★</div>
              </div>
              <div className="bg-white p-2 rounded border border-teal-100">
                <span className="text-[10px] text-slate-500">Positive %</span>
                <div className="font-bold text-emerald-600 text-sm">{statsB.posPct}%</div>
              </div>
              <div className="bg-white p-2 rounded border border-teal-100">
                <span className="text-[10px] text-slate-500">Negative %</span>
                <div className="font-bold text-rose-600 text-sm">{statsB.negPct}%</div>
              </div>
              <div className="bg-white p-2 rounded border border-teal-100">
                <span className="text-[10px] text-slate-500">Review Volume</span>
                <div className="font-bold text-slate-900 text-sm">{statsB.total} reviews</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Part 10 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 53. Grouped Bar Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>53. Grouped Bar Product Metric Comparison</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                Grouped Bar
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Comparing {prodA} vs {prodB} key metrics.</p>
          </div>
          <PlotlyChart data={chart53Data} height={300} />
        </div>

        {/* 54. Radar Chart - Product Feature Comparison */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>54. Product Feature Overlay Radar Chart</span>
              <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                Radar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Multi-axis overlay comparing product strengths.</p>
          </div>
          <PlotlyChart data={chart54Data} height={300} />
        </div>

      </div>

      {/* Part 9 Aspect Analysis Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 49. Heatmap: Aspect vs Sentiment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>49. Aspect vs Sentiment Heatmap Matrix</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                Heatmap
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Sentiment count breakdown per extracted feature aspect.</p>
          </div>
          <PlotlyChart data={chart49Data} height={300} />
        </div>

        {/* 52. Radar Chart: Aspect Comparison */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>52. Aspect Sentiment Balance Radar</span>
              <span className="text-[10px] bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full font-semibold">
                Radar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Positive vs Negative % profile across key feature aspects.</p>
          </div>
          <PlotlyChart data={chart52Data} height={300} />
        </div>

        {/* 50. Horizontal Bar: Positive Aspect Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>50. Positive Aspect Drivers Score</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Horizontal Bar
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Aspects ranked by positive customer sentiment ratio.</p>
          </div>
          <PlotlyChart
            data={chart50Data}
            layout={{ xaxis: { title: 'Positive %', range: [0, 100] }, yaxis: { title: '' } }}
            height={280}
          />
        </div>

        {/* 51. Horizontal Bar: Negative Aspect Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>51. Negative Aspect Friction Points Score</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                Horizontal Bar
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Aspects ranked by negative customer complaint ratio.</p>
          </div>
          <PlotlyChart
            data={chart51Data}
            layout={{ xaxis: { title: 'Negative %', range: [0, 100] }, yaxis: { title: '' } }}
            height={280}
          />
        </div>

      </div>
    </div>
  );
};
