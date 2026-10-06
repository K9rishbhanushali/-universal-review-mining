import React, { useState, useEffect, useMemo } from 'react';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { parseFile, loadSampleDataset } from './modules/dataLoader';
import { detectDatasetColumns } from './modules/columnDetector';
import { calculateDataQualityReport } from './modules/dataQuality';
import { cleanDataset } from './modules/dataCleaner';
import { runSentimentAnalysis } from './modules/sentimentEngine';
import { runTextMining } from './modules/textMiningEngine';
import { runTopicModeling } from './modules/topicModelingEngine';
import { runAspectSentimentAnalysis } from './modules/aspectSentimentEngine';
import { runAssociationMining } from './modules/associationMiningEngine';
import { runEDA } from './modules/edaEngine';
import { generateAutomatedInsights } from './modules/insightsEngine';
import { generateHTMLReport, generateCleanedCSV } from './modules/reportGenerator';

import { ColumnMapping, CleaningConfig, CleanedReviewRow, SentimentType } from './types';

import { Navbar } from './components/Navbar';
import { SidebarFilters, DashboardFilterState } from './components/SidebarFilters';
import { KPICardsGrid } from './components/KPICardsGrid';

import { FileUploadSection } from './components/FileUploadSection';
import { ColumnDetectionSection } from './components/ColumnDetectionSection';
import { DataCleanerSection } from './components/DataCleanerSection';

