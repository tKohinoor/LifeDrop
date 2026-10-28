# Phase 4: Data and Matching

**Status:** Started (donor side, backend)

## Data model so far
- `accounts`: minimal account, token hash, `phone_verified_at`
- `blood_requests`: a ticket; active while `status = 'open' AND expires_at > now()`
- `donor_profiles`: blood group, location, radius (default 25 km), availability, last donation date
- `donor_responses`: one row per donor per request ("I can help"), with `withdrawn_at`

## Matching rules
- A donor sees open requests whose blood group their own group can donate to (standard compatibility chart). "Not sure" requests go to every donor.
- Within the donor's radius; requests without coordinates are shown last.
- Donors are hidden from requests while paused, or for 90 days after a donation (**placeholder, verify with a blood bank**).
- Hospitals always cross-match; the app only connects people.

## Privacy rules
- A donor sees the requestor's name, never their phone, until the donor taps "I can help".
- After that, both see each other's name and phone.
- A donor can't respond to their own request.

## Known gaps
- Phone numbers are unverified. A fake donor or requestor can still receive someone's number. Fix in Phase 3.
- No rate limiting on registration or responses.
- No notification to donors when a matching request appears (push is deferred).