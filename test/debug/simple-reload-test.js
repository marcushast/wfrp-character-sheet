const puppeteer = require('puppeteer');
const path = require('path');

async function simpleReloadTest() {
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
        
        // Clear localStorage first
        await page.evaluate(() => {
            localStorage.clear();
        });
        
        // Reload to start fresh
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('\n=== Testing psychology field ===');
        
        // Test psychology field
        await page.focus('#psychology');
        await page.type('#psychology', 'Test psychology');
        
        // Manually trigger change event
        await page.evaluate(() => {
            const element = document.getElementById('psychology');
            const event = new Event('change', { bubbles: true });
            element.dispatchEvent(event);
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check localStorage
        const dataAfterEntry = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('Psychology in localStorage after entry:', dataAfterEntry?.psychology);
        
        // Reload page
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check field value after reload
        const fieldValueAfterReload = await page.$eval('#psychology', el => el.value);
        console.log('Psychology field value after reload:', JSON.stringify(fieldValueAfterReload));
        
        // Check localStorage after reload
        const dataAfterReload = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('Psychology in localStorage after reload:', dataAfterReload?.psychology);
        
        if (fieldValueAfterReload === 'Test psychology') {
            console.log('✅ Psychology field PERSISTED correctly');
        } else {
            console.log('❌ Psychology field LOST after reload');
        }
        
        console.log('\n✓ Simple reload test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

simpleReloadTest().catch(console.error);