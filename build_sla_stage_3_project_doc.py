from pathlib import Path
from shutil import copy2

from docx import Document
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Pt


ROOT = Path(__file__).parent
TEMPLATE = Path(r"C:\Users\KRISH\Downloads\SLA_Stage_3_Template.docx")
OUTPUT = ROOT / "output" / "Universal_Review_Mining_SLA_Stage_3_Report.docx"


def set_text(paragraph, text, size=None, bold=None, alignment=None):
    paragraph.clear()
    run = paragraph.add_run(text)
    # Preserve the template's typeface where possible while ensuring replacement text is visible.
    if size:
        run.font.size = Pt(size)
    if bold is not None:
        run.font.bold = bold
    if alignment is not None:
        paragraph.alignment = alignment
    return paragraph


def add_paragraph(doc, text, style=None, bold_label=None):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_after = Pt(6)
    if bold_label and text.startswith(bold_label):
        label = p.add_run(bold_label)
        label.bold = True
        p.add_run(text[len(bold_label):])
    else:
        p.add_run(text)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph(style="List Paragraph")
    p.paragraph_format.space_after = Pt(3)
    p_pr = p._p.get_or_add_pPr()
    num_pr = OxmlElement("w:numPr")
    ilvl = OxmlElement("w:ilvl")
    ilvl.set(qn("w:val"), "1")
    num_id = OxmlElement("w:numId")
    num_id.set(qn("w:val"), "1")
    num_pr.extend([ilvl, num_id])
    p_pr.append(num_pr)
    p.add_run(text)


def add_section(doc, title, paragraphs=None, bullets=None):
    doc.add_heading(title, level=1)
    for text in paragraphs or []:
        add_paragraph(doc, text)
    for text in bullets or []:
        add_bullet(doc, text)


