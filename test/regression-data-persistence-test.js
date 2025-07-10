const puppeteer = require('puppeteer');
const path = require('path');

async function regressionDataPersistenceTest() {
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
        
        console.log('\n=== Testing Data Persistence for Previously Broken Sections ===');
        
        // Test the sections that were not working before
        const testData = {
            psychology: 'Brave and fearless',
            corruption: 'Minor chaos taint',
            sb: '4',
            'tb-plus-2': '6',
            wpb: '3',
            hardy: '2',
            wounds: '15',
            'wealth-d': '20',
            'wealth-ss': '10',
            'wealth-gc': '3',
            'enc-weapons': '8',
            'enc-armour': '12',
            'enc-trappings': '15',
            'enc-max': '50',
            'short-ambition': 'Defeat the goblin king',
            'long-ambition': 'Establish a warrior academy',
            'party-name': 'The Sword Brothers',
            'party-short': 'Clear the mines',
            'party-long': 'Protect the realm',
            'party-members': 'Grimjaw, Elara, Thorin, Mystic'
        };
        
        // Enter test data
        for (const [fieldId, value] of Object.entries(testData)) {
            await page.type(`#${fieldId}`, value);
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        console.log('✓ Test data entered');
        
        // Wait for save
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check localStorage
        const localStorageData = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('\n=== Verifying Data Persistence ===');
        
        // Check specific sections that were problematic
        const results = {
            psychology: localStorageData.psychology === 'Brave and fearless',
            corruption: localStorageData.corruption === 'Minor chaos taint',
            wounds_sb: localStorageData.wounds.sb === 4,
            wounds_tbPlus2: localStorageData.wounds.tbPlus2 === 6,
            wounds_wpb: localStorageData.wounds.wpb === 3,
            wounds_hardy: localStorageData.wounds.hardy === 2,
            wounds_wounds: localStorageData.wounds.wounds === 15,
            wealth_d: localStorageData.wealth.d === 20,
            wealth_ss: localStorageData.wealth.ss === 10,
            wealth_gc: localStorageData.wealth.gc === 3,
            enc_weapons: localStorageData.encumbrance.weapons === 8,
            enc_armour: localStorageData.encumbrance.armour === 12,
            enc_trappings: localStorageData.encumbrance.trappings === 15,
            enc_max: localStorageData.encumbrance.max === 50,
            ambitions_short: localStorageData.ambitions.short === 'Defeat the goblin king',
            ambitions_long: localStorageData.ambitions.long === 'Establish a warrior academy',
            party_name: localStorageData.party.name === 'The Sword Brothers',
            party_short: localStorageData.party.short === 'Clear the mines',
            party_long: localStorageData.party.long === 'Protect the realm',
            party_members: localStorageData.party.members === 'Grimjaw, Elara, Thorin, Mystic'
        };
        
        let allPassed = true;
        for (const [field, passed] of Object.entries(results)) {
            if (passed) {
                console.log(`✓ ${field}: PASSED`);
            } else {
                console.log(`❌ ${field}: FAILED`);
                allPassed = false;
            }
        }
        
        // Check encumbrance total calculation
        const encTotal = await page.$eval('#enc-total', el => el.value);
        const expectedTotal = 8 + 12 + 15; // 35
        const encTotalCorrect = encTotal === expectedTotal.toString();
        
        console.log(`${encTotalCorrect ? '✓' : '❌'} Encumbrance total calculation: ${encTotal} (expected: ${expectedTotal})`);
        
        console.log('\n=== Test Summary ===');
        if (allPassed && encTotalCorrect) {
            console.log('🎉 All data persistence tests PASSED!');
            console.log('✓ Psychology section saves correctly');
            console.log('✓ Corruption section saves correctly');
            console.log('✓ Wounds section saves correctly');
            console.log('✓ Wealth section saves correctly');
            console.log('✓ Encumbrance section saves correctly');
            console.log('✓ Ambitions section saves correctly');
            console.log('✓ Party section saves correctly');
            console.log('✓ Encumbrance total calculation works correctly');
        } else {
            console.log('❌ Some tests failed - check the output above');
        }
        
        console.log('\n✓ Regression data persistence test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

regressionDataPersistenceTest().catch(console.error);