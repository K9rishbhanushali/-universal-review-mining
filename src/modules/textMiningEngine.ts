import { CleanedReviewRow, NGramFrequency, TextMiningResult, TFIDFWord, WordCloudItem, WordFrequency } from '../types';

export function runTextMining(rows: CleanedReviewRow[]): TextMiningResult {
  const wordFreqMap: Record<string, number> = {};
  const posWordFreqMap: Record<string, number> = {};
  const negWordFreqMap: Record<string, number> = {};

  const bigramMap: Record<string, number> = {};
  const trigramMap: Record<string, number> = {};

  const docFrequencyMap: Record<string, number> = {};
  const totalDocs = rows.length;

  for (const row of rows) {
    const tokens = row.tokens || [];
    const uniqueTokensInDoc = new Set(tokens);

    // Track document frequency for TF-IDF
    uniqueTokensInDoc.forEach(tok => {
      docFrequencyMap[tok] = (docFrequencyMap[tok] || 0) + 1;
    });

    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      wordFreqMap[tok] = (wordFreqMap[tok] || 0) + 1;

      if (row.sentiment === 'positive') {
        posWordFreqMap[tok] = (posWordFreqMap[tok] || 0) + 1;
      } else if (row.sentiment === 'negative') {
        negWordFreqMap[tok] = (negWordFreqMap[tok] || 0) + 1;
      }

      // Bigrams
      if (i < tokens.length - 1) {
        const bigram = `${tok} ${tokens[i + 1]}`;
        bigramMap[bigram] = (bigramMap[bigram] || 0) + 1;
      }

      // Trigrams
      if (i < tokens.length - 2) {
        const trigram = `${tok} ${tokens[i + 1]} ${tokens[i + 2]}`;
        trigramMap[trigram] = (trigramMap[trigram] || 0) + 1;
      }
    }
  }

  const totalWords = Object.values(wordFreqMap).reduce((a, b) => a + b, 0);

  // Top frequent words
  const frequentWords: WordFrequency[] = Object.entries(wordFreqMap)
    .map(([word, count]) => ({
      word,
      count,
      frequency: totalWords > 0 ? Number((count / totalWords).toFixed(4)) : 0
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Top positive words
  const topPositiveWords: WordFrequency[] = Object.entries(posWordFreqMap)
    .map(([word, count]) => ({ word, count, frequency: count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Top negative words
  const topNegativeWords: WordFrequency[] = Object.entries(negWordFreqMap)
    .map(([word, count]) => ({ word, count, frequency: count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Bigrams
  const bigrams: NGramFrequency[] = Object.entries(bigramMap)
    .map(([ngram, count]) => ({ ngram, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // Trigrams
  const trigrams: NGramFrequency[] = Object.entries(trigramMap)
    .map(([ngram, count]) => ({ ngram, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  // TF-IDF Calculation
  // TF = count / totalWordsInDoc, IDF = log(totalDocs / docFreq)
  const tfidfWords: TFIDFWord[] = Object.entries(wordFreqMap)
    .map(([word, count]) => {
      const docFreq = docFrequencyMap[word] || 1;
      const idf = Math.log((totalDocs + 1) / (docFreq + 1)) + 1;
      const tf = count / (totalWords || 1);
      const score = Number((tf * idf * 100).toFixed(3));
      return { word, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 25);

  // WordCloud Data
  const paletteAll = ['#2563eb', '#3b82f6', '#0284c7', '#0d9488', '#16a34a', '#8b5cf6', '#d97706'];
  const palettePos = ['#16a34a', '#22c55e', '#10b981', '#059669', '#34d399'];
  const paletteNeg = ['#dc2626', '#ef4444', '#f87171', '#e11d48', '#b91c1c'];

  const wordCloudAll: WordCloudItem[] = frequentWords.map((item, idx) => ({
    text: item.word,
    value: item.count,
    color: paletteAll[idx % paletteAll.length]
  }));

  const wordCloudPositive: WordCloudItem[] = topPositiveWords.map((item, idx) => ({
    text: item.word,
    value: item.count,
    color: palettePos[idx % palettePos.length]
  }));

  const wordCloudNegative: WordCloudItem[] = topNegativeWords.map((item, idx) => ({
    text: item.word,
    value: item.count,
    color: paletteNeg[idx % paletteNeg.length]
  }));

  return {
    frequentWords,
    topPositiveWords,
    topNegativeWords,
    bigrams,
    trigrams,
    tfidfWords,
    wordCloudAll,
    wordCloudPositive,
    wordCloudNegative
  };
}
