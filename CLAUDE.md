# WFRP Character Sheet - Design Architecture

## Project Overview
This is a web-based character sheet for Warhammer Fantasy Roleplay (WFRP) 4th Edition, built as a single-page application using vanilla HTML, CSS, and JavaScript. The application provides a comprehensive digital character sheet with automatic calculations, persistent storage, and an interface that closely mirrors the official WFRP character sheet layout.

## Architecture Design

### Core Design Philosophy
1. **Single-Page Application**: All functionality contained within one HTML file with supporting CSS and JavaScript files
2. **Vanilla JavaScript**: No external frameworks - pure JavaScript for maximum compatibility and minimal dependencies
3. **Local Storage Persistence**: Character data is automatically saved to browser localStorage for persistence across sessions
4. **Automatic Calculations**: Real-time calculation of derived stats (skill totals, characteristic values, experience totals)
5. **Edit Mode System**: Advanced skills and talents use a toggle-based edit system for data integrity

### File Structure
```
/
├── index.html          # Main HTML structure and layout
├── script.js           # Core JavaScript functionality and character sheet logic
├── style.css           # Complete styling and responsive design
├── package.json        # Node.js dependencies (puppeteer for testing)
└── CLAUDE.md          # This documentation file
```

## HTML Structure (`index.html`)

### Layout Hierarchy
```
.character-sheet
├── .sheet-header (Title and branding)
├── .character-info (Basic character information)
├── .sheet-main
│   ├── .combined-stats (Fate, Resilience, Movement, Experience)
│   ├── .characteristics (Primary stats table)
│   ├── .skills (Basic skills list)
│   ├── .skills (Advanced skills with edit mode)
│   └── .talents (Talents with edit mode)
└── .combat-section
    ├── .wounds
    ├── .weapons
    ├── .armour
    ├── .trappings
    ├── .wealth
    ├── .spells-section
    ├── .psychology
    ├── .corruption
    ├── .ambitions
    └── .party
```

### Key Components
- **Character Info**: Basic character details (name, species, class, career, etc.)
- **Characteristics Table**: 10 core characteristics with Initial/Advances/Current columns
- **Skills System**: Separate handling for basic skills (always visible) and advanced skills (edit mode)
- **Talents System**: Edit mode for adding/removing talents with name, times taken, and description
- **Combat Section**: Weapons, armour, trappings, and related combat stats
- **Spells & Magic**: Spell/prayer tracking with full spell details
- **Roleplay Elements**: Psychology, corruption, ambitions, and party information

## JavaScript Architecture (`script.js`)

### Core Class: `WFRPCharacterSheet`
The main application logic is contained within a single class that handles:

#### Constructor and Initialization
```javascript
constructor() {
    this.character = this.loadCharacter();  // Load from localStorage
    this.advancedSkillsEditMode = false;     // Edit mode state
    this.talentsEditMode = false;            // Edit mode state
    this.basicSkills = [...];                // Static basic skills array
    this.initializeSheet();                  // Populate all fields
    this.setupEventListeners();             // Bind event handlers
}
```

#### Data Management
- **loadCharacter()**: Loads character data from localStorage or returns default structure
- **saveCharacter()**: Saves current character state to localStorage
- **updateCharacterData()**: Updates character object based on form input changes

#### UI Population Methods
- **populateBasicInfo()**: Fills basic character information fields
- **populateCharacteristics()**: Populates the characteristics table
- **populateSecondaryStats()**: Fills fate, resilience, movement, experience
- **populateBasicSkills()**: Generates the basic skills list
- **populateAdvancedSkills()**: Manages advanced skills with edit mode
- **populateTalents()**: Manages talents with edit mode

#### Edit Mode System
Advanced skills and talents use a sophisticated edit mode system:
- **Read-only mode**: Fields are disabled, no add/remove buttons
- **Edit mode**: Fields become editable, add/remove buttons appear
- **Toggle functions**: Switch between modes and save data

#### Calculation Engine
- **calculateDerivedStats()**: Real-time calculation of all derived values
- **getCharacteristicValue()**: Retrieves current characteristic values for skill calculations
- **Event-driven updates**: Calculations trigger on input changes

