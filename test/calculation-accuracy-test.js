const puppeteer = require('puppeteer');
const path = require('path');

async function testCalculationAccuracy() {
    const browser = await puppeteer.launch({ 
        headless: true,
        slowMo: 100
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Calculation Accuracy Testing ===');
        
        // Wait for initialization
        await page.waitForFunction(() => window.characterSheet !== undefined);
        
        // Test 1: Characteristic Current Value Calculations
        console.log('\n1. Testing Characteristic Current Value Calculations...');
        
        const characteristicTests = [
            { char: 'ws', initial: 30, advances: 10, expected: 40 },
            { char: 'bs', initial: 25, advances: 15, expected: 40 },
            { char: 's', initial: 35, advances: 5, expected: 40 },
            { char: 't', initial: 40, advances: 0, expected: 40 },
            { char: 'ag', initial: 45, advances: 25, expected: 70 },
            { char: 'int', initial: 20, advances: 30, expected: 50 },
            { char: 'wp', initial: 30, advances: 20, expected: 50 },
            { char: 'fel', initial: 25, advances: 15, expected: 40 }
        ];
        
        let characteristicsPassed = 0;
        for (const test of characteristicTests) {
            // Clear and set values
            await page.evaluate((char) => {
                document.getElementById(`${char}-initial`).value = '';
                document.getElementById(`${char}-advances`).value = '';
            }, test.char);
            
            await page.type(`#${test.char}-initial`, test.initial.toString());
            await page.type(`#${test.char}-advances`, test.advances.toString());
            
            // Trigger calculation
            await page.evaluate((char) => {
                const event = new Event('input', { bubbles: true });
                document.getElementById(`${char}-advances`).dispatchEvent(event);
            }, test.char);
            
            await page.waitForTimeout(100);
            
            const currentValue = await page.$eval(`#${test.char}-current`, el => parseInt(el.value) || 0);
            const passed = currentValue === test.expected;
            
            console.log(`  ${test.char.toUpperCase()}: ${test.initial} + ${test.advances} = ${currentValue} (expected: ${test.expected}) ${passed ? '✓' : '❌'}`);
            
            if (passed) characteristicsPassed++;
        }
        
        // Test 2: Skill Total Calculations
        console.log('\n2. Testing Skill Total Calculations...');
        
        // Set up characteristics for skill calculations
        await page.evaluate(() => {
            document.getElementById('ws-initial').value = '30';
            document.getElementById('ws-advances').value = '10'; // WS = 40
            document.getElementById('bs-initial').value = '25';
            document.getElementById('bs-advances').value = '15'; // BS = 40
            document.getElementById('ag-initial').value = '35';
            document.getElementById('ag-advances').value = '5'; // AG = 40
            
            // Trigger calculations
            ['ws', 'bs', 'ag'].forEach(char => {
                const event = new Event('input', { bubbles: true });
                document.getElementById(`${char}-advances`).dispatchEvent(event);
            });
        });
        
        await page.waitForTimeout(200);
        
        const skillTests = [
            { skill: 'melee-basic', char: 'WS', charValue: 40, advances: 10, expected: 50 },
            { skill: 'ranged-basic', char: 'BS', charValue: 40, advances: 5, expected: 45 },
            { skill: 'athletics', char: 'AG', charValue: 40, advances: 15, expected: 55 }
        ];
        
        let skillsPassed = 0;
        for (const test of skillTests) {
            // Set skill advances
            await page.evaluate((skill) => {
                const advancesInput = document.querySelector(`#${skill}-advances`);
                if (advancesInput) {
                    advancesInput.value = '';
                }
            }, test.skill);
            
            await page.type(`#${test.skill}-advances`, test.advances.toString());
            
            // Trigger calculation
            await page.evaluate((skill) => {
                const event = new Event('input', { bubbles: true });
                const advancesInput = document.querySelector(`#${skill}-advances`);
                if (advancesInput) {
                    advancesInput.dispatchEvent(event);
                }
            }, test.skill);
            
            await page.waitForTimeout(100);
            
            const totalValue = await page.evaluate((skill) => {
                const totalInput = document.querySelector(`#${skill}-total`);
                return totalInput ? parseInt(totalInput.value) || 0 : 0;
            }, test.skill);
            
            const passed = totalValue === test.expected;
            
            console.log(`  ${test.skill}: ${test.charValue} + ${test.advances} = ${totalValue} (expected: ${test.expected}) ${passed ? '✓' : '❌'}`);
            
            if (passed) skillsPassed++;
        }
        
        // Test 3: Experience Calculations
        console.log('\n3. Testing Experience Calculations...');
        
        const experienceTests = [
            { current: 1000, spent: 250, expectedTotal: 1250 },
            { current: 500, spent: 750, expectedTotal: 1250 },
            { current: 2000, spent: 1500, expectedTotal: 3500 }
        ];
        
        let experiencePassed = 0;
        for (const test of experienceTests) {
            // Clear and set values
            await page.evaluate(() => {
                document.getElementById('current-exp').value = '';
                document.getElementById('spent-exp').value = '';
            });
            
            await page.type('#current-exp', test.current.toString());
            await page.type('#spent-exp', test.spent.toString());
            
            // Trigger calculation
            await page.evaluate(() => {
                const event = new Event('input', { bubbles: true });
                document.getElementById('spent-exp').dispatchEvent(event);
            });
            
            await page.waitForTimeout(100);
            
            const totalExp = await page.$eval('#total-exp', el => parseInt(el.value) || 0);
            const passed = totalExp === test.expectedTotal;
            
            console.log(`  Experience: ${test.current} + ${test.spent} = ${totalExp} (expected: ${test.expectedTotal}) ${passed ? '✓' : '❌'}`);
            
            if (passed) experiencePassed++;
        }
        
        // Test 4: Encumbrance Calculations
        console.log('\n4. Testing Encumbrance Calculations...');
        
        const encumbranceTests = [
            { weapons: 5, armour: 10, trappings: 15, expected: 30 },
            { weapons: 0, armour: 25, trappings: 5, expected: 30 },
            { weapons: 12, armour: 8, trappings: 20, expected: 40 }
        ];
        
        let encumbrancePassed = 0;
        for (const test of encumbranceTests) {
            // Clear and set values
            await page.evaluate(() => {
                document.getElementById('enc-weapons').value = '';
                document.getElementById('enc-armour').value = '';
                document.getElementById('enc-trappings').value = '';
            });
            
            await page.type('#enc-weapons', test.weapons.toString());
            await page.type('#enc-armour', test.armour.toString());
            await page.type('#enc-trappings', test.trappings.toString());
            
            // Trigger calculation
            await page.evaluate(() => {
                const event = new Event('input', { bubbles: true });
                document.getElementById('enc-trappings').dispatchEvent(event);
            });
            
            await page.waitForTimeout(100);
            
            const totalEnc = await page.$eval('#enc-total', el => parseInt(el.value) || 0);
            const passed = totalEnc === test.expected;
            
            console.log(`  Encumbrance: ${test.weapons} + ${test.armour} + ${test.trappings} = ${totalEnc} (expected: ${test.expected}) ${passed ? '✓' : '❌'}`);
            
            if (passed) encumbrancePassed++;
        }
        
        // Test 5: Wealth Calculations (if any)
        console.log('\n5. Testing Wealth Calculations...');
        
        const wealthTests = [
            { d: 100, ss: 50, gc: 5 },
            { d: 0, ss: 0, gc: 10 },
            { d: 250, ss: 125, gc: 0 }
        ];
        
        let wealthPassed = 0;
        for (const test of wealthTests) {
            // Clear and set values
            await page.evaluate(() => {
                document.getElementById('wealth-d').value = '';
                document.getElementById('wealth-ss').value = '';
                document.getElementById('wealth-gc').value = '';
            });
            
            await page.type('#wealth-d', test.d.toString());
            await page.type('#wealth-ss', test.ss.toString());
            await page.type('#wealth-gc', test.gc.toString());
            
            await page.waitForTimeout(100);
            
            // Check if values are stored correctly (wealth doesn't have calculations, just storage)
            const dValue = await page.$eval('#wealth-d', el => parseInt(el.value) || 0);
            const ssValue = await page.$eval('#wealth-ss', el => parseInt(el.value) || 0);
            const gcValue = await page.$eval('#wealth-gc', el => parseInt(el.value) || 0);
            
            const passed = dValue === test.d && ssValue === test.ss && gcValue === test.gc;
            
            console.log(`  Wealth: D=${dValue}, SS=${ssValue}, GC=${gcValue} ${passed ? '✓' : '❌'}`);
            
            if (passed) wealthPassed++;
        }
        
        // Test 6: Edge Cases
        console.log('\n6. Testing Edge Cases...');
        
        const edgeCases = [
            { description: 'Zero values', ws: 0, advances: 0, expected: 0 },
            { description: 'Maximum values', ws: 100, advances: 50, expected: 150 },
            { description: 'Negative advances', ws: 50, advances: -10, expected: 40 }
        ];
        
        let edgeCasesPassed = 0;
        for (const test of edgeCases) {
            await page.evaluate(() => {
                document.getElementById('ws-initial').value = '';
                document.getElementById('ws-advances').value = '';
            });
            
            await page.type('#ws-initial', test.ws.toString());
            await page.type('#ws-advances', test.advances.toString());
            
            await page.evaluate(() => {
                const event = new Event('input', { bubbles: true });
                document.getElementById('ws-advances').dispatchEvent(event);
            });
            
            await page.waitForTimeout(100);
            
            const currentValue = await page.$eval('#ws-current', el => parseInt(el.value) || 0);
            const passed = currentValue === test.expected;
            
            console.log(`  ${test.description}: ${test.ws} + ${test.advances} = ${currentValue} (expected: ${test.expected}) ${passed ? '✓' : '❌'}`);
            
            if (passed) edgeCasesPassed++;
        }
        
        // Summary
        console.log('\n=== Calculation Accuracy Test Summary ===');
        console.log(`✓ Characteristics: ${characteristicsPassed}/${characteristicTests.length} passed`);
        console.log(`✓ Skills: ${skillsPassed}/${skillTests.length} passed`);
        console.log(`✓ Experience: ${experiencePassed}/${experienceTests.length} passed`);
        console.log(`✓ Encumbrance: ${encumbrancePassed}/${encumbranceTests.length} passed`);
        console.log(`✓ Wealth: ${wealthPassed}/${wealthTests.length} passed`);
        console.log(`✓ Edge Cases: ${edgeCasesPassed}/${edgeCases.length} passed`);
        
        const totalTests = characteristicTests.length + skillTests.length + experienceTests.length + encumbranceTests.length + wealthTests.length + edgeCases.length;
        const totalPassed = characteristicsPassed + skillsPassed + experiencePassed + encumbrancePassed + wealthPassed + edgeCasesPassed;
        
        console.log(`\nOverall: ${totalPassed}/${totalTests} calculations passed`);
        
        const accuracy = (totalPassed / totalTests) * 100;
        console.log(`Calculation accuracy: ${accuracy.toFixed(1)}%`);
        
        if (accuracy === 100) {
            console.log('🎉 All calculations are perfectly accurate!');
        } else if (accuracy >= 90) {
            console.log('✓ Calculations are highly accurate');
        } else if (accuracy >= 80) {
            console.log('⚠️ Calculations are mostly accurate but need attention');
        } else {
            console.log('❌ Calculations have significant accuracy issues');
        }
        
    } catch (error) {
        console.error('❌ Calculation accuracy test failed:', error);
    } finally {
        await browser.close();
    }
}

testCalculationAccuracy().catch(console.error);