import React, { useState } from 'react';
import { Calendar, Target, AlertTriangle, DollarSign, TrendingUp, Clock, CheckCircle, X, Plus, Bell } from 'lucide-react';
import { TechnicalZone } from './TechnicalAnalysis';
import { EconomicEvent } from './EconomicCalendar';

export interface PlannedEntry {
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
}

export interface WeeklyScenario {
  id: string;
  name: string;
  description: string;
  probability: 'high' | 'medium' | 'low';
  impact: 'bullish' | 'bearish' | 'neutral';
}

export interface TradingDay {
  day: string;
  date: string;
  events: EconomicEvent[];
  tradeable: boolean;
  notes: string;
}

export interface WeeklyAlert {
  id: string;
  zoneId: string;
  zoneName: string;
  price: number;
  type: 'above' | 'below';
  description: string;
  active: boolean;
}

interface WeeklyPlanningProps {
  technicalZones: TechnicalZone[];
  economicEvents: EconomicEvent[];
  plannedEntries: PlannedEntry[];
  onPlannedEntriesChange: (entries: PlannedEntry[]) => void;
  onComplete: () => void;
}

const WeeklyPlanning: React.FC<WeeklyPlanningProps> = ({ 
  technicalZones, 
  economicEvents, 
  plannedEntries,
  onPlannedEntriesChange,
  onComplete 
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [weeklyExpectations, setWeeklyExpectations] = useState('');
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [riskRatio, setRiskRatio] = useState(2);
  const [maxLoss, setMaxLoss] = useState(0);
  const [tradingDays, setTradingDays] = useState<TradingDay[]>([]);
  const [alerts, setAlerts] = useState<WeeklyAlert[]>([]);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);

  const [newEntry, setNewEntry] = useState({
    zoneId: '',
    entryLevel: 0,
    takeProfit: 0,
    stopLoss: 0,
    plannedEntries: 1,
    notes: ''
  });

  const [newAlert, setNewAlert] = useState<{
    zoneId: string;
    price: number;
    type: 'above' | 'below';
    description: string;
  }>({
    zoneId: '',
    price: 0,
    type: 'above',
    description: ''
  });

  const planningSteps = [
    {
      id: 1,
      title: 'Zone Selection',
      description: 'Select zones you are waiting for',
      icon: Target
    },
    {
      id: 2,
      title: 'Entry Planning',
      description: 'Plan your entries and exits',
      icon: TrendingUp
    },
    {
      id: 3,
      title: 'Risk Management',
      description: 'Set risk parameters',
      icon: AlertTriangle
    },
    {
      id: 4,
      title: 'Scenarios & Expectations',
      description: 'Define scenarios and expectations',
      icon: Calendar
    },
    {
      id: 5,
      title: 'Trading Days & Alerts',
      description: 'Set trading days and alerts',
      icon: Bell
    }
  ];

  const scenarioOptions = [
    {
      id: 'breakout_bullish',
      name: 'Bullish Breakout',
      description: 'Price breaks above resistance with strong momentum',
      probability: 'medium' as const,
      impact: 'bullish' as const
    },
    {
      id: 'breakout_bearish',
      name: 'Bearish Breakout',
      description: 'Price breaks below support with strong momentum',
      probability: 'medium' as const,
      impact: 'bearish' as const
    },
    {
      id: 'reversal_bullish',
      name: 'Bullish Reversal',
      description: 'Price reverses from support with bullish signals',
      probability: 'high' as const,
      impact: 'bullish' as const
    },
    {
      id: 'reversal_bearish',
      name: 'Bearish Reversal',
      description: 'Price reverses from resistance with bearish signals',
      probability: 'high' as const,
      impact: 'bearish' as const
    },
    {
      id: 'range_bound',
      name: 'Range Bound',
      description: 'Price moves within established support/resistance',
      probability: 'medium' as const,
      impact: 'neutral' as const
    },
    {
      id: 'consolidation',
      name: 'Consolidation',
      description: 'Price consolidates before next move',
      probability: 'low' as const,
      impact: 'neutral' as const
    }
  ];

  const expectationOptions = [
    'Strong bullish momentum expected',
    'Bearish pressure likely to continue',
    'Sideways consolidation expected',
    'Volatile week with multiple opportunities',
    'Conservative approach due to high impact events',
    'Aggressive trading with clear trend direction',
    'Wait and see approach recommended',
    'Multiple setups across different timeframes'
  ];

  // Initialize trading days based on economic events
  React.useEffect(() => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay() + 1);

    const tradingDaysData = days.map((day, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = economicEvents.filter(event => event.date === dateStr);
      
      return {
        day,
        date: dateStr,
        events: dayEvents,
        tradeable: dayEvents.length === 0 || dayEvents.every(e => e.importance !== 'high'),
        notes: ''
      };
    });

    setTradingDays(tradingDaysData);
  }, [economicEvents]);

  const handleZoneSelection = (zoneId: string) => {
    setSelectedZones(prev => 
      prev.includes(zoneId) 
        ? prev.filter(id => id !== zoneId)
        : [...prev, zoneId]
    );
  };

  const handleAddEntry = () => {
    if (newEntry.zoneId && newEntry.entryLevel && newEntry.takeProfit) {
      const zone = technicalZones.find(z => z.id === newEntry.zoneId);
      if (zone) {
        const entry: PlannedEntry = {
          id: Date.now().toString(),
          zoneId: newEntry.zoneId,
          zoneName: zone.name,
          zoneType: zone.type,
          entryLevel: newEntry.entryLevel,
          takeProfit: newEntry.takeProfit,
          stopLoss: newEntry.stopLoss,
          riskRatio: newEntry.takeProfit && newEntry.stopLoss 
            ? Math.abs((newEntry.takeProfit - newEntry.entryLevel) / (newEntry.entryLevel - newEntry.stopLoss))
            : 0,
          plannedEntries: newEntry.plannedEntries,
          notes: newEntry.notes
        };
        onPlannedEntriesChange([...plannedEntries, entry]);
        setNewEntry({
          zoneId: '',
          entryLevel: 0,
          takeProfit: 0,
          stopLoss: 0,
          plannedEntries: 1,
          notes: ''
        });
        setShowAddEntry(false);
      }
    }
  };

  const handleAddAlert = () => {
    if (newAlert.zoneId && newAlert.price) {
      const zone = technicalZones.find(z => z.id === newAlert.zoneId);
      if (zone) {
        const alert: WeeklyAlert = {
          id: Date.now().toString(),
          zoneId: newAlert.zoneId,
          zoneName: zone.name,
          price: newAlert.price,
          type: newAlert.type,
          description: newAlert.description,
          active: true
        };
        setAlerts([...alerts, alert]);
        setNewAlert({
          zoneId: '',
          price: 0,
          type: 'above',
          description: ''
        });
        setShowAddAlert(false);
      }
    }
  };

  const removeEntry = (id: string) => {
    onPlannedEntriesChange(plannedEntries.filter(entry => entry.id !== id));
  };

  const removeAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, active: !alert.active } : alert
    ));
  };

  const getZoneColor = (type: string) => {
    const colors = {
      support: 'bg-green-900/20 border-green-500 text-green-400',
      resistance: 'bg-red-900/20 border-red-500 text-red-400',
      demand: 'bg-blue-900/20 border-blue-500 text-blue-400',
      supply: 'bg-orange-900/20 border-orange-500 text-orange-400',
      golden_zone: 'bg-yellow-900/20 border-yellow-500 text-yellow-400',
      order_block: 'bg-purple-900/20 border-purple-500 text-purple-400',
      fvg: 'bg-cyan-900/20 border-cyan-500 text-cyan-400',
      liquidity: 'bg-pink-900/20 border-pink-500 text-pink-400',
      broken_resistance: 'bg-gray-900/20 border-gray-500 text-gray-400',
      hvn: 'bg-indigo-900/20 border-indigo-500 text-indigo-400',
      multiple_nodes: 'bg-teal-900/20 border-teal-500 text-teal-400',
      blue_nodes: 'bg-blue-900/20 border-blue-500 text-blue-400',
      yellow_clusters: 'bg-yellow-900/20 border-yellow-500 text-yellow-400',
      unfinished_business: 'bg-red-900/20 border-red-500 text-red-400'
    };
    return colors[type as keyof typeof colors] || 'bg-gray-900/20 border-gray-500 text-gray-400';
  };

  const renderZoneSelection = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Select Zones You Are Waiting For</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {technicalZones.map(zone => (
            <div
              key={zone.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedZones.includes(zone.id)
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-700'
              }`}
              onClick={() => handleZoneSelection(zone.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white">{zone.name}</h4>
                  <p className="text-sm text-gray-400">{zone.type.replace('_', ' ')}</p>
                  <p className="text-sm text-gray-300">
                    {zone.startPrice} - {zone.endPrice}
                  </p>
                </div>
                <div className={`p-2 rounded ${getZoneColor(zone.type)}`}>
                  <CheckCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-3">Selected Zones Summary</h4>
        <div className="space-y-2">
          {selectedZones.length === 0 ? (
            <p className="text-gray-400">No zones selected yet</p>
          ) : (
            selectedZones.map(zoneId => {
              const zone = technicalZones.find(z => z.id === zoneId);
              return zone ? (
                <div key={zoneId} className="flex justify-between items-center p-2 bg-gray-700 rounded">
                  <span className="text-white">{zone.name}</span>
                  <span className="text-gray-400">{zone.startPrice} - {zone.endPrice}</span>
                </div>
              ) : null;
            })
          )}
        </div>
      </div>
    </div>
  );

  const renderEntryPlanning = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Planned Entries</h3>
          <button
            onClick={() => setShowAddEntry(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Entry</span>
          </button>
        </div>

        {/* Add Entry Modal */}
        {showAddEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <h4 className="text-lg font-bold text-white mb-4">Add Planned Entry</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Zone</label>
                  <select
                    value={newEntry.zoneId}
                    onChange={(e) => setNewEntry({ ...newEntry, zoneId: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="">Select a zone</option>
                    {technicalZones.filter(z => selectedZones.includes(z.id)).map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Planned Entries</label>
                  <input
                    type="number"
                    min="1"
                    value={newEntry.plannedEntries}
                    onChange={(e) => setNewEntry({ ...newEntry, plannedEntries: parseInt(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Entry Level</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEntry.entryLevel}
                    onChange={(e) => setNewEntry({ ...newEntry, entryLevel: parseFloat(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Take Profit</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEntry.takeProfit}
                    onChange={(e) => setNewEntry({ ...newEntry, takeProfit: parseFloat(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Stop Loss</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newEntry.stopLoss}
                    onChange={(e) => setNewEntry({ ...newEntry, stopLoss: parseFloat(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-400 mb-2">Notes</label>
                  <textarea
                    value={newEntry.notes}
                    onChange={(e) => setNewEntry({ ...newEntry, notes: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    rows={3}
                    placeholder="Entry strategy notes..."
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddEntry}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Entry
                </button>
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Planned Entries List */}
        <div className="space-y-4">
          {plannedEntries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No planned entries yet</p>
              <p className="text-sm">Add entries for your selected zones</p>
            </div>
          ) : (
            plannedEntries.map(entry => (
              <div key={entry.id} className="border rounded-lg p-4 bg-gray-700">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{entry.zoneName}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 text-sm">
                      <div>
                        <span className="text-gray-400">Entry:</span>
                        <div className="font-medium text-white">{entry.entryLevel}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">TP:</span>
                        <div className="font-medium text-green-400">{entry.takeProfit}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">SL:</span>
                        <div className="font-medium text-red-400">{entry.stopLoss}</div>
                      </div>
                      <div>
                        <span className="text-gray-400">R:R:</span>
                        <div className="font-medium text-blue-400">{entry.riskRatio.toFixed(2)}</div>
                      </div>
                    </div>
                    {entry.notes && (
                      <p className="text-sm text-gray-300 mt-2">{entry.notes}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="text-red-400 hover:text-red-300 ml-4"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  const renderRiskManagement = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Risk Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Risk Ratio Target</label>
            <select
              value={riskRatio}
              onChange={(e) => setRiskRatio(parseFloat(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
            >
              <option value={1}>1:1</option>
              <option value={1.5}>1:1.5</option>
              <option value={2}>1:2</option>
              <option value={2.5}>1:2.5</option>
              <option value={3}>1:3</option>
              <option value={4}>1:4</option>
              <option value={5}>1:5</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Maximum Acceptable Loss ($)</label>
            <input
              type="number"
              value={maxLoss}
              onChange={(e) => setMaxLoss(parseFloat(e.target.value))}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold text-white mb-3">Risk Summary</h4>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Target Risk Ratio:</span>
            <span className="text-white">1:{riskRatio}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Max Loss:</span>
            <span className="text-red-400">${maxLoss.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Total Planned Entries:</span>
            <span className="text-white">{plannedEntries.reduce((sum, entry) => sum + entry.plannedEntries, 0)}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderScenariosAndExpectations = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Weekly Expectations</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Select Expectations</label>
            <select
              value={weeklyExpectations}
              onChange={(e) => setWeeklyExpectations(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
            >
              <option value="">Choose your weekly expectations</option>
              {expectationOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
          </div>
          {weeklyExpectations && (
            <div className="p-3 bg-blue-900/20 border border-blue-500 rounded-lg">
              <p className="text-blue-400">{weeklyExpectations}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Possible Scenarios</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {scenarioOptions.map(scenario => (
            <div
              key={scenario.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                selectedScenarios.includes(scenario.id)
                  ? 'border-blue-500 bg-blue-900/20'
                  : 'border-gray-600 bg-gray-700'
              }`}
              onClick={() => setSelectedScenarios(prev => 
                prev.includes(scenario.id)
                  ? prev.filter(id => id !== scenario.id)
                  : [...prev, scenario.id]
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-white">{scenario.name}</h4>
                  <p className="text-sm text-gray-400">{scenario.description}</p>
                </div>
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded text-xs ${
                    scenario.probability === 'high' ? 'bg-green-900/20 text-green-400' :
                    scenario.probability === 'medium' ? 'bg-yellow-900/20 text-yellow-400' :
                    'bg-red-900/20 text-red-400'
                  }`}>
                    {scenario.probability}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    scenario.impact === 'bullish' ? 'bg-green-900/20 text-green-400' :
                    scenario.impact === 'bearish' ? 'bg-red-900/20 text-red-400' :
                    'bg-gray-900/20 text-gray-400'
                  }`}>
                    {scenario.impact}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTradingDaysAndAlerts = () => (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Trading Days</h3>
        <div className="space-y-4">
          {tradingDays.map(day => (
            <div key={day.day} className="border rounded-lg p-4 bg-gray-700">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={day.tradeable}
                      onChange={(e) => setTradingDays(prev => 
                        prev.map(d => d.day === day.day ? { ...d, tradeable: e.target.checked } : d)
                      )}
                      className="w-4 h-4 text-blue-600 bg-gray-600 border-gray-500 rounded"
                    />
                    <h4 className="font-semibold text-white">{day.day}</h4>
                    <span className="text-sm text-gray-400">{day.date}</span>
                  </div>
                  {day.events.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-400">Events:</p>
                      {day.events.map(event => (
                        <div key={event.id} className="flex items-center space-x-2 mt-1">
                          <span className={`w-2 h-2 rounded-full ${
                            event.importance === 'high' ? 'bg-red-400' :
                            event.importance === 'medium' ? 'bg-yellow-400' :
                            'bg-green-400'
                          }`}></span>
                          <span className="text-sm text-gray-300">{event.name}</span>
                          <span className="text-xs text-gray-400">{event.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  day.tradeable ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                }`}>
                  {day.tradeable ? 'Tradeable' : 'Avoid Trading'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Price Alerts</h3>
          <button
            onClick={() => setShowAddAlert(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Alert</span>
          </button>
        </div>

        {/* Add Alert Modal */}
        {showAddAlert && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
              <h4 className="text-lg font-bold text-white mb-4">Add Price Alert</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Zone</label>
                  <select
                    value={newAlert.zoneId}
                    onChange={(e) => setNewAlert({ ...newAlert, zoneId: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="">Select a zone</option>
                    {technicalZones.map(zone => (
                      <option key={zone.id} value={zone.id}>{zone.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Alert Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newAlert.price}
                    onChange={(e) => setNewAlert({ ...newAlert, price: parseFloat(e.target.value) })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Alert Type</label>
                  <select
                    value={newAlert.type}
                    onChange={(e) => setNewAlert({ ...newAlert, type: e.target.value as 'above' | 'below' })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    <option value="above">Price Above</option>
                    <option value="below">Price Below</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Description</label>
                  <input
                    type="text"
                    value={newAlert.description}
                    onChange={(e) => setNewAlert({ ...newAlert, description: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                    placeholder="Alert description"
                  />
                </div>
              </div>
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddAlert}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Alert
                </button>
                <button
                  onClick={() => setShowAddAlert(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-6 text-gray-400">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No alerts set</p>
            </div>
          ) : (
            alerts.map(alert => (
              <div key={alert.id} className="flex justify-between items-center p-3 bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-semibold text-white">{alert.zoneName}</h4>
                  <p className="text-sm text-gray-400">
                    {alert.type === 'above' ? 'Above' : 'Below'} {alert.price}
                  </p>
                  {alert.description && (
                    <p className="text-xs text-gray-500">{alert.description}</p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`px-2 py-1 rounded text-xs ${
                      alert.active 
                        ? 'bg-green-900/20 text-green-400' 
                        : 'bg-gray-900/20 text-gray-400'
                    }`}
                  >
                    {alert.active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Weekly Planning</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Step {activeStep} of {planningSteps.length}</span>
            <div className="w-32 bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(activeStep / planningSteps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {planningSteps.map((step, index) => {
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
        {activeStep === 1 && renderZoneSelection()}
        {activeStep === 2 && renderEntryPlanning()}
        {activeStep === 3 && renderRiskManagement()}
        {activeStep === 4 && renderScenariosAndExpectations()}
        {activeStep === 5 && renderTradingDaysAndAlerts()}
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
        
        {activeStep === planningSteps.length ? (
          <button
            onClick={onComplete}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Complete Planning
          </button>
        ) : (
          <button
            onClick={() => setActiveStep(Math.min(planningSteps.length, activeStep + 1))}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
};

export default WeeklyPlanning; 