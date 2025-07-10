const puppeteer = require('puppeteer');
const path = require('path');

async function quickDataTest() {
    const browser = await puppeteer.launch({ 
        headless: true,
        slowMo: 100
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 1000 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('✓ Page loaded successfully');
        
        // Wait for JavaScript to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test psychology field
        await page.type('#psychology', 'Test psychology');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Test corruption field
        await page.type('#corruption', 'Test corruption');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Test wounds field
        await page.type('#sb', '4');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Test wealth field
        await page.type('#wealth-d', '10');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Test encumbrance field
        await page.type('#enc-weapons', '8');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('✓ Test data entered');
        
        // Wait for save
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check values
        const psychology = await page.$eval('#psychology', el => el.value);
        const corruption = await page.$eval('#corruption', el => el.value);
        const sb = await page.$eval('#sb', el => el.value);
        const wealthD = await page.$eval('#wealth-d', el => el.value);
        const encWeapons = await page.$eval('#enc-weapons', el => el.value);
        
        console.log(`Psychology: ${psychology}`);
        console.log(`Corruption: ${corruption}`);
        console.log(`SB: ${sb}`);
        console.log(`Wealth D: ${wealthD}`);
        console.log(`Enc Weapons: ${encWeapons}`);
        
        // Check localStorage
        const localStorageData = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('LocalStorage data:', JSON.stringify(localStorageData, null, 2));
        
        console.log('✓ Quick data test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

quickDataTest().catch(console.error);