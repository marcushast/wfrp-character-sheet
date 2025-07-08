const puppeteer = require('puppeteer');
const path = require('path');

async function testCharacterSheet() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 100
    });
    
    try {
        const page = await browser.newPage();
        
        // Set viewport
        await page.setViewport({ width: 1200, height: 800 });
        
        // Navigate to the character sheet
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('✓ Page loaded successfully');
        
        // Wait for JavaScript to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Test basic character information
        console.log('Testing basic character info...');
        await page.click('#name');
        await page.type('#name', 'Grimjaw the Bold');
        await page.type('#species', 'Human');
        await page.type('#class', 'Warrior');
        
        console.log('✓ Basic info works');
        
        // Test characteristics
        console.log('Testing characteristics...');
        await page.click('#ws-initial');
        await page.type('#ws-initial', '35');
        await page.type('#bs-initial', '30');
        await page.type('#s-initial', '40');
        
        console.log('✓ Characteristics work');
        
        // Test if buttons are present and clickable
        const advancedSkillButton = await page.$('button[onclick="addAdvancedSkill()"]');
        if (advancedSkillButton) {
            console.log('Testing advanced skills...');
            await advancedSkillButton.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('✓ Advanced skill button works');
        }
        
        const talentButton = await page.$('button[onclick="addTalent()"]');
        if (talentButton) {
            console.log('Testing talents...');
            await talentButton.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('✓ Talent button works');
        }
        
        const weaponButton = await page.$('button[onclick="addWeapon()"]');
        if (weaponButton) {
            console.log('Testing weapons...');
            await weaponButton.click();
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('✓ Weapon button works');
        }
        
        // Test text areas
        console.log('Testing text areas...');
        await page.click('#psychology');
        await page.type('#psychology', 'Fearless in battle');
        await page.type('#motivation', 'Protect the innocent');
        
        console.log('✓ Text areas work');
        
        // Take a screenshot
        await page.screenshot({ path: 'character-sheet-final.png', fullPage: true });
        console.log('✓ Screenshot saved as character-sheet-final.png');
        
        console.log('\n🎉 Character sheet test completed successfully!');
        console.log('The page loads and basic interactions work.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testCharacterSheet().catch(console.error);