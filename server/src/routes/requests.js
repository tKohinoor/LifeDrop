import { Router } from "express";
import { pool } from "../db/pool.js";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", "UNKNOWN"];

const router = Router();

// POST /api/requests : save a new blood request
router.post("/", async (req, res) => {
  const { bloodGroup, location, coords, phone, name } = req.body ?? {};

  // Never trust the browser: check everything again on the server
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

  // Coordinates are optional, but if present they must make sense
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

  try {
    // $1, $2... are placeholders. The driver passes the values separately
    // from the SQL, which makes SQL injection impossible.
    const { rows } = await pool.query(
      `INSERT INTO blood_requests
         (blood_group, location_text, latitude, longitude, phone, requester_name)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, status, created_at`,
      [bloodGroup, locationText, latitude, longitude, phone, requesterName]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Failed to save request:", error);
    res.status(500).json({ error: "Could not save your request. Please try again." });
  }
});

export default router;