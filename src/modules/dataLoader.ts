import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { DatasetRow } from '../types';
import { SAMPLE_DATASETS } from '../data/sampleDatasets';

export interface FileLoadResult {
  fileName: string;
  fileSizeKB: number;
  data: DatasetRow[];
  rows?: DatasetRow[];
  totalRows: number;
  totalColumns: number;
  columns: string[];
  error?: string;
}

export function loadSampleDataset(sampleId: string) {
  const datasetMeta = SAMPLE_DATASETS.find(d => d.id === sampleId) || SAMPLE_DATASETS[0];
  const rows = datasetMeta.data as DatasetRow[];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  return {
    meta: {
      fileName: `${datasetMeta.id}.csv`,
      fileSizeKB: 45.2,
      totalRows: rows.length,
      totalColumns: columns.length
    },
    rows,
    columns
  };
}

export async function parseFile(file: File): Promise<FileLoadResult> {
  const fileName = file.name;
  const fileSizeKB = Math.round(file.size / 1024);
  const ext = fileName.split('.').pop()?.toLowerCase();

  return new Promise((resolve) => {
    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: 'greedy',
        dynamicTyping: true,
        complete: (results) => {
          if (results.errors && results.errors.length > 0 && (!results.data || results.data.length === 0)) {
            resolve({
              fileName,
              fileSizeKB,
              data: [],
              totalRows: 0,
              totalColumns: 0,
              columns: [],
              error: `Failed to parse CSV file: ${results.errors[0].message}`
            });
            return;
          }

          const rawData = (results.data as DatasetRow[]).filter(row => row && Object.keys(row).length > 0);
          const columns = rawData.length > 0 ? Object.keys(rawData[0]) : [];

          resolve({
            fileName,
            fileSizeKB,
            data: rawData,
            rows: rawData,
            totalRows: rawData.length,
            totalColumns: columns.length,
            columns
          });
        },
        error: (err) => {
          resolve({
            fileName,
            fileSizeKB,
            data: [],
            totalRows: 0,
            totalColumns: 0,
            columns: [],
            error: `CSV Parsing Error: ${err.message}`
          });
        }
      });
    } else if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result;
          const workbook = XLSX.read(buffer, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const rawData = XLSX.utils.sheet_to_json<DatasetRow>(worksheet, { defval: null });
          const columns = rawData.length > 0 ? Object.keys(rawData[0]) : [];

          resolve({
            fileName,
            fileSizeKB,
            data: rawData,
            totalRows: rawData.length,
            totalColumns: columns.length,
            columns
          });
        } catch (err: any) {
          resolve({
            fileName,
            fileSizeKB,
            data: [],
            totalRows: 0,
            totalColumns: 0,
            columns: [],
            error: `Excel Reading Error: ${err.message || 'Invalid or corrupt Excel file'}`
          });
        }
      };
      reader.onerror = () => {
        resolve({
          fileName,
          fileSizeKB,
          data: [],
          totalRows: 0,
          totalColumns: 0,
          columns: [],
          error: 'Failed to read file from disk.'
        });
      };
      reader.readAsBinaryString(file);
    } else {
      resolve({
        fileName,
        fileSizeKB,
        data: [],
        totalRows: 0,
        totalColumns: 0,
        columns: [],
        error: `Unsupported file format '.${ext}'. Please upload CSV or Excel (.xlsx, .xls) files.`
      });
    }
  });
}
