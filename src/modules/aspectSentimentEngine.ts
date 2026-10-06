import { AspectSentimentItem, CleanedReviewRow } from '../types';

interface AspectDefinition {
  aspect: string;
  keywords: string[];
}

const DOMAIN_ASPECTS: AspectDefinition[] = [
  { aspect: 'Battery & Power', keywords: ['battery', 'charge', 'charging', 'backup', 'drain', 'watt', 'charger', 'power'] },
  { aspect: 'Camera & Video', keywords: ['camera', 'photo', 'night', 'lens', 'portrait', 'zoom', 'bokeh', 'picture', 'video', 'macro'] },
  { aspect: 'Display & Screen', keywords: ['display', 'screen', 'oled', 'bright', 'refresh', 'resolution', 'glare'] },
  { aspect: 'Performance & Speed', keywords: ['performance', 'processor', 'speed', 'chip', 'lag', 'multitasking', 'ram', 'smooth', 'fast'] },
  { aspect: 'Build & Ergonomics', keywords: ['build', 'design', 'weight', 'lightweight', 'titanium', 'bezel', 'durable', 'sturdy', 'form'] },
  { aspect: 'Price & Value', keywords: ['price', 'value', 'overpriced', 'affordable', 'cost', 'money', 'expensive', 'worth', 'deal'] },
  { aspect: 'Food & Culinary Taste', keywords: ['food', 'taste', 'flavor', 'crust', 'broth', 'pizza', 'ramen', 'burger', 'steak', 'dessert'] },
  { aspect: 'Staff & Hospitality', keywords: ['staff', 'service', 'desk', 'courteous', 'rude', 'valet', 'check-in', 'waiter', 'waitress'] },
  { aspect: 'Room & Hygiene', keywords: ['room', 'cleanliness', 'bed', 'bathroom', 'pool', 'spa', 'view', 'air', 'housekeeping'] },
  { aspect: 'Audio & Sound', keywords: ['sound', 'audio', 'speaker', 'mic', 'microphones', 'volume', 'music', 'noise'] },
  { aspect: 'Delivery & Packaging', keywords: ['delivery', 'box', 'packaging', 'shipping', 'arrived', 'courier'] }
];

export function runAspectSentimentAnalysis(rows: CleanedReviewRow[]): AspectSentimentItem[] {
  if (!rows || rows.length === 0) return [];

  const aspectStats: Record<string, {
    positive: number;
    negative: number;
    neutral: number;
    samplePositive: string[];
    sampleNegative: string[];
  }> = {};

  DOMAIN_ASPECTS.forEach(def => {
    aspectStats[def.aspect] = {
      positive: 0,
      negative: 0,
      neutral: 0,
      samplePositive: [],
      sampleNegative: []
    };
  });

  for (const row of rows) {
    const tokens = row.tokens || [];
    const textLower = row.originalText.toLowerCase();

    DOMAIN_ASPECTS.forEach(def => {
      const matched = def.keywords.some(kw => tokens.includes(kw) || textLower.includes(kw));
      if (matched) {
        const stats = aspectStats[def.aspect];
        if (row.sentiment === 'positive') {
          stats.positive++;
          if (stats.samplePositive.length < 2) {
            stats.samplePositive.push(row.originalText);
          }
        } else if (row.sentiment === 'negative') {
          stats.negative++;
          if (stats.sampleNegative.length < 2) {
            stats.sampleNegative.push(row.originalText);
          }
        } else {
          stats.neutral++;
        }
      }
    });
  }

  const results: AspectSentimentItem[] = [];

  DOMAIN_ASPECTS.forEach(def => {
    const stats = aspectStats[def.aspect];
    const total = stats.positive + stats.negative + stats.neutral;

    if (total > 0) {
      const positivePct = Number(((stats.positive / total) * 100).toFixed(1));
      const negativePct = Number(((stats.negative / total) * 100).toFixed(1));

      results.push({
        aspect: def.aspect,
        positive: stats.positive,
        negative: stats.negative,
        neutral: stats.neutral,
        total,
        positivePct,
        negativePct,
        samplePositive: stats.samplePositive,
        sampleNegative: stats.sampleNegative
      });
    }
  });

  // Sort aspects by total mentions
  return results.sort((a, b) => b.total - a.total);
}
