import { PythonCodeFile } from '../types';

export const PYTHON_CODEBASE_FILES: PythonCodeFile[] = [
  {
    name: 'app.py',
    path: 'app.py',
    description: 'Main Streamlit application dashboard entry point.',
    content: `import streamlit as st
import pandas as pd
from modules.data_loader import load_uploaded_file
from modules.column_detector import detect_dataset_columns
from modules.data_cleaner import clean_review_dataset
from modules.eda import render_eda_dashboard
from modules.text_preprocessing import preprocess_text_column
from modules.sentiment import run_sentiment_analysis, plot_sentiment_distribution
from modules.text_mining import run_text_mining_analysis
from modules.topic_modeling import extract_topics_lda
from modules.association_mining import run_apriori_mining
from modules.insights import generate_automated_insights
from modules.report_generator import generate_pdf_report

st.set_page_config(
    page_title="Universal Review Mining System",
    page_icon="📊",
    layout="wide"
)

st.title("📊 Universal Review Mining & Intelligence System")
st.markdown("Upload any review dataset in CSV or Excel format to automatically detect structure, clean text, perform EDA, sentiment analysis, text mining, topic modeling, and data mining.")

# 1. File Upload
uploaded_file = st.sidebar.file_uploader("Upload Review Dataset", type=["csv", "xlsx", "xls"])

if uploaded_file is not None:
    df, file_meta = load_uploaded_file(uploaded_file)
    st.sidebar.success(f"File Loaded: {file_meta['name']} ({file_meta['size_kb']} KB)")
    
    # 2. Column Detection
    detected = detect_dataset_columns(df)
    
    st.sidebar.subheader("Column Mapping Override")
    review_col = st.sidebar.selectbox("Review / Text Column", detected['all_columns'], index=detected['all_columns'].index(detected['review']) if detected['review'] else 0)
    rating_col = st.sidebar.selectbox("Rating Column (Optional)", ["None"] + detected['all_columns'], index=detected['all_columns'].index(detected['rating'])+1 if detected['rating'] else 0)
    product_col = st.sidebar.selectbox("Product Column (Optional)", ["None"] + detected['all_columns'], index=detected['all_columns'].index(detected['product'])+1 if detected['product'] else 0)
    
    # Navigation tabs
    tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs([
        "Data Quality & Cleaning", 
        "EDA Dashboard", 
        "Sentiment & Rating", 
        "Text Mining & WordCloud", 
        "Topic Extraction", 
        "Association Rules", 
        "Customer Insights & Export"
    ])
    
    with tab1:
        st.header("1. Data Quality & Reusable Cleaning")
        cleaned_df, cleaning_metrics = clean_review_dataset(df, review_col)
        st.json(cleaning_metrics)
        st.dataframe(cleaned_df.head(10))
        
    with tab2:
        st.header("2. Exploratory Data Analysis")
        render_eda_dashboard(cleaned_df, review_col, rating_col, product_col)
        
    with tab3:
        st.header("3. Sentiment & Rating Analysis")
        sentiment_df, metrics = run_sentiment_analysis(cleaned_df, review_col)
        st.dataframe(sentiment_df[['clean_review', 'sentiment', 'sentiment_score']].head(10))
        
    with tab4:
        st.header("4. Text Mining & N-Grams")
        run_text_mining_analysis(cleaned_df, 'clean_review')
        
    with tab5:
        st.header("5. Topic Modeling (LDA)")
        topics = extract_topics_lda(cleaned_df, 'clean_review')
        for t in topics:
            st.write(f"**{t['topic']}**: {', '.join(t['words'])}")
            
    with tab6:
        st.header("6. Association Rule Mining (Apriori)")
        rules = run_apriori_mining(cleaned_df, 'clean_review')
        st.dataframe(rules)
        
    with tab7:
        st.header("7. Factual Customer Insights & Report Export")
        insights = generate_automated_insights(cleaned_df, review_col, rating_col)
        for ins in insights:
            st.info(ins)

else:
    st.info("Please upload a CSV or Excel dataset to begin analysis.")
`
  },
  {
    name: 'data_loader.py',
    path: 'modules/data_loader.py',
    description: 'Data loader module for parsing CSV and Excel files cleanly.',
    content: `import pandas as pd

def load_uploaded_file(uploaded_file):
    """
    Parses CSV, XLSX, XLS files into pandas DataFrame.
    Returns DataFrame and metadata dictionary.
    """
    file_name = uploaded_file.name
    file_size_kb = round(len(uploaded_file.getvalue()) / 1024, 2)
    
    if file_name.endswith('.csv'):
        df = pd.read_csv(uploaded_file)
    elif file_name.endswith(('.xlsx', '.xls')):
        df = pd.read_excel(uploaded_file)
    else:
        raise ValueError("Unsupported file format")
        
    metadata = {
        "name": file_name,
        "size_kb": file_size_kb,
        "rows": len(df),
        "columns": len(df.columns)
    }
    
    return df, metadata
`
  },
  {
    name: 'column_detector.py',
    path: 'modules/column_detector.py',
    description: 'Smart automatic detection for Review, Rating, Product, Date, Category columns.',
    content: `import pandas as pd
import re

def detect_dataset_columns(df: pd.DataFrame):
    """
    Automatically detects likely Review, Rating, Product, Date, and Category columns.
    """
    cols = list(df.columns)
    detected = {
        "review": None,
        "rating": None,
        "product": None,
        "date": None,
        "category": None,
        "all_columns": cols
    }
    
    review_keywords = ['review', 'comment', 'feedback', 'text', 'content', 'description', 'opinion', 'body']
    rating_keywords = ['rating', 'score', 'stars', 'rate', 'review_score', 'points']
    product_keywords = ['product', 'item', 'brand', 'model', 'title', 'device']
    date_keywords = ['date', 'created_at', 'timestamp', 'time']
    category_keywords = ['category', 'type', 'department', 'genre']
    
    for col in cols:
        col_lower = str(col).lower().replace(' ', '_')
        
        if not detected['review'] and any(kw in col_lower for kw in review_keywords):
            detected['review'] = col
        elif not detected['rating'] and any(kw in col_lower for kw in rating_keywords):
            detected['rating'] = col
        elif not detected['product'] and any(kw in col_lower for kw in product_keywords):
            detected['product'] = col
        elif not detected['date'] and any(kw in col_lower for kw in date_keywords):
            detected['date'] = col
        elif not detected['category'] and any(kw in col_lower for kw in category_keywords):
            detected['category'] = col
            
    # Fallback heuristic for review text: column with longest avg string length
    if not detected['review']:
        str_cols = df.select_dtypes(include=['object']).columns
        if len(str_cols) > 0:
            avg_lens = {col: df[col].astype(str).str.len().mean() for col in str_cols}
            detected['review'] = max(avg_lens, key=avg_lens.get)
            
    return detected
`
  },
  {
    name: 'data_cleaner.py',
    path: 'modules/data_cleaner.py',
    description: 'Data cleaner pipeline for removing missing rows, duplicates, HTML, URLs, and punctuation.',
    content: `import pandas as pd
import re

def clean_review_dataset(df: pd.DataFrame, review_col: str):
    """
    Cleans dataset by handling missing values, duplicates, and normalizing text.
    """
    rows_before = len(df)
    
    # 1. Drop missing review text
    df_clean = df.dropna(subset=[review_col]).copy()
    
    # 2. Drop duplicates
    df_clean = df_clean.drop_duplicates(subset=[review_col])
    
    # 3. Text cleaning function
    def clean_text(text):
        if not isinstance(text, str):
            return ""
        text = re.sub(r'<[^>]+>', '', text) # Remove HTML
        text = re.sub(r'https?://\\S+|www\\.\\S+', '', text) # Remove URLs
        text = re.sub(r'[^a-zA-Z0-9\\s]', '', text) # Remove special chars
        return text.strip()
        
    df_clean['clean_review'] = df_clean[review_col].apply(clean_text)
    df_clean = df_clean[df_clean['clean_review'].str.len() > 3]
    
    rows_after = len(df_clean)
    
    metrics = {
        "rows_before": rows_before,
        "rows_after": rows_after,
        "removed": rows_before - rows_after
    }
    
    return df_clean, metrics
`
  },
  {
    name: 'sentiment.py',
    path: 'modules/sentiment.py',
    description: 'Sentiment analyzer module using NLTK VADER or TextBlob.',
    content: `import pandas as pd
from nltk.sentiment.vader import SentimentIntensityAnalyzer
import nltk

try:
    nltk.data.find('sentiment/vader_lexicon.zip')
except LookupError:
    nltk.download('vader_lexicon', quiet=True)

def run_sentiment_analysis(df: pd.DataFrame, text_col: str):
    """
    Performs VADER sentiment classification (Positive, Negative, Neutral).
    """
    sia = SentimentIntensityAnalyzer()
    
    def get_sentiment(text):
        scores = sia.polarity_scores(str(text))
        compound = scores['compound']
        if compound >= 0.05:
            return 'positive', compound
        elif compound <= -0.05:
            return 'negative', compound
        else:
            return 'neutral', compound
            
    sentiments = []
    scores = []
    
    for text in df[text_col]:
        label, score = get_sentiment(text)
        sentiments.append(label)
        scores.append(score)
        
    df_out = df.copy()
    df_out['sentiment'] = sentiments
    df_out['sentiment_score'] = scores
    
    metrics = {
        "positive": (df_out['sentiment'] == 'positive').sum(),
        "negative": (df_out['sentiment'] == 'negative').sum(),
        "neutral": (df_out['sentiment'] == 'neutral').sum(),
        "avg_score": round(df_out['sentiment_score'].mean(), 2)
    }
    
    return df_out, metrics
`
  },
  {
    name: 'association_mining.py',
    path: 'modules/association_mining.py',
    description: 'Apriori and FP-Growth association rule mining algorithm for token itemsets.',
    content: `import pandas as pd
from mlxtend.preprocessing import TransactionEncoder
from mlxtend.frequent_patterns import apriori, association_rules

def run_apriori_mining(df: pd.DataFrame, text_col: str, min_support=0.05, min_confidence=0.4):
    """
    Discovers frequent term itemsets and association rules using Apriori.
    """
    dataset = [str(text).lower().split() for text in df[text_col]]
    
    te = TransactionEncoder()
    te_ary = te.fit(dataset).transform(dataset)
    df_trans = pd.DataFrame(te_ary, columns=te.columns_)
    
    frequent_itemsets = apriori(df_trans, min_support=min_support, use_colnames=True)
    if len(frequent_itemsets) == 0:
        return pd.DataFrame()
        
    rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=min_confidence)
    return rules[['antecedents', 'consequents', 'support', 'confidence', 'lift']]
`
  },
  {
    name: 'requirements.txt',
    path: 'requirements.txt',
    description: 'Python package requirements for local Streamlit execution.',
    content: `streamlit>=1.30.0
pandas>=2.0.0
numpy>=1.24.0
scikit-learn>=1.3.0
nltk>=3.8.0
plotly>=5.18.0
matplotlib>=3.8.0
seaborn>=0.13.0
openpyxl>=3.1.0
wordcloud>=1.9.0
mlxtend>=0.23.0
`
  },
  {
    name: 'README.md',
    path: 'README.md',
    description: 'Documentation for setting up and running the Python project locally.',
    content: `# Universal Review Mining & Intelligence System

A portfolio-level generic Python Data Mining & NLP application built with Streamlit, Pandas, NLTK, Scikit-Learn, Plotly, and MLxtend.

## Features
- **File Upload**: Supports CSV, XLSX, XLS
- **Automatic Column Detection**: Smart detection for Review, Rating, Product, Date, Category
- **Data Quality Report**: Missing values, duplicate counts, data types summary
- **Data Cleaning**: Reusable text normalization pipeline
- **EDA Dashboard**: Plotly interactive rating distributions, product bar charts, timeline series
- **Sentiment Analysis**: Lexicon & VADER sentiment scoring with rating-sentiment cross-tabulation
- **Text Mining**: WordCloud, Top N-Grams (Bigrams, Trigrams), TF-IDF scores
- **Topic Modeling**: Latent Dirichlet Allocation (LDA) topic discovery
- **Data Mining**: Apriori association rule mining (Support, Confidence, Lift)
- **Automated Insights**: Factual data-driven summary statements

## Local Installation
\`\`\`bash
pip install -r requirements.txt
python -m nltk.downloader vader_lexicon stopwords
streamlit run app.py
\`\`\`
`
  }
];
