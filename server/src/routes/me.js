import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/me : the account plus its active tickets, in one call for the dashboard
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, blood_group, location_text, status, created_at, expires_at, extended_count
         FROM blood_requests
        WHERE account_id = $1 AND status = 'open' AND expires_at > now()
        ORDER BY created_at DESC`,
      [req.account.id]
    );

    res.json({
      account: {
        name: req.account.name,
        phone: req.account.phone,
        phoneVerified: Boolean(req.account.phone_verified_at),
      },
      activeRequests: rows.map((row) => ({
        id: row.id,
        bloodGroup: row.blood_group,
        location: row.location_text,
        status: row.status,
        createdAt: row.created_at,
        expiresAt: row.expires_at, // kept for the reminders, not shown on screen
        extendedCount: row.extended_count,
      })),
    });
  } catch (error) {
    console.error("Failed to load account:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;