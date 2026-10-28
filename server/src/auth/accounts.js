import { newToken, hashToken } from "./tokens.js";

// Makes a new minimal account and returns its id and the one-time token.
// `db` is a database client so it can run inside a transaction.
export async function createAccount(db, { name, phone }) {
  const token = newToken();
  const { rows } = await db.query(
    "INSERT INTO accounts (name, phone, token_hash) VALUES ($1, $2, $3) RETURNING id",
    [name, phone, hashToken(token)]
  );
  return { id: rows[0].id, token };
}