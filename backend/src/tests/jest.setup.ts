import { execSync } from "child_process";
import { prisma } from "../db";

// Redirect database connection to test database
process.env.DATABASE_URL = "file:./test.db";

beforeAll(async () => {
  console.log("Setting up test database...");
  try {
    // Run db push on the test database
    execSync("npx prisma db push --accept-data-loss --skip-generate", {
      env: { ...process.env, DATABASE_URL: "file:./test.db" },
      stdio: "inherit"
    });
    console.log("Test database schema synced successfully.");
  } catch (err) {
    console.error("Error setting up test database schema:", err);
    throw err;
  }
});

afterAll(async () => {
  // Close database connection
  await prisma.$disconnect();
});
