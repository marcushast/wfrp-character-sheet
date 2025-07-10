const puppeteer = require('puppeteer');
const path = require('path');

async function testAmbitionsAndParty() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
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
        
        console.log('\\n=== Testing Ambitions and Party Long-term Fields ===');
        
        // Scroll to ambitions section
        await page.evaluate(() => {
            document.querySelector('#short-ambition').scrollIntoView();
        });
        
        // Test data for ambitions and party
        const testData = [
            { id: 'short-ambition', value: 'Test short ambition data', label: 'Short Ambition' },
            { id: 'long-ambition', value: 'Test long ambition data that is much longer and more detailed', label: 'Long Ambition' },
            { id: 'party-name', value: 'Test Party Name', label: 'Party Name' },
            { id: 'party-short', value: 'Test party short goal', label: 'Party Short' },
            { id: 'party-long', value: 'Test party long-term goal that spans multiple adventures', label: 'Party Long' },
            { id: 'party-members', value: 'Alice (Warrior), Bob (Wizard), Charlie (Rogue)', label: 'Party Members' }
        ];
        
        // Enter test data
        for (const item of testData) {
            console.log(`Entering data for ${item.label}...`);
            
            // Clear field first
            await page.focus(`#${item.id}`);
            await page.keyboard.down('Meta'); // Cmd on Mac
            await page.keyboard.press('a');
            await page.keyboard.up('Meta');
            await page.keyboard.press('Backspace');
            
            // Type new value
            await page.type(`#${item.id}`, item.value);
            
            // Trigger change event
            await page.evaluate((id) => {
                const element = document.getElementById(id);
                if (element) {
                    const event = new Event('change', { bubbles: true });
                    element.dispatchEvent(event);
                    console.log(`Change event fired for ${id}`);
                }
            }, item.id);
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log('✓ All test data entered');
        
        // Check localStorage before reload
        const dataBeforeReload = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\\n=== Data in localStorage before reload ===');
        console.log('Short ambition:', dataBeforeReload?.ambitions?.short || 'MISSING');
        console.log('Long ambition:', dataBeforeReload?.ambitions?.long || 'MISSING');
        console.log('Party name:', dataBeforeReload?.party?.name || 'MISSING');
        console.log('Party short:', dataBeforeReload?.party?.short || 'MISSING');
        console.log('Party long:', dataBeforeReload?.party?.long || 'MISSING');
        console.log('Party members:', dataBeforeReload?.party?.members || 'MISSING');
        
        // Take screenshot before reload
        await page.screenshot({ path: 'ambitions-party-before-reload.png', fullPage: true });
        
        // Reload page
        console.log('\\n=== Reloading page ===');
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('✓ Page reloaded');
        
        // Scroll to ambitions section again
        await page.evaluate(() => {
            document.querySelector('#short-ambition').scrollIntoView();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check field values after reload
        const fieldValuesAfterReload = {};
        for (const item of testData) {
            fieldValuesAfterReload[item.id] = await page.$eval(`#${item.id}`, el => el.value);
        }
        
        // Check localStorage after reload
        const dataAfterReload = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\\n=== Data in localStorage after reload ===');
        console.log('Short ambition:', dataAfterReload?.ambitions?.short || 'MISSING');
        console.log('Long ambition:', dataAfterReload?.ambitions?.long || 'MISSING');
        console.log('Party name:', dataAfterReload?.party?.name || 'MISSING');
        console.log('Party short:', dataAfterReload?.party?.short || 'MISSING');
        console.log('Party long:', dataAfterReload?.party?.long || 'MISSING');
        console.log('Party members:', dataAfterReload?.party?.members || 'MISSING');
        
        console.log('\\n=== Field Values After Reload ===');
        for (const item of testData) {
            const actualValue = fieldValuesAfterReload[item.id];
            const expectedValue = item.value;
            const persisted = actualValue === expectedValue;
            console.log(`${item.label}: ${persisted ? '✅' : '❌'}`);
            console.log(`  Expected: "${expectedValue}"`);
            console.log(`  Got: "${actualValue}"`);
        }
        
        // Take screenshot after reload
        await page.screenshot({ path: 'ambitions-party-after-reload.png', fullPage: true });
        
        console.log('\\n=== Manual Testing Instructions ===');
        console.log('1. Check that all text areas contain the expected values');
        console.log('2. Try manually editing the long-ambition and party-long fields');
        console.log('3. Reload the page and verify the data persists');
        
        // Keep browser open for manual inspection
        console.log('\\nBrowser kept open for manual inspection. Press Ctrl+C to close.');
        await new Promise(resolve => setTimeout(resolve, 60000)); // Keep open for 1 minute
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testAmbitionsAndParty().catch(console.error);