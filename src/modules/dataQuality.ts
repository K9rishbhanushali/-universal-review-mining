import { ColumnDataType, DataQualityReport, DatasetRow } from '../types';

export function calculateDataQualityReport(
  data: DatasetRow[],
  columns: string[],
  mapping: { reviewCol: string; ratingCol: string; productCol: string }
): DataQualityReport {
  return generateDataQualityReport(data, mapping.reviewCol, mapping.ratingCol, mapping.productCol);
}

export function generateDataQualityReport(
  data: DatasetRow[],
  reviewCol: string,
  ratingCol: string,
  productCol: string
): DataQualityReport {
  if (!data || data.length === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      missingValuesCount: 0,
      missingValuesPct: 0,
      duplicateRowsCount: 0,
      duplicateRowsPct: 0,
      columnDataTypes: [],
      memoryUsageKB: 0,
      detectedReviewCol: reviewCol,
      detectedRatingCol: ratingCol,
      detectedProductCol: productCol
    };
  }

  const totalRows = data.length;
  const columns = Object.keys(data[0] || {});
  const totalColumns = columns.length;

  let totalCellCount = totalRows * totalColumns;
  let missingValuesCount = 0;

  const columnDataTypes: ColumnDataType[] = [];

  for (const col of columns) {
    let nullCount = 0;
    const uniqueValues = new Set();
    let numCount = 0;

    for (const row of data) {
      const val = row[col];
      if (val === null || val === undefined || String(val).trim() === '') {
        nullCount++;
        missingValuesCount++;
      } else {
        uniqueValues.add(String(val));
        if (!isNaN(Number(val))) {
          numCount++;
        }
      }
    }

    const nonNullCount = totalRows - nullCount;
    let inferredType: ColumnDataType['type'] = 'text';

    if (nonNullCount > 0 && numCount / nonNullCount > 0.8) {
      inferredType = 'number';
    } else if (uniqueValues.size < Math.min(15, totalRows * 0.1)) {
      inferredType = 'categorical';
    } else if (col.toLowerCase().includes('date') || col.toLowerCase().includes('time')) {
      inferredType = 'date';
    }

    columnDataTypes.push({
      column: col,
      type: inferredType,
      nonNullCount,
      nullCount,
      uniqueCount: uniqueValues.size
    });
  }

  // Duplicate rows count
  const rowStrings = new Set<string>();
  let duplicateRowsCount = 0;

  for (const row of data) {
    const rowStr = JSON.stringify(row);
    if (rowStrings.has(rowStr)) {
      duplicateRowsCount++;
    } else {
      rowStrings.add(rowStr);
    }
  }

  const missingValuesPct = totalCellCount > 0 ? Number(((missingValuesCount / totalCellCount) * 100).toFixed(1)) : 0;
  const duplicateRowsPct = totalRows > 0 ? Number(((duplicateRowsCount / totalRows) * 100).toFixed(1)) : 0;

  // Approximate memory usage in KB
  const jsonStr = JSON.stringify(data);
  const memoryUsageKB = Math.round(jsonStr.length / 1024);

  return {
    totalRows,
    totalColumns,
    missingValuesCount,
    missingValuesPct,
    duplicateRowsCount,
    duplicateRowsPct,
    columnDataTypes,
    memoryUsageKB,
    detectedReviewCol: reviewCol,
    detectedRatingCol: ratingCol,
    detectedProductCol: productCol
  };
}
