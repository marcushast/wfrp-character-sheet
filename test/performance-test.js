const puppeteer = require('puppeteer');
const path = require('path');

async function testPerformance() {
    const browser = await puppeteer.launch({ 
        headless: true,
        slowMo: 0
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        console.log('=== Performance Testing ===');
        
        // Test 1: Page Load Performance
        console.log('\n1. Testing Page Load Performance...');
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        
        const startTime = Date.now();
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        const loadTime = Date.now() - startTime;
        
        console.log(`  Page load time: ${loadTime}ms`);
        
        // Test 2: JavaScript Initialization Performance
        console.log('\n2. Testing JavaScript Initialization...');
        
        const jsInitStart = Date.now();
        await page.waitForFunction(() => window.characterSheet !== undefined);
        const jsInitTime = Date.now() - jsInitStart;
        
        console.log(`  JavaScript initialization time: ${jsInitTime}ms`);
        
        // Test 3: Form Input Performance
        console.log('\n3. Testing Form Input Performance...');
        
        const inputTests = [
            { id: 'name', value: 'Performance Test Character' },
            { id: 'species', value: 'Human' },
            { id: 'ws-initial', value: '35' },
            { id: 'bs-initial', value: '30' },
            { id: 's-initial', value: '40' },
            { id: 'psychology', value: 'Brave and determined warrior with a strong sense of justice' },
            { id: 'corruption', value: 'Minor exposure to chaos energies' }
        ];
        
        let totalInputTime = 0;
        for (const input of inputTests) {
            const inputStart = Date.now();
            await page.type(`#${input.id}`, input.value);
            const inputTime = Date.now() - inputStart;
            totalInputTime += inputTime;
        }
        
        const avgInputTime = totalInputTime / inputTests.length;
        console.log(`  Average input time: ${avgInputTime.toFixed(2)}ms per field`);
        console.log(`  Total input time: ${totalInputTime}ms`);
        
        // Test 4: Dynamic Content Addition Performance
        console.log('\n4. Testing Dynamic Content Performance...');
        
        // Test adding multiple advanced skills
        await page.click('#edit-advanced-skills');
        await page.waitForTimeout(100);
        
        const skillAddStart = Date.now();
        for (let i = 0; i < 10; i++) {
            await page.click('button[onclick="addAdvancedSkill()"]');
            await page.waitForTimeout(10);
        }
        const skillAddTime = Date.now() - skillAddStart;
        
        console.log(`  Adding 10 advanced skills: ${skillAddTime}ms`);
        console.log(`  Average per skill: ${(skillAddTime / 10).toFixed(2)}ms`);
        
        // Test adding multiple talents
        await page.click('#edit-talents');
        await page.waitForTimeout(100);
        
        const talentAddStart = Date.now();
        for (let i = 0; i < 10; i++) {
            await page.click('button[onclick="addTalent()"]');
            await page.waitForTimeout(10);
        }
        const talentAddTime = Date.now() - talentAddStart;
        
        console.log(`  Adding 10 talents: ${talentAddTime}ms`);
        console.log(`  Average per talent: ${(talentAddTime / 10).toFixed(2)}ms`);
        
        // Test 5: localStorage Performance
        console.log('\n5. Testing localStorage Performance...');
        
        const saveStart = Date.now();
        await page.evaluate(() => {
            // Trigger save by changing a field
            const event = new Event('change', { bubbles: true });
            document.getElementById('name').dispatchEvent(event);
        });
        await page.waitForTimeout(100);
        const saveTime = Date.now() - saveStart;
        
        console.log(`  localStorage save time: ${saveTime}ms`);
        
        // Test 6: Memory Usage
        console.log('\n6. Testing Memory Usage...');
        
        const memoryMetrics = await page.metrics();
        console.log(`  JS heap used: ${(memoryMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  JS heap total: ${(memoryMetrics.JSHeapTotalSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`  JS heap size limit: ${(memoryMetrics.JSHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`);
        
        // Test 7: Calculation Performance
        console.log('\n7. Testing Calculation Performance...');
        
        const calcStart = Date.now();
        await page.type('#ws-advances', '10');
        await page.type('#bs-advances', '5');
        await page.type('#s-advances', '8');
        await page.waitForTimeout(100);
        const calcTime = Date.now() - calcStart;
        
        console.log(`  Calculation update time: ${calcTime}ms`);
        
        // Test 8: Large Data Load Performance
        console.log('\n8. Testing Large Data Load Performance...');
        
        const largeDataStart = Date.now();
        await page.evaluate(() => {
            // Simulate loading a character with lots of data
            const largeCharacter = {
                name: 'Performance Test Character',
                species: 'Human',
                characteristics: {
                    ws: { initial: 35, advances: 10 },
                    bs: { initial: 30, advances: 5 },
                    s: { initial: 40, advances: 8 }
                },
                advancedSkills: [],
                talents: [],
                weapons: [],
                armour: [],
                spells: []
            };
            
            // Add many skills
            for (let i = 0; i < 50; i++) {
                largeCharacter.advancedSkills.push({
                    name: `Skill ${i}`,
                    characteristic: 'Int',
                    advances: i % 20
                });
            }
            
            // Add many talents
            for (let i = 0; i < 30; i++) {
                largeCharacter.talents.push({
                    name: `Talent ${i}`,
                    times: i % 5,
                    description: `Description for talent ${i}`
                });
            }
            
            localStorage.setItem('wfrp-character', JSON.stringify(largeCharacter));
        });
        
        await page.reload({ waitUntil: 'networkidle0' });
        const largeDataTime = Date.now() - largeDataStart;
        
        console.log(`  Large data load time: ${largeDataTime}ms`);
        
        // Performance Summary
        console.log('\n=== Performance Test Summary ===');
        console.log(`✓ Page load: ${loadTime}ms`);
        console.log(`✓ JS initialization: ${jsInitTime}ms`);
        console.log(`✓ Form input average: ${avgInputTime.toFixed(2)}ms`);
        console.log(`✓ Dynamic content: ${((skillAddTime + talentAddTime) / 20).toFixed(2)}ms per item`);
        console.log(`✓ localStorage save: ${saveTime}ms`);
        console.log(`✓ Memory usage: ${(memoryMetrics.JSHeapUsedSize / 1024 / 1024).toFixed(2)} MB`);
        console.log(`✓ Calculation update: ${calcTime}ms`);
        console.log(`✓ Large data load: ${largeDataTime}ms`);
        
        // Performance benchmarks
        const benchmarks = {
            pageLoad: loadTime < 2000,
            jsInit: jsInitTime < 1000,
            inputAvg: avgInputTime < 50,
            dynamicContent: (skillAddTime + talentAddTime) / 20 < 100,
            localStorage: saveTime < 200,
            memoryUsage: memoryMetrics.JSHeapUsedSize / 1024 / 1024 < 50,
            calculations: calcTime < 100,
            largeData: largeDataTime < 5000
        };
        
        console.log('\n=== Performance Benchmarks ===');
        Object.entries(benchmarks).forEach(([test, passed]) => {
            console.log(`${passed ? '✓' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
        });
        
        const allPassed = Object.values(benchmarks).every(b => b);
        console.log(`\n${allPassed ? '🎉' : '⚠️'} Overall performance: ${allPassed ? 'EXCELLENT' : 'NEEDS ATTENTION'}`);
        
    } catch (error) {
        console.error('❌ Performance test failed:', error);
    } finally {
        await browser.close();
    }
}

testPerformance().catch(console.error);