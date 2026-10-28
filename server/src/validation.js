export const isPhone = (value) => /^[6-9]\d{9}$/.test(String(value ?? ""));

// Each parser returns the cleaned value, or null if it's not acceptable
export function parseName(value) {
  const text = String(value ?? "").trim();
  return text.length >= 2 && text.length <= 100 ? text : null;
}

export function parseLocation(value) {
  const text = String(value ?? "").trim();
  return text.length >= 3 && text.length <= 300 ? text : null;
}

// No coordinates is fine ({ ok: true, lat: null }); nonsense coordinates are not
export function parseCoords(coords) {
  if (!coords) return { ok: true, lat: null, lng: null };
  const lat = Number(coords.lat);
  const lng = Number(coords.lng);
  const ok =
    Number.isFinite(lat) && Math.abs(lat) <= 90 &&
    Number.isFinite(lng) && Math.abs(lng) <= 180;
  return ok ? { ok: true, lat, lng } : { ok: false };
}

// "YYYY-MM-DD", real, and not in the future. Empty is allowed (means "never").
export function parseLastDonated(value) {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }
  const text = String(value);
  const date = new Date(`${text}T00:00:00Z`);
  const valid =
    /^\d{4}-\d{2}-\d{2}$/.test(text) &&
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === text && // rejects things like 2026-02-31
    date.getTime() <= Date.now();
  return valid ? { ok: true, value: text } : { ok: false };
}