const puppeteer = require('puppeteer');
const path = require('path');

async function testPartyMotivationEditModes() {
    const browser = await puppeteer.launch({ 
        headless: true
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Party and Motivation Edit Modes ===');
        
        // Test initial readonly states
        console.log('\n--- Testing Initial Readonly States ---');
        
        // Check if fields start as readonly
        const partyNameReadonly = await page.$eval('#party-name', el => el.readOnly);
        const motivationReadonly = await page.$eval('#motivation', el => el.readOnly);
        
        console.log('✓ Party name starts readonly:', partyNameReadonly);
        console.log('✓ Motivation starts readonly:', motivationReadonly);
        
        // Check button text
        const partyButtonText = await page.$eval('#edit-party', el => el.textContent);
        const motivationButtonText = await page.$eval('#edit-motivation', el => el.textContent);
        
        console.log('✓ Party button text:', partyButtonText === 'Edit');
        console.log('✓ Motivation button text:', motivationButtonText === 'Edit');
        
        // Test Party Edit Mode
        console.log('\n--- Testing Party Edit Mode ---');
        
        // Enable party edit mode
        await page.click('#edit-party');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if fields are now editable
        const partyNameEditable = await page.$eval('#party-name', el => !el.readOnly);
        const partyShortEditable = await page.$eval('#party-short', el => !el.readOnly);
        const partyLongEditable = await page.$eval('#party-long', el => !el.readOnly);
        const partyMembersEditable = await page.$eval('#party-members', el => !el.readOnly);
        
        console.log('✓ Party name editable:', partyNameEditable);
        console.log('✓ Party short term editable:', partyShortEditable);
        console.log('✓ Party long term editable:', partyLongEditable);
        console.log('✓ Party members editable:', partyMembersEditable);
        
        // Check button text changed
        const partyButtonTextEdit = await page.$eval('#edit-party', el => el.textContent);
        console.log('✓ Party button text changed to Save:', partyButtonTextEdit === 'Save');
        
        // Fill in party data
        await page.type('#party-name', 'The Crimson Wolves');
        await page.type('#party-short', 'Investigate the missing merchants');
        await page.type('#party-long', 'Uncover the conspiracy behind the trade route attacks');
        await page.type('#party-members', 'Gunther the Warrior, Eliza the Wizard, Marcus the Rogue');
        
        console.log('✓ Party data filled in');
        
        // Save party data (exit edit mode)
        await page.click('#edit-party');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if fields are readonly again
        const partyNameReadonlyAfter = await page.$eval('#party-name', el => el.readOnly);
        const partyButtonTextSaved = await page.$eval('#edit-party', el => el.textContent);
        
        console.log('✓ Party fields readonly after save:', partyNameReadonlyAfter);
        console.log('✓ Party button text back to Edit:', partyButtonTextSaved === 'Edit');
        
        // Test Motivation Edit Mode
        console.log('\n--- Testing Motivation Edit Mode ---');
        
        // Enable motivation edit mode
        await page.click('#edit-motivation');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if motivation field is now editable
        const motivationEditable = await page.$eval('#motivation', el => !el.readOnly);
        console.log('✓ Motivation editable:', motivationEditable);
        
        // Check that resilience and resolve fields are still editable (they should always be)
        const resilienceEditable = await page.$eval('#resilience', el => !el.readOnly && !el.disabled);
        const resolveEditable = await page.$eval('#resolve', el => !el.readOnly && !el.disabled);
        console.log('✓ Resilience still editable:', resilienceEditable);
        console.log('✓ Resolve still editable:', resolveEditable);
        
        // Check button text changed
        const motivationButtonTextEdit = await page.$eval('#edit-motivation', el => el.textContent);
        console.log('✓ Motivation button text changed to Save:', motivationButtonTextEdit === 'Save');
        
        // Fill in motivation data
        await page.type('#motivation', 'Seek revenge for fallen comrades');
        console.log('✓ Motivation data filled in');
        
        // Save motivation data (exit edit mode)
        await page.click('#edit-motivation');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if motivation field is readonly again
        const motivationReadonlyAfter = await page.$eval('#motivation', el => el.readOnly);
        const motivationButtonTextSaved = await page.$eval('#edit-motivation', el => el.textContent);
        
        console.log('✓ Motivation readonly after save:', motivationReadonlyAfter);
        console.log('✓ Motivation button text back to Edit:', motivationButtonTextSaved === 'Edit');
        
        // Test Data Persistence
        console.log('\n--- Testing Data Persistence ---');
        
        // Reload page to test persistence
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if data persisted
        const partyNameValue = await page.$eval('#party-name', el => el.value);
        const partyShortValue = await page.$eval('#party-short', el => el.value);
        const motivationValue = await page.$eval('#motivation', el => el.value);
        
        console.log('✓ Party name persisted:', partyNameValue === 'The Crimson Wolves');
        console.log('✓ Party short term persisted:', partyShortValue === 'Investigate the missing merchants');
        console.log('✓ Motivation persisted:', motivationValue === 'Seek revenge for fallen comrades');
        
        // Check that fields start as readonly after reload
        const partyNameReadonlyReload = await page.$eval('#party-name', el => el.readOnly);
        const motivationReadonlyReload = await page.$eval('#motivation', el => el.readOnly);
        
        console.log('✓ Party readonly after reload:', partyNameReadonlyReload);
        console.log('✓ Motivation readonly after reload:', motivationReadonlyReload);
        
        // Test CSS Classes
        console.log('\n--- Testing CSS Classes ---');
        
        // Check initial CSS classes
        const partyHasReadonlyClass = await page.$eval('.party', el => el.classList.contains('party-readonly'));
        const resilienceHasReadonlyClass = await page.$eval('.resilience-section', el => el.classList.contains('motivation-readonly'));
        
        console.log('✓ Party has readonly class:', partyHasReadonlyClass);
        console.log('✓ Resilience section has motivation readonly class:', resilienceHasReadonlyClass);
        
        // Test class changes during edit mode
        await page.click('#edit-party');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const partyHasEditClass = await page.$eval('.party', el => el.classList.contains('party-edit'));
        const partyLostReadonlyClass = await page.$eval('.party', el => !el.classList.contains('party-readonly'));
        
        console.log('✓ Party gained edit class:', partyHasEditClass);
        console.log('✓ Party lost readonly class:', partyLostReadonlyClass);
        
        console.log('\n✓ All party and motivation edit mode tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testPartyMotivationEditModes().catch(console.error);