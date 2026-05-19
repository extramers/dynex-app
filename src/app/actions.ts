'use server';

import { redirect } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { query, execute } from '../lib/db';

async function initializeDatabase() {
  // Ensure table exists
  await execute(`
    CREATE TABLE IF NOT EXISTS job_orders (
      id TEXT PRIMARY KEY,
      car_brand TEXT NOT NULL,
      car_model TEXT,
      car_year TEXT NOT NULL,
      registration_number TEXT,
      mileage TEXT NOT NULL,
      job_description TEXT DEFAULT '',
      customer_name TEXT,
      customer_phone TEXT,
      customer_email TEXT,
      labor_list TEXT,
      parts_list TEXT,
      optimization_list TEXT,
      total_price REAL,
      status TEXT DEFAULT 'Offert',
      invoice_number TEXT,
      invoice_date TEXT,
      due_date TEXT,
      our_reference TEXT,
      your_reference TEXT,
      payment_terms TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add new columns if they don't exist
  const tableInfo = await query(`PRAGMA table_info(job_orders)`) as any[];
  const columns = tableInfo.map(col => col.name);
  
  if (!columns.includes('invoice_number')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN invoice_number TEXT`);
  }
  if (!columns.includes('invoice_date')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN invoice_date TEXT`);
  }
  if (!columns.includes('due_date')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN due_date TEXT`);
  }
  if (!columns.includes('car_model')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN car_model TEXT`);
  }
  if (!columns.includes('registration_number')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN registration_number TEXT`);
  }
  if (!columns.includes('our_reference')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN our_reference TEXT`);
  }
  if (!columns.includes('your_reference')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN your_reference TEXT`);
  }
  if (!columns.includes('payment_terms')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN payment_terms TEXT`);
  }
  if (!columns.includes('customer_number')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN customer_number TEXT`);
  }
  if (!columns.includes('quote_notes')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN quote_notes TEXT DEFAULT ''`);
  }
  if (!columns.includes('general_notes')) {
    await execute(`ALTER TABLE job_orders ADD COLUMN general_notes TEXT DEFAULT ''`);
  }
}

export async function createQuotation(formData: FormData) {
  await initializeDatabase();
  
  const id = uuidv4();
  const rawBrand = formData.get('carBrand') as string;
  const customBrand = formData.get('customCarBrand') as string;
  const carBrand = rawBrand === 'Annat' && customBrand ? customBrand : rawBrand;
  
  const rawModel = formData.get('carModel') as string;
  const customModel = formData.get('customCarModel') as string;
  const carModel = rawModel === 'Annat' && customModel ? customModel : rawModel;
  
  const carYear = formData.get('carYear') as string;
  const registrationNumber = formData.get('registrationNumber') as string;
  const mileage = formData.get('mileage') as string;
  const customerName = formData.get('customerName') as string;
  const customerPhone = formData.get('customerPhone') as string;
  const customerEmail = formData.get('customerEmail') as string;
  
  const laborData = formData.get('laborData') as string;
  const partsData = formData.get('partsData') as string;
  const optimizationData = formData.get('optimizationData') as string;
  const totalPrice = parseFloat(formData.get('totalPrice') as string) || 0;

  // Generate Customer Number (Kundnr)
  let customerNumber = '1000';
  const maxResult = await query(`SELECT MAX(CAST(customer_number AS INTEGER)) as max_num FROM job_orders WHERE customer_number IS NOT NULL`) as any[];
  if (maxResult && maxResult.length > 0 && maxResult[0].max_num && maxResult[0].max_num >= 1000) {
    customerNumber = (maxResult[0].max_num + 1).toString();
  }

  // Generate Invoice Number
  const currentDate = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const invoiceNumber = `${currentDate}${customerNumber}`;

  await execute(`
    INSERT INTO job_orders (
      id, car_brand, car_model, car_year, registration_number, mileage, job_description, 
      customer_name, customer_phone, customer_email, 
      labor_list, parts_list, optimization_list, total_price, status, customer_number, invoice_number
    ) VALUES (
      '${id}', 
      '${carBrand.replace(/'/g, "''")}', 
      '${carModel.replace(/'/g, "''")}', 
      '${carYear.replace(/'/g, "''")}', 
      '${registrationNumber.replace(/'/g, "''")}', 
      '${mileage.replace(/'/g, "''")}', 
      '', 
      '${customerName.replace(/'/g, "''")}', 
      '${customerPhone.replace(/'/g, "''")}', 
      '${customerEmail.replace(/'/g, "''")}', 
      '${laborData.replace(/'/g, "''")}', 
      '${partsData.replace(/'/g, "''")}', 
      '${optimizationData.replace(/'/g, "''")}', 
      ${totalPrice}, 
      'Offert',
      '${customerNumber}',
      '${invoiceNumber}'
    )
  `);

  redirect('/jobbordrar');
}

export async function getJobOrders() {
  await initializeDatabase();
  return query('SELECT * FROM job_orders ORDER BY created_at DESC');
}

export async function getJobOrderById(id: string) {
  await initializeDatabase();
  const results = await query(`SELECT * FROM job_orders WHERE id = '${id}'`);
  return results[0] || null;
}

export async function updateJobStatus(id: string, status: string) {
  await execute(`UPDATE job_orders SET status = '${status}', updated_at = CURRENT_TIMESTAMP WHERE id = '${id}'`);
}

export async function updateJobDescription(id: string, description: string) {
  await execute(`UPDATE job_orders SET job_description = '${description.replace(/'/g, "''")}', updated_at = CURRENT_TIMESTAMP WHERE id = '${id}'`);
}

