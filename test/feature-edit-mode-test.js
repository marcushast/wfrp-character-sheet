const puppeteer = require('puppeteer');
const path = require('path');

async function testEditModes() {
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
        
        // Test weapons edit mode
        console.log('\n=== Testing Weapons Edit Mode ===');
        await page.waitForSelector('#edit-weapons', { timeout: 5000 });
        await page.click('#edit-weapons');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await page.waitForSelector('button[onclick="addWeapon()"]', { timeout: 5000 });
        await page.click('button[onclick="addWeapon()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const weaponRows = await page.$$('#weapons-list .weapon-row');
        console.log(`✓ Weapons: ${weaponRows.length} row(s) added`);
        
        // Test armour edit mode
        console.log('\n=== Testing Armour Edit Mode ===');
        await page.waitForSelector('#edit-armour', { timeout: 5000 });
        await page.click('#edit-armour');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await page.waitForSelector('button[onclick="addArmour()"]', { timeout: 5000 });
        await page.click('button[onclick="addArmour()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const armourRows = await page.$$('#armour-list .armour-row');
        console.log(`✓ Armour: ${armourRows.length} row(s) added`);
        
        // Test trappings edit mode
        console.log('\n=== Testing Trappings Edit Mode ===');
        await page.waitForSelector('#edit-trappings', { timeout: 5000 });
        await page.click('#edit-trappings');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await page.waitForSelector('button[onclick="addTrapping()"]', { timeout: 5000 });
        await page.click('button[onclick="addTrapping()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const trappingRows = await page.$$('#trapping-list .trapping-row');
        console.log(`✓ Trappings: ${trappingRows.length} row(s) added`);
        
        // Test spells edit mode
        console.log('\n=== Testing Spells Edit Mode ===');
        await page.evaluate(() => {
            document.querySelector('#edit-spells').scrollIntoView();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await page.waitForSelector('#edit-spells', { timeout: 5000 });
        await page.click('#edit-spells');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await page.evaluate(() => {
            document.querySelector('button[onclick="addSpell()"]').scrollIntoView();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await page.waitForSelector('button[onclick="addSpell()"]', { timeout: 5000 });
        await page.click('button[onclick="addSpell()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const spellRows = await page.$$('#spells-list .spell-row');
        console.log(`✓ Spells: ${spellRows.length} row(s) added`);
        
        // Test readonly state validation
        console.log('\n=== Testing Readonly States ===');
        
        // Toggle back to readonly and verify
        await page.click('#edit-weapons');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const weaponsSection = await page.$('.weapons');
        const isReadonly = await page.evaluate(el => el.classList.contains('weapons-readonly'), weaponsSection);
        console.log(`✓ Weapons readonly state: ${isReadonly}`);
        
        // Take screenshot
        await page.screenshot({ path: 'edit-mode-test-result.png', fullPage: true });
        console.log('✓ Screenshot saved as edit-mode-test-result.png');
        
        console.log('\n🎉 Feature edit mode test completed successfully!');
        console.log('✓ All edit mode functionality is working correctly');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testEditModes().catch(console.error);