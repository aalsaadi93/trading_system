import React, { useState, useEffect } from 'react';
import { Database, Download, Upload, Trash2, RefreshCw, HardDrive, FileText, Settings } from 'lucide-react';
import { tradingDB } from '../utils/dexie-database';

interface DataManagerProps {
  onClose: () => void;
}

const DataManager: React.FC<DataManagerProps> = ({ onClose }) => {
  const [stats, setStats] = useState({
    trades: 0,
    zones: 0,
    plannedEntries: 0,
    activeTrades: 0,
    closedTrades: 0,
    totalPnL: 0,
    databaseSize: '0 KB'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<string>('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const dbInfo = await tradingDB.getDatabaseInfo();
      const trades = await tradingDB.getTrades();
      
      const activeTrades = trades.filter(t => t.status === 'open').length;
      const closedTrades = trades.filter(t => t.status === 'closed').length;
      const totalPnL = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
      
      setStats({
        trades: dbInfo.trades,
        zones: dbInfo.zones,
        plannedEntries: dbInfo.plannedEntries,
        activeTrades,
        closedTrades,
        totalPnL,
        databaseSize: dbInfo.databaseSize
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setIsLoading(true);
      const data = await tradingDB.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setLastBackup(new Date().toISOString());
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const content = await file.text();
      await tradingDB.importData(content);
      await loadStats();
      alert('Data imported successfully!');
    } catch (error) {
      console.error('Failed to import data:', error);
      alert('Failed to import data. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      await tradingDB.clearAllData();
      await loadStats();
      alert('All data cleared successfully!');
    } catch (error) {
      console.error('Failed to clear data:', error);
      alert('Failed to clear data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <Database className="w-6 h-6 mr-2 text-blue-400" />
              Data Management (Dexie.js)
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Database Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <HardDrive className="w-8 h-8 text-blue-400" />
                <div>
                  <h3 className="font-semibold text-white">Database Size</h3>
                  <p className="text-2xl font-bold text-blue-400">{stats.databaseSize}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-green-400" />
                <div>
                  <h3 className="font-semibold text-white">Total Records</h3>
                  <p className="text-2xl font-bold text-green-400">
                    {stats.trades + stats.zones + stats.plannedEntries}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-8 h-8 text-yellow-400" />
                <div>
                  <h3 className="font-semibold text-white">Total P&L</h3>
                  <p className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${stats.totalPnL.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Trading Data</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Trades:</span>
                  <span className="text-white">{stats.trades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Trades:</span>
                  <span className="text-yellow-400">{stats.activeTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Closed Trades:</span>
                  <span className="text-green-400">{stats.closedTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate:</span>
                  <span className="text-white">
                    {stats.closedTrades > 0 
                      ? `${Math.round((stats.closedTrades / stats.trades) * 100)}%` 
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Analysis Data</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Technical Zones:</span>
                  <span className="text-white">{stats.zones}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Planned Entries:</span>
                  <span className="text-white">{stats.plannedEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Backup:</span>
                  <span className="text-gray-300">
                    {lastBackup ? new Date(lastBackup).toLocaleDateString() : 'Never'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={handleExport}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export Backup</span>
            </button>

            <label className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Import Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            <button
              onClick={loadStats}
              disabled={isLoading}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Stats</span>
            </button>

            <button
              onClick={handleClear}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Data</span>
            </button>
          </div>

          {/* Info Section */}
          <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">Dexie.js Database Information</h4>
            <div className="text-sm text-gray-300 space-y-1">
              <p>• Enhanced IndexedDB with better performance and API</p>
              <p>• Automatic data persistence with transaction support</p>
              <p>• Advanced querying and indexing capabilities</p>
              <p>• Data persists between browser sessions</p>
              <p>• Export/import backups for data safety</p>
              <p>• Clear data to start fresh (use with caution)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataManager; 