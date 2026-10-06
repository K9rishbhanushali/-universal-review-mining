import { ChartDataPoint, CleanedReviewRow, EDAMetrics } from '../types';

export function runEDA(rows: CleanedReviewRow[]): EDAMetrics {
  if (!rows || rows.length === 0) {
    return {
      totalReviews: 0,
      avgRating: 0,
      totalProducts: 0,
      totalCategories: 0,
      ratingDistribution: [],
      reviewsByProduct: [],
      avgRatingByProduct: [],
      reviewsByCategory: [],
      timelineData: [],
      reviewLengthDistribution: [],
      topProducts: [],
      ratingVsLengthData: [],
      ratingVsPriceData: []
    };
  }

  const totalReviews = rows.length;

  // Rating Distribution
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let ratingSum = 0;
  let validRatingCount = 0;

  rows.forEach(r => {
    if (r.rating && r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating]++;
      ratingSum += r.rating;
      validRatingCount++;
    }
  });

  const avgRating = validRatingCount > 0 ? Number((ratingSum / validRatingCount).toFixed(2)) : 0;

  const ratingDistribution: ChartDataPoint[] = [1, 2, 3, 4, 5].map(star => ({
    label: `${star} Star${star > 1 ? 's' : ''}`,
    value: ratingCounts[star],
    color: star >= 4 ? '#16a34a' : star === 3 ? '#d97706' : '#dc2626'
  }));

  // Product aggregations
  const productStats: Record<string, { count: number; ratingSum: number }> = {};
  rows.forEach(r => {
    const prod = r.product || 'General / Unspecified';
    if (!productStats[prod]) {
      productStats[prod] = { count: 0, ratingSum: 0 };
    }
    productStats[prod].count++;
    if (r.rating) productStats[prod].ratingSum += r.rating;
  });

  const totalProducts = Object.keys(productStats).filter(p => p !== 'General / Unspecified').length;

  const reviewsByProduct: ChartDataPoint[] = Object.entries(productStats)
    .map(([prod, st]) => ({ label: prod, value: st.count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const avgRatingByProduct: ChartDataPoint[] = Object.entries(productStats)
    .map(([prod, st]) => ({
      label: prod,
      value: st.count > 0 && st.ratingSum > 0 ? Number((st.ratingSum / st.count).toFixed(2)) : 0
    }))
    .filter(p => p.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const topProducts = Object.entries(productStats)
    .map(([prod, st]) => ({
      product: prod,
      reviewCount: st.count,
      avgRating: st.ratingSum > 0 ? Number((st.ratingSum / st.count).toFixed(2)) : 0
    }))
    .sort((a, b) => b.reviewCount - a.reviewCount)
    .slice(0, 5);

  // Category aggregations
  const categoryStats: Record<string, number> = {};
  rows.forEach(r => {
    const cat = r.category || 'Default Category';
    categoryStats[cat] = (categoryStats[cat] || 0) + 1;
  });

  const totalCategories = Object.keys(categoryStats).filter(c => c !== 'Default Category').length;

  const reviewsByCategory: ChartDataPoint[] = Object.entries(categoryStats)
    .map(([cat, count]) => ({ label: cat, value: count }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Timeline aggregation
  const timelineMap: Record<string, number> = {};
  rows.forEach(r => {
    if (r.date) {
      const dateStr = String(r.date).slice(0, 7); // YYYY-MM or ISO prefix
      timelineMap[dateStr] = (timelineMap[dateStr] || 0) + 1;
    }
  });

  const timelineData: ChartDataPoint[] = Object.entries(timelineMap)
    .map(([date, count]) => ({ label: date, value: count }))
    .sort((a, b) => a.label.localeCompare(b.label));

  // Review Length Distribution
  const lengthBins: Record<string, number> = {
    '0 - 50 chars': 0,
    '51 - 100 chars': 0,
    '101 - 200 chars': 0,
    '201 - 400 chars': 0,
    '400+ chars': 0
  };

  rows.forEach(r => {
    const len = r.originalText.length;
    if (len <= 50) lengthBins['0 - 50 chars']++;
    else if (len <= 100) lengthBins['51 - 100 chars']++;
    else if (len <= 200) lengthBins['101 - 200 chars']++;
    else if (len <= 400) lengthBins['201 - 400 chars']++;
    else lengthBins['400+ chars']++;
  });

  const reviewLengthDistribution: ChartDataPoint[] = Object.entries(lengthBins).map(([bin, val]) => ({
    label: bin,
    value: val
  }));

  // Scatter Data
  const ratingVsLengthData = rows
    .filter(r => r.rating !== undefined)
    .map(r => ({
      rating: r.rating!,
      length: r.originalText.length,
      text: r.originalText.slice(0, 60) + '...'
    }))
    .slice(0, 50);

  const ratingVsPriceData = rows
    .filter(r => r.rating !== undefined && r.price !== undefined)
    .map(r => ({
      rating: r.rating!,
      price: r.price!,
      product: r.product || 'Product'
    }))
    .slice(0, 50);

  return {
    totalReviews,
    avgRating,
    totalProducts,
    totalCategories,
    ratingDistribution,
    reviewsByProduct,
    avgRatingByProduct,
    reviewsByCategory,
    timelineData,
    reviewLengthDistribution,
    topProducts,
    ratingVsLengthData,
    ratingVsPriceData
  };
}
