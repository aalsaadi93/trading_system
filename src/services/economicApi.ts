import { EconomicEvent } from '../components/EconomicCalendar';
import { API_CONFIG } from '../config/api';

// Using Trading Economics API for economic calendar
const TRADING_ECONOMICS_API_KEY = API_CONFIG.TRADING_ECONOMICS_API_KEY;
const TRADING_ECONOMICS_BASE_URL = API_CONFIG.TRADING_ECONOMICS_BASE_URL;

// Using Alpha Vantage API for economic indicators (free tier available)
const ALPHA_VANTAGE_API_KEY = API_CONFIG.ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = API_CONFIG.ALPHA_VANTAGE_BASE_URL;

// Using Forex Factory API for economic calendar (alternative)
const FOREX_FACTORY_API_URL = API_CONFIG.FOREX_FACTORY_API_URL;

const RAPIDAPI_FOREX_FACTORY_KEY = API_CONFIG.RAPIDAPI_FOREX_FACTORY_KEY;
const RAPIDAPI_FOREX_FACTORY_BASE_URL = API_CONFIG.RAPIDAPI_FOREX_FACTORY_BASE_URL;

export interface EconomicApiResponse {
  name: string;
  country: string;
  date: string;
  time: string;
  importance: string;
  forecast?: string;
  previous?: string;
  actual?: string;
  category: string;
}

// Add type for custom API filters
export interface CustomApiFilters {
  currency?: string;
  importance?: string;
  event?: string;
}

export const fetchEconomicEvents = async (
  source?: 'tradingeconomics' | 'rapidapi' | 'mock' | 'custom',
  customFilters?: CustomApiFilters
): Promise<EconomicEvent[]> => {
  try {
    const today = new Date();
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    const from = today.toISOString().split('T')[0];
    const to = nextWeek.toISOString().split('T')[0];

    if (source === 'tradingeconomics') {
      if (TRADING_ECONOMICS_API_KEY && TRADING_ECONOMICS_API_KEY !== '') {
        try {
          const url = `${TRADING_ECONOMICS_BASE_URL}?country=united states&importance=3&start=${from}&end=${to}&c=${TRADING_ECONOMICS_API_KEY}`;
          const response = await fetch(url);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              return processTradingEconomicsData(data);
            }
          }
        } catch (error) {
          return [];
        }
      }
      return [];
    }

    if (source === 'rapidapi') {
      if (RAPIDAPI_FOREX_FACTORY_KEY && RAPIDAPI_FOREX_FACTORY_KEY !== '') {
        try {
          const rapidApiEvents = await fetchForexFactoryRapidApi(from);
          if (rapidApiEvents.length > 0) {
            return rapidApiEvents;
          }
        } catch (error) {
          return [];
        }
      }
      return [];
    }

    if (source === 'mock') {
      return getMockEconomicEvents();
    }

    if (source === 'custom') {
      return fetchCustomEconomicEvents(customFilters);
    }

    // Default fallback chain (original logic)
    // Try Trading Economics API first
    if (TRADING_ECONOMICS_API_KEY && TRADING_ECONOMICS_API_KEY !== '') {
      try {
        const url = `${TRADING_ECONOMICS_BASE_URL}?country=united states&importance=3&start=${from}&end=${to}&c=${TRADING_ECONOMICS_API_KEY}`;
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data) && data.length > 0) {
            return processTradingEconomicsData(data);
          }
        }
      } catch (error) {
        console.log('Trading Economics failed, trying RapidAPI Forex Factory...');
      }
    }

    // Try RapidAPI Forex Factory Scraper
    if (RAPIDAPI_FOREX_FACTORY_KEY && RAPIDAPI_FOREX_FACTORY_KEY !== '') {
      try {
        const rapidApiEvents = await fetchForexFactoryRapidApi(from);
        if (rapidApiEvents.length > 0) {
          return rapidApiEvents;
        }
      } catch (error) {
        console.log('RapidAPI Forex Factory failed, using mock data...');
      }
    }

    // Try Alpha Vantage first (more reliable, needs API key)
    if (API_CONFIG.ALPHA_VANTAGE_API_KEY !== 'YOUR_ALPHA_VANTAGE_API_KEY') {
      try {
        const alphaVantageEvents = await fetchAlphaVantageData();
        if (alphaVantageEvents.length > 0) {
          return alphaVantageEvents;
        }
      } catch (error) {
        console.log('Alpha Vantage failed, trying Forex Factory...');
      }
    }

    // Try Forex Factory API (CORS issues, but worth trying)
    try {
      const response = await fetch(`${FOREX_FACTORY_API_URL}?from=${today.toISOString().split('T')[0]}&to=${nextWeek.toISOString().split('T')[0]}&currency=USD`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        mode: 'cors'
      });

      if (response.ok) {
        const data = await response.json();
        return processForexFactoryData(data);
      }
    } catch (error) {
      console.log('Forex Factory failed due to CORS, using mock data...');
    }

    // If all APIs fail, return mock data
    return getMockEconomicEvents();
  } catch (error) {
    console.error('Error fetching economic events:', error);
    return getMockEconomicEvents();
  }
};

