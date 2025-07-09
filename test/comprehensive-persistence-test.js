const puppeteer = require('puppeteer');
const path = require('path');

async function comprehensivePersistenceTest() {
    const browser = await puppeteer.launch({ 
        headless: true,
        slowMo: 50
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 1000 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('✓ Page loaded successfully');
        
        // Wait for JavaScript to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear localStorage to start fresh
        await page.evaluate(() => {
            localStorage.clear();
        });
        
        // Reload to start with clean slate
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('\n=== Testing All Problematic Sections ===');
        
        // Test data for all problematic sections
        const testData = {
            // Psychology and Corruption
            psychology: 'Fearless in battle, protective of allies',
            corruption: 'Minor chaos taint on left hand',
            
            // Wounds
            sb: '4',
            'tb-plus-2': '6', 
            wpb: '3',
            hardy: '2',
            wounds: '15',
            
            // Wealth
            'wealth-d': '25',
            'wealth-ss': '12',
            'wealth-gc': '5',
            
            // Encumbrance
            'enc-weapons': '8',
            'enc-armour': '15',
            'enc-trappings': '20',
            'enc-max': '55',
            
            // Ambitions
            'short-ambition': 'Defeat the goblin king threatening the village',
            'long-ambition': 'Establish a warrior academy to train the next generation',
            
            // Party
            'party-name': 'The Crimson Blades',
            'party-short': 'Clear the abandoned mines of monsters',
            'party-long': 'Unite the fractured kingdoms against the coming darkness',
            'party-members': 'Grimjaw (Warrior), Elara (Wizard), Thorin (Dwarf), Mystic (Priest)'
        };
        
        // Enter all test data
        for (const [fieldId, value] of Object.entries(testData)) {
            await page.focus(`#${fieldId}`);
            await page.type(`#${fieldId}`, value);
            
            // Trigger change event to ensure data is saved
            await page.evaluate((id) => {
                const element = document.getElementById(id);
                if (element) {
                    const event = new Event('change', { bubbles: true });
                    element.dispatchEvent(event);
                }
            }, fieldId);
            
            await new Promise(resolve => setTimeout(resolve, 30));
        }
        
        console.log('✓ All test data entered');
        
        // Wait for auto-save
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check localStorage before reload
        const dataBeforeReload = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\n=== Data in localStorage before reload ===');
        console.log('Psychology:', dataBeforeReload?.psychology ? '✓' : '❌');
        console.log('Corruption:', dataBeforeReload?.corruption ? '✓' : '❌');
        console.log('Wounds SB:', dataBeforeReload?.wounds?.sb ? '✓' : '❌');
        console.log('Wealth D:', dataBeforeReload?.wealth?.d ? '✓' : '❌');
        console.log('Encumbrance weapons:', dataBeforeReload?.encumbrance?.weapons ? '✓' : '❌');
        console.log('Short ambition:', dataBeforeReload?.ambitions?.short ? '✓' : '❌');
        console.log('Party name:', dataBeforeReload?.party?.name ? '✓' : '❌');
        
        // Reload page
        console.log('\n=== Reloading page ===');
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✓ Page reloaded');
        
        // Check all field values after reload
        const fieldValuesAfterReload = {};
        for (const fieldId of Object.keys(testData)) {
            fieldValuesAfterReload[fieldId] = await page.$eval(`#${fieldId}`, el => el.value);
        }
        
        // Check encumbrance total calculation
        const encTotal = await page.$eval('#enc-total', el => el.value);
        const expectedTotal = 8 + 15 + 20; // 43
        
        console.log('\n=== Persistence Test Results ===');
        
        let allPersisted = true;
        for (const [fieldId, expectedValue] of Object.entries(testData)) {
            const actualValue = fieldValuesAfterReload[fieldId];
            const persisted = actualValue === expectedValue;
            console.log(`${fieldId}: ${persisted ? '✅' : '❌'} (expected: "${expectedValue}", got: "${actualValue}")`);
            if (!persisted) allPersisted = false;
        }
        
        const encTotalCorrect = encTotal === expectedTotal.toString();
        console.log(`Encumbrance total: ${encTotalCorrect ? '✅' : '❌'} (expected: ${expectedTotal}, got: ${encTotal})`);
        
        console.log('\n=== FINAL SUMMARY ===');
        if (allPersisted && encTotalCorrect) {
            console.log('🎉 ALL TESTS PASSED! 🎉');
            console.log('✅ Psychology section: WORKING');
            console.log('✅ Corruption section: WORKING');
            console.log('✅ Wounds section: WORKING');
            console.log('✅ Wealth section: WORKING');
            console.log('✅ Encumbrance section: WORKING');
            console.log('✅ Ambitions section: WORKING');
            console.log('✅ Party section: WORKING');
            console.log('✅ Encumbrance calculation: WORKING');
            console.log('✅ Data persistence after reload: WORKING');
        } else {
            console.log('❌ SOME TESTS FAILED');
            console.log('Check the detailed results above');
        }
        
        console.log('\n✓ Comprehensive persistence test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

comprehensivePersistenceTest().catch(console.error);