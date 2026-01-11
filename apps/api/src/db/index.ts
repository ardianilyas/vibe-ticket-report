import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

const connectionString = process.env.DATABASE_URL || 'postgresql://ardian:developer@localhost:5432/tickets_db';

// Create postgres connection
const client = postgres(connectionString);

// Create drizzle instance with schema
export const db = drizzle(client, { schema });

// Export schema for convenience
export * from './schema.js';
