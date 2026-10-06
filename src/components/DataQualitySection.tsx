import React from 'react';
import { DataQualityReport } from '../types';
import { ShieldCheck, HardDrive, FileSpreadsheet, Copy, AlertCircle, ListFilter } from 'lucide-react';

interface DataQualitySectionProps {
  report: DataQualityReport;
}

export const DataQualitySection: React.FC<DataQualitySectionProps> = ({ report }) => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Total Rows</span>
            <FileSpreadsheet className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {report.totalRows.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Records loaded</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Columns</span>
            <ListFilter className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {report.totalColumns}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Attributes</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Missing Values</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {report.missingValuesPct}%
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{report.missingValuesCount} null cells</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Duplicate Rows</span>
            <Copy className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {report.duplicateRowsCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{report.duplicateRowsPct}% of dataset</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Memory Usage</span>
            <HardDrive className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {report.memoryUsageKB} KB
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">RAM footprint</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-xs text-slate-500 font-medium flex items-center justify-between">
            <span>Review Column</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-sm font-bold text-blue-600 mt-1.5 truncate" title={report.detectedReviewCol}>
            {report.detectedReviewCol}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Primary NLP text</div>
        </div>
      </div>

      {/* Column Data Types & Unique Values Breakdown Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-blue-600" /> Column Schema & Data Hygiene Breakdown
          </h4>
          <span className="text-xs text-slate-500">{report.columnDataTypes.length} columns inspected</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Column Name</th>
                <th className="p-3">Inferred Data Type</th>
                <th className="p-3">Non-Null Count</th>
                <th className="p-3">Null / Missing</th>
                <th className="p-3">Unique Values</th>
                <th className="p-3">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {report.columnDataTypes.map((col, idx) => {
                const isReview = col.column === report.detectedReviewCol;
                const isRating = col.column === report.detectedRatingCol;
                const isProduct = col.column === report.detectedProductCol;

                return (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      {col.column}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-slate-700">
                        {col.type}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-emerald-700">
                      {col.nonNullCount.toLocaleString()}
                    </td>
                    <td className="p-3 font-medium text-rose-600">
                      {col.nullCount} ({((col.nullCount / (report.totalRows || 1)) * 100).toFixed(1)}%)
                    </td>
                    <td className="p-3 font-medium text-slate-800">
                      {col.uniqueCount.toLocaleString()}
                    </td>
                    <td className="p-3">
                      {isReview && (
                        <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                          TEXT REVIEW
                        </span>
                      )}
                      {isRating && (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">
                          RATING
                        </span>
                      )}
                      {isProduct && (
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold text-[10px]">
                          PRODUCT
                        </span>
                      )}
                      {!isReview && !isRating && !isProduct && (
                        <span className="text-slate-400 text-[11px]">Feature</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
