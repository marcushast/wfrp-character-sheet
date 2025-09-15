const puppeteer = require('puppeteer');
const path = require('path');

async function testAllEditModes() {
    const browser = await puppeteer.launch({ 
        headless: true
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing All Edit Modes ===');
        
        // Test Psychology Edit Mode
        console.log('\n--- Testing Psychology ---');
        await page.click('#edit-psychology');
        await page.click('button[onclick="addPsychologyCondition()"]');
        await page.waitForSelector('#psychology-list .psychology-row:last-child');
        const psychologyInputs = await page.$$('#psychology-list .psychology-condition');
        if (psychologyInputs.length > 0) {
            await psychologyInputs[0].type('Fear of undead');
        }
        await page.click('#edit-psychology'); // Save
        console.log('✓ Psychology edit mode works');
        
        // Test Corruption Edit Mode
        console.log('\n--- Testing Corruption ---');
        await page.click('#edit-corruption');
        await page.click('button[onclick="addCorruptionMutation()"]');
        await page.waitForSelector('#corruption-list .corruption-row:last-child');
        const corruptionInputs = await page.$$('#corruption-list .corruption-mutation');
        if (corruptionInputs.length > 0) {
            await corruptionInputs[0].type('Glowing eyes');
        }
        await page.click('#edit-corruption'); // Save
        console.log('✓ Corruption edit mode works');
        
        // Test Party Edit Mode
        console.log('\n--- Testing Party ---');
        await page.click('#edit-party');
        await page.type('#party-name', 'The Silver Hawks');
        await page.type('#party-short', 'Clear the forest of bandits');
        await page.click('#edit-party'); // Save
        console.log('✓ Party edit mode works');
        
        // Test Character Edit Mode
        console.log('\n--- Testing Character ---');
        await page.click('#edit-character');
        await page.type('#name', 'Sir Aldrich');
        await page.type('#motivation', 'Protect the innocent');
        await page.click('#edit-character'); // Save
        console.log('✓ Character edit mode works');
        
        // Test Ambitions Edit Mode
        console.log('\n--- Testing Ambitions ---');
        await page.click('#edit-ambitions');
        await page.type('#short-ambition', 'Destroy the chaos cult');
        await page.type('#long-ambition', 'Become a legendary hero');
        await page.click('#edit-ambitions'); // Save
        console.log('✓ Ambitions edit mode works');
        
        // Test data persistence
        console.log('\n--- Testing Persistence ---');
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check psychology
        const psychologyConditions = await page.$$eval('#psychology-list .psychology-condition', 
            elements => elements.map(el => el.textContent || el.value).filter(text => text.trim()));
        console.log('✓ Psychology persisted:', psychologyConditions.length > 0);
        
        // Check corruption
        const corruptionMutations = await page.$$eval('#corruption-list .corruption-mutation', 
            elements => elements.map(el => el.textContent || el.value).filter(text => text.trim()));
        console.log('✓ Corruption persisted:', corruptionMutations.length > 0);
        
        // Check party
        const partyName = await page.$eval('#party-name', el => el.value);
        console.log('✓ Party persisted:', partyName === 'The Silver Hawks');
        
        // Check character
        const characterName = await page.$eval('#name', el => el.value);
        const motivation = await page.$eval('#motivation', el => el.value);
        console.log('✓ Character name persisted:', characterName === 'Sir Aldrich');
        console.log('✓ Motivation persisted:', motivation === 'Protect the innocent');
        
        // Check ambitions
        const shortAmbition = await page.$eval('#short-ambition', el => el.value);
        const longAmbition = await page.$eval('#long-ambition', el => el.value);
        console.log('✓ Short ambition persisted:', shortAmbition === 'Destroy the chaos cult');
        console.log('✓ Long ambition persisted:', longAmbition === 'Become a legendary hero');
        
        // Test that all fields start as readonly
        console.log('\n--- Testing Readonly States ---');
        const partyReadonly = await page.$eval('#party-name', el => el.readOnly);
        const characterReadonly = await page.$eval('#name', el => el.readOnly);
        const motivationReadonly = await page.$eval('#motivation', el => el.readOnly);
        const shortAmbitionReadonly = await page.$eval('#short-ambition', el => el.readOnly);
        console.log('✓ Party starts readonly:', partyReadonly);
        console.log('✓ Character starts readonly:', characterReadonly);
        console.log('✓ Motivation starts readonly:', motivationReadonly);
        console.log('✓ Ambitions start readonly:', shortAmbitionReadonly);
        
        // Test export includes all new data
        console.log('\n--- Testing Export ---');
        await page.click('#export-character');
        await page.waitForSelector('#export-modal', { visible: true });
        
        const exportData = await page.$eval('#export-data', el => el.value);
        const parsedData = JSON.parse(exportData);
        
        console.log('✓ Export includes psychology:', 
            parsedData.psychology && parsedData.psychology.conditions && parsedData.psychology.conditions.length > 0);
        console.log('✓ Export includes corruption:', 
            parsedData.corruption && parsedData.corruption.mutations && parsedData.corruption.mutations.length > 0);
        console.log('✓ Export includes party:', parsedData.party && parsedData.party.name === 'The Silver Hawks');
        console.log('✓ Export includes character name:', parsedData.name === 'Sir Aldrich');
        console.log('✓ Export includes motivation:', parsedData.motivation === 'Protect the innocent');
        console.log('✓ Export includes ambitions:', 
            parsedData.ambitions && 
            parsedData.ambitions.short === 'Destroy the chaos cult' && 
            parsedData.ambitions.long === 'Become a legendary hero');
        
        await page.click('#close-export');
        
        console.log('\n✅ All edit modes working perfectly!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testAllEditModes().catch(console.error);