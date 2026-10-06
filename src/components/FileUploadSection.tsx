import React, { useRef } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Sparkles, FileText, Smartphone, Hotel, Utensils } from 'lucide-react';
import { SampleDatasetMeta } from '../types';

interface FileUploadSectionProps {
  onFileUpload: (file: File) => void;
  onSelectSample: (sampleId: string) => void;
  sampleDatasets: SampleDatasetMeta[];
  currentDatasetMeta: {
    fileName: string;
    fileSizeKB: number;
    totalRows: number;
    totalColumns: number;
    error?: string;
  };
  isLoading: boolean;
}

export const FileUploadSection: React.FC<FileUploadSectionProps> = ({
  onFileUpload,
  onSelectSample,
  sampleDatasets,
  currentDatasetMeta,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const getCategoryIcon = (id: string) => {
    if (id === 'mobile_reviews') return <Smartphone className="w-5 h-5 text-blue-500" />;
    if (id === 'hotel_reviews') return <Hotel className="w-5 h-5 text-indigo-500" />;
    return <Utensils className="w-5 h-5 text-amber-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Description */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 border border-slate-800 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Domain-Agnostic Review Analytics Pipeline
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              Universal Review Mining & Intelligence System
            </h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Upload any product, mobile, hotel, restaurant, app, or e-commerce review dataset in CSV or Excel format. The system automatically detects columns, cleans text, computes sentiment, extracts aspects, and mines association rules.
            </p>
          </div>
        </div>
      </div>

      {/* File Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white hover:bg-slate-50/50 rounded-2xl p-8 text-center cursor-pointer transition-all shadow-sm group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-slate-800 text-base">
              Click to upload or drag and drop dataset
            </h3>
            <p className="text-slate-500 text-xs mt-1">
              Supports CSV, XLSX, XLS files (e.g. Amazon reviews, Mobile feedback, Hotel ratings)
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              Auto-detects structure, text, rating, product & date columns
            </div>
          </div>

          {/* Current File Metadata & Error Alert */}
          {currentDatasetMeta.error ? (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Dataset Parsing Error:</span>
                <p className="mt-0.5">{currentDatasetMeta.error}</p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 text-emerald-900 rounded-xl flex items-center justify-between text-sm shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <div className="font-semibold text-slate-900">
                    Active Dataset: <span className="text-emerald-700 font-bold">{currentDatasetMeta.fileName}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5 flex gap-3">
                    <span>Size: {currentDatasetMeta.fileSizeKB} KB</span>
                    <span>•</span>
                    <span>Rows: {currentDatasetMeta.totalRows.toLocaleString()}</span>
                    <span>•</span>
                    <span>Columns: {currentDatasetMeta.totalColumns}</span>
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Loaded & Ready
              </span>
            </div>
          )}
        </div>

        {/* Pre-loaded Sample Datasets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" /> Pre-loaded Sample Datasets
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Click to test</span>
          </div>

          <div className="space-y-2.5">
            {sampleDatasets.map((ds) => (
              <button
                key={ds.id}
                onClick={() => onSelectSample(ds.id)}
                disabled={isLoading}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all group flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-blue-100/60 transition-colors">
                  {getCategoryIcon(ds.id)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-xs text-slate-900 group-hover:text-blue-700 truncate">
                    {ds.name}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-tight">
                    {ds.description}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                    <span className="font-semibold text-slate-600">{ds.sampleRowsCount} sample rows</span>
                    <span>•</span>
                    <span>{ds.category}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
