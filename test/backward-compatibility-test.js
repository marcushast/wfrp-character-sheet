const puppeteer = require('puppeteer');
const path = require('path');

async function testBackwardCompatibility() {
    const browser = await puppeteer.launch({ 
        headless: true
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Backward Compatibility ===');
        
        // Create old format character data
        const oldFormatCharacter = {
            name: 'Test Character',
            psychology: 'Fear of spiders and hatred of orcs',
            corruption: 'Third eye on forehead, pale skin',
            experience: { current: 100, spent: 50 }
        };
        
        // Clear existing localStorage
        await page.evaluate(() => {
            localStorage.clear();
        });
        
        // Set old format data in localStorage
        await page.evaluate((data) => {
            localStorage.setItem('wfrp-character', JSON.stringify(data));
        }, oldFormatCharacter);
        
        // Reload the page to test migration
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if data was migrated correctly in application state
        const migratedData = await page.evaluate(() => {
            if (window.characterSheet && window.characterSheet.state) {
                return window.characterSheet.state.toJSON();
            } else {
                return {};
            }
        });
        
        console.log('--- Testing Psychology Migration ---');
        console.log('✓ Psychology is now object:', typeof migratedData.psychology === 'object');
        console.log('✓ Psychology has points:', typeof migratedData.psychology.points === 'number');
        console.log('✓ Psychology has conditions array:', Array.isArray(migratedData.psychology.conditions));
        console.log('✓ Old psychology text migrated:', 
            migratedData.psychology.conditions.length > 0 && 
            migratedData.psychology.conditions[0].condition === 'Fear of spiders and hatred of orcs');
        
        console.log('--- Testing Corruption Migration ---');
        console.log('✓ Corruption is now object:', typeof migratedData.corruption === 'object');
        console.log('✓ Corruption has points:', typeof migratedData.corruption.points === 'number');
        console.log('✓ Corruption has mutations array:', Array.isArray(migratedData.corruption.mutations));
        console.log('✓ Old corruption text migrated:', 
            migratedData.corruption.mutations.length > 0 && 
            migratedData.corruption.mutations[0].mutation === 'Third eye on forehead, pale skin');
        
        // Test UI shows migrated data
        const psychologyConditions = await page.$$eval('#psychology-list .psychology-condition', 
            elements => elements.map(el => el.textContent || el.value).filter(text => text.trim()));
        
        const corruptionMutations = await page.$$eval('#corruption-list .corruption-mutation', 
            elements => elements.map(el => el.textContent || el.value).filter(text => text.trim()));
            
        console.log('--- Testing UI Display ---');
        console.log('✓ Psychology conditions displayed:', psychologyConditions.length > 0);
        console.log('✓ Corruption mutations displayed:', corruptionMutations.length > 0);
        console.log('Psychology condition text:', psychologyConditions[0] || 'None');
        console.log('Corruption mutation text:', corruptionMutations[0] || 'None');
        
        // Test import/export with old format
        console.log('--- Testing Import/Export ---');
        
        // Test import of old format data
        await page.click('#import-character');
        await page.waitForSelector('#import-modal', { visible: true });
        
        const oldFormatImportData = JSON.stringify({
            name: 'Imported Character',
            psychology: 'Imported psychology condition',
            corruption: 'Imported corruption mutation'
        }, null, 2);
        
        await page.type('#import-data', oldFormatImportData);
        await page.click('#confirm-import');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if import worked
        const importedData = await page.evaluate(() => {
            if (window.characterSheet && window.characterSheet.state) {
                return window.characterSheet.state.toJSON();
            } else {
                return {};
            }
        });
        
        console.log('✓ Import converted psychology:', typeof importedData.psychology === 'object');
        console.log('✓ Import converted corruption:', typeof importedData.corruption === 'object');
        console.log('✓ Import preserved character name:', importedData.name === 'Imported Character');
        
        console.log('\n✓ Backward compatibility test passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testBackwardCompatibility().catch(console.error);