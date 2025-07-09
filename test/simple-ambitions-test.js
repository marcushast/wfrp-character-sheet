const puppeteer = require('puppeteer');
const path = require('path');

async function simpleAmbitionsTest() {
    const browser = await puppeteer.launch({ 
        headless: true,
        slowMo: 100
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1400, height: 1000 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('✓ Page loaded');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Clear localStorage and reload
        await page.evaluate(() => localStorage.clear());
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        console.log('\\n=== Testing Long-term Fields ===');
        
        // Test long-ambition field
        console.log('Testing long-ambition field...');
        await page.evaluate(() => {
            const field = document.getElementById('long-ambition');
            field.value = 'Become the greatest warrior in the land';
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new Event('blur', { bubbles: true }));
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Test party-long field
        console.log('Testing party-long field...');
        await page.evaluate(() => {
            const field = document.getElementById('party-long');
            field.value = 'Save the kingdom from the ancient evil';
            field.dispatchEvent(new Event('change', { bubbles: true }));
            field.dispatchEvent(new Event('blur', { bubbles: true }));
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Check localStorage
        const dataBefore = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\\n=== Data before reload ===');
        console.log('Long ambition in localStorage:', dataBefore?.ambitions?.long || 'MISSING');
        console.log('Party long in localStorage:', dataBefore?.party?.long || 'MISSING');
        
        // Reload page
        console.log('\\n=== Reloading page ===');
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check field values
        const longAmbitionValue = await page.$eval('#long-ambition', el => el.value);
        const partyLongValue = await page.$eval('#party-long', el => el.value);
        
        console.log('\\n=== Values after reload ===');
        console.log('Long ambition field value:', `"${longAmbitionValue}"`);
        console.log('Party long field value:', `"${partyLongValue}"`);
        
        // Check localStorage after reload
        const dataAfter = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\\n=== localStorage after reload ===');
        console.log('Long ambition:', dataAfter?.ambitions?.long || 'MISSING');
        console.log('Party long:', dataAfter?.party?.long || 'MISSING');
        
        // Results
        const longAmbitionWorking = longAmbitionValue === 'Become the greatest warrior in the land';
        const partyLongWorking = partyLongValue === 'Save the kingdom from the ancient evil';
        
        console.log('\\n=== RESULTS ===');
        console.log(`Long ambition field: ${longAmbitionWorking ? '✅ WORKING' : '❌ BROKEN'}`);
        console.log(`Party long field: ${partyLongWorking ? '✅ WORKING' : '❌ BROKEN'}`);
        
        if (longAmbitionWorking && partyLongWorking) {
            console.log('\\n🎉 Both fields are working correctly!');
        } else {
            console.log('\\n❌ One or both fields are not persisting data correctly.');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

simpleAmbitionsTest().catch(console.error);