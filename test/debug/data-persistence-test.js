const puppeteer = require('puppeteer');
const path = require('path');

async function testDataPersistence() {
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
        
        // Test 1: Fill out all sections that should persist
        console.log('\n=== Testing Data Entry for All Sections ===');
        
        // Basic character info
        await page.type('#name', 'Test Character');
        await page.type('#species', 'Human');
        await page.type('#class', 'Warrior');
        
        // Psychology and corruption
        await page.type('#psychology', 'Fearless in battle');
        await page.type('#corruption', 'Minor mutation on left hand');
        
        // Wounds
        await page.type('#sb', '4');
        await page.type('#tb-plus-2', '5');
        await page.type('#wpb', '3');
        await page.type('#hardy', '1');
        await page.type('#wounds', '13');
        
        // Wealth
        await page.type('#wealth-d', '10');
        await page.type('#wealth-ss', '5');
        await page.type('#wealth-gc', '2');
        
        // Encumbrance
        await page.type('#enc-weapons', '8');
        await page.type('#enc-armour', '12');
        await page.type('#enc-trappings', '15');
        await page.type('#enc-max', '45');
        
        // Ambitions
        await page.type('#short-ambition', 'Defeat the orc chieftain');
        await page.type('#long-ambition', 'Become a legendary warrior');
        
        // Party
        await page.type('#party-name', 'The Brave Company');
        await page.type('#party-short', 'Clear the dungeon');
        await page.type('#party-long', 'Save the kingdom');
        await page.type('#party-members', 'Grimjaw, Elara, Thorin');
        
        console.log('✓ All sections filled with test data');
        
        // Wait for data to save
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test 2: Check that encumbrance total is calculated
        const encTotal = await page.$eval('#enc-total', el => el.value);
        const expectedTotal = 8 + 12 + 15; // 35
        console.log(`✓ Encumbrance total calculated: ${encTotal} (expected: ${expectedTotal})`);
        
        // Test 3: Refresh page and verify data persists
        console.log('\n=== Testing Data Persistence After Page Refresh ===');
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if data persisted
        const savedData = {};
        savedData.name = await page.$eval('#name', el => el.value);
        savedData.species = await page.$eval('#species', el => el.value);
        savedData.class = await page.$eval('#class', el => el.value);
        savedData.psychology = await page.$eval('#psychology', el => el.value);
        savedData.corruption = await page.$eval('#corruption', el => el.value);
        savedData.sb = await page.$eval('#sb', el => el.value);
        savedData.tbPlus2 = await page.$eval('#tb-plus-2', el => el.value);
        savedData.wpb = await page.$eval('#wpb', el => el.value);
        savedData.hardy = await page.$eval('#hardy', el => el.value);
        savedData.wounds = await page.$eval('#wounds', el => el.value);
        savedData.wealthD = await page.$eval('#wealth-d', el => el.value);
        savedData.wealthSS = await page.$eval('#wealth-ss', el => el.value);
        savedData.wealthGC = await page.$eval('#wealth-gc', el => el.value);
        savedData.encWeapons = await page.$eval('#enc-weapons', el => el.value);
        savedData.encArmour = await page.$eval('#enc-armour', el => el.value);
        savedData.encTrappings = await page.$eval('#enc-trappings', el => el.value);
        savedData.encMax = await page.$eval('#enc-max', el => el.value);
        savedData.encTotal = await page.$eval('#enc-total', el => el.value);
        savedData.shortAmbition = await page.$eval('#short-ambition', el => el.value);
        savedData.longAmbition = await page.$eval('#long-ambition', el => el.value);
        savedData.partyName = await page.$eval('#party-name', el => el.value);
        savedData.partyShort = await page.$eval('#party-short', el => el.value);
        savedData.partyLong = await page.$eval('#party-long', el => el.value);
        savedData.partyMembers = await page.$eval('#party-members', el => el.value);
        
        // Verify all data persisted
        const expectedData = {
            name: 'Test Character',
            species: 'Human',
            class: 'Warrior',
            psychology: 'Fearless in battle',
            corruption: 'Minor mutation on left hand',
            sb: '4',
            tbPlus2: '5',
            wpb: '3',
            hardy: '1',
            wounds: '13',
            wealthD: '10',
            wealthSS: '5',
            wealthGC: '2',
            encWeapons: '8',
            encArmour: '12',
            encTrappings: '15',
            encMax: '45',
            encTotal: '35',
            shortAmbition: 'Defeat the orc chieftain',
            longAmbition: 'Become a legendary warrior',
            partyName: 'The Brave Company',
            partyShort: 'Clear the dungeon',
            partyLong: 'Save the kingdom',
            partyMembers: 'Grimjaw, Elara, Thorin'
        };
        
        let allDataPersisted = true;
        for (const [key, expectedValue] of Object.entries(expectedData)) {
            const actualValue = savedData[key];
            if (actualValue === expectedValue) {
                console.log(`✓ ${key}: ${actualValue}`);
            } else {
                console.log(`❌ ${key}: expected "${expectedValue}", got "${actualValue}"`);
                allDataPersisted = false;
            }
        }
        
        // Take screenshot
        await page.screenshot({ path: 'data-persistence-test-result.png', fullPage: true });
        console.log('✓ Screenshot saved as data-persistence-test-result.png');
        
        if (allDataPersisted) {
            console.log('\n🎉 Data persistence test completed successfully!');
            console.log('✓ All sections now properly save and load data');
        } else {
            console.log('\n❌ Some data did not persist correctly');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testDataPersistence().catch(console.error);