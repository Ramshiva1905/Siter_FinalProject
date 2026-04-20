const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const { createId } = require('@paralleldrive/cuid2');
const logger = require('./logger');

class SupabaseAdapter {
  constructor() {
    this.client = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  // User methods
  user = {
    findUnique: async ({ where }) => {
      try {
        const { data, error } = await this.client
          .from('users')
          .select('*')
          .eq(Object.keys(where)[0], Object.values(where)[0])
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      } catch (error) {
        logger.error('SupabaseAdapter user.findUnique error:', error);
        return null;
      }
    },

    create: async ({ data }) => {
      try {
        // Generate ID if not provided
        if (!data.id) {
          data.id = createId();
        }
        
        const { data: created, error } = await this.client
          .from('users')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        return created;
      } catch (error) {
        logger.error('SupabaseAdapter user.create error:', error);
        throw error;
      }
    },

    update: async ({ where, data }) => {
      try {
        const { data: updated, error } = await this.client
          .from('users')
          .update(data)
          .eq(Object.keys(where)[0], Object.values(where)[0])
          .select()
          .single();
        
        if (error) throw error;
        return updated;
      } catch (error) {
        logger.error('SupabaseAdapter user.update error:', error);
        throw error;
      }
    }
  };

  // Country methods
  country = {
    findUnique: async ({ where }) => {
      try {
        const { data, error } = await this.client
          .from('countries')
          .select('*')
          .eq(Object.keys(where)[0], Object.values(where)[0])
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        return data;
      } catch (error) {
        logger.error('SupabaseAdapter country.findUnique error:', error);
        return null;
      }
    },

    findMany: async ({ where = {} }) => {
      try {
        let query = this.client.from('countries').select('*');
        
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        logger.error('SupabaseAdapter country.findMany error:', error);
        return [];
      }
    }
  };

  // Shipment methods
  shipment = {
    findMany: async ({ where = {}, include = {} }) => {
      try {
        let query = this.client.from('shipments').select('*');
        
        Object.entries(where).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
        
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
      } catch (error) {
        logger.error('SupabaseAdapter shipment.findMany error:', error);
        return [];
      }
    },

    create: async ({ data }) => {
      try {
        // Generate ID if not provided
        if (!data.id) {
          data.id = createId();
        }
        
        const { data: created, error } = await this.client
          .from('shipments')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        return created;
      } catch (error) {
        logger.error('SupabaseAdapter shipment.create error:', error);
        throw error;
      }
    }
  };

  // Mock disconnect
  $disconnect = async () => {
    logger.info('SupabaseAdapter disconnected');
  };

  // Helper methods for compatibility with routes
  async getShipments() {
    try {
      const { data, error } = await this.client
        .from('shipments')
        .select(`
          *,
          user:users(id, email, firstName, lastName, accountType),
          destinationCountry:countries(id, name, multiplier),
          statusHistory:status_history(status, createdAt)
        `)
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      
      // Sort status history by newest first for each shipment
      return (data || []).map(shipment => ({
        ...shipment,
        statusHistory: shipment.statusHistory?.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ) || []
      }));
    } catch (error) {
      logger.error('SupabaseAdapter getShipments error:', error);
      return [];
    }
  }

  async getCountries() {
    try {
      const { data, error } = await this.client
        .from('countries')
        .select('*')
        .eq('isActive', true)
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('SupabaseAdapter getCountries error:', error);
      return [];
    }
  }

  async getUsers() {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      logger.error('SupabaseAdapter getUsers error:', error);
      return [];
    }
  }

  async createUser(userData) {
    try {
      // Generate ID if not provided
      if (!userData.id) {
        userData.id = createId();
      }
      
      const { data, error } = await this.client
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('SupabaseAdapter createUser error:', error);
      throw error;
    }
  }

  async updateCountry(id, updateData) {
    try {
      const { data, error } = await this.client
        .from('countries')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      logger.error('SupabaseAdapter updateCountry error:', error);
      throw error;
    }
  }

  async createShipment(shipmentData) {
    try {
      // Generate ID if not provided
      if (!shipmentData.id) {
        shipmentData.id = createId();
      }
      
      // Create shipment
      const { data: shipment, error: shipmentError } = await this.client
        .from('shipments')
        .insert(shipmentData)
        .select()
        .single();
      
      if (shipmentError) throw shipmentError;

      // Create initial status history
      const { error: statusError } = await this.client
        .from('status_history')
        .insert({
          id: createId(),
          shipmentId: shipment.id,
          status: 'CREATED',
          createdAt: new Date().toISOString()
        });

      if (statusError) throw statusError;
      
      return shipment;
    } catch (error) {
      logger.error('SupabaseAdapter createShipment error:', error);
      throw error;
    }
  }

  async updateShipment(shipmentId, data) {
    try {
      const { data: updated, error } = await this.client
        .from('shipments')
        .update(data)
        .eq('id', shipmentId)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    } catch (error) {
      logger.error('SupabaseAdapter updateShipment error:', error);
      throw error;
    }
  }

  async deleteShipment(shipmentId) {
    try {
      // Delete status history first
      await this.client
        .from('status_history')
        .delete()
        .eq('shipmentId', shipmentId);

      // Delete shipment
      const { error } = await this.client
        .from('shipments')
        .delete()
        .eq('id', shipmentId);
      
      if (error) throw error;
    } catch (error) {
      logger.error('SupabaseAdapter deleteShipment error:', error);
      throw error;
    }
  }

  // StatusHistory methods
  statusHistory = {
    create: async ({ data }) => {
      try {
        // Generate ID if not provided
        if (!data.id) {
          data.id = createId();
        }
        
        const { data: created, error } = await this.client
          .from('status_history')
          .insert(data)
          .select()
          .single();
        
        if (error) throw error;
        return created;
      } catch (error) {
        logger.error('SupabaseAdapter statusHistory.create error:', error);
        throw error;
      }
    }
  };

  // Test connection
  async testConnection() {
    try {
      const { data, error } = await this.client
        .from('users')
        .select('count')
        .limit(1);
      
      return !error;
    } catch (error) {
      return false;
    }
  }
}

module.exports = { SupabaseAdapter };