const processTradingEconomicsData = (data: any[]): EconomicEvent[] => {
  // Only keep events with high importance and relevant to gold (monetary policy, inflation, employment, GDP)
  const goldImpactEvents = [
    'Federal Reserve', 'FOMC', 'Non-Farm Payrolls', 'Unemployment', 'CPI', 'Inflation', 'GDP', 'PPI', 'Retail Sales', 'ISM', 'Treasury', 'Interest Rate'
  ];
  return data
    .filter(event => event.Importance === 3 && goldImpactEvents.some(keyword => (event.Event || '').toLowerCase().includes(keyword.toLowerCase())))
    .slice(0, 15)
    .map((event, index) => ({
      id: `te-${index}`,
      name: event.Event || 'Economic Event',
      country: event.Country || 'US',
      date: event.Date ? event.Date.split('T')[0] : '',
      time: event.Date ? event.Date.split('T')[1]?.substring(0,5) : '',
      importance: 'high',
      forecast: event.Forecast || '',
      previous: event.Previous || '',
      actual: event.Actual || '',
      goldImpact: getGoldImpact(event.Event || ''),
      category: getCategory(event.Event || '')
    }));
};

const processForexFactoryData = (data: any[]): EconomicEvent[] => {
  const goldImpactEvents = [
    'Federal Funds Rate',
    'FOMC Statement',
    'Non-Farm Employment Change',
    'Unemployment Rate',
    'Average Hourly Earnings',
    'Consumer Price Index',
    'Core CPI',
    'GDP',
    'FOMC Meeting Minutes',
    'Producer Price Index',
    'Retail Sales',
    'ISM Manufacturing PMI',
    'ISM Services PMI'
  ];

  return data
    .filter((event: any) => 
      goldImpactEvents.some(keyword => 
        event.name.toLowerCase().includes(keyword.toLowerCase())
      )
    )
    .slice(0, 15)
    .map((event: any, index: number) => ({
      id: `api-${index}`,
      name: event.name,
      country: event.country || 'US',
      date: event.date,
      time: event.time,
      importance: getImportanceLevel(event.importance),
      forecast: event.forecast,
      previous: event.previous,
      actual: event.actual || '',
      goldImpact: getGoldImpact(event.name),
      category: getCategory(event.name)
    }));
};

