import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { geminiService } from "./server/services/geminiService";
import { updateSpec } from "./lib/supabase/supabase-specs";
import { geminiRoutes } from "./server/routes/geminiRoutes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/gemini", geminiRoutes);

  app.post("/api/embed-spec", async (req, res) => {
    try {
      const { specId, contentToSave } = req.body;
      if (!specId || !contentToSave) {
        return res.status(400).json({ error: "specId and contentToSave are required" });
      }

      console.log(`Starting ingestion for specId: ${specId}`);
      const embedding = await geminiService.getEmbedding(contentToSave.substring(0, 5000));
      await updateSpec(specId, { embedding });
      console.log(`Vector index updated for specId: ${specId}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Embedding generation failed:", error);
      res.status(500).json({ error: "Embedding generation failed" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
