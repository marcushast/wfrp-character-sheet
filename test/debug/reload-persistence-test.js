const puppeteer = require('puppeteer');
const path = require('path');

async function reloadPersistenceTest() {
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
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('\n=== STEP 1: Enter data in problematic sections ===');
        
        // Clear any existing data first
        await page.evaluate(() => {
            localStorage.clear();
        });
        
        // Reload to start fresh
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Enter data in the problematic sections
        await page.type('#psychology', 'Brave and determined warrior');
        await page.type('#corruption', 'Minor chaos mark on left arm');
        await page.type('#short-ambition', 'Defeat the orc chieftain');
        await page.type('#long-ambition', 'Become a legendary hero');
        await page.type('#party-name', 'The Brave Company');
        await page.type('#party-short', 'Clear the goblin caves');
        await page.type('#party-long', 'Save the borderlands');
        await page.type('#party-members', 'Grimjaw, Elara, Thorin');
        
        console.log('✓ Data entered in all problematic sections');
        
        // Wait for auto-save
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check what's in localStorage before reload
        const localStorageBeforeReload = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\n=== STEP 2: Check localStorage before reload ===');
        console.log('Psychology:', localStorageBeforeReload?.psychology);
        console.log('Corruption:', localStorageBeforeReload?.corruption);
        console.log('Ambitions:', localStorageBeforeReload?.ambitions);
        console.log('Party:', localStorageBeforeReload?.party);
        
        // Check the actual field values before reload
        const valuesBeforeReload = {};
        valuesBeforeReload.psychology = await page.$eval('#psychology', el => el.value);
        valuesBeforeReload.corruption = await page.$eval('#corruption', el => el.value);
        valuesBeforeReload.shortAmbition = await page.$eval('#short-ambition', el => el.value);
        valuesBeforeReload.longAmbition = await page.$eval('#long-ambition', el => el.value);
        valuesBeforeReload.partyName = await page.$eval('#party-name', el => el.value);
        valuesBeforeReload.partyShort = await page.$eval('#party-short', el => el.value);
        valuesBeforeReload.partyLong = await page.$eval('#party-long', el => el.value);
        valuesBeforeReload.partyMembers = await page.$eval('#party-members', el => el.value);
        
        console.log('\n=== STEP 3: Field values before reload ===');
        Object.entries(valuesBeforeReload).forEach(([key, value]) => {
            console.log(`${key}: "${value}"`);
        });
        
        console.log('\n=== STEP 4: Reload page ===');
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check localStorage after reload
        const localStorageAfterReload = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\n=== STEP 5: Check localStorage after reload ===');
        console.log('Psychology:', localStorageAfterReload?.psychology);
        console.log('Corruption:', localStorageAfterReload?.corruption);
        console.log('Ambitions:', localStorageAfterReload?.ambitions);
        console.log('Party:', localStorageAfterReload?.party);
        
        // Check the actual field values after reload
        const valuesAfterReload = {};
        valuesAfterReload.psychology = await page.$eval('#psychology', el => el.value);
        valuesAfterReload.corruption = await page.$eval('#corruption', el => el.value);
        valuesAfterReload.shortAmbition = await page.$eval('#short-ambition', el => el.value);
        valuesAfterReload.longAmbition = await page.$eval('#long-ambition', el => el.value);
        valuesAfterReload.partyName = await page.$eval('#party-name', el => el.value);
        valuesAfterReload.partyShort = await page.$eval('#party-short', el => el.value);
        valuesAfterReload.partyLong = await page.$eval('#party-long', el => el.value);
        valuesAfterReload.partyMembers = await page.$eval('#party-members', el => el.value);
        
        console.log('\n=== STEP 6: Field values after reload ===');
        Object.entries(valuesAfterReload).forEach(([key, value]) => {
            console.log(`${key}: "${value}"`);
        });
        
        console.log('\n=== STEP 7: Compare values ===');
        let allPersisted = true;
        Object.entries(valuesBeforeReload).forEach(([key, beforeValue]) => {
            const afterValue = valuesAfterReload[key];
            const persisted = beforeValue === afterValue;
            console.log(`${key}: ${persisted ? '✓' : '❌'} (before: "${beforeValue}", after: "${afterValue}")`);
            if (!persisted) allPersisted = false;
        });
        
        // Take screenshot
        await page.screenshot({ path: 'reload-persistence-test-result.png', fullPage: true });
        console.log('✓ Screenshot saved');
        
        if (allPersisted) {
            console.log('\n🎉 All data persisted correctly after reload!');
        } else {
            console.log('\n❌ Some data was lost after reload');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

reloadPersistenceTest().catch(console.error);