import React from 'react';
import { PlotlyChart } from '../PlotlyChart';
import { CleanedReviewRow, SentimentAnalysisResult } from '../../types';

interface SentimentTabProps {
  rows: CleanedReviewRow[];
  sentiment: SentimentAnalysisResult;
}

export const SentimentTab: React.FC<SentimentTabProps> = ({ rows, sentiment }) => {
  // 13. Pie Chart: Positive vs Neutral vs Negative
  const chart13Data: Plotly.Data[] = [
    {
      type: 'pie',
      labels: ['Positive', 'Neutral', 'Negative'],
      values: [sentiment.positiveCount, sentiment.neutralCount, sentiment.negativeCount],
      marker: { colors: ['#10b981', '#64748b', '#f43f5e'] },
      textinfo: 'label+percent',
    },
  ];

  // 14. Stacked Bar Chart: Sentiment by Product
  const prodMap: Record<string, { pos: number; neu: number; neg: number }> = {};
  rows.forEach(r => {
    const p = r.product || 'General';
    if (!prodMap[p]) prodMap[p] = { pos: 0, neu: 0, neg: 0 };
    if (r.sentiment === 'positive') prodMap[p].pos += 1;
    else if (r.sentiment === 'neutral') prodMap[p].neu += 1;
    else if (r.sentiment === 'negative') prodMap[p].neg += 1;
  });

  const topProds = Object.keys(prodMap).slice(0, 10);
  const chart14Data: Plotly.Data[] = [
    {
      type: 'bar',
      name: 'Positive',
      x: topProds,
      y: topProds.map(p => prodMap[p].pos),
      marker: { color: '#10b981' },
    },
    {
      type: 'bar',
      name: 'Neutral',
      x: topProds,
      y: topProds.map(p => prodMap[p].neu),
      marker: { color: '#64748b' },
    },
    {
      type: 'bar',
      name: 'Negative',
      x: topProds,
      y: topProds.map(p => prodMap[p].neg),
      marker: { color: '#f43f5e' },
    },
  ];

  // 15. Stacked Bar Chart: Sentiment by Category
  const catMap: Record<string, { pos: number; neu: number; neg: number }> = {};
  rows.forEach(r => {
    const c = r.category || 'General';
    if (!catMap[c]) catMap[c] = { pos: 0, neu: 0, neg: 0 };
    if (r.sentiment === 'positive') catMap[c].pos += 1;
    else if (r.sentiment === 'neutral') catMap[c].neu += 1;
    else if (r.sentiment === 'negative') catMap[c].neg += 1;
  });

  const catNames = Object.keys(catMap).slice(0, 8);
  const chart15Data: Plotly.Data[] = [
    {
      type: 'bar',
      name: 'Positive',
      x: catNames,
      y: catNames.map(c => catMap[c].pos),
      marker: { color: '#10b981' },
    },
    {
      type: 'bar',
      name: 'Neutral',
      x: catNames,
      y: catNames.map(c => catMap[c].neu),
      marker: { color: '#64748b' },
    },
    {
      type: 'bar',
      name: 'Negative',
      x: catNames,
      y: catNames.map(c => catMap[c].neg),
      marker: { color: '#f43f5e' },
    },
  ];

  // 16. Sunburst Chart: Category → Product → Sentiment
  const sunburstLabels: string[] = ['All Feedback'];
  const sunburstParents: string[] = [''];
  const sunburstValues: number[] = [rows.length];

  Object.entries(catMap).forEach(([catName, st]) => {
    const catTotal = st.pos + st.neu + st.neg;
    sunburstLabels.push(catName);
    sunburstParents.push('All Feedback');
    sunburstValues.push(catTotal);

    // Products in Category
    const catProds: Record<string, { pos: number; neu: number; neg: number }> = {};
    rows
      .filter(r => (r.category || 'General') === catName)
      .forEach(r => {
        const p = r.product || 'Product';
        if (!catProds[p]) catProds[p] = { pos: 0, neu: 0, neg: 0 };
        if (r.sentiment === 'positive') catProds[p].pos += 1;
        else if (r.sentiment === 'neutral') catProds[p].neu += 1;
        else if (r.sentiment === 'negative') catProds[p].neg += 1;
      });

    Object.entries(catProds).forEach(([pName, pSt]) => {
      const pLabel = `${pName} (${catName})`;
      const pTotal = pSt.pos + pSt.neu + pSt.neg;
      sunburstLabels.push(pLabel);
      sunburstParents.push(catName);
      sunburstValues.push(pTotal);

      if (pSt.pos > 0) {
        sunburstLabels.push(`Pos - ${pName}`);
        sunburstParents.push(pLabel);
        sunburstValues.push(pSt.pos);
      }
      if (pSt.neg > 0) {
        sunburstLabels.push(`Neg - ${pName}`);
        sunburstParents.push(pLabel);
        sunburstValues.push(pSt.neg);
      }
    });
  });

  const chart16Data: Plotly.Data[] = [
    {
      type: 'sunburst',
      labels: sunburstLabels,
      parents: sunburstParents,
      values: sunburstValues,
      textinfo: 'label+value',
      marker: { colorscale: 'Blues' },
    },
  ];

  // 17. Gauge Chart: Overall Customer Satisfaction Score
  const satisfactionScore = Math.round(sentiment.positivePct || 75);
  const chart17Data: Plotly.Data[] = [
    {
      type: 'indicator',
      mode: 'gauge+number+delta',
      value: satisfactionScore,
      title: { text: 'Overall CSAT Satisfaction Score (%)', font: { size: 14 } },
      delta: { reference: 70 },
      gauge: {
        axis: { range: [0, 100], tickwidth: 1, tickcolor: '#94a3b8' },
        bar: { color: '#10b981' },
        bgcolor: 'white',
        borderwidth: 2,
        bordercolor: '#e2e8f0',
        steps: [
          { range: [0, 45], color: '#fecdd3' },
          { range: [45, 70], color: '#fef08a' },
          { range: [70, 100], color: '#a7f3d0' },
        ],
        threshold: {
          line: { color: '#047857', width: 4 },
          thickness: 0.75,
          value: satisfactionScore,
        },
      },
    },
  ];

  // 18. Bubble Chart: Product vs Rating vs Review Count
  const bubbleProds = Object.keys(prodMap);
  const bubbleX: number[] = [];
  const bubbleY: number[] = [];
  const bubbleSize: number[] = [];
  const bubbleText: string[] = [];

  bubbleProds.forEach(p => {
    const pRows = rows.filter(r => (r.product || 'General') === p);
    const count = pRows.length;
    const avgRat = pRows.reduce((a, b) => a + (b.rating || 4), 0) / (count || 1);
    const posP = (pRows.filter(r => r.sentiment === 'positive').length / (count || 1)) * 100;

    bubbleX.push(Number(avgRat.toFixed(2)));
    bubbleY.push(Number(posP.toFixed(1)));
    bubbleSize.push(Math.max(12, Math.min(60, count * 3)));
    bubbleText.push(`${p} (${count} reviews)`);
  });

  const chart18Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: bubbleX,
      y: bubbleY,
      text: bubbleText,
      marker: {
        size: bubbleSize,
        color: bubbleY,
        colorscale: 'Viridis',
        showscale: true,
      },
    },
  ];

  // 34 & 35. Positive / Negative Reviews over Time
  const posDateMap: Record<string, number> = {};
  const negDateMap: Record<string, number> = {};
  rows.forEach(r => {
    if (r.date) {
      const d = String(r.date).slice(0, 7);
      if (r.sentiment === 'positive') posDateMap[d] = (posDateMap[d] || 0) + 1;
      if (r.sentiment === 'negative') negDateMap[d] = (negDateMap[d] || 0) + 1;
    }
  });

  const sortedDates = Array.from(new Set([...Object.keys(posDateMap), ...Object.keys(negDateMap)])).sort();

  const chart34Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Positive Reviews Trend',
      x: sortedDates,
      y: sortedDates.map(d => posDateMap[d] || 0),
      line: { color: '#10b981', width: 3 },
    },
  ];

  const chart35Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Negative Reviews Trend',
      x: sortedDates,
      y: sortedDates.map(d => negDateMap[d] || 0),
      line: { color: '#f43f5e', width: 3 },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 13: Pie Chart - Sentiment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>13. Positive vs Neutral vs Negative</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Pie Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Overall sentiment classification split.</p>
          </div>
          <PlotlyChart data={chart13Data} height={300} />
        </div>

        {/* Chart 17: Gauge Chart - CSAT Score */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>17. Customer Satisfaction Gauge Score</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Gauge Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Calculated composite CSAT score out of 100.</p>
          </div>
          <PlotlyChart data={chart17Data} height={300} />
        </div>

        {/* Chart 14: Stacked Bar Chart - Sentiment by Product */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>14. Sentiment Stacked by Product</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                Stacked Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Sentiment volume breakdown for each product.</p>
          </div>
          <PlotlyChart
            data={chart14Data}
            layout={{ barmode: 'stack', xaxis: { title: 'Product' }, yaxis: { title: 'Reviews' } }}
            height={300}
          />
        </div>

        {/* Chart 15: Stacked Bar Chart - Sentiment by Category */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>15. Sentiment Stacked by Category</span>
              <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                Stacked Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Sentiment composition per category segment.</p>
          </div>
          <PlotlyChart
            data={chart15Data}
            layout={{ barmode: 'stack', xaxis: { title: 'Category' }, yaxis: { title: 'Reviews' } }}
            height={300}
          />
        </div>

        {/* Chart 34: Positive Reviews over Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>34. Positive Reviews Over Time</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Line Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tracking positive sentiment trajectory.</p>
          </div>
          <PlotlyChart
            data={chart34Data}
            layout={{ xaxis: { title: 'Date' }, yaxis: { title: 'Positive Count' } }}
            height={300}
          />
        </div>

        {/* Chart 35: Negative Reviews over Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>35. Negative Reviews Over Time</span>
              <span className="text-[10px] bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                Line Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tracking churn/complaint spikes over time.</p>
          </div>
          <PlotlyChart
            data={chart35Data}
            layout={{ xaxis: { title: 'Date' }, yaxis: { title: 'Negative Count' } }}
            height={300}
          />
        </div>

      </div>

      {/* Chart 16: Sunburst Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>16. Category → Product → Sentiment Sunburst Drill-down</span>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
              Sunburst Chart
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Multi-level radial breakdown. Click segments to zoom in.</p>
        </div>
        <PlotlyChart data={chart16Data} height={420} />
      </div>

      {/* Chart 18: Bubble Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>18. Product vs Rating vs Review Count Bubble Matrix</span>
            <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
              Bubble Chart
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            X = Avg Rating, Y = % Positive Sentiment, Bubble Size = Review Volume.
          </p>
        </div>
        <PlotlyChart
          data={chart18Data}
          layout={{
            xaxis: { title: 'Average Star Rating', range: [1, 5.2] },
            yaxis: { title: 'Positive Sentiment %', range: [0, 105] },
          }}
          height={380}
        />
      </div>
    </div>
  );
};
