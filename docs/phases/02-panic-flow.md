# Phase 2: The Panic Flow

**Status:** In progress

## Goal
The fewest possible steps from "I need blood" to "a donor is on the way".

## Rules we hold ourselves to
- No account needed to request blood.
- A request takes about a minute.
- Every screen fits one viewport, down to ~568px tall, with no scrolling.
- Errors appear in place and never shift the layout.

## Built so far

### Request form (v1)
| Field | Input | Rule |
|-------|-------|------|
| Blood group | 8 tap buttons + "Not sure" | Required |
| Location | Auto-detected, editable text | Required; "Where is blood needed?" |
| Phone | +91 prefix, numeric keypad | 10 digits, starting 6-9 |
| Name | Text | Required, at least 2 characters |

### Backend
- PostgreSQL 16. Schema changes are numbered SQL files in `server/migrations`, applied with `npm run migrate`.
- `POST /api/requests` validates on the server and stores the request.

### Form to server
- The request form submits to `POST /api/requests`.
- While sending, the button shows "Sending…" and is disabled (prevents duplicate requests).
- On failure the form keeps all input, shows a short message under the button, and the button becomes "Try Again". Requests time out after 15 seconds.

### Accounts and tickets (backend)
- First request creates a minimal account (name, phone) and returns a secret token once. The phone stores it; the server stores only its SHA-256 hash.
- Phones are not unique while unverified (prevents number squatting); unique once verified.
- A ticket is active for 48 hours. Extending resets to 48 hours, capped at 7 days from creation. Max 3 active tickets per account.
- Expiry is computed (`status = 'open' AND expires_at > now()`), no background job needed.
- The countdown is NOT shown in the UI; `expires_at` drives reminders only.
- Endpoints: `POST /api/requests`, `POST /api/requests/:id/extend|fulfill|cancel`, `GET /api/me`.

### Known gaps (Phase 3)
- No rate limiting yet: anonymous requests can create accounts freely.
- Token lives in the browser; if the device is shared or the browser data is cleared, access is lost until phone verification exists.

## Open questions
- Should phone numbers be verified with an OTP? (Phase 3)
- Does the request need a hospital-name field, number of units, or urgency level?
- Who is allowed to see the requestor's phone number? (Phase 3)
- When the server is unreachable, keep the request on the phone and retry, or show an error?
- **Decided (v1):** if sending fails, show an error and let the person retry manually. Auto-retry and saving the request on the phone are planned as a later step.

## Outcome
_To be filled in when the phase closes._