import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());          // lets the frontend talk to this server
app.use(express.json());  // lets the server read JSON sent by the frontend

// A simple route to prove the server is alive
app.get("/api/health", (req, res) => {
  res.json({ app: "LifeDrop", status: "ok" });
});

app.listen(PORT, () => {
  console.log(`LifeDrop server running on http://localhost:${PORT}`);
});