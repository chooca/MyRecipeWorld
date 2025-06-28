import express from "express";
import { registerRoutes } from "../server/routes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from client build
app.use(express.static(path.join(__dirname, "../dist/client")));

// Setup API routes
await registerRoutes(app);

// Catch-all handler: send back React's index.html file for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/client/index.html"));
});

export default app;