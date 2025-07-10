const puppeteer = require('puppeteer');
const path = require('path');

async function debugEncumbrance() {
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
        
        // Test encumbrance field specifically
        console.log('Testing encumbrance field...');
        const encInput = await page.$('#enc-weapons');
        console.log('Found enc-weapons input:', encInput !== null);
        
        // Add event listener to see if change event is fired
        await page.evaluate(() => {
            const input = document.getElementById('enc-weapons');
            if (input) {
                input.addEventListener('change', () => {
                    console.log('Change event fired for enc-weapons');
                });
                input.addEventListener('input', () => {
                    console.log('Input event fired for enc-weapons');
                });
            }
        });
        
        // Type value
        await page.type('#enc-weapons', '8');
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Trigger change event manually
        await page.evaluate(() => {
            const input = document.getElementById('enc-weapons');
            if (input) {
                const event = new Event('change', { bubbles: true });
                input.dispatchEvent(event);
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check localStorage
        const localStorageData = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('Encumbrance data in localStorage:', localStorageData.encumbrance);
        
        console.log('✓ Debug test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

debugEncumbrance().catch(console.error);