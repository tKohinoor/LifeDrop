import { getToken, saveToken, saveProfile, clearSession } from "./session";

function failure(message, extra = {}) {
  return Object.assign(new Error(message), extra);
}

// One function for every server call: adds the token, handles every failure
async function call(path, { method = "GET", body } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`/api${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw failure("No connection. Check your signal and try again.");
  }

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearSession(); // the server no longer knows this token
    throw failure("Please start again.", { unauthorized: true });
  }
  if (response.status === 400) {
    throw failure("Please check the highlighted fields.", { fieldErrors: data.errors });
  }
  if (!response.ok) {
    throw failure(data.error || "Something went wrong on our side. Please try again.");
  }
  return data;
}

export async function createRequest(payload) {
  const saved = await call("/requests", { method: "POST", body: payload });

  // First request on this phone: the server hands us the token, once
  if (saved.token) saveToken(saved.token);
  saveProfile({ name: payload.name, phone: payload.phone });

  return saved;
}

export const getMe = () => call("/me");
export const extendRequest = (id) => call(`/requests/${id}/extend`, { method: "POST" });
export const fulfillRequest = (id) => call(`/requests/${id}/fulfill`, { method: "POST" });
export const cancelRequest = (id) => call(`/requests/${id}/cancel`, { method: "POST" });

export async function registerDonor(payload) {
  const result = await call("/donors", { method: "POST", body: payload });

  // New phone: the server hands us a token. Existing account: no token comes back.
  if (result.token) saveToken(result.token);
  if (payload.name && payload.phone) saveProfile({ name: payload.name, phone: payload.phone });

  return result.donor;
}

export const getDonorRequests = () => call("/donors/requests");
export const updateDonor = (changes) => call("/donors/me", { method: "PATCH", body: changes });
export const respondToRequest = (id) => call(`/requests/${id}/respond`, { method: "POST" });
export const withdrawResponse = (id) => call(`/requests/${id}/withdraw`, { method: "POST" });