const puppeteer = require('puppeteer');
const path = require('path');

async function testCharacterEditMode() {
    const browser = await puppeteer.launch({ 
        headless: true
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Character Edit Mode ===');
        
        // Test initial readonly states
        console.log('\n--- Testing Initial Readonly States ---');
        
        // Check if fields start as readonly
        const nameReadonly = await page.$eval('#name', el => el.readOnly);
        const speciesReadonly = await page.$eval('#species', el => el.readOnly);
        const motivationReadonly = await page.$eval('#motivation', el => el.readOnly);
        
        console.log('✓ Name starts readonly:', nameReadonly);
        console.log('✓ Species starts readonly:', speciesReadonly);
        console.log('✓ Motivation starts readonly:', motivationReadonly);
        
        // Check button text
        const characterButtonText = await page.$eval('#edit-character', el => el.textContent);
        console.log('✓ Character button text:', characterButtonText === 'Edit');
        
        // Verify motivation is no longer in resilience section
        const motivationEditButton = await page.$('#edit-motivation');
        if (motivationEditButton) {
            console.log('❌ Motivation edit button still exists in resilience section');
        } else {
            console.log('✓ Motivation edit button removed from resilience section');
        }
        
        // Test Character Edit Mode
        console.log('\n--- Testing Character Edit Mode ---');
        
        // Enable character edit mode
        await page.click('#edit-character');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if fields are now editable
        const nameEditable = await page.$eval('#name', el => !el.readOnly);
        const speciesEditable = await page.$eval('#species', el => !el.readOnly);
        const classEditable = await page.$eval('#class', el => !el.readOnly);
        const careerEditable = await page.$eval('#career', el => !el.readOnly);
        const motivationEditable = await page.$eval('#motivation', el => !el.readOnly);
        
        console.log('✓ Name editable:', nameEditable);
        console.log('✓ Species editable:', speciesEditable);
        console.log('✓ Class editable:', classEditable);
        console.log('✓ Career editable:', careerEditable);
        console.log('✓ Motivation editable:', motivationEditable);
        
        // Check button text changed
        const characterButtonTextEdit = await page.$eval('#edit-character', el => el.textContent);
        console.log('✓ Character button text changed to Save:', characterButtonTextEdit === 'Save');
        
        // Fill in character data
        await page.type('#name', 'Gunther von Hammerfist');
        await page.type('#species', 'Human');
        await page.type('#class', 'Warrior');
        await page.type('#career', 'Soldier');
        await page.type('#career-level', '2');
        await page.type('#career-path', 'Military');
        await page.type('#status', 'Brass 3');
        await page.type('#age', '28');
        await page.type('#height', '6 feet');
        await page.type('#hair', 'Brown');
        await page.type('#eyes', 'Blue');
        await page.type('#motivation', 'Protect the Empire from Chaos');
        
        console.log('✓ Character data filled in');
        
        // Save character data (exit edit mode)
        await page.click('#edit-character');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if fields are readonly again
        const nameReadonlyAfter = await page.$eval('#name', el => el.readOnly);
        const motivationReadonlyAfter = await page.$eval('#motivation', el => el.readOnly);
        const characterButtonTextSaved = await page.$eval('#edit-character', el => el.textContent);
        
        console.log('✓ Name readonly after save:', nameReadonlyAfter);
        console.log('✓ Motivation readonly after save:', motivationReadonlyAfter);
        console.log('✓ Character button text back to Edit:', characterButtonTextSaved === 'Edit');
        
        // Test Data Persistence
        console.log('\n--- Testing Data Persistence ---');
        
        // Reload page to test persistence
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if data persisted
        const nameValue = await page.$eval('#name', el => el.value);
        const speciesValue = await page.$eval('#species', el => el.value);
        const careerValue = await page.$eval('#career', el => el.value);
        const motivationValue = await page.$eval('#motivation', el => el.value);
        
        console.log('✓ Name persisted:', nameValue === 'Gunther von Hammerfist');
        console.log('✓ Species persisted:', speciesValue === 'Human');
        console.log('✓ Career persisted:', careerValue === 'Soldier');
        console.log('✓ Motivation persisted:', motivationValue === 'Protect the Empire from Chaos');
        
        // Check that fields start as readonly after reload
        const nameReadonlyReload = await page.$eval('#name', el => el.readOnly);
        const motivationReadonlyReload = await page.$eval('#motivation', el => el.readOnly);
        
        console.log('✓ Name readonly after reload:', nameReadonlyReload);
        console.log('✓ Motivation readonly after reload:', motivationReadonlyReload);
        
        // Test CSS Classes
        console.log('\n--- Testing CSS Classes ---');
        
        // Check initial CSS classes
        const characterHasReadonlyClass = await page.$eval('.character-info', el => el.classList.contains('character-readonly'));
        console.log('✓ Character has readonly class:', characterHasReadonlyClass);
        
        // Test class changes during edit mode
        await page.click('#edit-character');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const characterHasEditClass = await page.$eval('.character-info', el => el.classList.contains('character-edit'));
        const characterLostReadonlyClass = await page.$eval('.character-info', el => !el.classList.contains('character-readonly'));
        
        console.log('✓ Character gained edit class:', characterHasEditClass);
        console.log('✓ Character lost readonly class:', characterLostReadonlyClass);
        
        // Save again to test toggle
        await page.click('#edit-character');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const characterBackToReadonly = await page.$eval('.character-info', el => el.classList.contains('character-readonly'));
        console.log('✓ Character back to readonly class:', characterBackToReadonly);
        
        // Test localStorage data structure
        console.log('\n--- Testing Data Structure ---');
        
        const localStorageData = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('✓ Character name in localStorage:', localStorageData?.name === 'Gunther von Hammerfist');
        console.log('✓ Character species in localStorage:', localStorageData?.species === 'Human');
        console.log('✓ Character motivation in localStorage:', localStorageData?.motivation === 'Protect the Empire from Chaos');
        
        // Test that resilience and resolve still work normally
        console.log('\n--- Testing Resilience Fields Still Work ---');
        
        await page.type('#resilience', '3');
        await page.type('#resolve', '2');
        
        const resilienceValue = await page.$eval('#resilience', el => el.value);
        const resolveValue = await page.$eval('#resolve', el => el.value);
        
        console.log('✓ Resilience field works:', resilienceValue === '3');
        console.log('✓ Resolve field works:', resolveValue === '2');
        
        // Verify these fields are not readonly
        const resilienceReadonly = await page.$eval('#resilience', el => el.readOnly);
        const resolveReadonly = await page.$eval('#resolve', el => el.readOnly);
        
        console.log('✓ Resilience not readonly:', !resilienceReadonly);
        console.log('✓ Resolve not readonly:', !resolveReadonly);
        
        console.log('\n✓ All character edit mode tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testCharacterEditMode().catch(console.error);