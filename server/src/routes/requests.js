import { Router } from "express";
import { pool } from "../db/pool.js";
import { newToken, hashToken } from "../auth/tokens.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "UNKNOWN"];
const MAX_ACTIVE_REQUESTS = 3;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const router = Router();

// POST /api/requests : send a blood request.
// First time on this phone: also creates the account and returns its token.
router.post("/", optionalAuth, async (req, res) => {
  const { bloodGroup, location, coords, phone, name } = req.body ?? {};

  const errors = {};
  if (!BLOOD_GROUPS.includes(bloodGroup)) errors.bloodGroup = "Invalid blood group";

  const locationText = String(location ?? "").trim();
  if (locationText.length < 3 || locationText.length > 300) {
    errors.location = "Location must be 3 to 300 characters";
  }

  if (!/^[6-9]\d{9}$/.test(String(phone ?? ""))) errors.phone = "Invalid phone number";

  const requesterName = String(name ?? "").trim();
  if (requesterName.length < 2 || requesterName.length > 100) {
    errors.name = "Name must be 2 to 100 characters";
  }

  let latitude = null;
  let longitude = null;
  if (coords) {
    latitude = Number(coords.lat);
    longitude = Number(coords.lng);
    const valid =
      Number.isFinite(latitude) && Math.abs(latitude) <= 90 &&
      Number.isFinite(longitude) && Math.abs(longitude) <= 180;
    if (!valid) errors.coords = "Invalid coordinates";
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  const db = await pool.connect();
  try {
    // One transaction: the account and the request are saved together or not at all
    await db.query("BEGIN");

    let accountId = req.account?.id;
    let token = null;

    if (accountId) {
      const { rows } = await db.query(
        `SELECT count(*)::int AS active FROM blood_requests
          WHERE account_id = $1 AND status = 'open' AND expires_at > now()`,
        [accountId]
      );
      if (rows[0].active >= MAX_ACTIVE_REQUESTS) {
        await db.query("ROLLBACK");
        return res.status(409).json({
          error: "You already have several active requests. Close one before adding another.",
        });
      }
    } else {
      token = newToken();
      const created = await db.query(
        "INSERT INTO accounts (name, phone, token_hash) VALUES ($1, $2, $3) RETURNING id",
        [requesterName, phone, hashToken(token)]
      );
      accountId = created.rows[0].id;
    }

    const { rows } = await db.query(
      `INSERT INTO blood_requests
         (account_id, blood_group, location_text, latitude, longitude, phone, requester_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, status, created_at, expires_at`,
      [accountId, bloodGroup, locationText, latitude, longitude, phone, requesterName]
    );

    await db.query("COMMIT");

    // The token is sent exactly once, only when the account is brand new
    res.status(201).json(token ? { ...rows[0], token } : rows[0]);
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Failed to save request:", error);
    res.status(500).json({ error: "Could not save your request. Please try again." });
  } finally {
    db.release();
  }
});

// POST /api/requests/:id/extend : another 48 hours (never beyond 7 days in total)
router.post("/:id/extend", requireAuth, async (req, res) => {
  if (!UUID.test(req.params.id)) return res.status(404).json({ error: "Request not found" });

  try {
    const { rows } = await pool.query(
      `UPDATE blood_requests
          SET expires_at = LEAST(now() + interval '48 hours', created_at + interval '7 days'),
              extended_count = extended_count + 1
        WHERE id = $1 AND account_id = $2 AND status = 'open' AND expires_at > now()
        RETURNING id, status, expires_at, extended_count`,
      [req.params.id, req.account.id]
    );

    if (!rows[0]) return res.status(404).json({ error: "No active request found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Failed to extend request:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// Closing a request: the same logic for "fulfilled" and "cancelled"
function closeRequest(newStatus) {
  return async (req, res) => {
    if (!UUID.test(req.params.id)) return res.status(404).json({ error: "Request not found" });

    try {
      const { rows } = await pool.query(
        `UPDATE blood_requests SET status = $3
          WHERE id = $1 AND account_id = $2 AND status = 'open'
          RETURNING id, status`,
        [req.params.id, req.account.id, newStatus]
      );

      if (!rows[0]) return res.status(404).json({ error: "No open request found" });
      res.json(rows[0]);
    } catch (error) {
      console.error("Failed to close request:", error);
      res.status(500).json({ error: "Something went wrong. Please try again." });
    }
  };
}

router.post("/:id/fulfill", requireAuth, closeRequest("fulfilled"));
router.post("/:id/cancel", requireAuth, closeRequest("cancelled"));

export default router;