def main():
    if not TEMPLATE.exists():
        raise FileNotFoundError(TEMPLATE)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    copy2(TEMPLATE, OUTPUT)
    doc = Document(OUTPUT)

    # Existing cover page: replace only the recognised text slots.
    values = {
        "Department of Computer Science": "Department of Computer Science",
        "Self Learning Micro Project Report": "Self Learning Micro Project Report",
        "Stage – 3": "Stage - 3",
        "First Year": "First Year",
        " Semester I": "Semester I",
        " Subject: Matrices & Differential Calculus": "Subject: Web Development and Data Analytics",
        "Topic: ": "Topic: Universal Review Mining & Intelligence System",
        "Submitted by": "Submitted by",
        "Name - Roll No.": "Name: ____________________   Roll No.: ____________________",
        "                                             4.  Name - Roll No.": "4. Name: ____________________   Roll No.: ____________________",
        "SHAH AND ANCHOR KUTCHHI ENGINEERING COLLEGE": "SHAH AND ANCHOR KUTCHHI ENGINEERING COLLEGE",
        "Academic Year: 2025-2026": "Academic Year: 2025-2026",
        "Analysis, Report  & Presentation": "Universal Review Mining & Intelligence System",
    }

    name_slot = 0
    for paragraph in doc.paragraphs:
        source = paragraph.text
        if source == "Name - Roll No.":
            name_slot += 1
            set_text(paragraph, f"{name_slot}. Name: ____________________   Roll No.: ____________________")
        elif source in values:
            set_text(paragraph, values[source])

    # Change the page-two template heading from generic wording to the project report title.
    for paragraph in doc.paragraphs:
        if paragraph.text == "Universal Review Mining & Intelligence System" and paragraph.style.name == "Title":
            paragraph.alignment = WD_ALIGN_PARAGRAPH.CENTER

    # Add the actual project report after the template's page-two title.
    add_paragraph(doc, "Project Analysis, Report and Presentation", style="Subtitle")

    add_section(doc, "1. Abstract", [
        "Universal Review Mining & Intelligence System is a web-based business-intelligence dashboard for analysing customer-review datasets. It accepts review files, detects their structure, cleans text, applies explainable sentiment and text-mining methods, and presents results through interactive charts, summary cards, insights, and downloadable reports.",
        "The project is designed for multiple domains including product, hotel, restaurant, and service reviews. It allows an analyst to move from an unstructured CSV or Excel file to a filtered intelligence view without requiring a database or a separate data-processing environment."
    ])

    add_section(doc, "2. Problem Statement", [
        "Customer reviews contain important information about satisfaction, complaints, product strengths, and recurring service issues, but large collections of free-text feedback are difficult to inspect manually. The project addresses this by combining data-quality checks, NLP-style text processing, exploratory analysis, and business-focused insight generation in one dashboard."
    ])

    add_section(doc, "3. Objectives", bullets=[
        "Upload CSV, XLSX, or XLS review datasets and load sample datasets for demonstration.",
        "Detect review, rating, product, date, category, and price columns automatically while allowing manual correction.",
        "Clean and tokenize review text for downstream analysis.",
        "Analyse ratings, product/category performance, sentiment, aspects, topics, key phrases, and associations.",
        "Generate evidence-based insights and export cleaned data and a management-ready HTML report."
    ])

    add_section(doc, "4. Technologies and Languages Used", bullets=[
        "TypeScript is the primary programming language for the production application.",
        "React 19 and React DOM build the interactive frontend user interface.",
        "Vite, esbuild, tsx, and TypeScript provide development, build, server-bundling, and type-checking support.",
        "Tailwind CSS 4 and custom CSS create the responsive dashboard layout and component styling.",
        "Plotly.js and react-plotly.js produce interactive analytics charts.",
        "Papa Parse and SheetJS xlsx parse CSV and Excel files in the browser.",
        "Node.js, Express, dotenv, and @google/genai provide the optional Gemini executive-summary API.",
        "Lucide React supplies dashboard icons."
    ])

    add_section(doc, "5. System Architecture", [
        "The application follows a client-first architecture. React stores the uploaded rows, selected column mapping, cleaning configuration, filters, and calculated outputs in browser memory. The central App component recalculates downstream metrics using memoized functions when data or filters change.",
        "An Express server runs on port 3000. It provides a health endpoint and an optional POST /api/gemini/summarize endpoint. The API key is read from GEMINI_API_KEY on the server, so it is not exposed to browser code. There is no database, authentication system, or persistent storage in the current version."
    ])

    add_section(doc, "6. Data Processing Flow", bullets=[
        "Ingest review data from CSV/XLSX/XLS or select a built-in dataset.",
        "Profile columns and detect possible review, rating, product, date, category, and price fields.",
        "Validate or update the mapping and calculate data-quality statistics.",
        "Remove missing/duplicate text, clean HTML/URLs/punctuation, remove stopwords, tokenize, and lemmatize.",
        "Apply dashboard filters and analyse the active review subset.",
        "Render analytics, insights, tables, and exportable output files."
    ])

    add_section(doc, "7. Major Functional Modules", bullets=[
        "Data Loader: parses CSV through Papa Parse and Excel through SheetJS; reads the first worksheet for Excel files.",
        "Column Detector: samples up to 50 rows and uses header keywords, length, numeric, and date heuristics to suggest mappings.",
        "Data Quality: reports dimensions, missing values, duplicate rows, inferred types, unique counts, and estimated memory usage.",
        "Data Cleaner and Text Preprocessing: handles missing/duplicate reviews, HTML/URL removal, lowercasing, stopwords, tokenization, and simple suffix-based lemmatization.",
        "Sentiment Engine: uses curated positive/negative lexicons, simple intensifier/negation rules, and optional rating blending.",
        "EDA Engine: calculates rating distributions, product/category summaries, timeline data, review lengths, and rating comparison data.",
        "Text Mining Engine: creates word frequencies, positive/negative word lists, bigrams, trigrams, TF-IDF-like scores, and word-cloud values.",
        "Topic and Aspect Engines: identify seeded domain clusters and aspect-level sentiment from keyword vocabularies.",
        "Association Mining Engine: builds one- and two-word itemsets and directional rules using support, confidence, and lift.",
        "Insights and Report Generator: produces deterministic business statements, cleaned CSV output, and a self-contained HTML intelligence report."
    ])

    add_section(doc, "8. Features of the Dashboard", bullets=[
        "Twelve navigation tabs covering ingestion, overview, data quality, EDA, sentiment, text mining, data mining, topics, product comparison, insights, downloads, and Python reference export.",
        "A collapsible BI filter sidebar for products, categories, rating, sentiment, dates, price, review length, topics, and aspects.",
        "Executive KPI cards including total reviews, average rating, sentiment shares, product/category counts, review length, and cleaning metrics.",
        "Download actions for the active subset: a cleaned CSV and an HTML intelligence report.",
        "Optional Gemini executive brief summarising customer drivers, friction points, and strategic recommendations."
    ])

    add_section(doc, "9. Outputs", [
        "The dashboard produces interactive KPI cards, tables, Plotly visualisations, sentiment results, rating-sentiment comparisons, frequent words, n-grams, topic and aspect summaries, association rules, and automated insight cards. The user can download a cleaned CSV containing the normalized review fields and a styled HTML intelligence report."
    ])

    add_section(doc, "10. Limitations and Future Scope", bullets=[
        "Sentiment is lexicon-based and explainable, but it is not a trained or independently validated machine-learning classifier.",
        "The TypeScript topic module is seeded keyword clustering rather than statistical LDA topic modelling.",
        "Association mining currently handles one- and two-token itemsets, not higher-order patterns.",
        "Topic/aspect sidebar selections and minimum-price state are available in the UI but are not fully applied by the current central row-filter predicate.",
        "Future versions can add true evaluated ML models, multilingual text support, complete filter semantics, data persistence, authentication, validation, tests, rate limiting, and production monitoring."
    ])

    add_section(doc, "11. Conclusion", [
        "The Universal Review Mining & Intelligence System demonstrates an end-to-end review-analysis workflow using modern web technologies. It turns raw customer feedback into structured business intelligence through ingestion, cleaning, analytics, NLP heuristics, visualisation, and reporting. The project provides a practical foundation for extending into a production-grade customer-voice analytics platform."
    ])

    doc.save(OUTPUT)
    print(OUTPUT)


if __name__ == "__main__":
    main()
