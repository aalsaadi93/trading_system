// API Configuration
// Replace these placeholder values with your actual API keys

export const API_CONFIG = {
  // News API (NewsAPI.org) - Get free key at https://newsapi.org/
  NEWS_API_KEY: '07e7db48c06c46118805fec1d5a7e0f5',
  
  // Alpha Vantage API - Get free key at https://www.alphavantage.co/
  ALPHA_VANTAGE_API_KEY: 'S7ORUIVR09IQZ08F',
  
  // API Base URLs
  NEWS_API_BASE_URL: 'https://newsapi.org/v2',
  ALPHA_VANTAGE_BASE_URL: 'https://www.alphavantage.co/query',
  FOREX_FACTORY_API_URL: 'https://www.forexfactory.com/api/calendar',
  
  // Trading Economics API
  TRADING_ECONOMICS_API_KEY: 'eaeae4f3948d406:yu8v4eod1s0j0u8',
  TRADING_ECONOMICS_BASE_URL: 'https://api.tradingeconomics.com/calendar',

  // RapidAPI Forex Factory Scraper
  RAPIDAPI_FOREX_FACTORY_KEY: '2fab69e2d9msh3a11121683e86b9p1e5a1ajsncf55c8949f36',
  RAPIDAPI_FOREX_FACTORY_BASE_URL: 'https://forex-factory-scraper1.p.rapidapi.com/get_calendar_details',

  // Custom Economic Calendar API (local PHP)
  CUSTOM_ECONOMIC_CALENDAR_API_URL: 'http://localhost/economic-calendar-api-master/index.php',
};

// Helper function to check if API keys are configured
export const areApiKeysConfigured = (): boolean => {
  return API_CONFIG.NEWS_API_KEY !== 'YOUR_NEWS_API_KEY' && 
         API_CONFIG.ALPHA_VANTAGE_API_KEY !== 'YOUR_ALPHA_VANTAGE_API_KEY';
};

// Helper function to get API key status
export const getApiKeyStatus = () => {
  return {
    newsApi: API_CONFIG.NEWS_API_KEY !== 'YOUR_NEWS_API_KEY',
    alphaVantage: API_CONFIG.ALPHA_VANTAGE_API_KEY !== 'YOUR_ALPHA_VANTAGE_API_KEY'
  };
}; 