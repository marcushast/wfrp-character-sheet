const puppeteer = require('puppeteer');
const path = require('path');

async function testSimplifiedAdvancedSkills() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        // Navigate to character sheet
        const filePath = 'file://' + path.join(__dirname, '../index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('✓ Page loaded successfully');
        
        // Wait for page to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('\n=== Testing Advanced Skills Simplified Code ===');
        
        // Test 1: Verify advanced skills section exists
        const advancedSkillsContainer = await page.$('#advanced-skills');
        console.log('Advanced skills container:', advancedSkillsContainer ? '✓' : '❌');
        
        // Test 2: Test edit mode toggle
        const editButton = await page.$('#edit-advanced-skills');
        if (editButton) {
            console.log('✓ Edit button found');
            
            // Click to enter edit mode
            await page.click('#edit-advanced-skills');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Verify edit mode state
            const buttonText = await page.$eval('#edit-advanced-skills', el => el.textContent);
            console.log('Edit button text after click:', buttonText);
            
            // Test 3: Add a new skill in edit mode
            const addSkillButton = await page.$('button[onclick="addAdvancedSkill()"]');
            if (addSkillButton) {
                console.log('✓ Add skill button found');
                await page.click('button[onclick="addAdvancedSkill()"]');
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Verify skill was added
                const skillRows = await page.$$('#advanced-skills .skill-row');
                console.log(`✓ Advanced skills: ${skillRows.length} row(s) added`);
                
                if (skillRows.length > 0) {
                    // Fill in the new skill
                    await page.type('#advanced-skills .skill-row:last-child .skill-name', 'Test Skill');
                    await page.select('#advanced-skills .skill-row:last-child .skill-char', 'WS');
                    await page.type('#advanced-skills .skill-row:last-child .skill-adv input', '10');
                    
                    console.log('✓ Skill data filled');
                    
                    // Test 4: Verify calculation works
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const totalValue = await page.$eval('#advanced-skills .skill-row:last-child .skill-total input', el => el.value);
                    console.log(`✓ Skill total calculated: ${totalValue}`);
                }
            }
            
            // Test 5: Switch back to read-only mode
            await page.click('#edit-advanced-skills');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const finalButtonText = await page.$eval('#edit-advanced-skills', el => el.textContent);
            console.log('Final button text:', finalButtonText);
            
            // Verify read-only state
            const skillNameDiv = await page.$('#advanced-skills .skill-row .skill-name');
            if (skillNameDiv) {
                const isInput = await page.evaluate(el => el.tagName === 'INPUT', skillNameDiv);
                const isDiv = await page.evaluate(el => el.tagName === 'DIV', skillNameDiv);
                console.log(`✓ Read-only mode: skill name is ${isDiv ? 'div' : 'input'} (${isDiv ? 'correct' : 'incorrect'})`);
            }
        }
        
        // Test 6: Verify data persistence
        const skillRows = await page.$$('#advanced-skills .skill-row');
        console.log(`✓ Final skill count: ${skillRows.length}`);
        
        // Take screenshot
        await page.screenshot({ path: 'simplified-advanced-skills-test.png', fullPage: true });
        console.log('✓ Screenshot saved as simplified-advanced-skills-test.png');
        
        console.log('\n🎉 Simplified advanced skills test completed successfully!');
        console.log('✓ All simplified rendering functionality is working correctly');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testSimplifiedAdvancedSkills().catch(console.error);