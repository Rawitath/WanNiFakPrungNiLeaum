CREATE TABLE IF NOT EXISTS branches (
  branch_id UUID PRIMARY KEY,
  branch_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS users (
  userid UUID PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS oauthusers (
  id SERIAL PRIMARY KEY,
  userid UUID NOT NULL REFERENCES users(userid) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_user_id)
);

CREATE TABLE IF NOT EXISTS customers (
  customer_id UUID PRIMARY KEY,
  userid UUID REFERENCES users(userid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS staffs (
  staff_id UUID PRIMARY KEY,
  userid UUID REFERENCES users(userid) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(branch_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS managers (
  manager_id UUID PRIMARY KEY,
  userid UUID REFERENCES users(userid) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reservations (
  reservation_id UUID PRIMARY KEY,
  userid UUID REFERENCES users(userid) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(branch_id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  reservation_date DATE DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  pet_name TEXT,
  pet_type TEXT,
  pet_breed TEXT,
  pet_sex TEXT,
  pet_weight NUMERIC,
  pet_birth DATE,
  pet_condition TEXT,
  pet_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pets (
  pet_id UUID PRIMARY KEY,
  userid UUID REFERENCES users(userid) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(branch_id) ON DELETE CASCADE,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  reservation_date DATE DEFAULT CURRENT_DATE,
  check_in TIMESTAMPTZ,
  check_out TIMESTAMPTZ,
  pet_name TEXT,
  pet_type TEXT,
  pet_breed TEXT,
  pet_sex TEXT,
  pet_weight NUMERIC,
  pet_birth DATE,
  status TEXT,
  pet_condition TEXT,
  pet_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);