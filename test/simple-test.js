const puppeteer = require('puppeteer');
const path = require('path');

async function simpleTest() {
    const browser = await puppeteer.launch({ 
        headless: true
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to the character sheet
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('✓ Page loaded successfully');
        
        // Wait for the page to be ready
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test that key elements exist
        const nameInput = await page.$('#name');
        const wsInput = await page.$('#ws-initial');
        const addSkillBtn = await page.$('button[onclick="addAdvancedSkill()"]');
        const addTalentBtn = await page.$('button[onclick="addTalent()"]');
        const addWeaponBtn = await page.$('button[onclick="addWeapon()"]');
        
        console.log('Elements found:');
        console.log('- Name input:', nameInput ? '✓' : '❌');
        console.log('- WS input:', wsInput ? '✓' : '❌');
        console.log('- Add skill button:', addSkillBtn ? '✓' : '❌');
        console.log('- Add talent button:', addTalentBtn ? '✓' : '❌');
        console.log('- Add weapon button:', addWeaponBtn ? '✓' : '❌');
        
        // Test basic input
        if (nameInput) {
            await nameInput.type('Test Character');
            console.log('✓ Name input works');
        }
        
        if (wsInput) {
            await wsInput.type('35');
            console.log('✓ WS input works');
        }
        
        // Test if buttons are visible and enabled
        if (addSkillBtn) {
            const isVisible = await addSkillBtn.isIntersectingViewport();
            console.log('- Add skill button visible:', isVisible ? '✓' : '❌');
        }
        
        // Check page title
        const title = await page.title();
        console.log('✓ Page title:', title);
        
        // Get page content to verify it loaded
        const content = await page.content();
        const hasCharacterSheet = content.includes('character-sheet');
        console.log('✓ Contains character sheet:', hasCharacterSheet ? '✓' : '❌');
        
        // Take a screenshot
        await page.screenshot({ path: 'page-validation.png', fullPage: true });
        console.log('✓ Screenshot saved as page-validation.png');
        
        console.log('\n🎉 Basic page validation completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

simpleTest().catch(console.error);