const fetchAlphaVantageData = async (): Promise<EconomicEvent[]> => {
  const indicators = [
    { name: 'REAL_GDP', title: 'Real GDP' },
    { name: 'REAL_GDP_PER_CAPITA', title: 'Real GDP Per Capita' },
    { name: 'TREASURY_YIELD', title: 'Treasury Yield' },
    { name: 'FEDERAL_FUNDS_RATE', title: 'Federal Funds Rate' },
    { name: 'CPI', title: 'Consumer Price Index' },
    { name: 'INFLATION', title: 'Inflation Rate' },
    { name: 'RETAIL_SALES', title: 'Retail Sales' },
    { name: 'DURABLES', title: 'Durable Goods Orders' },
    { name: 'UNEMPLOYMENT', title: 'Unemployment Rate' }
  ];

  const events: EconomicEvent[] = [];
  const today = new Date();

  for (let i = 0; i < indicators.length; i++) {
    try {
      const response = await fetch(
        `${ALPHA_VANTAGE_BASE_URL}?function=ECONOMIC_CALENDAR&symbol=${indicators[i].name}&apikey=${ALPHA_VANTAGE_API_KEY}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.economic_calendar) {
          const latestEvent = data.economic_calendar[0];
          const eventDate = new Date(latestEvent.date);
          
          // Only include events from the next week
          if (eventDate >= today && eventDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
            events.push({
              id: `alpha-${i}`,
              name: indicators[i].title,
              country: 'US',
              date: latestEvent.date,
              time: '13:30', // Default time for US economic releases
              importance: 'high',
              forecast: latestEvent.forecast,
              previous: latestEvent.previous,
              actual: latestEvent.actual || '',
              goldImpact: getGoldImpact(indicators[i].title),
              category: getCategory(indicators[i].title)
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching ${indicators[i].name}:`, error);
    }
  }

  return events;
};

const getImportanceLevel = (importance: string): 'high' | 'medium' | 'low' => {
  const highImportance = ['Federal Funds Rate', 'FOMC', 'Non-Farm Employment', 'CPI', 'GDP'];
  const mediumImportance = ['Unemployment', 'Retail Sales', 'ISM', 'PPI'];
  
  if (highImportance.some(keyword => importance.includes(keyword))) return 'high';
  if (mediumImportance.some(keyword => importance.includes(keyword))) return 'medium';
  return 'low';
};

const getGoldImpact = (eventName: string): 'high' | 'medium' | 'low' => {
  const highImpact = ['Federal Funds Rate', 'FOMC', 'Non-Farm Employment', 'CPI', 'GDP'];
  const mediumImpact = ['Unemployment', 'Retail Sales', 'ISM', 'PPI', 'Treasury'];
  
  if (highImpact.some(keyword => eventName.includes(keyword))) return 'high';
  if (mediumImpact.some(keyword => eventName.includes(keyword))) return 'medium';
  return 'low';
};

const getCategory = (eventName: string): 'monetary_policy' | 'employment' | 'inflation' | 'gdp' | 'other' => {
  if (eventName.includes('Federal Funds') || eventName.includes('FOMC')) return 'monetary_policy';
  if (eventName.includes('Employment') || eventName.includes('Unemployment')) return 'employment';
  if (eventName.includes('CPI') || eventName.includes('Inflation') || eventName.includes('PPI')) return 'inflation';
  if (eventName.includes('GDP')) return 'gdp';
  return 'other';
};

const fetchForexFactoryRapidApi = async (from: string): Promise<EconomicEvent[]> => {
  // Parse year, month, day from 'from' (YYYY-MM-DD)
  const [year, month, day] = from.split('-');
  const url = `${RAPIDAPI_FOREX_FACTORY_BASE_URL}?year=${year}&month=${parseInt(month)}&day=${parseInt(day)}&currency=ALL&event_name=ALL&timezone=GMT-06%3A00%20Central%20Time%20(US%20%26%20Canada)&time_format=12h`;
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': RAPIDAPI_FOREX_FACTORY_KEY,
      'x-rapidapi-host': 'forex-factory-scraper1.p.rapidapi.com'
    }
  };
  const response = await fetch(url, options);
  if (!response.ok) return [];
  const data = await response.json();
  if (!Array.isArray(data)) return [];
  return processForexFactoryRapidApiData(data);
};

