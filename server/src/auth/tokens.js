import crypto from "node:crypto";

// 32 random bytes = a token nobody can guess
export function newToken() {
  return crypto.randomBytes(32).toString("base64url");
}

// What we store in the database instead of the token itself
export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}