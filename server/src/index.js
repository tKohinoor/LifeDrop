import "dotenv/config";
import express from "express";
import cors from "cors";
import { pool } from "./db/pool.js";
import requestsRouter from "./routes/requests.js";
import meRouter from "./routes/me.js";
import donorsRouter from "./routes/donors.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check: now also proves the database is reachable
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ app: "LifeDrop", status: "ok", database: "connected" });
  } catch {
    res.status(503).json({ app: "LifeDrop", status: "error", database: "unreachable" });
  }
});

app.use("/api/requests", requestsRouter);
app.use("/api/me", meRouter);
app.use("/api/donors", donorsRouter);

app.listen(PORT, () => {
  console.log(`LifeDrop server running on http://localhost:${PORT}`);
});