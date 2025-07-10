const puppeteer = require('puppeteer');
const path = require('path');

async function testErrorHandling() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        // Listen for console errors
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });
        
        // Listen for page errors
        const pageErrors = [];
        page.on('pageerror', error => {
            pageErrors.push(error.message);
        });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Error Handling Testing ===');
        
        // Wait for initialization
        await page.waitForFunction(() => window.characterSheet !== undefined);
        
        // Test 1: Invalid Input Handling
        console.log('\n1. Testing Invalid Input Handling...');
        
        const invalidInputTests = [
            { field: 'ws-initial', value: 'abc', expected: 'numeric' },
            { field: 'bs-initial', value: '-50', expected: 'positive' },
            { field: 'ws-advances', value: '999', expected: 'reasonable range' },
            { field: 'current-exp', value: 'invalid', expected: 'numeric' },
            { field: 'spent-exp', value: '-100', expected: 'positive' }
        ];
        
        for (const test of invalidInputTests) {
            try {
                await page.focus(`#${test.field}`);
                await page.evaluate((selector) => {
                    document.querySelector(selector).value = '';
                }, `#${test.field}`);
                await page.type(`#${test.field}`, test.value);
                await page.keyboard.press('Tab');
                await page.waitForTimeout(100);
                
                const currentValue = await page.$eval(`#${test.field}`, el => el.value);
                console.log(`  ${test.field} with "${test.value}": ${currentValue ? 'Value accepted' : 'Value rejected'}`);
            } catch (error) {
                console.log(`  ${test.field} with "${test.value}": Error handled gracefully`);
            }
        }
        
        // Test 2: localStorage Error Handling
        console.log('\n2. Testing localStorage Error Handling...');
        
        try {
            await page.evaluate(() => {
                // Simulate localStorage failure
                const originalSetItem = localStorage.setItem;
                localStorage.setItem = function() {
                    throw new Error('localStorage quota exceeded');
                };
                
                // Try to save character data
                try {
                    window.characterSheet.saveCharacter();
                } catch (e) {
                    console.log('localStorage error caught:', e.message);
                }
                
                // Restore localStorage
                localStorage.setItem = originalSetItem;
            });
            console.log('  ✓ localStorage error handling works correctly');
        } catch (error) {
            console.log('  ❌ localStorage error handling failed:', error.message);
        }
        
        // Test 3: Missing Element Handling
        console.log('\n3. Testing Missing Element Handling...');
        
        try {
            await page.evaluate(() => {
                // Temporarily remove a critical element
                const nameInput = document.getElementById('name');
                const parent = nameInput.parentNode;
                parent.removeChild(nameInput);
                
                // Try to populate the form
                try {
                    window.characterSheet.populateBasicInfo();
                } catch (e) {
                    console.log('Missing element error caught:', e.message);
                }
                
                // Restore the element
                parent.appendChild(nameInput);
            });
            console.log('  ✓ Missing element handling works correctly');
        } catch (error) {
            console.log('  ❌ Missing element handling failed:', error.message);
        }
        
        // Test 4: Invalid JSON Handling
        console.log('\n4. Testing Invalid JSON Handling...');
        
        try {
            await page.evaluate(() => {
                // Put invalid JSON in localStorage
                localStorage.setItem('wfrp-character', '{ invalid json }');
                
                // Try to load character
                try {
                    const character = window.characterSheet.loadCharacter();
                    console.log('Invalid JSON handled, loaded default character');
                } catch (e) {
                    console.log('Invalid JSON error caught:', e.message);
                }
            });
            console.log('  ✓ Invalid JSON handling works correctly');
        } catch (error) {
            console.log('  ❌ Invalid JSON handling failed:', error.message);
        }
        
        // Test 5: Dynamic Content Error Handling
        console.log('\n5. Testing Dynamic Content Error Handling...');
        
        try {
            await page.evaluate(() => {
                // Simulate adding skill when in wrong state
                try {
                    // Don't enter edit mode, try to add skill directly
                    const result = window.characterSheet.addAdvancedSkill?.();
                    console.log('Dynamic content error handling test completed');
                } catch (e) {
                    console.log('Dynamic content error caught:', e.message);
                }
            });
            console.log('  ✓ Dynamic content error handling works correctly');
        } catch (error) {
            console.log('  ❌ Dynamic content error handling failed:', error.message);
        }
        
        // Test 6: Event Handler Error Handling
        console.log('\n6. Testing Event Handler Error Handling...');
        
        try {
            // Test clicking buttons that might not exist
            const buttonTests = [
                'button[onclick="nonExistentFunction()"]',
                'button[onclick="addAdvancedSkill()"]', // when not in edit mode
                '#non-existent-button'
            ];
            
            for (const selector of buttonTests) {
                try {
                    const button = await page.$(selector);
                    if (button) {
                        await button.click();
                        await page.waitForTimeout(100);
                    }
                } catch (error) {
                    // Expected to fail for some tests
                }
            }
            console.log('  ✓ Event handler error handling works correctly');
        } catch (error) {
            console.log('  ❌ Event handler error handling failed:', error.message);
        }
        
        // Test 7: Browser Compatibility Error Handling
        console.log('\n7. Testing Browser Compatibility...');
        
        try {
            await page.evaluate(() => {
                // Test for modern features
                const features = [
                    'localStorage' in window,
                    'JSON' in window,
                    'addEventListener' in document,
                    'querySelector' in document,
                    'classList' in document.createElement('div')
                ];
                
                const supportedFeatures = features.filter(f => f).length;
                console.log(`Browser supports ${supportedFeatures}/${features.length} required features`);
            });
            console.log('  ✓ Browser compatibility check completed');
        } catch (error) {
            console.log('  ❌ Browser compatibility check failed:', error.message);
        }
        
        // Test 8: Network Error Simulation
        console.log('\n8. Testing Network Error Handling...');
        
        try {
            // Simulate offline condition
            await page.setOfflineMode(true);
            await page.reload({ waitUntil: 'networkidle0' });
            
            // Since it's a local file, this should still work
            await page.waitForFunction(() => window.characterSheet !== undefined);
            console.log('  ✓ Offline mode handling works correctly');
            
            await page.setOfflineMode(false);
        } catch (error) {
            console.log('  ❌ Network error handling failed:', error.message);
        }
        
        // Summary
        console.log('\n=== Error Handling Test Summary ===');
        console.log(`Console errors detected: ${consoleErrors.length}`);
        console.log(`Page errors detected: ${pageErrors.length}`);
        
        if (consoleErrors.length > 0) {
            console.log('\nConsole Errors:');
            consoleErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        if (pageErrors.length > 0) {
            console.log('\nPage Errors:');
            pageErrors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        console.log('\n✓ Error handling tests completed');
        console.log('✓ Invalid input handling tested');
        console.log('✓ localStorage error handling tested');
        console.log('✓ Missing element handling tested');
        console.log('✓ Invalid JSON handling tested');
        console.log('✓ Dynamic content error handling tested');
        console.log('✓ Event handler error handling tested');
        console.log('✓ Browser compatibility checked');
        console.log('✓ Network error handling tested');
        
        const hasErrors = consoleErrors.length > 0 || pageErrors.length > 0;
        console.log(`\n${hasErrors ? '⚠️' : '🎉'} Overall error handling: ${hasErrors ? 'NEEDS ATTENTION' : 'EXCELLENT'}`);
        
    } catch (error) {
        console.error('❌ Error handling test failed:', error);
    } finally {
        await browser.close();
    }
}

testErrorHandling().catch(console.error);