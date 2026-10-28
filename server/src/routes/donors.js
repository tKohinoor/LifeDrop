import { Router } from "express";
import { pool } from "../db/pool.js";
import { optionalAuth, requireAuth } from "../middleware/auth.js";
import { createAccount } from "../auth/accounts.js";
import { canDonateTo } from "../matching/compatibility.js";
import { PROFILE_COLUMNS, eligibility, shapeDonor } from "../matching/donorProfile.js";
import {
  isPhone, parseName, parseLocation, parseCoords, parseLastDonated,
} from "../validation.js";

const DONOR_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const DEFAULT_RADIUS_KM = 25;

const router = Router();

// POST /api/donors : register as a donor.
// With a token: adds a donor profile to the existing account.
// Without one: creates the account first, and returns its token.
router.post("/", optionalAuth, async (req, res) => {
  const body = req.body ?? {};
  const errors = {};

  if (!DONOR_GROUPS.includes(body.bloodGroup)) errors.bloodGroup = "Choose a blood group";

  const location = parseLocation(body.location);
  if (!location) errors.location = "Location must be 3 to 300 characters";

  const coords = parseCoords(body.coords);
  if (!coords.ok) errors.coords = "Invalid coordinates";

  const lastDonated = parseLastDonated(body.lastDonatedOn);
  if (!lastDonated.ok) errors.lastDonatedOn = "Invalid date";

  if (body.confirmed !== true) {
    errors.confirmed = "Please confirm you are 18 or older and healthy";
  }

  const radiusKm = body.radiusKm === undefined ? DEFAULT_RADIUS_KM : Number(body.radiusKm);
  if (!Number.isInteger(radiusKm) || radiusKm < 1 || radiusKm > 100) {
    errors.radiusKm = "Radius must be 1 to 100 km";
  }

  // Name and phone are only needed when there is no account yet
  let name;
  let phone;
  if (!req.account) {
    name = parseName(body.name);
    if (!name) errors.name = "Name must be 2 to 100 characters";
    phone = String(body.phone ?? "");
    if (!isPhone(phone)) errors.phone = "Invalid phone number";
  }

  if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

  const db = await pool.connect();
  try {
    await db.query("BEGIN");

    let accountId = req.account?.id;
    let token = null;

    if (accountId) {
      const existing = await db.query(
        "SELECT 1 FROM donor_profiles WHERE account_id = $1",
        [accountId]
      );
      if (existing.rowCount > 0) {
        await db.query("ROLLBACK");
        return res.status(409).json({ error: "You are already registered as a donor." });
      }
    } else {
      const created = await createAccount(db, { name, phone });
      accountId = created.id;
      token = created.token;
    }

    const { rows } = await db.query(
      `INSERT INTO donor_profiles
         (account_id, blood_group, location_text, latitude, longitude,
          radius_km, last_donated_on)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${PROFILE_COLUMNS}`,
      [accountId, body.bloodGroup, location, coords.lat, coords.lng, radiusKm, lastDonated.value]
    );

    await db.query("COMMIT");

    const donor = shapeDonor(rows[0]);
    res.status(201).json(token ? { donor, token } : { donor });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Failed to register donor:", error);
    res.status(500).json({ error: "Could not register you. Please try again." });
  } finally {
    db.release();
  }
});

