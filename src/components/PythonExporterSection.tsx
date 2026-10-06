import React, { useState } from 'react';
import { PYTHON_CODEBASE_FILES } from '../data/pythonCodebase';
import { Code, Copy, Check, FileText, Download, Terminal, Folder } from 'lucide-react';

export const PythonExporterSection: React.FC = () => {
  const [selectedFileName, setSelectedFileName] = useState<string>('app.py');
  const [copied, setCopied] = useState<boolean>(false);

  const selectedFile = PYTHON_CODEBASE_FILES.find(f => f.name === selectedFileName) || PYTHON_CODEBASE_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white border border-slate-800 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-500/30 mb-2">
            <Code className="w-3.5 h-3.5" /> Full Modular Python & Streamlit Project Codebase
          </div>
          <h3 className="text-xl font-bold">Export Python Data Science Application</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Complete modular codebase with Pandas, NLTK, Scikit-Learn, Plotly, Streamlit, and MLxtend ready for local deployment or GitHub repository creation.
          </p>
        </div>

        <button
          onClick={() => handleDownloadFile(selectedFile.name, selectedFile.content)}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download {selectedFile.name}
        </button>
      </div>

      {/* Codebase Explorer Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* File Tree Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 pb-2 border-b border-slate-100">
            <Folder className="w-4 h-4 text-blue-600" /> review-mining-system/
          </div>

          <div className="space-y-1 pt-1">
            {PYTHON_CODEBASE_FILES.map((file) => {
              const isSelected = file.name === selectedFileName;
              return (
                <button
                  key={file.name}
                  onClick={() => setSelectedFileName(file.name)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <FileText className={`w-3.5 h-3.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                    {file.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Content Viewer */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <div className="text-sm font-bold text-slate-200 font-mono flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" /> {selectedFile.path}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <pre className="p-4 bg-slate-950 rounded-xl text-slate-200 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-all">
            {selectedFile.content}
          </pre>
        </div>

      </div>
    </div>
  );
};
