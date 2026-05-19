-- Database schema for Dynex Performance workshop app

CREATE TABLE job_orders (
  id TEXT PRIMARY KEY,
  car_brand TEXT NOT NULL,
  car_year INTEGER NOT NULL,
  mileage INTEGER NOT NULL,
  parts_list TEXT, -- JSON string
  job_description TEXT NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  status TEXT DEFAULT 'Offert', -- 'Offert', 'Pågående', 'Klar'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
