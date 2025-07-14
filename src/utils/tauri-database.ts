// Tauri SQLite Database Service for Trading Management System
// This replaces Dexie.js with a more robust SQLite backend

import { invoke } from '@tauri-apps/api/tauri';

export interface TradeRecord {
  id: string;
  date: string;
  pair: string;
  trade_type: string;
  entry: number;
  exit?: number;
  stop_loss: number;
  take_profit: number;
  size: number;
  status: string;
  pnl?: number;
  zone_id?: string;
  zone_name?: string;
  planned_entry_id?: string;
  risk_amount: number;
  risk_ratio: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ZoneRecord {
  id: string;
  zone_type: string;
  name: string;
  start_price: number;
  end_price: number;
  strength: string;
  break_strength?: string;
  position?: string;
  liquidity_type?: string;
  order_block_relation?: string;
  notes: string;
  date: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlannedEntryRecord {
  id: string;
  zone_id: string;
  zone_name: string;
  zone_type: string;
  entry_level: number;
  take_profit: number;
  stop_loss: number;
  risk_ratio: number;
  planned_entries: number;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface SettingRecord {
  key: string;
  value: string;
  updated_at: string;
}

class TauriDatabase {
  // Trade operations
  async saveTrade(trade: TradeRecord): Promise<void> {
    await invoke('save_trade', { trade });
  }

  async getTrades(): Promise<TradeRecord[]> {
    return await invoke('get_trades');
  }

  async deleteTrade(id: string): Promise<void> {
    await invoke('delete_trade', { id });
  }

  // Zone operations
  async saveZone(zone: ZoneRecord): Promise<void> {
    await invoke('save_zone', { zone });
  }

  async getZones(): Promise<ZoneRecord[]> {
    return await invoke('get_zones');
  }

  async deleteZone(id: string): Promise<void> {
    await invoke('delete_zone', { id });
  }

  // Planned Entry operations
  async savePlannedEntry(entry: PlannedEntryRecord): Promise<void> {
    await invoke('save_planned_entry', { entry });
  }

  async getPlannedEntries(): Promise<PlannedEntryRecord[]> {
    return await invoke('get_planned_entries');
  }

  async deletePlannedEntry(id: string): Promise<void> {
    await invoke('delete_planned_entry', { id });
  }

  // Settings operations
  async saveSetting(key: string, value: any): Promise<void> {
    await invoke('save_setting', { key, value: JSON.stringify(value) });
  }

  async getSetting(key: string): Promise<any> {
    const value = await invoke('get_setting', { key });
    return value ? JSON.parse(value) : null;
  }

  async getAllSettings(): Promise<Record<string, any>> {
    const settings = await invoke('get_all_settings');
    const result: Record<string, any> = {};
    
    for (const setting of settings) {
      try {
        result[setting.key] = JSON.parse(setting.value);
      } catch {
        result[setting.key] = setting.value;
      }
    }
    
    return result;
  }

  // Export/Import
  async exportData(): Promise<string> {
    return await invoke('export_data');
  }

  async importData(jsonData: string): Promise<void> {
    await invoke('import_data', { jsonData });
  }

  // Database info
  async getDatabaseInfo(): Promise<any> {
    return await invoke('get_database_info');
  }

  async clearAllData(): Promise<void> {
    await invoke('clear_all_data');
  }

  // Utility methods for data conversion
  convertTradeToBackend(trade: any): TradeRecord {
    return {
      id: trade.id,
      date: trade.date,
      pair: trade.pair,
      trade_type: trade.type,
      entry: trade.entry,
      exit: trade.exit,
      stop_loss: trade.stopLoss,
      take_profit: trade.takeProfit,
      size: trade.size,
      status: trade.status,
      pnl: trade.pnl,
      zone_id: trade.zoneId,
      zone_name: trade.zoneName,
      planned_entry_id: trade.plannedEntryId,
      risk_amount: trade.riskAmount,
      risk_ratio: trade.riskRatio,
      notes: trade.notes,
      created_at: trade.createdAt,
      updated_at: trade.updatedAt,
    };
  }

  convertTradeFromBackend(trade: TradeRecord): any {
    return {
      id: trade.id,
      date: trade.date,
      pair: trade.pair,
      type: trade.trade_type,
      entry: trade.entry,
      exit: trade.exit,
      stopLoss: trade.stop_loss,
      takeProfit: trade.take_profit,
      size: trade.size,
      status: trade.status,
      pnl: trade.pnl,
      zoneId: trade.zone_id,
      zoneName: trade.zone_name,
      plannedEntryId: trade.planned_entry_id,
      riskAmount: trade.risk_amount,
      riskRatio: trade.risk_ratio,
      notes: trade.notes,
      createdAt: trade.created_at,
      updatedAt: trade.updated_at,
    };
  }

  convertZoneToBackend(zone: any): ZoneRecord {
    return {
      id: zone.id,
      zone_type: zone.type,
      name: zone.name,
      start_price: zone.startPrice,
      end_price: zone.endPrice,
      strength: zone.strength,
      break_strength: zone.breakStrength,
      position: zone.position,
      liquidity_type: zone.liquidityType,
      order_block_relation: zone.orderBlockRelation,
      notes: zone.notes,
      date: zone.date,
      active: zone.active,
      created_at: zone.createdAt,
      updated_at: zone.updatedAt,
    };
  }

  convertZoneFromBackend(zone: ZoneRecord): any {
    return {
      id: zone.id,
      type: zone.zone_type,
      name: zone.name,
      startPrice: zone.start_price,
      endPrice: zone.end_price,
      strength: zone.strength,
      breakStrength: zone.break_strength,
      position: zone.position,
      liquidityType: zone.liquidity_type,
      orderBlockRelation: zone.order_block_relation,
      notes: zone.notes,
      date: zone.date,
      active: zone.active,
      createdAt: zone.created_at,
      updatedAt: zone.updated_at,
    };
  }

  convertPlannedEntryToBackend(entry: any): PlannedEntryRecord {
    return {
      id: entry.id,
      zone_id: entry.zoneId,
      zone_name: entry.zoneName,
      zone_type: entry.zoneType,
      entry_level: entry.entryLevel,
      take_profit: entry.takeProfit,
      stop_loss: entry.stopLoss,
      risk_ratio: entry.riskRatio,
      planned_entries: entry.plannedEntries,
      notes: entry.notes,
      created_at: entry.createdAt,
      updated_at: entry.updatedAt,
    };
  }

  convertPlannedEntryFromBackend(entry: PlannedEntryRecord): any {
    return {
      id: entry.id,
      zoneId: entry.zone_id,
      zoneName: entry.zone_name,
      zoneType: entry.zone_type,
      entryLevel: entry.entry_level,
      takeProfit: entry.take_profit,
      stopLoss: entry.stop_loss,
      riskRatio: entry.risk_ratio,
      plannedEntries: entry.planned_entries,
      notes: entry.notes,
      createdAt: entry.created_at,
      updatedAt: entry.updated_at,
    };
  }
}

// Create and export singleton instance
export const tauriDB = new TauriDatabase(); 