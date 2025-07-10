const puppeteer = require('puppeteer');
const path = require('path');

async function debugPartyMembers() {
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
        
        // Clear localStorage first
        await page.evaluate(() => {
            localStorage.clear();
        });
        
        // Test party members field specifically
        await page.type('#party-members', 'Grimjaw, Elara, Thorin, Mystic');
        
        // Trigger change event
        await page.evaluate(() => {
            const event = new Event('change', { bubbles: true });
            document.getElementById('party-members').dispatchEvent(event);
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check localStorage
        const localStorageData = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            console.log('Raw localStorage data:', data);
            return data ? JSON.parse(data) : null;
        });
        
        if (localStorageData) {
            console.log('Party data in localStorage:', localStorageData.party);
            console.log('Expected: "Grimjaw, Elara, Thorin, Mystic"');
            console.log('Actual:', JSON.stringify(localStorageData.party.members));
        } else {
            console.log('No localStorage data found');
        }
        
        console.log('✓ Debug test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

debugPartyMembers().catch(console.error);