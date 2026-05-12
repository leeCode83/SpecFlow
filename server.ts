import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { geminiRoutes } from "./server/routes/geminiRoutes";
import { githubRoutes } from "./server/routes/githubRoutes";

import { invitationRoutes, projectInvitationRoutes } from "./server/routes/invitationRoutes";
import { userRoutes } from "./server/routes/userRoutes";
import { errorHandler } from "./server/middleware/errorHandler";

/**
 * Main Server Entry Point
 * Handles API routes and serves the frontend in production or through Vite in development.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/gemini", geminiRoutes);
  app.use("/api/github", githubRoutes);
  app.use("/api/invitations", invitationRoutes);
  app.use("/api/projects", projectInvitationRoutes);
  app.use("/api/users", userRoutes);
  // Global Error Handler (must be after routes)
  app.use(errorHandler);


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
