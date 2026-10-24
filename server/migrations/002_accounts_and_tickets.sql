CREATE TABLE accounts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  phone             text NOT NULL CHECK (phone ~ '^[6-9][0-9]{9}$'),
  token_hash        text NOT NULL UNIQUE,   -- hash of the secret token, never the token itself
  phone_verified_at timestamptz,            -- NULL until the phone is verified
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Unique only once verified, so nobody can squat on someone else's number
CREATE UNIQUE INDEX accounts_verified_phone_idx
  ON accounts (phone) WHERE phone_verified_at IS NOT NULL;

ALTER TABLE blood_requests
  ADD COLUMN account_id     uuid REFERENCES accounts(id),
  ADD COLUMN expires_at     timestamptz,
  ADD COLUMN extended_count integer NOT NULL DEFAULT 0;

-- Give the existing test rows an expiry too
UPDATE blood_requests SET expires_at = created_at + interval '48 hours';

ALTER TABLE blood_requests
  ALTER COLUMN expires_at SET NOT NULL,
  ALTER COLUMN expires_at SET DEFAULT now() + interval '48 hours';

CREATE INDEX blood_requests_account_idx
  ON blood_requests (account_id, created_at DESC);