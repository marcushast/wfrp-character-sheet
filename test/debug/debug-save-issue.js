const puppeteer = require('puppeteer');
const path = require('path');

async function debugSaveIssue() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 300
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        // Add console logging
        page.on('console', msg => {
            console.log('PAGE LOG:', msg.text());
        });
        
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Debugging Save Issue ===');
        
        // Wait for the character sheet to be loaded
        await page.waitForFunction(() => window.characterSheet !== undefined);
        console.log('✓ Character sheet loaded');
        
        // Check if the character sheet has a saveCharacter method
        const hasMethod = await page.evaluate(() => {
            return typeof window.characterSheet.saveCharacter === 'function';
        });
        console.log('Has saveCharacter method:', hasMethod ? 'Yes' : 'No');
        
        // Check if the character object exists
        const hasCharacter = await page.evaluate(() => {
            return window.characterSheet.character !== undefined;
        });
        console.log('Has character object:', hasCharacter ? 'Yes' : 'No');
        
        // Try to save manually to see if it works
        console.log('\n--- Testing manual save ---');
        await page.evaluate(() => {
            console.log('About to call saveCharacter...');
            window.characterSheet.saveCharacter();
            console.log('saveCharacter called');
        });
        
        // Check if something was saved
        const savedData = await page.evaluate(() => {
            return localStorage.getItem('wfrp_character');
        });
        console.log('After manual save, localStorage has data:', savedData ? 'Yes' : 'No');
        
        // Add a skill and try to save
        console.log('\n--- Testing skill save ---');
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 500 }).catch(() => {});
        
        await page.click('button[onclick="addAdvancedSkill()"]');
        await page.waitForFunction(() => true, { timeout: 500 }).catch(() => {});
        
        // Fill the skill
        const skillRows = await page.$$('#advanced-skills .skill-row');
        if (skillRows.length > 0) {
            await skillRows[0].$eval('.skill-name', el => el.value = 'Debug Skill');
            await skillRows[0].$eval('.skill-char', el => el.value = 'Int');
            await skillRows[0].$eval('.skill-adv input', el => el.value = '25');
            console.log('✓ Filled skill data');
        }
        
        // Exit edit mode (should trigger save)
        console.log('Exiting edit mode...');
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        // Check if data was saved
        const savedDataAfterSkill = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp_character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('After skill save, localStorage has data:', savedDataAfterSkill ? 'Yes' : 'No');
        if (savedDataAfterSkill && savedDataAfterSkill.advancedSkills) {
            console.log('Advanced skills saved:', savedDataAfterSkill.advancedSkills);
        }
        
        console.log('\n✓ Debug completed');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugSaveIssue().catch(console.error);