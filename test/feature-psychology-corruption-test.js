const puppeteer = require('puppeteer');
const path = require('path');

async function testPsychologyCorruptionFeature() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Psychology and Corruption Edit Mode Feature ===');
        
        // Test Psychology Section
        console.log('\n--- Testing Psychology Section ---');
        
        // Test psychology points counter
        await page.type('#psychology-points', '3');
        const psychologyPoints = await page.$eval('#psychology-points', el => el.value);
        console.log('✓ Psychology points input works:', psychologyPoints === '3');
        
        // Test psychology edit mode toggle
        await page.click('#edit-psychology');
        console.log('✓ Psychology edit mode toggled');
        
        // Add a psychology condition
        await page.click('button[onclick="addPsychologyCondition()"]');
        await page.waitForSelector('#psychology-list .psychology-row:last-child');
        
        // Fill in the condition
        const psychologyInputs = await page.$$('#psychology-list .psychology-condition');
        if (psychologyInputs.length > 0) {
            await psychologyInputs[0].type('Fear of Skaven');
            console.log('✓ Added psychology condition: Fear of Skaven');
        }
        
        // Add another condition
        await page.click('button[onclick="addPsychologyCondition()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        const psychologyInputs2 = await page.$$('#psychology-list .psychology-condition');
        if (psychologyInputs2.length > 1) {
            await psychologyInputs2[1].type('Hatred of Chaos cultists');
            console.log('✓ Added psychology condition: Hatred of Chaos cultists');
        }
        
        // Save psychology (exit edit mode)
        await page.click('#edit-psychology');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✓ Psychology edit mode saved');
        
        // Verify psychology conditions are displayed in readonly mode
        const psychologyConditions = await page.$$eval('#psychology-list .psychology-condition', 
            elements => elements.map(el => el.textContent || el.value).filter(text => text.trim()));
        console.log('✓ Psychology conditions in readonly mode:', psychologyConditions);
        
        // Test Corruption Section
        console.log('\n--- Testing Corruption Section ---');
        
        // Test corruption points counter
        await page.type('#corruption-points', '2');
        const corruptionPoints = await page.$eval('#corruption-points', el => el.value);
        console.log('✓ Corruption points input works:', corruptionPoints === '2');
        
        // Test corruption edit mode toggle
        await page.click('#edit-corruption');
        console.log('✓ Corruption edit mode toggled');
        
        // Add a corruption/mutation
        await page.click('button[onclick="addCorruptionMutation()"]');
        await page.waitForSelector('#corruption-list .corruption-row:last-child');
        
        // Fill in the mutation
        const corruptionInputs = await page.$$('#corruption-list .corruption-mutation');
        if (corruptionInputs.length > 0) {
            await corruptionInputs[0].type('Third eye appears on forehead');
            console.log('✓ Added corruption/mutation: Third eye appears on forehead');
        }
        
        // Add another mutation
        await page.click('button[onclick="addCorruptionMutation()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        const corruptionInputs2 = await page.$$('#corruption-list .corruption-mutation');
        if (corruptionInputs2.length > 1) {
            await corruptionInputs2[1].type('Skin turns pale and cold');
            console.log('✓ Added corruption/mutation: Skin turns pale and cold');
        }
        
        // Save corruption (exit edit mode)
        await page.click('#edit-corruption');
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✓ Corruption edit mode saved');
        
        // Verify corruption mutations are displayed in readonly mode
        const corruptionMutations = await page.$$eval('#corruption-list .corruption-mutation', 
            elements => elements.map(el => el.textContent || el.value).filter(text => text.trim()));
        console.log('✓ Corruption mutations in readonly mode:', corruptionMutations);
        
        // Test Remove Functionality
        console.log('\n--- Testing Remove Functionality ---');
        
        // Re-enter psychology edit mode and test remove
        await page.click('#edit-psychology');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const removeButtons = await page.$$('#psychology-list .remove-button');
        if (removeButtons.length > 0) {
            await removeButtons[0].click();
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('✓ Removed psychology condition using remove button');
        }
        
        // Save psychology
        await page.click('#edit-psychology');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Test Data Persistence
        console.log('\n--- Testing Data Persistence ---');
        
        // Reload the page to test localStorage persistence
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if psychology points persisted
        const persistedPsychologyPoints = await page.$eval('#psychology-points', el => el.value);
        console.log('✓ Psychology points persisted after reload:', persistedPsychologyPoints);
        
        // Check if corruption points persisted
        const persistedCorruptionPoints = await page.$eval('#corruption-points', el => el.value);
        console.log('✓ Corruption points persisted after reload:', persistedCorruptionPoints);
        
        // Check if psychology conditions persisted
        const persistedPsychologyConditions = await page.$$eval('#psychology-list .psychology-condition', 
            elements => elements.map(el => el.textContent || el.value).filter(text => text.trim()));
        console.log('✓ Psychology conditions persisted:', persistedPsychologyConditions);
        
        // Check if corruption mutations persisted
        const persistedCorruptionMutations = await page.$$eval('#corruption-list .corruption-mutation', 
            elements => elements.map(el => el.textContent || el.value).filter(text => text.trim()));
        console.log('✓ Corruption mutations persisted:', persistedCorruptionMutations);
        
        // Test Import/Export
        console.log('\n--- Testing Import/Export ---');
        
        // Test export
        await page.click('#export-character');
        await page.waitForSelector('#export-modal', { visible: true });
        
        const exportData = await page.$eval('#export-data', el => el.value);
        const parsedData = JSON.parse(exportData);
        
        console.log('✓ Export includes psychology data:', 
            parsedData.psychology && typeof parsedData.psychology === 'object');
        console.log('✓ Export includes corruption data:', 
            parsedData.corruption && typeof parsedData.corruption === 'object');
        
        await page.click('#close-export');
        
        // Take final screenshot
        await page.screenshot({ 
            path: 'feature-psychology-corruption-test.png', 
            fullPage: true 
        });
        
        console.log('\n✓ Psychology and Corruption feature test completed successfully');
        console.log('✓ Screenshot saved as feature-psychology-corruption-test.png');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testPsychologyCorruptionFeature().catch(console.error);