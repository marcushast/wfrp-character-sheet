const puppeteer = require('puppeteer');
const path = require('path');

async function testCleanState() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 500
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Clean State ===');
        
        // Step 1: Clear all localStorage
        console.log('\n1. Clearing localStorage...');
        await page.evaluate(() => {
            localStorage.clear();
            console.log('localStorage cleared');
        });
        
        // Step 2: Reload the page
        console.log('\n2. Reloading page...');
        await page.reload({ waitUntil: 'networkidle0' });
        
        // Wait for character sheet to load
        await page.waitForFunction(() => window.characterSheet !== undefined);
        console.log('✓ Character sheet loaded');
        
        // Step 3: Check initial state
        console.log('\n3. Checking initial state...');
        const initialState = await page.evaluate(() => {
            return {
                editMode: window.characterSheet.advancedSkillsEditMode,
                skillsCount: document.querySelectorAll('#advanced-skills .skill-row').length,
                buttonText: document.getElementById('edit-advanced-skills').textContent
            };
        });
        console.log('Initial state:', initialState);
        
        // Step 4: Add some basic character info to test normal functionality
        console.log('\n4. Adding character info...');
        await page.type('#name', 'Test Character');
        await page.type('#species', 'Human');
        
        // Step 5: Add an advanced skill properly
        console.log('\n5. Adding advanced skill...');
        
        // Enter edit mode
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 500 }).catch(() => {});
        
        // Add skill
        await page.click('button[onclick="addAdvancedSkill()"]');
        await page.waitForFunction(() => true, { timeout: 500 }).catch(() => {});
        
        // Fill skill data
        const skillRows = await page.$$('#advanced-skills .skill-row');
        if (skillRows.length > 0) {
            await skillRows[0].$eval('.skill-name', el => el.value = 'Perform (Slam Poetry)');
            await skillRows[0].$eval('.skill-char', el => el.value = 'Int');
            await skillRows[0].$eval('.skill-adv input', el => el.value = '5');
            console.log('✓ Filled skill data');
        }
        
        // Exit edit mode
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        // Step 6: Verify final appearance
        console.log('\n6. Verifying final appearance...');
        const finalState = await page.evaluate(() => {
            const rows = document.querySelectorAll('#advanced-skills .skill-row');
            const basicRows = document.querySelectorAll('#basic-skills .skill-row');
            
            const advancedInfo = [];
            rows.forEach((row, index) => {
                const nameEl = row.querySelector('.skill-name');
                const charEl = row.querySelector('.skill-char');
                advancedInfo.push({
                    index: index,
                    nameTag: nameEl ? nameEl.tagName : 'NOT_FOUND',
                    charTag: charEl ? charEl.tagName : 'NOT_FOUND',
                    nameText: nameEl ? (nameEl.textContent || nameEl.value) : '',
                    charText: charEl ? (charEl.textContent || charEl.value) : ''
                });
            });
            
            const basicInfo = [];
            for (let i = 0; i < Math.min(2, basicRows.length); i++) {
                const row = basicRows[i];
                const nameEl = row.querySelector('.skill-name');
                const charEl = row.querySelector('.skill-char');
                basicInfo.push({
                    index: i,
                    nameTag: nameEl ? nameEl.tagName : 'NOT_FOUND',
                    charTag: charEl ? charEl.tagName : 'NOT_FOUND',
                    nameText: nameEl ? nameEl.textContent : '',
                    charText: charEl ? charEl.textContent : ''
                });
            }
            
            return {
                editMode: window.characterSheet.advancedSkillsEditMode,
                buttonText: document.getElementById('edit-advanced-skills').textContent,
                advanced: advancedInfo,
                basic: basicInfo
            };
        });
        
        console.log('Final state:');
        console.log('  Edit mode:', finalState.editMode);
        console.log('  Button text:', finalState.buttonText);
        console.log('  Basic skills structure:');
        finalState.basic.forEach(skill => {
            console.log(`    ${skill.nameTag}: "${skill.nameText}" | ${skill.charTag}: "${skill.charText}"`);
        });
        console.log('  Advanced skills structure:');
        finalState.advanced.forEach(skill => {
            console.log(`    ${skill.nameTag}: "${skill.nameText}" | ${skill.charTag}: "${skill.charText}"`);
        });
        
        // Step 7: Test reload persistence
        console.log('\n7. Testing reload persistence...');
        await page.reload({ waitUntil: 'networkidle0' });
        await page.waitForFunction(() => window.characterSheet !== undefined);
        
        const afterReloadState = await page.evaluate(() => {
            const rows = document.querySelectorAll('#advanced-skills .skill-row');
            const info = [];
            rows.forEach((row, index) => {
                const nameEl = row.querySelector('.skill-name');
                const charEl = row.querySelector('.skill-char');
                info.push({
                    nameTag: nameEl ? nameEl.tagName : 'NOT_FOUND',
                    charTag: charEl ? charEl.tagName : 'NOT_FOUND',
                    nameText: nameEl ? (nameEl.textContent || nameEl.value) : '',
                    charText: charEl ? (charEl.textContent || charEl.value) : ''
                });
            });
            
            return {
                editMode: window.characterSheet.advancedSkillsEditMode,
                buttonText: document.getElementById('edit-advanced-skills').textContent,
                skills: info
            };
        });
        
        console.log('After reload:');
        console.log('  Edit mode:', afterReloadState.editMode);
        console.log('  Button text:', afterReloadState.buttonText);
        console.log('  Skills structure:');
        afterReloadState.skills.forEach((skill, index) => {
            console.log(`    ${skill.nameTag}: "${skill.nameText}" | ${skill.charTag}: "${skill.charText}"`);
        });
        
        // Take screenshot
        await page.screenshot({ 
            path: 'test-clean-state.png', 
            fullPage: true 
        });
        
        console.log('\n✓ Clean state test completed - screenshot saved');
        console.log('\nThe advanced skills should now look identical to basic skills.');
        console.log('If you still see input fields, try refreshing your browser or clearing your cache.');
        
        // Wait for manual inspection
        await page.waitForFunction(() => true, { timeout: 5000 }).catch(() => {});
        
    } catch (error) {
        console.error('❌ Clean state test failed:', error);
    } finally {
        await browser.close();
    }
}

testCleanState().catch(console.error);