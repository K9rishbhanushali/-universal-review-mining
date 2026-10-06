import React from 'react';
import { PlotlyChart } from '../PlotlyChart';
import { CleanedReviewRow, SentimentAnalysisResult, EDAMetrics, CleaningMetrics } from '../../types';

interface OverviewTabProps {
  rows: CleanedReviewRow[];
  sentiment: SentimentAnalysisResult;
  eda: EDAMetrics;
  cleaningMetrics?: CleaningMetrics;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  rows,
  sentiment,
  eda,
  cleaningMetrics = { rowsBefore: 100, rowsAfter: 95, rowsRemoved: 5, duplicatesRemoved: 3, emptyReviewsRemoved: 2, shortReviewsRemoved: 0 },
}) => {
  // Chart 1: Pie Chart - Sentiment Distribution
  const chart1Data: Plotly.Data[] = [
    {
      type: 'pie',
      labels: ['Positive', 'Neutral', 'Negative'],
      values: [sentiment.positiveCount, sentiment.neutralCount, sentiment.negativeCount],
      marker: {
        colors: ['#10b981', '#64748b', '#f43f5e'],
      },
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
      hole: 0,
    },
  ];

  // Chart 2: Donut Chart - Rating Distribution
  const ratingCounts = [1, 2, 3, 4, 5].map(star => {
    return rows.filter(r => r.rating === star).length;
  });

  const chart2Data: Plotly.Data[] = [
    {
      type: 'pie',
      labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
      values: ratingCounts,
      hole: 0.5,
      marker: {
        colors: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981'],
      },
      textinfo: 'label+percent',
      hoverinfo: 'label+value+percent',
    },
  ];

  // Chart 3: Bar Chart - Top 10 Products by Number of Reviews
  const prodCounts: Record<string, number> = {};
  rows.forEach(r => {
    const p = r.product || 'General';
    prodCounts[p] = (prodCounts[p] || 0) + 1;
  });
  const topProducts = Object.entries(prodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const chart3Data: Plotly.Data[] = [
    {
      type: 'bar',
      x: topProducts.map(p => p[0]),
      y: topProducts.map(p => p[1]),
      marker: {
        color: '#6366f1',
      },
    },
  ];

  // Chart 4: Horizontal Bar Chart - Average Rating by Product
  const prodRatings: Record<string, { sum: number; count: number }> = {};
  rows.forEach(r => {
    const p = r.product || 'General';
    if (!prodRatings[p]) prodRatings[p] = { sum: 0, count: 0 };
    if (r.rating) {
      prodRatings[p].sum += Number(r.rating);
      prodRatings[p].count += 1;
    }
  });

  const avgProdRatings = Object.entries(prodRatings)
    .map(([p, st]) => ({
      product: p,
      avg: st.count > 0 ? Number((st.sum / st.count).toFixed(2)) : 0,
    }))
    .sort((a, b) => a.avg - b.avg)
    .slice(-10);

  const chart4Data: Plotly.Data[] = [
    {
      type: 'bar',
      orientation: 'h',
      x: avgProdRatings.map(p => p.avg),
      y: avgProdRatings.map(p => p.product),
      marker: {
        color: '#3b82f6',
      },
    },
  ];

  // Chart 5: Column Chart - Reviews per Category
  const catCounts: Record<string, number> = {};
  rows.forEach(r => {
    const c = r.category || 'General';
    catCounts[c] = (catCounts[c] || 0) + 1;
  });
  const catList = Object.entries(catCounts).sort((a, b) => b[1] - a[1]);

  const chart5Data: Plotly.Data[] = [
    {
      type: 'bar',
      x: catList.map(c => c[0]),
      y: catList.map(c => c[1]),
      marker: {
        color: '#0d9488',
      },
    },
  ];

  // Chart 6: Treemap - Reviews by Product Category
  const treemapLabels: string[] = [];
  const treemapParents: string[] = [];
  const treemapValues: number[] = [];

  // Root
  treemapLabels.push('All Categories');
  treemapParents.push('');
  treemapValues.push(rows.length);

  // Categories
  Object.entries(catCounts).forEach(([cat, count]) => {
    treemapLabels.push(cat);
    treemapParents.push('All Categories');
    treemapValues.push(count);

    // Products inside category
    const catProds: Record<string, number> = {};
    rows
      .filter(r => (r.category || 'General') === cat)
      .forEach(r => {
        const p = r.product || 'Unassigned';
        catProds[p] = (catProds[p] || 0) + 1;
      });

    Object.entries(catProds).forEach(([pName, pCount]) => {
      treemapLabels.push(`${pName} (${cat})`);
      treemapParents.push(cat);
      treemapValues.push(pCount);
    });
  });

  const chart6Data: Plotly.Data[] = [
    {
      type: 'treemap',
      labels: treemapLabels,
      parents: treemapParents,
      values: treemapValues,
      textinfo: 'label+value+percent' as any,
      marker: {
        colorscale: 'Viridis',
      },
    },
  ];

  // Chart 7: Funnel Chart - Review Processing Pipeline
  const chart7Data: Plotly.Data[] = [
    {
      type: 'funnel',
      y: ['1. Uploaded Dataset', '2. Cleaned Records', '3. Tokens Processed', '4. Classified Sentiment'],
      x: [
        cleaningMetrics.rowsBefore || rows.length + 10,
        cleaningMetrics.rowsAfter || rows.length,
        rows.filter(r => r.tokens && r.tokens.length > 0).length,
        rows.filter(r => r.sentiment).length,
      ],
      textinfo: 'value+percent' as any,
      marker: {
        color: ['#3b82f6', '#6366f1', '#8b5cf6', '#10b981'],
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Overview Grid - Part 1 Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Sentiment Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>1. Sentiment Distribution</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Pie Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Proportion of positive, neutral, and negative reviews in active filtered dataset.
            </p>
          </div>
          <PlotlyChart data={chart1Data} height={320} />
        </div>

        {/* Chart 2: Rating Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>2. Rating Distribution</span>
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">
                Donut Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Star rating breakdowns (1★ through 5★) across all customer reviews.
            </p>
          </div>
          <PlotlyChart data={chart2Data} height={320} />
        </div>

        {/* Chart 3: Top 10 Products by Number of Reviews */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>3. Top 10 Products by Review Count</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Products with highest customer review engagement volume.
            </p>
          </div>
          <PlotlyChart
            data={chart3Data}
            layout={{ xaxis: { title: 'Product Name' }, yaxis: { title: 'Review Count' } }}
            height={320}
          />
        </div>

        {/* Chart 4: Average Rating by Product */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>4. Average Rating by Product</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                Horizontal Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Top products ranked by average customer rating satisfaction.
            </p>
          </div>
          <PlotlyChart
            data={chart4Data}
            layout={{ xaxis: { title: 'Avg Star Rating', range: [0, 5.2] }, yaxis: { title: '' } }}
            height={320}
          />
        </div>

        {/* Chart 5: Reviews per Category */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>5. Reviews per Category</span>
              <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                Column Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Total feedback volume distributed across product categories.
            </p>
          </div>
          <PlotlyChart
            data={chart5Data}
            layout={{ xaxis: { title: 'Category' }, yaxis: { title: 'Reviews' } }}
            height={320}
          />
        </div>

        {/* Chart 7: Funnel Chart - Review Processing Pipeline */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>7. Review Processing Pipeline</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                Funnel Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ETL pipeline progression: Raw Upload → Deduplicated → NLP Tokenized → Sentiment Classified.
            </p>
          </div>
          <PlotlyChart data={chart7Data} height={320} />
        </div>

      </div>

      {/* Chart 6: Treemap - Reviews by Category & Product */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <span>6. Reviews Hierarchy Treemap</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
              Interactive Treemap
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Nested hierarchical view: Category → Individual Product review proportions. Click boxes to expand.
          </p>
        </div>
        <PlotlyChart data={chart6Data} height={420} />
      </div>
    </div>
  );
};
