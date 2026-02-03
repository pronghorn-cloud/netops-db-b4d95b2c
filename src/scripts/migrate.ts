import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const runMigration = async (): Promise<void> => {
  const connectionString = process.env.DATABASE_URL || 
    'postgresql://database_database_tuwc_user:IStovI2jC8e3dbBYobyjHvmblRTB6zv7@dpg-d61477onputs73adknbg-a.oregon-postgres.render.com:5432/database_database_tuwc?sslmode=require';

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔄 Starting PostgreSQL migration...');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '../migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute the migration
    await pool.query(migrationSQL);

    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('Database schema created:');
    console.log('  - users table');
    console.log('  - sites table');
    console.log('  - containers table');
    console.log('  - devices table');
    console.log('  - All indexes and constraints');
    console.log('  - Automatic updated_at triggers');
    console.log('');
    console.log('Your PostgreSQL database is ready to use! 🚀');
  } catch (error: any) {
    console.error('❌ Migration failed:', error.message);
    console.error('');
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
};

// Run migration
runMigration().catch(console.error);
