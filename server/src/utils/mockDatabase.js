// Mock database service for testing when Supabase is unavailable
const bcrypt = require('bcryptjs');

class MockDatabase {
  constructor() {
    this.users = new Map();
    this.shipments = new Map();
    this.countries = new Map();
    this.statusHistory = new Map();
    this.init();
  }

  async init() {
    // Add some mock users
    const adminPassword = await bcrypt.hash('admin123456', 12);
    this.users.set('admin@boxinator.com', {
      id: 'mock-admin-id',
      email: 'admin@boxinator.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      accountType: 'ADMINISTRATOR',
      isEmailVerified: true
    });

    const userPassword = await bcrypt.hash('user123456', 12);
    this.users.set('user@boxinator.com', {
      id: 'mock-user-id',
      email: 'user@boxinator.com',
      password: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      accountType: 'REGISTERED_USER',
      isEmailVerified: true,
      dateOfBirth: new Date('1990-01-01')
    });

    // Add mock countries
    this.countries.set('Norway', {
      id: 'mock-norway-id',
      name: 'Norway',
      multiplier: 0.0,
      isActive: true
    });
    
    this.countries.set('Germany', {
      id: 'mock-germany-id',
      name: 'Germany',
      multiplier: 5.0,
      isActive: true
    });

    this.countries.set('Brazil', {
      id: 'mock-brazil-id',
      name: 'Brazil',
      multiplier: 25.0,
      isActive: true
    });

    // Add mock shipments
    this.shipments.set('mock-shipment-1', {
      id: 'mock-shipment-1',
      userId: 'mock-user-id',
      recipientName: 'John Recipient',
      recipientEmail: 'john@example.com',
      recipientPhone: '+1234567890',
      recipientAddress: '123 Test St, Test City',
      boxColor: 'rgba(255, 0, 0, 1)',
      weight: 2,
      length: 30,
      width: 20,
      height: 15,
      destinationCountryId: 'mock-germany-id',
      status: 'CREATED',
      notes: null,
      totalCost: 210,
      createdAt: new Date('2025-08-18T10:00:00.000Z'),
      updatedAt: new Date('2025-08-18T10:00:00.000Z')
    });

    this.shipments.set('mock-shipment-2', {
      id: 'mock-shipment-2',
      userId: 'mock-admin-id',
      recipientName: 'Jane Recipient',
      recipientEmail: 'jane@example.com',
      recipientPhone: '+0987654321',
      recipientAddress: '456 Demo Ave, Demo City',
      boxColor: 'rgba(0, 255, 0, 1)',
      weight: 5,
      length: 40,
      width: 30,
      height: 20,
      destinationCountryId: 'mock-brazil-id',
      status: 'IN_TRANSIT',
      notes: 'Express delivery',
      totalCost: 325,
      createdAt: new Date('2025-08-18T11:00:00.000Z'),
      updatedAt: new Date('2025-08-18T12:00:00.000Z')
    });
  }

  // Mock Prisma user methods
  user = {
    findUnique: async ({ where }) => {
      if (where.email) {
        return this.users.get(where.email) || null;
      }
      return null;
    },
    
    create: async ({ data }) => {
      const id = `mock-${Date.now()}`;
      // For testing purposes, automatically verify email in mock database
      const user = { id, ...data, isEmailVerified: true };
      this.users.set(data.email, user);
      return user;
    },
    
    update: async ({ where, data }) => {
      const user = this.users.get(where.email);
      if (user) {
        Object.assign(user, data);
        return user;
      }
      throw new Error('User not found');
    }
  };

  // Mock Prisma shipment methods
  shipment = {
    findMany: async (options = {}) => {
      return Array.from(this.shipments.values());
    },
    
    findUnique: async ({ where }) => {
      return this.shipments.get(where.id) || null;
    },
    
    create: async ({ data }) => {
      const id = `mock-shipment-${Date.now()}`;
      const shipment = { 
        id, 
        ...data, 
        createdAt: new Date(),
        updatedAt: new Date() 
      };
      this.shipments.set(id, shipment);
      return shipment;
    },
    
    update: async ({ where, data }) => {
      const shipment = this.shipments.get(where.id);
      if (shipment) {
        Object.assign(shipment, { ...data, updatedAt: new Date() });
        return shipment;
      }
      throw new Error('Shipment not found');
    },
    
    delete: async ({ where }) => {
      const shipment = this.shipments.get(where.id);
      if (shipment) {
        this.shipments.delete(where.id);
        return shipment;
      }
      throw new Error('Shipment not found');
    }
  };

  // Mock Prisma country methods
  country = {
    findMany: async () => {
      return Array.from(this.countries.values());
    },
    
    findUnique: async ({ where }) => {
      for (const country of this.countries.values()) {
        if (country.id === where.id || country.name === where.name) {
          return country;
        }
      }
      return null;
    }
  };

  // Mock Prisma statusHistory methods
  statusHistory = {
    create: async ({ data }) => {
      const id = `mock-status-${Date.now()}`;
      const status = { 
        id, 
        ...data, 
        createdAt: new Date() 
      };
      this.statusHistory.set(id, status);
      return status;
    }
  };

  // Mock REST API-style methods (for compatibility)
  async getShipments() {
    return Array.from(this.shipments.values());
  }

  async getUsers() {
    return Array.from(this.users.values());
  }

  async getCountries() {
    return Array.from(this.countries.values());
  }

  async createShipment(data) {
    return this.shipment.create({ data });
  }

  async updateShipment(id, data) {
    return this.shipment.update({ where: { id }, data });
  }

  async deleteShipment(id) {
    return this.shipment.delete({ where: { id } });
  }

  async createUser(data) {
    return this.user.create({ data });
  }

  // Mock disconnect method
  $disconnect = async () => {
    console.log('Mock database disconnected');
  };
}

module.exports = { MockDatabase };
