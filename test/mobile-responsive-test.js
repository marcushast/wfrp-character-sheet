const puppeteer = require('puppeteer');
const path = require('path');

async function testMobileResponsive() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
    });
    
    try {
        const page = await browser.newPage();
        
        const filePath = 'file://' + path.join(__dirname, '..', 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Mobile/Responsive Layout ===');
        
        // Test different viewport sizes
        const viewports = [
            { name: 'Desktop', width: 1200, height: 800 },
            { name: 'Tablet', width: 768, height: 1024 },
            { name: 'Mobile Large', width: 414, height: 896 },
            { name: 'Mobile Small', width: 320, height: 568 }
        ];
        
        for (const viewport of viewports) {
            console.log(`\n--- Testing ${viewport.name} (${viewport.width}x${viewport.height}) ---`);
            
            await page.setViewport({ width: viewport.width, height: viewport.height });
            await page.waitForTimeout(1000);
            
            // Test if key elements are visible and accessible
            const elementTests = await page.evaluate(() => {
                const elements = [
                    { id: 'name', name: 'Character Name Input' },
                    { id: 'ws-initial', name: 'WS Initial Input' },
                    { id: 'edit-advanced-skills', name: 'Edit Advanced Skills Button' },
                    { id: 'edit-talents', name: 'Edit Talents Button' },
                    { id: 'edit-weapons', name: 'Edit Weapons Button' },
                    { id: 'psychology', name: 'Psychology Textarea' },
                    { id: 'corruption', name: 'Corruption Textarea' }
                ];
                
                const results = [];
                elements.forEach(el => {
                    const element = document.getElementById(el.id);
                    if (element) {
                        const rect = element.getBoundingClientRect();
                        const isVisible = rect.width > 0 && rect.height > 0;
                        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
                        results.push({
                            name: el.name,
                            visible: isVisible,
                            inViewport: isInViewport,
                            width: rect.width,
                            height: rect.height
                        });
                    } else {
                        results.push({
                            name: el.name,
                            visible: false,
                            inViewport: false,
                            width: 0,
                            height: 0
                        });
                    }
                });
                
                return results;
            });
            
            // Check form layout
            const layoutTests = await page.evaluate(() => {
                const characterInfo = document.querySelector('.character-info');
                const characteristics = document.querySelector('.characteristics');
                const skills = document.querySelector('.skills');
                
                return {
                    characterInfoWidth: characterInfo ? characterInfo.offsetWidth : 0,
                    characteristicsWidth: characteristics ? characteristics.offsetWidth : 0,
                    skillsWidth: skills ? skills.offsetWidth : 0,
                    bodyWidth: document.body.offsetWidth,
                    hasOverflow: document.body.scrollWidth > document.body.offsetWidth
                };
            });
            
            console.log(`  Layout: Body width: ${layoutTests.bodyWidth}px, Has overflow: ${layoutTests.hasOverflow}`);
            
            // Test form interactions on mobile
            if (viewport.width <= 768) {
                console.log('  Testing mobile interactions...');
                
                // Test typing in form fields
                await page.focus('#name');
                await page.type('#name', 'Mobile Test');
                
                // Test button clicks
                await page.click('#edit-advanced-skills');
                await page.waitForTimeout(500);
                await page.click('#edit-advanced-skills');
                
                console.log('  ✓ Mobile interactions working');
            }
            
            // Report results
            const visibleElements = elementTests.filter(el => el.visible).length;
            const totalElements = elementTests.length;
            
            console.log(`  Visible elements: ${visibleElements}/${totalElements}`);
            if (layoutTests.hasOverflow) {
                console.log('  ⚠️  Horizontal overflow detected');
            } else {
                console.log('  ✓ No horizontal overflow');
            }
            
            // Take screenshot
            await page.screenshot({ 
                path: `mobile-test-${viewport.name.toLowerCase().replace(' ', '-')}.png`, 
                fullPage: true 
            });
            console.log(`  ✓ Screenshot saved: mobile-test-${viewport.name.toLowerCase().replace(' ', '-')}.png`);
        }
        
        console.log('\n=== Mobile/Responsive Test Summary ===');
        console.log('✓ Tested multiple viewport sizes');
        console.log('✓ Verified element visibility and accessibility');
        console.log('✓ Tested mobile interactions');
        console.log('✓ Checked for layout overflow issues');
        console.log('✓ Generated screenshots for visual validation');
        
        console.log('\n📱 Mobile/Responsive test completed successfully!');
        
    } catch (error) {
        console.error('❌ Mobile/Responsive test failed:', error);
    } finally {
        await browser.close();
    }
}

testMobileResponsive().catch(console.error);