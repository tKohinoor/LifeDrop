-- Extra details for accounts that are also donors
CREATE TABLE donor_profiles (
  account_id      uuid PRIMARY KEY REFERENCES accounts(id) ON DELETE CASCADE,
  blood_group     text NOT NULL
                  CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  location_text   text NOT NULL,
  latitude        double precision,
  longitude       double precision,
  radius_km       integer NOT NULL DEFAULT 25 CHECK (radius_km BETWEEN 1 AND 100),
  available       boolean NOT NULL DEFAULT true,
  last_donated_on date,
  confirmed_at    timestamptz NOT NULL DEFAULT now(),  -- when they declared 18+ and healthy
  created_at      timestamptz NOT NULL DEFAULT now(),
  CHECK ((latitude IS NULL) = (longitude IS NULL))
);

-- "I can help": one row per donor per request
CREATE TABLE donor_responses (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id   uuid NOT NULL REFERENCES blood_requests(id) ON DELETE CASCADE,
  donor_id     uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  withdrawn_at timestamptz,
  UNIQUE (request_id, donor_id)   -- a donor can't respond twice to the same request
);

CREATE INDEX donor_responses_request_idx ON donor_responses (request_id);