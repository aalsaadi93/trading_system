import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Shield, BarChart3, CheckCircle, Clock, AlertTriangle, Target, DollarSign, Activity, Plus, Save, Download, Upload, Trash2, Database } from 'lucide-react';
import NewsEvents, { NewsEvent } from './components/NewsEvents';
import EconomicCalendar, { EconomicEvent } from './components/EconomicCalendar';
import TechnicalAnalysis, { TechnicalZone } from './components/TechnicalAnalysis';
import WeeklyPlanning, { PlannedEntry } from './components/WeeklyPlanning';
import PreTradeChecklist, { PreTradeData } from './components/PreTradeChecklist';
import DataManager from './components/DataManager';
import { tradingDB } from './utils/dexie-database';
import { testDexieDatabase, testSpecificDataTypes } from './utils/dexie-test';
import { verifyDataSaving } from './utils/verify-data-saving';
import { testApiKeys } from './utils/apiTest';

interface TradeRecord {
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

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
  category: 'fundamental' | 'technical' | 'risk' | 'market';
}

function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // News Events State
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([
    {
      id: '1',
      title: 'Fed Chair Powell Speech on Monetary Policy',
      description: 'Federal Reserve Chairman Jerome Powell to speak about current monetary policy stance and future outlook.',
      date: '2024-01-22',
      time: '14:00',
      category: 'economic',
      impact: 'high',
      goldImpact: 'bullish'
    },
    {
      id: '2',
      title: 'Geopolitical Tensions in Middle East',
      description: 'Ongoing tensions affecting global markets and safe-haven demand.',
      date: '2024-01-20',
      time: '09:00',
      category: 'geopolitical',
      impact: 'high',
      goldImpact: 'bullish'
    }
  ]);

  // Economic Events State
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([
    {
      id: '1',
      name: 'Federal Funds Rate Decision',
      country: 'US',
      date: '2024-01-24',
      time: '19:00',
      importance: 'high',
      forecast: '5.25%',
      previous: '5.25%',
      actual: '',
      goldImpact: 'high',
      category: 'monetary_policy'
    },
    {
      id: '2',
      name: 'Non-Farm Employment Change',
      country: 'US',
      date: '2024-01-26',
      time: '13:30',
      importance: 'high',
      forecast: '180K',
      previous: '199K',
      actual: '',
      goldImpact: 'high',
      category: 'employment'
    },
    {
      id: '3',
      name: 'Consumer Price Index (CPI)',
      country: 'US',
      date: '2024-01-25',
      time: '13:30',
      importance: 'high',
      forecast: '3.2%',
      previous: '3.1%',
      actual: '',
      goldImpact: 'high',
      category: 'inflation'
    }
  ]);

  const weekDays = [
    { name: 'Sunday', short: 'Sun', color: 'bg-green-500', activity: 'Preparation' },
    { name: 'Monday', short: 'Mon', color: 'bg-blue-500', activity: 'Trading' },
    { name: 'Tuesday', short: 'Tue', color: 'bg-blue-500', activity: 'Trading' },
    { name: 'Wednesday', short: 'Wed', color: 'bg-blue-500', activity: 'Trading' },
    { name: 'Thursday', short: 'Thu', color: 'bg-blue-500', activity: 'Trading' },
    { name: 'Friday', short: 'Fri', color: 'bg-blue-500', activity: 'Trading' },
    { name: 'Saturday', short: 'Sat', color: 'bg-red-500', activity: 'Rest' }
  ];

  const [weeklyChecklist, setWeeklyChecklist] = useState<ChecklistItem[]>([
    { id: '1', task: 'Review economic calendar', completed: false, category: 'fundamental' },
    { id: '2', task: 'Analyze gold-impacting events', completed: false, category: 'fundamental' },
    { id: '3', task: 'Monitor central bank news', completed: false, category: 'fundamental' },
    { id: '4', task: 'Geopolitical analysis', completed: false, category: 'fundamental' },
    { id: '5', task: 'Technical chart analysis', completed: false, category: 'technical' },
    { id: '6', task: 'Support/resistance levels', completed: false, category: 'technical' },
    { id: '7', task: 'Market structure assessment', completed: false, category: 'technical' },
    { id: '8', task: 'Zone identification and mapping', completed: false, category: 'technical' },
    { id: '9', task: 'Risk assessment', completed: false, category: 'risk' },
    { id: '10', task: 'Position sizing calculation', completed: false, category: 'risk' }
  ]);

  const [preTradeChecklist, setPreTradeChecklist] = useState<ChecklistItem[]>([
    { id: '1', task: 'Market conditions analyzed', completed: false, category: 'market' },
    { id: '2', task: 'Entry criteria confirmed', completed: false, category: 'technical' },
    { id: '3', task: 'Stop loss set', completed: false, category: 'risk' },
    { id: '4', task: 'Take profit defined', completed: false, category: 'risk' },
    { id: '5', task: 'Position size calculated', completed: false, category: 'risk' },
    { id: '6', task: 'Risk-reward ratio > 1:2', completed: false, category: 'risk' }
  ]);

  const [technicalAnalysisComplete, setTechnicalAnalysisComplete] = useState(false);
  const [marketStructureComplete, setMarketStructureComplete] = useState(false);
  const [weeklyPlanningComplete, setWeeklyPlanningComplete] = useState(false);
  const [technicalZones, setTechnicalZones] = useState<TechnicalZone[]>([]);
  const [plannedEntries, setPlannedEntries] = useState<PlannedEntry[]>([
    {
      id: '1',
      zoneId: '1',
      zoneName: 'Major Support Level',
      zoneType: 'support',
      entryLevel: 2020.50,
      takeProfit: 2035.00,
      stopLoss: 2015.00,
      riskRatio: 2.9,
      plannedEntries: 2,
      notes: 'Strong support level with multiple touches'
    },
    {
      id: '2',
      zoneId: '2',
      zoneName: 'Golden Zone 61.8%',
      zoneType: 'golden_zone',
      entryLevel: 2035.20,
      takeProfit: 2050.00,
      stopLoss: 2028.00,
      riskRatio: 2.1,
      plannedEntries: 1,
      notes: 'Fibonacci retracement level with strong break'
    }
  ]);
  const [weeklyRiskBudget, setWeeklyRiskBudget] = useState(1000); // $1000 weekly risk budget
  const [weeklyRiskUsed, setWeeklyRiskUsed] = useState(0);
  const [showPreTradeChecklist, setShowPreTradeChecklist] = useState(false);
  const [lastSaved, setLastSaved] = useState<string>('');
  const [showDataManager, setShowDataManager] = useState(false);

  const [trades, setTrades] = useState<TradeRecord[]>([]);

  // Load data from Dexie database on component mount
  useEffect(() => {
    const loadDataFromDatabase = async () => {
      try {
        // Load trades
        const dbTrades = await tradingDB.getTrades();
        setTrades(dbTrades);

        // Load zones
        const dbZones = await tradingDB.getZones();
        setTechnicalZones(dbZones.map(zone => ({
          id: zone.id,
          type: zone.type as TechnicalZone['type'],
          name: zone.name,
          startPrice: zone.startPrice,
          endPrice: zone.endPrice,
          strength: zone.strength as 'strong' | 'medium' | 'weak',
          breakStrength: zone.breakStrength as 'strong' | 'medium' | 'weak' | undefined,
          position: zone.position as 'above_golden' | 'below_golden' | 'cheap_zone' | 'expensive_zone' | undefined,
          liquidityType: zone.liquidityType as 'double_bottom' | 'liquidity_sweep' | undefined,
          orderBlockRelation: zone.orderBlockRelation as 'above_fvg' | 'below_fvg' | undefined,
          notes: zone.notes,
          date: zone.date,
          active: zone.active
        })));

        // Load planned entries
        const dbPlannedEntries = await tradingDB.getPlannedEntries();
        setPlannedEntries(dbPlannedEntries.map(entry => ({
          id: entry.id,
          zoneId: entry.zoneId,
          zoneName: entry.zoneName,
          zoneType: entry.zoneType,
          entryLevel: entry.entryLevel,
          takeProfit: entry.takeProfit,
          stopLoss: entry.stopLoss,
          riskRatio: entry.riskRatio,
          plannedEntries: entry.plannedEntries,
          notes: entry.notes
        })));

        // Load settings
        const settings = await tradingDB.getAllSettings();
        setWeeklyRiskBudget(settings.weeklyRiskBudget || 1000);
        setWeeklyRiskUsed(settings.weeklyRiskUsed || 0);
        setTechnicalAnalysisComplete(settings.technicalAnalysisComplete || false);
        setMarketStructureComplete(settings.marketStructureComplete || false);
        setWeeklyPlanningComplete(settings.weeklyPlanningComplete || false);
        setLastSaved(settings.lastSaved || new Date().toISOString());

        // Load checklists (stored as settings)
        if (settings.weeklyChecklist) {
          setWeeklyChecklist(settings.weeklyChecklist);
        }
        if (settings.preTradeChecklist) {
          setPreTradeChecklist(settings.preTradeChecklist);
        }

        // Load events (stored as settings)
        if (settings.newsEvents) {
          setNewsEvents(settings.newsEvents);
        }
        if (settings.economicEvents) {
          setEconomicEvents(settings.economicEvents);
        }

        // Make database and test function available globally for debugging
        (window as any).tradingDB = tradingDB;
        (window as any).testDexieDatabase = testDexieDatabase;
        (window as any).testSpecificDataTypes = testSpecificDataTypes;
        (window as any).verifyDataSaving = verifyDataSaving;
        (window as any).resetDatabase = () => tradingDB.resetDatabase();
        (window as any).testApiKeys = testApiKeys;

      } catch (error) {
        console.error('Failed to load data from database:', error);
      }
    };

    loadDataFromDatabase();
  }, []);

  // Auto-save data to Dexie database when any state changes
  useEffect(() => {
    const saveDataToDatabase = async () => {
      try {
        // Save trades
        for (const trade of trades) {
          await tradingDB.saveTrade({
            ...trade,
            createdAt: trade.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        // Save zones
        for (const zone of technicalZones) {
          await tradingDB.saveZone({
            id: zone.id,
            type: zone.type,
            name: zone.name,
            startPrice: zone.startPrice,
            endPrice: zone.endPrice,
            strength: zone.strength,
            breakStrength: zone.breakStrength,
            position: zone.position,
            liquidityType: zone.liquidityType,
            orderBlockRelation: zone.orderBlockRelation,
            notes: zone.notes,
            date: zone.date,
            active: zone.active,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        // Save planned entries
        for (const entry of plannedEntries) {
          await tradingDB.savePlannedEntry({
            id: entry.id,
            zoneId: entry.zoneId,
            zoneName: entry.zoneName,
            zoneType: entry.zoneType,
            entryLevel: entry.entryLevel,
            takeProfit: entry.takeProfit,
            stopLoss: entry.stopLoss,
            riskRatio: entry.riskRatio,
            plannedEntries: entry.plannedEntries,
            notes: entry.notes,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }

        // Save ALL settings and data
        const allSettings = {
          // Risk management
          weeklyRiskBudget,
          weeklyRiskUsed,
          
          // Completion status
          technicalAnalysisComplete,
          marketStructureComplete,
          weeklyPlanningComplete,
          
          // Checklists
          weeklyChecklist,
          preTradeChecklist,
          
          // Events
          newsEvents,
          economicEvents,
          
          // Timestamps
          lastSaved: new Date().toISOString()
        };

        // Save each setting individually
        for (const [key, value] of Object.entries(allSettings)) {
          await tradingDB.saveSetting(key, value);
        }

        setLastSaved(new Date().toISOString());
      } catch (error) {
        console.error('Failed to save data to database:', error);
      }
    };

    // Debounce the save operation to avoid too frequent saves
    const timeoutId = setTimeout(saveDataToDatabase, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    trades,
    technicalZones,
    plannedEntries,
    weeklyRiskBudget,
    weeklyRiskUsed,
    technicalAnalysisComplete,
    marketStructureComplete,
    weeklyPlanningComplete,
    weeklyChecklist,
    preTradeChecklist,
    newsEvents,
    economicEvents
  ]);

  const toggleChecklistItem = (items: ChecklistItem[], setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>, id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // News Events Handlers
  const handleAddNewsEvent = (event: Omit<NewsEvent, 'id'>) => {
    const newEvent: NewsEvent = {
      ...event,
      id: Date.now().toString()
    };
    setNewsEvents([...newsEvents, newEvent]);
  };

  const handleRemoveNewsEvent = (id: string) => {
    setNewsEvents(newsEvents.filter(event => event.id !== id));
  };

  // Economic Events Handlers
  const handleAddEconomicEvent = (event: Omit<EconomicEvent, 'id'> | Omit<EconomicEvent, 'id'>[]) => {
    if (Array.isArray(event)) {
      // Add all events, assign unique IDs
      const newEvents = event.map(ev => ({
        ...ev,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }));
      setEconomicEvents(prev => [...prev, ...newEvents]);
    } else {
      const newEvent: EconomicEvent = {
        ...event,
        id: Date.now().toString()
      };
      setEconomicEvents(prev => [...prev, newEvent]);
    }
  };

  const handleRemoveEconomicEvent = (id: string) => {
    setEconomicEvents(economicEvents.filter(event => event.id !== id));
  };

  const handleUpdateEconomicEvent = (id: string, updates: Partial<EconomicEvent>) => {
    setEconomicEvents(economicEvents.map(event => 
      event.id === id ? { ...event, ...updates } : event
    ));
  };

  // Pre-Trade Checklist Handlers
  const handleTradeReady = async (tradeData: PreTradeData) => {
    const newTrade: TradeRecord = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      pair: 'XAUUSD',
      type: tradeData.tradeType,
      entry: tradeData.entryPrice,
      stopLoss: tradeData.stopLoss,
      takeProfit: tradeData.takeProfit,
      size: tradeData.positionSize,
      status: 'open',
      zoneId: tradeData.selectedZone?.id,
      zoneName: tradeData.selectedZone?.name,
      plannedEntryId: tradeData.selectedPlannedEntry?.id,
      confirmations: tradeData.confirmations,
      riskAmount: tradeData.riskAmount,
      riskRatio: tradeData.riskRatio,
      notes: tradeData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setTrades([...trades, newTrade]);
    setWeeklyRiskUsed(prev => prev + tradeData.riskAmount);
    setShowPreTradeChecklist(false);
  };

  const handleCancelPreTrade = () => {
    setShowPreTradeChecklist(false);
  };

  // Data Management Functions
  const handleExportData = async () => {
    try {
      console.log('Starting data export...');
      
      // Force save current data before export
      const allSettings = {
        weeklyRiskBudget,
        weeklyRiskUsed,
        technicalAnalysisComplete,
        marketStructureComplete,
        weeklyPlanningComplete,
        weeklyChecklist,
        preTradeChecklist,
        newsEvents,
        economicEvents,
        lastSaved: new Date().toISOString()
      };

      // Save current state to database
      for (const [key, value] of Object.entries(allSettings)) {
        await tradingDB.saveSetting(key, value);
      }

      // Export data
      const data = await tradingDB.exportData();
      console.log('Export data generated:', data.substring(0, 200) + '...');
      
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('Export completed successfully');
    } catch (error) {
      console.error('Export failed with error:', error);
      alert(`Failed to export data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        console.log('Starting data import...');
        const content = await file.text();
        console.log('File content loaded, size:', content.length);
        
        await tradingDB.importData(content);
        console.log('Data imported successfully, reloading page...');
        
        // Reload the page to apply imported data
        window.location.reload();
      } catch (error) {
        console.error('Import failed with error:', error);
        alert(`Failed to import data: ${error instanceof Error ? error.message : 'Please check the file format.'}`);
      }
    }
  };

  const handleClearData = async () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      try {
        await tradingDB.clearAllData();
        window.location.reload();
      } catch (error) {
        console.error('Failed to clear data:', error);
        alert('Failed to clear data. Please try again.');
      }
    }
  };

  // Update weekly risk used calculation
  useEffect(() => {
    const openTradesRisk = trades
      .filter(trade => trade.status === 'open')
      .reduce((sum, trade) => sum + (trade.riskAmount || 0), 0);
    setWeeklyRiskUsed(openTradesRisk);
  }, [trades]);

  const getCompletionPercentage = (items: ChecklistItem[]) => {
    const completed = items.filter(item => item.completed).length;
    const technicalAnalysisBonus = technicalAnalysisComplete ? 1 : 0;
    const marketStructureBonus = marketStructureComplete ? 1 : 0;
    const weeklyPlanningBonus = weeklyPlanningComplete ? 1 : 0;
    const totalItems = items.length + technicalAnalysisBonus + marketStructureBonus + weeklyPlanningBonus;
    const totalCompleted = completed + technicalAnalysisBonus + marketStructureBonus + weeklyPlanningBonus;
    return Math.round((totalCompleted / totalItems) * 100);
  };

  const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  const winRate = trades.filter(t => t.status === 'closed').length > 0 
    ? Math.round((trades.filter(t => t.pnl && t.pnl > 0).length / trades.filter(t => t.status === 'closed').length) * 100)
    : 0;

  const renderWeeklyCalendar = () => (
    <div className="bg-gray-800 rounded-lg p-6 mb-6">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center">
        <Calendar className="mr-2" />
        Weekly Trading Calendar
      </h2>
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => (
          <div
            key={day.name}
            className={`p-4 rounded-lg text-center cursor-pointer transition-all ${
              selectedDay === index ? 'ring-2 ring-yellow-400' : ''
            } ${day.color} text-white`}
            onClick={() => setSelectedDay(index)}
          >
            <div className="font-bold">{day.short}</div>
            <div className="text-sm mt-1">{day.activity}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Total P&L</p>
              <p className={`text-2xl font-bold ${totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${totalPnL.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Win Rate</p>
              <p className="text-2xl font-bold text-blue-400">{winRate}%</p>
            </div>
            <Target className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Active Trades</p>
              <p className="text-2xl font-bold text-purple-400">
                {trades.filter(t => t.status === 'open').length}
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400">Preparation</p>
              <p className="text-2xl font-bold text-green-400">
                {getCompletionPercentage(weeklyChecklist)}%
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Weekly Preparation</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="text-white">{getCompletionPercentage(weeklyChecklist)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getCompletionPercentage(weeklyChecklist)}%` }}
              ></div>
            </div>
            <button
              onClick={() => setActiveTab('preparation')}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Continue Preparation
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Trade Management</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Trades</span>
              <span className="text-white">{trades.filter(t => t.status === 'open').length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Pre-Trade Ready</span>
              <span className="text-white">{getCompletionPercentage(preTradeChecklist)}%</span>
            </div>
            <button
              onClick={() => setActiveTab('trades')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Manage Trades
            </button>
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Risk Management</h3>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Risk Level</span>
              <span className="text-green-400">Low</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Max Drawdown</span>
              <span className="text-white">-2.5%</span>
            </div>
            <button
              onClick={() => setActiveTab('risk')}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Review Risk
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreparation = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Weekly Preparation</h2>
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white">{getCompletionPercentage(weeklyChecklist)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-green-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage(weeklyChecklist)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* News Events */}
        <NewsEvents
          events={newsEvents}
          onAddEvent={handleAddNewsEvent}
          onRemoveEvent={handleRemoveNewsEvent}
        />

        {/* Economic Calendar */}
        <EconomicCalendar
          events={economicEvents}
          onAddEvent={handleAddEconomicEvent}
          onRemoveEvent={handleRemoveEconomicEvent}
          onUpdateEvent={handleUpdateEconomicEvent}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Technical Analysis Component */}
        <div className="md:col-span-2">
          <TechnicalAnalysis 
            onComplete={() => {
              setTechnicalAnalysisComplete(true);
              setMarketStructureComplete(true);
            }}
            zones={technicalZones}
            onZonesChange={setTechnicalZones}
          />
        </div>
      </div>

      {/* Weekly Planning Component */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="md:col-span-2">
          <WeeklyPlanning 
            technicalZones={technicalZones}
            economicEvents={economicEvents}
            plannedEntries={plannedEntries}
            onPlannedEntriesChange={setPlannedEntries}
            onComplete={() => setWeeklyPlanningComplete(true)} 
          />
        </div>
      </div>

      {/* Additional Preparation Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Fundamental Analysis Checklist */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Fundamental Checklist</h3>
          <div className="space-y-3">
            {weeklyChecklist.filter(item => item.category === 'fundamental').map(item => (
              <div key={item.id} className="flex items-center space-x-3">
                <button
                  onClick={() => toggleChecklistItem(weeklyChecklist, setWeeklyChecklist, item.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-400 hover:border-green-400'
                  }`}
                >
                  {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                </button>
                <span className={`text-sm ${item.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Risk Assessment</h3>
          <div className="space-y-3">
            {weeklyChecklist.filter(item => item.category === 'risk').map(item => (
              <div key={item.id} className="flex items-center space-x-3">
                <button
                  onClick={() => toggleChecklistItem(weeklyChecklist, setWeeklyChecklist, item.id)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    item.completed 
                      ? 'bg-green-500 border-green-500' 
                      : 'border-gray-400 hover:border-green-400'
                  }`}
                >
                  {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                </button>
                <span className={`text-sm ${item.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                  {item.task}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Planning */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Weekly Planning</h3>
          <div className="space-y-3">
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Trading Goals</h4>
              <textarea
                className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm"
                placeholder="Set your weekly trading goals..."
                rows={2}
              />
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-2">Key Levels</h4>
              <textarea
                className="w-full bg-gray-600 text-white rounded px-3 py-2 text-sm"
                placeholder="Important levels to watch..."
                rows={2}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTrades = () => (
    <div className="space-y-6">
      {/* Pre-Trade Checklist */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Pre-Trade Checklist</h2>
          <button
            onClick={() => setShowPreTradeChecklist(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Trade Setup</span>
          </button>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">Readiness</span>
            <span className="text-white">{getCompletionPercentage(preTradeChecklist)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <div 
              className="bg-blue-500 h-3 rounded-full transition-all duration-300"
              style={{ width: `${getCompletionPercentage(preTradeChecklist)}%` }}
            ></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {preTradeChecklist.map(item => (
            <div key={item.id} className="flex items-center space-x-3">
              <button
                onClick={() => toggleChecklistItem(preTradeChecklist, setPreTradeChecklist, item.id)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  item.completed 
                    ? 'bg-blue-500 border-blue-500' 
                    : 'border-gray-400 hover:border-blue-400'
                }`}
              >
                {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
              </button>
              <span className={`text-sm ${item.completed ? 'text-blue-400 line-through' : 'text-gray-300'}`}>
                {item.task}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Management Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Weekly Risk Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Risk Budget</h4>
            <div className="text-2xl font-bold text-green-400">${weeklyRiskBudget.toFixed(2)}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Risk Used</h4>
            <div className="text-2xl font-bold text-red-400">${weeklyRiskUsed.toFixed(2)}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Available</h4>
            <div className="text-2xl font-bold text-blue-400">${(weeklyRiskBudget - weeklyRiskUsed).toFixed(2)}</div>
          </div>
          <div className="bg-gray-700 rounded-lg p-4">
            <h4 className="font-semibold text-white mb-2">Usage %</h4>
            <div className="text-2xl font-bold text-yellow-400">{Math.round((weeklyRiskUsed / weeklyRiskBudget) * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Active Trades */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Active Trades</h2>
        <div className="space-y-4">
          {trades.filter(t => t.status === 'open').length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No active trades</p>
              <p className="text-sm">Use the Pre-Trade Checklist to open new trades</p>
            </div>
          ) : (
            trades.filter(t => t.status === 'open').map(trade => (
              <div key={trade.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{trade.pair}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        trade.type === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {trade.type.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-yellow-600 text-white">
                        OPEN
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{trade.date}</p>
                    {trade.zoneName && (
                      <p className="text-sm text-blue-400">Zone: {trade.zoneName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Risk Amount</div>
                    <div className="text-red-400 font-bold">${trade.riskAmount?.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">R:R {trade.riskRatio?.toFixed(2)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Entry:</span>
                    <span className="text-white ml-2">{trade.entry}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-white ml-2">{trade.stopLoss}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Take Profit:</span>
                    <span className="text-white ml-2">{trade.takeProfit}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white ml-2">{trade.size}</span>
                  </div>
                </div>
                {trade.notes && (
                  <p className="text-sm text-gray-300 mt-2">{trade.notes}</p>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Trade History */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Trade History</h2>
        <div className="space-y-4">
          {trades.filter(t => t.status === 'closed').length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No closed trades yet</p>
            </div>
          ) : (
            trades.filter(t => t.status === 'closed').map(trade => (
              <div key={trade.id} className="bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-white">{trade.pair}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        trade.type === 'buy' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      }`}>
                        {trade.type.toUpperCase()}
                      </span>
                      <span className="px-2 py-1 rounded text-xs bg-gray-600 text-white">
                        CLOSED
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{trade.date}</p>
                    {trade.zoneName && (
                      <p className="text-sm text-blue-400">Zone: {trade.zoneName}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className={`font-bold ${trade.pnl && trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${trade.pnl?.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">R:R {trade.riskRatio?.toFixed(2)}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Entry:</span>
                    <span className="text-white ml-2">{trade.entry}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Exit:</span>
                    <span className="text-white ml-2">{trade.exit}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Stop Loss:</span>
                    <span className="text-white ml-2">{trade.stopLoss}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white ml-2">{trade.size}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pre-Trade Checklist Modal */}
      {showPreTradeChecklist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <PreTradeChecklist
              technicalZones={technicalZones}
              plannedEntries={plannedEntries}
              weeklyRiskBudget={weeklyRiskBudget}
              weeklyRiskUsed={weeklyRiskUsed}
              onTradeReady={handleTradeReady}
              onCancel={handleCancelPreTrade}
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderRisk = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Risk Management Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Account Risk</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Account Balance:</span>
                <span className="text-white">$10,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Risk per Trade:</span>
                <span className="text-white">2%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Risk:</span>
                <span className="text-white">$200</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Position Sizing</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Current Exposure:</span>
                <span className="text-white">15%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Exposure:</span>
                <span className="text-white">30%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Available:</span>
                <span className="text-green-400">15%</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-2">Risk Status</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Risk Level:</span>
                <span className="text-green-400">Low</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Drawdown:</span>
                <span className="text-white">-2.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status:</span>
                <span className="text-green-400">Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Risk Rules</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Never risk more than 2% per trade</span>
          </div>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Maximum 5 open positions at once</span>
          </div>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Stop trading after 3 consecutive losses</span>
          </div>
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <span className="text-gray-300">Daily loss limit: 4% of account</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Performance Reports</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-4">Weekly Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Trades:</span>
                <span className="text-white">{trades.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Win Rate:</span>
                <span className="text-white">{winRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Net P&L:</span>
                <span className={totalPnL >= 0 ? 'text-green-400' : 'text-red-400'}>
                  ${totalPnL.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Best Trade:</span>
                <span className="text-green-400">+$137.00</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="font-semibold text-white mb-4">Monthly Analysis</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Monthly Return:</span>
                <span className="text-green-400">+1.37%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Max Drawdown:</span>
                <span className="text-white">-2.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Sharpe Ratio:</span>
                <span className="text-white">1.42</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profit Factor:</span>
                <span className="text-white">1.67</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Weekly Review Template</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              What worked well this week?
            </label>
            <textarea
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              rows={3}
              placeholder="Analyze successful trades and strategies..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              What could be improved?
            </label>
            <textarea
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              rows={3}
              placeholder="Identify areas for improvement..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Action items for next week:
            </label>
            <textarea
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              rows={3}
              placeholder="Set specific goals and actions..."
            />
          </div>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'preparation', label: 'Preparation', icon: Calendar },
    { id: 'trades', label: 'Trades', icon: TrendingUp },
    { id: 'risk', label: 'Risk', icon: Shield },
    { id: 'reports', label: 'Reports', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl font-bold text-white">Trading Management System</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-400">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center space-x-2">
                <Save className="w-4 h-4 text-green-400" />
                <span className="text-xs text-gray-400">
                  {lastSaved ? `Saved: ${new Date(lastSaved).toLocaleTimeString()}` : 'Not saved'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleExportData}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
                <label className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors cursor-pointer">
                  <Upload className="w-3 h-3" />
                  <span>Import</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={() => setShowDataManager(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                >
                  <Database className="w-3 h-3" />
                  <span>Database</span>
                </button>
                <button
                  onClick={handleClearData}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Weekly Calendar */}
        {renderWeeklyCalendar()}

        {/* Navigation Tabs */}
        <div className="bg-gray-800 rounded-lg p-2 mb-6">
          <nav className="flex space-x-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-yellow-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'preparation' && renderPreparation()}
          {activeTab === 'trades' && renderTrades()}
          {activeTab === 'risk' && renderRisk()}
          {activeTab === 'reports' && renderReports()}
        </div>
      </main>

      {/* Data Manager Modal */}
      {showDataManager && (
        <DataManager onClose={() => setShowDataManager(false)} />
      )}
    </div>
  );
}

export default App;