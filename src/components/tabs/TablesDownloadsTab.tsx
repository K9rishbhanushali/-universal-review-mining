import React, { useState, useMemo } from 'react';
import { CleanedReviewRow, SentimentAnalysisResult, AssociationMiningResult, TopicInfo } from '../../types';
import { Search, Download, Table, ChevronLeft, ChevronRight, FileSpreadsheet, FileCode, CheckCircle2 } from 'lucide-react';

interface TablesDownloadsTabProps {
  rawRows: Record<string, any>[];
  cleanedRows: CleanedReviewRow[];
  sentiment: SentimentAnalysisResult;
  associationResult: AssociationMiningResult;
  topics: TopicInfo[];
  onDownloadCleanedCsv: () => void;
  onDownloadHtmlReport: () => void;
}

export const TablesDownloadsTab: React.FC<TablesDownloadsTabProps> = ({
  rawRows,
  cleanedRows,
  sentiment,
  associationResult,
  topics,
  onDownloadCleanedCsv,
  onDownloadHtmlReport,
}) => {
  const [activeSubTable, setActiveSubTable] = useState<string>('cleaned');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Compute Product Statistics table
  const productStats = useMemo(() => {
    const map: Record<string, { count: number; sumRating: number; pos: number; neg: number }> = {};
    cleanedRows.forEach(r => {
      const p = r.product || 'General';
      if (!map[p]) map[p] = { count: 0, sumRating: 0, pos: 0, neg: 0 };
      map[p].count += 1;
      if (r.rating) map[p].sumRating += Number(r.rating);
      if (r.sentiment === 'positive') map[p].pos += 1;
      if (r.sentiment === 'negative') map[p].neg += 1;
    });

    return Object.entries(map).map(([p, st]) => ({
      Product: p,
      'Total Reviews': st.count,
      'Avg Rating': st.count > 0 ? Number((st.sumRating / st.count).toFixed(2)) : 0,
      'Positive %': st.count > 0 ? Number(((st.pos / st.count) * 100).toFixed(1)) + '%' : '0%',
      'Negative %': st.count > 0 ? Number(((st.neg / st.count) * 100).toFixed(1)) + '%' : '0%',
    }));
  }, [cleanedRows]);

  // Compute Rating Summary table
  const ratingSummary = useMemo(() => {
    return [1, 2, 3, 4, 5].map(star => {
      const starRows = cleanedRows.filter(r => r.rating === star);
      const count = starRows.length;
      const total = cleanedRows.length || 1;
      return {
        'Star Rating': `${star} Star${star > 1 ? 's' : ''}`,
        'Review Count': count,
        'Percentage': Number(((count / total) * 100).toFixed(1)) + '%',
        'Positive Sentiment %': count > 0 ? Number(((starRows.filter(r => r.sentiment === 'positive').length / count) * 100).toFixed(1)) + '%' : '0%',
      };
    });
  }, [cleanedRows]);

  // Top Positive Reviews
  const topPosReviews = useMemo(() => {
    return cleanedRows
      .filter(r => r.sentiment === 'positive')
      .slice(0, 50)
      .map(r => ({
        ID: r.id,
        Product: r.product || 'General',
        Rating: `${r.rating || 5} ★`,
        'Review Text': r.originalText,
        'Sentiment Score': r.sentimentScore ? r.sentimentScore.toFixed(2) : '+0.85',
      }));
  }, [cleanedRows]);

  // Top Negative Reviews
  const topNegReviews = useMemo(() => {
    return cleanedRows
      .filter(r => r.sentiment === 'negative')
      .slice(0, 50)
      .map(r => ({
        ID: r.id,
        Product: r.product || 'General',
        Rating: `${r.rating || 1} ★`,
        'Review Text': r.originalText,
        'Sentiment Score': r.sentimentScore ? r.sentimentScore.toFixed(2) : '-0.75',
      }));
  }, [cleanedRows]);

  // Topic Keywords Table
  const topicKeywordsTable = useMemo(() => {
    return (topics || []).map(t => ({
      'Topic ID': t.id,
      'Topic Name': t.name,
      'Weight %': t.weight + '%',
      Keywords: t.keywords.join(', '),
      'Sample Feedback': t.sampleReview,
    }));
  }, [topics]);

  // Frequent Itemsets Table
  const itemsetsTable = useMemo(() => {
    return (associationResult.itemsets || []).map((it, i) => ({
      Rank: i + 1,
      'Itemset Combination': it.items.join(' + '),
      'Support %': Number((it.support * 100).toFixed(2)) + '%',
    }));
  }, [associationResult]);

  // Association Rules Table
  const rulesTable = useMemo(() => {
    return (associationResult.rules || []).map((r, i) => ({
      Rank: i + 1,
      'Antecedent (If)': r.antecedent.join(' + '),
      'Consequent (Then)': r.consequent.join(' + '),
      'Support %': Number((r.support * 100).toFixed(2)) + '%',
      'Confidence %': Number((r.confidence * 100).toFixed(2)) + '%',
      'Lift Ratio': r.lift.toFixed(2),
    }));
  }, [associationResult]);

  // Select dataset rows depending on sub-table
  const currentTableData = useMemo(() => {
    let data: any[] = [];
    if (activeSubTable === 'raw') data = rawRows;
    else if (activeSubTable === 'cleaned') data = cleanedRows.map(r => ({ ID: r.id, Product: r.product, Rating: r.rating, Review: r.originalText, Cleaned: r.cleanText }));
    else if (activeSubTable === 'sentiment') data = cleanedRows.map(r => ({ ID: r.id, Product: r.product, Rating: r.rating, Sentiment: r.sentiment, Score: r.sentimentScore, Review: r.originalText }));
    else if (activeSubTable === 'itemsets') data = itemsetsTable;
    else if (activeSubTable === 'rules') data = rulesTable;
    else if (activeSubTable === 'topics') data = topicKeywordsTable;
    else if (activeSubTable === 'products') data = productStats;
    else if (activeSubTable === 'ratings') data = ratingSummary;
    else if (activeSubTable === 'pos_reviews') data = topPosReviews;
    else if (activeSubTable === 'neg_reviews') data = topNegReviews;

    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
      Object.values(row).some(v => String(v).toLowerCase().includes(term))
    );
  }, [activeSubTable, rawRows, cleanedRows, itemsetsTable, rulesTable, topicKeywordsTable, productStats, ratingSummary, topPosReviews, topNegReviews, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(currentTableData.length / pageSize) || 1;
  const paginatedData = currentTableData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const tableHeaders = paginatedData.length > 0 ? Object.keys(paginatedData[0]) : [];

  // JSON Export Handler
  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify({ rawRowsCount: rawRows.length, cleanedRowsCount: cleanedRows.length, productStats, ratingSummary, topics }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `review_mining_data.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Downloads Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Download className="w-4 h-4 text-indigo-600" />
            <span>Export &amp; Download Intelligence Assets</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Export sanitized CSV files, executive HTML reports, or raw structured JSON datasets.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onDownloadCleanedCsv}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Cleaned CSV</span>
          </button>

          <button
            onClick={onDownloadHtmlReport}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Table className="w-4 h-4" />
            <span>HTML Intelligence Report</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center space-x-1.5 transition cursor-pointer"
          >
            <FileCode className="w-4 h-4" />
            <span>Export JSON Data</span>
          </button>
        </div>
      </div>

      {/* Sub-Table Switcher Tabs */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
        <div className="flex flex-wrap items-center gap-1 text-xs">
          {[
            { id: 'cleaned', label: '✔ Cleaned Dataset' },
            { id: 'raw', label: '✔ Raw Dataset' },
            { id: 'sentiment', label: '✔ Sentiment Dataset' },
            { id: 'itemsets', label: '✔ Frequent Itemsets' },
            { id: 'rules', label: '✔ Association Rules' },
            { id: 'topics', label: '✔ Topic Keywords' },
            { id: 'products', label: '✔ Product Statistics' },
            { id: 'ratings', label: '✔ Rating Summary' },
            { id: 'pos_reviews', label: '✔ Top Positive Reviews' },
            { id: 'neg_reviews', label: '✔ Top Negative Reviews' },
          ].map(tb => (
            <button
              key={tb.id}
              onClick={() => {
                setActiveSubTable(tb.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                activeSubTable === tb.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table & Controls Container */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Search & Pagination Controls Header */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center space-x-3 text-xs text-slate-600">
            <span>
              Showing {currentTableData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} -{' '}
              {Math.min(currentPage * pageSize, currentTableData.length)} of {currentTableData.length} records
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold px-2">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1 rounded bg-white border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {paginatedData.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching records found for "{searchTerm}".
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  {tableHeaders.map(h => (
                    <th key={h} className="p-3 border-r border-slate-200 last:border-r-0">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {paginatedData.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 transition-colors">
                    {tableHeaders.map((h, cIdx) => (
                      <td key={cIdx} className="p-3 max-w-xs truncate text-slate-800 font-medium">
                        {String(row[h] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
