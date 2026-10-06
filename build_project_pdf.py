from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
)


ROOT = Path(__file__).parent
OUT_DIR = ROOT / "output" / "pdf"
OUT = OUT_DIR / "Universal_Review_Mining_Project_Documentation.pdf"

BLUE = colors.HexColor("#2E74B5")
DARK = colors.HexColor("#1F4D78")
LIGHT_BLUE = colors.HexColor("#E8EEF5")
LIGHT_GRAY = colors.HexColor("#F2F4F7")


def build_styles():
    base = getSampleStyleSheet()
    return {
        "title": ParagraphStyle("title", parent=base["Title"], fontName="Helvetica-Bold", fontSize=24, leading=29, textColor=DARK, alignment=TA_CENTER, spaceAfter=8),
        "subtitle": ParagraphStyle("subtitle", parent=base["Normal"], fontName="Helvetica", fontSize=13, leading=17, textColor=colors.HexColor("#555555"), alignment=TA_CENTER, spaceAfter=22),
        "h1": ParagraphStyle("h1", parent=base["Heading1"], fontName="Helvetica-Bold", fontSize=16, leading=20, textColor=BLUE, spaceBefore=16, spaceAfter=8, keepWithNext=True),
        "h2": ParagraphStyle("h2", parent=base["Heading2"], fontName="Helvetica-Bold", fontSize=12.5, leading=16, textColor=DARK, spaceBefore=11, spaceAfter=5, keepWithNext=True),
        "body": ParagraphStyle("body", parent=base["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13, spaceAfter=6),
        "bullet": ParagraphStyle("bullet", parent=base["BodyText"], fontName="Helvetica", fontSize=9.5, leading=13, leftIndent=16, firstLineIndent=-9, bulletIndent=5, spaceAfter=4),
        "cell": ParagraphStyle("cell", parent=base["BodyText"], fontName="Helvetica", fontSize=8.2, leading=10.2),
        "header_cell": ParagraphStyle("header_cell", parent=base["BodyText"], fontName="Helvetica-Bold", fontSize=8.2, leading=10.2, textColor=DARK),
        "footer": ParagraphStyle("footer", parent=base["Normal"], fontName="Helvetica", fontSize=8, textColor=colors.HexColor("#666666"), alignment=TA_CENTER),
    }


def p(text, style):
    return Paragraph(text.replace("&", "&amp;").replace("`", ""), style)


def matrix(headers, rows, widths, styles):
    data = [[p(x, styles["header_cell"]) for x in headers]]
    data += [[p(str(x), styles["cell"]) for x in row] for row in rows]
    table = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), DARK),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#C9D4E0")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#FAFBFC")]),
    ]))
    return table


def bullet(text, styles):
    return Paragraph("&bull; " + text, styles["bullet"])


