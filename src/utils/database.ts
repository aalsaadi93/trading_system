// IndexedDB Database for Trading Management System
export interface DatabaseTrade {
  id: string;
  date: string;
  pair: string;
  type: 'buy' | 'sell';
  entry: number;
  exit?: number;
  stopLoss: number;
  takeProfit: number;
  size: number;
  status: 'open' | 'closed' | 'cancelled';
  pnl?: number;
  zoneId?: string;
  zoneName?: string;
  plannedEntryId?: string;
  confirmations?: any[];
  riskAmount: number;
  riskRatio: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatabaseZone {
  id: string;
  type: string;
  name: string;
  startPrice: number;
  endPrice: number;
  strength: string;
  breakStrength?: string;
  position?: string;
  liquidityType?: string;
  orderBlockRelation?: string;
  notes: string;
  date: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DatabasePlannedEntry {
  id: string;
  zoneId: string;
  zoneName: string;
  zoneType: string;
  entryLevel: number;
  takeProfit: number;
  stopLoss: number;
  riskRatio: number;
  plannedEntries: number;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

class TradingDatabase {
  private dbName = 'TradingManagementDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('trades')) {
          const tradesStore = db.createObjectStore('trades', { keyPath: 'id' });
          tradesStore.createIndex('status', 'status', { unique: false });
          tradesStore.createIndex('date', 'date', { unique: false });
        }

        if (!db.objectStoreNames.contains('zones')) {
          const zonesStore = db.createObjectStore('zones', { keyPath: 'id' });
          zonesStore.createIndex('type', 'type', { unique: false });
          zonesStore.createIndex('active', 'active', { unique: false });
        }

        if (!db.objectStoreNames.contains('plannedEntries')) {
          const plannedStore = db.createObjectStore('plannedEntries', { keyPath: 'id' });
          plannedStore.createIndex('zoneId', 'zoneId', { unique: false });
        }

        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  // Trade operations
  async saveTrade(trade: DatabaseTrade): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['trades'], 'readwrite');
      const store = transaction.objectStore('trades');
      const request = store.put(trade);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTrades(): Promise<DatabaseTrade[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['trades'], 'readonly');
      const store = transaction.objectStore('trades');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getTradesByStatus(status: string): Promise<DatabaseTrade[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['trades'], 'readonly');
      const store = transaction.objectStore('trades');
      const index = store.index('status');
      const request = index.getAll(status);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteTrade(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['trades'], 'readwrite');
      const store = transaction.objectStore('trades');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Zone operations
  async saveZone(zone: DatabaseZone): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['zones'], 'readwrite');
      const store = transaction.objectStore('zones');
      const request = store.put(zone);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getZones(): Promise<DatabaseZone[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['zones'], 'readonly');
      const store = transaction.objectStore('zones');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getActiveZones(): Promise<DatabaseZone[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['zones'], 'readonly');
      const store = transaction.objectStore('zones');
      const index = store.index('active');
      const request = index.getAll(IDBKeyRange.only(true));

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Planned Entry operations
  async savePlannedEntry(entry: DatabasePlannedEntry): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['plannedEntries'], 'readwrite');
      const store = transaction.objectStore('plannedEntries');
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getPlannedEntries(): Promise<DatabasePlannedEntry[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['plannedEntries'], 'readonly');
      const store = transaction.objectStore('plannedEntries');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Settings operations
  async saveSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(request.error);
    });
  }

  // Backup and restore
  async exportData(): Promise<string> {
    const trades = await this.getTrades();
    const zones = await this.getZones();
    const plannedEntries = await this.getPlannedEntries();
    
    const settings: any = {};
    const settingKeys = ['weeklyRiskBudget', 'weeklyRiskUsed', 'technicalAnalysisComplete', 'marketStructureComplete', 'weeklyPlanningComplete'];
    
    for (const key of settingKeys) {
      settings[key] = await this.getSetting(key);
    }

    return JSON.stringify({
      trades,
      zones,
      plannedEntries,
      settings,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    await this.clearAllData();
    
    // Import trades
    for (const trade of data.trades || []) {
      await this.saveTrade(trade);
    }
    
    // Import zones
    for (const zone of data.zones || []) {
      await this.saveZone(zone);
    }
    
    // Import planned entries
    for (const entry of data.plannedEntries || []) {
      await this.savePlannedEntry(entry);
    }
    
    // Import settings
    for (const [key, value] of Object.entries(data.settings || {})) {
      await this.saveSetting(key, value);
    }
  }

  async clearAllData(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const stores = ['trades', 'zones', 'plannedEntries', 'settings'];
    
    for (const storeName of stores) {
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      await new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Create and export a singleton instance
export const tradingDB = new TradingDatabase();

// Initialize the database when the module is loaded
tradingDB.init().catch(console.error); 