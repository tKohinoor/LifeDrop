// Turns every kind of failure into one error shape the screens can use.
function failure(message, fieldErrors) {
  const error = new Error(message);
  error.fieldErrors = fieldErrors;
  return error;
}

export async function createRequest(data) {
  let response;

  try {
    response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(15000), // give up after 15 seconds
    });
  } catch {
    // No signal, server down, or the 15 seconds ran out
    throw failure("No connection. Check your signal and try again.");
  }

  if (response.status === 400) {
    // The server rejected a field. Hand its messages back to the form.
    const body = await response.json().catch(() => ({}));
    throw failure("Please check the highlighted fields.", body.errors);
  }

  if (!response.ok) {
    throw failure("Something went wrong on our side. Please try again.");
  }

  return response.json(); // { id, status, created_at }
}