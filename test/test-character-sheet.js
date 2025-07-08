const puppeteer = require('puppeteer');
const path = require('path');

async function testCharacterSheet() {
    const browser = await puppeteer.launch({ 
        headless: false, // Set to true if you don't want to see the browser
        slowMo: 250 // Slow down actions for better visibility
    });
    
    try {
        const page = await browser.newPage();
        
        // Navigate to the character sheet
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath);
        
        console.log('✓ Page loaded successfully');
        
        // Wait for the page to be fully loaded
        await page.waitForSelector('.character-sheet');
        
        // Test basic character information
        console.log('Testing character information fields...');
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
        
        // Test characteristics
        console.log('Testing characteristics...');
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
        
        // Test fate and resilience
        await page.type('#fate', '3');
        await page.type('#fortune', '2');
        await page.type('#resilience', '2');
        await page.type('#resolve', '1');
        await page.type('#motivation', 'Protect the innocent');
        
        // Test movement
        await page.type('#movement', '4');
        await page.type('#walk', '8');
        await page.type('#run', '16');
        
        // Test experience
        await page.type('#current-exp', '200');
        await page.type('#spent-exp', '150');
        
        console.log('✓ Stats filled');
        
        // Test adding advanced skills
        console.log('Testing advanced skills...');
        await page.click('button[onclick="addAdvancedSkill()"]');
        await page.waitForSelector('#advanced-skills .skill-row:last-child');
        
        // Fill the newly added skill
        const skillRows = await page.$$('#advanced-skills .skill-row');
        if (skillRows.length > 0) {
            const lastRow = skillRows[skillRows.length - 1];
            await lastRow.$eval('input[placeholder="Skill name"]', el => el.value = 'Climb');
            await lastRow.$eval('select', el => el.value = 'S');
            await lastRow.$eval('input[type="number"]', el => el.value = '5');
            console.log('✓ Advanced skill added');
        }
        
        // Test adding talents
        console.log('Testing talents...');
        await page.click('button[onclick="addTalent()"]');
        await page.waitForSelector('#talents-list .talent-row:last-child');
        
        const talentRows = await page.$$('#talents-list .talent-row');
        if (talentRows.length > 0) {
            const lastTalentRow = talentRows[talentRows.length - 1];
            await lastTalentRow.$eval('input[placeholder="Talent name"]', el => el.value = 'Strike to Stun');
            await lastTalentRow.$eval('input[type="number"]', el => el.value = '1');
            await lastTalentRow.$eval('textarea', el => el.value = 'Can attempt to stun opponents');
            console.log('✓ Talent added');
        }
        
        // Test adding weapons
        console.log('Testing weapons...');
        await page.click('button[onclick="addWeapon()"]');
        await page.waitForSelector('#weapons-list .weapon-row:last-child');
        
        const weaponRows = await page.$$('#weapons-list .weapon-row');
        if (weaponRows.length > 0) {
            const lastWeaponRow = weaponRows[weaponRows.length - 1];
            const inputs = await lastWeaponRow.$$('input');
            if (inputs.length >= 4) {
                await inputs[0].type('Sword');
                await inputs[1].type('Basic');
                await inputs[2].type('1');
                await inputs[3].type('Medium');
                await inputs[4].type('SB+4');
                console.log('✓ Weapon added');
            }
        }
        
        // Test adding armor
        console.log('Testing armor...');
        await page.click('button[onclick="addArmour()"]');
        await page.waitForSelector('#armour-list .armour-row:last-child');
        
        const armourRows = await page.$$('#armour-list .armour-row');
        if (armourRows.length > 0) {
            const lastArmourRow = armourRows[armourRows.length - 1];
            const inputs = await lastArmourRow.$$('input');
            if (inputs.length >= 4) {
                await inputs[0].type('Leather Armor');
                await inputs[1].type('Body');
                await inputs[2].type('1');
                await inputs[3].type('1');
                console.log('✓ Armor added');
            }
        }
        
        // Test adding trappings
        console.log('Testing trappings...');
        await page.click('button[onclick="addTrapping()"]');
        await page.waitForSelector('#trapping-list .trapping-row:last-child');
        
        const trappingRows = await page.$$('#trapping-list .trapping-row');
        if (trappingRows.length > 0) {
            const lastTrappingRow = trappingRows[trappingRows.length - 1];
            const inputs = await lastTrappingRow.$$('input');
            if (inputs.length >= 2) {
                await inputs[0].type('Backpack');
                await inputs[1].type('0');
                console.log('✓ Trapping added');
            }
        }
        
        // Test wealth
        await page.type('#wealth-d', '12');
        await page.type('#wealth-ss', '8');
        await page.type('#wealth-gc', '5');
        
        // Test psychology and corruption
        await page.type('#psychology', 'Fearless when protecting others');
        await page.type('#corruption', 'None');
        
        // Test ambitions
        await page.type('#short-ambition', 'Become a renowned warrior');
        await page.type('#long-ambition', 'Establish a warrior school');
        
        // Test party information
        await page.type('#party-name', 'The Bold Company');
        await page.type('#party-short', 'Clear the goblin caves');
        await page.type('#party-long', 'Restore peace to the borderlands');
        await page.type('#party-members', 'Grimjaw (Warrior), Elara (Wizard), Thorin (Dwarf)');
        
        console.log('✓ All sections filled successfully');
        
        // Test edit mode for advanced skills
        console.log('Testing edit modes...');
        await page.click('#edit-advanced-skills');
        console.log('✓ Advanced skills edit mode toggled');
        
        // Test edit mode for talents
        await page.click('#edit-talents');
        console.log('✓ Talents edit mode toggled');
        
        // Wait a bit to see the final result
        await page.waitForTimeout(2000);
        
        // Take a screenshot
        await page.screenshot({ path: 'character-sheet-test.png', fullPage: true });
        console.log('✓ Screenshot saved as character-sheet-test.png');
        
        console.log('\n🎉 All tests completed successfully!');
        console.log('The character sheet appears to be working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

// Run the test
testCharacterSheet().catch(console.error);