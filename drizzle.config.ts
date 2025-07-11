import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// This makes sure your DATABASE_URL from .env.local is loaded
config({ path: ".env.local" });

export default defineConfig({
  // The path to your schema file.
  // Update this to point to the file inside your "db" folder.
  schema: "./db/schema.ts",

  // The directory where Drizzle Kit can write temporary files or migrations.
  out: "./drizzle",

  // Specify that we're talking to a PostgreSQL database.
  dialect: "postgresql",

  // Provide the database credentials.
  dbCredentials: {
    url: process.env.DATABASE_URL!, // This reads the URL from your .env.local file
  },

  // These are helpful for seeing detailed logs during the process.
  verbose: true,
  strict: true,
});
