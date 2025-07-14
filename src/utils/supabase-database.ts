// Supabase Database Implementation for Trading Management System
// Cloud-based solution with real-time sync

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface TradeRecord {
  id: string;
  user_id: string;
  date: string;
  pair: string;
  type: 'buy' | 'sell';
  entry: number;
  exit?: number;
  stop_loss: number;
  take_profit: number;
  size: number;
  status: 'open' | 'closed' | 'cancelled';
  pnl?: number;
  zone_id?: string;
  zone_name?: string;
  planned_entry_id?: string;
  confirmations?: any;
  risk_amount: number;
  risk_ratio: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ZoneRecord {
  id: string;
  user_id: string;
  type: string;
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

class SupabaseDatabase {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Trade operations
  async saveTrade(trade: Omit<TradeRecord, 'user_id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabase
      .from('trades')
      .upsert({
        ...trade,
        user_id: this.userId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getTrades(): Promise<TradeRecord[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', this.userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTradesByStatus(status: string): Promise<TradeRecord[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', this.userId)
      .eq('status', status)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getTradesByDateRange(startDate: string, endDate: string): Promise<TradeRecord[]> {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', this.userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Zone operations
  async saveZone(zone: Omit<ZoneRecord, 'user_id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabase
      .from('zones')
      .upsert({
        ...zone,
        user_id: this.userId,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  async getZones(): Promise<ZoneRecord[]> {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('user_id', this.userId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getActiveZones(): Promise<ZoneRecord[]> {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('user_id', this.userId)
      .eq('active', true)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Real-time subscriptions
  subscribeToTrades(callback: (trade: TradeRecord) => void) {
    return supabase
      .channel('trades')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'trades',
        filter: `user_id=eq.${this.userId}`
      }, callback)
      .subscribe();
  }

  subscribeToZones(callback: (zone: ZoneRecord) => void) {
    return supabase
      .channel('zones')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'zones',
        filter: `user_id=eq.${this.userId}`
      }, callback)
      .subscribe();
  }

  // Advanced analytics
  async getTradingStats(startDate?: string, endDate?: string): Promise<any> {
    let query = supabase
      .from('trades')
      .select('*')
      .eq('user_id', this.userId);

    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    const trades = data || [];
    return {
      totalTrades: trades.length,
      closedTrades: trades.filter(t => t.status === 'closed').length,
      openTrades: trades.filter(t => t.status === 'open').length,
      winningTrades: trades.filter(t => t.pnl && t.pnl > 0).length,
      losingTrades: trades.filter(t => t.pnl && t.pnl < 0).length,
      totalPnL: trades.reduce((sum, t) => sum + (t.pnl || 0), 0),
      avgRiskRatio: trades.reduce((sum, t) => sum + t.risk_ratio, 0) / trades.length
    };
  }

  // Backup and restore
  async exportData(): Promise<string> {
    const [trades, zones, plannedEntries] = await Promise.all([
      this.getTrades(),
      this.getZones(),
      this.getPlannedEntries()
    ]);

    return JSON.stringify({
      trades,
      zones,
      plannedEntries,
      exportDate: new Date().toISOString(),
      version: '1.0'
    }, null, 2);
  }

  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);
    
    // Clear existing data
    await this.clearAllData();
    
    // Import data
    if (data.trades?.length) {
      const { error } = await supabase
        .from('trades')
        .insert(data.trades.map((trade: any) => ({
          ...trade,
          user_id: this.userId
        })));
      if (error) throw error;
    }

    if (data.zones?.length) {
      const { error } = await supabase
        .from('zones')
        .insert(data.zones.map((zone: any) => ({
          ...zone,
          user_id: this.userId
        })));
      if (error) throw error;
    }
  }

  async clearAllData(): Promise<void> {
    const { error: tradesError } = await supabase
      .from('trades')
      .delete()
      .eq('user_id', this.userId);
    if (tradesError) throw tradesError;

    const { error: zonesError } = await supabase
      .from('zones')
      .delete()
      .eq('user_id', this.userId);
    if (zonesError) throw zonesError;
  }

  // Additional methods
  async getPlannedEntries(): Promise<any[]> { return []; }
}

// Create database instance
export const createSupabaseDB = (userId: string) => new SupabaseDatabase(userId); 