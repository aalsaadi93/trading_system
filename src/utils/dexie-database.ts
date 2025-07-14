// Dexie.js Database Implementation for Trading Management System
// Enhanced IndexedDB with better performance and easier API

import Dexie, { Table } from 'dexie';

export interface TradeRecord {
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

export interface ZoneRecord {
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

export interface PlannedEntryRecord {
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

export interface SettingRecord {
  key: string;
  value: any;
  updatedAt: string;
}

class TradingDatabase extends Dexie {
  trades!: Table<TradeRecord>;
  zones!: Table<ZoneRecord>;
  plannedEntries!: Table<PlannedEntryRecord>;
  settings!: Table<SettingRecord>;

  constructor() {
    super('TradingManagementDB');
    
    this.version(2).stores({
      trades: 'id, date, status, pair, type, zoneId, createdAt, updatedAt',
      zones: 'id, type, active, date, createdAt, updatedAt',
      plannedEntries: 'id, zoneId, zoneType, createdAt, updatedAt',
      settings: 'key, updatedAt'
    });
  }

  // Trade operations
  async saveTrade(trade: TradeRecord): Promise<void> {
    await this.trades.put(trade);
  }

  async getTrades(): Promise<TradeRecord[]> {
    return await this.trades.orderBy('date').reverse().toArray();
  }

  async getTradesByStatus(status: string): Promise<TradeRecord[]> {
    return await this.trades.where('status').equals(status).toArray();
  }

  async getTradesByDateRange(startDate: string, endDate: string): Promise<TradeRecord[]> {
    return await this.trades
      .where('date')
      .between(startDate, endDate, true, true)
      .toArray();
  }

  async getTradesByZone(zoneId: string): Promise<TradeRecord[]> {
    return await this.trades.where('zoneId').equals(zoneId).toArray();
  }

  async deleteTrade(id: string): Promise<void> {
    await this.trades.delete(id);
  }

  // Zone operations
  async saveZone(zone: ZoneRecord): Promise<void> {
    await this.zones.put(zone);
  }

  async getZones(): Promise<ZoneRecord[]> {
    return await this.zones.orderBy('date').reverse().toArray();
  }

  async getActiveZones(): Promise<ZoneRecord[]> {
    return await this.zones.where('active').equals(1).toArray();
  }

  async getZonesByType(type: string): Promise<ZoneRecord[]> {
    return await this.zones.where('type').equals(type).toArray();
  }

  async deleteZone(id: string): Promise<void> {
    await this.zones.delete(id);
  }

  // Planned Entry operations
  async savePlannedEntry(entry: PlannedEntryRecord): Promise<void> {
    await this.plannedEntries.put(entry);
  }

  async getPlannedEntries(): Promise<PlannedEntryRecord[]> {
    return await this.plannedEntries.orderBy('createdAt').reverse().toArray();
  }

  async getPlannedEntriesByZone(zoneId: string): Promise<PlannedEntryRecord[]> {
    return await this.plannedEntries.where('zoneId').equals(zoneId).toArray();
  }

  async deletePlannedEntry(id: string): Promise<void> {
    await this.plannedEntries.delete(id);
  }

  // Settings operations
  async saveSetting(key: string, value: any): Promise<void> {
    await this.settings.put({
      key,
      value,
      updatedAt: new Date().toISOString()
    });
  }

  async getSetting(key: string): Promise<any> {
    const setting = await this.settings.get(key);
    return setting?.value;
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const settings = await this.settings.toArray();
    return settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);
  }

  // Advanced analytics
  async getTradingStats(startDate?: string, endDate?: string): Promise<any> {
    let trades = await this.getTrades();
    
    if (startDate && endDate) {
      trades = trades.filter(trade => 
        trade.date >= startDate && trade.date <= endDate
      );
    }

    const closedTrades = trades.filter(t => t.status === 'closed');
    const winningTrades = closedTrades.filter(t => t.pnl && t.pnl > 0);
    const losingTrades = closedTrades.filter(t => t.pnl && t.pnl < 0);

    return {
      totalTrades: trades.length,
      closedTrades: closedTrades.length,
      openTrades: trades.filter(t => t.status === 'open').length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      avgRiskRatio: trades.length > 0 
        ? trades.reduce((sum, t) => sum + t.riskRatio, 0) / trades.length 
        : 0,
      winRate: closedTrades.length > 0 
        ? (winningTrades.length / closedTrades.length) * 100 
        : 0
    };
  }

  async getMonthlyReport(year: number, month: number): Promise<any[]> {
    const monthStr = `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}`;
    const trades = await this.getTradesByDateRange(`${monthStr}-01`, `${monthStr}-31`);
    
    // Group by date
    const dailyStats = trades.reduce((acc, trade) => {
      const date = trade.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          tradeDate: date,
          tradesCount: 0,
          dailyPnL: 0,
          avgRiskRatio: 0,
          trades: []
        };
      }
      
      acc[date].tradesCount++;
      acc[date].dailyPnL += trade.pnl || 0;
      acc[date].trades.push(trade);
      
      return acc;
    }, {} as Record<string, any>);

