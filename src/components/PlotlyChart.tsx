import React from 'react';
import Plot from 'react-plotly.js';

interface PlotlyChartProps {
  data: any[];
  layout?: any;
  config?: Partial<Plotly.Config>;
  style?: React.CSSProperties;
  className?: string;
  height?: number;
}

export const PlotlyChart: React.FC<PlotlyChartProps> = ({
  data,
  layout = {},
  config = {},
  style,
  className = '',
  height = 360,
}) => {
  const defaultLayout: Partial<Plotly.Layout> = {
    autosize: true,
    height: height,
    margin: { l: 40, r: 30, t: 40, b: 40, pad: 4 },
    font: {
      family: 'Plus Jakarta Sans, Inter, system-ui, sans-serif',
      size: 12,
      color: '#334155', // slate-700
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    hoverlabel: {
      bgcolor: '#0f172a',
      font: { color: '#ffffff', family: 'Plus Jakarta Sans, sans-serif', size: 12 },
      bordercolor: '#334155',
    },
    legend: {
      orientation: 'h',
      x: 0,
      y: 1.12,
      xanchor: 'left',
      yanchor: 'top',
      font: { size: 11, color: '#475569' },
    },
    xaxis: {
      gridcolor: '#e2e8f0',
      zerolinecolor: '#cbd5e1',
      tickfont: { color: '#64748b', size: 11 },
    },
    yaxis: {
      gridcolor: '#e2e8f0',
      zerolinecolor: '#cbd5e1',
      tickfont: { color: '#64748b', size: 11 },
    },
    ...layout,
  };

  const defaultConfig: Partial<Plotly.Config> = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    toImageButtonOptions: {
      format: 'png',
      filename: 'bi_dashboard_chart',
      height: 600,
      width: 1000,
      scale: 2,
    },
    ...config,
  };

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <Plot
        data={data}
        layout={defaultLayout}
        config={defaultConfig}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%', minHeight: `${height}px`, ...style }}
      />
    </div>
  );
};
