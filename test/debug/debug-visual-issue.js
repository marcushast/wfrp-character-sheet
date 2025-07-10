const puppeteer = require('puppeteer');
const path = require('path');

async function debugVisualIssue() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 500
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Debugging Visual Issue ===');
        
        // Wait for character sheet to load
        await page.waitForFunction(() => window.characterSheet !== undefined);
        console.log('✓ Character sheet loaded');
        
        // Check current edit mode state
        const editModeState = await page.evaluate(() => {
            return window.characterSheet.advancedSkillsEditMode;
        });
        console.log('Advanced skills edit mode:', editModeState);
        
        // Check what the edit button says
        const editButtonText = await page.$eval('#edit-advanced-skills', el => el.textContent);
        console.log('Edit button text:', editButtonText);
        
        // Check the advanced skills structure
        const advancedSkillsInfo = await page.evaluate(() => {
            const rows = document.querySelectorAll('#advanced-skills .skill-row');
            const info = [];
            
            rows.forEach((row, index) => {
                const nameElement = row.querySelector('.skill-name');
                const charElement = row.querySelector('.skill-char');
                
                info.push({
                    index: index,
                    nameTag: nameElement ? nameElement.tagName : 'NOT_FOUND',
                    nameType: nameElement ? (nameElement.tagName === 'INPUT' ? 'input' : 'div') : 'none',
                    nameValue: nameElement ? (nameElement.value || nameElement.textContent) : 'empty',
                    charTag: charElement ? charElement.tagName : 'NOT_FOUND',
                    charType: charElement ? (charElement.tagName === 'SELECT' ? 'select' : charElement.tagName === 'INPUT' ? 'input' : 'div') : 'none',
                    charValue: charElement ? (charElement.value || charElement.textContent) : 'empty'
                });
            });
            
            return info;
        });
        
        console.log('Advanced skills structure:');
        advancedSkillsInfo.forEach(skill => {
            console.log(`  Row ${skill.index}:`);
            console.log(`    Name: ${skill.nameTag} (${skill.nameType}) = "${skill.nameValue}"`);
            console.log(`    Char: ${skill.charTag} (${skill.charType}) = "${skill.charValue}"`);
        });
        
        // Check basic skills structure for comparison
        const basicSkillsInfo = await page.evaluate(() => {
            const rows = document.querySelectorAll('#basic-skills .skill-row');
            const info = [];
            
            // Just check first 3 rows
            for (let i = 0; i < Math.min(3, rows.length); i++) {
                const row = rows[i];
                const nameElement = row.querySelector('.skill-name');
                const charElement = row.querySelector('.skill-char');
                
                info.push({
                    index: i,
                    nameTag: nameElement ? nameElement.tagName : 'NOT_FOUND',
                    nameValue: nameElement ? nameElement.textContent : 'empty',
                    charTag: charElement ? charElement.tagName : 'NOT_FOUND',
                    charValue: charElement ? charElement.textContent : 'empty'
                });
            }
            
            return info;
        });
        
        console.log('\nBasic skills structure (first 3):');
        basicSkillsInfo.forEach(skill => {
            console.log(`  Row ${skill.index}:`);
            console.log(`    Name: ${skill.nameTag} = "${skill.nameValue}"`);
            console.log(`    Char: ${skill.charTag} = "${skill.charValue}"`);
        });
        
        // Check CSS classes on the advanced skills section
        const sectionClasses = await page.evaluate(() => {
            const section = document.getElementById('advanced-skills').closest('.skills');
            return section ? section.className : 'section not found';
        });
        console.log('\nAdvanced skills section classes:', sectionClasses);
        
        // Try to manually set read-only mode
        console.log('\nTrying to force read-only mode...');
        await page.evaluate(() => {
            if (window.characterSheet.advancedSkillsEditMode) {
                window.characterSheet.setAdvancedSkillsMode(false);
            }
        });
        
        // Check structure after forcing read-only
        const afterForceInfo = await page.evaluate(() => {
            const rows = document.querySelectorAll('#advanced-skills .skill-row');
            const info = [];
            
            rows.forEach((row, index) => {
                const nameElement = row.querySelector('.skill-name');
                const charElement = row.querySelector('.skill-char');
                
                info.push({
                    index: index,
                    nameTag: nameElement ? nameElement.tagName : 'NOT_FOUND',
                    charTag: charElement ? charElement.tagName : 'NOT_FOUND'
                });
            });
            
            return info;
        });
        
        console.log('After forcing read-only:');
        afterForceInfo.forEach(skill => {
            console.log(`  Row ${skill.index}: Name=${skill.nameTag}, Char=${skill.charTag}`);
        });
        
        // Take screenshot
        await page.screenshot({ 
            path: 'debug-visual-issue.png', 
            fullPage: true 
        });
        
        console.log('\n✓ Visual debug completed - screenshot saved');
        
        // Wait for manual inspection
        await page.waitForFunction(() => true, { timeout: 5000 }).catch(() => {});
        
    } catch (error) {
        console.error('❌ Visual debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugVisualIssue().catch(console.error);