// The phone's memory of who it is: a secret token, plus name and phone
// so the next request can be pre-filled. localStorage can fail (private
// mode, full storage), so every call is wrapped and fails quietly.
const TOKEN_KEY = "lifedrop.token";
const PROFILE_KEY = "lifedrop.profile";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // Storage unavailable: the account just won't be remembered
  }
}

export function getProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch {
    // Same as above
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(PROFILE_KEY);
  } catch {
    // Nothing to clear
  }
}