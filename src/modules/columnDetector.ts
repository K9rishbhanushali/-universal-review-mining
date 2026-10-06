import { AutoDetectionResult, ColumnMapping, DatasetRow, DetectedColumnInfo } from '../types';

export function detectDatasetColumns(data: DatasetRow[], columns?: string[]): AutoDetectionResult {
  return autoDetectColumns(data);
}

export function autoDetectColumns(data: DatasetRow[]): AutoDetectionResult {
  if (!data || data.length === 0) {
    return {
      review: null,
      rating: null,
      product: null,
      date: null,
      category: null,
      price: null,
      allColumns: []
    };
  }

  const columns = Object.keys(data[0]);
  const sampleSize = Math.min(data.length, 50);
  const samples = data.slice(0, sampleSize);

  // Column statistics
  const statsMap: Record<string, {
    avgLength: number;
    sampleVals: string[];
    uniqueCount: number;
    isNumeric: boolean;
    minNum: number;
    maxNum: number;
    isDateLike: boolean;
  }> = {};

  for (const col of columns) {
    const vals = samples.map(s => s[col]).filter(v => v !== null && v !== undefined && String(v).trim() !== '');
    const strVals = vals.map(v => String(v));
    const totalLen = strVals.reduce((acc, str) => acc + str.length, 0);
    const avgLen = strVals.length > 0 ? totalLen / strVals.length : 0;
    
    const numVals = vals.map(v => Number(v)).filter(v => !isNaN(v));
    const isNumeric = numVals.length > 0 && numVals.length >= vals.length * 0.8;
    const minNum = isNumeric ? Math.min(...numVals) : 0;
    const maxNum = isNumeric ? Math.max(...numVals) : 0;

    const dateRegex = /^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}/;
    const dateLikeCount = strVals.filter(s => dateRegex.test(s) || !isNaN(Date.parse(s))).length;
    const isDateLike = dateLikeCount >= strVals.length * 0.6 && strVals.length > 0;

    const uniqueSet = new Set(strVals);

    statsMap[col] = {
      avgLength: avgLen,
      sampleVals: strVals.slice(0, 3),
      uniqueCount: uniqueSet.size,
      isNumeric,
      minNum,
      maxNum,
      isDateLike
    };
  }

  // 1. Review Column Detection
  let reviewCol: DetectedColumnInfo | null = null;
  const reviewKeywords = ['review', 'reviews', 'review_text', 'comment', 'comments', 'feedback', 'text', 'description', 'content', 'body', 'opinion', 'message'];
  
  // Exact or keyword match
  for (const col of columns) {
    const lowerCol = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (reviewKeywords.some(kw => lowerCol.includes(kw))) {
      reviewCol = {
        detectedCol: col,
        confidence: 'high',
        type: 'text',
        sampleValues: statsMap[col].sampleVals,
        uniqueCount: statsMap[col].uniqueCount
      };
      break;
    }
  }

  // Fallback heuristic: column with longest average text length
  if (!reviewCol) {
    let maxAvgLen = 0;
    let bestCol = '';
    for (const col of columns) {
      if (statsMap[col].avgLength > maxAvgLen && !statsMap[col].isNumeric) {
        maxAvgLen = statsMap[col].avgLength;
        bestCol = col;
      }
    }
    if (bestCol && maxAvgLen > 15) {
      reviewCol = {
        detectedCol: bestCol,
        confidence: 'medium',
        type: 'text',
        sampleValues: statsMap[bestCol].sampleVals,
        uniqueCount: statsMap[bestCol].uniqueCount
      };
    }
  }

  // 2. Rating Column Detection
  let ratingCol: DetectedColumnInfo | null = null;
  const ratingKeywords = ['rating', 'ratings', 'score', 'stars', 'review_score', 'rate', 'grade', 'points'];

  for (const col of columns) {
    const lowerCol = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (ratingKeywords.some(kw => lowerCol.includes(kw))) {
      ratingCol = {
        detectedCol: col,
        confidence: 'high',
        type: 'number',
        sampleValues: statsMap[col].sampleVals,
        uniqueCount: statsMap[col].uniqueCount
      };
      break;
    }
  }

  if (!ratingCol) {
    for (const col of columns) {
      const st = statsMap[col];
      if (st.isNumeric && st.minNum >= 0 && st.maxNum <= 10 && st.uniqueCount <= 10) {
        ratingCol = {
          detectedCol: col,
          confidence: 'medium',
          type: 'number',
          sampleValues: st.sampleVals,
          uniqueCount: st.uniqueCount
        };
        break;
      }
    }
  }

  // 3. Product Column Detection
  let productCol: DetectedColumnInfo | null = null;
  const productKeywords = ['product', 'product_name', 'item', 'item_name', 'brand', 'model', 'title', 'device', 'dish_name', 'hotel_name'];

  for (const col of columns) {
    const lowerCol = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (productKeywords.some(kw => lowerCol.includes(kw))) {
      productCol = {
        detectedCol: col,
        confidence: 'high',
        type: 'text',
        sampleValues: statsMap[col].sampleVals,
        uniqueCount: statsMap[col].uniqueCount
      };
      break;
    }
  }

  // 4. Date Column Detection
  let dateCol: DetectedColumnInfo | null = null;
  const dateKeywords = ['date', 'review_date', 'created_at', 'timestamp', 'time', 'posted_at'];

  for (const col of columns) {
    const lowerCol = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (dateKeywords.some(kw => lowerCol.includes(kw))) {
      dateCol = {
        detectedCol: col,
        confidence: 'high',
        type: 'date',
        sampleValues: statsMap[col].sampleVals,
        uniqueCount: statsMap[col].uniqueCount
      };
      break;
    }
  }

  if (!dateCol) {
    for (const col of columns) {
      if (statsMap[col].isDateLike) {
        dateCol = {
          detectedCol: col,
          confidence: 'medium',
          type: 'date',
          sampleValues: statsMap[col].sampleVals,
          uniqueCount: statsMap[col].uniqueCount
        };
        break;
      }
    }
  }

  // 5. Category Column Detection
  let categoryCol: DetectedColumnInfo | null = null;
  const categoryKeywords = ['category', 'type', 'product_category', 'department', 'genre', 'segment'];

  for (const col of columns) {
    const lowerCol = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (categoryKeywords.some(kw => lowerCol.includes(kw))) {
      categoryCol = {
        detectedCol: col,
        confidence: 'high',
        type: 'categorical',
        sampleValues: statsMap[col].sampleVals,
        uniqueCount: statsMap[col].uniqueCount
      };
      break;
    }
  }

  // 6. Price Column Detection
  let priceCol: DetectedColumnInfo | null = null;
  const priceKeywords = ['price', 'cost', 'amount', 'msrp', 'val', 'price_usd'];

  for (const col of columns) {
    const lowerCol = col.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (priceKeywords.some(kw => lowerCol.includes(kw))) {
      priceCol = {
        detectedCol: col,
        confidence: 'high',
        type: 'number',
        sampleValues: statsMap[col].sampleVals,
        uniqueCount: statsMap[col].uniqueCount
      };
      break;
    }
  }

  return {
    review: reviewCol,
    rating: ratingCol,
    product: productCol,
    date: dateCol,
    category: categoryCol,
    price: priceCol,
    allColumns: columns
  };
}

export function getDefaultMapping(autoResult: AutoDetectionResult): ColumnMapping {
  return {
    reviewCol: autoResult.review?.detectedCol || autoResult.allColumns[0] || '',
    ratingCol: autoResult.rating?.detectedCol || '',
    productCol: autoResult.product?.detectedCol || '',
    dateCol: autoResult.date?.detectedCol || '',
    categoryCol: autoResult.category?.detectedCol || '',
    priceCol: autoResult.price?.detectedCol || ''
  };
}
