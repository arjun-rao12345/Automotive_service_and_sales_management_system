const { promisePool } = require('../config/database');

class InventoryService {
  // Get all parts with inventory
  async getAllParts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    try {
      const [countResult] = await promisePool.query(
        'SELECT COUNT(*) as total FROM Parts'
      );
      const total = countResult[0].total;
      
      const [parts] = await promisePool.query(
        `SELECT p.*, s.supplier_name, s.contact as supplier_contact,
                i.inventory_id, i.quantity, i.reorder_level, i.last_restocked
         FROM Parts p
         INNER JOIN Supplier s ON p.supplier_id = s.supplier_id
         LEFT JOIN Inventory i ON p.part_id = i.part_id
         ORDER BY p.part_name ASC
         LIMIT ? OFFSET ?`,
        [limit, offset]
      );
      
      return {
        parts,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch parts: ${error.message}`);
    }
  }

  // Get part by ID
  async getPartById(id) {
    try {
      const [parts] = await promisePool.query(
        `SELECT p.*, s.supplier_name, s.contact as supplier_contact,
                i.inventory_id, i.quantity, i.reorder_level, i.last_restocked
         FROM Parts p
         INNER JOIN Supplier s ON p.supplier_id = s.supplier_id
         LEFT JOIN Inventory i ON p.part_id = i.part_id
         WHERE p.part_id = ?`,
        [id]
      );
      
      if (parts.length === 0) {
        throw new Error('Part not found');
      }
      
      return parts[0];
    } catch (error) {
      throw error;
    }
  }

  // Create part
  async createPart(data) {
    const { part_name, supplier_id, price, part_number, description } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Parts (part_name, supplier_id, price, part_number, description) 
         VALUES (?, ?, ?, ?, ?)`,
        [part_name, supplier_id, price, part_number, description]
      );
      
      return await this.getPartById(result.insertId);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Part number already exists');
      }
      throw new Error(`Failed to create part: ${error.message}`);
    }
  }

  // Update part
  async updatePart(id, data) {
    const { part_name, supplier_id, price, part_number, description } = data;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE Parts 
         SET part_name = ?, supplier_id = ?, price = ?, part_number = ?, description = ?
         WHERE part_id = ?`,
        [part_name, supplier_id, price, part_number, description, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Part not found');
      }
      
      return await this.getPartById(id);
    } catch (error) {
      throw error;
    }
  }

  // Delete part
  async deletePart(id) {
    try {
      const [result] = await promisePool.query(
        'DELETE FROM Parts WHERE part_id = ?',
        [id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Part not found');
      }
      
      return { message: 'Part deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Get all suppliers
  async getAllSuppliers() {
    try {
      const [suppliers] = await promisePool.query(
        `SELECT * FROM Supplier ORDER BY supplier_name ASC`
      );
      
      return suppliers;
    } catch (error) {
      throw new Error(`Failed to fetch suppliers: ${error.message}`);
    }
  }

  // Create supplier
  async createSupplier(data) {
    const { supplier_name, contact, phone, email, address } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Supplier (supplier_name, contact, phone, email, address) 
         VALUES (?, ?, ?, ?, ?)`,
        [supplier_name, contact, phone, email, address]
      );
      
      const [suppliers] = await promisePool.query(
        'SELECT * FROM Supplier WHERE supplier_id = ?',
        [result.insertId]
      );
      
      return suppliers[0];
    } catch (error) {
      throw new Error(`Failed to create supplier: ${error.message}`);
    }
  }

  // Create inventory entry
  async createInventory(data) {
    const { part_id, quantity, reorder_level, last_restocked } = data;
    
    try {
      const [result] = await promisePool.query(
        `INSERT INTO Inventory (part_id, quantity, reorder_level, last_restocked) 
         VALUES (?, ?, ?, ?)`,
        [part_id, quantity || 0, reorder_level || 10, last_restocked]
      );
      
      const [inventory] = await promisePool.query(
        'SELECT * FROM Inventory WHERE inventory_id = ?',
        [result.insertId]
      );
      
      return inventory[0];
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Inventory entry already exists for this part');
      }
      throw new Error(`Failed to create inventory: ${error.message}`);
    }
  }

  // Update inventory
  async updateInventory(id, data) {
    const { quantity, reorder_level, last_restocked } = data;
    
    try {
      const [result] = await promisePool.query(
        `UPDATE Inventory 
         SET quantity = ?, reorder_level = ?, last_restocked = ?
         WHERE inventory_id = ?`,
        [quantity, reorder_level, last_restocked, id]
      );
      
      if (result.affectedRows === 0) {
        throw new Error('Inventory not found');
      }
      
      const [inventory] = await promisePool.query(
        'SELECT * FROM Inventory WHERE inventory_id = ?',
        [id]
      );
      
      return inventory[0];
    } catch (error) {
      throw error;
    }
  }

  // Get low stock items
  async getLowStockItems() {
    try {
      const [items] = await promisePool.query(
        `SELECT p.*, i.quantity, i.reorder_level, s.supplier_name
         FROM Inventory i
         INNER JOIN Parts p ON i.part_id = p.part_id
         INNER JOIN Supplier s ON p.supplier_id = s.supplier_id
         WHERE i.quantity <= i.reorder_level
         ORDER BY i.quantity ASC`
      );
      
      return items;
    } catch (error) {
      throw new Error(`Failed to fetch low stock items: ${error.message}`);
    }
  }
}

module.exports = new InventoryService();