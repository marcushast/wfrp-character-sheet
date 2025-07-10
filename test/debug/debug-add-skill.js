const puppeteer = require('puppeteer');
const path = require('path');

async function debugAddSkill() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 800
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Debugging Add Skill ===');
        
        // Clear localStorage first
        await page.evaluate(() => {
            localStorage.clear();
        });
        
        // Reload to start fresh
        await page.reload({ waitUntil: 'networkidle0' });
        
        // Wait for character sheet to load
        await page.waitForFunction(() => window.characterSheet !== undefined);
        console.log('✓ Character sheet loaded fresh');
        
        // Check initial state
        let advancedRows = await page.$$('#advanced-skills .skill-row');
        console.log('Initial advanced skills rows:', advancedRows.length);
        
        // Enter edit mode
        console.log('\n1. Entering edit mode...');
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        // Check edit mode state
        const editModeAfterClick = await page.evaluate(() => {
            return window.characterSheet.advancedSkillsEditMode;
        });
        console.log('Edit mode after click:', editModeAfterClick);
        
        // Add a skill
        console.log('\n2. Adding a skill...');
        await page.click('button[onclick="addAdvancedSkill()"]');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        // Check how many rows we have now
        advancedRows = await page.$$('#advanced-skills .skill-row');
        console.log('After adding skill, rows:', advancedRows.length);
        
        // Fill in the skill
        if (advancedRows.length > 0) {
            console.log('\n3. Filling skill data...');
            const skillRow = advancedRows[0];
            
            // Check what elements are there
            const elements = await page.evaluate((row) => {
                const nameEl = row.querySelector('.skill-name');
                const charEl = row.querySelector('.skill-char');
                return {
                    nameTag: nameEl ? nameEl.tagName : 'NOT_FOUND',
                    charTag: charEl ? charEl.tagName : 'NOT_FOUND',
                    nameType: nameEl ? nameEl.type || 'no-type' : 'none',
                    charType: charEl ? charEl.type || 'no-type' : 'none'
                };
            }, skillRow);
            
            console.log('Elements in edit mode:', elements);
            
            // Fill the data
            await skillRow.$eval('.skill-name', el => el.value = 'Perform (Slam Poetry)');
            await skillRow.$eval('.skill-char', el => el.value = 'Int');
            await skillRow.$eval('.skill-adv input', el => el.value = '5');
            
            console.log('✓ Filled skill data');
        }
        
        // Exit edit mode
        console.log('\n4. Exiting edit mode...');
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        // Check final state
        const finalEditMode = await page.evaluate(() => {
            return window.characterSheet.advancedSkillsEditMode;
        });
        console.log('Edit mode after exit:', finalEditMode);
        
        // Check the final structure
        const finalRows = await page.$$('#advanced-skills .skill-row');
        console.log('Final rows count:', finalRows.length);
        
        if (finalRows.length > 0) {
            const finalStructure = await page.evaluate(() => {
                const rows = document.querySelectorAll('#advanced-skills .skill-row');
                const info = [];
                
                rows.forEach((row, index) => {
                    const nameElement = row.querySelector('.skill-name');
                    const charElement = row.querySelector('.skill-char');
                    
                    info.push({
                        index: index,
                        nameTag: nameElement ? nameElement.tagName : 'NOT_FOUND',
                        nameValue: nameElement ? (nameElement.value || nameElement.textContent) : 'empty',
                        charTag: charElement ? charElement.tagName : 'NOT_FOUND',
                        charValue: charElement ? (charElement.value || charElement.textContent) : 'empty',
                        nameReadonly: nameElement && nameElement.hasAttribute ? nameElement.hasAttribute('readonly') : false,
                        charReadonly: charElement && charElement.hasAttribute ? charElement.hasAttribute('readonly') : false
                    });
                });
                
                return info;
            });
            
            console.log('\nFinal structure:');
            finalStructure.forEach(skill => {
                console.log(`  Row ${skill.index}:`);
                console.log(`    Name: ${skill.nameTag} = "${skill.nameValue}" (readonly: ${skill.nameReadonly})`);
                console.log(`    Char: ${skill.charTag} = "${skill.charValue}" (readonly: ${skill.charReadonly})`);
            });
        }
        
        // Take screenshot
        await page.screenshot({ 
            path: 'debug-add-skill.png', 
            fullPage: true 
        });
        
        console.log('\n✓ Add skill debug completed - screenshot saved');
        
        // Wait for manual inspection
        await page.waitForFunction(() => true, { timeout: 5000 }).catch(() => {});
        
    } catch (error) {
        console.error('❌ Add skill debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugAddSkill().catch(console.error);