def numbered(index, text, styles):
    return Paragraph(f"{index}. {text}", styles["bullet"])


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(4.25 * inch, 0.45 * inch, f"Technical Project Documentation  |  Page {doc.page}")
    canvas.restoreState()


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    styles = build_styles()
    doc = SimpleDocTemplate(str(OUT), pagesize=letter, leftMargin=0.75 * inch, rightMargin=0.75 * inch, topMargin=0.85 * inch, bottomMargin=0.72 * inch)
    story = []
    story += [p("Universal Review Mining & Intelligence System", styles["title"]), p("Comprehensive Technical Project Documentation", styles["subtitle"])]
    story += [p("<b>Project type:</b> Client-side business-intelligence and review-analytics dashboard with an optional Gemini-powered executive-summary API.<br/><b>Primary language:</b> TypeScript. <b>UI:</b> React 19, Vite, Tailwind CSS 4. <b>Server:</b> Node.js and Express.", styles["body"])]

    story += [p("1. Purpose and scope", styles["h1"]), p("The system accepts customer-review datasets and transforms them into an interactive business-intelligence dashboard. It is intended for product, hotel, restaurant, and service feedback. It supports browser-based ingestion, transparent data preparation, explainable text analytics, interactive filtering, and downloadable reports. Built-in samples cover mobile devices, hospitality, and restaurants.", styles["body"])]
    story += [p("2. Feature inventory", styles["h1"])]
    for item in [
        "CSV, XLSX, and XLS upload with built-in example datasets.",
        "Automatic review/rating/product/date/category/price detection with editable mapping.",
        "Data-quality profiling, configurable cleaning, reusable NLP tokens, and sentiment classification.",
        "Interactive EDA, KPIs, Plotly charts, text mining, topic/aspect analysis, association rules, and automated insights.",
        "Downloadable cleaned CSV and self-contained HTML intelligence report.",
        "Optional server-side Gemini executive summary and a Python/Streamlit reference-code exporter.",
    ]:
        story.append(bullet(item, styles))

    story += [p("3. Technology stack", styles["h1"]), matrix(["Layer", "Technology", "Purpose"], [
        ["Frontend", "TypeScript, React 19, React DOM", "Dashboard state, components, and client-side analytics orchestration."],
        ["Build", "Vite 6, esbuild, tsx, TypeScript", "Development server, web build, server bundling, type checking."],
        ["Styling", "Tailwind CSS 4 and custom CSS", "Responsive layout, tabs, filters, cards, tables, states."],
        ["Charts", "Plotly.js and react-plotly.js", "Interactive business-intelligence visualizations."],
        ["File ingestion", "Papa Parse and SheetJS xlsx", "Browser parsing of CSV, XLSX, and XLS files."],
        ["Server", "Node.js, Express 4, dotenv", "Health route, Gemini proxy, development and production serving."],
        ["AI", "@google/genai", "Optional Gemini executive synthesis."],
        ["UI extras", "lucide-react, motion", "Icons; Motion is installed but not used in inspected source."],
    ], [1.0 * inch, 2.05 * inch, 3.45 * inch], styles), Spacer(1, 8)]

    story += [p("4. Architecture and data flow", styles["h1"]), p("Most analysis runs entirely in the browser. React holds raw rows, the selected column mapping, cleaning configuration, filters, and derived results in memory. `useMemo` recalculates downstream analytics whenever data, configuration, or filters change. No database, authentication, persistent user storage, or background job system is implemented.", styles["body"])]
    for i, text in enumerate([
        "User selects a sample dataset or uploads CSV/XLSX/XLS.",
        "The loader parses rows and headers; the detector proposes semantic columns.",
        "The user confirms or adjusts mapping; cleaning produces canonical review records and tokens.",
        "Dashboard filters create the active subset used by EDA, sentiment, text mining, topics, aspects, rules, and insights.",
        "Tabs render typed results; exports create a cleaned CSV or HTML report in the browser.",
        "An optional Express endpoint sends approved metrics and sample reviews to Gemini for executive text synthesis.",
    ], 1):
        story.append(numbered(i, text, styles))

    story += [p("5. Core data model", styles["h1"]), matrix(["Type", "Important fields", "Role"], [
        ["ColumnMapping", "review, rating, product, date, category, price", "User-approved dataset interpretation."],
        ["CleaningConfig", "removal flags, min length, custom stopwords", "Text-preprocessing behavior."],
        ["CleanedReviewRow", "original/clean text, tokens, mapped fields, sentiment", "Canonical analysis-ready review record."],
        ["DataQualityReport", "dimensions, missing/duplicate counts, types", "Dataset health profile."],
        ["EDAMetrics", "distributions, rankings, timeline, scatter data", "Dashboard analytics payload."],
        ["SentimentAnalysisResult", "counts, score, matrix-style metrics", "Sentiment output and diagnostic alignment."],
        ["TextMiningResult", "frequencies, n-grams, TF-IDF-like scores", "Text-analysis payload."],
        ["TopicInfo / Aspect / Rule", "keywords, proportions, examples", "Specialized discovery outputs."],
    ], [1.45 * inch, 2.65 * inch, 2.4 * inch], styles), Spacer(1, 6)]

    story += [p("6. Analysis engines", styles["h1"])]
    engines = [
        ("File loading", "`dataLoader.ts` uses Papa Parse for headed CSV files and SheetJS for the first XLSX/XLS worksheet. It returns rows, columns, dimensions, metadata, and errors."),
        ("Column detection", "`columnDetector.ts` samples up to 50 rows, profiles average length/numeric/date characteristics, matches header keywords, and falls back to the longest non-numeric text column for reviews and a constrained numeric column for ratings."),
        ("Data quality", "`dataQuality.ts` counts blank cells, serialized duplicate rows, cardinality, basic inferred types, and approximate JSON-size memory."),
        ("Cleaning", "`dataCleaner.ts` removes missing/duplicate reviews, strips HTML/URLs, normalizes text, removes stopwords/numbers/single-character tokens, applies suffix-based lemmatization, parses ratings/prices, and carries mapped fields forward."),
        ("Sentiment", "`sentimentEngine.ts` uses curated positive/negative lexicons, preceding-token intensifier/negation rules, and 70% lexical plus 30% star-rating blending. Scores above 0.15 are positive; below -0.15 are negative."),
        ("EDA", "`edaEngine.ts` calculates review/rating/product/category totals, distributions, rankings, monthly counts, review-length buckets, and limited scatter series."),
        ("Text mining", "`textMiningEngine.ts` creates overall and sentiment-specific word counts, bigrams/trigrams, a smoothed TF-IDF-like score, and color-tagged word-cloud items."),
        ("Topics", "`topicModelingEngine.ts` ranks fixed domain keyword clusters, then falls back to grouped high-frequency terms. This is a heuristic, not statistical LDA."),
        ("Aspect sentiment", "`aspectSentimentEngine.ts` matches fixed multi-domain aspect vocabularies and aggregates sentiment counts plus representative reviews. A review can match multiple aspects."),
        ("Association rules", "`associationMiningEngine.ts` converts reviews to token sets, mines single and pair itemsets, and produces directional support/confidence/lift rules. It returns the top 15 rules by lift."),
        ("Insights and exports", "`insightsEngine.ts` creates deterministic factual statements. `reportGenerator.ts` outputs quote-escaped CSV and self-contained HTML reports."),
    ]
    for engine_index, (name, text) in enumerate(engines):
        story += [p(name, styles["h2"]), p(text, styles["body"])]
        if engine_index == 1:
            story.append(PageBreak())

    story += [PageBreak(), p("7. User interface modules", styles["h1"]), matrix(["Area", "Main source", "Role"], [
        ["Application orchestrator", "App.tsx", "Owns state, mappings, filters, memoized analytics, tab routing, downloads."],
        ["Navigation and filters", "Navbar.tsx; SidebarFilters.tsx", "Sticky navigation and collapsible BI slicers."],
        ["Ingestion/preparation", "FileUpload, ColumnDetection, DataCleaner sections", "File selection, schema review, cleaning setup."],
        ["Metrics and charts", "KPICardsGrid; EDADashboard; PlotlyChart", "KPI cards and interactive analytical views."],
        ["Analysis displays", "Sentiment, TextMining, Topic, Aspect, Association sections", "Renders engine-specific result views."],
        ["Tabs and export", "components/tabs; TablesDownloads; PythonExporter", "Organizes 12 screens, exports, and Python reference content."],
    ], [1.4 * inch, 2.4 * inch, 2.7 * inch], styles), Spacer(1, 8)]
    story += [p("8. Dashboard screens", styles["h1"]), matrix(["Screen", "Capabilities"], [
        ["Dataset & Ingestion", "Upload, sample selection, metadata, parse errors, editable column mapping."],
        ["Overview / Quality", "High-level KPIs, missing/duplicate data, inferred types, unique values, memory estimate."],
        ["EDA / Sentiment", "Rating/product/category/time/length analysis, sentiment distribution, rating/text mismatch view."],
        ["Text / Data Mining", "Frequent terms, n-grams, TF-IDF-like values, word clouds, itemsets and association rules."],
        ["Topics / Product Comparison", "Seeded topic clusters, domain aspects, product comparison and sentiment breakdown."],
        ["Insights / Downloads", "Deterministic insight cards, cleaned CSV, HTML report, and Python reference code."],
    ], [1.65 * inch, 4.85 * inch], styles), Spacer(1, 8)]

    story += [p("9. API, setup, and commands", styles["h1"]), p("GET /api/health returns service status. POST /api/gemini/summarize accepts aggregate metrics, sample reviews, and a domain name. It requests key drivers, customer friction, and strategic recommendations from `gemini-3.6-flash`; it returns `{ summary }`. A missing `GEMINI_API_KEY` returns HTTP 400, while model/API failures return HTTP 500.", styles["body"])]
    story += [matrix(["Command", "Purpose"], [
        ["npm install", "Install JavaScript and TypeScript dependencies."],
        ["npm run dev", "Run `tsx server.ts`; Express listens on port 3000 with Vite middleware."],
        ["npm run build", "Build the Vite client and bundle server.ts to dist/server.cjs."],
        ["npm start", "Start the production server bundle."],
        ["npm run preview", "Run Vite static preview."],
        ["npm run lint", "Run TypeScript type checking using `tsc --noEmit`."],
    ], [1.55 * inch, 4.95 * inch], styles), PageBreak(), p("Optional AI configuration: `GEMINI_API_KEY=your_key_here` in server environment configuration. The key must never be included in browser source or exposed Vite environment variables.", styles["body"])]

    story += [p("10. Security and operational notes", styles["h1"])]
    for item in [
        "Default ingestion and analysis happen in the browser; device memory limits apply to large files.",
        "Using Gemini transmits the supplied metrics and sample reviews to Google. Do not send sensitive content without an approved sharing policy.",
        "The source contains no authentication, authorization, database, persistence, audit log, encrypted storage, rate limiting, or API validation.",
        "A production deployment should add HTTPS, validation, rate limits, observability, managed secrets, and a privacy/retention policy.",
    ]:
        story.append(bullet(item, styles))

    story += [p("11. Current limitations", styles["h1"])]
    for item in [
        "Sentiment is explainable but lexicon-based, not a validated trained ML classifier; sarcasm and domain terms may be misclassified.",
        "The browser topic method is seeded keyword clustering, not LDA, despite some UI/reference-code wording.",
        "Association mining handles one- and two-token itemsets, not higher-order Apriori/FP-Growth rules.",
        "Topic/aspect sidebar selections are represented in UI state but do not currently restrict the active rows. The minimum-price control is also not applied; maximum price is applied.",
        "Date filters compare strings, so `YYYY-MM-DD` input is safest. Excel loading uses only the first worksheet.",
        "No dataset/settings persist after refresh. The Python exporter is reference content, not the active runtime.",
        "Some KPI cards have illustrative fallback values when data is absent; review these before formal reporting.",
    ]:
        story.append(bullet(item, styles))

    story += [p("12. Recommended roadmap", styles["h1"])]
    for i, item in enumerate([
        "Add input/schema validation, worksheet selection, parser diagnostics, and automated unit/end-to-end tests.",
        "Apply minimum-price, topic, and aspect filters consistently in the central filtering predicate.",
        "Introduce configurable multilingual/domain NLP models and validate them against labeled review datasets.",
        "Add persistence, accounts, access control, export history, audit logging, and production observability.",
        "Improve accessibility for charts and controls, including keyboard support and non-visual data alternatives.",
    ], 1):
        story.append(numbered(i, item, styles))

    story += [p("13. Summary", styles["h1"]), p("This project is a TypeScript/React review-intelligence dashboard with browser-side ingestion, configurable cleaning, explainable NLP heuristics, exploratory analytics, association rules, aspect/topic summaries, and exportable business reports. Express supplies a small API layer and optional Gemini synthesis. Its next maturity step is stronger validation, complete filter semantics, persistent/security-aware operations, and evaluated NLP methods.", styles["body"])]
    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(OUT)


if __name__ == "__main__":
    main()
