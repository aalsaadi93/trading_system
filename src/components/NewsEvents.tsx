import React, { useState, useEffect } from 'react';
import { Plus, Calendar, AlertTriangle, TrendingUp, Globe, Building2, X, RefreshCw, Download } from 'lucide-react';
import { fetchNewsEvents, getMockNewsEvents } from '../services/newsApi';

export interface NewsEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  category: 'political' | 'economic' | 'geopolitical' | 'other';
  impact: 'high' | 'medium' | 'low';
  goldImpact: 'bullish' | 'bearish' | 'neutral';
}

interface NewsEventsProps {
  events: NewsEvent[];
  onAddEvent: (event: Omit<NewsEvent, 'id'>) => void;
  onRemoveEvent: (id: string) => void;
}

const NewsEvents: React.FC<NewsEventsProps> = ({ events, onAddEvent, onRemoveEvent }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    category: 'political' as const,
    impact: 'medium' as const,
    goldImpact: 'neutral' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEvent.title && newEvent.date && newEvent.time) {
      onAddEvent(newEvent);
      setNewEvent({
        title: '',
        description: '',
        date: '',
        time: '',
        category: 'political',
        impact: 'medium',
        goldImpact: 'neutral'
      });
      setShowAddForm(false);
    }
  };

  const handleFetchFromApi = async () => {
    setIsLoadingApi(true);
    setApiError(null);
    
    try {
      const apiEvents = await fetchNewsEvents();
      
      if (apiEvents.length > 0) {
        // Add API events to the existing events
        apiEvents.forEach(event => {
          onAddEvent(event);
        });
      } else {
        // If API fails, use mock data
        const mockEvents = getMockNewsEvents();
        mockEvents.forEach(event => {
          onAddEvent(event);
        });
      }
    } catch (error) {
      console.error('Error fetching from API:', error);
      setApiError('Failed to fetch news from API. Using sample data instead.');
      
      // Use mock data as fallback
      const mockEvents = getMockNewsEvents();
      mockEvents.forEach(event => {
        onAddEvent(event);
      });
    } finally {
      setIsLoadingApi(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'political': return <Building2 className="w-4 h-4" />;
      case 'economic': return <TrendingUp className="w-4 h-4" />;
      case 'geopolitical': return <Globe className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-900/20';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20';
      case 'low': return 'text-green-400 bg-green-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const getGoldImpactColor = (goldImpact: string) => {
    switch (goldImpact) {
      case 'bullish': return 'text-green-400 bg-green-900/20';
      case 'bearish': return 'text-red-400 bg-red-900/20';
      case 'neutral': return 'text-gray-400 bg-gray-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  const isApiEvent = (eventId: string) => eventId.startsWith('api-') || eventId.startsWith('mock-');

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-yellow-400" />
          News Events
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={handleFetchFromApi}
            disabled={isLoadingApi}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            {isLoadingApi ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>{isLoadingApi ? 'Loading...' : 'Fetch News'}</span>
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
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
          <strong>News Events for:</strong> Political changes, Economic crises, Geopolitical tensions
        </p>
        <p className="text-blue-300 text-xs mt-1">
          Click "Fetch News" to automatically load relevant news events from API, or manually add events below.
        </p>
      </div>

      {/* Add Event Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-bold text-white">Add News Event</h4>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  placeholder="Event title..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  placeholder="Event description..."
                  rows={3}
                />
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
                  <label className="block text-sm font-medium text-gray-400 mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value as any })}
                    className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  >
                    <option value="political">Political</option>
                    <option value="economic">Economic</option>
                    <option value="geopolitical">Geopolitical</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Impact</label>
                  <select
                    value={newEvent.impact}
                    onChange={(e) => setNewEvent({ ...newEvent, impact: e.target.value as any })}
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
                    <option value="bullish">Bullish</option>
                    <option value="bearish">Bearish</option>
                    <option value="neutral">Neutral</option>
                  </select>
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
        {events.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No news events added yet</p>
            <p className="text-sm">Click "Fetch News" to load from API or "Add Event" to add manually</p>
          </div>
        ) : (
          events.map(event => (
            <div key={event.id} className={`bg-gray-700 rounded-lg p-4 ${isApiEvent(event.id) ? 'border-l-4 border-blue-500' : ''}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  {getCategoryIcon(event.category)}
                  <h4 className="font-semibold text-white">{event.title}</h4>
                  {isApiEvent(event.id) && (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      API
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onRemoveEvent(event.id)}
                  className="text-gray-400 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {event.description && (
                <p className="text-gray-300 text-sm mb-3">{event.description}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300">{event.date} at {event.time}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getImpactColor(event.impact)}`}>
                    {event.impact.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getGoldImpactColor(event.goldImpact)}`}>
                    {event.goldImpact.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NewsEvents;