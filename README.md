# Warhammer Fantasy Roleplay Character Sheet

A web-based digital character sheet for Warhammer Fantasy Roleplay (WFRP) 4th Edition, built as a single-page application using vanilla HTML, CSS, and JavaScript.

## Features

- **Complete Character Management**: Full WFRP 4th Edition character sheet with all core statistics
- **Automatic Calculations**: Real-time calculation of derived stats, skill totals, and experience
- **Persistent Storage**: Character data automatically saved to browser localStorage
- **Edit Mode System**: Toggle-based editing for advanced skills and talents
- **Import/Export**: JSON-based character import and export functionality
- **Mobile Responsive**: Optimized for both desktop and mobile devices
- **No Dependencies**: Pure vanilla JavaScript - no frameworks required

## Quick Start

1. **Clone or download** this repository
2. **Open `index.html`** in your web browser
3. **Start creating** your WFRP character

That's it! No installation, no build process, no server required.

## Character Sheet Sections

- **Character Information**: Name, species, class, career, and career path
- **Characteristics**: All 10 primary characteristics with advances tracking
- **Skills**: Basic skills (always visible) and advanced skills (edit mode)
- **Talents**: Comprehensive talent tracking with descriptions
- **Combat**: Wounds, weapons, armor, and combat statistics
- **Equipment**: Trappings, wealth, and encumbrance tracking
- **Magic**: Spells and prayers with full descriptions
- **Roleplay**: Psychology, corruption, ambitions, and party information

## Development

### Project Structure

```
├── index.html          # Main character sheet interface
├── script.js           # Core JavaScript functionality
├── style.css           # Complete styling and responsive design
├── package.json        # Dependencies and test scripts
└── test/               # Comprehensive test suite
    ├── comprehensive-test.js
    ├── feature-import-export-test.js
    └── [various other test files]
```

### Architecture

- **Single-Page Application**: Everything contained in one HTML file
- **Vanilla JavaScript**: No external frameworks or libraries
- **CSS Grid Layout**: Modern responsive design
- **localStorage API**: Persistent character data storage
- **Event-Driven**: Real-time updates and calculations

### Testing

The project includes comprehensive Puppeteer-based automated testing:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run quick validation
npm run test:quick

# Run visual tests (opens browser)
npm run test:visual

# Run feature-specific tests
npm run test:features
```

### Available Test Commands

- `npm test` - Comprehensive end-to-end test
- `npm run test:quick` - Fast headless testing
- `npm run test:simple` - Basic page validation
- `npm run test:visual` - Visual testing with browser window
- `npm run test:import-export` - Import/export functionality tests
- `npm run test:all` - Run multiple test suites

## Browser Compatibility

- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+

Requires modern browser with ES6+ support and localStorage API.

## Usage

### Basic Character Creation

1. Fill in character information (name, species, class, career)
2. Set initial characteristic values
3. Add advances to characteristics as your character develops
4. Select basic skills and add advanced skills as needed
5. Add talents with descriptions
6. Track weapons, armor, and equipment

### Advanced Features

- **Edit Mode**: Click "Edit" buttons to modify advanced skills and talents
- **Import/Export**: Use the Import/Export buttons to save/load character data
- **Auto-Calculations**: All derived stats update automatically
- **Data Persistence**: Characters save automatically to browser storage

### Data Export/Import

Characters can be exported as JSON files and imported on any device:

1. Click "Export" to download character data
2. Click "Import" to load a previously exported character
3. Share character files between devices or with other players

## Contributing

### Development Workflow

1. **Features vs Bugs**: All work should be classified as either a feature or bug fix
2. **Test-Driven**: Write Puppeteer tests before implementing changes
3. **Documentation**: Update CLAUDE.md for architecture changes
4. **Code Style**: Follow existing patterns and naming conventions

### Test Structure

```
test/
├── features/           # New functionality tests
├── bugs/              # Bug fix validation tests
├── regression/        # Regression prevention tests
└── debug/             # Development debugging tests
```

### Creating Tests

Use the established test patterns:

```javascript
// Feature test template
const puppeteer = require('puppeteer');
const path = require('path');

async function testFeature() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    const filePath = 'file://' + path.join(__dirname, 'index.html');
    await page.goto(filePath, { waitUntil: 'networkidle0' });
    
    // Test implementation here
    
    await browser.close();
}
```

## Known Limitations

- No server-side data storage
- Limited to single character per browser session
- No collaborative editing features
- No integration with dice rolling services

## Future Enhancements

- [ ] Multiple character storage and switching
- [ ] Dice rolling integration
- [ ] Character sheet templates
- [ ] Print-friendly CSS
- [ ] Spell/talent lookup integration
- [ ] Party management features

## License

This project is open source. Use it freely for your WFRP games!

## Acknowledgments

- Built for the Warhammer Fantasy Roleplay community
- Inspired by the official WFRP 4th Edition character sheet
- Uses no external assets or copyrighted material from Games Workshop

---

**Note**: This is a fan-created tool for personal use. Warhammer Fantasy Roleplay is a trademark of Games Workshop Ltd.