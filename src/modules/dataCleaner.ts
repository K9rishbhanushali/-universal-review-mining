import { CleanedReviewRow, CleaningConfig, CleaningMetrics, ColumnMapping, DatasetRow } from '../types';
import { preprocessText } from './textPreprocessing';
import { analyzeSentimentScore } from './sentimentEngine';

export const DEFAULT_CLEANING_CONFIG: CleaningConfig = {
  removeMissing: true,
  removeDuplicates: true,
  removeHtml: true,
  removeUrls: true,
  removePunctuation: true,
  removeSpecialChars: true,
  lowercaseText: true,
  minLength: 5,
  customStopwords: ''
};

export function cleanDataset(
  rawData: DatasetRow[],
  mapping: ColumnMapping,
  config: CleaningConfig = DEFAULT_CLEANING_CONFIG
): { cleanedRows: CleanedReviewRow[]; metrics: CleaningMetrics } {
  const rowsBefore = rawData.length;
  let duplicatesRemoved = 0;
  let emptyReviewsRemoved = 0;
  let shortReviewsRemoved = 0;

  const seenText = new Set<string>();
  const cleanedRows: CleanedReviewRow[] = [];

  const { reviewCol, ratingCol, productCol, dateCol, categoryCol, priceCol } = mapping;

  let rowCounter = 1;

  for (const row of rawData) {
    const originalText = row[reviewCol] ? String(row[reviewCol]).trim() : '';

    // Check missing / empty
    if (config.removeMissing && !originalText) {
      emptyReviewsRemoved++;
      continue;
    }

    // Check duplicates
    const normalizedOriginal = originalText.toLowerCase();
    if (config.removeDuplicates) {
      if (seenText.has(normalizedOriginal)) {
        duplicatesRemoved++;
        continue;
      }
      seenText.add(normalizedOriginal);
    }

    // Text preprocessing
    const { cleanText, tokens } = preprocessText(originalText, config);

    // Check minimum length
    if (originalText.length < config.minLength || cleanText.length === 0) {
      shortReviewsRemoved++;
      continue;
    }

    // Parse Rating
    let rating: number | undefined = undefined;
    if (ratingCol && row[ratingCol] !== undefined && row[ratingCol] !== null) {
      const parsed = Number(row[ratingCol]);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 10) {
        // Normalize 10-star to 5-star if needed
        rating = parsed > 5 ? Math.round(parsed / 2) : Math.round(parsed);
      }
    }

    // Parse Price
    let price: number | undefined = undefined;
    if (priceCol && row[priceCol] !== undefined && row[priceCol] !== null) {
      const parsedPrice = Number(row[priceCol]);
      if (!isNaN(parsedPrice)) {
        price = parsedPrice;
      }
    }

    // Compute sentiment classification and score
    const { sentiment, score: sentimentScore } = analyzeSentimentScore(tokens, rating);

    const cleanedRow: CleanedReviewRow = {
      id: rowCounter++,
      originalText,
      cleanText,
      tokens,
      rating,
      sentiment,
      sentimentScore,
      product: productCol && row[productCol] ? String(row[productCol]).trim() : undefined,
      category: categoryCol && row[categoryCol] ? String(row[categoryCol]).trim() : undefined,
      date: dateCol && row[dateCol] ? String(row[dateCol]).trim() : undefined,
      price
    };

    cleanedRows.push(cleanedRow);
  }

  const rowsAfter = cleanedRows.length;
  const rowsRemoved = rowsBefore - rowsAfter;

  return {
    cleanedRows,
    metrics: {
      rowsBefore,
      rowsAfter,
      rowsRemoved,
      duplicatesRemoved,
      emptyReviewsRemoved,
      shortReviewsRemoved
    }
  };
}