export async function updateInvoiceDetails(
  id: string, 
  invoiceNumber: string, 
  invoiceDate: string, 
  dueDate: string,
  ourReference: string,
  yourReference: string,
  paymentTerms: string
) {
  await execute(`
    UPDATE job_orders 
    SET invoice_number = '${invoiceNumber.replace(/'/g, "''")}', 
        invoice_date = '${invoiceDate.replace(/'/g, "''")}', 
        due_date = '${dueDate.replace(/'/g, "''")}', 
        our_reference = '${ourReference.replace(/'/g, "''")}', 
        your_reference = '${yourReference.replace(/'/g, "''")}', 
        payment_terms = '${paymentTerms.replace(/'/g, "''")}', 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = '${id}'
  `);
}

export async function updateOrderList(id: string, column: 'labor_list' | 'parts_list' | 'optimization_list', data: string) {
  await execute(`
    UPDATE job_orders 
    SET ${column} = '${data.replace(/'/g, "''")}', 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = '${id}'
  `);
}

export async function updateOrderItems(
  id: string, 
  laborList: string, 
  partsList: string, 
  optimizationList: string, 
  totalPrice: number
) {
  await execute(`
    UPDATE job_orders 
    SET labor_list = '${laborList.replace(/'/g, "''")}', 
        parts_list = '${partsList.replace(/'/g, "''")}', 
        optimization_list = '${optimizationList.replace(/'/g, "''")}', 
        total_price = ${totalPrice},
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = '${id}'
  `);
}

export async function updateNotes(id: string, quoteNotes: string, generalNotes: string) {
  await execute(`
    UPDATE job_orders 
    SET quote_notes = '${quoteNotes.replace(/'/g, "''")}', 
        general_notes = '${generalNotes.replace(/'/g, "''")}', 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = '${id}'
  `);
}

export async function updateCarDetails(
  id: string,
  carBrand: string,
  carModel: string,
  carYear: string,
  registrationNumber: string,
  mileage: string
) {
  await execute(`
    UPDATE job_orders 
    SET car_brand = '${carBrand.replace(/'/g, "''")}', 
        car_model = '${carModel.replace(/'/g, "''")}', 
        car_year = '${carYear.replace(/'/g, "''")}', 
        registration_number = '${registrationNumber.replace(/'/g, "''")}', 
        mileage = '${mileage.replace(/'/g, "''")}', 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = '${id}'
  `);
}

export async function updateCustomerDetails(
  id: string,
  customerName: string,
  customerPhone: string,
  customerEmail: string
) {
  await execute(`
    UPDATE job_orders 
    SET customer_name = '${customerName.replace(/'/g, "''")}', 
        customer_phone = '${customerPhone.replace(/'/g, "''")}', 
        customer_email = '${customerEmail.replace(/'/g, "''")}', 
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = '${id}'
  `);
}

export async function deleteOrder(id: string) {
  await execute(`DELETE FROM job_orders WHERE id = '${id}'`);
}