import React, { useState } from 'react';
import { CheckCircle, X, AlertTriangle, TrendingUp, TrendingDown, Activity, BarChart3, Target, Zap, Eye } from 'lucide-react';
import { TechnicalZone } from './TechnicalAnalysis';
import { PlannedEntry } from './WeeklyPlanning';

export interface TradeConfirmation {
  id: string;
  category: 'vwap' | 'rsi' | 'delta' | 'mz_30m' | 'mz_4h' | 'hindy' | 'footprint';
  name: string;
  description: string;
  completed: boolean;
  value?: string;
  notes?: string;
  importance: 'critical' | 'important' | 'optional';
}

export interface PreTradeData {
  confirmations: TradeConfirmation[];
  selectedZone?: TechnicalZone;
  selectedPlannedEntry?: PlannedEntry;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskAmount: number;
  riskRatio: number;
  tradeType: 'buy' | 'sell';
  notes: string;
  timestamp: string;
}

interface PreTradeChecklistProps {
  technicalZones: TechnicalZone[];
  plannedEntries: PlannedEntry[];
  weeklyRiskBudget: number;
  weeklyRiskUsed: number;
  onTradeReady: (tradeData: PreTradeData) => void;
  onCancel: () => void;
}

const PreTradeChecklist: React.FC<PreTradeChecklistProps> = ({
  technicalZones,
  plannedEntries,
  weeklyRiskBudget,
  weeklyRiskUsed,
  onTradeReady,
  onCancel
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [confirmations, setConfirmations] = useState<TradeConfirmation[]>([
    // VWAP Confirmations
    {
      id: 'vwap_1',
      category: 'vwap',
      name: 'VWAP (30-minute)',
      description: 'Price is above/below VWAP on 30-minute timeframe',
      completed: false,
      importance: 'critical'
    },
    
    // RSI Divergence Confirmations
    {
      id: 'rsi_1',
      category: 'rsi',
      name: 'RSI Divergence (30-minute)',
      description: 'RSI shows bullish/bearish divergence on 30-minute timeframe',
      completed: false,
      importance: 'important'
    },
    
    // Cumulative Delta Divergence
    {
      id: 'delta_1',
      category: 'delta',
      name: 'Cumulative Delta Divergence (30-minute)',
      description: 'Cumulative delta shows divergence from price action',
      completed: false,
      importance: 'important'
    },
    
    // 30-minute MZ Checks
    {
      id: 'mz_30m_1',
      category: 'mz_30m',
      name: '30M MZ - Wick',
      description: 'Check wick formation on 30-minute MZ',
      completed: false,
      importance: 'important'
    },
    {
      id: 'mz_30m_2',
      category: 'mz_30m',
      name: '30M MZ - MZ Level',
      description: 'Confirm MZ level on 30-minute timeframe',
      completed: false,
      importance: 'important'
    },
    {
      id: 'mz_30m_3',
      category: 'mz_30m',
      name: '30M MZ - 135',
      description: 'Check 135 level on 30-minute MZ',
      completed: false,
      importance: 'important'
    },
    
    // 4H MZ Checks
    {
      id: 'mz_4h_1',
      category: 'mz_4h',
      name: '4H MZ - Wick',
      description: 'Check wick formation on 4H MZ',
      completed: false,
      importance: 'important'
    },
    {
      id: 'mz_4h_2',
      category: 'mz_4h',
      name: '4H MZ - MZ Level',
      description: 'Confirm MZ level on 4H timeframe',
      completed: false,
      importance: 'important'
    },
    {
      id: 'mz_4h_3',
      category: 'mz_4h',
      name: '4H MZ - 135',
      description: 'Check 135 level on 4H MZ',
      completed: false,
      importance: 'important'
    },
    
    // Hindy Entry Confirmations
    {
      id: 'hindy_1',
      category: 'hindy',
      name: 'Hindy Entry Confirmations',
      description: 'All Hindy entry criteria are met',
      completed: false,
      importance: 'critical'
    },
    
    // Footprint Confirmations
    {
      id: 'footprint_1',
      category: 'footprint',
      name: 'Entry Candle Delta - Green',
      description: 'Entry candle Delta turns green',
      completed: false,
      importance: 'critical'
    },
    {
      id: 'footprint_2',
      category: 'footprint',
      name: 'Entry Candle Delta - Smaller Value',
      description: 'Entry candle Delta value is smaller than the last candle\'s value',
      completed: false,
      importance: 'important'
    },
    {
      id: 'footprint_3',
      category: 'footprint',
      name: 'Last Candle Analysis',
      description: 'Last candle before entry: Red/Green with Red/Green Delta',
      completed: false,
      importance: 'important'
    },
    {
      id: 'footprint_4',
      category: 'footprint',
      name: 'Big Numbers in Ask (Last 3 Candles)',
      description: 'Big numbers in the Ask of the last candle before entry (within last 3 candles)',
      completed: false,
      importance: 'optional'
    },
    {
      id: 'footprint_5',
      category: 'footprint',
      name: 'Blue Color in Ask',
      description: 'Blue color in the Ask of the last candle before entry',
      completed: false,
      importance: 'optional'
    },
    {
      id: 'footprint_6',
      category: 'footprint',
      name: 'HV Below Entry Candle',
      description: 'HV appears below the entry candle',
      completed: false,
      importance: 'important'
    },
    {
      id: 'footprint_7',
      category: 'footprint',
      name: 'Big Numbers in Both Bid/Ask',
      description: 'Big numbers in both Bid and Ask of the entry candle (not seen in last 3 candles)',
      completed: false,
      importance: 'optional'
    },
    {
      id: 'footprint_8',
      category: 'footprint',
      name: 'Big Numbers in Bid',
      description: 'Big numbers in the Bid of the entry candle (not seen in last 3 candles)',
      completed: false,
      importance: 'optional'
    },
    {
      id: 'footprint_9',
      category: 'footprint',
      name: 'Blue Color in Bid',
      description: 'Blue color in the Bid of the entry candle (not seen in last 3 candles)',
      completed: false,
      importance: 'optional'
    },
    {
      id: 'footprint_10',
      category: 'footprint',
      name: 'Pink Color in Bid',
      description: 'Pink color in the Bid of the entry candle',
      completed: false,
      importance: 'optional'
    }
  ]);

  const [selectedZone, setSelectedZone] = useState<TechnicalZone | undefined>();
  const [selectedPlannedEntry, setSelectedPlannedEntry] = useState<PlannedEntry | undefined>();
  const [entryPrice, setEntryPrice] = useState(0);
  const [stopLoss, setStopLoss] = useState(0);
  const [takeProfit, setTakeProfit] = useState(0);
  const [positionSize, setPositionSize] = useState(0);
  const [riskAmount, setRiskAmount] = useState(0);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [notes, setNotes] = useState('');

  const steps = [
    {
      id: 1,
      title: 'Technical Confirmations',
      description: 'Check all technical indicators and confirmations',
      icon: BarChart3
    },
    {
      id: 2,
      title: 'Zone Selection',
      description: 'Select the zone this trade is based on',
      icon: Target
    },
    {
      id: 3,
      title: 'Trade Setup',
      description: 'Set entry, exit, and position size',
      icon: TrendingUp
    },
    {
      id: 4,
      title: 'Risk Validation',
      description: 'Validate against risk management rules',
      icon: AlertTriangle
    }
  ];

  const toggleConfirmation = (id: string) => {
    setConfirmations(prev => 
      prev.map(conf => 
        conf.id === id ? { ...conf, completed: !conf.completed } : conf
      )
    );
  };

  const getConfirmationCategory = (category: string) => {
    const categories = {
      vwap: 'VWAP Analysis',
      rsi: 'RSI Divergence',
      delta: 'Cumulative Delta',
      mz_30m: '30-Minute MZ',
      mz_4h: '4-Hour MZ',
      hindy: 'Hindy Entry',
      footprint: 'Footprint Analysis'
    };
    return categories[category as keyof typeof categories] || category;
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'text-red-400 bg-red-900/20 border-red-500';
      case 'important': return 'text-yellow-400 bg-yellow-900/20 border-yellow-500';
      case 'optional': return 'text-blue-400 bg-blue-900/20 border-blue-500';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-500';
    }
  };

  const getConfirmationProgress = () => {
    const critical = confirmations.filter(c => c.importance === 'critical');
    const important = confirmations.filter(c => c.importance === 'important');
    const optional = confirmations.filter(c => c.importance === 'optional');

    const criticalCompleted = critical.filter(c => c.completed).length;
    const importantCompleted = important.filter(c => c.completed).length;
    const optionalCompleted = optional.filter(c => c.completed).length;

    return {
      critical: { total: critical.length, completed: criticalCompleted },
      important: { total: important.length, completed: importantCompleted },
      optional: { total: optional.length, completed: optionalCompleted }
    };
  };

  const canProceedToTrade = () => {
    const progress = getConfirmationProgress();
    const criticalComplete = progress.critical.completed === progress.critical.total;
    const importantComplete = progress.important.completed >= Math.ceil(progress.important.total * 0.7);
    const riskValid = riskAmount <= (weeklyRiskBudget - weeklyRiskUsed);
    
    return criticalComplete && importantComplete && riskValid && selectedZone && entryPrice > 0;
  };

  const calculateRiskRatio = () => {
    if (entryPrice && stopLoss && takeProfit) {
      const risk = Math.abs(entryPrice - stopLoss);
      const reward = Math.abs(takeProfit - entryPrice);
      return reward / risk;
    }
    return 0;
  };

  const renderTechnicalConfirmations = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Technical Confirmations Checklist</h3>
        
        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {Object.entries(getConfirmationProgress()).map(([level, data]) => (
            <div key={level} className="bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-white capitalize mb-2">{level} Confirmations</h4>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Progress</span>
                <span className="text-white">{data.completed}/{data.total}</span>
              </div>
              <div className="w-full bg-gray-600 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    level === 'critical' ? 'bg-red-500' :
                    level === 'important' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${data.total > 0 ? (data.completed / data.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Confirmations by Category */}
        <div className="space-y-6">
          {Object.entries(
            confirmations.reduce((acc, conf) => {
              if (!acc[conf.category]) acc[conf.category] = [];
              acc[conf.category].push(conf);
              return acc;
            }, {} as Record<string, TradeConfirmation[]>)
          ).map(([category, categoryConfirmations]) => (
            <div key={category} className="border border-gray-600 rounded-lg p-4">
              <h4 className="font-semibold text-white mb-3 flex items-center">
                <Activity className="w-4 h-4 mr-2" />
                {getConfirmationCategory(category)}
              </h4>
              <div className="space-y-2">
                {categoryConfirmations.map(confirmation => (
                  <div key={confirmation.id} className="flex items-center space-x-3 p-2 bg-gray-700 rounded">
                    <button
                      onClick={() => toggleConfirmation(confirmation.id)}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                        confirmation.completed 
                          ? 'bg-green-500 border-green-500' 
                          : 'border-gray-400 hover:border-green-400'
                      }`}
                    >
                      {confirmation.completed && <CheckCircle className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${confirmation.completed ? 'text-green-400 line-through' : 'text-gray-300'}`}>
                          {confirmation.name}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs border ${getImportanceColor(confirmation.importance)}`}>
                          {confirmation.importance}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{confirmation.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderZoneSelection = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Select Trading Zone</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Technical Zones */}
          <div>
            <h4 className="font-semibold text-white mb-3">Technical Zones</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {technicalZones.map(zone => (
                <div
                  key={zone.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedZone?.id === zone.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedZone(zone)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="font-medium text-white">{zone.name}</h5>
                      <p className="text-sm text-gray-400">{zone.type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-300">{zone.startPrice} - {zone.endPrice}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      zone.strength === 'strong' ? 'bg-green-900/20 text-green-400' :
                      zone.strength === 'medium' ? 'bg-yellow-900/20 text-yellow-400' :
                      'bg-red-900/20 text-red-400'
                    }`}>
                      {zone.strength}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Planned Entries */}
          <div>
            <h4 className="font-semibold text-white mb-3">Planned Entries</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {plannedEntries.map(entry => (
                <div
                  key={entry.id}
                  className={`border rounded-lg p-3 cursor-pointer transition-all ${
                    selectedPlannedEntry?.id === entry.id
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                  onClick={() => setSelectedPlannedEntry(entry)}
                >
                  <div>
                    <h5 className="font-medium text-white">{entry.zoneName}</h5>
                    <p className="text-sm text-gray-400">Entry: {entry.entryLevel}</p>
                    <p className="text-sm text-gray-300">TP: {entry.takeProfit} | SL: {entry.stopLoss}</p>
                    <p className="text-sm text-blue-400">R:R {entry.riskRatio.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedZone && (
          <div className="mt-4 p-4 bg-blue-900/20 border border-blue-500 rounded-lg">
            <h4 className="font-semibold text-blue-400 mb-2">Selected Zone</h4>
            <p className="text-white">{selectedZone.name}</p>
            <p className="text-sm text-gray-300">{selectedZone.notes}</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderTradeSetup = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Trade Setup</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Trade Direction</h4>
            <div className="flex space-x-3">
              <button
                onClick={() => setTradeType('buy')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  tradeType === 'buy'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span>Buy</span>
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  tradeType === 'sell'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                <TrendingDown className="w-4 h-4" />
                <span>Sell</span>
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3">Risk Management</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Weekly Risk Budget</label>
                <div className="text-white">${weeklyRiskBudget.toFixed(2)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Risk Used This Week</label>
                <div className="text-white">${weeklyRiskUsed.toFixed(2)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Available Risk</label>
                <div className="text-green-400">${(weeklyRiskBudget - weeklyRiskUsed).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Entry Price</label>
            <input
              type="number"
              step="0.01"
              value={entryPrice || ''}
              onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Stop Loss</label>
            <input
              type="number"
              step="0.01"
              value={stopLoss || ''}
              onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Take Profit</label>
            <input
              type="number"
              step="0.01"
              value={takeProfit || ''}
              onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Risk Amount ($)</label>
            <input
              type="number"
              step="0.01"
              value={riskAmount || ''}
              onChange={(e) => setRiskAmount(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Position Size</label>
            <input
              type="number"
              step="0.01"
              value={positionSize || ''}
              onChange={(e) => setPositionSize(parseFloat(e.target.value) || 0)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Risk:Reward Ratio</label>
            <div className="w-full bg-gray-700 text-white rounded-lg px-3 py-2">
              {calculateRiskRatio().toFixed(2)}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-400 mb-2">Trade Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
            rows={3}
            placeholder="Additional notes about this trade setup..."
          />
        </div>
      </div>
    </div>
  );

  const renderRiskValidation = () => {
    const progress = getConfirmationProgress();
    const criticalComplete = progress.critical.completed === progress.critical.total;
    const importantComplete = progress.important.completed >= Math.ceil(progress.important.total * 0.7);
    const riskValid = riskAmount <= (weeklyRiskBudget - weeklyRiskUsed);
    const riskRatioValid = calculateRiskRatio() >= 2;
    const setupComplete = selectedZone && entryPrice > 0 && stopLoss > 0 && takeProfit > 0;

    return (
      <div className="space-y-6">
        <div className="bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Risk Validation</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">Confirmation Status</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Critical Confirmations</span>
                  <span className={criticalComplete ? 'text-green-400' : 'text-red-400'}>
                    {progress.critical.completed}/{progress.critical.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Important Confirmations</span>
                  <span className={importantComplete ? 'text-green-400' : 'text-yellow-400'}>
                    {progress.important.completed}/{progress.important.total}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Risk Budget Valid</span>
                  <span className={riskValid ? 'text-green-400' : 'text-red-400'}>
                    {riskValid ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Risk:Reward ≥ 2:1</span>
                  <span className={riskRatioValid ? 'text-green-400' : 'text-red-400'}>
                    {riskRatioValid ? '✓' : '✗'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Trade Setup Complete</span>
                  <span className={setupComplete ? 'text-green-400' : 'text-red-400'}>
                    {setupComplete ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Trade Summary</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Trade Type:</span>
                  <span className={`font-medium ${tradeType === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                    {tradeType.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Entry Price:</span>
                  <span className="text-white">{entryPrice}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stop Loss:</span>
                  <span className="text-red-400">{stopLoss}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Take Profit:</span>
                  <span className="text-green-400">{takeProfit}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk Amount:</span>
                  <span className="text-red-400">${riskAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Risk:Reward:</span>
                  <span className="text-blue-400">{calculateRiskRatio().toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {canProceedToTrade() ? (
            <div className="mt-6 p-4 bg-green-900/20 border border-green-500 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-semibold">All conditions met! Ready to open trade.</span>
              </div>
            </div>
          ) : (
            <div className="mt-6 p-4 bg-red-900/20 border border-red-500 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-semibold">Trade conditions not met. Please review requirements.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleOpenTrade = () => {
    if (canProceedToTrade()) {
      const tradeData: PreTradeData = {
        confirmations,
        selectedZone,
        selectedPlannedEntry,
        entryPrice,
        stopLoss,
        takeProfit,
        positionSize,
        riskAmount,
        riskRatio: calculateRiskRatio(),
        tradeType,
        notes,
        timestamp: new Date().toISOString()
      };
      onTradeReady(tradeData);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Pre-Trade Checklist</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Step {activeStep} of {steps.length}</span>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(activeStep / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  activeStep >= step.id
                    ? 'border-blue-500 bg-blue-900/20'
                    : 'border-gray-600 bg-gray-700'
                }`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    activeStep >= step.id ? 'bg-blue-600' : 'bg-gray-600'
                  }`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{step.title}</h3>
                    <p className="text-xs text-gray-400">{step.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="transition-all duration-300">
        {activeStep === 1 && renderTechnicalConfirmations()}
        {activeStep === 2 && renderZoneSelection()}
        {activeStep === 3 && renderTradeSetup()}
        {activeStep === 4 && renderRiskValidation()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
          disabled={activeStep === 1}
          className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 disabled:text-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Previous
        </button>
        
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          
          {activeStep === steps.length ? (
            <button
              onClick={handleOpenTrade}
              disabled={!canProceedToTrade()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:text-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Open Trade</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreTradeChecklist; 