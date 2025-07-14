import { API_CONFIG } from '../config/api';

// Test function to check API key status
export const testApiKeys = async () => {
  console.log('🔍 Testing API Keys...');
  
  const results = {
    newsApi: { configured: false, working: false, error: null as string | null },
    alphaVantage: { configured: false, working: false, error: null as string | null },
    forexFactory: { configured: true, working: false, error: null as string | null } // No key needed
  };

  // Check if News API key is configured
  results.newsApi.configured = API_CONFIG.NEWS_API_KEY !== 'YOUR_NEWS_API_KEY';
  
  // Check if Alpha Vantage key is configured
  results.alphaVantage.configured = API_CONFIG.ALPHA_VANTAGE_API_KEY !== 'YOUR_ALPHA_VANTAGE_API_KEY';

  console.log('📋 API Key Status:');
  console.log(`News API: ${results.newsApi.configured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Alpha Vantage: ${results.alphaVantage.configured ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`Forex Factory: ✅ No key needed`);

  // Test News API if configured
  if (results.newsApi.configured) {
    try {
      const response = await fetch(
        `${API_CONFIG.NEWS_API_BASE_URL}/top-headlines?country=us&apiKey=${API_CONFIG.NEWS_API_KEY}`
      );
      if (response.ok) {
        results.newsApi.working = true;
        console.log('✅ News API: Working correctly');
      } else {
        results.newsApi.error = `HTTP ${response.status}`;
        console.log(`❌ News API: Error ${response.status}`);
      }
    } catch (error) {
      results.newsApi.error = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ News API: ${results.newsApi.error}`);
    }
  }

  // Test Alpha Vantage if configured
  if (results.alphaVantage.configured) {
    try {
      const response = await fetch(
        `${API_CONFIG.ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=IBM&interval=5min&apikey=${API_CONFIG.ALPHA_VANTAGE_API_KEY}`
      );
      if (response.ok) {
        results.alphaVantage.working = true;
        console.log('✅ Alpha Vantage: Working correctly');
      } else {
        results.alphaVantage.error = `HTTP ${response.status}`;
        console.log(`❌ Alpha Vantage: Error ${response.status}`);
      }
    } catch (error) {
      results.alphaVantage.error = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Alpha Vantage: ${results.alphaVantage.error}`);
    }
  }

  // Test Forex Factory (no key needed)
  try {
    const response = await fetch(`${API_CONFIG.FOREX_FACTORY_API_URL}?currency=USD`);
    if (response.ok) {
      results.forexFactory.working = true;
      console.log('✅ Forex Factory: Working correctly');
    } else {
      results.forexFactory.error = `HTTP ${response.status}`;
      console.log(`❌ Forex Factory: Error ${response.status}`);
    }
  } catch (error) {
    results.forexFactory.error = error instanceof Error ? error.message : 'Unknown error';
    console.log(`❌ Forex Factory: ${results.forexFactory.error}`);
  }

  return results;
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testApiKeys = testApiKeys;
} 