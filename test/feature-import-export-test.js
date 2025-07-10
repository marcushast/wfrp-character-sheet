const puppeteer = require('puppeteer');
const path = require('path');

async function testImportExportFeature() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        // Handle alert dialogs
        page.on('dialog', async dialog => {
            console.log('Alert:', dialog.message());
            await dialog.accept();
        });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Import/Export Feature ===');
        
        // Test 1: Check if import/export buttons exist
        const exportButton = await page.$('#export-character');
        const importButton = await page.$('#import-character');
        
        if (exportButton && importButton) {
            console.log('✓ Import and Export buttons found');
        } else {
            console.log('❌ Import/Export buttons not found');
            return;
        }
        
        // Test 2: Fill in some character data
        await page.type('#name', 'Test Character');
        await page.type('#species', 'Human');
        await page.type('#class', 'Warrior');
        await page.type('#ws-initial', '35');
        await page.type('#bs-initial', '30');
        await page.type('#s-initial', '40');
        
        console.log('✓ Character data filled in');
        
        // Test 3: Test export functionality
        await page.click('#export-character');
        
        // Wait for export modal/textarea to appear
        await page.waitForSelector('#export-modal', { timeout: 5000 });
        
        // Check if export data textarea contains JSON
        const exportData = await page.$eval('#export-data', el => el.value);
        
        if (exportData && exportData.includes('Test Character')) {
            console.log('✓ Export functionality works - character data exported');
        } else {
            console.log('❌ Export functionality failed');
        }
        
        // Close export modal
        await page.click('#close-export');
        
        // Test 4: Test import functionality
        await page.click('#import-character');
        
        // Wait for import modal to appear
        await page.waitForSelector('#import-modal', { timeout: 5000 });
        
        // Test the import data textarea exists
        const importTextarea = await page.$('#import-data');
        if (importTextarea) {
            console.log('✓ Import modal and textarea found');
        } else {
            console.log('❌ Import modal or textarea not found');
        }
        
        // Test 5: Test cancel import
        await page.click('#cancel-import');
        
        // Wait a moment for modal to close
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Verify modal is closed (display should be 'none')
        const modalDisplay = await page.evaluate(() => {
            const modal = document.getElementById('import-modal');
            return modal ? window.getComputedStyle(modal).display : 'none';
        });
        
        if (modalDisplay === 'none') {
            console.log('✓ Import cancel functionality works');
        } else {
            console.log('❌ Import cancel functionality failed');
        }
        
        // Test 6: Test actual import process
        await page.click('#import-character');
        await page.waitForSelector('#import-modal', { timeout: 5000 });
        
        // Create test character data
        const testCharacterData = {
            name: 'Imported Character',
            species: 'Dwarf',
            class: 'Ranger',
            characteristics: {
                ws: { initial: 40, advances: 5 },
                bs: { initial: 35, advances: 3 }
            }
        };
        
        // Set the import data directly using evaluate
        await page.evaluate((data) => {
            document.getElementById('import-data').value = JSON.stringify(data, null, 2);
        }, testCharacterData);
        
        // Confirm import
        await page.click('#confirm-import');
        
        // Wait for alert to be handled
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verify imported data
        const importedName = await page.$eval('#name', el => el.value);
        const importedSpecies = await page.$eval('#species', el => el.value);
        
        if (importedName === 'Imported Character' && importedSpecies === 'Dwarf') {
            console.log('✓ Import functionality works - character data imported');
        } else {
            console.log('❌ Import functionality failed - expected: Imported Character, Dwarf; got:', importedName, importedSpecies);
        }
        
        // Take screenshot for documentation
        await page.screenshot({ 
            path: 'feature-import-export-test.png', 
            fullPage: true 
        });
        
        console.log('✓ Import/Export feature test completed');
        
    } catch (error) {
        console.error('❌ Feature test failed:', error);
    } finally {
        await browser.close();
    }
}

testImportExportFeature().catch(console.error);