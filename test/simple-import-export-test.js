const puppeteer = require('puppeteer');
const path = require('path');

async function simpleImportExportTest() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 500
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
        
        console.log('=== Simple Import/Export Test ===');
        
        // Test 1: Check if buttons exist
        const exportButton = await page.$('#export-character');
        const importButton = await page.$('#import-character');
        
        if (exportButton && importButton) {
            console.log('✓ Import and Export buttons found');
        } else {
            console.log('❌ Import/Export buttons not found');
            return;
        }
        
        // Test 2: Fill some test data directly via evaluate
        await page.evaluate(() => {
            document.getElementById('name').value = 'Test Hero';
            document.getElementById('species').value = 'Human';
            document.getElementById('class').value = 'Fighter';
            document.getElementById('ws-initial').value = '35';
        });
        
        console.log('✓ Test data filled');
        
        // Test 3: Test export
        await page.click('#export-character');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const exportModalVisible = await page.evaluate(() => {
            const modal = document.getElementById('export-modal');
            return modal && window.getComputedStyle(modal).display !== 'none';
        });
        
        if (exportModalVisible) {
            console.log('✓ Export modal opens');
            
            const exportData = await page.evaluate(() => {
                return document.getElementById('export-data').value;
            });
            
            if (exportData && exportData.includes('Test Hero')) {
                console.log('✓ Export contains correct data');
            } else {
                console.log('❌ Export data missing or incorrect');
            }
            
            // Close export modal
            await page.click('#close-export');
        } else {
            console.log('❌ Export modal failed to open');
        }
        
        // Test 4: Test import
        await page.click('#import-character');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const importModalVisible = await page.evaluate(() => {
            const modal = document.getElementById('import-modal');
            return modal && window.getComputedStyle(modal).display !== 'none';
        });
        
        if (importModalVisible) {
            console.log('✓ Import modal opens');
            
            // Test cancel
            await page.click('#cancel-import');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const modalClosed = await page.evaluate(() => {
                const modal = document.getElementById('import-modal');
                return window.getComputedStyle(modal).display === 'none';
            });
            
            if (modalClosed) {
                console.log('✓ Import cancel works');
            } else {
                console.log('❌ Import cancel failed');
            }
            
            // Test actual import
            await page.click('#import-character');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const importData = {
                name: 'Imported Warrior',
                species: 'Dwarf',
                class: 'Ranger'
            };
            
            await page.evaluate((data) => {
                document.getElementById('import-data').value = JSON.stringify(data, null, 2);
            }, importData);
            
            await page.click('#confirm-import');
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if data was imported
            const importedName = await page.evaluate(() => document.getElementById('name').value);
            const importedSpecies = await page.evaluate(() => document.getElementById('species').value);
            
            if (importedName === 'Imported Warrior' && importedSpecies === 'Dwarf') {
                console.log('✓ Import functionality works');
            } else {
                console.log('❌ Import failed - got:', importedName, importedSpecies);
            }
        } else {
            console.log('❌ Import modal failed to open');
        }
        
        // Take screenshot
        await page.screenshot({ 
            path: 'simple-import-export-test.png', 
            fullPage: true 
        });
        
        console.log('✓ Test completed - screenshot saved');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

simpleImportExportTest().catch(console.error);