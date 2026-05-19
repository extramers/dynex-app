import { createClient } from '@libsql/client';

export const db = createClient({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});

// Vi bygger tillbaka query-funktionen så att actions.ts känner igen den
export async function query(sql: string) {
  const result = await db.execute(sql);
  return result.rows;
}

// Vi bygger tillbaka execute-funktionen så att actions.ts känner igen den
export async function execute(sql: string) {
  const result = await db.execute(sql);
  return result;
}
