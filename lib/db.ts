import { neon } from '@neondatabase/serverless';
export function db() { if (!process.env.DATABASE_URL) throw new Error('Database configuration is missing'); return neon(process.env.DATABASE_URL); }
