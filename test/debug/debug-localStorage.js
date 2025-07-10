const puppeteer = require('puppeteer');
const path = require('path');

async function debugLocalStorage() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 300
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Debugging localStorage ===');
        
        // Check what's in localStorage
        const allStorage = await page.evaluate(() => {
            const storage = {};
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                storage[key] = localStorage.getItem(key);
            }
            return storage;
        });
        
        console.log('All localStorage keys:', Object.keys(allStorage));
        
        // Check specific key
        const characterData = await page.evaluate(() => {
            return localStorage.getItem('wfrp_character');
        });
        
        console.log('Character data exists:', characterData ? 'Yes' : 'No');
        
        if (characterData) {
            try {
                const parsed = JSON.parse(characterData);
                console.log('Advanced skills in storage:', parsed.advancedSkills);
            } catch (e) {
                console.log('Error parsing character data:', e.message);
            }
        }
        
        // Try to trigger a save manually
        console.log('\nTrying to trigger save manually...');
        await page.evaluate(() => {
            // Check if the character sheet object exists
            if (window.characterSheet) {
                console.log('Character sheet object exists');
                window.characterSheet.saveCharacter();
            } else {
                console.log('Character sheet object not found');
            }
        });
        
        // Check storage again
        const characterDataAfter = await page.evaluate(() => {
            return localStorage.getItem('wfrp_character');
        });
        
        console.log('Character data after manual save:', characterDataAfter ? 'Yes' : 'No');
        
        if (characterDataAfter) {
            try {
                const parsed = JSON.parse(characterDataAfter);
                console.log('Advanced skills after manual save:', parsed.advancedSkills);
            } catch (e) {
                console.log('Error parsing character data after manual save:', e.message);
            }
        }
        
        console.log('\n✓ localStorage debug completed');
        
    } catch (error) {
        console.error('❌ localStorage debug failed:', error);
    } finally {
        await browser.close();
    }
}

debugLocalStorage().catch(console.error);