import React from 'react';
import { AssociationMiningResult } from '../types';
import { Code, HelpCircle, ArrowRight, TrendingUp } from 'lucide-react';

interface AssociationMiningSectionProps {
  associationResult: AssociationMiningResult;
}

export const AssociationMiningSection: React.FC<AssociationMiningSectionProps> = ({ associationResult }) => {
  const { rules } = associationResult;

  return (
    <div className="space-y-6">
      {/* Header Info Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-600" /> Frequent Term Association Mining (Apriori Algorithm)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Discovers strong co-occurrence associations and rules among review tokens using Support, Confidence, and Lift metrics.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            {rules.length} Strong Rules Discovered
          </span>
        </div>

        {/* Plain-English Metric Definitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <span className="font-bold text-slate-900">1. Support:</span>
            <p className="text-slate-600 mt-0.5">
              How frequently the item pair appears across all reviews in the dataset.
            </p>
          </div>
          <div>
            <span className="font-bold text-slate-900">2. Confidence:</span>
            <p className="text-slate-600 mt-0.5">
              How often Consequent B appears when Antecedent A is mentioned.
            </p>
          </div>
          <div>
            <span className="font-bold text-slate-900">3. Lift:</span>
            <p className="text-slate-600 mt-0.5">
              How much stronger the association is compared to random occurrence (&gt;1.0 indicates positive association).
            </p>
          </div>
        </div>

        {/* Association Rules Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3">Rule (A ➔ B)</th>
                <th className="p-3">Support</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Lift Ratio</th>
                <th className="p-3">Plain-English Interpretation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {rules.length > 0 ? (
                rules.map((rule, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-900 flex items-center gap-1.5">
                      <span className="bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded">
                        {rule.antecedent.join(', ')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        {rule.consequent.join(', ')}
                      </span>
                    </td>

                    <td className="p-3 font-mono font-bold text-slate-800">
                      {(rule.support * 100).toFixed(1)}%
                    </td>

                    <td className="p-3 font-mono font-bold text-emerald-700">
                      {(rule.confidence * 100).toFixed(1)}%
                    </td>

                    <td className="p-3 font-mono font-extrabold text-indigo-600">
                      <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 rounded">
                        {rule.lift}x
                      </span>
                    </td>

                    <td className="p-3 text-slate-700 leading-relaxed max-w-sm">
                      {rule.explanation}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    No association rules met the minimum support/confidence thresholds for this dataset size.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
