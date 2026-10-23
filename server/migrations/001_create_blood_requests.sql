CREATE TABLE blood_requests (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blood_group    text NOT NULL
                 CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-','UNKNOWN')),
  location_text  text NOT NULL,
  latitude       double precision,
  longitude      double precision,
  phone          text NOT NULL CHECK (phone ~ '^[6-9][0-9]{9}$'),
  requester_name text NOT NULL,
  status         text NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open', 'fulfilled', 'cancelled')),
  created_at     timestamptz NOT NULL DEFAULT now(),

  -- coordinates are either both present or both missing
  CHECK ((latitude IS NULL) = (longitude IS NULL))
);

-- Finding the newest open requests will be our most common question
CREATE INDEX blood_requests_status_created_idx
  ON blood_requests (status, created_at DESC);