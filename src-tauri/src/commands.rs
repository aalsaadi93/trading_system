use crate::database::{Database, TradeRecord, ZoneRecord, PlannedEntryRecord};
use serde::{Deserialize, Serialize};
use tauri::State;
use std::sync::Mutex;

pub type DbState = State<Mutex<Database>>;

// Trade commands
#[tauri::command]
pub async fn save_trade(db: DbState, trade: TradeRecord) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.save_trade(&trade).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_trades(db: DbState) -> Result<Vec<TradeRecord>, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.get_trades().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_trade(db: DbState, id: String) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.conn.execute("DELETE FROM trades WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// Zone commands
#[tauri::command]
pub async fn save_zone(db: DbState, zone: ZoneRecord) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.save_zone(&zone).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_zones(db: DbState) -> Result<Vec<ZoneRecord>, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.get_zones().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_zone(db: DbState, id: String) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.conn.execute("DELETE FROM zones WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// Planned Entry commands
#[tauri::command]
pub async fn save_planned_entry(db: DbState, entry: PlannedEntryRecord) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.save_planned_entry(&entry).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_planned_entries(db: DbState) -> Result<Vec<PlannedEntryRecord>, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.get_planned_entries().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_planned_entry(db: DbState, id: String) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.conn.execute("DELETE FROM planned_entries WHERE id = ?", [id])
        .map_err(|e| e.to_string())?;
    Ok(())
}

// Settings commands
#[tauri::command]
pub async fn save_setting(db: DbState, key: String, value: String) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.save_setting(&key, &value).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn get_setting(db: DbState, key: String) -> Result<Option<String>, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.get_setting(&key).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_all_settings(db: DbState) -> Result<Vec<crate::database::SettingRecord>, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.get_all_settings().map_err(|e| e.to_string())
}

// Export/Import commands
#[tauri::command]
pub async fn export_data(db: DbState) -> Result<String, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.export_data().map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn import_data(db: DbState, json_data: String) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    db.import_data(&json_data).map_err(|e| e.to_string())?;
    Ok(())
}

// Database info
#[tauri::command]
pub async fn get_database_info(db: DbState) -> Result<serde_json::Value, String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    
    let trades_count = db.conn.query_row("SELECT COUNT(*) FROM trades", [], |row| row.get(0))
        .unwrap_or(0);
    let zones_count = db.conn.query_row("SELECT COUNT(*) FROM zones", [], |row| row.get(0))
        .unwrap_or(0);
    let planned_entries_count = db.conn.query_row("SELECT COUNT(*) FROM planned_entries", [], |row| row.get(0))
        .unwrap_or(0);
    let settings_count = db.conn.query_row("SELECT COUNT(*) FROM settings", [], |row| row.get(0))
        .unwrap_or(0);

    Ok(serde_json::json!({
        "total_records": trades_count + zones_count + planned_entries_count + settings_count,
        "trades": trades_count,
        "zones": zones_count,
        "planned_entries": planned_entries_count,
        "settings": settings_count
    }))
}

// Clear all data
#[tauri::command]
pub async fn clear_all_data(db: DbState) -> Result<(), String> {
    let db = db.lock().map_err(|e| e.to_string())?;
    
    db.conn.execute("DELETE FROM trades", [])
        .map_err(|e| e.to_string())?;
    db.conn.execute("DELETE FROM zones", [])
        .map_err(|e| e.to_string())?;
    db.conn.execute("DELETE FROM planned_entries", [])
        .map_err(|e| e.to_string())?;
    db.conn.execute("DELETE FROM settings", [])
        .map_err(|e| e.to_string())?;
    
    Ok(())
} 