export const REST_DAYS = 90; // placeholder: confirm the real rule with a blood bank

// Dates come out as plain "YYYY-MM-DD" text so time zones can't shift them
export const PROFILE_COLUMNS = `
  blood_group, location_text, latitude, longitude, radius_km, available,
  to_char(last_donated_on, 'YYYY-MM-DD') AS last_donated_on
`;

export function eligibility(profile) {
  if (!profile.available) return { eligible: false, reason: "paused" };

  if (profile.last_donated_on) {
    const days = (Date.now() - new Date(profile.last_donated_on).getTime()) / 86400000;
    if (days < REST_DAYS) {
      return { eligible: false, reason: "resting", daysLeft: Math.ceil(REST_DAYS - days) };
    }
  }
  return { eligible: true };
}

// The shape the app receives
export function shapeDonor(row) {
  return {
    bloodGroup: row.blood_group,
    location: row.location_text,
    radiusKm: row.radius_km,
    available: row.available,
    lastDonatedOn: row.last_donated_on,
    ...eligibility(row),
  };
}