    // Calculate averages
    Object.values(dailyStats).forEach((day: any) => {
      day.avgRiskRatio = day.trades.reduce((sum: number, t: TradeRecord) => sum + t.riskRatio, 0) / day.trades.length;
      delete day.trades; // Remove trades array from final result
    });

    return Object.values(dailyStats).sort((a: any, b: any) => a.tradeDate.localeCompare(b.tradeDate));
  }

  async getPerformanceByZone(): Promise<any[]> {
    const trades = await this.getTrades();
    const zones = await this.getZones();
    
    const zoneStats = zones.map(zone => {
      const zoneTrades = trades.filter(t => t.zoneId === zone.id);
      const closedTrades = zoneTrades.filter(t => t.status === 'closed');
      const winningTrades = closedTrades.filter(t => t.pnl && t.pnl > 0);
      
      return {
        zoneId: zone.id,
        zoneName: zone.name,
        zoneType: zone.type,
        totalTrades: zoneTrades.length,
        closedTrades: closedTrades.length,
        winningTrades: winningTrades.length,
        totalPnL: zoneTrades.reduce((sum, t) => sum + (t.pnl || 0), 0),
        winRate: closedTrades.length > 0 
          ? (winningTrades.length / closedTrades.length) * 100 
          : 0,
        avgRiskRatio: zoneTrades.length > 0 
          ? zoneTrades.reduce((sum, t) => sum + t.riskRatio, 0) / zoneTrades.length 
          : 0
      };
    });

    return zoneStats.filter(stat => stat.totalTrades > 0);
  }

  // Backup and restore
  async exportData(): Promise<string> {
    const [trades, zones, plannedEntries, settings] = await Promise.all([
      this.getTrades(),
      this.getZones(),
      this.getPlannedEntries(),
      this.getAllSettings()
    ]);

    return JSON.stringify({
      trades,
      zones,
      plannedEntries,
      settings,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    await this.transaction('rw', [this.trades, this.zones, this.plannedEntries, this.settings], async () => {
      // Clear existing data
      await this.trades.clear();
      await this.zones.clear();
      await this.plannedEntries.clear();
      await this.settings.clear();
      
      // Import data
      if (data.trades?.length) {
        await this.trades.bulkAdd(data.trades);
      }
      
      if (data.zones?.length) {
        await this.zones.bulkAdd(data.zones);
      }
      
      if (data.plannedEntries?.length) {
        await this.plannedEntries.bulkAdd(data.plannedEntries);
      }
      
      if (data.settings) {
        const settingsArray = Object.entries(data.settings).map(([key, value]) => ({
          key,
          value,
          updatedAt: new Date().toISOString()
        }));
        await this.settings.bulkAdd(settingsArray);
      }
    });
  }

  async clearAllData(): Promise<void> {
    await this.transaction('rw', [this.trades, this.zones, this.plannedEntries, this.settings], async () => {
      await this.trades.clear();
      await this.zones.clear();
      await this.plannedEntries.clear();
      await this.settings.clear();
    });
  }

  // Reset database completely (for schema updates)
  async resetDatabase(): Promise<void> {
    await this.close();
    await Dexie.delete(this.name);
    console.log('Database reset complete. Please refresh the page.');
  }

  // Database info
  async getDatabaseInfo(): Promise<any> {
    const [tradesCount, zonesCount, plannedEntriesCount, settingsCount] = await Promise.all([
      this.trades.count(),
      this.zones.count(),
      this.plannedEntries.count(),
      this.settings.count()
    ]);

    return {
      totalRecords: tradesCount + zonesCount + plannedEntriesCount + settingsCount,
      trades: tradesCount,
      zones: zonesCount,
      plannedEntries: plannedEntriesCount,
      settings: settingsCount,
      databaseSize: await this.getDatabaseSize()
    };
  }

  private async getDatabaseSize(): Promise<string> {
    // Estimate database size
    const allData = await Promise.all([
      this.trades.toArray(),
      this.zones.toArray(),
      this.plannedEntries.toArray(),
      this.settings.toArray()
    ]);
    
    const dataSize = JSON.stringify(allData).length;
    const sizeInKB = Math.round(dataSize / 1024);
    
    if (sizeInKB < 1024) {
      return `${sizeInKB} KB`;
    } else {
      const sizeInMB = (sizeInKB / 1024).toFixed(1);
      return `${sizeInMB} MB`;
    }
  }
}

// Create and export singleton instance
export const tradingDB = new TradingDatabase(); 