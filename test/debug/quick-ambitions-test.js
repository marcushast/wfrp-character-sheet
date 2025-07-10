const puppeteer = require('puppeteer');
const path = require('path');

async function quickAmbitionsTest() {
    const browser = await puppeteer.launch({ 
        headless: true,
        slowMo: 50
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 1000 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('✓ Page loaded');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Clear localStorage
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test the specific fields
        const testFields = [
            { id: 'long-ambition', value: 'Long term ambition test' },
            { id: 'party-long', value: 'Party long term goal test' }
        ];
        
        for (const field of testFields) {
            await page.focus(`#${field.id}`);
            await page.type(`#${field.id}`, field.value);
            await page.evaluate((id) => {
                const element = document.getElementById(id);
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            }, field.id);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Check localStorage
        const dataBefore = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('Before reload:');
        console.log('Long ambition:', dataBefore?.ambitions?.long || 'MISSING');
        console.log('Party long:', dataBefore?.party?.long || 'MISSING');
        
        // Reload and check
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const longAmbitionValue = await page.$eval('#long-ambition', el => el.value);
        const partyLongValue = await page.$eval('#party-long', el => el.value);
        
        console.log('After reload:');
        console.log('Long ambition field:', longAmbitionValue || 'EMPTY');
        console.log('Party long field:', partyLongValue || 'EMPTY');
        
        const dataAfter = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('localStorage after reload:');
        console.log('Long ambition:', dataAfter?.ambitions?.long || 'MISSING');
        console.log('Party long:', dataAfter?.party?.long || 'MISSING');
        
        const longAmbitionPersisted = longAmbitionValue === 'Long term ambition test';
        const partyLongPersisted = partyLongValue === 'Party long term goal test';
        
        console.log('\\nResults:');
        console.log(`Long ambition: ${longAmbitionPersisted ? '✅ WORKING' : '❌ BROKEN'}`);
        console.log(`Party long: ${partyLongPersisted ? '✅ WORKING' : '❌ BROKEN'}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

quickAmbitionsTest().catch(console.error);