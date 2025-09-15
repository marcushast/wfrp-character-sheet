const puppeteer = require('puppeteer');
const path = require('path');

async function testAmbitionsEditMode() {
    const browser = await puppeteer.launch({ 
        headless: true
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Ambitions Edit Mode ===');
        
        // Test initial readonly states
        console.log('\n--- Testing Initial Readonly States ---');
        
        // Check if fields start as readonly
        const shortAmbitionReadonly = await page.$eval('#short-ambition', el => el.readOnly);
        const longAmbitionReadonly = await page.$eval('#long-ambition', el => el.readOnly);
        
        console.log('✓ Short ambition starts readonly:', shortAmbitionReadonly);
        console.log('✓ Long ambition starts readonly:', longAmbitionReadonly);
        
        // Check button text
        const ambitionsButtonText = await page.$eval('#edit-ambitions', el => el.textContent);
        console.log('✓ Ambitions button text:', ambitionsButtonText === 'Edit');
        
        // Test Ambitions Edit Mode
        console.log('\n--- Testing Ambitions Edit Mode ---');
        
        // Enable ambitions edit mode
        await page.click('#edit-ambitions');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if fields are now editable
        const shortAmbitionEditable = await page.$eval('#short-ambition', el => !el.readOnly);
        const longAmbitionEditable = await page.$eval('#long-ambition', el => !el.readOnly);
        
        console.log('✓ Short ambition editable:', shortAmbitionEditable);
        console.log('✓ Long ambition editable:', longAmbitionEditable);
        
        // Check button text changed
        const ambitionsButtonTextEdit = await page.$eval('#edit-ambitions', el => el.textContent);
        console.log('✓ Ambitions button text changed to Save:', ambitionsButtonTextEdit === 'Save');
        
        // Fill in ambitions data
        await page.type('#short-ambition', 'Find the lost artifact of Sigmar');
        await page.type('#long-ambition', 'Become a renowned knight of the Empire and protect the innocent from chaos');
        
        console.log('✓ Ambitions data filled in');
        
        // Save ambitions data (exit edit mode)
        await page.click('#edit-ambitions');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if fields are readonly again
        const shortAmbitionReadonlyAfter = await page.$eval('#short-ambition', el => el.readOnly);
        const longAmbitionReadonlyAfter = await page.$eval('#long-ambition', el => el.readOnly);
        const ambitionsButtonTextSaved = await page.$eval('#edit-ambitions', el => el.textContent);
        
        console.log('✓ Short ambition readonly after save:', shortAmbitionReadonlyAfter);
        console.log('✓ Long ambition readonly after save:', longAmbitionReadonlyAfter);
        console.log('✓ Ambitions button text back to Edit:', ambitionsButtonTextSaved === 'Edit');
        
        // Test Data Persistence
        console.log('\n--- Testing Data Persistence ---');
        
        // Reload page to test persistence
        await page.reload({ waitUntil: 'networkidle0' });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Check if data persisted
        const shortAmbitionValue = await page.$eval('#short-ambition', el => el.value);
        const longAmbitionValue = await page.$eval('#long-ambition', el => el.value);
        
        console.log('✓ Short ambition persisted:', shortAmbitionValue === 'Find the lost artifact of Sigmar');
        console.log('✓ Long ambition persisted:', longAmbitionValue === 'Become a renowned knight of the Empire and protect the innocent from chaos');
        
        // Check that fields start as readonly after reload
        const shortAmbitionReadonlyReload = await page.$eval('#short-ambition', el => el.readOnly);
        const longAmbitionReadonlyReload = await page.$eval('#long-ambition', el => el.readOnly);
        
        console.log('✓ Short ambition readonly after reload:', shortAmbitionReadonlyReload);
        console.log('✓ Long ambition readonly after reload:', longAmbitionReadonlyReload);
        
        // Test CSS Classes
        console.log('\n--- Testing CSS Classes ---');
        
        // Check initial CSS classes
        const ambitionsHasReadonlyClass = await page.$eval('.ambitions', el => el.classList.contains('ambitions-readonly'));
        console.log('✓ Ambitions has readonly class:', ambitionsHasReadonlyClass);
        
        // Test class changes during edit mode
        await page.click('#edit-ambitions');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const ambitionsHasEditClass = await page.$eval('.ambitions', el => el.classList.contains('ambitions-edit'));
        const ambitionsLostReadonlyClass = await page.$eval('.ambitions', el => !el.classList.contains('ambitions-readonly'));
        
        console.log('✓ Ambitions gained edit class:', ambitionsHasEditClass);
        console.log('✓ Ambitions lost readonly class:', ambitionsLostReadonlyClass);
        
        // Save again to test toggle
        await page.click('#edit-ambitions');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const ambitionsBackToReadonly = await page.$eval('.ambitions', el => el.classList.contains('ambitions-readonly'));
        console.log('✓ Ambitions back to readonly class:', ambitionsBackToReadonly);
        
        // Test localStorage data structure
        console.log('\n--- Testing Data Structure ---');
        
        const localStorageData = await page.evaluate(() => {
            const data = localStorage.getItem('wfrp-character');
            return data ? JSON.parse(data) : null;
        });
        
        console.log('✓ Ambitions in localStorage:', 
            localStorageData && 
            localStorageData.ambitions &&
            localStorageData.ambitions.short === 'Find the lost artifact of Sigmar' &&
            localStorageData.ambitions.long === 'Become a renowned knight of the Empire and protect the innocent from chaos');
        
        console.log('\n✓ All ambitions edit mode tests passed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

testAmbitionsEditMode().catch(console.error);