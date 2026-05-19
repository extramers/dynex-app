import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'workshop.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('busy_timeout = 5000');

db.exec(`
  CREATE TABLE IF NOT EXISTS job_orders (
    id TEXT PRIMARY KEY,
    car_brand TEXT NOT NULL,
    car_year TEXT NOT NULL,
    mileage TEXT NOT NULL,
    customer_name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const tableInfo = db.prepare("PRAGMA table_info(job_orders)").all() as any[];
const columns = tableInfo.map(col => col.name);

const missingColumns = [
  { name: 'car_model', type: 'TEXT' },
  { name: 'registration_number', type: 'TEXT' },
  { name: 'job_description', type: 'TEXT DEFAULT \'\'' },
  { name: 'customer_phone', type: 'TEXT' },
  { name: 'customer_email', type: 'TEXT' },
  { name: 'labor_list', type: 'TEXT' },
  { name: 'parts_list', type: 'TEXT' },
  { name: 'optimization_list', type: 'TEXT' },
  { name: 'total_price', type: 'REAL' },
  { name: 'status', type: 'TEXT DEFAULT \'Offert\'' },
  { name: 'invoice_number', type: 'TEXT' },
  { name: 'invoice_date', type: 'TEXT' },
  { name: 'due_date', type: 'TEXT' },
  { name: 'payment_terms', type: 'TEXT' }, // Nytt
  { name: 'ocr_number', type: 'TEXT' },    // Nytt
  { name: 'updated_at', type: 'DATETIME DEFAULT CURRENT_TIMESTAMP' }
];

missingColumns.forEach(col => {
  if (!columns.includes(col.name)) {
    db.exec(`ALTER TABLE job_orders ADD COLUMN ${col.name} ${col.type}`);
  }
});

export async function query(sql: string) { return db.prepare(sql).all(); }
export async function execute(sql: string) { return db.prepare(sql).run(); }