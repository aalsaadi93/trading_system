import React, { useState, useEffect } from 'react';
import { Plus, Calendar, TrendingUp, Clock, Star, X, Building, RefreshCw, Download, ExternalLink } from 'lucide-react';
import { fetchEconomicEvents, getMockEconomicEvents } from '../services/economicApi';
import { addDays, startOfWeek, format } from 'date-fns';

export interface EconomicEvent {
  id: string;
  name: string;
  country: string;
  date: string;
  time: string;
  importance: 'high' | 'medium' | 'low';
  forecast?: string;
  previous?: string;
  actual?: string;
  goldImpact: 'high' | 'medium' | 'low';
  category: 'monetary_policy' | 'employment' | 'inflation' | 'gdp' | 'other';
  link?: string;
}

interface EconomicCalendarProps {
  events: EconomicEvent[];
  onAddEvent: (event: Omit<EconomicEvent, 'id'> | Omit<EconomicEvent, 'id'>[]) => void;
  onRemoveEvent: (id: string) => void;
  onUpdateEvent: (id: string, updates: Partial<EconomicEvent>) => void;
}

const EconomicCalendar: React.FC<EconomicCalendarProps> = ({ 
  events, 
  onAddEvent, 
  onRemoveEvent, 
  onUpdateEvent 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('');
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState<{
    name: string;
    country: string;
    date: string;
    time: string;
    importance: 'high' | 'medium' | 'low';
    forecast: string;
    previous: string;
    actual: string;
    goldImpact: 'high' | 'medium' | 'low';
    category: 'monetary_policy' | 'employment' | 'inflation' | 'gdp' | 'other';
  }>({
    name: '',
    country: 'US',
    date: '',
    time: '',
    importance: 'medium',
    forecast: '',
    previous: '',
    actual: '',
    goldImpact: 'medium',
    category: 'other'
  });
  const [selectedApi, setSelectedApi] = useState<'custom' | 'tradingeconomics' | 'rapidapi' | 'mock'>('custom');
  const [mode, setMode] = useState<'historical' | 'realtime'>('historical');
  const [weekStart, setWeekStart] = useState<Date>(startOfWeek(new Date()));
  const [customCurrency, setCustomCurrency] = useState('');
  const [customImportance, setCustomImportance] = useState('');
  const [customEvent, setCustomEvent] = useState('');

  const presetEvents = [
    {
      name: 'Federal Funds Rate Decision',
      country: 'US',
      importance: 'high' as const,
      goldImpact: 'high' as const,
      category: 'monetary_policy' as const
    },
    {
      name: 'FOMC Statement',
      country: 'US',
      importance: 'high' as const,
      goldImpact: 'high' as const,
      category: 'monetary_policy' as const
    },
    {
      name: 'Non-Farm Employment Change',
      country: 'US',
      importance: 'high' as const,
      goldImpact: 'high' as const,
      category: 'employment' as const
    },
    {
      name: 'Unemployment Rate',
      country: 'US',
      importance: 'high' as const,
      goldImpact: 'medium' as const,
      category: 'employment' as const
    },
    {
      name: 'Average Hourly Earnings',
      country: 'US',
      importance: 'medium' as const,
      goldImpact: 'medium' as const,
      category: 'employment' as const
    },
    {
      name: 'Consumer Price Index (CPI)',
      country: 'US',
      importance: 'high' as const,
      goldImpact: 'high' as const,
      category: 'inflation' as const
    },
    {
      name: 'Core CPI',
      country: 'US',
      importance: 'high' as const,
      goldImpact: 'high' as const,
      category: 'inflation' as const
    },
    {
      name: 'GDP Growth Rate (QoQ)',
      country: 'US',
      importance: 'high' as const,
      goldImpact: 'medium' as const,
      category: 'gdp' as const
    },
    {
      name: 'FOMC Meeting Minutes',
      country: 'US',
      importance: 'medium' as const,
      goldImpact: 'medium' as const,
      category: 'monetary_policy' as const
    },
    {
      name: 'Producer Price Index (PPI)',
      country: 'US',
      importance: 'medium' as const,
      goldImpact: 'medium' as const,
      category: 'inflation' as const
    }
  ];

  const handlePresetSelect = (preset: typeof presetEvents[0]) => {
    setNewEvent({
      ...newEvent,
      name: preset.name,
      country: preset.country,
      importance: preset.importance,
      goldImpact: preset.goldImpact,
      category: preset.category
    });
    setSelectedPreset(preset.name);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.name && newEvent.date && newEvent.time) {
      onAddEvent(newEvent);
      setNewEvent({
        name: '',
        country: 'US',
        date: '',
        time: '',
        importance: 'medium',
        forecast: '',
        previous: '',
        actual: '',
        goldImpact: 'medium',
        category: 'other'
      });
      setSelectedPreset('');
      setShowAddForm(false);
    }
  };

  const getWeekDays = () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const handleFetchFromApi = async () => {
    setIsLoadingApi(true);
    setApiError(null);
    try {
      let apiEvents = [];
      if (selectedApi === 'custom') {
        apiEvents = await fetchEconomicEvents('custom', {
          currency: customCurrency,
          importance: customImportance,
          event: customEvent
        });
      } else if (selectedApi === 'rapidapi') {
        const days = getWeekDays();
        let allEvents: any[] = [];
        for (const day of days) {
          const dayEvents = await fetchEconomicEvents('rapidapi');
          allEvents = allEvents.concat(dayEvents);
        }
        apiEvents = allEvents;
      } else if (selectedApi === 'tradingeconomics') {
        apiEvents = await fetchEconomicEvents('tradingeconomics');
      } else {
        apiEvents = getMockEconomicEvents();
      }
      if (apiEvents.length > 0) {
        onAddEvent(apiEvents);
      } else {
        setApiError('No events found for the selected API.');
      }
    } catch (error) {
      setApiError('Failed to fetch economic calendar from API.');
    } finally {
      setIsLoadingApi(false);
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'text-red-400 bg-red-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getGoldImpactStars = (impact: string) => {
    const count = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < count ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
      />
    ));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'monetary_policy': return <Building className="w-4 h-4" />;
      case 'employment': return <TrendingUp className="w-4 h-4" />;
      case 'inflation': return <TrendingUp className="w-4 h-4" />;
      case 'gdp': return <TrendingUp className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const isApiEvent = (eventId: string) => eventId.startsWith('api-') || eventId.startsWith('mock-') || eventId.startsWith('alpha-');

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(`${a.date} ${a.time}`);
    const dateB = new Date(`${b.date} ${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  // Currency dropdown options
  const currencyOptions = [
    '', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY'
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-400" />
          Economic Calendar
        </h3>
        <div className="flex space-x-2 items-center">
          {/* Week Selector */}
          <label className="text-gray-300 text-sm mr-2">Week of:</label>
          <input
            type="date"
            value={format(weekStart, 'yyyy-MM-dd')}
            onChange={e => setWeekStart(new Date(e.target.value))}
            className="bg-gray-700 text-white rounded px-3 py-2 mr-2"
            style={{ minWidth: 140 }}
          />
          <button
            onClick={() => setWeekStart(addDays(weekStart, -7))}
            className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
            title="Previous week"
          >&#8592;</button>
          <button
            onClick={() => setWeekStart(addDays(weekStart, 7))}
            className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
            title="Next week"
          >&#8594;</button>
          {/* Mode Toggle */}
          <select
            value={mode}
            onChange={e => setMode(e.target.value as any)}
            className="bg-gray-700 text-white rounded px-3 py-2 mr-2"
            style={{ minWidth: 120 }}
          >
            <option value="historical">Historical</option>
            <option value="realtime">Real-Time</option>
          </select>
          {/* Filter Bar - improved layout */}
          <div className="flex flex-row flex-wrap items-center gap-3 mb-4 w-full" style={{alignItems: 'center'}}>
            <select
              value={selectedApi}
              onChange={e => setSelectedApi(e.target.value as any)}
              className="bg-gray-700 text-white rounded px-3 py-2 h-10"
              style={{ minWidth: 210 }}
            >
              <option value="custom">Custom Economic Calendar (Local)</option>
              <option value="tradingeconomics">Trading Economics</option>
              <option value="rapidapi">RapidAPI Forex Factory</option>
              <option value="mock">Mock Data</option>
            </select>
            {selectedApi === 'custom' && (
              <>
                <select
                  value={customCurrency}
                  onChange={e => setCustomCurrency(e.target.value)}
                  className="bg-gray-700 text-white rounded px-3 py-2 h-10"
                  style={{ width: 130 }}
                >
                  <option value="">All Currencies</option>
                  {currencyOptions.filter(c => c).map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
                <select
                  value={customImportance}
                  onChange={e => setCustomImportance(e.target.value)}
                  className="bg-gray-700 text-white rounded px-3 py-2 h-10"
                  style={{ width: 130 }}
                >
                  <option value="">All Importance</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
                <input
                  type="text"
                  placeholder="Event Name (e.g. CPI)"
                  value={customEvent}
                  onChange={e => setCustomEvent(e.target.value)}
                  className="bg-gray-700 text-white rounded px-3 py-2 h-10"
                  style={{ width: 180 }}
                />
              </>
            )}
            <button
              onClick={handleFetchFromApi}
              disabled={isLoadingApi}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors h-10"
              style={{ minWidth: 130 }}
            >
              {isLoadingApi ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isLoadingApi ? 'Loading...' : 'Fetch Events'}</span>
            </button>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors h-10"
              style={{ minWidth: 120 }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Event</span>
            </button>
          </div>
        </div>
      </div>

      {/* API Error Message */}
      {apiError && (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-600 rounded-lg">
          <p className="text-yellow-400 text-sm">{apiError}</p>
        </div>
      )}

      {/* API Info */}
      <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600 rounded-lg">
        <p className="text-blue-400 text-sm">
          <strong>Economic Calendar for:</strong> Central bank decisions, Key economic indicators, Gold-impacting events
        </p>
        <p className="text-blue-300 text-xs mt-1">
          Click "Fetch Events" to automatically load economic calendar from API, or manually add events below.
        </p>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white">Add Economic Event</h4>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preset Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Quick Select (Optional)</label>
              <select
                value={selectedPreset}
                onChange={(e) => {
                  const preset = presetEvents.find(p => p.name === e.target.value);
                  if (preset) handlePresetSelect(preset);
                }}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              >
                <option value="">Select a preset event...</option>
                {presetEvents.map(preset => (
                  <option key={preset.name} value={preset.name}>{preset.name}</option>
                ))}
              </select>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Event Name</label>
                  <input
                    type="text"
                    value={newEvent.name}
                    onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    placeholder="Event name..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Country</label>
                  <select
                    value={newEvent.country}
                    onChange={(e) => setNewEvent({ ...newEvent, country: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="US">United States</option>
                    <option value="EU">European Union</option>
                    <option value="UK">United Kingdom</option>
                    <option value="JP">Japan</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                    <option value="CH">Switzerland</option>
                    <option value="CN">China</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Date</label>
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Time</label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Importance</label>
                  <select
                    value={newEvent.importance}
                    onChange={(e) => setNewEvent({ ...newEvent, importance: e.target.value as any })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Gold Impact</label>
                  <select
                    value={newEvent.goldImpact}
                    onChange={(e) => setNewEvent({ ...newEvent, goldImpact: e.target.value as any })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="monetary_policy">Monetary Policy</option>
                    <option value="employment">Employment</option>
                    <option value="inflation">Inflation</option>
                    <option value="gdp">GDP</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Forecast</label>
                  <input
                    type="text"
                    value={newEvent.forecast}
                    onChange={(e) => setNewEvent({ ...newEvent, forecast: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    placeholder="Expected value..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Previous</label>
                  <input
                    type="text"
                    value={newEvent.previous}
                    onChange={(e) => setNewEvent({ ...newEvent, previous: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    placeholder="Previous value..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Actual</label>
                  <input
                    type="text"
                    value={newEvent.actual}
                    onChange={(e) => setNewEvent({ ...newEvent, actual: e.target.value })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                    placeholder="Actual value..."
                  />
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add Event
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No economic events scheduled</p>
            <p className="text-sm">Click "Fetch Events" to load from API or "Add Event" to add manually</p>
          </div>
        ) : (
          sortedEvents.map(event => (
            <div key={event.id} className={`bg-gray-700 rounded-lg p-4 ${isApiEvent(event.id) ? 'border-l-4 border-blue-500' : ''} flex flex-col gap-2`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(event.category)}
                  <h4 className="font-semibold text-white">{event.name}</h4>
                  <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                    {event.country}
                  </span>
                  {isApiEvent(event.id) && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      API
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {/* External link icon for event link */}
                  {event.link && (
                    <a
                      href={event.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-200 p-1 rounded-full"
                      title="Open event link"
                      onClick={e => e.stopPropagation()}
                      style={{ display: 'inline-flex', alignItems: 'center' }}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                  <button
                    onClick={() => onRemoveEvent(event.id)}
                    className="text-gray-400 hover:text-red-400 transition-colors ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{event.date} at {event.time}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-400">Gold Impact:</span>
                    <div className="flex">{getGoldImpactStars(event.goldImpact)}</div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImportanceColor(event.importance)}`}>
                    {event.importance.toUpperCase()}
                  </span>
                </div>
              </div>

              {(event.forecast || event.previous || event.actual) && (
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Forecast:</span>
                    <span className="text-white ml-2">{event.forecast || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Previous:</span>
                    <span className="text-white ml-2">{event.previous || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Actual:</span>
                    <span className={`ml-2 ${event.actual ? 'text-yellow-400 font-medium' : 'text-white'}`}>
                      {event.actual || 'TBD'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EconomicCalendar;