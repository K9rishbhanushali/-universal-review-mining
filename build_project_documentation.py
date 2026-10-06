from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


ROOT = Path(__file__).parent
OUT = ROOT / "Universal_Review_Mining_Project_Documentation.docx"

BLUE = "2E74B5"
DARK_BLUE = "1F4D78"
LIGHT_BLUE = "E8EEF5"
LIGHT_GRAY = "F2F4F7"
INK = RGBColor(31, 78, 120)


def set_run_font(run, size=11, bold=False, color=None):
    run.font.name = "Calibri"
    run._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    run._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    run.font.size = Pt(size)
    run.font.bold = bold
    if color:
        run.font.color.rgb = RGBColor.from_string(color)


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement("w:shd")
    shd.set(qn("w:fill"), fill)
    tc_pr.append(shd)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for side, value in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{side}"))
        if node is None:
            node = OxmlElement(f"w:{side}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(value))
        node.set(qn("w:type"), "dxa")


def set_table_geometry(table, widths):
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl_pr = table._tbl.tblPr
    tbl_w = tbl_pr.first_child_found_in("w:tblW")
    tbl_w.set(qn("w:w"), "9360")
    tbl_w.set(qn("w:type"), "dxa")
    indent = OxmlElement("w:tblInd")
    indent.set(qn("w:w"), "120")
    indent.set(qn("w:type"), "dxa")
    tbl_pr.append(indent)
    for row in table.rows:
        for idx, cell in enumerate(row.cells):
            cell.width = Inches(widths[idx])
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
            set_cell_margins(cell)


def style_table(table, headers, widths):
    set_table_geometry(table, widths)
    table.style = "Table Grid"
    for idx, label in enumerate(headers):
        cell = table.rows[0].cells[idx]
        cell.text = ""
        set_cell_shading(cell, LIGHT_BLUE)
        run = cell.paragraphs[0].add_run(label)
        set_run_font(run, 10, True, DARK_BLUE)
    for row in table.rows[1:]:
        for cell in row.cells:
            for p in cell.paragraphs:
                p.paragraph_format.space_after = Pt(0)
                for run in p.runs:
                    set_run_font(run, 9)


def add_heading(doc, text, level=1):
    p = doc.add_paragraph()
    p.style = f"Heading {level}"
    r = p.add_run(text)
    return p


def add_body(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.line_spacing = 1.10
    set_run_font(p.add_run(text), 11)
    return p


def add_bullet(doc, text):
    p = doc.add_paragraph(style="List Bullet")
    p.paragraph_format.space_after = Pt(4)
    set_run_font(p.add_run(text), 11)


def add_number(doc, text):
    p = doc.add_paragraph(style="List Number")
    p.paragraph_format.space_after = Pt(4)
    set_run_font(p.add_run(text), 11)


def add_matrix(doc, headers, rows, widths):
    table = doc.add_table(rows=1, cols=len(headers))
    for row in rows:
        cells = table.add_row().cells
        for i, value in enumerate(row):
            cells[i].text = str(value)
    style_table(table, headers, widths)
    doc.add_paragraph().paragraph_format.space_after = Pt(2)
    return table


def configure_document(doc):
    section = doc.sections[0]
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)

    normal = doc.styles["Normal"]
    normal.font.name = "Calibri"
    normal._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
    normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
    normal.font.size = Pt(11)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.10

    styles = [("Heading 1", 16, BLUE, 16, 8), ("Heading 2", 13, BLUE, 12, 6), ("Heading 3", 12, DARK_BLUE, 8, 4)]
    for name, size, color, before, after in styles:
        s = doc.styles[name]
        s.font.name = "Calibri"
        s._element.rPr.rFonts.set(qn("w:ascii"), "Calibri")
        s._element.rPr.rFonts.set(qn("w:hAnsi"), "Calibri")
        s.font.size = Pt(size)
        s.font.bold = True
        s.font.color.rgb = RGBColor.from_string(color)
        s.paragraph_format.space_before = Pt(before)
        s.paragraph_format.space_after = Pt(after)

    header = section.header.paragraphs[0]
    header.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    set_run_font(header.add_run("Universal Review Mining & Intelligence System"), 9, True, DARK_BLUE)
    footer = section.footer.paragraphs[0]
    footer.alignment = WD_ALIGN_PARAGRAPH.CENTER
    set_run_font(footer.add_run("Technical Project Documentation"), 9, False, "666666")


def main():
    doc = Document()
    configure_document(doc)

    title = doc.add_paragraph()
    title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    title.paragraph_format.space_after = Pt(8)
    set_run_font(title.add_run("Universal Review Mining & Intelligence System"), 25, True, DARK_BLUE)
    subtitle = doc.add_paragraph()
    subtitle.alignment = WD_ALIGN_PARAGRAPH.CENTER
    subtitle.paragraph_format.space_after = Pt(24)
    set_run_font(subtitle.add_run("Comprehensive Technical Project Documentation"), 14, False, "555555")
    add_body(doc, "Project type: Client-side business-intelligence and review-analytics dashboard with an optional Gemini-powered executive-summary API.")
    add_body(doc, "Primary language: TypeScript | UI: React 19 + Vite + Tailwind CSS 4 | Server: Node.js + Express")

    add_heading(doc, "Document guide", 1)
    add_body(doc, "This report documents the checked-in application: its purpose, technology stack, processing pipeline, source modules, user features, API, operating model, limitations, and recommended next improvements. The companion PROJECT_DOCUMENTATION.md contains the exhaustive line-of-business reference in Markdown.")
    add_matrix(doc, ["Section", "Coverage"], [
        ["1–4", "Purpose, capabilities, stack, architecture"],
        ["5–8", "Data pipeline, data model, analysis engines, UI modules"],
        ["9–13", "User features, API, structure, installation and outputs"],
        ["14–16", "Privacy, limitations, and roadmap"],
    ], [1.25, 5.25])

    add_heading(doc, "1. Purpose and scope", 1)
    add_body(doc, "The system accepts customer-review datasets and transforms them into an interactive business-intelligence dashboard. It works across products, hotels, restaurants, and similar review domains. Its focus is rapid browser-based ingestion, transparent data preparation, explainable text analytics, interactive filtering, and downloadable reports.")
    add_body(doc, "Three sample datasets are built in: mobile-device reviews, luxury hotel/resort feedback, and restaurant reviews. These demonstrate that the schema detector can work with different column names such as review/feedback/comments, rating/score, and product/item/dish.")

    add_heading(doc, "2. Feature inventory", 1)
    for item in [
        "CSV, XLSX, and XLS upload plus built-in example datasets.",
        "Automatic review/rating/product/date/category/price detection with editable mapping.",
        "Data-quality profile: missing values, duplicates, inferred types, unique counts, and memory estimate.",
        "Configurable review cleaning, tokenization, stopword removal, and simple lemmatization.",
        "Interactive EDA, KPI cards, charts, sentiment, text mining, aspect/topic analysis, association rules, and insights.",
        "Browser downloads for cleaned CSV and a self-contained HTML intelligence report.",
        "Optional server-side Gemini executive synthesis protected by a server environment variable.",
        "Python/Streamlit reference-code exporter for an alternate implementation approach.",
    ]:
        add_bullet(doc, item)

    add_heading(doc, "3. Technology stack", 1)
    add_matrix(doc, ["Layer", "Languages / libraries", "Purpose"], [
        ["Frontend", "TypeScript, React 19, React DOM", "Dashboard composition, state, and reusable views."],
        ["Build", "Vite 6, esbuild, tsx, TypeScript", "Development server, compilation, production bundling, type checking."],
        ["Styling", "Tailwind CSS 4, custom CSS", "Responsive layout, dashboard visual design, controls and cards."],
        ["Charts", "Plotly.js, react-plotly.js", "Interactive business-intelligence visualizations."],
        ["Ingestion", "Papa Parse, SheetJS xlsx", "Client-side CSV and Excel parsing."],
        ["Server", "Node.js, Express 4, dotenv", "Health endpoint, Gemini API proxy, dev/static serving."],
        ["AI", "@google/genai", "Optional Gemini executive intelligence brief."],
        ["Icons / animation", "lucide-react, motion", "Iconography; Motion is installed but not used in inspected source."],
    ], [1.15, 2.25, 3.10])

    add_heading(doc, "4. Architecture and processing flow", 1)
    add_body(doc, "The dominant execution path is client-side. React holds the raw data, selected schema mapping, cleaning configuration, filters, and derived analytics in memory. `useMemo` recalculates each downstream result when its data or filter dependency changes. There is no database, authentication layer, file persistence, or background job queue in the inspected application.")
    for step in [
        "User selects a sample dataset or uploads a CSV/XLSX/XLS file.",
        "The loader parses rows and headers; the detector suggests semantic columns.",
        "The user confirms or changes the mapping, then cleaning produces canonical review records and tokens.",
        "The filter sidebar creates an active subset used by EDA, sentiment, text mining, topics, aspects, association mining, and insights.",
        "Dashboard tabs render typed results; export functions create a cleaned CSV or an HTML report in the browser.",
        "When requested by the UI/client integration, the Express endpoint can send selected metrics and review samples to Gemini for a short executive brief.",
    ]:
        add_number(doc, step)

    add_heading(doc, "5. Core data model", 1)
    add_matrix(doc, ["Type", "Key fields", "Meaning"], [
        ["ColumnMapping", "review, rating, product, date, category, price", "User-approved dataset interpretation."],
        ["CleaningConfig", "removal flags, minimum length, custom stopwords", "Controls text-preparation behavior."],
        ["CleanedReviewRow", "original/clean text, tokens, mapped values, sentiment", "Canonical review record used by analytics."],
        ["DataQualityReport", "dimensions, missing/duplicate values, types", "Raw dataset-health report."],
        ["EDAMetrics", "distributions, rankings, timeline, scatter data", "Payload for summary and chart views."],
        ["SentimentAnalysisResult", "counts, scores, confusion-style metrics", "Rule-based classification result."],
        ["TextMiningResult", "frequencies, n-grams, TF-IDF-like scores", "Text-analysis payload."],
        ["TopicInfo / AspectSentimentItem / AssociationRule", "keywords and supporting measures", "Specialized discovery outputs."],
    ], [1.6, 2.55, 2.35])

    add_heading(doc, "6. Analysis modules", 1)
    modules = [
        ("File loading", "`dataLoader.ts` uses Papa Parse for headed CSV files and SheetJS for the first worksheet of XLSX/XLS files. It returns rows, headers, dimensions, metadata, and readable parse errors."),
        ("Column detection", "`columnDetector.ts` samples up to 50 rows, profiles length/numeric/date characteristics, matches header keywords, and falls back to the longest non-numeric text column for reviews and a constrained numeric column for ratings."),
        ("Data quality", "`dataQuality.ts` counts blank cells, serially equal duplicate rows, column cardinality, basic types, and an approximate JSON-size memory metric."),
        ("Cleaning", "`dataCleaner.ts` removes missing/duplicate reviews, strips HTML and URLs, normalizes text, removes stopwords/numbers/single characters, applies suffix-based lemmatization, parses ratings/prices, and retains mapped fields."),
        ("Sentiment", "`sentimentEngine.ts` uses curated positive/negative lexicons, preceding-token intensifier/negation handling, and a 70% text / 30% star-rating blend. Scores >0.15 are positive; scores <-0.15 are negative."),
        ("EDA", "`edaEngine.ts` calculates review/rating/product/category totals, rating and length distributions, product/category rankings, monthly counts, and limited scatter series."),
        ("Text mining", "`textMiningEngine.ts` produces overall and sentiment-specific word counts, adjacent bigram/trigram counts, smoothed TF-IDF-like values, and color-tagged word-cloud items."),
        ("Topic discovery", "`topicModelingEngine.ts` ranks fixed domain seed clusters. If nothing matches, it groups top document-frequency words. It is a heuristic, not statistical LDA."),
        ("Aspect sentiment", "`aspectSentimentEngine.ts` matches a fixed multi-domain vocabulary and aggregates positive/negative/neutral mentions with example reviews. A single review can match several aspects."),
        ("Association rules", "`associationMiningEngine.ts` treats each review as a set of tokens, builds frequent single/pair itemsets, and generates directional pair rules using support, confidence, and lift."),
        ("Insights and exports", "`insightsEngine.ts` turns metrics into deterministic statements. `reportGenerator.ts` downloads a quote-escaped cleaned CSV and self-contained HTML intelligence report."),
    ]
    for name, text in modules:
        add_heading(doc, name, 2)
        add_body(doc, text)

    add_heading(doc, "7. User interface and modules", 1)
    add_matrix(doc, ["Area", "Main source", "Role"], [
        ["Application orchestrator", "App.tsx", "Owns state, mappings, filters, memoized analytics, routing, and download actions."],
        ["Navigation and filters", "Navbar.tsx; SidebarFilters.tsx", "Sticky tab navigation and collapsible BI slicers."],
        ["Ingestion / preparation", "FileUploadSection; ColumnDetectionSection; DataCleanerSection", "Collects files, shows schema suggestions, configures cleaning."],
        ["Metrics and charts", "KPICardsGrid; EDADashboard; PlotlyChart", "Displays 20 KPI cards and interactive analytical views."],
        ["Analysis displays", "Sentiment, TextMining, Topic, Aspect, Association components", "Shows each analytics engine's typed output."],
        ["Tabs and export", "components/tabs; TablesDownloadsTab; PythonExporterSection", "Organizes 12 tabs, reporting/data downloads, and Python reference files."],
    ], [1.45, 2.25, 2.80])

    add_heading(doc, "8. Dashboard functions", 1)
    add_matrix(doc, ["Screen", "Capabilities"], [
        ["Dataset & Ingestion", "Upload, sample selection, metadata, parser errors, and editable automatic column mapping."],
        ["Overview / Data Quality", "High-level KPIs, missing/duplicate data, inferred types, unique values, and memory estimate."],
        ["EDA / Sentiment", "Ratings, product/category/time/length analysis; sentiment distribution and rating/text mismatch review."],
        ["Text / Data mining", "Frequent terms, n-grams, TF-IDF-like scores, word-cloud values, frequent itemsets, and association rules."],
        ["Topics / Product comparison", "Seeded topic clusters, domain aspects, product comparison and sentiment breakdown."],
        ["Insights / Downloads", "Deterministic intelligence statements, cleaned CSV, HTML report, and Python reference-code view."],
    ], [1.6, 4.9])

    add_heading(doc, "9. API and configuration", 1)
    add_heading(doc, "Health endpoint", 2)
    add_body(doc, "GET /api/health returns `{ status: 'ok', service: 'Universal Review Mining & Intelligence API' }`.")
    add_heading(doc, "Gemini summary endpoint", 2)
    add_body(doc, "POST /api/gemini/summarize accepts metrics, up to eight sample reviews, and an optional domain name. It constructs a prompt requesting key drivers, friction points, and three recommended actions. It calls `gemini-3.6-flash` through `@google/genai` and returns `{ summary }`. Missing `GEMINI_API_KEY` returns HTTP 400; model/API failures return HTTP 500.")
    add_heading(doc, "Commands", 2)
    add_matrix(doc, ["Command", "Purpose"], [
        ["npm install", "Installs JavaScript and TypeScript dependencies."],
        ["npm run dev", "Runs `tsx server.ts`; Express listens on port 3000 and Vite operates in middleware mode."],
        ["npm run build", "Builds the Vite app and bundles the server as `dist/server.cjs`."],
        ["npm start", "Runs the production server bundle."],
        ["npm run preview", "Runs Vite static preview."],
        ["npm run lint", "Runs TypeScript type checking using `tsc --noEmit`."],
    ], [1.65, 4.85])
    add_body(doc, "Optional AI configuration: create a local server environment file containing `GEMINI_API_KEY=your_key_here`. Never expose this key in browser code.")

    add_heading(doc, "10. Security and operational model", 1)
    for item in [
        "Data is parsed and analyzed in the browser by default; large files are constrained by user-device memory.",
        "The Gemini endpoint sends the supplied summary metrics and sample reviews to Google only when used; do not submit sensitive data without suitable policy approval.",
        "The current source has no authentication, authorization, persistence, database, encryption-at-rest, audit log, rate limiting, or API input validation.",
        "For production, add HTTPS, request schema validation, size controls, rate limiting, monitoring, managed secrets, and a privacy/data-retention policy.",
    ]:
        add_bullet(doc, item)

    add_heading(doc, "11. Important limitations", 1)
    for item in [
        "Sentiment is a transparent rule/lexicon heuristic, not a validated trained classifier; sarcasm and domain terminology may be misclassified.",
        "The browser topic module is seeded keyword clustering even though some labels/reference Python code mention LDA.",
        "Association mining covers one- and two-token itemsets only, not higher-order Apriori/FP-Growth patterns.",
        "Sidebar state includes topic/aspect selections, but the central filtering predicate presently does not use them. The minimum-price control is also not applied; only maximum price is applied.",
        "Date filtering compares strings, so ISO dates (`YYYY-MM-DD`) are recommended. Excel ingestion uses only the first worksheet.",
        "No uploaded data/settings persist after a page refresh. Python code in the exporter is reference content and is not this app's active runtime.",
        "Some KPI cards contain illustrative fallback values where input data is missing; review these before formal use.",
    ]:
        add_bullet(doc, item)

    add_heading(doc, "12. Recommended roadmap", 1)
    for item in [
        "Add schema validation, worksheet selection, user-friendly parser diagnostics, and tests for every analytics engine.",
        "Implement consistent filtering for minimum price, discovered topics, and aspects.",
        "Replace or complement fixed vocabularies with configurable, multilingual, domain-evaluated NLP models.",
        "Use labeled data and proper evaluation before presenting classifier alignment figures as model performance.",
        "Add persistent projects, user accounts, access controls, export history, audit logging, and production observability.",
        "Improve accessibility for charts and controls, including keyboard flows, contrast, and non-visual data alternatives.",
    ]:
        add_number(doc, item)

    add_heading(doc, "13. Final summary", 1)
    add_body(doc, "This is a broad, explainable review-intelligence dashboard built primarily in TypeScript and React. Its main value is an end-to-end, browser-first workflow: ingest reviews, detect structure, clean text, filter a common dataset subset, run multiple analytical engines, and export business-ready outputs. The next maturity step is to strengthen validation, filter completeness, data persistence/security, and evaluated NLP capabilities.")
    doc.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
