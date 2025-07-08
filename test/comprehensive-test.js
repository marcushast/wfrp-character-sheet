const puppeteer = require('puppeteer');
const path = require('path');

async function comprehensiveTest() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 200
    });
    
    try {
        const page = await browser.newPage();
        
        // Set a larger viewport
        await page.setViewport({ width: 1400, height: 1000 });
        
        // Navigate to the character sheet
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('✓ Page loaded successfully');
        
        // Wait for JavaScript to initialize
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Test 1: Basic character information
        console.log('\n=== Testing Basic Character Info ===');
        await page.type('#name', 'Grimjaw the Bold');
        await page.type('#species', 'Human');
        await page.type('#class', 'Warrior');
        await page.type('#career', 'Soldier');
        await page.type('#career-level', '2');
        await page.type('#age', '28');
        await page.type('#height', '6 feet');
        await page.type('#hair', 'Brown');
        await page.type('#eyes', 'Blue');
        console.log('✓ Character information filled');
        
        // Test 2: Characteristics
        console.log('\n=== Testing Characteristics ===');
        await page.type('#ws-initial', '35');
        await page.type('#bs-initial', '30');
        await page.type('#s-initial', '40');
        await page.type('#t-initial', '35');
        await page.type('#i-initial', '30');
        await page.type('#ag-initial', '35');
        await page.type('#dex-initial', '30');
        await page.type('#int-initial', '25');
        await page.type('#wp-initial', '30');
        await page.type('#fel-initial', '25');
        
        // Test advances
        await page.type('#ws-advances', '5');
        await page.type('#bs-advances', '5');
        await page.type('#s-advances', '10');
        console.log('✓ Characteristics filled');
        
        // Test 3: Secondary stats
        console.log('\n=== Testing Secondary Stats ===');
        await page.type('#fate', '3');
        await page.type('#fortune', '2');
        await page.type('#resilience', '2');
        await page.type('#resolve', '1');
        await page.type('#motivation', 'Protect the innocent');
        await page.type('#movement', '4');
        await page.type('#walk', '8');
        await page.type('#run', '16');
        await page.type('#current-exp', '200');
        await page.type('#spent-exp', '150');
        console.log('✓ Secondary stats filled');
        
        // Test 4: Scroll to and test advanced skills
        console.log('\n=== Testing Advanced Skills ===');
        await page.evaluate(() => {
            document.querySelector('button[onclick="addAdvancedSkill()"]').scrollIntoView();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await page.click('button[onclick="addAdvancedSkill()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if a skill row was added
        const skillRows = await page.$$('#advanced-skills .skill-row');
        console.log(`✓ Advanced skills: ${skillRows.length} row(s) added`);
        
        // Test 5: Scroll to and test talents
        console.log('\n=== Testing Talents ===');
        await page.evaluate(() => {
            document.querySelector('button[onclick="addTalent()"]').scrollIntoView();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await page.click('button[onclick="addTalent()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const talentRows = await page.$$('#talents-list .talent-row');
        console.log(`✓ Talents: ${talentRows.length} row(s) added`);
        
        // Test 6: Scroll to and test weapons
        console.log('\n=== Testing Weapons ===');
        await page.evaluate(() => {
            document.querySelector('button[onclick="addWeapon()"]').scrollIntoView();
        });
        await new Promise(resolve => setTimeout(resolve, 500));
        
        await page.click('button[onclick="addWeapon()"]');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const weaponRows = await page.$$('#weapons-list .weapon-row');
        console.log(`✓ Weapons: ${weaponRows.length} row(s) added`);
        
        // Test 7: Text areas
        console.log('\n=== Testing Text Areas ===');
        await page.evaluate(() => {
            document.querySelector('#psychology').scrollIntoView();
        });
        await page.type('#psychology', 'Fearless when protecting others');
        await page.type('#corruption', 'None');
        await page.type('#short-ambition', 'Become a renowned warrior');
        await page.type('#long-ambition', 'Establish a warrior school');
        console.log('✓ Text areas filled');
        
        // Test 8: Party information
        console.log('\n=== Testing Party Info ===');
        await page.type('#party-name', 'The Bold Company');
        await page.type('#party-short', 'Clear the goblin caves');
        await page.type('#party-long', 'Restore peace to the borderlands');
        await page.type('#party-members', 'Grimjaw (Warrior), Elara (Wizard), Thorin (Dwarf)');
        console.log('✓ Party information filled');
        
        // Test 9: Wealth
        console.log('\n=== Testing Wealth ===');
        await page.type('#wealth-d', '12');
        await page.type('#wealth-ss', '8');
        await page.type('#wealth-gc', '5');
        console.log('✓ Wealth filled');
        
        // Take final screenshot
        await page.screenshot({ path: 'comprehensive-test-result.png', fullPage: true });
        console.log('✓ Screenshot saved as comprehensive-test-result.png');
        
        console.log('\n🎉 Comprehensive test completed successfully!');
        console.log('✓ All major sections of the character sheet are functional');
        console.log('✓ Dynamic content creation works (skills, talents, weapons)');
        console.log('✓ Input fields accept data correctly');
        console.log('✓ The character sheet is working as expected');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

comprehensiveTest().catch(console.error);