import { query } from '../config/database';

export interface IContainer {
  id: string;
  name: string;
  type: string;
  siteId: string;
  location?: string;
  capacity?: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface IContainerCreate {
  name: string;
  type: string;
  siteId: string;
  location?: string;
  capacity?: number;
  status?: 'active' | 'inactive';
}

export interface IContainerUpdate {
  name?: string;
  type?: string;
  siteId?: string;
  location?: string;
  capacity?: number;
  status?: 'active' | 'inactive';
}

export interface IContainerQuery {
  siteId?: string;
  status?: string;
  page?: number;
  limit?: number;
}

class ContainerModel {
  // Find container by ID
  async findById(id: string): Promise<IContainer | null> {
    const result = await query(
      'SELECT id, name, type, site_id as "siteId", location, capacity, status, created_at as "createdAt", updated_at as "updatedAt" FROM containers WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Find container by ID with site information
  async findByIdWithSite(id: string): Promise<any | null> {
    const result = await query(
      `SELECT 
        c.id, c.name, c.type, c.site_id as "siteId", c.location, c.capacity, c.status, 
        c.created_at as "createdAt", c.updated_at as "updatedAt",
        json_build_object(
          'id', s.id,
          'name', s.name,
          'location', s.location
        ) as site
       FROM containers c
       LEFT JOIN sites s ON c.site_id = s.id
       WHERE c.id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Find container by ID with site and devices
  async findByIdWithRelations(id: string): Promise<any | null> {
    const containerResult = await query(
      `SELECT 
        c.id, c.name, c.type, c.site_id as "siteId", c.location, c.capacity, c.status, 
        c.created_at as "createdAt", c.updated_at as "updatedAt",
        json_build_object(
          'id', s.id,
          'name', s.name,
          'location', s.location
        ) as site
       FROM containers c
       LEFT JOIN sites s ON c.site_id = s.id
       WHERE c.id = $1`,
      [id]
    );
    
    if (containerResult.rows.length === 0) {
      return null;
    }

    const devicesResult = await query(
      'SELECT id, name, type, manufacturer, model, serial_number as "serialNumber", ip_address as "ipAddress", mac_address as "macAddress", container_id as "containerId", status, notes, created_at as "createdAt", updated_at as "updatedAt" FROM devices WHERE container_id = $1',
      [id]
    );

    const container = containerResult.rows[0];
    return {
      ...container,
      devices: devicesResult.rows
    };
  }

  // Get all containers with filters and pagination
  async findAll(queryParams: IContainerQuery = {}): Promise<{ containers: any[], total: number }> {
    const { siteId, status, page = 1, limit = 10 } = queryParams;
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let queryValues: any[] = [];
    let paramCount = 1;

    // Add siteId filter
    if (siteId) {
      whereConditions.push(`c.site_id = $${paramCount}`);
      queryValues.push(siteId);
      paramCount++;
    }

    // Add status filter
    if (status) {
      whereConditions.push(`c.status = $${paramCount}`);
      queryValues.push(status);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const [containersResult, countResult] = await Promise.all([
      query(
        `SELECT 
          c.id, c.name, c.type, c.site_id as "siteId", c.location, c.capacity, c.status, 
          c.created_at as "createdAt", c.updated_at as "updatedAt",
          json_build_object(
            'id', s.id,
            'name', s.name,
            'location', s.location
          ) as site
         FROM containers c
         LEFT JOIN sites s ON c.site_id = s.id
         ${whereClause}
         ORDER BY c.created_at DESC 
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        [...queryValues, limit, offset]
      ),
      query(
        `SELECT COUNT(*) as count FROM containers c ${whereClause}`,
        queryValues
      )
    ]);
    
    return {
      containers: containersResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Create new container
  async create(containerData: IContainerCreate): Promise<IContainer> {
    const result = await query(
      `INSERT INTO containers (name, type, site_id, location, capacity, status) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, type, site_id as "siteId", location, capacity, status, created_at as "createdAt", updated_at as "updatedAt"`,
      [
        containerData.name,
        containerData.type,
        containerData.siteId,
        containerData.location || null,
        containerData.capacity || 0,
        containerData.status || 'active'
      ]
    );
    
    return result.rows[0];
  }

  // Update container
  async update(id: string, containerData: IContainerUpdate): Promise<IContainer | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (containerData.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(containerData.name);
    }
    if (containerData.type !== undefined) {
      updates.push(`type = $${paramCount++}`);
      values.push(containerData.type);
    }
    if (containerData.siteId !== undefined) {
      updates.push(`site_id = $${paramCount++}`);
      values.push(containerData.siteId);
    }
    if (containerData.location !== undefined) {
      updates.push(`location = $${paramCount++}`);
      values.push(containerData.location);
    }
    if (containerData.capacity !== undefined) {
      updates.push(`capacity = $${paramCount++}`);
      values.push(containerData.capacity);
    }
    if (containerData.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(containerData.status);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE containers SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, name, type, site_id as "siteId", location, capacity, status, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  }

  // Delete container
  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM containers WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }
}

export default new ContainerModel();
