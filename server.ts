import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API endpoints
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "Universal Review Mining & Intelligence API" });
  });

  // Optional AI Executive Synthesis via Gemini
  app.post("/api/gemini/summarize", async (req, res) => {
    try {
      const { metrics, sampleReviews, domainName } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "GEMINI_API_KEY environment variable is missing. Configure it in Settings > Secrets." 
        });
      }

      const ai = new GoogleGenAI({ 
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const prompt = `You are a Lead Data Scientist and Review Mining Expert analyzing a review dataset for ${domainName || 'generic products'}.
Dataset Stats:
- Total Reviews: ${metrics.totalReviews}
- Average Rating: ${metrics.avgRating} / 5
- Positive Reviews: ${metrics.positiveCount} (${metrics.positivePct}%)
- Negative Reviews: ${metrics.negativeCount} (${metrics.negativePct}%)
- Discovered Aspects: ${metrics.aspects?.map((a: any) => `${a.aspect} (${a.positivePct}% pos)`).join(', ') || 'N/A'}
- Top Keywords: ${metrics.topKeywords?.slice(0, 10).join(', ') || 'N/A'}

Sample Reviews for Context:
${sampleReviews ? sampleReviews.slice(0, 8).map((r: any) => `- [${r.rating}★ | ${r.sentiment}] ${r.text}`).join('\n') : ''}

Please generate an Executive Intelligence Brief with 3 concise sections:
1. Key Driver Highlights (What customers love most)
2. Critical Customer Friction Points (Main issues or complaints)
3. Strategic Recommendations (3 actionable steps for product/service managers)

Keep the formatting clean, professional, and directly tied to the metrics provided.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      res.json({ summary: response.text });
    } catch (error: any) {
      console.error("Gemini Summarize Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate AI executive summary" });
    }
  });

  // Vite middleware for development vs static serve for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Review Mining Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
