import { NewsEvent } from '../components/NewsEvents';
import { API_CONFIG } from '../config/api';

// Using NewsAPI.org for news events (free tier available)
const NEWS_API_KEY = API_CONFIG.NEWS_API_KEY;
const NEWS_API_BASE_URL = API_CONFIG.NEWS_API_BASE_URL;

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

export interface NewsApiArticle {
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
}

export const fetchNewsEvents = async (): Promise<NewsEvent[]> => {
  try {
    // Check if API key is configured
    if (NEWS_API_KEY === 'YOUR_NEWS_API_KEY') {
      console.log('News API key not configured, using mock data...');
      return getMockNewsEvents();
    }

    // Keywords for political, economic, and geopolitical events
    const keywords = [
      'federal reserve',
      'central bank',
      'monetary policy',
      'economic crisis',
      'recession',
      'inflation',
      'geopolitical tension',
      'trade war',
      'sanctions',
      'election',
      'political crisis',
      'gold price',
      'commodities',
      'forex market'
    ];

    const query = keywords.join(' OR ');
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const response = await fetch(
      `${NEWS_API_BASE_URL}/everything?q=${encodeURIComponent(query)}&from=${weekAgo.toISOString().split('T')[0]}&to=${today.toISOString().split('T')[0]}&sortBy=relevancy&language=en&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`News API error: ${response.status}`);
    }

    const data: NewsApiResponse = await response.json();
    
    return data.articles.slice(0, 10).map((article, index) => {
      const publishedDate = new Date(article.publishedAt);
      
      // Determine category based on content
      const content = (article.title + ' ' + (article.description || '')).toLowerCase();
      let category: 'political' | 'economic' | 'geopolitical' | 'other' = 'other';
      
      if (content.includes('election') || content.includes('political') || content.includes('government')) {
        category = 'political';
      } else if (content.includes('economic') || content.includes('recession') || content.includes('inflation') || content.includes('federal reserve')) {
        category = 'economic';
      } else if (content.includes('geopolitical') || content.includes('tension') || content.includes('war') || content.includes('sanctions')) {
        category = 'geopolitical';
      }

      // Determine impact based on source credibility and content
      const highImpactSources = ['Reuters', 'Bloomberg', 'Financial Times', 'Wall Street Journal', 'CNBC'];
      const impact = highImpactSources.includes(article.source.name) ? 'high' : 'medium';

      // Determine gold impact based on content
      let goldImpact: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (content.includes('inflation') || content.includes('crisis') || content.includes('tension') || content.includes('recession')) {
        goldImpact = 'bullish';
      } else if (content.includes('strong economy') || content.includes('rate hike') || content.includes('dollar strength')) {
        goldImpact = 'bearish';
      }

      return {
        id: `api-${index}`,
        title: article.title,
        description: article.description || 'No description available',
        date: publishedDate.toISOString().split('T')[0],
        time: publishedDate.toTimeString().split(' ')[0].substring(0, 5),
        category,
        impact,
        goldImpact
      };
    });
  } catch (error) {
    console.error('Error fetching news events:', error);
    return getMockNewsEvents();
  }
};

// Fallback function for when API is not available
export const getMockNewsEvents = (): NewsEvent[] => {
  return [
    {
      id: 'mock-1',
      title: 'Federal Reserve Signals Potential Rate Cuts',
      description: 'Fed officials indicate possible monetary policy easing in response to economic data.',
      date: new Date().toISOString().split('T')[0],
      time: '14:00',
      category: 'economic',
      impact: 'high',
      goldImpact: 'bullish'
    },
    {
      id: 'mock-2',
      title: 'Geopolitical Tensions Rise in Middle East',
      description: 'Escalating conflicts affecting global markets and safe-haven demand.',
      date: new Date().toISOString().split('T')[0],
      time: '09:00',
      category: 'geopolitical',
      impact: 'high',
      goldImpact: 'bullish'
    },
    {
      id: 'mock-3',
      title: 'Political Uncertainty in Major Economies',
      description: 'Election outcomes and policy changes creating market volatility.',
      date: new Date().toISOString().split('T')[0],
      time: '12:00',
      category: 'political',
      impact: 'medium',
      goldImpact: 'neutral'
    }
  ];
}; 