// bug-advanced-skills-import-test.js
const puppeteer = require('puppeteer');
const path = require('path');

async function testAdvancedSkillsImportBug() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        // Capture console logs
        page.on('console', msg => console.log('BROWSER:', msg.text()));
        page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Bug: Advanced Skills Import Issue ===');
        
        // First, create some advanced skills to export
        console.log('1. Adding advanced skills to test export/import...');
        
        // Switch to edit mode
        await page.click('#edit-advanced-skills');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Add first advanced skill
        await page.click('button[onclick="addAdvancedSkill()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const firstSkillRow = await page.$('#advanced-skills .skill-row:last-child');
        await firstSkillRow.$eval('.skill-name', el => el.value = 'Stealth (Rural)');
        await firstSkillRow.$eval('.skill-char', el => el.value = 'Ag');
        await firstSkillRow.$eval('.skill-adv input', el => el.value = '10');
        
        // Add second advanced skill
        await page.click('button[onclick="addAdvancedSkill()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const secondSkillRow = await page.$('#advanced-skills .skill-row:last-child');
        await secondSkillRow.$eval('.skill-name', el => el.value = 'Lore (History)');
        await secondSkillRow.$eval('.skill-char', el => el.value = 'Int');
        await secondSkillRow.$eval('.skill-adv input', el => el.value = '15');
        
        // Save the skills (exit edit mode)
        await page.click('#edit-advanced-skills');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('2. Exporting character data...');
        
        // Export the character
        await page.evaluate(() => {
            exportCharacter();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get the exported data
        const exportedData = await page.$eval('#export-data', el => el.value);
        console.log('Exported data contains advanced skills:', exportedData.includes('advancedSkills'));
        
        // Close export modal
        await page.evaluate(() => {
            closeExportModal();
        });
        
        console.log('3. Clearing current character data...');
        
        // Clear localStorage to simulate fresh start
        await page.evaluate(() => {
            localStorage.clear();
            location.reload();
        });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('4. Importing character data...');
        
        // Import the character data
        await page.evaluate(() => {
            importCharacter();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Paste the data and confirm import
        await page.$eval('#import-data', (el, data) => el.value = data, exportedData);
        await page.evaluate(() => {
            confirmImport();
        });
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('5. Checking if advanced skills were imported correctly...');
        
        // Check if advanced skills are visible in the DOM
        const advancedSkillRows = await page.$$('#advanced-skills .skill-row');
        console.log(`Found ${advancedSkillRows.length} advanced skill rows in DOM`);
        
        if (advancedSkillRows.length === 0) {
            console.log('❌ BUG REPRODUCED: No advanced skills visible after import');
            
            // Check if the data is actually in the character object
            const characterData = await page.evaluate(() => {
                return window.characterSheet ? JSON.stringify(window.characterSheet.character.advancedSkills) : null;
            });
            
            console.log('Advanced skills in character object:', characterData);
            
            // Also check the state data
            const stateData = await page.evaluate(() => {
                return window.characterSheet ? JSON.stringify(window.characterSheet.state.data.advancedSkills) : null;
            });
            console.log('Advanced skills in state data:', stateData);
            
            if (characterData && characterData.length > 0) {
                console.log('❌ Data is imported but not rendered to DOM');
            } else {
                console.log('❌ Data was not imported at all');
            }
        } else {
            console.log('✓ Advanced skills are visible after import');
            
            // Verify the specific skills
            for (let i = 0; i < advancedSkillRows.length; i++) {
                const skillName = await advancedSkillRows[i].$eval('.skill-name', el => 
                    el.value || el.textContent || el.innerText
                );
                const skillChar = await advancedSkillRows[i].$eval('.skill-char', el => 
                    el.value || el.textContent || el.innerText
                );
                const skillAdv = await advancedSkillRows[i].$eval('.skill-adv input', el => el.value);
                
                console.log(`Skill ${i + 1}: ${skillName} (${skillChar}) +${skillAdv}`);
            }
        }
        
        // Take screenshot for documentation
        await page.screenshot({ 
            path: 'bug-advanced-skills-import-test.png', 
            fullPage: true 
        });
        
        console.log('✓ Bug test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testAdvancedSkillsImportBug().catch(console.error);