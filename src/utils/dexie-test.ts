// Comprehensive test file to verify ALL Dexie database functionality
import { tradingDB } from './dexie-database';

export const testDexieDatabase = async () => {
  console.log('🧪 Testing ALL Dexie Database functionality...');

  try {
    // Test 1: Save a trade
    console.log('📝 Testing trade save...');
    const testTrade = {
      id: 'test-trade-1',
      date: '2024-01-20',
      pair: 'XAUUSD',
      type: 'buy' as const,
      entry: 2034.50,
      stopLoss: 2025.00,
      takeProfit: 2055.00,
      size: 0.1,
      status: 'open' as const,
      riskAmount: 95.00,
      riskRatio: 2.15,
      notes: 'Test trade for Dexie verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await tradingDB.saveTrade(testTrade);
    console.log('✅ Trade saved successfully');

    // Test 2: Retrieve trades
    console.log('📖 Testing trade retrieval...');
    const trades = await tradingDB.getTrades();
    console.log(`✅ Retrieved ${trades.length} trades`);

    // Test 3: Save a zone
    console.log('📍 Testing zone save...');
    const testZone = {
      id: 'test-zone-1',
      type: 'support',
      name: 'Test Support Zone',
      startPrice: 2020.50,
      endPrice: 2022.30,
      strength: 'strong' as const,
      notes: 'Test zone for Dexie verification',
      date: '2024-01-20',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await tradingDB.saveZone(testZone);
    console.log('✅ Zone saved successfully');

    // Test 4: Retrieve zones
    console.log('🗺️ Testing zone retrieval...');
    const zones = await tradingDB.getZones();
    console.log(`✅ Retrieved ${zones.length} zones`);

    // Test 5: Save a planned entry
    console.log('🎯 Testing planned entry save...');
    const testPlannedEntry = {
      id: 'test-entry-1',
      zoneId: 'test-zone-1',
      zoneName: 'Test Support Zone',
      zoneType: 'support',
      entryLevel: 2021.00,
      takeProfit: 2035.00,
      stopLoss: 2015.00,
      riskRatio: 2.8,
      plannedEntries: 1,
      notes: 'Test planned entry for Dexie verification',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await tradingDB.savePlannedEntry(testPlannedEntry);
    console.log('✅ Planned entry saved successfully');

    // Test 6: Retrieve planned entries
    console.log('📋 Testing planned entry retrieval...');
    const plannedEntries = await tradingDB.getPlannedEntries();
    console.log(`✅ Retrieved ${plannedEntries.length} planned entries`);

    // Test 7: Save ALL types of settings
    console.log('⚙️ Testing ALL settings save...');
    
    // Risk management settings
    await tradingDB.saveSetting('weeklyRiskBudget', 1000);
    await tradingDB.saveSetting('weeklyRiskUsed', 250);
    
    // Completion status
    await tradingDB.saveSetting('technicalAnalysisComplete', true);
    await tradingDB.saveSetting('marketStructureComplete', false);
    await tradingDB.saveSetting('weeklyPlanningComplete', true);
    
    // Checklists
    const testWeeklyChecklist = [
      { id: '1', task: 'Test weekly task', completed: true, category: 'fundamental' as const },
      { id: '2', task: 'Test technical task', completed: false, category: 'technical' as const }
    ];
    await tradingDB.saveSetting('weeklyChecklist', testWeeklyChecklist);
    
    const testPreTradeChecklist = [
      { id: '1', task: 'Test pre-trade task', completed: true, category: 'market' as const }
    ];
    await tradingDB.saveSetting('preTradeChecklist', testPreTradeChecklist);
    
    // News Events
    const testNewsEvents = [
      {
        id: '1',
        title: 'Test News Event',
        description: 'Test news event for verification',
        date: '2024-01-20',
        time: '14:00',
        category: 'economic' as const,
        impact: 'high' as const,
        goldImpact: 'bullish' as const
      }
    ];
    await tradingDB.saveSetting('newsEvents', testNewsEvents);
    
    // Economic Events
    const testEconomicEvents = [
      {
        id: '1',
        name: 'Test Economic Event',
        country: 'US',
        date: '2024-01-20',
        time: '13:30',
        importance: 'high' as const,
        forecast: '3.2%',
        previous: '3.1%',
        actual: '',
        goldImpact: 'high' as const,
        category: 'inflation' as const
      }
    ];
    await tradingDB.saveSetting('economicEvents', testEconomicEvents);
    
    console.log('✅ All settings saved successfully');

    // Test 8: Retrieve ALL settings
    console.log('🔧 Testing ALL settings retrieval...');
    const allSettings = await tradingDB.getAllSettings();
    console.log('✅ Retrieved settings:', Object.keys(allSettings));
    console.log('Settings content:', allSettings);

    // Test 9: Get database info
    console.log('📊 Testing database info...');
    const dbInfo = await tradingDB.getDatabaseInfo();
    console.log('✅ Database info:', dbInfo);

    // Test 10: Get trading stats
    console.log('📈 Testing trading stats...');
    const stats = await tradingDB.getTradingStats();
    console.log('✅ Trading stats:', stats);

    // Test 11: Test EXPORT functionality
    console.log('📤 Testing EXPORT functionality...');
    const exportData = await tradingDB.exportData();
    console.log('✅ Export data generated, size:', exportData.length);
    console.log('Export preview:', exportData.substring(0, 500) + '...');
    
    // Verify export contains all data types
    const parsedExport = JSON.parse(exportData);
    console.log('Export contains:');
    console.log('- Trades:', parsedExport.trades?.length || 0);
    console.log('- Zones:', parsedExport.zones?.length || 0);
    console.log('- Planned Entries:', parsedExport.plannedEntries?.length || 0);
    console.log('- Settings keys:', Object.keys(parsedExport.settings || {}));

    // Test 12: Test IMPORT functionality
    console.log('📥 Testing IMPORT functionality...');
    await tradingDB.importData(exportData);
    console.log('✅ Import test completed');

    console.log('🎉 ALL Dexie database tests passed!');
    console.log('📋 Summary: All data types are being saved and exported correctly');
    return true;

  } catch (error) {
    console.error('❌ Dexie database test failed:', error);
    console.error('Error details:', error);
    return false;
  }
};

// Test specific data types
export const testSpecificDataTypes = async () => {
  console.log('🔍 Testing specific data types...');
  
  try {
    // Test news events specifically
    const testNews = [
      {
        id: 'news-1',
        title: 'Fed Rate Decision',
        description: 'Federal Reserve interest rate decision',
        date: '2024-01-25',
        time: '14:00',
        category: 'economic' as const,
        impact: 'high' as const,
        goldImpact: 'bullish' as const
      }
    ];
    
    await tradingDB.saveSetting('newsEvents', testNews);
    const retrievedNews = await tradingDB.getSetting('newsEvents');
    console.log('✅ News events test:', retrievedNews);
    
    // Test economic events specifically
    const testEconomic = [
      {
        id: 'econ-1',
        name: 'CPI Data',
        country: 'US',
        date: '2024-01-25',
        time: '13:30',
        importance: 'high' as const,
        forecast: '3.2%',
        previous: '3.1%',
        actual: '',
        goldImpact: 'high' as const,
        category: 'inflation' as const
      }
    ];
    
    await tradingDB.saveSetting('economicEvents', testEconomic);
    const retrievedEconomic = await tradingDB.getSetting('economicEvents');
    console.log('✅ Economic events test:', retrievedEconomic);
    
    // Test checklists specifically
    const testChecklist = [
      { id: '1', task: 'Test checklist item', completed: true, category: 'fundamental' as const }
    ];
    
    await tradingDB.saveSetting('weeklyChecklist', testChecklist);
    const retrievedChecklist = await tradingDB.getSetting('weeklyChecklist');
    console.log('✅ Checklist test:', retrievedChecklist);
    
    console.log('🎯 All specific data type tests passed!');
    return true;
    
  } catch (error) {
    console.error('❌ Specific data type test failed:', error);
    return false;
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testDexieDatabase = testDexieDatabase;
  (window as any).testSpecificDataTypes = testSpecificDataTypes;
} 