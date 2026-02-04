import { Pool } from 'pg';


let pool: Pool | null = null;

export const connectDatabase = async (): Promise<void> => {
  try {
    const connectionString = process.env.DATABASE_URL || 
      'postgresql://database_database_tuwc_user:IStovI2jC8e3dbBYobyjHvmblRTB6zv7@dpg-d61477onputs73adknbg-a.oregon-postgres.render.com:5432/database_database_tuwc?sslmode=require';
    
    pool = new Pool({
      connectionString,
      ssl: {
        rejectUnauthorized: false // Required for Render.com hosted PostgreSQL
      }
    });

    // Test the connection
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();

    console.log('✅ PostgreSQL connected successfully');
    console.log(`📊 Database: Connected at ${result.rows[0].now}`);

    pool.on('error', (error) => {
      console.error('PostgreSQL connection error:', error);
    });

  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    if (pool) {
      await pool.end();
      pool = null;
      console.log('PostgreSQL disconnected');
    }
  } catch (error) {
    console.error('Error disconnecting from PostgreSQL:', error);
    throw error;
  }
};

export const getPool = (): Pool => {
  if (!pool) {
    throw new Error('Database pool not initialized. Call connectDatabase() first.');
  }
  return pool;
};

export const query = async (text: string, params?: any[]): Promise<any> => {
  const pool = getPool();
  return pool.query(text, params);
};

