import React from 'react';
import { PlotlyChart } from '../PlotlyChart';
import { CleanedReviewRow, EDAMetrics } from '../../types';

interface EDARatingTabProps {
  rows: CleanedReviewRow[];
  eda: EDAMetrics;
}

export const EDARatingTab: React.FC<EDARatingTabProps> = ({ rows }) => {
  // 8. Histogram - Rating Frequency
  const ratingsList = rows.map(r => r.rating).filter(r => r !== undefined && r !== null);
  const chart8Data: Plotly.Data[] = [
    {
      type: 'histogram',
      x: ratingsList,
      autobinx: false,
      xbins: { start: 0.5, end: 5.5, size: 1 },
      marker: { color: '#3b82f6' },
    },
  ];

  // 9. Box Plot - Rating Distribution by Product
  const prodGroups: Record<string, number[]> = {};
  rows.forEach(r => {
    if (r.rating) {
      const p = r.product || 'General';
      if (!prodGroups[p]) prodGroups[p] = [];
      prodGroups[p].push(Number(r.rating));
    }
  });

  const topProdsForBox = Object.keys(prodGroups).slice(0, 8);
  const chart9Data: Plotly.Data[] = topProdsForBox.map(pName => ({
    type: 'box',
    name: pName,
    y: prodGroups[pName],
    boxpoints: 'outliers',
  }));

  // 10. Violin Plot - Rating Distribution
  const chart10Data: Plotly.Data[] = [
    {
      type: 'violin',
      y: ratingsList,
      box: { visible: true },
      line: { color: '#6366f1' },
      meanline: { visible: true },
      fillcolor: '#e0e7ff',
    },
  ];

  // 11. Heatmap - Rating vs Sentiment
  const sentimentTypes = ['positive', 'neutral', 'negative'];
  const ratingStars = [1, 2, 3, 4, 5];
  const matrixZ: number[][] = sentimentTypes.map(s => {
    return ratingStars.map(star => {
      return rows.filter(r => r.sentiment === s && r.rating === star).length;
    });
  });

  const chart11Data: Plotly.Data[] = [
    {
      type: 'heatmap',
      z: matrixZ,
      x: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      y: ['Positive', 'Neutral', 'Negative'],
      colorscale: 'YlGnBu',
      hoverongaps: false,
    },
  ];

  // 12. Heatmap - Product vs Average Rating
  const prodNames = Object.keys(prodGroups).slice(0, 10);
  const avgMatrixZ: number[][] = [
    prodNames.map(p => {
      const arr = prodGroups[p];
      return arr.length > 0 ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0;
    }),
  ];

  const chart12Data: Plotly.Data[] = [
    {
      type: 'heatmap',
      z: avgMatrixZ,
      x: prodNames,
      y: ['Avg Rating'],
      colorscale: 'Viridis',
    },
  ];

  // 28. Scatter Plot - Price vs Rating
  const chart28Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: rows.map(r => r.price || 149),
      y: rows.map(r => r.rating || 4),
      text: rows.map(r => r.product || 'Product'),
      marker: {
        size: 10,
        color: rows.map(r => (r.rating && r.rating >= 4 ? '#10b981' : '#f43f5e')),
        opacity: 0.7,
      },
    },
  ];

  // 29. Scatter Plot - Review Length vs Rating
  const chart29Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: rows.map(r => (r.originalText ? r.originalText.length : 50)),
      y: rows.map(r => r.rating || 4),
      marker: {
        size: 8,
        color: '#8b5cf6',
        opacity: 0.6,
      },
    },
  ];

  // 32. Area Chart - Reviews over Time
  const dateMap: Record<string, number> = {};
  const dateRatingMap: Record<string, { sum: number; count: number }> = {};
  rows.forEach(r => {
    if (r.date) {
      const d = String(r.date).slice(0, 7);
      dateMap[d] = (dateMap[d] || 0) + 1;
      if (!dateRatingMap[d]) dateRatingMap[d] = { sum: 0, count: 0 };
      if (r.rating) {
        dateRatingMap[d].sum += Number(r.rating);
        dateRatingMap[d].count += 1;
      }
    }
  });

  const sortedDates = Object.keys(dateMap).sort();

  const chart32Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'lines',
      fill: 'tozeroy',
      x: sortedDates,
      y: sortedDates.map(d => dateMap[d]),
      line: { color: '#0ea5e9' },
    },
  ];

  // 33. Line Chart - Average Rating over Time
  const chart33Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'lines+markers',
      x: sortedDates,
      y: sortedDates.map(d => {
        const st = dateRatingMap[d];
        return st && st.count > 0 ? Number((st.sum / st.count).toFixed(2)) : 4.0;
      }),
      line: { color: '#f59e0b', width: 3 },
      marker: { size: 6 },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 8: Rating Frequency */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>8. Rating Frequency Histogram</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                Histogram
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Frequency distribution across star rating buckets.</p>
          </div>
          <PlotlyChart
            data={chart8Data}
            layout={{ xaxis: { title: 'Star Rating' }, yaxis: { title: 'Review Count' } }}
            height={300}
          />
        </div>

        {/* Chart 9: Box Plot - Rating Distribution by Product */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>9. Rating Box Plot by Product</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                Box Plot
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Median, quartiles, and rating dispersion across products.</p>
          </div>
          <PlotlyChart data={chart9Data} height={300} />
        </div>

        {/* Chart 10: Violin Plot - Rating Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>10. Overall Rating Density Violin Plot</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                Violin Plot
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Kernel density estimation of star rating distribution.</p>
          </div>
          <PlotlyChart data={chart10Data} height={300} />
        </div>

        {/* Chart 11: Heatmap - Rating vs Sentiment */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>11. Rating vs Sentiment Cross-Heatmap</span>
              <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                Heatmap
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Cross-tabulation of star ratings vs classified sentiment.</p>
          </div>
          <PlotlyChart data={chart11Data} height={300} />
        </div>

        {/* Chart 28: Scatter Plot - Price vs Rating */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>28. Price vs Rating Scatter Correlation</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Scatter Plot
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Examining price point elasticity against customer satisfaction.</p>
          </div>
          <PlotlyChart
            data={chart28Data}
            layout={{ xaxis: { title: 'Price ($)' }, yaxis: { title: 'Star Rating' } }}
            height={300}
          />
        </div>

        {/* Chart 29: Scatter Plot - Review Length vs Rating */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>29. Review Length vs Rating Scatter</span>
              <span className="text-[10px] bg-fuchsia-100 text-fuchsia-700 px-2 py-0.5 rounded-full font-semibold">
                Scatter Plot
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Relationship between feedback length (characters) and star rating.</p>
          </div>
          <PlotlyChart
            data={chart29Data}
            layout={{ xaxis: { title: 'Review Length (Chars)' }, yaxis: { title: 'Star Rating' } }}
            height={300}
          />
        </div>

        {/* Chart 32: Area Chart - Reviews over Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>32. Reviews Volume Over Time</span>
              <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold">
                Area Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Temporal progression of review submissions.</p>
          </div>
          <PlotlyChart
            data={chart32Data}
            layout={{ xaxis: { title: 'Date Period' }, yaxis: { title: 'Review Count' } }}
            height={300}
          />
        </div>

        {/* Chart 33: Line Chart - Average Rating over Time */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>33. Average Rating Trend Over Time</span>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                Line Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Tracking product quality trend across temporal periods.</p>
          </div>
          <PlotlyChart
            data={chart33Data}
            layout={{ xaxis: { title: 'Date Period' }, yaxis: { title: 'Avg Star Rating', range: [1, 5] } }}
            height={300}
          />
        </div>

      </div>

      {/* Chart 12: Heatmap - Product vs Average Rating */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>12. Product Satisfaction Matrix</span>
            <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">
              Heatmap
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Comparative rating intensity matrix across all top catalog items.</p>
        </div>
        <PlotlyChart data={chart12Data} height={250} />
      </div>
    </div>
  );
};
