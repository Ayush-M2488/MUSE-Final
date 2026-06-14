import { Pool } from 'pg';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

dotenv.config();

/**
 * @deprecated Use the `prisma` export instead. Raw SQL is being phased out to comply with project rules.
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Configure Prisma v7 with the PG adapter
const adapter = new PrismaPg(pool);

// ------------------------------------------------------------------
// NEW: PRISMA ORM (Use this for all future database operations)
// ------------------------------------------------------------------
export const prisma = new PrismaClient({ adapter });

// Test the connection on startup
pool.on('connect', () => {
    console.log('[PostgreSQL] Connected to the database (Raw Pool)');
});

pool.on('error', (err) => {
    console.error('[PostgreSQL] Unexpected error on idle client', err);
    process.exit(-1);
});
