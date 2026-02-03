import { query } from '../config/database';

export interface IDevice {
  id: string;
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  ipAddress?: string;
  macAddress?: string;
  containerId: string;
  status: 'active' | 'inactive' | 'maintenance';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeviceCreate {
  name: string;
  type: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  ipAddress?: string;
  macAddress?: string;
  containerId: string;
  status?: 'active' | 'inactive' | 'maintenance';
  notes?: string;
}

export interface IDeviceUpdate {
  name?: string;
  type?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  ipAddress?: string;
  macAddress?: string;
  containerId?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  notes?: string;
}

export interface IDeviceQuery {
  containerId?: string;
  type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

class DeviceModel {
  // Find device by ID
  async findById(id: string): Promise<IDevice | null> {
    const result = await query(
      'SELECT id, name, type, manufacturer, model, serial_number as "serialNumber", ip_address as "ipAddress", mac_address as "macAddress", container_id as "containerId", status, notes, created_at as "createdAt", updated_at as "updatedAt" FROM devices WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Find device by ID with container information
  async findByIdWithContainer(id: string): Promise<any | null> {
    const result = await query(
      `SELECT 
        d.id, d.name, d.type, d.manufacturer, d.model, d.serial_number as "serialNumber", 
        d.ip_address as "ipAddress", d.mac_address as "macAddress", d.container_id as "containerId", 
        d.status, d.notes, d.created_at as "createdAt", d.updated_at as "updatedAt",
        json_build_object(
          'id', c.id,
          'name', c.name,
          'type', c.type,
          'location', c.location
        ) as container
       FROM devices d
       LEFT JOIN containers c ON d.container_id = c.id
       WHERE d.id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Find device by ID with full relations (container and site)
  async findByIdWithRelations(id: string): Promise<any | null> {
    const result = await query(
      `SELECT 
        d.id, d.name, d.type, d.manufacturer, d.model, d.serial_number as "serialNumber", 
        d.ip_address as "ipAddress", d.mac_address as "macAddress", d.container_id as "containerId", 
        d.status, d.notes, d.created_at as "createdAt", d.updated_at as "updatedAt",
        json_build_object(
          'id', c.id,
          'name', c.name,
          'type', c.type,
          'location', c.location,
          'siteId', s.id,
          'site', json_build_object(
            'id', s.id,
            'name', s.name,
            'location', s.location
          )
        ) as container
       FROM devices d
       LEFT JOIN containers c ON d.container_id = c.id
       LEFT JOIN sites s ON c.site_id = s.id
       WHERE d.id = $1`,
      [id]
    );
    
    return result.rows[0] || null;
  }

  // Get all devices with filters and pagination
  async findAll(queryParams: IDeviceQuery = {}): Promise<{ devices: any[], total: number }> {
    const { containerId, type, status, page = 1, limit = 10 } = queryParams;
    const offset = (page - 1) * limit;
    
    let whereConditions: string[] = [];
    let queryValues: any[] = [];
    let paramCount = 1;

    // Add containerId filter
    if (containerId) {
      whereConditions.push(`d.container_id = $${paramCount}`);
      queryValues.push(containerId);
      paramCount++;
    }

    // Add type filter
    if (type) {
      whereConditions.push(`d.type = $${paramCount}`);
      queryValues.push(type);
      paramCount++;
    }

    // Add status filter
    if (status) {
      whereConditions.push(`d.status = $${paramCount}`);
      queryValues.push(status);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    const [devicesResult, countResult] = await Promise.all([
      query(
        `SELECT 
          d.id, d.name, d.type, d.manufacturer, d.model, d.serial_number as "serialNumber", 
          d.ip_address as "ipAddress", d.mac_address as "macAddress", d.container_id as "containerId", 
          d.status, d.notes, d.created_at as "createdAt", d.updated_at as "updatedAt",
          json_build_object(
            'id', c.id,
            'name', c.name,
            'type', c.type,
            'location', c.location
          ) as container
         FROM devices d
         LEFT JOIN containers c ON d.container_id = c.id
         ${whereClause}
         ORDER BY d.created_at DESC 
         LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
        [...queryValues, limit, offset]
      ),
      query(
        `SELECT COUNT(*) as count FROM devices d ${whereClause}`,
        queryValues
      )
    ]);
    
    return {
      devices: devicesResult.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // Create new device
  async create(deviceData: IDeviceCreate): Promise<IDevice> {
    const result = await query(
      `INSERT INTO devices (name, type, manufacturer, model, serial_number, ip_address, mac_address, container_id, status, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, name, type, manufacturer, model, serial_number as "serialNumber", ip_address as "ipAddress", mac_address as "macAddress", container_id as "containerId", status, notes, created_at as "createdAt", updated_at as "updatedAt"`,
      [
        deviceData.name,
        deviceData.type,
        deviceData.manufacturer || null,
        deviceData.model || null,
        deviceData.serialNumber || null,
        deviceData.ipAddress || null,
        deviceData.macAddress?.toUpperCase() || null,
        deviceData.containerId,
        deviceData.status || 'active',
        deviceData.notes || null
      ]
    );
    
    return result.rows[0];
  }

  // Update device
  async update(id: string, deviceData: IDeviceUpdate): Promise<IDevice | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (deviceData.name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(deviceData.name);
    }
    if (deviceData.type !== undefined) {
      updates.push(`type = $${paramCount++}`);
      values.push(deviceData.type);
    }
    if (deviceData.manufacturer !== undefined) {
      updates.push(`manufacturer = $${paramCount++}`);
      values.push(deviceData.manufacturer);
    }
    if (deviceData.model !== undefined) {
      updates.push(`model = $${paramCount++}`);
      values.push(deviceData.model);
    }
    if (deviceData.serialNumber !== undefined) {
      updates.push(`serial_number = $${paramCount++}`);
      values.push(deviceData.serialNumber);
    }
    if (deviceData.ipAddress !== undefined) {
      updates.push(`ip_address = $${paramCount++}`);
      values.push(deviceData.ipAddress);
    }
    if (deviceData.macAddress !== undefined) {
      updates.push(`mac_address = $${paramCount++}`);
      values.push(deviceData.macAddress?.toUpperCase());
    }
    if (deviceData.containerId !== undefined) {
      updates.push(`container_id = $${paramCount++}`);
      values.push(deviceData.containerId);
    }
    if (deviceData.status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(deviceData.status);
    }
    if (deviceData.notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(deviceData.notes);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const result = await query(
      `UPDATE devices SET ${updates.join(', ')} 
       WHERE id = $${paramCount} 
       RETURNING id, name, type, manufacturer, model, serial_number as "serialNumber", ip_address as "ipAddress", mac_address as "macAddress", container_id as "containerId", status, notes, created_at as "createdAt", updated_at as "updatedAt"`,
      values
    );
    
    return result.rows[0] || null;
  }

  // Delete device
  async delete(id: string): Promise<boolean> {
    const result = await query('DELETE FROM devices WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  }

  // Find device by serial number
  async findBySerialNumber(serialNumber: string): Promise<IDevice | null> {
    const result = await query(
      'SELECT id, name, type, manufacturer, model, serial_number as "serialNumber", ip_address as "ipAddress", mac_address as "macAddress", container_id as "containerId", status, notes, created_at as "createdAt", updated_at as "updatedAt" FROM devices WHERE serial_number = $1',
      [serialNumber]
    );
    
    return result.rows[0] || null;
  }

  // Find device by IP address
  async findByIpAddress(ipAddress: string): Promise<IDevice | null> {
    const result = await query(
      'SELECT id, name, type, manufacturer, model, serial_number as "serialNumber", ip_address as "ipAddress", mac_address as "macAddress", container_id as "containerId", status, notes, created_at as "createdAt", updated_at as "updatedAt" FROM devices WHERE ip_address = $1',
      [ipAddress]
    );
    
    return result.rows[0] || null;
  }
}

export default new DeviceModel();


// Index for searching and filtering
DeviceSchema.index({ name: 'text', manufacturer: 'text', model: 'text' });
DeviceSchema.index({ containerId: 1, status: 1 });
DeviceSchema.index({ type: 1, status: 1 });
DeviceSchema.index({ ipAddress: 1 });

export default mongoose.model<IDevice>('Device', DeviceSchema);
