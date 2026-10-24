import { pool } from "../db/pool.js";
import { hashToken } from "../auth/tokens.js";

async function findAccount(req) {
  const [scheme, token] = (req.get("Authorization") || "").split(" ");
  if (scheme !== "Bearer" || !token) return null;

  const { rows } = await pool.query(
    "SELECT id, name, phone, phone_verified_at FROM accounts WHERE token_hash = $1",
    [hashToken(token)]
  );
  return rows[0] ?? null;
}

// Identify the account if there is one, but let anonymous people through
export async function optionalAuth(req, res, next) {
  try {
    req.account = await findAccount(req);
    next();
  } catch (error) {
    next(error);
  }
}

// Only let signed-in accounts through
export async function requireAuth(req, res, next) {
  try {
    const account = await findAccount(req);
    if (!account) return res.status(401).json({ error: "Not signed in" });
    req.account = account;
    next();
  } catch (error) {
    next(error);
  }
}