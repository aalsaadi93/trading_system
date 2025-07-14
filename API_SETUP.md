# API Setup Guide

This trading management system now includes API integrations for automatically fetching news events and economic calendar data. Follow the steps below to set up the APIs.

## Quick Setup

1. **Edit Configuration**: Open `src/config/api.ts`
2. **Add API Keys**: Replace the placeholder values with your actual API keys
3. **Save and Restart**: The changes will take effect immediately

```typescript
// In src/config/api.ts
export const API_CONFIG = {
  NEWS_API_KEY: 'your_actual_news_api_key_here',
  ALPHA_VANTAGE_API_KEY: 'your_actual_alpha_vantage_key_here',
  // ... other config
};
```

## News Events API (NewsAPI.org)

The News Events component can automatically fetch relevant news about:
- Political changes
- Economic crises  
- Geopolitical tensions

### Setup Steps:

1. **Get API Key**: Visit [NewsAPI.org](https://newsapi.org/) and sign up for a free account
2. **Free Tier**: Includes 1,000 requests per day
3. **Configure**: Replace `YOUR_NEWS_API_KEY` in `src/config/api.ts` with your actual API key

## Economic Calendar API

The Economic Calendar component can automatically fetch economic events that affect gold prices, including:
- Federal Funds Rate & Statement
- Non-Farm Employment Change
- Unemployment Rate & Wages
- Advance GDP q/q
- FOMC Meeting Minutes
- CPI (Consumer Price Index)

### Option 1: Alpha Vantage API

1. **Get API Key**: Visit [Alpha Vantage](https://www.alphavantage.co/) and sign up for a free account
2. **Free Tier**: Includes 500 requests per day
3. **Configure**: Replace `YOUR_ALPHA_VANTAGE_API_KEY` in `src/config/api.ts`

### Option 2: Forex Factory API (Alternative)

The system also tries to use Forex Factory's economic calendar API as a fallback.

## Usage

### News Events
1. Go to the "Preparation" tab
2. In the "News Events" section, click "Fetch News"
3. The system will automatically load relevant news events
4. You can still manually add events using "Add Event"

### Economic Calendar
1. Go to the "Preparation" tab  
2. In the "Economic Calendar" section, click "Fetch Events"
3. The system will automatically load economic events for the coming week
4. You can still manually add events using "Add Event"

## Features

### Automatic Data Processing
- **News Events**: Automatically categorizes news as political, economic, or geopolitical
- **Impact Assessment**: Determines impact level based on source credibility
- **Gold Impact**: Analyzes content to determine bullish/bearish impact on gold
- **Economic Events**: Filters for gold-impacting events only
- **Date Filtering**: Only shows events for the relevant time period

### Visual Indicators
- API-fetched events are marked with a blue border and "API" badge
- Manual events remain unchanged
- Loading states show when fetching from APIs
- Error messages appear if API calls fail

### Fallback System
- If APIs are unavailable, the system uses realistic mock data
- No interruption to workflow if APIs are down
- Manual entry always available as backup

## API Limits & Costs

### NewsAPI.org
- **Free Tier**: 1,000 requests/day
- **Paid Plans**: Starting at $449/month for higher limits
- **Rate Limit**: 1 request per second

### Alpha Vantage
- **Free Tier**: 500 requests/day
- **Paid Plans**: Starting at $49.99/month for higher limits
- **Rate Limit**: 5 requests per minute

## Troubleshooting

### Common Issues

1. **"Failed to fetch from API"**
   - Check your API key is correct in `src/config/api.ts`
   - Verify you haven't exceeded daily limits
   - Check internet connection

2. **No events loaded**
   - The system will use mock data as fallback
   - Check browser console for detailed error messages

3. **API rate limiting**
   - Wait a few minutes before trying again
   - Consider upgrading to paid plans for higher limits

### Testing Without APIs

If you don't want to set up APIs immediately:
1. The system will automatically use mock data
2. All functionality remains available
3. You can set up APIs later by editing `src/config/api.ts`

## Security Notes

- API keys are stored in the frontend code (not recommended for production)
- For production use, consider:
  - Using environment variables
  - Implementing a backend proxy
  - Using API key management services

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify API keys are correctly configured in `src/config/api.ts`
3. Test API endpoints directly in your browser
4. Check API provider status pages 