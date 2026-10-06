import React from 'react';
import { PlotlyChart } from '../PlotlyChart';
import { AssociationMiningResult } from '../../types';

interface DataMiningTabProps {
  associationResult: AssociationMiningResult;
}

export const DataMiningTab: React.FC<DataMiningTabProps> = ({ associationResult }) => {
  const rules = associationResult.rules || [];
  const itemsets = associationResult.itemsets || [];

  // 41. Bar Chart: Top Frequent Itemsets
  const topItemsets = itemsets.slice(0, 15);
  const chart41Data: Plotly.Data[] = [
    {
      type: 'bar',
      x: topItemsets.map(it => it.items.join(' + ')),
      y: topItemsets.map(it => Number((it.support * 100).toFixed(1))),
      marker: { color: '#6366f1' },
    },
  ];

  // 42. Bar Chart: Top Association Rules by Confidence
  const topRulesByConf = [...rules].sort((a, b) => b.confidence - a.confidence).slice(0, 15);
  const chart42Data: Plotly.Data[] = [
    {
      type: 'bar',
      x: topRulesByConf.map(r => r.ruleString || `${r.antecedent.join(',')} => ${r.consequent.join(',')}`),
      y: topRulesByConf.map(r => Number((r.confidence * 100).toFixed(1))),
      marker: { color: '#10b981' },
    },
  ];

  // 43. Scatter Plot: Support vs Confidence
  const chart43Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: rules.map(r => Number((r.support * 100).toFixed(1))),
      y: rules.map(r => Number((r.confidence * 100).toFixed(1))),
      text: rules.map(r => r.ruleString),
      marker: {
        size: 10,
        color: '#8b5cf6',
      },
    },
  ];

  // 44. Scatter Plot: Support vs Lift
  const chart44Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: rules.map(r => Number((r.support * 100).toFixed(1))),
      y: rules.map(r => r.lift),
      text: rules.map(r => r.ruleString),
      marker: {
        size: 10,
        color: '#3b82f6',
      },
    },
  ];

  // 45. Bubble Chart: Support vs Confidence vs Lift
  const chart45Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: rules.map(r => Number((r.support * 100).toFixed(1))),
      y: rules.map(r => Number((r.confidence * 100).toFixed(1))),
      text: rules.map(r => `${r.ruleString} (Lift: ${r.lift.toFixed(2)})`),
      marker: {
        size: rules.map(r => Math.max(12, Math.min(50, r.lift * 10))),
        color: rules.map(r => r.lift),
        colorscale: 'Viridis',
        showscale: true,
      },
    },
  ];

  // 40. Network Graph Simulation using Plotly Scatter Node-Edge layout
  const nodes = Array.from(
    new Set(
      rules.flatMap(r => [...(r.antecedent || []), ...(r.consequent || [])])
    )
  ).slice(0, 12);

  const nodePositions: Record<string, { x: number; y: number }> = {};
  nodes.forEach((n, idx) => {
    const angle = (idx / (nodes.length || 1)) * 2 * Math.PI;
    nodePositions[n] = {
      x: Math.cos(angle) * 10,
      y: Math.sin(angle) * 10,
    };
  });

  const edgeX: (number | null)[] = [];
  const edgeY: (number | null)[] = [];

  rules.slice(0, 12).forEach(r => {
    const ant = r.antecedent[0];
    const cons = r.consequent[0];
    if (ant && cons && nodePositions[ant] && nodePositions[cons]) {
      edgeX.push(nodePositions[ant].x, nodePositions[cons].x, null);
      edgeY.push(nodePositions[ant].y, nodePositions[cons].y, null);
    }
  });

  const chart40Data: Plotly.Data[] = [
    {
      type: 'scatter',
      mode: 'lines',
      x: edgeX,
      y: edgeY,
      line: { color: '#cbd5e1', width: 1.5 },
      hoverinfo: 'none',
    },
    {
      type: 'scatter',
      mode: 'text+markers',
      x: nodes.map(n => nodePositions[n]?.x || 0),
      y: nodes.map(n => nodePositions[n]?.y || 0),
      text: nodes,
      textposition: 'top center',
      marker: {
        size: 20,
        color: '#6366f1',
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Association Mining Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Market Basket & Association Rule Mining (Apriori Algorithm)
        </h3>
        <p className="text-xs text-slate-500">
          Discovers co-occurrence patterns in customer review feature mentions and sentiment traits.
        </p>
      </div>

      {/* Part 7 Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 41. Bar Chart - Frequent Itemsets */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>41. Top Frequent Itemsets</span>
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">
                Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Itemsets passing minimum support threshold (Support %)</p>
          </div>
          <PlotlyChart
            data={chart41Data}
            layout={{ xaxis: { title: 'Frequent Itemset' }, yaxis: { title: 'Support %' } }}
            height={300}
          />
        </div>

        {/* 42. Bar Chart - Rules by Confidence */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>42. Top Association Rules by Confidence</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">
                Bar Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Rules ranked by conditional probability (Confidence %)</p>
          </div>
          <PlotlyChart
            data={chart42Data}
            layout={{ xaxis: { title: 'Rule (A => B)' }, yaxis: { title: 'Confidence %' } }}
            height={300}
          />
        </div>

        {/* 43. Scatter Plot - Support vs Confidence */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>43. Support vs Confidence Scatter</span>
              <span className="text-[10px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                Scatter Plot
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Evaluating rule validity and occurrence density.</p>
          </div>
          <PlotlyChart
            data={chart43Data}
            layout={{ xaxis: { title: 'Support %' }, yaxis: { title: 'Confidence %' } }}
            height={300}
          />
        </div>

        {/* 44. Scatter Plot - Support vs Lift */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>44. Support vs Lift Scatter</span>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                Scatter Plot
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Lift &gt; 1.0 indicates strong positive rule association.</p>
          </div>
          <PlotlyChart
            data={chart44Data}
            layout={{ xaxis: { title: 'Support %' }, yaxis: { title: 'Lift Ratio' } }}
            height={300}
          />
        </div>

      </div>

      {/* 40. Network Graph & 45. Bubble Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 40. Network Graph */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>40. Association Rules Network Topology</span>
              <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full font-semibold">
                Network Graph
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Nodes represent terms, links represent mined association rules.</p>
          </div>
          <PlotlyChart
            data={chart40Data}
            layout={{ xaxis: { visible: false }, yaxis: { visible: false } }}
            height={340}
          />
        </div>

        {/* 45. Bubble Chart */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>45. Support vs Confidence vs Lift Bubble Plot</span>
              <span className="text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">
                3D Bubble Chart
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">X = Support, Y = Confidence, Bubble Size &amp; Color = Lift.</p>
          </div>
          <PlotlyChart
            data={chart45Data}
            layout={{ xaxis: { title: 'Support %' }, yaxis: { title: 'Confidence %' } }}
            height={340}
          />
        </div>

      </div>
    </div>
  );
};
