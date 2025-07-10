const puppeteer = require('puppeteer');
const path = require('path');

async function debugAdvancedSkills() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 500
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Debugging Advanced Skills ===');
        
        // Check if edit button exists
        const editButton = await page.$('#edit-advanced-skills');
        console.log('Edit button exists:', editButton ? '✓' : '❌');
        
        // Add an advanced skill in edit mode
        console.log('\n1. Clicking Edit button...');
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        console.log('2. Adding a new advanced skill...');
        await page.click('button[onclick="addAdvancedSkill()"]');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        // Fill in the skill details
        console.log('3. Filling in skill details...');
        const skillRows = await page.$$('#advanced-skills .skill-row');
        console.log(`Found ${skillRows.length} skill rows`);
        
        if (skillRows.length > 0) {
            const lastRow = skillRows[skillRows.length - 1];
            
            // Fill name
            const nameInput = await lastRow.$('.skill-name');
            if (nameInput) {
                await nameInput.type('Test Skill');
                console.log('✓ Entered skill name');
            } else {
                console.log('❌ Could not find name input');
            }
            
            // Select characteristic
            const charSelect = await lastRow.$('.skill-char');
            if (charSelect) {
                await charSelect.select('Int');
                console.log('✓ Selected characteristic');
            } else {
                console.log('❌ Could not find characteristic select');
            }
            
            // Fill advances
            const advInput = await lastRow.$('.skill-adv input');
            if (advInput) {
                await advInput.evaluate(el => el.value = '');
                await advInput.type('10');
                console.log('✓ Entered advances');
            } else {
                console.log('❌ Could not find advances input');
            }
        }
        
        // Save (exit edit mode)
        console.log('\n4. Saving (exiting edit mode)...');
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        // Check the read-only display
        console.log('5. Checking read-only display...');
        const skillRowsAfter = await page.$$('#advanced-skills .skill-row');
        console.log(`Found ${skillRowsAfter.length} skill rows after save`);
        
        if (skillRowsAfter.length > 0) {
            const lastRow = skillRowsAfter[skillRowsAfter.length - 1];
            
            // Check if name is displayed as div
            const nameDiv = await lastRow.$('.skill-name');
            if (nameDiv) {
                const nameText = await nameDiv.evaluate(el => el.textContent);
                console.log('✓ Name displayed as div:', nameText);
            } else {
                console.log('❌ Name div not found');
            }
            
            // Check if characteristic is displayed as div
            const charDiv = await lastRow.$('.skill-char');
            if (charDiv) {
                const charText = await charDiv.evaluate(el => el.textContent);
                console.log('✓ Characteristic displayed as div:', charText);
            } else {
                console.log('❌ Characteristic div not found');
            }
        }
        
        // Take screenshot
        await page.screenshot({ 
            path: 'debug-advanced-skills.png', 
            fullPage: true 
        });
        
        console.log('\n✓ Debug test completed - screenshot saved');
        
        // Wait for manual inspection
        await page.waitForFunction(() => true, { timeout: 5000 }).catch(() => {});
        
    } catch (error) {
        console.error('❌ Debug test failed:', error);
    } finally {
        await browser.close();
    }
}

debugAdvancedSkills().catch(console.error);