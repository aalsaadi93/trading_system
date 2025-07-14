// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod database;
mod commands;

use database::Database;
use commands::*;
use std::sync::Mutex;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Initialize database
            let db = Database::new(&app.app_handle())
                .expect("Failed to initialize database");
            app.manage(Mutex::new(db));
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Trade commands
            save_trade,
            get_trades,
            delete_trade,
            
            // Zone commands
            save_zone,
            get_zones,
            delete_zone,
            
            // Planned Entry commands
            save_planned_entry,
            get_planned_entries,
            delete_planned_entry,
            
            // Settings commands
            save_setting,
            get_setting,
            get_all_settings,
            
            // Export/Import commands
            export_data,
            import_data,
            
            // Database info
            get_database_info,
            clear_all_data,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
