const puppeteer = require('puppeteer');
const path = require('path');

async function visualCheck() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250,
        defaultViewport: null
    });
    
    try {
        const page = await browser.newPage();
        
        // Set a standard desktop viewport
        await page.setViewport({ width: 1200, height: 800 });
        
        // Navigate to character sheet
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Visual Check: Character Sheet Layout ===');
        
        // Wait for page to load completely
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Take a screenshot to see the current layout
        await page.screenshot({ 
            path: 'layout-check.png', 
            fullPage: true 
        });
        
        console.log('✓ Screenshot saved as layout-check.png');
        
        // Get some measurements
        const bodyWidth = await page.evaluate(() => document.body.offsetWidth);
        const sheetWidth = await page.evaluate(() => document.querySelector('.character-sheet').offsetWidth);
        const sheetPadding = await page.evaluate(() => {
            const sheet = document.querySelector('.character-sheet');
            const style = window.getComputedStyle(sheet);
            return {
                left: style.paddingLeft,
                right: style.paddingRight,
                top: style.paddingTop,
                bottom: style.paddingBottom
            };
        });
        
        console.log(`Body width: ${bodyWidth}px`);
        console.log(`Character sheet width: ${sheetWidth}px`);
        console.log(`Sheet padding:`, sheetPadding);
        
        // Check if sheet is taking up appropriate space
        const widthPercentage = (sheetWidth / bodyWidth * 100).toFixed(1);
        console.log(`Sheet uses ${widthPercentage}% of body width`);
        
        // Keep browser open for visual inspection
        console.log('\n=== Browser will stay open for 10 seconds for visual inspection ===');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        console.log('✓ Visual check completed');
        
    } catch (error) {
        console.error('❌ Visual check failed:', error);
    } finally {
        await browser.close();
    }
}

visualCheck().catch(console.error);