import { OverviewTab } from './components/tabs/OverviewTab';
import { DataQualityTab } from './components/tabs/DataQualityTab';
import { EDARatingTab } from './components/tabs/EDARatingTab';
import { SentimentTab } from './components/tabs/SentimentTab';
import { TextAnalysisTab } from './components/tabs/TextAnalysisTab';
import { DataMiningTab } from './components/tabs/DataMiningTab';
import { TopicModelingTab } from './components/tabs/TopicModelingTab';
import { ProductAspectTab } from './components/tabs/ProductAspectTab';
import { InsightsSection } from './components/InsightsSection';
import { TablesDownloadsTab } from './components/tabs/TablesDownloadsTab';
import { PythonExporterSection } from './components/PythonExporterSection';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Raw dataset state
  const [fileName, setFileName] = useState<string>('sample_mobile_reviews.csv');
  const [fileSizeKB, setFileSizeKB] = useState<number>(45.2);
  const [rawRows, setRawRows] = useState<Record<string, any>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);

  // Column Mapping state
  const [columnMapping, setColumnMapping] = useState<ColumnMapping>({
    reviewCol: '',
    ratingCol: '',
    productCol: '',
    dateCol: '',
    categoryCol: '',
    priceCol: ''
  });

  // Cleaning Config state
  const [cleaningConfig, setCleaningConfig] = useState<CleaningConfig>({
    removeMissing: true,
    removeDuplicates: true,
    removeHtml: true,
    removeUrls: true,
    removePunctuation: true,
    removeSpecialChars: true,
    lowercaseText: true,
    minLength: 5,
    customStopwords: ''
  });

  // Sidebar Filter State
  const initialFilterState: DashboardFilterState = {
    products: [],
    categories: [],
    ratings: [],
    sentiments: [],
    startDate: '',
    endDate: '',
    minPrice: 0,
    maxPrice: 1000,
    minReviewLength: 0,
    maxReviewLength: 2000,
    topics: [],
    aspects: []
  };

  const [dashboardFilters, setDashboardFilters] = useState<DashboardFilterState>(initialFilterState);

  // Initial Load with Sample Dataset
  useEffect(() => {
    handleLoadSample('mobile_reviews');
  }, []);

  // Handle Load Sample Dataset
  const handleLoadSample = (sampleId: string) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const sample = loadSampleDataset(sampleId);
      setFileName(sample.meta.fileName);
      setFileSizeKB(sample.meta.fileSizeKB);
      setRawRows(sample.rows);
      setColumns(sample.columns);

      const detection = detectDatasetColumns(sample.rows, sample.columns);
      setColumnMapping({
        reviewCol: detection.review?.detectedCol || sample.columns[0] || '',
        ratingCol: detection.rating?.detectedCol || '',
        productCol: detection.product?.detectedCol || '',
        dateCol: detection.date?.detectedCol || '',
        categoryCol: detection.category?.detectedCol || '',
        priceCol: detection.price?.detectedCol || ''
      });
      setDashboardFilters(initialFilterState);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error loading sample dataset');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Upload Custom File
  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const parsed = await parseFile(file);
      setFileName(parsed.fileName);
      setFileSizeKB(parsed.fileSizeKB);
      setRawRows(parsed.rows);
      setColumns(parsed.columns);

      const detection = detectDatasetColumns(parsed.rows, parsed.columns);
      setColumnMapping({
        reviewCol: detection.review?.detectedCol || parsed.columns[0] || '',
        ratingCol: detection.rating?.detectedCol || '',
        productCol: detection.product?.detectedCol || '',
        dateCol: detection.date?.detectedCol || '',
        categoryCol: detection.category?.detectedCol || '',
        priceCol: detection.price?.detectedCol || ''
      });
      setDashboardFilters(initialFilterState);
      setActiveTab('upload');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse file. Upload a valid CSV or XLSX file.');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto Column Detection
  const autoDetection = useMemo(() => {
    if (!rawRows || rawRows.length === 0) return { allColumns: [] } as any;
    return detectDatasetColumns(rawRows, columns);
  }, [rawRows, columns]);

  // Data Quality Report
  const dataQualityReport = useMemo(() => {
    return calculateDataQualityReport(rawRows, columns, columnMapping);
  }, [rawRows, columns, columnMapping]);

  // Data Cleaning Step
  const { cleanedRows, metrics: cleaningMetrics } = useMemo(() => {
    return cleanDataset(rawRows, columnMapping, cleaningConfig);
  }, [rawRows, columnMapping, cleaningConfig]);

  // Available Filter Attributes
  const availableProducts = useMemo(() => {
    return Array.from(new Set(cleanedRows.map(r => r.product || 'General').filter(Boolean)));
  }, [cleanedRows]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(cleanedRows.map(r => r.category || 'General').filter(Boolean)));
  }, [cleanedRows]);

  const priceLimits = useMemo(() => {
    const prices = cleanedRows.map(r => r.price).filter(p => p !== undefined && p !== null && !isNaN(Number(p))) as number[];
    if (prices.length === 0) return { min: 0, max: 1000 };
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [cleanedRows]);

  const maxReviewLengthLimit = useMemo(() => {
    const lens = cleanedRows.map(r => r.originalText?.length || 0);
    return lens.length > 0 ? Math.max(...lens) : 1000;
  }, [cleanedRows]);

  // Dynamic Filtering Logic
  const filteredRows = useMemo(() => {
    return cleanedRows.filter(row => {
      // Product Filter
      if (dashboardFilters.products.length > 0) {
        const p = row.product || 'General';
        if (!dashboardFilters.products.includes(p)) return false;
      }

      // Category Filter
      if (dashboardFilters.categories.length > 0) {
        const c = row.category || 'General';
        if (!dashboardFilters.categories.includes(c)) return false;
      }

      // Rating Filter
      if (dashboardFilters.ratings.length > 0) {
        if (!row.rating || !dashboardFilters.ratings.includes(row.rating)) return false;
      }

      // Sentiment Filter
      if (dashboardFilters.sentiments.length > 0) {
        if (!row.sentiment || !dashboardFilters.sentiments.includes(row.sentiment)) return false;
      }

      // Date Range Filter
      if (dashboardFilters.startDate && row.date) {
        if (String(row.date) < dashboardFilters.startDate) return false;
      }
      if (dashboardFilters.endDate && row.date) {
        if (String(row.date) > dashboardFilters.endDate) return false;
      }

      // Price Range Filter
      if (row.price !== undefined && row.price !== null) {
        if (row.price > dashboardFilters.maxPrice) return false;
      }

      // Review Length Filter
      if (row.originalText) {
        if (row.originalText.length > dashboardFilters.maxReviewLength) return false;
      }

      return true;
    });
  }, [cleanedRows, dashboardFilters]);

  // Downstream BI Calculations computed dynamically on filteredRows
  const sentimentResult = useMemo(() => runSentimentAnalysis(filteredRows), [filteredRows]);
  const textMiningResult = useMemo(() => runTextMining(filteredRows), [filteredRows]);
  const topicInfo = useMemo(() => runTopicModeling(filteredRows), [filteredRows]);
  const aspectSentiment = useMemo(() => runAspectSentimentAnalysis(filteredRows), [filteredRows]);
  const associationResult = useMemo(() => runAssociationMining(filteredRows), [filteredRows]);
  const edaMetrics = useMemo(() => runEDA(filteredRows), [filteredRows]);

  const availableTopics = useMemo(() => topicInfo.map(t => t.name), [topicInfo]);
  const availableAspects = useMemo(() => aspectSentiment.map(a => a.aspect), [aspectSentiment]);

  const automatedInsights = useMemo(() => {
    return generateAutomatedInsights(
      filteredRows,
      sentimentResult,
      textMiningResult,
      aspectSentiment,
      columnMapping.productCol
    );
  }, [filteredRows, sentimentResult, textMiningResult, aspectSentiment, columnMapping]);

  // CSV & Report Downloads
  const handleDownloadCleanedCsv = () => {
    const csvContent = generateCleanedCSV(filteredRows);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cleaned_${fileName.replace(/\.[^/.]+$/, '')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadHtmlReport = () => {
    const htmlContent = generateHTMLReport(
      fileName,
      dataQualityReport,
      edaMetrics,
      sentimentResult,
      textMiningResult,
      topicInfo,
      aspectSentiment,
      automatedInsights
    );
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bi_intelligence_report_${fileName.replace(/\.[^/.]+$/, '')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetName={fileName}
        totalRows={rawRows.length}
        totalCols={columns.length}
        onResetSample={() => handleLoadSample('mobile_reviews')}
      />

      {/* Main Body with Persistent Sidebar & Content Area */}
      <div className="flex-1 flex w-full">
        {/* Left BI Sidebar Slicers */}
        <SidebarFilters
          filters={dashboardFilters}
          onFilterChange={setDashboardFilters}
          onResetFilters={() => setDashboardFilters(initialFilterState)}
          availableProducts={availableProducts}
          availableCategories={availableCategories}
          availableTopics={availableTopics}
          availableAspects={availableAspects}
          minPriceLimit={priceLimits.min}
          maxPriceLimit={priceLimits.max}
          maxReviewLengthLimit={maxReviewLengthLimit}
          totalFilteredCount={filteredRows.length}
          totalRawCount={cleanedRows.length}
        />

        {/* Dashboard Main Workspace Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto overflow-x-hidden">
          
          {/* Top 20 KPI Cards Grid displayed across analysis tabs */}
          {activeTab !== 'upload' && activeTab !== 'python_export' && (
            <KPICardsGrid
              rows={filteredRows}
              cleaningMetrics={cleaningMetrics}
              rawCount={rawRows.length}
            />
          )}

          {/* Dataset Upload & Column Mapping */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              <FileUploadSection
                onFileUpload={handleFileUpload}
                onSelectSample={handleLoadSample}
                sampleDatasets={SAMPLE_DATASETS}
                currentDatasetMeta={{
                  fileName,
                  fileSizeKB,
                  totalRows: rawRows.length,
                  totalColumns: columns.length,
                  error: errorMessage
                }}
                isLoading={isLoading}
              />

              <ColumnDetectionSection
                autoDetection={autoDetection}
                columnMapping={columnMapping}
                onUpdateMapping={setColumnMapping}
                columns={columns}
              />
            </div>
          )}

          {/* Tab 1 → Overview */}
          {activeTab === 'overview' && (
            <OverviewTab
              rows={filteredRows}
              sentiment={sentimentResult}
              eda={edaMetrics}
              cleaningMetrics={cleaningMetrics}
            />
          )}

          {/* Tab 2 → Data Quality */}
          {activeTab === 'quality' && (
            <div className="space-y-6">
              <DataQualityTab
                report={dataQualityReport}
                cleaningMetrics={cleaningMetrics}
                cleanedRows={filteredRows}
              />
              <DataCleanerSection
                config={cleaningConfig}
                onChangeConfig={setCleaningConfig}
                metrics={cleaningMetrics}
                sampleCleanedRows={filteredRows}
                onDownloadCsv={handleDownloadCleanedCsv}
              />
            </div>
          )}

          {/* Tab 3 → EDA & Rating Analysis */}
          {activeTab === 'eda' && (
            <EDARatingTab
              rows={filteredRows}
              eda={edaMetrics}
            />
          )}

          {/* Tab 4 → Sentiment Analysis */}
          {activeTab === 'sentiment' && (
            <SentimentTab
              rows={filteredRows}
              sentiment={sentimentResult}
            />
          )}

          {/* Tab 5 → Text Mining */}
          {activeTab === 'text_mining' && (
            <TextAnalysisTab
              textMining={textMiningResult}
            />
          )}

          {/* Tab 6 → Data Mining (Association Rules) */}
          {activeTab === 'association' && (
            <DataMiningTab
              associationResult={associationResult}
            />
          )}

          {/* Tab 7 → Topic Modeling */}
          {activeTab === 'topics' && (
            <TopicModelingTab
              topics={topicInfo}
            />
          )}

          {/* Tab 8 → Product Comparison & Aspect Analysis */}
          {activeTab === 'comparison' && (
            <ProductAspectTab
              aspects={aspectSentiment}
              rows={filteredRows}
            />
          )}

          {/* Tab 9 → Insights */}
          {activeTab === 'insights' && (
            <InsightsSection
              insights={automatedInsights}
              onDownloadHtmlReport={handleDownloadHtmlReport}
              datasetName={fileName}
            />
          )}

          {/* Tab 10 → Downloads & Interactive Tables */}
          {activeTab === 'tables_downloads' && (
            <TablesDownloadsTab
              rawRows={rawRows}
              cleanedRows={filteredRows}
              sentiment={sentimentResult}
              associationResult={associationResult}
              topics={topicInfo}
              onDownloadCleanedCsv={handleDownloadCleanedCsv}
              onDownloadHtmlReport={handleDownloadHtmlReport}
            />
          )}

          {/* Python Codebase Exporter */}
          {activeTab === 'python_export' && (
            <PythonExporterSection />
          )}

        </main>
      </div>
    </div>
  );
};

export default App;
