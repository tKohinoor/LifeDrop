import { Router } from "express";
import { pool } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { PROFILE_COLUMNS, shapeDonor } from "../matching/donorProfile.js";

const router = Router();

// GET /api/me : the account, its donor profile (if any), active tickets, and donor replies
router.get("/", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, blood_group, location_text, status, created_at, expires_at, extended_count
         FROM blood_requests
        WHERE account_id = $1 AND status = 'open' AND expires_at > now()
        ORDER BY created_at DESC`,
      [req.account.id]
    );

    // All replies for all tickets in one query, then grouped by ticket
    const responsesByRequest = {};
    if (rows.length > 0) {
      const { rows: responses } = await pool.query(
        `SELECT dr.request_id, dr.created_at, a.name, a.phone, dp.blood_group
           FROM donor_responses dr
           JOIN accounts a ON a.id = dr.donor_id
           LEFT JOIN donor_profiles dp ON dp.account_id = dr.donor_id
          WHERE dr.request_id = ANY($1::uuid[]) AND dr.withdrawn_at IS NULL
          ORDER BY dr.created_at`,
        [rows.map((row) => row.id)]
      );

      for (const response of responses) {
        (responsesByRequest[response.request_id] ??= []).push({
          name: response.name,
          phone: response.phone,
          bloodGroup: response.blood_group,
          respondedAt: response.created_at,
        });
      }
    }

    const { rows: donorRows } = await pool.query(
      `SELECT ${PROFILE_COLUMNS} FROM donor_profiles WHERE account_id = $1`,
      [req.account.id]
    );

    res.json({
      account: {
        name: req.account.name,
        phone: req.account.phone,
        phoneVerified: Boolean(req.account.phone_verified_at),
      },
      donor: donorRows[0] ? shapeDonor(donorRows[0]) : null,
      activeRequests: rows.map((row) => ({
        id: row.id,
        bloodGroup: row.blood_group,
        location: row.location_text,
        status: row.status,
        createdAt: row.created_at,
        expiresAt: row.expires_at, // still not shown on screen
        extendedCount: row.extended_count,
        responses: responsesByRequest[row.id] ?? [],
      })),
    });
  } catch (error) {
    console.error("Failed to load account:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;