### Event Handling
All form inputs have change and input event listeners that:
1. Update the character data object
2. Trigger derived stat calculations
3. Save to localStorage
4. Update UI elements in real-time

## CSS Design (`style.css`)

### Design Principles
1. **WFRP Theme**: Brown color scheme (#8B4513) matching WFRP aesthetic
2. **Grid-Based Layout**: CSS Grid for table-like structures (characteristics, skills, etc.)
3. **Responsive Design**: Mobile-first approach with media queries
4. **Form Styling**: Consistent input styling throughout
5. **Edit Mode Styling**: Visual distinction between read-only and edit modes

### Key Styling Patterns
- **Section Containers**: Bordered boxes with consistent padding for each major section
- **Table Grids**: CSS Grid for alignment of tabular data
- **Edit Mode Classes**: `.advanced-skills-readonly`, `.talents-readonly` for mode-specific styling
- **Button Styling**: Consistent button appearance with hover/active states
- **Responsive Breakpoints**: Mobile optimization at 768px and below

## Data Model

### Character Data Structure
```javascript
{
    // Basic Info
    name: '', species: '', class: '', career: '', // etc.
    
    // Characteristics
    characteristics: {
        ws: { initial: 0, advances: 0 },
        bs: { initial: 0, advances: 0 },
        // ... all 10 characteristics
    },
    
    // Secondary Stats
    fate: 0, fortune: 0, resilience: 0, resolve: 0,
    movement: 0, walk: 0, run: 0,
    experience: { current: 0, spent: 0 },
    
    // Skills & Talents
    skills: {}, // Basic skills advances
    advancedSkills: [{ name: '', characteristic: '', advances: 0 }],
    talents: [{ name: '', times: 0, description: '' }],
    
    // Roleplay
    ambitions: { short: '', long: '' },
    party: { name: '', short: '', long: '', members: '' },
    
    // Combat (extensible)
    wounds: { sb: 0, tbPlus2: 0, wpb: 0, hardy: 0, wounds: 0 },
    weapons: []
}
```

## Development Guidelines

### Adding New Features
1. **HTML Structure**: Add new sections following the existing pattern
2. **JavaScript Methods**: Add population and event handling methods to the main class
3. **CSS Styling**: Follow the established grid and styling patterns
4. **Data Integration**: Extend the character data model appropriately

### Code Style
- Use semantic HTML5 elements
- Maintain consistent indentation (4 spaces)
- Use descriptive variable and function names
- Add comments for complex logic
- Keep CSS organized by component sections

### Testing with Puppeteer

#### Overview
The project includes comprehensive Puppeteer-based testing to verify functionality across all major components. Puppeteer provides automated browser testing that simulates real user interactions.

#### Test Files
The project includes several test files with different purposes:

1. **`simple-test.js`** - Basic page validation and element existence
2. **`quick-test.js`** - Fast headless testing of core functionality
3. **`working-test.js`** - Visual testing with browser window
4. **`test-character-sheet.js`** - Complete functional testing
5. **`comprehensive-test.js`** - Full end-to-end testing with detailed validation

#### Running Tests

**Prerequisites:**
```bash
npm install puppeteer
```

**Execute Tests:**
```bash
# Basic page validation
node simple-test.js

# Quick headless test
node quick-test.js

# Visual test (opens browser)
node working-test.js

# Full functional test
node test-character-sheet.js

# Comprehensive end-to-end test
node comprehensive-test.js
```

#### Test Categories

##### 1. Page Loading and Structure Tests
```javascript
// Verify page loads correctly
const filePath = 'file://' + path.join(__dirname, 'index.html');
await page.goto(filePath, { waitUntil: 'networkidle0' });

// Check for critical elements
const nameInput = await page.$('#name');
const wsInput = await page.$('#ws-initial');
const addSkillBtn = await page.$('button[onclick="addAdvancedSkill()"]');
```

##### 2. Form Input Tests
```javascript
// Test character information
await page.type('#name', 'Grimjaw the Bold');
await page.type('#species', 'Human');
await page.type('#class', 'Warrior');

// Test characteristics
await page.type('#ws-initial', '35');
await page.type('#bs-initial', '30');
await page.type('#s-initial', '40');
```

##### 3. Dynamic Content Tests
```javascript
// Test adding advanced skills
await page.click('button[onclick="addAdvancedSkill()"]');
await page.waitForSelector('#advanced-skills .skill-row:last-child');

// Test adding talents
await page.click('button[onclick="addTalent()"]');
await page.waitForSelector('#talents-list .talent-row:last-child');

// Test adding weapons
await page.click('button[onclick="addWeapon()"]');
await page.waitForSelector('#weapons-list .weapon-row:last-child');
```

##### 4. Edit Mode Tests
```javascript
// Test advanced skills edit mode
await page.click('#edit-advanced-skills');
console.log('✓ Advanced skills edit mode toggled');

// Test talents edit mode
await page.click('#edit-talents');
console.log('✓ Talents edit mode toggled');
```

##### 5. Calculation Tests
```javascript
// Fill characteristics and verify calculations
await page.type('#ws-initial', '35');
await page.type('#ws-advances', '5');

// Check if current value is calculated correctly
const currentValue = await page.$eval('#ws-current', el => el.value);
// Should be 40 (35 + 5)
```

#### Test Configuration

##### Browser Configuration
```javascript
const browser = await puppeteer.launch({ 
    headless: false,    // Set to true for CI/CD
    slowMo: 250,       // Slow down for visibility
    timeout: 10000     // Timeout for operations
});

// Set viewport for consistent testing
await page.setViewport({ width: 1200, height: 800 });
```

##### Common Test Patterns

**Waiting for Elements:**
```javascript
// Wait for element to appear
await page.waitForSelector('#advanced-skills .skill-row', { timeout: 5000 });

// Wait for page to stabilize
await page.waitForTimeout(2000);
```

**Screenshot Capture:**
```javascript
// Full page screenshot
await page.screenshot({ path: 'test-result.png', fullPage: true });
```

**Element Interaction:**
```javascript
// Type in input field
await page.type('#name', 'Test Character');

// Click button
await page.click('button[onclick="addAdvancedSkill()"]');

// Select dropdown option
await page.select('select.skill-char', 'WS');
```

#### Test Validation Patterns

##### Element Existence
```javascript
const elements = {
    nameInput: await page.$('#name'),
    wsInput: await page.$('#ws-initial'),
    addSkillBtn: await page.$('button[onclick="addAdvancedSkill()"]')
};

console.log('Name input:', elements.nameInput ? '✓' : '❌');
```

##### Content Validation
```javascript
// Check if dynamic content was added
const skillRows = await page.$$('#advanced-skills .skill-row');
console.log(`Advanced skills: ${skillRows.length} row(s) added`);
```

##### Value Verification
```javascript
// Verify calculated values
const totalExp = await page.$eval('#total-exp', el => el.value);
const currentExp = await page.$eval('#current-exp', el => el.value);
const spentExp = await page.$eval('#spent-exp', el => el.value);
// Verify: totalExp = currentExp + spentExp
```

#### Testing Best Practices

1. **Use Proper Waits:**
   - Always wait for elements to appear before interacting
   - Use `waitForSelector()` for dynamic content
   - Add delays for JavaScript initialization

2. **Screenshot Documentation:**
   - Take screenshots at key points for visual verification
   - Use descriptive filenames
   - Capture full page for complete context

3. **Error Handling:**
   ```javascript
   try {
       // Test operations
   } catch (error) {
       console.error('❌ Test failed:', error);
   } finally {
       await browser.close();
   }
   ```

4. **Test Organization:**
   - Group related tests logically
   - Use descriptive console output
   - Validate both success and failure cases

#### CI/CD Integration

**For automated testing environments:**
```javascript
const browser = await puppeteer.launch({ 
    headless: true,           // No GUI in CI
    args: ['--no-sandbox']    // Required for some CI environments
});
```

#### Creating New Tests

**Test Template:**
```javascript
const puppeteer = require('puppeteer');
const path = require('path');

async function customTest() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        // Navigate to character sheet
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        // Add your test logic here
        
        // Take screenshot
        await page.screenshot({ path: 'custom-test-result.png', fullPage: true });
        
        console.log('✓ Custom test completed');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await browser.close();
    }
}

customTest().catch(console.error);
```

**Package.json Script Integration:**
Add to `package.json`:
```json
{
  "scripts": {
    "test": "node comprehensive-test.js",
    "test:quick": "node quick-test.js",
    "test:simple": "node simple-test.js",
    "test:visual": "node working-test.js",
    "test:full": "node test-character-sheet.js",
    "test:all": "node simple-test.js && node quick-test.js && node comprehensive-test.js"
  }
}
```

Then run with:
```bash
npm test              # Run comprehensive test
npm run test:quick    # Run quick test
npm run test:all      # Run all tests in sequence
```

## Development Workflow: Features vs Bugs

### Classification Guidelines

**IMPORTANT**: All new work should be classified as either a **Feature** or a **Bug**. If the classification is unclear, ask the user to clarify.

#### Feature Definition
- New functionality that doesn't currently exist
- Enhancements to existing functionality
- UI/UX improvements
- New sections, fields, or capabilities

#### Bug Definition
- Existing functionality that doesn't work as expected
- Calculation errors
- UI elements that don't respond correctly
- Data persistence issues
- Browser compatibility problems

### Feature Development Workflow

**Process:**
1. **Understand Requirements** - Clarify what the feature should do
2. **Write Test First** - Create a Puppeteer test that validates the feature
3. **Run Test** - Confirm the test fails (feature doesn't exist yet)
4. **Implement Feature** - Add the functionality to the codebase
5. **Run Test Again** - Confirm the test passes
6. **Add to Test Suite** - Permanently add the test to the project
7. **Update Documentation** - Update CLAUDE.md if needed

**Feature Test Template:**
```javascript
// feature-[feature-name]-test.js
const puppeteer = require('puppeteer');
const path = require('path');

async function testNewFeature() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing New Feature: [Feature Name] ===');
        
        // Test the new feature functionality
        // Example: Testing a new spell slots feature
        await page.type('#spell-slots-current', '3');
        await page.type('#spell-slots-max', '5');
        
        // Verify the feature works
        const currentSlots = await page.$eval('#spell-slots-current', el => el.value);
        const maxSlots = await page.$eval('#spell-slots-max', el => el.value);
        
        if (currentSlots === '3' && maxSlots === '5') {
            console.log('✓ Spell slots feature works correctly');
        } else {
            console.log('❌ Spell slots feature failed');
        }
        
        // Take screenshot for documentation
        await page.screenshot({ 
            path: 'feature-spell-slots-test.png', 
            fullPage: true 
        });
        
        console.log('✓ Feature test completed');
        
    } catch (error) {
        console.error('❌ Feature test failed:', error);
    } finally {
        await browser.close();
    }
}

testNewFeature().catch(console.error);
```

### Bug Development Workflow

**Process:**
1. **Reproduce Bug** - Create a Puppeteer test that reproduces the issue
2. **Run Test** - Confirm the test fails (demonstrating the bug)
3. **Fix Bug** - Implement the fix in the codebase
4. **Run Test Again** - Confirm the test passes (bug is fixed)
5. **Add to Test Suite** - Permanently add the test as a regression test
6. **Update Documentation** - Document the fix if needed

**Bug Test Template:**
```javascript
// bug-[bug-description]-test.js
const puppeteer = require('puppeteer');
const path = require('path');

async function testBugFix() {
    const browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 250
    });
    
    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1200, height: 800 });
        
        const filePath = 'file://' + path.join(__dirname, 'index.html');
        await page.goto(filePath, { waitUntil: 'networkidle0' });
        
        console.log('=== Testing Bug Fix: [Bug Description] ===');
        
        // Reproduce the bug scenario
        // Example: Testing characteristic calculation bug
        await page.type('#ws-initial', '35');
        await page.type('#ws-advances', '5');
        
        // Wait for calculation
        await page.waitForTimeout(500);
        
        // Verify the bug is fixed
        const currentValue = await page.$eval('#ws-current', el => el.value);
        const expectedValue = '40'; // 35 + 5
        
        if (currentValue === expectedValue) {
            console.log('✓ Characteristic calculation bug is fixed');
        } else {
            console.log(`❌ Bug still exists: expected ${expectedValue}, got ${currentValue}`);
        }
        
        // Take screenshot for documentation
        await page.screenshot({ 
            path: 'bug-characteristic-calculation-test.png', 
            fullPage: true 
        });
        
        console.log('✓ Bug test completed');
        
    } catch (error) {
        console.error('❌ Bug test failed:', error);
    } finally {
        await browser.close();
    }
}

testBugFix().catch(console.error);
```

### Test File Organization

**Naming Convention:**
- Features: `feature-[feature-name]-test.js`
- Bugs: `bug-[bug-description]-test.js`
- Regression: `regression-[issue-number]-test.js`

**Directory Structure:**
```
/tests/
├── features/
│   ├── feature-spell-slots-test.js
│   ├── feature-dice-roller-test.js
│   └── feature-character-import-test.js
├── bugs/
│   ├── bug-characteristic-calculation-test.js
│   ├── bug-skill-total-display-test.js
│   └── bug-localStorage-persistence-test.js
└── regression/
    ├── regression-001-edit-mode-test.js
    └── regression-002-mobile-layout-test.js
```

### Integration with Package.json

**Add to package.json scripts:**
```json
{
  "scripts": {
    "test": "node comprehensive-test.js",
    "test:features": "node tests/features/*.js",
    "test:bugs": "node tests/bugs/*.js",
    "test:regression": "node tests/regression/*.js",
    "test:new": "node tests/features/*.js && node tests/bugs/*.js"
  }
}
```

### Decision Framework

**When receiving a request, ask:**

1. **"Is this a new feature or a bug fix?"**
   - If unclear: "Could you clarify if this is new functionality (feature) or fixing existing broken functionality (bug)?"

2. **For Features:**
   - "What should this feature do?"
   - "How should it behave?"
   - "Where should it appear in the UI?"

3. **For Bugs:**
   - "What is the current behavior?"
   - "What should the correct behavior be?"
   - "When does this issue occur?"

### Examples of Classification

**Features:**
- "Add a dice roller to the character sheet"
- "Add import/export functionality for characters"
- "Add a notes section for session logs"
- "Improve the mobile layout"
- "Add character portrait upload"

**Bugs:**
- "Skill totals don't update when characteristics change"
- "Advanced skills don't save properly"
- "Edit mode button doesn't work on mobile"
- "localStorage doesn't persist on page refresh"
- "Calculation is wrong for experience totals"

### Test Permanence

**All tests created should be:**
1. **Permanent** - Added to the project permanently
2. **Documented** - Include clear comments explaining what they test
3. **Maintainable** - Use consistent patterns and naming
4. **Comprehensive** - Test both success and failure scenarios

### Continuous Integration

**For automated testing:**
```javascript
// Add to CI configuration
const testFiles = [
    'comprehensive-test.js',
    'tests/features/*.js',
    'tests/bugs/*.js',
    'tests/regression/*.js'
];

// Run all tests in sequence
for (const testFile of testFiles) {
    await runTest(testFile);
}
```

#### Manual Test Checklist
- [ ] Page loads without errors
- [ ] All form inputs accept data
- [ ] Characteristics calculate correctly
- [ ] Skills calculate totals properly
- [ ] Dynamic content (skills/talents/weapons) can be added
- [ ] Edit modes work correctly
- [ ] Data persists in localStorage
- [ ] Responsive design works on mobile
- [ ] All buttons and interactions function
- [ ] Screenshots match expected layout
- [ ] localStorage saves and loads character data
- [ ] Calculation engine updates derived stats correctly

## Known Limitations & Future Enhancements

### Current Limitations
- No import/export functionality
- No print-friendly CSS
- Limited validation on user inputs
- No undo/redo functionality

### Suggested Enhancements
- Add JSON import/export for character sharing
- Implement print stylesheet
- Add form validation
- Create character templates for quick setup
- Add dice rolling functionality
- Implement spell/talent lookup integration

## Dependencies
- **puppeteer**: Used for automated testing (dev dependency)
- **No runtime dependencies**: Pure vanilla JavaScript implementation

## Browser Compatibility
Supports all modern browsers with ES6+ support. Uses:
- localStorage API
- CSS Grid
- ES6 Classes
- Modern JavaScript features

## Contributing
When making changes:
1. Test all functionality thoroughly
2. Ensure responsive design works on mobile
3. Verify localStorage persistence
4. Update this documentation if architecture changes
5. Follow established code patterns and naming conventions