const processForexFactoryRapidApiData = (data: any[]): EconomicEvent[] => {
  // Map the API response to EconomicEvent type
  return data.slice(0, 15).map((event, index) => ({
    id: `rapidapi-${index}`,
    name: event.event_name || 'Economic Event',
    country: event.country || 'US',
    date: event.date || '',
    time: event.time || '',
    importance: event.impact === 'High' ? 'high' : event.impact === 'Medium' ? 'medium' : 'low',
    forecast: event.forecast || '',
    previous: event.previous || '',
    actual: event.actual || '',
    goldImpact: getGoldImpact(event.event_name || ''),
    category: getCategory(event.event_name || ''),
    link: event.link || event.Link || ''
  }));
};

// Fetch from custom economic calendar API
export const fetchCustomEconomicEvents = async (filters: CustomApiFilters = {}): Promise<EconomicEvent[]> => {
  const baseUrl = API_CONFIG.CUSTOM_ECONOMIC_CALENDAR_API_URL;
  const params = new URLSearchParams();
  if (filters.currency) params.append('currency', filters.currency);
  if (filters.importance) params.append('importance', filters.importance);
  if (filters.event) params.append('event', filters.event);
  const url = `${baseUrl}${params.toString() ? '?' + params.toString() : ''}`;
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    console.log('API Response:', data); // Debug log
    if (data.status !== 'parsed' || !Array.isArray(data.events)) return [];
    console.log('Number of events from API:', data.events.length); // Debug log
    const mappedEvents = data.events.map((event: any, index: number) => ({
      id: `custom-${index}`,
      name: event.event || 'Economic Event',
      country: event.currency || '',
      date: event.date || '',
      time: event.time || '',
      importance: (event.importance || '').toLowerCase() as 'high' | 'medium' | 'low',
      forecast: event.forecast || '',
      previous: event.previous || '',
      actual: event.actual || '',
      goldImpact: (event.importance || '').toLowerCase() === 'high' ? 'high' : (event.importance || '').toLowerCase() === 'medium' ? 'medium' : 'low',
      category: getCategory(event.event || ''),
      link: event.link || event.Link || ''
    }));
    console.log('Mapped events:', mappedEvents); // Debug log
    return mappedEvents;
  } catch (error) {
    console.error('Error fetching custom events:', error);
    return [];
  }
};

// Fallback function for when APIs are not available
export const getMockEconomicEvents = (): EconomicEvent[] => {
  const today = new Date();
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return [
    {
      id: 'mock-1',
      name: 'Federal Funds Rate Decision',
      country: 'US',
      date: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      importance: 'high',
      forecast: '5.25%',
      previous: '5.25%',
      actual: '',
      goldImpact: 'high',
      category: 'monetary_policy'
    },
    {
      id: 'mock-2',
      name: 'Non-Farm Employment Change',
      country: 'US',
      date: new Date(today.getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '13:30',
      importance: 'high',
      forecast: '180K',
      previous: '199K',
      actual: '',
      goldImpact: 'high',
      category: 'employment'
    },
    {
      id: 'mock-3',
      name: 'Consumer Price Index (CPI)',
      country: 'US',
      date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '13:30',
      importance: 'high',
      forecast: '3.2%',
      previous: '3.1%',
      actual: '',
      goldImpact: 'high',
      category: 'inflation'
    },
    {
      id: 'mock-4',
      name: 'FOMC Meeting Minutes',
      country: 'US',
      date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '19:00',
      importance: 'medium',
      forecast: '',
      previous: '',
      actual: '',
      goldImpact: 'medium',
      category: 'monetary_policy'
    },
    {
      id: 'mock-5',
      name: 'Advance GDP q/q',
      country: 'US',
      date: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      time: '13:30',
      importance: 'high',
      forecast: '2.1%',
      previous: '2.0%',
      actual: '',
      goldImpact: 'medium',
      category: 'gdp'
    }
  ];
}; 