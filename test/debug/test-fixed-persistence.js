const puppeteer = require('puppeteer');
const path = require('path');

async function testFixedPersistence() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 300
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Fixed Advanced Skills Persistence ===');
        
        // Clear any existing data
        await page.evaluate(() => {
            localStorage.clear();
        });
        
        // Wait for the character sheet to be loaded
        await page.waitForFunction(() => window.characterSheet !== undefined);
        console.log('✓ Character sheet loaded');
        
        // 1. Add skills in edit mode
        console.log('\n1. Adding advanced skills in edit mode...');
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 500 }).catch(() => {});
        
        // Add first skill
        await page.click('button[onclick="addAdvancedSkill()"]');
        await page.waitForFunction(() => true, { timeout: 500 }).catch(() => {});
        
        const skillRows = await page.$$('#advanced-skills .skill-row');
        console.log(`Found ${skillRows.length} skill rows`);
        
        if (skillRows.length > 0) {
            const firstRow = skillRows[0];
            
            // Fill in skill details
            await firstRow.$eval('.skill-name', el => el.value = 'Animal Care');
            await firstRow.$eval('.skill-char', el => el.value = 'Int');
            await firstRow.$eval('.skill-adv input', el => el.value = '15');
            
            console.log('✓ Filled first skill: Animal Care (Int) +15');
        }
        
        // Add second skill
        await page.click('button[onclick="addAdvancedSkill()"]');
        await page.waitForFunction(() => true, { timeout: 500 }).catch(() => {});
        
        const skillRows2 = await page.$$('#advanced-skills .skill-row');
        if (skillRows2.length > 1) {
            const secondRow = skillRows2[1];
            
            // Fill in skill details
            await secondRow.$eval('.skill-name', el => el.value = 'Channelling');
            await secondRow.$eval('.skill-char', el => el.value = 'WP');
            await secondRow.$eval('.skill-adv input', el => el.value = '20');
            
            console.log('✓ Filled second skill: Channelling (WP) +20');
        }
        
        // 2. Save (exit edit mode)
        console.log('\n2. Saving skills (exiting edit mode)...');
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        // 3. Verify display in read-only mode
        console.log('\n3. Verifying read-only display...');
        const readOnlyRows = await page.$$('#advanced-skills .skill-row');
        
        for (let i = 0; i < readOnlyRows.length; i++) {
            const row = readOnlyRows[i];
            const nameDiv = await row.$('.skill-name');
            const charDiv = await row.$('.skill-char');
            const advInput = await row.$('.skill-adv input');
            
            if (nameDiv && charDiv && advInput) {
                const name = await nameDiv.evaluate(el => el.textContent);
                const char = await charDiv.evaluate(el => el.textContent);
                const adv = await advInput.evaluate(el => el.value);
                
                console.log(`   Row ${i + 1}: ${name} (${char}) +${adv}`);
                
                // Verify that name and char are showing as plain text (not in input fields)
                const nameTag = await nameDiv.evaluate(el => el.tagName);
                const charTag = await charDiv.evaluate(el => el.tagName);
                console.log(`     Name element: ${nameTag}, Char element: ${charTag}`);
            }
        }
        
        // 4. Check localStorage with correct key
        console.log('\n4. Checking localStorage...');
        const storedData = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character'); // Note: hyphen, not underscore
            return data ? JSON.parse(data) : null;
        });
        
        if (storedData && storedData.advancedSkills) {
            console.log('✓ Advanced skills in localStorage:');
            storedData.advancedSkills.forEach((skill, index) => {
                console.log(`   ${index + 1}. ${skill.name} (${skill.characteristic}) +${skill.advances}`);
            });
        } else {
            console.log('❌ No advanced skills found in localStorage');
        }
        
        // 5. Test reload persistence
        console.log('\n5. Testing reload persistence...');
        await page.reload({ waitUntil: 'networkidle0' });
        
        // Wait for character sheet to load again
        await page.waitForFunction(() => window.characterSheet !== undefined);
        
        // Check if skills are still there after reload
        const reloadedRows = await page.$$('#advanced-skills .skill-row');
        console.log(`After reload: ${reloadedRows.length} skill rows found`);
        
        for (let i = 0; i < reloadedRows.length; i++) {
            const row = reloadedRows[i];
            const nameDiv = await row.$('.skill-name');
            const charDiv = await row.$('.skill-char');
            const advInput = await row.$('.skill-adv input');
            
            if (nameDiv && charDiv && advInput) {
                const name = await nameDiv.evaluate(el => el.textContent);
                const char = await charDiv.evaluate(el => el.textContent);
                const adv = await advInput.evaluate(el => el.value);
                
                console.log(`   Reloaded Row ${i + 1}: ${name} (${char}) +${adv}`);
                
                // Verify that name and char are still showing as plain text
                const nameTag = await nameDiv.evaluate(el => el.tagName);
                const charTag = await charDiv.evaluate(el => el.tagName);
                console.log(`     Name element: ${nameTag}, Char element: ${charTag}`);
            }
        }
        
        // 6. Test edit mode again to ensure data persists correctly
        console.log('\n6. Testing edit mode after reload...');
        await page.click('#edit-advanced-skills');
        await page.waitForFunction(() => true, { timeout: 1000 }).catch(() => {});
        
        const editRows = await page.$$('#advanced-skills .skill-row');
        console.log(`In edit mode: ${editRows.length} skill rows found`);
        
        for (let i = 0; i < editRows.length; i++) {
            const row = editRows[i];
            const nameInput = await row.$('.skill-name');
            const charSelect = await row.$('.skill-char');
            const advInput = await row.$('.skill-adv input');
            
            if (nameInput && charSelect && advInput) {
                const name = await nameInput.evaluate(el => el.value);
                const char = await charSelect.evaluate(el => el.value);
                const adv = await advInput.evaluate(el => el.value);
                
                console.log(`   Edit Row ${i + 1}: ${name} (${char}) +${adv}`);
                
                // Verify that name and char are now input fields
                const nameTag = await nameInput.evaluate(el => el.tagName);
                const charTag = await charSelect.evaluate(el => el.tagName);
                console.log(`     Name element: ${nameTag}, Char element: ${charTag}`);
            }
        }
        
        // Take screenshot
        await page.screenshot({ 
            path: 'test-fixed-persistence.png', 
            fullPage: true 
        });
        
        console.log('\n✓ Fixed persistence test completed - screenshot saved');
        
        // Wait for manual inspection
        await page.waitForFunction(() => true, { timeout: 3000 }).catch(() => {});
        
    } catch (error) {
        console.error('❌ Fixed persistence test failed:', error);
    } finally {
        await browser.close();
    }
}

testFixedPersistence().catch(console.error);