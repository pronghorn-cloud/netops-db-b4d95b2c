import { query } from '../config/database';
import bcrypt from 'bcryptjs';

export interface IUser {
  id: string;
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface IUserUpdate {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
}

class UserModel {
  // Hash password helper
  private async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Compare password helper
  async comparePassword(candidatePassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }

  // Find user by ID
  async findById(id: string, includePassword: boolean = false): Promise<IUser | null> {
    const fields = includePassword 
      ? 'id, username, email, password, role, created_at as "createdAt", updated_at as "updatedAt"'
      : 'id, username, email, role, created_at as "createdAt", updated_at as "updatedAt"';
    
    const result = await query(
      `SELECT ${fields} FROM netops.users WHERE id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Find user by email
  async findByEmail(email: string, includePassword: boolean = false): Promise<IUser | null> {
    const fields = includePassword 
      ? 'id, username, email, password, role, created_at as "createdAt", updated_at as "updatedAt"'
      : 'id, username, email, role, created_at as "createdAt", updated_at as "updatedAt"';
    
    const result = await query(
      `SELECT ${fields} FROM netops.users WHERE email = $1`,
      [email]
    );
    
    return result.rows[0] || null;
  }

  // Find user by username
  async findByUsername(username: string): Promise<IUser | null> {
    const result = await query(
      'SELECT id, username, email, role, created_at as "createdAt", updated_at as "updatedAt" FROM netops.users WHERE username = $1',
      [username]
    );
    
    return result.rows[0] || null;
  }

  // Find user by email or username
  async findByEmailOrUsername(email: string, username: string): Promise<IUser | null> {
    const result = await query(
      'SELECT id, username, email, role, created_at as "createdAt", updated_at as "updatedAt" FROM netops.users WHERE email = $1 OR username = $2',
      [email, username]
    );
    
    return result.rows[0] || null;
  }

  // Create new user
  async create(userData: IUserCreate): Promise<IUser> {
    // Hash password before saving
    const hashedPassword = await this.hashPassword(userData.password);
    
    const result = await query(
      `INSERT INTO netops.users (username, email, password, role) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, username, email, role, created_at as "createdAt", updated_at as "updatedAt"`,
      [userData.username, userData.email, hashedPassword, userData.role || 'user']
    );
    
    return result.rows[0];
  }

  // Update user
  async update(id: string, userData: IUserUpdate): Promise<IUser | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (userData.username !== undefined) {
      updates.push(`username = $${paramCount++}`);
      values.push(userData.username);
    }
    if (userData.email !== undefined) {
      updates.push(`email = $${paramCount++}`);
      values.push(userData.email);
    }
    if (userData.password !== undefined) {
      const hashedPassword = await this.hashPassword(userData.password);
      updates.push(`password = $${paramCount++}`);
      values.push(hashedPassword);
    }
    if (userData.role !== undefined) {
      updates.push(`role = $${paramCount++}`);
      values.push(userData.role);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE netops.users SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, username, email, role, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  }

  // Delete user
  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM netops.users WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Get all users with pagination
  async findAll(page: number = 1, limit: number = 10): Promise<{ users: IUser[], total: number }> {
    const offset = (page - 1) * limit;
    
    const [usersResult, countResult] = await Promise.all([
      query(
        'SELECT id, username, email, role, created_at as "createdAt", updated_at as "updatedAt" FROM netops.users ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [limit, offset]
      ),
      query('SELECT COUNT(*) FROM netops.users')
    ]);
    
    return {
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }
}

export default new UserModel();

