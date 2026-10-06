export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface DatasetRow {
  [key: string]: any;
}

export interface ColumnMapping {
  reviewCol: string;
  ratingCol: string;
  productCol: string;
  dateCol: string;
  categoryCol: string;
  priceCol: string;
}

export interface DetectedColumnInfo {
  detectedCol: string;
  confidence: 'high' | 'medium' | 'low';
  type: string;
  sampleValues: string[];
  uniqueCount: number;
}

export interface AutoDetectionResult {
  review: DetectedColumnInfo | null;
  rating: DetectedColumnInfo | null;
  product: DetectedColumnInfo | null;
  date: DetectedColumnInfo | null;
  category: DetectedColumnInfo | null;
  price: DetectedColumnInfo | null;
  allColumns: string[];
}

export interface ColumnDataType {
  column: string;
  type: 'text' | 'number' | 'date' | 'categorical' | 'boolean';
  nonNullCount: number;
  nullCount: number;
  uniqueCount: number;
}

export interface DataQualityReport {
  totalRows: number;
  totalColumns: number;
  missingValuesCount: number;
  missingValuesPct: number;
  duplicateRowsCount: number;
  duplicateRowsPct: number;
  columnDataTypes: ColumnDataType[];
  memoryUsageKB: number;
  detectedReviewCol: string;
  detectedRatingCol: string;
  detectedProductCol: string;
}

export interface CleaningConfig {
  removeMissing: boolean;
  removeDuplicates: boolean;
  removeHtml: boolean;
  removeUrls: boolean;
  removePunctuation: boolean;
  removeSpecialChars: boolean;
  lowercaseText: boolean;
  minLength: number;
  customStopwords: string;
}

export interface CleanedReviewRow {
  id: number;
  originalText: string;
  cleanText: string;
  tokens: string[];
  rating?: number;
  product?: string;
  category?: string;
  date?: string;
  price?: number;
  sentiment?: SentimentType;
  sentimentScore?: number;
  [key: string]: any;
}

export interface CleaningMetrics {
  rowsBefore: number;
  rowsAfter: number;
  rowsRemoved: number;
  duplicatesRemoved: number;
  emptyReviewsRemoved: number;
  shortReviewsRemoved: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  category?: string;
  color?: string;
  [key: string]: any;
}

export interface EDAMetrics {
  totalReviews: number;
  avgRating: number;
  totalProducts: number;
  totalCategories: number;
  ratingDistribution: ChartDataPoint[];
  reviewsByProduct: ChartDataPoint[];
  avgRatingByProduct: ChartDataPoint[];
  reviewsByCategory: ChartDataPoint[];
  timelineData: ChartDataPoint[];
  reviewLengthDistribution: ChartDataPoint[];
  topProducts: { product: string; reviewCount: number; avgRating: number }[];
  ratingVsLengthData: { rating: number; length: number; text: string }[];
  ratingVsPriceData: { rating: number; price: number; product: string }[];
}

export interface ConfusionMatrix {
  tp: number;
  fp: number;
  tn: number;
  fn: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface SentimentAnalysisResult {
  positiveCount: number;
  positivePct: number;
  negativeCount: number;
  negativePct: number;
  neutralCount: number;
  neutralPct: number;
  avgSentimentScore: number;
  mlMetrics: ConfusionMatrix;
  annotatedRows: CleanedReviewRow[];
}

export interface RatingVsSentimentCell {
  rating: number;
  positive: number;
  neutral: number;
  negative: number;
  total: number;
  positivePct: number;
  negativePct: number;
}

export interface RatingSentimentMatrix {
  matrix: RatingVsSentimentCell[];
  mismatches: {
    review: string;
    rating: number;
    sentiment: SentimentType;
    reason: string;
  }[];
}

export interface WordFrequency {
  word: string;
  count: number;
  frequency: number;
}

export interface NGramFrequency {
  ngram: string;
  count: number;
}

export interface TFIDFWord {
  word: string;
  score: number;
}

export interface WordCloudItem {
  text: string;
  value: number;
  color: string;
}

export interface TextMiningResult {
  frequentWords: WordFrequency[];
  topPositiveWords: WordFrequency[];
  topNegativeWords: WordFrequency[];
  bigrams: NGramFrequency[];
  trigrams: NGramFrequency[];
  tfidfWords: TFIDFWord[];
  wordCloudAll: WordCloudItem[];
  wordCloudPositive: WordCloudItem[];
  wordCloudNegative: WordCloudItem[];
}

export interface TopicInfo {
  id: number;
  name: string;
  keywords: string[];
  weight: number;
  sampleReview: string;
}

export interface AspectSentimentItem {
  aspect: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  positivePct: number;
  negativePct: number;
  samplePositive: string[];
  sampleNegative: string[];
}

export interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  ruleString: string;
  support: number;
  confidence: number;
  lift: number;
  explanation: string;
}

export interface AssociationMiningResult {
  itemsets: { items: string[]; support: number }[];
  rules: AssociationRule[];
}

export interface AutomatedInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning' | 'info';
  category: string;
  title: string;
  statement: string;
  evidence: string;
}

export interface ProductComparisonMetric {
  entity: string;
  totalReviews: number;
  avgRating: number;
  positivePct: number;
  negativePct: number;
  topAspect: string;
  topComplaint: string;
  avgReviewLength: number;
}

export interface PythonCodeFile {
  name: string;
  path: string;
  content: string;
  description: string;
}

export interface SampleDatasetMeta {
  id: string;
  name: string;
  description: string;
  category: string;
  sampleRowsCount: number;
  fileName: string;
  data: DatasetRow[];
}
