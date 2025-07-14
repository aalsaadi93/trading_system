use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct TradeRecord {
    pub id: String,
    pub date: String,
    pub pair: String,
    pub trade_type: String,
    pub entry: f64,
    pub exit: Option<f64>,
    pub stop_loss: f64,
    pub take_profit: f64,
    pub size: f64,
    pub status: String,
    pub pnl: Option<f64>,
    pub zone_id: Option<String>,
    pub zone_name: Option<String>,
    pub planned_entry_id: Option<String>,
    pub risk_amount: f64,
    pub risk_ratio: f64,
    pub notes: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ZoneRecord {
    pub id: String,
    pub zone_type: String,
    pub name: String,
    pub start_price: f64,
    pub end_price: f64,
    pub strength: String,
    pub break_strength: Option<String>,
    pub position: Option<String>,
    pub liquidity_type: Option<String>,
    pub order_block_relation: Option<String>,
    pub notes: String,
    pub date: String,
    pub active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PlannedEntryRecord {
    pub id: String,
    pub zone_id: String,
    pub zone_name: String,
    pub zone_type: String,
    pub entry_level: f64,
    pub take_profit: f64,
    pub stop_loss: f64,
    pub risk_ratio: f64,
    pub planned_entries: i32,
    pub notes: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SettingRecord {
    pub key: String,
    pub value: String,
    pub updated_at: String,
}

pub struct Database {
    conn: Connection,
}

impl Database {
    pub fn new(app_handle: &AppHandle) -> Result<Self> {
        let app_dir = app_handle.path_resolver().app_data_dir().unwrap();
        std::fs::create_dir_all(&app_dir)?;
        
        let db_path = app_dir.join("trading_system.db");
        let conn = Connection::open(&db_path)?;
        
        // Create tables
        conn.execute(
            "CREATE TABLE IF NOT EXISTS trades (
                id TEXT PRIMARY KEY,
                date TEXT NOT NULL,
                pair TEXT NOT NULL,
                trade_type TEXT NOT NULL,
                entry REAL NOT NULL,
                exit REAL,
                stop_loss REAL NOT NULL,
                take_profit REAL NOT NULL,
                size REAL NOT NULL,
                status TEXT NOT NULL,
                pnl REAL,
                zone_id TEXT,
                zone_name TEXT,
                planned_entry_id TEXT,
                risk_amount REAL NOT NULL,
                risk_ratio REAL NOT NULL,
                notes TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS zones (
                id TEXT PRIMARY KEY,
                zone_type TEXT NOT NULL,
                name TEXT NOT NULL,
                start_price REAL NOT NULL,
                end_price REAL NOT NULL,
                strength TEXT NOT NULL,
                break_strength TEXT,
                position TEXT,
                liquidity_type TEXT,
                order_block_relation TEXT,
                notes TEXT NOT NULL,
                date TEXT NOT NULL,
                active INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS planned_entries (
                id TEXT PRIMARY KEY,
                zone_id TEXT NOT NULL,
                zone_name TEXT NOT NULL,
                zone_type TEXT NOT NULL,
                entry_level REAL NOT NULL,
                take_profit REAL NOT NULL,
                stop_loss REAL NOT NULL,
                risk_ratio REAL NOT NULL,
                planned_entries INTEGER NOT NULL,
                notes TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )",
            [],
        )?;

        Ok(Database { conn })
    }

    // Trade operations
    pub fn save_trade(&self, trade: &TradeRecord) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO trades (
                id, date, pair, trade_type, entry, exit, stop_loss, take_profit, 
                size, status, pnl, zone_id, zone_name, planned_entry_id, 
                risk_amount, risk_ratio, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                trade.id, trade.date, trade.pair, trade.trade_type, trade.entry,
                trade.exit, trade.stop_loss, trade.take_profit, trade.size,
                trade.status, trade.pnl, trade.zone_id, trade.zone_name,
                trade.planned_entry_id, trade.risk_amount, trade.risk_ratio,
                trade.notes, trade.created_at, trade.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn get_trades(&self) -> Result<Vec<TradeRecord>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM trades ORDER BY date DESC"
        )?;
        
        let trade_iter = stmt.query_map([], |row| {
            Ok(TradeRecord {
                id: row.get(0)?,
                date: row.get(1)?,
                pair: row.get(2)?,
                trade_type: row.get(3)?,
                entry: row.get(4)?,
                exit: row.get(5)?,
                stop_loss: row.get(6)?,
                take_profit: row.get(7)?,
                size: row.get(8)?,
                status: row.get(9)?,
                pnl: row.get(10)?,
                zone_id: row.get(11)?,
                zone_name: row.get(12)?,
                planned_entry_id: row.get(13)?,
                risk_amount: row.get(14)?,
                risk_ratio: row.get(15)?,
                notes: row.get(16)?,
                created_at: row.get(17)?,
                updated_at: row.get(18)?,
            })
        })?;

        let mut trades = Vec::new();
        for trade in trade_iter {
            trades.push(trade?);
        }
        Ok(trades)
    }

    // Zone operations
    pub fn save_zone(&self, zone: &ZoneRecord) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO zones (
                id, zone_type, name, start_price, end_price, strength,
                break_strength, position, liquidity_type, order_block_relation,
                notes, date, active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                zone.id, zone.zone_type, zone.name, zone.start_price,
                zone.end_price, zone.strength, zone.break_strength,
                zone.position, zone.liquidity_type, zone.order_block_relation,
                zone.notes, zone.date, zone.active, zone.created_at, zone.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn get_zones(&self) -> Result<Vec<ZoneRecord>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM zones ORDER BY date DESC"
        )?;
        
        let zone_iter = stmt.query_map([], |row| {
            Ok(ZoneRecord {
                id: row.get(0)?,
                zone_type: row.get(1)?,
                name: row.get(2)?,
                start_price: row.get(3)?,
                end_price: row.get(4)?,
                strength: row.get(5)?,
                break_strength: row.get(6)?,
                position: row.get(7)?,
                liquidity_type: row.get(8)?,
                order_block_relation: row.get(9)?,
                notes: row.get(10)?,
                date: row.get(11)?,
                active: row.get(12)?,
                created_at: row.get(13)?,
                updated_at: row.get(14)?,
            })
        })?;

        let mut zones = Vec::new();
        for zone in zone_iter {
            zones.push(zone?);
        }
        Ok(zones)
    }

    // Planned Entry operations
    pub fn save_planned_entry(&self, entry: &PlannedEntryRecord) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO planned_entries (
                id, zone_id, zone_name, zone_type, entry_level, take_profit,
                stop_loss, risk_ratio, planned_entries, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            params![
                entry.id, entry.zone_id, entry.zone_name, entry.zone_type,
                entry.entry_level, entry.take_profit, entry.stop_loss,
                entry.risk_ratio, entry.planned_entries, entry.notes,
                entry.created_at, entry.updated_at
            ],
        )?;
        Ok(())
    }

    pub fn get_planned_entries(&self) -> Result<Vec<PlannedEntryRecord>> {
        let mut stmt = self.conn.prepare(
            "SELECT * FROM planned_entries ORDER BY created_at DESC"
        )?;
        
        let entry_iter = stmt.query_map([], |row| {
            Ok(PlannedEntryRecord {
                id: row.get(0)?,
                zone_id: row.get(1)?,
                zone_name: row.get(2)?,
                zone_type: row.get(3)?,
                entry_level: row.get(4)?,
                take_profit: row.get(5)?,
                stop_loss: row.get(6)?,
                risk_ratio: row.get(7)?,
                planned_entries: row.get(8)?,
                notes: row.get(9)?,
                created_at: row.get(10)?,
                updated_at: row.get(11)?,
            })
        })?;

        let mut entries = Vec::new();
        for entry in entry_iter {
            entries.push(entry?);
        }
        Ok(entries)
    }

    // Settings operations
    pub fn save_setting(&self, key: &str, value: &str) -> Result<()> {
        self.conn.execute(
            "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)",
            params![key, value, chrono::Utc::now().to_rfc3339()],
        )?;
        Ok(())
    }

    pub fn get_setting(&self, key: &str) -> Result<Option<String>> {
        let mut stmt = self.conn.prepare("SELECT value FROM settings WHERE key = ?")?;
        let mut rows = stmt.query(params![key])?;
        
        if let Some(row) = rows.next()? {
            Ok(Some(row.get(0)?))
        } else {
            Ok(None)
        }
    }

    pub fn get_all_settings(&self) -> Result<Vec<SettingRecord>> {
        let mut stmt = self.conn.prepare("SELECT * FROM settings")?;
        
        let setting_iter = stmt.query_map([], |row| {
            Ok(SettingRecord {
                key: row.get(0)?,
                value: row.get(1)?,
                updated_at: row.get(2)?,
            })
        })?;

        let mut settings = Vec::new();
        for setting in setting_iter {
            settings.push(setting?);
        }
        Ok(settings)
    }

    // Export/Import
    pub fn export_data(&self) -> Result<String> {
        let trades = self.get_trades()?;
        let zones = self.get_zones()?;
        let planned_entries = self.get_planned_entries()?;
        let settings = self.get_all_settings()?;

        let export_data = serde_json::json!({
            "trades": trades,
            "zones": zones,
            "planned_entries": planned_entries,
            "settings": settings,
            "export_date": chrono::Utc::now().to_rfc3339(),
            "version": "1.0"
        });

        Ok(serde_json::to_string_pretty(&export_data)?)
    }

    pub fn import_data(&self, json_data: &str) -> Result<()> {
        let data: serde_json::Value = serde_json::from_str(json_data)?;
        
        // Clear existing data
        self.conn.execute("DELETE FROM trades", [])?;
        self.conn.execute("DELETE FROM zones", [])?;
        self.conn.execute("DELETE FROM planned_entries", [])?;
        self.conn.execute("DELETE FROM settings", [])?;

        // Import trades
        if let Some(trades) = data["trades"].as_array() {
            for trade_json in trades {
                let trade: TradeRecord = serde_json::from_value(trade_json.clone())?;
                self.save_trade(&trade)?;
            }
        }

        // Import zones
        if let Some(zones) = data["zones"].as_array() {
            for zone_json in zones {
                let zone: ZoneRecord = serde_json::from_value(zone_json.clone())?;
                self.save_zone(&zone)?;
            }
        }

        // Import planned entries
        if let Some(entries) = data["planned_entries"].as_array() {
            for entry_json in entries {
                let entry: PlannedEntryRecord = serde_json::from_value(entry_json.clone())?;
                self.save_planned_entry(&entry)?;
            }
        }

        // Import settings
        if let Some(settings) = data["settings"].as_array() {
            for setting_json in settings {
                let setting: SettingRecord = serde_json::from_value(setting_json.clone())?;
                self.save_setting(&setting.key, &setting.value)?;
            }
        }

        Ok(())
    }
} 