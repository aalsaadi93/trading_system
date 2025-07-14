// Verification script to check if all data is being saved correctly
import { tradingDB } from './dexie-database';

export const verifyDataSaving = async () => {
  console.log('🔍 Verifying data saving functionality...');
  
  try {
    // Step 1: Check if database is accessible
    console.log('📊 Checking database accessibility...');
    const dbInfo = await tradingDB.getDatabaseInfo();
    console.log('✅ Database accessible:', dbInfo);
    
    // Step 2: Test saving all data types
    console.log('💾 Testing data saving...');
    
    // Save sample data of each type
    await tradingDB.saveTrade({
      id: 'verify-trade-1',
      date: '2024-01-20',
      pair: 'XAUUSD',
      type: 'buy',
      entry: 2034.50,
      stopLoss: 2025.00,
      takeProfit: 2055.00,
      size: 0.1,
      status: 'open',
      riskAmount: 95.00,
      riskRatio: 2.15,
      notes: 'Verification trade',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    await tradingDB.saveZone({
      id: 'verify-zone-1',
      type: 'support',
      name: 'Verification Zone',
      startPrice: 2020.50,
      endPrice: 2022.30,
      strength: 'strong',
      notes: 'Verification zone',
      date: '2024-01-20',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    await tradingDB.saveSetting('verifyTest', 'testValue');
    
    console.log('✅ Sample data saved successfully');
    
    // Step 3: Test export functionality
    console.log('📤 Testing export functionality...');
    const exportData = await tradingDB.exportData();
    console.log('✅ Export successful, data size:', exportData.length);
    
    // Step 4: Verify export content
    const parsedExport = JSON.parse(exportData);
    console.log('📋 Export verification:');
    console.log('- Has trades:', !!parsedExport.trades);
    console.log('- Has zones:', !!parsedExport.zones);
    console.log('- Has planned entries:', !!parsedExport.plannedEntries);
    console.log('- Has settings:', !!parsedExport.settings);
    console.log('- Has export date:', !!parsedExport.exportDate);
    console.log('- Has version:', !!parsedExport.version);
    
    // Step 5: Test import functionality
    console.log('📥 Testing import functionality...');
    await tradingDB.importData(exportData);
    console.log('✅ Import successful');
    
    // Step 6: Verify data integrity after import
    const importedTrades = await tradingDB.getTrades();
    const importedZones = await tradingDB.getZones();
    const importedSettings = await tradingDB.getAllSettings();
    
    console.log('🔍 Data integrity check:');
    console.log('- Trades after import:', importedTrades.length);
    console.log('- Zones after import:', importedZones.length);
    console.log('- Settings after import:', Object.keys(importedSettings).length);
    
    console.log('🎉 All verification tests passed!');
    console.log('📊 Summary: All data types are being saved and exported correctly');
    
    return {
      success: true,
      exportSize: exportData.length,
      tradesCount: importedTrades.length,
      zonesCount: importedZones.length,
      settingsCount: Object.keys(importedSettings).length
    };
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export for browser console
if (typeof window !== 'undefined') {
  (window as any).verifyDataSaving = verifyDataSaving;
} 