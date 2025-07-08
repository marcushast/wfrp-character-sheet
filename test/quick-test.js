const puppeteer = require('puppeteer');
const path = require('path');

async function quickTest() {
    const browser = await puppeteer.launch({ 
        headless: true
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to the character sheet
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath);
        
        console.log('✓ Page loaded successfully');
        
        // Test basic functionality
        await page.type('#name', 'Test Character');
        await page.type('#species', 'Human');
        await page.type('#ws-initial', '35');
        
        // Test adding an advanced skill
        await page.click('button[onclick="addAdvancedSkill()"]');
        await page.waitForSelector('#advanced-skills .skill-row', { timeout: 5000 });
        
        // Test adding a talent
        await page.click('button[onclick="addTalent()"]');
        await page.waitForSelector('#talents-list .talent-row', { timeout: 5000 });
        
        // Test adding a weapon
        await page.click('button[onclick="addWeapon()"]');
        await page.waitForSelector('#weapons-list .weapon-row', { timeout: 5000 });
        
        console.log('✓ Basic interactions work');
        console.log('✓ Dynamic content creation works');
        console.log('✓ Character sheet is functional');
        
        // Take a screenshot
        await page.screenshot({ path: 'quick-test-result.png', fullPage: true });
        console.log('✓ Screenshot saved');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

quickTest().catch(console.error);