import React from 'react';
import {
  PieChart,
  ShieldCheck,
  BarChart3,
  Smile,
  Type,
  Network,
  Tag,
  ArrowRightLeft,
  Sparkles,
  Download,
  Upload,
  RefreshCw,
  Code
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  datasetName: string;
  totalRows: number;
  totalCols: number;
  onResetSample: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  datasetName,
  totalRows,
  totalCols,
  onResetSample
}) => {
  const tabs = [
    { id: 'upload', label: 'Dataset & Ingestion', icon: Upload },
    { id: 'overview', label: 'Tab 1 → Overview', icon: PieChart },
    { id: 'quality', label: 'Tab 2 → Data Quality', icon: ShieldCheck },
    { id: 'eda', label: 'Tab 3 → EDA', icon: BarChart3 },
    { id: 'sentiment', label: 'Tab 4 → Sentiment', icon: Smile },
    { id: 'text_mining', label: 'Tab 5 → Text Mining', icon: Type },
    { id: 'association', label: 'Tab 6 → Data Mining', icon: Network },
    { id: 'topics', label: 'Tab 7 → Topic Modeling', icon: Tag },
    { id: 'comparison', label: 'Tab 8 → Product Comparison', icon: ArrowRightLeft },
    { id: 'insights', label: 'Tab 9 → Insights', icon: Sparkles },
    { id: 'tables_downloads', label: 'Tab 10 → Downloads', icon: Download },
    { id: 'python_export', label: 'Python Exporter', icon: Code },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50 shadow-md">
      {/* Top Header Row */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 via-blue-600 to-teal-400 flex items-center justify-center font-bold text-sm shadow-md">
            BI
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight text-white flex items-center space-x-2">
              <span>Business Intelligence Review Mining Dashboard</span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
                Power BI / Tableau Style
              </span>
            </h1>
          </div>
        </div>

        {/* Dataset Pill Stats & Reset */}
        <div className="flex items-center space-x-3 text-xs">
          {datasetName && (
            <div className="hidden md:flex items-center space-x-2 bg-slate-800/90 px-3 py-1 rounded-lg border border-slate-700/80 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-200 truncate max-w-[160px]" title={datasetName}>
                {datasetName}
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400 font-mono">{totalRows.toLocaleString()} rows</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono">{totalCols} cols</span>
            </div>
          )}

          <button
            onClick={onResetSample}
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-semibold border border-slate-700 transition cursor-pointer"
            title="Reload Default Sample Dataset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Sample</span>
          </button>
        </div>
      </div>

      {/* Horizontal Navigation Tab Bar */}
      <div className="bg-slate-950 border-t border-slate-800/80 overflow-x-auto custom-scrollbar">
        <div className="max-w-[1600px] mx-auto px-4 flex space-x-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
