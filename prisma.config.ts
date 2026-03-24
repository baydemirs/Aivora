// Aivora – Prisma Configuration (Prisma 7)
// Manages database connection URLs for Supabase
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Use DIRECT_URL for migrations (avoids PgBouncer prepared statement issues)
// Fall back to DATABASE_URL if DIRECT_URL is not set
const migrationUrl = process.env['DIRECT_URL'] || process.env['DATABASE_URL'];

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: migrationUrl,
  },
});
