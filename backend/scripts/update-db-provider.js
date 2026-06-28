const fs = require('fs');
const path = require('path');

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error(`Schema file not found at: ${schemaPath}`);
  process.exit(1);
}

let schema = fs.readFileSync(schemaPath, 'utf8');
const dbUrl = process.env.DATABASE_URL || '';

if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
  console.log('Detected PostgreSQL database URL. Updating schema provider to "postgresql"...');
  schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
} else {
  console.log('Detected SQLite database URL or no database URL. Updating schema provider to "sqlite"...');
  schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('Prisma schema provider updated successfully.');
