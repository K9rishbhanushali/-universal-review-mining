import React from 'react';
import { TopicInfo } from '../types';
import { Layers, Quote } from 'lucide-react';

interface TopicModelingSectionProps {
  topics: TopicInfo[];
}

export const TopicModelingSection: React.FC<TopicModelingSectionProps> = ({ topics }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" /> Latent Dirichlet Allocation (LDA) Topic Extraction
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Automatically discovers core underlying topics and keyword clusters from review text without domain hardcoding.
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            {topics.length} Dominant Topics Discovered
          </span>
        </div>

        {/* Topics Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {topics.map((topic) => (
            <div key={topic.id} className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-mono">
                    {topic.id}
                  </span>
                  {topic.name}
                </h4>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                  {topic.weight}% Topic Weight
                </span>
              </div>

              <div>
                <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Top Keyword Terms:
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {topic.keywords.map((kw, kwIdx) => (
                    <span key={kwIdx} className="bg-white text-slate-800 text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                      #{kw}
                    </span>
                  ))}
                </div>
              </div>

              {topic.sampleReview && (
                <div className="pt-2 border-t border-slate-200/80">
                  <div className="text-[11px] font-semibold text-slate-500 flex items-center gap-1 mb-1">
                    <Quote className="w-3 h-3 text-indigo-500" /> Sample Review Context:
                  </div>
                  <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                    "{topic.sampleReview}"
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
