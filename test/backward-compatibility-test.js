const puppeteer = require('puppeteer');
const path = require('path');

async function backwardCompatibilityTest() {
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
        
        console.log('\n=== Simulating old localStorage data (without new fields) ===');
        
        // Simulate old localStorage data without the new fields
        const oldCharacterData = {
            name: 'Old Character',
            species: 'Human',
            class: 'Warrior',
            characteristics: {
                ws: { initial: 35, advances: 5 },
                bs: { initial: 30, advances: 0 }
            },
            // Notice: psychology, corruption, wealth, encumbrance are missing
            ambitions: { short: '', long: '' },
            party: { name: '', short: '', long: '', members: '' }
        };
        
        // Set old data in localStorage
        await page.evaluate((data) => {
            localStorage.setItem('wfrp-character', JSON.stringify(data));
        }, oldCharacterData);
        
        // Reload page to load the old data
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✓ Page reloaded with old localStorage data');
        
        // Check what was loaded
        const loadedData = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\n=== Checking loaded data structure ===');
        console.log('Has psychology field:', 'psychology' in loadedData);
        console.log('Has corruption field:', 'corruption' in loadedData);
        console.log('Has wealth field:', 'wealth' in loadedData);
        console.log('Has encumbrance field:', 'encumbrance' in loadedData);
        
        // Check field values
        const fieldValues = {};
        fieldValues.psychology = await page.$eval('#psychology', el => el.value);
        fieldValues.corruption = await page.$eval('#corruption', el => el.value);
        fieldValues.shortAmbition = await page.$eval('#short-ambition', el => el.value);
        fieldValues.longAmbition = await page.$eval('#long-ambition', el => el.value);
        fieldValues.partyName = await page.$eval('#party-name', el => el.value);
        fieldValues.partyShort = await page.$eval('#party-short', el => el.value);
        fieldValues.partyLong = await page.$eval('#party-long', el => el.value);
        fieldValues.partyMembers = await page.$eval('#party-members', el => el.value);
        
        console.log('\n=== Field values after loading old data ===');
        Object.entries(fieldValues).forEach(([key, value]) => {
            console.log(`${key}: "${value}"`);
        });
        
        console.log('\n=== Testing data entry and persistence ===');
        
        // Enter new data
        await page.focus('#psychology');
        await page.type('#psychology', 'New psychology data');
        
        await page.focus('#corruption');
        await page.type('#corruption', 'New corruption data');
        
        await page.focus('#short-ambition');
        await page.type('#short-ambition', 'New short ambition');
        
        await page.focus('#party-name');
        await page.type('#party-name', 'New party name');
        
        // Trigger change events
        await page.evaluate(() => {
            ['psychology', 'corruption', 'short-ambition', 'party-name'].forEach(id => {
                const element = document.getElementById(id);
                const event = new Event('change', { bubbles: true });
                element.dispatchEvent(event);
            });
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check localStorage after entry
        const dataAfterEntry = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\n=== localStorage after new data entry ===');
        console.log('Psychology:', dataAfterEntry?.psychology);
        console.log('Corruption:', dataAfterEntry?.corruption);
        console.log('Short ambition:', dataAfterEntry?.ambitions?.short);
        console.log('Party name:', dataAfterEntry?.party?.name);
        
        // Reload again
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check field values after final reload
        const finalFieldValues = {};
        finalFieldValues.psychology = await page.$eval('#psychology', el => el.value);
        finalFieldValues.corruption = await page.$eval('#corruption', el => el.value);
        finalFieldValues.shortAmbition = await page.$eval('#short-ambition', el => el.value);
        finalFieldValues.partyName = await page.$eval('#party-name', el => el.value);
        
        console.log('\n=== Field values after final reload ===');
        Object.entries(finalFieldValues).forEach(([key, value]) => {
            console.log(`${key}: "${value}"`);
        });
        
        // Check final localStorage
        const finalData = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\n=== Final localStorage ===');
        console.log('Psychology:', finalData?.psychology);
        console.log('Corruption:', finalData?.corruption);
        console.log('Short ambition:', finalData?.ambitions?.short);
        console.log('Party name:', finalData?.party?.name);
        
        const persistent = {
            psychology: finalFieldValues.psychology === 'New psychology data',
            corruption: finalFieldValues.corruption === 'New corruption data',
            shortAmbition: finalFieldValues.shortAmbition === 'New short ambition',
            partyName: finalFieldValues.partyName === 'New party name'
        };
        
        console.log('\n=== Persistence Test Results ===');
        Object.entries(persistent).forEach(([key, persisted]) => {
            console.log(`${key}: ${persisted ? '✅ PERSISTED' : '❌ LOST'}`);
        });
        
        console.log('\n✓ Backward compatibility test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

backwardCompatibilityTest().catch(console.error);