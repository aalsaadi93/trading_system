# SQLite Integration with Tauri

This guide explains how to integrate SQLite with your Trading Management System using Tauri for a robust, persistent database solution.

## 🎯 **Why SQLite + Tauri?**

### **Advantages:**
- **True Persistence**: Data survives app restarts, system reboots, and app updates
- **Performance**: SQLite is faster than IndexedDB for complex queries
- **Reliability**: ACID compliance and crash-safe transactions
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **File-Based**: Easy backup, migration, and data portability
- **No Network Required**: Works offline without internet connection

### **Architecture:**
```
Frontend (React) ↔ Tauri API ↔ SQLite Database
```

## 🚀 **Setup Instructions**

### **Step 1: Install Rust (Required for Tauri)**
```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Restart your terminal or run:
source ~/.cargo/env
```

### **Step 2: Install Tauri CLI**
```bash
npm install --save-dev @tauri-apps/cli
```

### **Step 3: Initialize Tauri**
```bash
npx tauri init
```

### **Step 4: Install Dependencies**
```bash
# Frontend dependencies
npm install @tauri-apps/api

# Backend dependencies (in src-tauri/Cargo.toml)
rusqlite = { version = "0.29", features = ["bundled"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
chrono = { version = "0.4", features = ["serde"] }
```

## 📁 **File Structure**

```
src-tauri/
├── src/
│   ├── main.rs          # Tauri app entry point
│   ├── database.rs      # SQLite database operations
│   └── commands.rs      # Tauri API commands
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json      # Tauri configuration

src/
├── utils/
│   ├── tauri-database.ts # Frontend database service
│   └── dexie-database.ts # (Legacy - can be removed)
└── App.tsx              # Main React component
```

## 🔧 **Configuration**

### **Tauri Configuration (src-tauri/tauri.conf.json)**
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "tauri": {
    "allowlist": {
      "all": false,
      "shell": {
        "all": false,
        "open": true
      }
    },
    "windows": [
      {
        "title": "Trading Management System",
        "width": 1200,
        "height": 800,
        "resizable": true
      }
    ]
  }
}
```

## 🗄️ **Database Schema**

### **Trades Table**
```sql
CREATE TABLE trades (
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
);
```

### **Zones Table**
```sql
CREATE TABLE zones (
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
);
```

### **Planned Entries Table**
```sql
CREATE TABLE planned_entries (
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
);
```

### **Settings Table**
```sql
CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
);
```

## 🔄 **Migration from Dexie.js**

### **Step 1: Update App.tsx**
Replace Dexie imports with Tauri:
```typescript
// Remove this line:
// import { tradingDB } from './utils/dexie-database';

// Add this line:
import { tauriDB } from './utils/tauri-database';
```

### **Step 2: Update Database Calls**
```typescript
// Old Dexie calls:
await tradingDB.saveTrade(trade);
const trades = await tradingDB.getTrades();

// New Tauri calls:
await tauriDB.saveTrade(tauriDB.convertTradeToBackend(trade));
const backendTrades = await tauriDB.getTrades();
const trades = backendTrades.map(t => tauriDB.convertTradeFromBackend(t));
```

### **Step 3: Update Export/Import**
```typescript
// Export
const exportData = await tauriDB.exportData();

// Import
await tauriDB.importData(jsonData);
```

## 🚀 **Running the Application**

### **Development Mode**
```bash
# Start the Tauri development server
npm run tauri dev
```

### **Build for Production**
```bash
# Build the application
npm run tauri build
```

## 📊 **Database Location**

The SQLite database is stored in the application data directory:

- **macOS**: `~/Library/Application Support/com.trading-system.dev/trading_system.db`
- **Windows**: `%APPDATA%\com.trading-system.dev\trading_system.db`
- **Linux**: `~/.local/share/com.trading-system.dev/trading_system.db`

## 🔍 **Testing the Integration**

### **Console Commands**
Open the browser console and run:
```javascript
// Test database operations
await window.__TAURI__.invoke('get_database_info');

// Test trade operations
await window.__TAURI__.invoke('save_trade', {
  trade: {
    id: 'test-1',
    date: '2024-01-20',
    pair: 'XAUUSD',
    trade_type: 'buy',
    entry: 2034.50,
    stop_loss: 2025.00,
    take_profit: 2055.00,
    size: 0.1,
    status: 'open',
    risk_amount: 95.00,
    risk_ratio: 2.15,
    notes: 'Test trade',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
});
```

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Command not found: cargo"**
   - Install Rust: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`

2. **"Failed to initialize database"**
   - Check file permissions in app data directory
   - Ensure SQLite is properly linked

3. **"Module not found: @tauri-apps/api"**
   - Run: `npm install @tauri-apps/api`

4. **Build errors**
   - Update Rust: `rustup update`
   - Clean build: `npm run tauri build -- --clean`

## 📈 **Performance Benefits**

- **Faster Queries**: SQLite outperforms IndexedDB for complex operations
- **Better Indexing**: Full SQL indexing capabilities
- **Transaction Support**: ACID compliance for data integrity
- **Memory Efficiency**: Lower memory usage than browser databases

## 🔒 **Security Features**

- **File System Access**: Controlled through Tauri allowlist
- **SQL Injection Protection**: Parameterized queries
- **Data Validation**: Rust type safety
- **Sandboxed Environment**: Tauri security model

## 📱 **Deployment**

### **Desktop Distribution**
```bash
# Build for current platform
npm run tauri build

# Build for all platforms
npm run tauri build -- --target universal-apple-darwin
npm run tauri build -- --target x86_64-pc-windows-msvc
npm run tauri build -- --target x86_64-unknown-linux-gnu
```

### **Auto-Updates**
Tauri supports automatic updates through its update system. Configure in `tauri.conf.json`:
```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": ["https://your-update-server.com/updates.json"],
      "dialog": true,
      "pubkey": "your-public-key"
    }
  }
}
```

## 🎯 **Next Steps**

1. **Install Rust** on your system
2. **Run the setup commands** above
3. **Test the integration** with sample data
4. **Migrate existing data** from Dexie.js
5. **Deploy the desktop application**

The SQLite integration provides a robust, persistent database solution that's perfect for a trading management system requiring data reliability and performance. 