// GET /api/donors/me : my donor profile
router.get("/me", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT ${PROFILE_COLUMNS} FROM donor_profiles WHERE account_id = $1`,
      [req.account.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not registered as a donor" });
    res.json(shapeDonor(rows[0]));
  } catch (error) {
    console.error("Failed to load donor profile:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// PATCH /api/donors/me : pause, resume, set last donation date, change radius
router.patch("/me", requireAuth, async (req, res) => {
  const body = req.body ?? {};

  try {
    const { rows } = await pool.query(
      `SELECT ${PROFILE_COLUMNS} FROM donor_profiles WHERE account_id = $1`,
      [req.account.id]
    );
    const current = rows[0];
    if (!current) return res.status(404).json({ error: "Not registered as a donor" });

    const errors = {};

    let available = current.available;
    if ("available" in body) {
      if (typeof body.available === "boolean") available = body.available;
      else errors.available = "Must be true or false";
    }

    let lastDonatedOn = current.last_donated_on;
    if ("lastDonatedOn" in body) {
      const parsed = parseLastDonated(body.lastDonatedOn);
      if (parsed.ok) lastDonatedOn = parsed.value;
      else errors.lastDonatedOn = "Invalid date";
    }

    let radiusKm = current.radius_km;
    if ("radiusKm" in body) {
      const value = Number(body.radiusKm);
      if (Number.isInteger(value) && value >= 1 && value <= 100) radiusKm = value;
      else errors.radiusKm = "Radius must be 1 to 100 km";
    }

    if (Object.keys(errors).length > 0) return res.status(400).json({ errors });

    const updated = await pool.query(
      `UPDATE donor_profiles
          SET available = $2, last_donated_on = $3, radius_km = $4
        WHERE account_id = $1
        RETURNING ${PROFILE_COLUMNS}`,
      [req.account.id, available, lastDonatedOn, radiusKm]
    );
    res.json(shapeDonor(updated.rows[0]));
  } catch (error) {
    console.error("Failed to update donor profile:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

// GET /api/donors/requests : open requests this donor could help with
router.get("/requests", requireAuth, async (req, res) => {
  try {
    const { rows: found } = await pool.query(
      `SELECT ${PROFILE_COLUMNS} FROM donor_profiles WHERE account_id = $1`,
      [req.account.id]
    );
    const profile = found[0];
    if (!profile) return res.status(403).json({ error: "Register as a donor first." });

    // Paused or resting donors see nothing, and are told why
    const status = eligibility(profile);
    if (!status.eligible) return res.json({ ...status, requests: [] });

    const { rows } = await pool.query(
      `SELECT t.id, t.blood_group, t.location_text, t.created_at,
              t.requester_name, t.distance_km, t.responded,
              CASE WHEN t.responded THEN t.requester_phone END AS requester_phone
         FROM (
           SELECT r.id, r.blood_group, r.location_text, r.created_at,
                  a.name  AS requester_name,
                  a.phone AS requester_phone,
                  CASE WHEN r.latitude IS NOT NULL AND $2::float8 IS NOT NULL THEN
                    6371 * 2 * asin(LEAST(1, sqrt(
                      power(sin(radians(r.latitude - $2::float8) / 2), 2) +
                      cos(radians($2::float8)) * cos(radians(r.latitude)) *
                      power(sin(radians(r.longitude - $3::float8) / 2), 2)
                    )))
                  END AS distance_km,
                  EXISTS (
                    SELECT 1 FROM donor_responses d
                     WHERE d.request_id = r.id AND d.donor_id = $1
                       AND d.withdrawn_at IS NULL
                  ) AS responded
             FROM blood_requests r
             JOIN accounts a ON a.id = r.account_id
            WHERE r.status = 'open'
              AND r.expires_at > now()
              AND r.account_id <> $1
              AND r.blood_group = ANY($5::text[])
         ) t
        WHERE t.distance_km IS NULL OR t.distance_km <= $4
        ORDER BY (t.distance_km IS NULL), t.distance_km, t.created_at DESC
        LIMIT 50`,
      [
        req.account.id,
        profile.latitude,
        profile.longitude,
        profile.radius_km,
        canDonateTo(profile.blood_group),
      ]
    );

    res.json({
      eligible: true,
      requests: rows.map((row) => ({
        id: row.id,
        bloodGroup: row.blood_group,
        location: row.location_text,
        createdAt: row.created_at,
        requesterName: row.requester_name,
        distanceKm: row.distance_km === null ? null : Math.round(row.distance_km * 10) / 10,
        responded: row.responded,
        requesterPhone: row.requester_phone, // null until this donor has responded
      })),
    });
  } catch (error) {
    console.error("Failed to list requests for donor:", error);
    res.status(500).json({ error: "Something went wrong. Please try again." });
  }
});

export default router;