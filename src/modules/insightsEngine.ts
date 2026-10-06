import { AspectSentimentItem, AutomatedInsight, CleanedReviewRow, SentimentAnalysisResult, TextMiningResult } from '../types';

export function generateAutomatedInsights(
  rows: CleanedReviewRow[],
  sentiment: SentimentAnalysisResult,
  textMining: TextMiningResult,
  aspects: AspectSentimentItem[],
  productCol?: string
): AutomatedInsight[] {
  const insights: AutomatedInsight[] = [];

  if (!rows || rows.length === 0) return insights;

  // 1. Overall Sentiment Insight
  const { positivePct, negativePct, neutralPct, totalCount = rows.length } = { ...sentiment, totalCount: rows.length };
  if (positivePct >= 60) {
    insights.push({
      type: 'positive',
      category: 'Overall Sentiment',
      title: 'Strong Customer Satisfaction',
      statement: `Positive reviews represent ${positivePct}% of all ${totalCount} analyzed reviews.`,
      evidence: `Calculated from ${sentiment.positiveCount} positive, ${sentiment.negativeCount} negative, and ${sentiment.neutralCount} neutral reviews.`
    });
  } else if (negativePct >= 40) {
    insights.push({
      type: 'warning',
      category: 'Overall Sentiment',
      title: 'Elevated Customer Friction',
      statement: `Negative sentiment accounts for ${negativePct}% of total reviews, signaling customer dissatisfaction.`,
      evidence: `${sentiment.negativeCount} out of ${totalCount} reviews were classified as negative.`
    });
  } else {
    insights.push({
      type: 'neutral',
      category: 'Overall Sentiment',
      title: 'Balanced Customer Feedback',
      statement: `Feedback is mixed: ${positivePct}% Positive, ${neutralPct}% Neutral, and ${negativePct}% Negative.`,
      evidence: `Average sentiment score across all reviews is ${sentiment.avgSentimentScore}.`
    });
  }

  // 2. Aspect-Based Insights
  if (aspects && aspects.length > 0) {
    const topPositiveAspect = [...aspects].sort((a, b) => b.positivePct - a.positivePct)[0];
    const topNegativeAspect = [...aspects].sort((a, b) => b.negativePct - a.negativePct)[0];

    if (topPositiveAspect && topPositiveAspect.positivePct > 50) {
      insights.push({
        type: 'positive',
        category: 'Aspect Delight',
        title: `Highest Praise for ${topPositiveAspect.aspect}`,
        statement: `${topPositiveAspect.aspect} is the most positively rated aspect, with ${topPositiveAspect.positivePct}% positive sentiment.`,
        evidence: `Mentioned in ${topPositiveAspect.total} reviews (${topPositiveAspect.positive} positive vs ${topPositiveAspect.negative} negative).`
      });
    }

    if (topNegativeAspect && topNegativeAspect.negativePct > 20) {
      insights.push({
        type: 'negative',
        category: 'Aspect Friction',
        title: `Primary Complaint Center: ${topNegativeAspect.aspect}`,
        statement: `${topNegativeAspect.aspect}-related complaints appear frequently in negative reviews (${topNegativeAspect.negativePct}% negative sentiment).`,
        evidence: `${topNegativeAspect.negative} negative mentions recorded out of ${topNegativeAspect.total} total aspect references.`
      });
    }
  }

  // 3. Product / Brand Performance Insights
  if (productCol) {
    const productStats: Record<string, { total: number; ratings: number[]; negativeCount: number }> = {};
    for (const r of rows) {
      if (r.product) {
        if (!productStats[r.product]) {
          productStats[r.product] = { total: 0, ratings: [], negativeCount: 0 };
        }
        productStats[r.product].total++;
        if (r.rating) productStats[r.product].ratings.push(r.rating);
        if (r.sentiment === 'negative') productStats[r.product].negativeCount++;
      }
    }

    const productEntries = Object.entries(productStats).map(([prod, st]) => ({
      product: prod,
      total: st.total,
      avgRating: st.ratings.length > 0 ? Number((st.ratings.reduce((a, b) => a + b, 0) / st.ratings.length).toFixed(2)) : 0,
      negativeCount: st.negativeCount
    })).filter(p => p.total >= 2);

    if (productEntries.length > 1) {
      const topRated = [...productEntries].sort((a, b) => b.avgRating - a.avgRating)[0];
      const mostNegative = [...productEntries].sort((a, b) => b.negativeCount - a.negativeCount)[0];

      if (topRated) {
        insights.push({
          type: 'positive',
          category: 'Top Performer',
          title: `Highest Rated Item: ${topRated.product}`,
          statement: `'${topRated.product}' achieved the highest average rating of ${topRated.avgRating} / 5 stars across ${topRated.total} reviews.`,
          evidence: `Outperformed other items in the dataset by average score.`
        });
      }

      if (mostNegative && mostNegative.negativeCount > 0) {
        insights.push({
          type: 'warning',
          category: 'Quality Watchlist',
          title: `Highest Defect/Complaint Volume: ${mostNegative.product}`,
          statement: `'${mostNegative.product}' received the highest number of negative reviews (${mostNegative.negativeCount} complaints).`,
          evidence: `Ranks highest in absolute complaint volume across product catalog.`
        });
      }
    }
  }

  // 4. Text Mining Key Phrase Insight
  if (textMining && textMining.bigrams && textMining.bigrams.length > 0) {
    const topBigram = textMining.bigrams[0];
    insights.push({
      type: 'info',
      category: 'Dominant Discussion Pair',
      title: `Most Frequent Key Phrase: "${topBigram.ngram}"`,
      statement: `The key phrase "${topBigram.ngram}" is the most frequently co-occurring word combination (${topBigram.count} occurrences).`,
      evidence: `Extracted via n-gram frequency extraction across clean tokenized reviews.`
    });
  }

  return insights;
}
