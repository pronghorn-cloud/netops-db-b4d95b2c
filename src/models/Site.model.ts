import { query } from '../config/database';

export interface ISite {
  id: string;
  name: string;
  location: string;
  address?: string;
  description?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface ISiteCreate {
  name: string;
  location: string;
  address?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface ISiteUpdate {
  name?: string;
  location?: string;
  address?: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface ISiteQuery {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}

class SiteModel {
  // Find site by ID
  async findById(id: string): Promise<ISite | null> {
    const result = await query(
      'SELECT id, name, location, address, description, status, created_at as "createdAt", updated_at as "updatedAt" FROM netops.sites WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Get all sites with filters and pagination
  async findAll(queryParams: ISiteQuery = {}): Promise<{ sites: ISite[], total: number }> {
    const { search, status, page = 1, limit = 10 } = queryParams;
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let queryValues: any[] = [];
    let paramCount = 1;

    // Add search filter (using ILIKE for case-insensitive search)
    if (search) {
      whereConditions.push(`(name ILIKE $${paramCount} OR location ILIKE $${paramCount})`);
      queryValues.push(`%${search}%`);
      paramCount++;
    }

    // Add status filter
    if (status) {
      whereConditions.push(`status = $${paramCount}`);
      queryValues.push(status);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const [sitesResult, countResult] = await Promise.all([
      query(
        `SELECT id, name, location, address, description, status, created_at as "createdAt", updated_at as "updatedAt" 
         FROM netops.sites ${whereClause} 
         ORDER BY created_at DESC 
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        [...queryValues, limit, offset]
      ),
      query(
        `SELECT COUNT(*) as count FROM netops.sites ${whereClause}`,
        queryValues
      )
    ]);
    
    return {
      sites: sitesResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Create new site
  async create(siteData: ISiteCreate): Promise<ISite> {
    const result = await query(
      `INSERT INTO netops.sites (name, location, address, description, status) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING id, name, location, address, description, status, created_at as "createdAt", updated_at as "updatedAt"`,
      [
        siteData.name,
        siteData.location,
        siteData.address || null,
        siteData.description || null,
        siteData.status || 'active'
      ]
    );
    
    return result.rows[0];
  }

  // Update site
  async update(id: string, siteData: ISiteUpdate): Promise<ISite | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (siteData.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(siteData.name);
    }
    if (siteData.location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(siteData.location);
    }
    if (siteData.address !== undefined) {
      updates.push(`address = $${paramCount++}`);
      values.push(siteData.address);
    }
    if (siteData.description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(siteData.description);
    }
    if (siteData.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(siteData.status);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE netops.sites SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, name, location, address, description, status, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  }

  // Delete site
  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM netops.sites WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Get site with its containers
  async findByIdWithContainers(id: string): Promise<any | null> {
    const siteResult = await query(
      'SELECT id, name, location, address, description, status, created_at as "createdAt", updated_at as "updatedAt" FROM netops.sites WHERE id = $1',
      [id]
    );
    
    if (siteResult.rows.length === 0) {
      return null;
    }

    const containersResult = await query(
      'SELECT id, name, type, site_id as "siteId", location, capacity, status, created_at as "createdAt", updated_at as "updatedAt" FROM netops.containers WHERE site_id = $1',
      [id]
    );

    const site = siteResult.rows[0];
    return {
      ...site,
      containers: containersResult.rows
    };
  }
}

export default new SiteModel();
