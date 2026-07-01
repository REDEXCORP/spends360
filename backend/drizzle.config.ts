import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
    schema: './src/db/schema',
    out: './migrations',
    dialect: 'postgresql',
    casing: 'snake_case',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
    },
});
