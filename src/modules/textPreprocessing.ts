// English stopwords list
export const DEFAULT_STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d', 'we\'ll',
  'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while',
  'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 'you\'ll',
  'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

// Simple Porter-like lemmatizer suffix mapper for English words
export function lemmatizeWord(word: string): string {
  if (word.length <= 3) return word;
  
  if (word.endsWith('ies') && word.length > 4) return word.slice(0, -3) + 'y';
  if (word.endsWith('es') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  if (word.endsWith('ing') && word.length > 5) return word.slice(0, -3);
  if (word.endsWith('ed') && word.length > 4) return word.slice(0, -2);
  if (word.endsWith('ly') && word.length > 4) return word.slice(0, -2);

  return word;
}

export function preprocessText(
  text: string,
  options: {
    removeHtml?: boolean;
    removeUrls?: boolean;
    removePunctuation?: boolean;
    removeSpecialChars?: boolean;
    lowercaseText?: boolean;
    customStopwords?: string;
  } = {}
): { cleanText: string; tokens: string[] } {
  if (!text || typeof text !== 'string') {
    return { cleanText: '', tokens: [] };
  }

  let processed = text;

  // 1. Remove HTML tags
  if (options.removeHtml !== false) {
    processed = processed.replace(/<[^>]*>/g, ' ');
  }

  // 2. Remove URLs
  if (options.removeUrls !== false) {
    processed = processed.replace(/https?:\/\/\S+|www\.\S+/g, ' ');
  }

  // 3. Lowercase
  if (options.lowercaseText !== false) {
    processed = processed.toLowerCase();
  }

  // 4. Remove Special Characters / Punctuation
  if (options.removeSpecialChars !== false) {
    processed = processed.replace(/[^a-zA-Z0-9\s]/g, ' ');
  } else if (options.removePunctuation !== false) {
    processed = processed.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ');
  }

  // 5. Remove extra whitespace
  processed = processed.replace(/\s+/g, ' ').trim();

  // 6. Tokenize
  const rawTokens = processed.split(/\s+/).filter(t => t.length > 0);

  // 7. Combine custom stopwords with default stopwords
  const activeStopwords = new Set(DEFAULT_STOPWORDS);
  if (options.customStopwords) {
    options.customStopwords
      .toLowerCase()
      .split(/[\s,]+/)
      .forEach(w => {
        if (w.trim()) activeStopwords.add(w.trim());
      });
  }

  // 8. Filter tokens & optional Lemmatize
  const tokens: string[] = [];
  for (const rawTok of rawTokens) {
    if (!activeStopwords.has(rawTok) && rawTok.length > 1 && !/^\d+$/.test(rawTok)) {
      tokens.push(lemmatizeWord(rawTok));
    }
  }

  return {
    cleanText: tokens.join(' '),
    tokens
  };
}
