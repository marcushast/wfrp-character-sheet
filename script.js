class CharacterState {
    constructor(initialData = {}) {
        this.data = initialData;
        this.listeners = new Map();
        this.computed = new Map();
        this.computedDependencies = new Map();
        this.isUpdating = false;
        this.batchedUpdates = new Set();
    }

    // Get value at a dot-notation path
    get(path) {
        return this.getNestedValue(this.data, path);
    }

    // Set value at a dot-notation path
    set(path, value) {
        if (this.isUpdating) {
            this.batchedUpdates.add(path);
            return;
        }

        const oldValue = this.get(path);
        if (oldValue === value) return;

        this.setNestedValue(this.data, path, value);
        this.notifyListeners(path, value, oldValue);
        this.updateComputed(path);
    }

    // Subscribe to changes at a specific path
    subscribe(path, callback) {
        if (!this.listeners.has(path)) {
            this.listeners.set(path, new Set());
        }
        this.listeners.get(path).add(callback);
        
        // Return unsubscribe function
        return () => {
            const callbacks = this.listeners.get(path);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(path);
                }
            }
        };
    }

    // Register computed property
    registerComputed(key, computeFn, dependencies = []) {
        this.computed.set(key, computeFn);
        this.computedDependencies.set(key, dependencies);
        
        // Subscribe to dependencies
        dependencies.forEach(dep => {
            this.subscribe(dep, () => this.updateComputedProperty(key));
        });
        
        // Calculate initial value
        this.updateComputedProperty(key);
    }

    // Get computed value
    getComputed(key) {
        if (this.computed.has(key)) {
            return this.computed.get(key).call(this);
        }
        return undefined;
    }

    // Batch multiple updates
    batch(updateFn) {
        this.isUpdating = true;
        this.batchedUpdates.clear();
        
        try {
            updateFn();
        } finally {
            this.isUpdating = false;
            
            // Process batched updates
            const updatedPaths = Array.from(this.batchedUpdates);
            updatedPaths.forEach(path => {
                this.notifyListeners(path, this.get(path));
                this.updateComputed(path);
            });
        }
    }

    // Helper methods
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    setNestedValue(obj, path, value) {
        const keys = path.split('.');
        const lastKey = keys.pop();
        const target = keys.reduce((current, key) => {
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            return current[key];
        }, obj);
        target[lastKey] = value;
    }

    notifyListeners(path, newValue, oldValue) {
        const callbacks = this.listeners.get(path);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(newValue, oldValue, path);
                } catch (error) {
                    console.error('Error in state listener:', error);
                }
            });
        }
    }

    updateComputed(changedPath) {
        // Find computed properties that depend on this path
        for (const [computedKey, dependencies] of this.computedDependencies.entries()) {
            if (dependencies.some(dep => changedPath.startsWith(dep) || dep.startsWith(changedPath))) {
                this.updateComputedProperty(computedKey);
            }
        }
    }

    updateComputedProperty(key) {
        if (this.computed.has(key)) {
            try {
                const computeFn = this.computed.get(key);
                const newValue = computeFn.call(this);
                const oldValue = this.getNestedValue(this.data, `_computed.${key}`);
                
                if (oldValue !== newValue) {
                    // Store computed value for quick access
                    this.setNestedValue(this.data, `_computed.${key}`, newValue);
                    this.notifyListeners(`_computed.${key}`, newValue, oldValue);
                    // Also notify the broader _computed path
                    this.notifyListeners('_computed', newValue, oldValue);
                }
            } catch (error) {
                console.error(`Error computing ${key}:`, error);
            }
        }
    }

    // Export state as JSON
    toJSON() {
        // Remove computed values from export
        const cleanData = JSON.parse(JSON.stringify(this.data));
        delete cleanData._computed;
        return cleanData;
    }

    // Load state from JSON
    fromJSON(jsonData) {
        this.batch(() => {
            // Clear existing data and merge in new data
            Object.keys(this.data).forEach(key => delete this.data[key]);
            Object.assign(this.data, jsonData);
            
            // Recalculate all computed properties
            for (const key of this.computed.keys()) {
                this.updateComputedProperty(key);
            }
        });
    }
}

class ComputedProperties {
    static register(state) {
        // Current characteristics (initial + advances)
        const characteristics = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];
        characteristics.forEach(char => {
            state.registerComputed(`current${char.toUpperCase()}`, function() {
                const initial = this.get(`characteristics.${char}.initial`) || 0;
                const advances = this.get(`characteristics.${char}.advances`) || 0;
                return initial + advances;
            }, [`characteristics.${char}.initial`, `characteristics.${char}.advances`]);
        });

        // Total experience
        state.registerComputed('totalExperience', function() {
            const current = this.get('experience.current') || 0;
            const spent = this.get('experience.spent') || 0;
            return current + spent;
        }, ['experience.current', 'experience.spent']);

        // Basic skills totals
        const basicSkills = [
            { name: "Art", characteristic: "dex", computedKey: "currentDEX" },
            { name: "Athletics", characteristic: "ag", computedKey: "currentAG" },
            { name: "Bribery", characteristic: "fel", computedKey: "currentFEL" },
            { name: "Charm", characteristic: "fel", computedKey: "currentFEL" },
            { name: "Charm Animal", characteristic: "wp", computedKey: "currentWP" },
            { name: "Climb", characteristic: "s", computedKey: "currentS" },
            { name: "Cool", characteristic: "wp", computedKey: "currentWP" },
            { name: "Consume Alcohol", characteristic: "t", computedKey: "currentT" },
            { name: "Dodge", characteristic: "ag", computedKey: "currentAG" },
            { name: "Drive", characteristic: "ag", computedKey: "currentAG" },
            { name: "Endurance", characteristic: "t", computedKey: "currentT" },
            { name: "Entertain", characteristic: "fel", computedKey: "currentFEL" },
            { name: "Gamble", characteristic: "int", computedKey: "currentINT" },
            { name: "Gossip", characteristic: "fel", computedKey: "currentFEL" },
            { name: "Haggle", characteristic: "fel", computedKey: "currentFEL" },
            { name: "Intimidate", characteristic: "s", computedKey: "currentS" },
            { name: "Intuition", characteristic: "i", computedKey: "currentI" },
            { name: "Leadership", characteristic: "fel", computedKey: "currentFEL" },
            { name: "Melee (Basic)", characteristic: "ws", computedKey: "currentWS" },
            { name: "Melee", characteristic: "ws", computedKey: "currentWS" },
            { name: "Navigation", characteristic: "i", computedKey: "currentI" },
            { name: "Outdoor Survival", characteristic: "int", computedKey: "currentINT" },
            { name: "Perception", characteristic: "i", computedKey: "currentI" },
            { name: "Ride", characteristic: "ag", computedKey: "currentAG" },
            { name: "Row", characteristic: "s", computedKey: "currentS" },
            { name: "Stealth", characteristic: "ag", computedKey: "currentAG" }
        ];

        basicSkills.forEach(skill => {
            const skillKey = skill.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
            state.registerComputed(`skillTotal.${skillKey}`, function() {
                const charValue = this.get(`_computed.${skill.computedKey}`) || 0;
                const advances = this.get(`skills.${skill.name}`) || 0;
                return charValue + advances;
            }, [`_computed.${skill.computedKey}`, `skills.${skill.name}`]);
        });

        // Advanced skills totals (dynamic based on array)
        state.registerComputed('advancedSkillTotals', function() {
            const advancedSkills = this.get('advancedSkills') || [];
            return advancedSkills.map((skill, index) => {
                // Map characteristic abbreviations to computed keys
                const getCharacteristicComputedKey = (char) => {
                    if (!char) return 'currentWS'; // Default fallback
                    const upperChar = char.toUpperCase();
                    // Handle special cases for characteristic mappings
                    if (upperChar === 'I') return 'currentI';
                    if (upperChar === 'AG') return 'currentAG';
                    if (upperChar === 'DEX') return 'currentDEX';
                    if (upperChar === 'INT') return 'currentINT';
                    if (upperChar === 'WP') return 'currentWP';
                    if (upperChar === 'FEL') return 'currentFEL';
                    // Standard cases
                    return `current${upperChar}`;
                };
                
                const computedKey = getCharacteristicComputedKey(skill.characteristic);
                const charValue = this.get(`_computed.${computedKey}`) || 0;
                const advances = skill.advances || 0;
                return {
                    index,
                    total: charValue + advances,
                    name: skill.name,
                    characteristic: skill.characteristic,
                    advances
                };
            });
        }, ['advancedSkills', '_computed.currentWS', '_computed.currentBS', '_computed.currentS', '_computed.currentT', '_computed.currentI', '_computed.currentAG', '_computed.currentDEX', '_computed.currentINT', '_computed.currentWP', '_computed.currentFEL']);

        // Total encumbrance
        state.registerComputed('totalEncumbrance', function() {
            const weapons = this.get('encumbrance.weapons') || 0;
            const armour = this.get('encumbrance.armour') || 0;
            const trappings = this.get('encumbrance.trappings') || 0;
            return weapons + armour + trappings;
        }, ['encumbrance.weapons', 'encumbrance.armour', 'encumbrance.trappings']);

        // Auto-calculated encumbrance from items (optional future enhancement)
        state.registerComputed('calculatedWeaponsEncumbrance', function() {
            const weapons = this.get('weapons') || [];
            return weapons.reduce((total, weapon) => total + (weapon.enc || 0), 0);
        }, ['weapons']);

        state.registerComputed('calculatedArmourEncumbrance', function() {
            const armour = this.get('armour') || [];
            return armour.reduce((total, piece) => total + (piece.enc || 0), 0);
        }, ['armour']);

        state.registerComputed('calculatedTrappingsEncumbrance', function() {
            const trappings = this.get('trappings') || [];
            return trappings.reduce((total, trapping) => total + (trapping.enc || 0), 0);
        }, ['trappings']);
    }
}

class DOMSync {
    constructor(state) {
        this.state = state;
        this.subscriptions = [];
    }

    // Sync state to DOM elements
    syncToDOM() {
        // Basic character info
        const basicFields = ['name', 'species', 'class', 'career', 'career-level', 'career-path', 'status', 'age', 'height', 'hair', 'eyes'];
        basicFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                const stateKey = field.replace(/-/g, '');
                const value = this.state.get(stateKey) || '';
                if (element.value !== value) {
                    element.value = value;
                }
            }
        });

        // Characteristics
        const characteristics = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];
        characteristics.forEach(char => {
            const initialElement = document.getElementById(`${char}-initial`);
            const advancesElement = document.getElementById(`${char}-advances`);
            const currentElement = document.getElementById(`${char}-current`);
            
            if (initialElement) {
                const value = this.state.get(`characteristics.${char}.initial`) || 0;
                if (initialElement.value !== String(value)) {
                    initialElement.value = value;
                }
            }
            
            if (advancesElement) {
                const value = this.state.get(`characteristics.${char}.advances`) || 0;
                if (advancesElement.value !== String(value)) {
                    advancesElement.value = value;
                }
            }
            
            if (currentElement) {
                const value = this.state.get(`_computed.current${char.toUpperCase()}`) || 0;
                if (currentElement.value !== String(value)) {
                    currentElement.value = value;
                }
            }
            
            // Also sync mobile characteristics
            const mobileInitialElement = document.getElementById(`${char}-initial-mobile`);
            const mobileAdvancesElement = document.getElementById(`${char}-advances-mobile`);
            const mobileCurrentElement = document.getElementById(`${char}-current-mobile`);
            
            if (mobileInitialElement) {
                const value = this.state.get(`characteristics.${char}.initial`) || 0;
                if (mobileInitialElement.value !== String(value)) {
                    mobileInitialElement.value = value;
                }
            }
            
            if (mobileAdvancesElement) {
                const value = this.state.get(`characteristics.${char}.advances`) || 0;
                if (mobileAdvancesElement.value !== String(value)) {
                    mobileAdvancesElement.value = value;
                }
            }
            
            if (mobileCurrentElement) {
                const value = this.state.get(`_computed.current${char.toUpperCase()}`) || 0;
                if (mobileCurrentElement.value !== String(value)) {
                    mobileCurrentElement.value = value;
                }
            }
        });

        // Secondary stats
        const secondaryStats = [
            { id: 'fate', path: 'fate' },
            { id: 'fortune', path: 'fortune' },
            { id: 'resilience', path: 'resilience' },
            { id: 'resolve', path: 'resolve' },
            { id: 'motivation', path: 'motivation' },
            { id: 'current-exp', path: 'experience.current' },
            { id: 'spent-exp', path: 'experience.spent' },
            { id: 'total-exp', path: '_computed.totalExperience' },
            { id: 'movement', path: 'movement' },
            { id: 'walk', path: 'walk' },
            { id: 'run', path: 'run' }
        ];

        secondaryStats.forEach(stat => {
            const element = document.getElementById(stat.id);
            if (element) {
                const value = this.state.get(stat.path) || '';
                if (element.value !== String(value)) {
                    element.value = value;
                }
            }
        });

        // Basic skills
        this.syncBasicSkills();

        // Other sections
        this.syncOtherSections();
        
        // Encumbrance
        const encElement = document.getElementById('enc-total');
        if (encElement) {
            const value = this.state.get('_computed.totalEncumbrance') || 0;
            if (encElement.value !== String(value)) {
                encElement.value = value;
            }
        }
    }

    syncBasicSkills() {
        const basicSkills = [
            { name: "Art", characteristic: "dex" },
            { name: "Athletics", characteristic: "ag" },
            { name: "Bribery", characteristic: "fel" },
            { name: "Charm", characteristic: "fel" },
            { name: "Charm Animal", characteristic: "wp" },
            { name: "Climb", characteristic: "s" },
            { name: "Cool", characteristic: "wp" },
            { name: "Consume Alcohol", characteristic: "t" },
            { name: "Dodge", characteristic: "ag" },
            { name: "Drive", characteristic: "ag" },
            { name: "Endurance", characteristic: "t" },
            { name: "Entertain", characteristic: "fel" },
            { name: "Gamble", characteristic: "int" },
            { name: "Gossip", characteristic: "fel" },
            { name: "Haggle", characteristic: "fel" },
            { name: "Intimidate", characteristic: "s" },
            { name: "Intuition", characteristic: "i" },
            { name: "Leadership", characteristic: "fel" },
            { name: "Melee (Basic)", characteristic: "ws" },
            { name: "Melee", characteristic: "ws" },
            { name: "Navigation", characteristic: "i" },
            { name: "Outdoor Survival", characteristic: "int" },
            { name: "Perception", characteristic: "i" },
            { name: "Ride", characteristic: "ag" },
            { name: "Row", characteristic: "s" },
            { name: "Stealth", characteristic: "ag" }
        ];

        basicSkills.forEach(skill => {
            const skillKey = skill.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
            const advancesElement = document.getElementById(`skill-${skillKey}`);
            const totalElement = document.getElementById(`skill-total-${skillKey}`);
            
            if (advancesElement) {
                const value = this.state.get(`skills.${skill.name}`) || 0;
                if (advancesElement.value !== String(value)) {
                    advancesElement.value = value;
                }
            }
            
            if (totalElement) {
                const value = this.state.get(`_computed.skillTotal.${skillKey}`) || 0;
                if (totalElement.value !== String(value)) {
                    totalElement.value = value;
                }
            }
        });
    }

    syncOtherSections() {
        // Ambitions
        const shortAmbition = document.getElementById('short-ambition');
        const longAmbition = document.getElementById('long-ambition');
        if (shortAmbition) {
            const value = this.state.get('ambitions.short') || '';
            if (shortAmbition.value !== value) {
                shortAmbition.value = value;
            }
        }
        if (longAmbition) {
            const value = this.state.get('ambitions.long') || '';
            if (longAmbition.value !== value) {
                longAmbition.value = value;
            }
        }

        // Party
        const partyFields = ['party-name', 'party-short', 'party-long', 'party-members'];
        partyFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                const key = field.replace('party-', '');
                const value = this.state.get(`party.${key}`) || '';
                if (element.value !== value) {
                    element.value = value;
                }
            }
        });

        // Psychology and Corruption
        const psychology = document.getElementById('psychology');
        const corruption = document.getElementById('corruption');
        if (psychology) {
            const value = this.state.get('psychology') || '';
            if (psychology.value !== value) {
                psychology.value = value;
            }
        }
        if (corruption) {
            const value = this.state.get('corruption') || '';
            if (corruption.value !== value) {
                corruption.value = value;
            }
        }

        // Wounds
        const woundFields = ['sb', 'tb-plus-2', 'wpb', 'hardy', 'wounds'];
        woundFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                const key = field === 'tb-plus-2' ? 'tbPlus2' : field;
                const value = this.state.get(`wounds.${key}`) || 0;
                if (element.value !== String(value)) {
                    element.value = value;
                }
            }
        });

        // Wealth
        const wealthFields = ['wealth-d', 'wealth-ss', 'wealth-gc'];
        wealthFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                const key = field.replace('wealth-', '');
                const value = this.state.get(`wealth.${key}`) || 0;
                if (element.value !== String(value)) {
                    element.value = value;
                }
            }
        });

        // Encumbrance
        const encFields = ['enc-weapons', 'enc-armour', 'enc-trappings', 'enc-max'];
        encFields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                const key = field.replace('enc-', '');
                const value = this.state.get(`encumbrance.${key}`) || 0;
                if (element.value !== String(value)) {
                    element.value = value;
                }
            }
        });
    }

    // Setup subscriptions to keep DOM in sync with state
    setupSubscriptions() {
        // Subscribe to computed values specifically
        const computedSubscription = this.state.subscribe('_computed', () => {
            this.syncComputedToDOM();
        });
        
        this.subscriptions.push(computedSubscription);
        
        // Initial sync
        this.syncToDOM();
    }
    
    syncComputedToDOM() {
        // Sync computed characteristics
        const characteristics = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];
        characteristics.forEach(char => {
            const currentElement = document.getElementById(`${char}-current`);
            if (currentElement) {
                const value = this.state.get(`_computed.current${char.toUpperCase()}`) || 0;
                if (currentElement.value !== String(value)) {
                    currentElement.value = value;
                }
            }
        });
        
        // Sync computed totals
        const totalExpElement = document.getElementById('total-exp');
        if (totalExpElement) {
            const value = this.state.get('_computed.totalExperience') || 0;
            if (totalExpElement.value !== String(value)) {
                totalExpElement.value = value;
            }
        }
        
        const totalEncElement = document.getElementById('enc-total');
        if (totalEncElement) {
            const value = this.state.get('_computed.totalEncumbrance') || 0;
            if (totalEncElement.value !== String(value)) {
                totalEncElement.value = value;
            }
        }
        
        // Sync basic skill totals
        this.syncBasicSkillTotals();
        
        // Sync advanced skill totals
        this.syncAdvancedSkillTotals();
    }
    
    syncBasicSkillTotals() {
        const basicSkills = [
            { name: "Art", characteristic: "dex" },
            { name: "Athletics", characteristic: "ag" },
            { name: "Bribery", characteristic: "fel" },
            { name: "Charm", characteristic: "fel" },
            { name: "Charm Animal", characteristic: "wp" },
            { name: "Climb", characteristic: "s" },
            { name: "Cool", characteristic: "wp" },
            { name: "Consume Alcohol", characteristic: "t" },
            { name: "Dodge", characteristic: "ag" },
            { name: "Drive", characteristic: "ag" },
            { name: "Endurance", characteristic: "t" },
            { name: "Entertain", characteristic: "fel" },
            { name: "Gamble", characteristic: "int" },
            { name: "Gossip", characteristic: "fel" },
            { name: "Haggle", characteristic: "fel" },
            { name: "Intimidate", characteristic: "s" },
            { name: "Intuition", characteristic: "i" },
            { name: "Leadership", characteristic: "fel" },
            { name: "Melee (Basic)", characteristic: "ws" },
            { name: "Melee", characteristic: "ws" },
            { name: "Navigation", characteristic: "i" },
            { name: "Outdoor Survival", characteristic: "int" },
            { name: "Perception", characteristic: "i" },
            { name: "Ride", characteristic: "ag" },
            { name: "Row", characteristic: "s" },
            { name: "Stealth", characteristic: "ag" }
        ];

        basicSkills.forEach(skill => {
            const skillKey = skill.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
            const totalElement = document.getElementById(`skill-total-${skillKey}`);
            
            if (totalElement) {
                const value = this.state.get(`_computed.skillTotal.${skillKey}`) || 0;
                if (totalElement.value !== String(value)) {
                    totalElement.value = value;
                }
            }
        });
    }
    
    syncAdvancedSkillTotals() {
        const advancedSkillTotals = this.state.get('_computed.advancedSkillTotals') || [];
        const advancedSkillRows = document.querySelectorAll('#advanced-skills .skill-row');
        
        advancedSkillRows.forEach((row, index) => {
            const totalInput = row.querySelector('.skill-total input');
            if (totalInput && advancedSkillTotals[index]) {
                const computedTotal = advancedSkillTotals[index].total;
                if (totalInput.value !== String(computedTotal)) {
                    totalInput.value = computedTotal;
                }
            }
        });
    }

    // Update state from DOM element
    updateFromDOM(element) {
        const id = element.id;
        const value = element.type === 'number' ? (parseInt(element.value) || 0) : element.value;
        
        // Map DOM elements to state paths
        const mappings = {
            // Basic info
            'name': 'name',
            'species': 'species',
            'class': 'class',
            'career': 'career',
            'career-level': 'careerLevel',
            'career-path': 'careerPath',
            'status': 'status',
            'age': 'age',
            'height': 'height',
            'hair': 'hair',
            'eyes': 'eyes',
            
            // Secondary stats
            'fate': 'fate',
            'fortune': 'fortune',
            'resilience': 'resilience',
            'resolve': 'resolve',
            'motivation': 'motivation',
            'current-exp': 'experience.current',
            'spent-exp': 'experience.spent',
            'movement': 'movement',
            'walk': 'walk',
            'run': 'run',
            
            // Ambitions
            'short-ambition': 'ambitions.short',
            'long-ambition': 'ambitions.long',
            
            // Party
            'party-name': 'party.name',
            'party-short': 'party.short',
            'party-long': 'party.long',
            'party-members': 'party.members',
            
            // Other
            'psychology': 'psychology',
            'corruption': 'corruption',
            
            // Wounds
            'sb': 'wounds.sb',
            'tb-plus-2': 'wounds.tbPlus2',
            'wpb': 'wounds.wpb',
            'hardy': 'wounds.hardy',
            'wounds': 'wounds.wounds',
            
            // Wealth
            'wealth-d': 'wealth.d',
            'wealth-ss': 'wealth.ss',
            'wealth-gc': 'wealth.gc',
            
            // Encumbrance
            'enc-weapons': 'encumbrance.weapons',
            'enc-armour': 'encumbrance.armour',
            'enc-trappings': 'encumbrance.trappings',
            'enc-max': 'encumbrance.max'
        };

        // Handle characteristics (both desktop and mobile)
        if (id.includes('-initial') || id.includes('-advances')) {
            let char, type;
            if (id.includes('-mobile')) {
                // Mobile input: ws-initial-mobile -> ws, initial
                const parts = id.replace('-mobile', '').split('-');
                char = parts[0];
                type = parts[1];
            } else {
                // Desktop input: ws-initial -> ws, initial
                const parts = id.split('-');
                char = parts[0];
                type = parts[1];
            }
            
            this.state.set(`characteristics.${char}.${type}`, value);
            
            // Sync between desktop and mobile inputs
            this.syncCharacteristicInputs(char, type, value);
            return;
        }

        // Handle basic skills
        if (id.startsWith('skill-') && !id.includes('total')) {
            const skillName = id.replace('skill-', '').replace(/-/g, ' ');
            // Find the actual skill name from the basic skills list
            const basicSkills = [
                "Art", "Athletics", "Bribery", "Charm", "Charm Animal", "Climb", "Cool",
                "Consume Alcohol", "Dodge", "Drive", "Endurance", "Entertain", "Gamble",
                "Gossip", "Haggle", "Intimidate", "Intuition", "Leadership", 
                "Melee (Basic)", "Melee", "Navigation", "Outdoor Survival", 
                "Perception", "Ride", "Row", "Stealth"
            ];
            const actualSkillName = basicSkills.find(skill => 
                skill.toLowerCase().replace(/\s+/g, ' ') === skillName ||
                skill.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '') === skillName.replace(/\s+/g, '-')
            );
            if (actualSkillName) {
                this.state.set(`skills.${actualSkillName}`, value);
            }
            return;
        }

        // Use mapping for other fields
        const statePath = mappings[id];
        if (statePath) {
            this.state.set(statePath, value);
        }
    }
    
    // Sync between desktop and mobile characteristic inputs
    syncCharacteristicInputs(char, type, value) {
        // Update desktop input if mobile was changed
        const desktopInputId = `${char}-${type}`;
        const desktopInput = document.getElementById(desktopInputId);
        if (desktopInput && desktopInput.value !== String(value)) {
            desktopInput.value = value;
        }
        
        // Update mobile input if desktop was changed
        const mobileInputId = `${char}-${type}-mobile`;
        const mobileInput = document.getElementById(mobileInputId);
        if (mobileInput && mobileInput.value !== String(value)) {
            mobileInput.value = value;
        }
        
        // Also update the computed current value for both desktop and mobile
        const desktopCurrentId = `${char}-current`;
        const mobileCurrentId = `${char}-current-mobile`;
        const computedKey = `current${char.toUpperCase()}`;
        const currentValue = this.state.get(`_computed.${computedKey}`) || 0;
        
        const desktopCurrentInput = document.getElementById(desktopCurrentId);
        if (desktopCurrentInput && desktopCurrentInput.value !== String(currentValue)) {
            desktopCurrentInput.value = currentValue;
        }
        
        const mobileCurrentInput = document.getElementById(mobileCurrentId);
        if (mobileCurrentInput && mobileCurrentInput.value !== String(currentValue)) {
            mobileCurrentInput.value = currentValue;
        }
    }

    destroy() {
        // Clean up subscriptions
        this.subscriptions.forEach(unsubscribe => unsubscribe());
        this.subscriptions = [];
        
        if (this.updateTimeout) {
            clearTimeout(this.updateTimeout);
        }
    }
}

class WFRPCharacterSheet {
    constructor() {
        // Initialize state management
        const characterData = this.loadCharacter();
        this.state = new CharacterState(characterData);
        
        // Register computed properties
        ComputedProperties.register(this.state);
        
        // Initialize DOM sync
        this.domSync = new DOMSync(this.state);
        
        // Keep backward compatibility
        this.character = this.state.data;
        this.advancedSkillsEditMode = false;
        this.talentsEditMode = false;
        this.weaponsEditMode = false;
        this.armourEditMode = false;
        this.trappingsEditMode = false;
        this.spellsEditMode = false;
        this.basicSkills = [
            { name: "Art", characteristic: "Dex" },
            { name: "Athletics", characteristic: "Ag" },
            { name: "Bribery", characteristic: "Fel" },
            { name: "Charm", characteristic: "Fel" },
            { name: "Charm Animal", characteristic: "WP" },
            { name: "Climb", characteristic: "S" },
            { name: "Cool", characteristic: "WP" },
            { name: "Consume Alcohol", characteristic: "T" },
            { name: "Dodge", characteristic: "Ag" },
            { name: "Drive", characteristic: "Ag" },
            { name: "Endurance", characteristic: "T" },
            { name: "Entertain", characteristic: "Fel" },
            { name: "Gamble", characteristic: "Int" },
            { name: "Gossip", characteristic: "Fel" },
            { name: "Haggle", characteristic: "Fel" },
            { name: "Intimidate", characteristic: "S" },
            { name: "Intuition", characteristic: "I" },
            { name: "Leadership", characteristic: "Fel" },
            { name: "Melee (Basic)", characteristic: "WS" },
            { name: "Melee", characteristic: "WS" },
            { name: "Navigation", characteristic: "I" },
            { name: "Outdoor Survival", characteristic: "Int" },
            { name: "Perception", characteristic: "I" },
            { name: "Ride", characteristic: "Ag" },
            { name: "Row", characteristic: "S" },
            { name: "Stealth", characteristic: "Ag" }
        ];
        
        // Setup state persistence
        this.setupStatePersistence();
        
        this.initializeSheet();
        this.setupEventListeners();
    }

    setupStatePersistence() {
        // Auto-save to localStorage when state changes
        this.state.subscribe('', () => {
            if (this.saveTimeout) {
                clearTimeout(this.saveTimeout);
            }
            this.saveTimeout = setTimeout(() => {
                localStorage.setItem('wfrp-character', JSON.stringify(this.state.toJSON()));
            }, 500); // Debounce saves
        });
    }

    loadCharacter() {
        const defaultCharacter = {
            name: '',
            species: '',
            class: '',
            careerPath: '',
            career: '',
            careerLevel: '',
            status: '',
            age: '',
            height: '',
            hair: '',
            eyes: '',
            characteristics: {
                ws: { initial: 0, advances: 0 },
                bs: { initial: 0, advances: 0 },
                s: { initial: 0, advances: 0 },
                t: { initial: 0, advances: 0 },
                i: { initial: 0, advances: 0 },
                ag: { initial: 0, advances: 0 },
                dex: { initial: 0, advances: 0 },
                int: { initial: 0, advances: 0 },
                wp: { initial: 0, advances: 0 },
                fel: { initial: 0, advances: 0 }
            },
            fate: 0,
            fortune: 0,
            resilience: 0,
            resolve: 0,
            motivation: '',
            experience: { current: 0, spent: 0 },
            movement: 0,
            walk: 0,
            run: 0,
            skills: {},
            advancedSkills: [],
            talents: [],
            ambitions: { short: '', long: '' },
            party: { name: '', short: '', long: '', members: '' },
            wounds: { sb: 0, tbPlus2: 0, wpb: 0, hardy: 0, wounds: 0 },
            weapons: [],
            armour: [],
            trappings: [],
            spells: [],
            psychology: '',
            corruption: '',
            wealth: { d: 0, ss: 0, gc: 0 },
            encumbrance: { weapons: 0, armour: 0, trappings: 0, max: 0, total: 0 }
        };

        const saved = localStorage.getItem('wfrp-character');
        if (!saved) {
            return defaultCharacter;
        }

        try {
            const savedCharacter = JSON.parse(saved);
            
            // Merge saved data with default structure to ensure all fields exist
            return this.mergeCharacterData(defaultCharacter, savedCharacter);
        } catch (error) {
            console.warn('Failed to parse saved character data, using default:', error);
            return defaultCharacter;
        }
    }

    mergeCharacterData(defaultData, savedData) {
        const merged = { ...defaultData };
        
        // Merge top-level properties
        Object.keys(savedData).forEach(key => {
            if (savedData[key] !== null && savedData[key] !== undefined) {
                if (typeof savedData[key] === 'object' && !Array.isArray(savedData[key])) {
                    // For objects, recursively merge
                    merged[key] = { ...defaultData[key], ...savedData[key] };
                } else {
                    // For primitives and arrays, use saved value
                    merged[key] = savedData[key];
                }
            }
        });
        
        return merged;
    }

    saveCharacter() {
        // This method is now handled automatically by state management
        // Kept for backward compatibility
        localStorage.setItem('wfrp-character', JSON.stringify(this.state.toJSON()));
    }

    initializeSheet() {
        // Setup DOM synchronization
        this.domSync.setupSubscriptions();
        
        // Populate DOM elements first
        this.populateBasicSkills();
        this.populateAdvancedSkills();
        this.populateTalents();
        this.populateWeapons();
        this.populateArmour();
        this.populateTrappings();
        this.populateSpells();
        
        // Then sync state to DOM (after elements exist)
        this.domSync.syncToDOM();
    }


    populateBasicSkills() {
        const container = document.getElementById('basic-skills');
        container.innerHTML = '';
        
        this.basicSkills.forEach(skill => {
            const row = document.createElement('div');
            row.className = 'skill-row';
            
            const skillKey = skill.name.toLowerCase().replace(/\s+/g, '-').replace(/[()]/g, '');
            row.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-char">${skill.characteristic}</div>
                <div class="skill-adv">
                    <input type="number" id="skill-${skillKey}" 
                           name="skill-${skillKey}" 
                           value="${this.character.skills[skill.name] || 0}">
                </div>
                <div class="skill-total">
                    <input type="number" readonly id="skill-total-${skillKey}">
                </div>
            `;
            
            container.appendChild(row);
        });
    }

    populateAdvancedSkills() {
        if (!this.character.advancedSkills) {
            this.character.advancedSkills = [];
        }
        this.setAdvancedSkillsMode(false);
    }

    toggleAdvancedSkillsEditMode() {
        if (this.advancedSkillsEditMode) {
            // Save when exiting edit mode
            this.saveAdvancedSkills();
        }
        this.setAdvancedSkillsMode(!this.advancedSkillsEditMode);
    }

    setAdvancedSkillsMode(editMode) {
        this.advancedSkillsEditMode = editMode;
        const skillsSection = document.getElementById('advanced-skills').closest('.skills');
        const editButton = document.getElementById('edit-advanced-skills');
        
        if (editMode) {
            skillsSection.classList.remove('advanced-skills-readonly');
            skillsSection.classList.add('advanced-skills-edit');
            editButton.textContent = 'Save';
        } else {
            skillsSection.classList.add('advanced-skills-readonly');
            skillsSection.classList.remove('advanced-skills-edit');
            editButton.textContent = 'Edit';
        }
        
        // Re-populate skills with the new mode - single redraw
        this.populateAdvancedSkillsInMode(editMode);
        
        // Sync computed totals to DOM after repopulating
        this.domSync.syncAdvancedSkillTotals();
    }

    populateAdvancedSkillsInMode(editMode) {
        const container = document.getElementById('advanced-skills');
        
        if (!this.character.advancedSkills) {
            this.character.advancedSkills = [];
        }
        
        // Save current form data before re-rendering
        this.saveAdvancedSkillsFromDOM();
        
        // Clear and re-render
        container.innerHTML = '';
        this.character.advancedSkills.forEach(skill => {
            const skillRow = document.createElement('div');
            skillRow.className = 'skill-row';
            
            if (editMode) {
                this.createAdvancedSkillRowEditMode(skillRow, skill);
            } else {
                skillRow.innerHTML = `
                    <div class="skill-name">${skill.name}</div>
                    <div class="skill-char">${skill.characteristic}</div>
                    <div class="skill-adv">
                        <input type="number" placeholder="0" value="${skill.advances || ''}">
                    </div>
                    <div class="skill-total">
                        <input type="number" readonly value="0">
                    </div>
                `;
            }

            container.appendChild(skillRow);
            this.addAdvancedSkillEventListeners(skillRow);
        });
    }

    createAdvancedSkillRowEditMode(skillRow, skill) {
        const characteristicOptions = `
            <option value="WS" ${skill.characteristic === 'WS' ? 'selected' : ''}>WS</option>
            <option value="BS" ${skill.characteristic === 'BS' ? 'selected' : ''}>BS</option>
            <option value="S" ${skill.characteristic === 'S' ? 'selected' : ''}>S</option>
            <option value="T" ${skill.characteristic === 'T' ? 'selected' : ''}>T</option>
            <option value="I" ${skill.characteristic === 'I' ? 'selected' : ''}>I</option>
            <option value="Ag" ${skill.characteristic === 'Ag' ? 'selected' : ''}>Ag</option>
            <option value="Dex" ${skill.characteristic === 'Dex' ? 'selected' : ''}>Dex</option>
            <option value="Int" ${skill.characteristic === 'Int' ? 'selected' : ''}>Int</option>
            <option value="WP" ${skill.characteristic === 'WP' ? 'selected' : ''}>WP</option>
            <option value="Fel" ${skill.characteristic === 'Fel' ? 'selected' : ''}>Fel</option>
        `;
        skillRow.innerHTML = `
            <input type="text" placeholder="Skill name" class="skill-name" value="${skill.name || ''}">
            <select class="skill-char">${characteristicOptions}</select>
            <div class="skill-adv">
                <input type="number" placeholder="0" value="${skill.advances || ''}">
            </div>
            <div class="skill-total">
                <input type="number" readonly value="0">
            </div>
            <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
        `;
    }

    populateTalents() {
        const container = document.getElementById('talents-list');
        container.innerHTML = '';
        
        if (this.character.talents && this.character.talents.length > 0) {
            this.character.talents.forEach(talent => {
                const talentRow = document.createElement('div');
                talentRow.className = 'talent-row';
                this.createTalentRow(talentRow, talent, false); // false = read-only mode
                container.appendChild(talentRow);
                
                // Add event listeners
                this.addTalentEventListeners(talentRow);
            });
        }
        
        // Set initial mode to read-only
        this.setTalentsMode(false);
    }

    createTalentRow(talentRow, talent, editMode) {
        if (editMode) {
            this.createTalentRowEditMode(talentRow, talent);
        } else {
            talentRow.innerHTML = `
                <div class="talent-name">${talent.name}</div>
                <div class="talent-times">${talent.times || 0}</div>
                <div class="talent-description">${talent.description || ''}</div>
            `;
        }
    }

    createTalentRowEditMode(talentRow, talent) {
        talentRow.innerHTML = `
            <input type="text" placeholder="Talent name" class="talent-name" value="${talent.name || ''}">
            <input type="number" placeholder="0" class="talent-times" value="${talent.times || 0}">
            <textarea placeholder="Description" class="talent-description">${talent.description || ''}</textarea>
            <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
        `;
    }

    setTalentsMode(editMode) {
        this.talentsEditMode = editMode;
        const talentsSection = document.getElementById('talents-list').closest('.talents');
        const editButton = document.getElementById('edit-talents');
        
        if (editMode) {
            talentsSection.classList.remove('talents-readonly');
            talentsSection.classList.add('talents-edit');
            editButton.textContent = 'Save';
        } else {
            talentsSection.classList.add('talents-readonly');
            talentsSection.classList.remove('talents-edit');
            editButton.textContent = 'Edit';
        }
        
        // Re-populate talents with the new mode - single redraw
        this.populateTalentsInMode(editMode);
    }

    populateTalentsInMode(editMode) {
        const container = document.getElementById('talents-list');
        
        if (!this.character.talents) {
            this.character.talents = [];
        }
        
        // Clear and rebuild
        container.innerHTML = '';
        
        this.character.talents.forEach(talent => {
            const talentRow = document.createElement('div');
            talentRow.className = 'talent-row';
            
            if (editMode) {
                this.createTalentRowEditMode(talentRow, talent);
            } else {
                talentRow.innerHTML = `
                    <div class="talent-name">${talent.name}</div>
                    <input type="number" class="talent-times" readonly value="${talent.times || 0}">
                    <div class="talent-description">${talent.description || ''}</div>
                `;
            }

            container.appendChild(talentRow);
            this.addTalentEventListeners(talentRow);
        });
    }

    toggleTalentsEditMode() {
        if (this.talentsEditMode) {
            // Save when exiting edit mode
            this.saveTalents();
        }
        this.setTalentsMode(!this.talentsEditMode);
    }

    populateWeapons() {
        const container = document.getElementById('weapons-list');
        container.innerHTML = '';
        
        if (this.character.weapons && this.character.weapons.length > 0) {
            this.character.weapons.forEach(weapon => {
                const weaponRow = document.createElement('div');
                weaponRow.className = 'weapon-row';
                this.createWeaponRow(weaponRow, weapon, false); // false = read-only mode
                container.appendChild(weaponRow);
                
                // Add event listeners
                this.addWeaponEventListeners(weaponRow);
            });
        }
        
        // Set initial mode to read-only
        this.setWeaponsMode(false);
    }

    createWeaponRow(weaponRow, weapon, editMode) {
        if (editMode) {
            weaponRow.innerHTML = `
                <input type="text" placeholder="Weapon name" class="weapon-name" value="${weapon.name || ''}">
                <input type="text" placeholder="Group" class="weapon-group" value="${weapon.group || ''}">
                <input type="text" placeholder="0" class="weapon-enc" value="${weapon.enc || ''}">
                <input type="text" placeholder="Range/Reach" class="weapon-range" value="${weapon.range || ''}">
                <input type="text" placeholder="Damage" class="weapon-damage" value="${weapon.damage || ''}">
                <input type="text" placeholder="Qualities" class="weapon-qualities" value="${weapon.qualities || ''}">
                <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
            `;
        } else {
            weaponRow.innerHTML = `
                <div class="weapon-name">${weapon.name || ''}</div>
                <div class="weapon-group">${weapon.group || ''}</div>
                <div class="weapon-enc">${weapon.enc || ''}</div>
                <div class="weapon-range">${weapon.range || ''}</div>
                <div class="weapon-damage">${weapon.damage || ''}</div>
                <div class="weapon-qualities">${weapon.qualities || ''}</div>
                <span class="remove-button"></span>
            `;
        }
    }

    setWeaponsMode(editMode) {
        this.weaponsEditMode = editMode;
        const weaponsSection = document.getElementById('weapons-list').closest('.weapons');
        const editButton = document.getElementById('edit-weapons');
        
        if (editMode) {
            weaponsSection.classList.remove('weapons-readonly');
            weaponsSection.classList.add('weapons-edit');
            editButton.textContent = 'Save';
        } else {
            weaponsSection.classList.add('weapons-readonly');
            weaponsSection.classList.remove('weapons-edit');
            editButton.textContent = 'Edit';
        }
        
        // Re-populate weapons with the new mode
        this.repopulateWeapons();
    }

    repopulateWeapons() {
        const container = document.getElementById('weapons-list');
        const weaponRows = container.querySelectorAll('.weapon-row');
        
        // Ensure the array exists
        if (!this.character.weapons) {
            this.character.weapons = [];
        }
        
        weaponRows.forEach((weaponRow, index) => {
            // Get current values before repopulating
            const nameElement = weaponRow.querySelector('.weapon-name');
            const groupElement = weaponRow.querySelector('.weapon-group');
            const encElement = weaponRow.querySelector('.weapon-enc');
            const rangeElement = weaponRow.querySelector('.weapon-range');
            const damageElement = weaponRow.querySelector('.weapon-damage');
            const qualitiesElement = weaponRow.querySelector('.weapon-qualities');
            
            let weapon = this.character.weapons[index] || { name: '', group: '', enc: '', range: '', damage: '', qualities: '' };
            
            // Update weapon data from current elements (only if they're inputs)
            if (nameElement && nameElement.tagName === 'INPUT') {
                weapon.name = nameElement.value || '';
                weapon.group = groupElement.value || '';
                weapon.enc = encElement.value || '';
                weapon.range = rangeElement.value || '';
                weapon.damage = damageElement.value || '';
                weapon.qualities = qualitiesElement.value || '';
                
                // Update the array
                this.character.weapons[index] = weapon;
            }
            
            this.createWeaponRow(weaponRow, weapon, this.weaponsEditMode);
            this.addWeaponEventListeners(weaponRow);
        });
    }

    addWeaponEventListeners(weaponRow) {
        const inputs = weaponRow.querySelectorAll('input');
        
        inputs.forEach(input => {
            if (!input.readOnly) {
                input.addEventListener('input', () => {
                    // Auto-save is handled by the edit mode toggle
                });
            }
        });
    }

    saveWeapons() {
        const weaponRows = document.querySelectorAll('#weapons-list .weapon-row');
        this.character.weapons = [];
        
        weaponRows.forEach(row => {
            const nameElement = row.querySelector('.weapon-name');
            const groupElement = row.querySelector('.weapon-group');
            const encElement = row.querySelector('.weapon-enc');
            const rangeElement = row.querySelector('.weapon-range');
            const damageElement = row.querySelector('.weapon-damage');
            const qualitiesElement = row.querySelector('.weapon-qualities');
            
            // Get values based on element type (input vs div)
            const name = nameElement.tagName === 'INPUT' ? (nameElement.value || '') : (nameElement.textContent || '');
            const group = groupElement.tagName === 'INPUT' ? (groupElement.value || '') : (groupElement.textContent || '');
            const enc = encElement.tagName === 'INPUT' ? (encElement.value || '') : (encElement.textContent || '');
            const range = rangeElement.tagName === 'INPUT' ? (rangeElement.value || '') : (rangeElement.textContent || '');
            const damage = damageElement.tagName === 'INPUT' ? (damageElement.value || '') : (damageElement.textContent || '');
            const qualities = qualitiesElement.tagName === 'INPUT' ? (qualitiesElement.value || '') : (qualitiesElement.textContent || '');
            
            // Always save the weapon, even if empty, to maintain the row
            this.character.weapons.push({
                name: name,
                group: group,
                enc: enc,
                range: range,
                damage: damage,
                qualities: qualities
            });
        });
        
        this.saveCharacter();
        console.log('Weapons saved:', this.character.weapons);
    }

    toggleWeaponsEditMode() {
        if (this.weaponsEditMode) {
            // Save when exiting edit mode
            this.saveWeapons();
        }
        this.setWeaponsMode(!this.weaponsEditMode);
    }

    populateArmour() {
        const container = document.getElementById('armour-list');
        container.innerHTML = '';
        
        if (this.character.armour && this.character.armour.length > 0) {
            this.character.armour.forEach(armour => {
                const armourRow = document.createElement('div');
                armourRow.className = 'armour-row';
                this.createArmourRow(armourRow, armour, false); // false = read-only mode
                container.appendChild(armourRow);
                
                // Add event listeners
                this.addArmourEventListeners(armourRow);
            });
        }
        
        // Set initial mode to read-only
        this.setArmourMode(false);
    }

    createArmourRow(armourRow, armour, editMode) {
        if (editMode) {
            armourRow.innerHTML = `
                <input type="text" placeholder="Armour name" class="armour-name" value="${armour.name || ''}">
                <input type="text" placeholder="Locations" class="armour-locations" value="${armour.locations || ''}">
                <input type="text" placeholder="0" class="armour-enc" value="${armour.enc || ''}">
                <input type="text" placeholder="0" class="armour-ap" value="${armour.ap || ''}">
                <input type="text" placeholder="Qualities" class="armour-qualities" value="${armour.qualities || ''}">
                <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
            `;
        } else {
            armourRow.innerHTML = `
                <div class="armour-name">${armour.name || ''}</div>
                <div class="armour-locations">${armour.locations || ''}</div>
                <div class="armour-enc">${armour.enc || ''}</div>
                <div class="armour-ap">${armour.ap || ''}</div>
                <div class="armour-qualities">${armour.qualities || ''}</div>
                <span class="remove-button"></span>
            `;
        }
    }

    setArmourMode(editMode) {
        this.armourEditMode = editMode;
        const armourSection = document.getElementById('armour-list').closest('.armour');
        const editButton = document.getElementById('edit-armour');
        
        if (editMode) {
            armourSection.classList.remove('armour-readonly');
            armourSection.classList.add('armour-edit');
            editButton.textContent = 'Save';
        } else {
            armourSection.classList.add('armour-readonly');
            armourSection.classList.remove('armour-edit');
            editButton.textContent = 'Edit';
        }
        
        // Re-populate armour with the new mode
        this.repopulateArmour();
    }

    repopulateArmour() {
        const container = document.getElementById('armour-list');
        const armourRows = container.querySelectorAll('.armour-row');
        
        // Ensure the array exists
        if (!this.character.armour) {
            this.character.armour = [];
        }
        
        armourRows.forEach((armourRow, index) => {
            // Get current values before repopulating
            const nameElement = armourRow.querySelector('.armour-name');
            const locationsElement = armourRow.querySelector('.armour-locations');
            const encElement = armourRow.querySelector('.armour-enc');
            const apElement = armourRow.querySelector('.armour-ap');
            const qualitiesElement = armourRow.querySelector('.armour-qualities');
            
            let armour = this.character.armour[index] || { name: '', locations: '', enc: '', ap: '', qualities: '' };
            
            // Update armour data from current elements (only if they're inputs)
            if (nameElement && nameElement.tagName === 'INPUT') {
                armour.name = nameElement.value || '';
                armour.locations = locationsElement.value || '';
                armour.enc = encElement.value || '';
                armour.ap = apElement.value || '';
                armour.qualities = qualitiesElement.value || '';
                
                // Update the array
                this.character.armour[index] = armour;
            }
            
            this.createArmourRow(armourRow, armour, this.armourEditMode);
            this.addArmourEventListeners(armourRow);
        });
    }

    addArmourEventListeners(armourRow) {
        const inputs = armourRow.querySelectorAll('input');
        
        inputs.forEach(input => {
            if (!input.readOnly) {
                input.addEventListener('input', () => {
                    // Auto-save is handled by the edit mode toggle
                });
            }
        });
    }

    saveArmour() {
        const armourRows = document.querySelectorAll('#armour-list .armour-row');
        this.character.armour = [];
        
        armourRows.forEach(row => {
            const nameElement = row.querySelector('.armour-name');
            const locationsElement = row.querySelector('.armour-locations');
            const encElement = row.querySelector('.armour-enc');
            const apElement = row.querySelector('.armour-ap');
            const qualitiesElement = row.querySelector('.armour-qualities');
            
            // Get values based on element type (input vs div)
            const name = nameElement.tagName === 'INPUT' ? (nameElement.value || '') : (nameElement.textContent || '');
            const locations = locationsElement.tagName === 'INPUT' ? (locationsElement.value || '') : (locationsElement.textContent || '');
            const enc = encElement.tagName === 'INPUT' ? (encElement.value || '') : (encElement.textContent || '');
            const ap = apElement.tagName === 'INPUT' ? (apElement.value || '') : (apElement.textContent || '');
            const qualities = qualitiesElement.tagName === 'INPUT' ? (qualitiesElement.value || '') : (qualitiesElement.textContent || '');
            
            // Always save the armour, even if empty, to maintain the row
            this.character.armour.push({
                name: name,
                locations: locations,
                enc: enc,
                ap: ap,
                qualities: qualities
            });
        });
        
        this.saveCharacter();
        console.log('Armour saved:', this.character.armour);
    }

    toggleArmourEditMode() {
        if (this.armourEditMode) {
            // Save when exiting edit mode
            this.saveArmour();
        }
        this.setArmourMode(!this.armourEditMode);
    }

    populateTrappings() {
        const container = document.getElementById('trapping-list');
        container.innerHTML = '';
        
        if (this.character.trappings && this.character.trappings.length > 0) {
            this.character.trappings.forEach(trapping => {
                const trappingRow = document.createElement('div');
                trappingRow.className = 'trapping-row';
                this.createTrappingRow(trappingRow, trapping, false); // false = read-only mode
                container.appendChild(trappingRow);
                
                // Add event listeners
                this.addTrappingEventListeners(trappingRow);
            });
        }
        
        // Set initial mode to read-only
        this.setTrappingsMode(false);
    }

    createTrappingRow(trappingRow, trapping, editMode) {
        if (editMode) {
            trappingRow.innerHTML = `
                <input type="text" placeholder="Trapping name" class="trapping-name" value="${trapping.name || ''}">
                <input type="text" placeholder="0" class="trapping-enc" value="${trapping.enc || ''}">
                <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
            `;
        } else {
            trappingRow.innerHTML = `
                <div class="trapping-name">${trapping.name || ''}</div>
                <div class="trapping-enc">${trapping.enc || ''}</div>
                <span class="remove-button"></span>
            `;
        }
    }

    setTrappingsMode(editMode) {
        this.trappingsEditMode = editMode;
        const trappingsSection = document.getElementById('trapping-list').closest('.trappings');
        const editButton = document.getElementById('edit-trappings');
        
        if (editMode) {
            trappingsSection.classList.remove('trappings-readonly');
            trappingsSection.classList.add('trappings-edit');
            editButton.textContent = 'Save';
        } else {
            trappingsSection.classList.add('trappings-readonly');
            trappingsSection.classList.remove('trappings-edit');
            editButton.textContent = 'Edit';
        }
        
        // Re-populate trappings with the new mode
        this.repopulateTrappings();
    }

    repopulateTrappings() {
        const container = document.getElementById('trapping-list');
        const trappingRows = container.querySelectorAll('.trapping-row');
        
        // Ensure the array exists
        if (!this.character.trappings) {
            this.character.trappings = [];
        }
        
        trappingRows.forEach((trappingRow, index) => {
            // Get current values before repopulating
            const nameElement = trappingRow.querySelector('.trapping-name');
            const encElement = trappingRow.querySelector('.trapping-enc');
            
            let trapping = this.character.trappings[index] || { name: '', enc: '' };
            
            // Update trapping data from current elements (only if they're inputs)
            if (nameElement && nameElement.tagName === 'INPUT') {
                trapping.name = nameElement.value || '';
                trapping.enc = encElement.value || '';
                
                // Update the array
                this.character.trappings[index] = trapping;
            }
            
            this.createTrappingRow(trappingRow, trapping, this.trappingsEditMode);
            this.addTrappingEventListeners(trappingRow);
        });
    }

    addTrappingEventListeners(trappingRow) {
        const inputs = trappingRow.querySelectorAll('input');
        
        inputs.forEach(input => {
            if (!input.readOnly) {
                input.addEventListener('input', () => {
                    // Auto-save is handled by the edit mode toggle
                });
            }
        });
    }

    saveTrappings() {
        const trappingRows = document.querySelectorAll('#trapping-list .trapping-row');
        this.character.trappings = [];
        
        trappingRows.forEach(row => {
            const nameElement = row.querySelector('.trapping-name');
            const encElement = row.querySelector('.trapping-enc');
            
            // Get values based on element type (input vs div)
            const name = nameElement.tagName === 'INPUT' ? (nameElement.value || '') : (nameElement.textContent || '');
            const enc = encElement.tagName === 'INPUT' ? (encElement.value || '') : (encElement.textContent || '');
            
            // Always save the trapping, even if empty, to maintain the row
            this.character.trappings.push({
                name: name,
                enc: enc
            });
        });
        
        this.saveCharacter();
        console.log('Trappings saved:', this.character.trappings);
    }

    toggleTrappingsEditMode() {
        if (this.trappingsEditMode) {
            // Save when exiting edit mode
            this.saveTrappings();
        }
        this.setTrappingsMode(!this.trappingsEditMode);
    }

    populateSpells() {
        const container = document.getElementById('spells-list');
        container.innerHTML = '';
        
        if (this.character.spells && this.character.spells.length > 0) {
            this.character.spells.forEach(spell => {
                const spellRow = document.createElement('div');
                spellRow.className = 'spell-row';
                this.createSpellRow(spellRow, spell, false); // false = read-only mode
                container.appendChild(spellRow);
                
                // Add event listeners
                this.addSpellEventListeners(spellRow);
            });
        }
        
        // Set initial mode to read-only
        this.setSpellsMode(false);
    }

    createSpellRow(spellRow, spell, editMode) {
        if (editMode) {
            spellRow.innerHTML = `
                <input type="text" placeholder="Spell/Prayer name" class="spell-name" value="${spell.name || ''}">
                <input type="text" placeholder="0" class="spell-cn" value="${spell.cn || ''}">
                <input type="text" placeholder="Range" class="spell-range" value="${spell.range || ''}">
                <input type="text" placeholder="Target" class="spell-target" value="${spell.target || ''}">
                <input type="text" placeholder="Duration" class="spell-duration" value="${spell.duration || ''}">
                <textarea placeholder="Effect" class="spell-effect">${spell.effect || ''}</textarea>
                <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
            `;
        } else {
            spellRow.innerHTML = `
                <div class="spell-name">${spell.name || ''}</div>
                <div class="spell-cn">${spell.cn || ''}</div>
                <div class="spell-range">${spell.range || ''}</div>
                <div class="spell-target">${spell.target || ''}</div>
                <div class="spell-duration">${spell.duration || ''}</div>
                <div class="spell-effect">${spell.effect || ''}</div>
                <span class="remove-button"></span>
            `;
        }
    }

    setSpellsMode(editMode) {
        this.spellsEditMode = editMode;
        const spellsSection = document.getElementById('spells-list').closest('.spells');
        const editButton = document.getElementById('edit-spells');
        
        if (editMode) {
            spellsSection.classList.remove('spells-readonly');
            spellsSection.classList.add('spells-edit');
            editButton.textContent = 'Save';
        } else {
            spellsSection.classList.add('spells-readonly');
            spellsSection.classList.remove('spells-edit');
            editButton.textContent = 'Edit';
        }
        
        // Re-populate spells with the new mode
        this.repopulateSpells();
    }

    repopulateSpells() {
        const container = document.getElementById('spells-list');
        const spellRows = container.querySelectorAll('.spell-row');
        
        // Ensure the array exists
        if (!this.character.spells) {
            this.character.spells = [];
        }
        
        spellRows.forEach((spellRow, index) => {
            // Get current values before repopulating
            const nameElement = spellRow.querySelector('.spell-name');
            const cnElement = spellRow.querySelector('.spell-cn');
            const rangeElement = spellRow.querySelector('.spell-range');
            const targetElement = spellRow.querySelector('.spell-target');
            const durationElement = spellRow.querySelector('.spell-duration');
            const effectElement = spellRow.querySelector('.spell-effect');
            
            let spell = this.character.spells[index] || { name: '', cn: '', range: '', target: '', duration: '', effect: '' };
            
            // Update spell data from current elements (only if they're inputs)
            if (nameElement && (nameElement.tagName === 'INPUT' || nameElement.tagName === 'TEXTAREA')) {
                spell.name = nameElement.value || '';
                spell.cn = cnElement.value || '';
                spell.range = rangeElement.value || '';
                spell.target = targetElement.value || '';
                spell.duration = durationElement.value || '';
                spell.effect = effectElement.value || '';
                
                // Update the array
                this.character.spells[index] = spell;
            }
            
            this.createSpellRow(spellRow, spell, this.spellsEditMode);
            this.addSpellEventListeners(spellRow);
        });
    }

    addSpellEventListeners(spellRow) {
        const inputs = spellRow.querySelectorAll('input, textarea');
        
        inputs.forEach(input => {
            if (!input.readOnly) {
                input.addEventListener('input', () => {
                    // Auto-save is handled by the edit mode toggle
                });
            }
        });
    }

    saveSpells() {
        const spellRows = document.querySelectorAll('#spells-list .spell-row');
        this.character.spells = [];
        
        spellRows.forEach(row => {
            const nameElement = row.querySelector('.spell-name');
            const cnElement = row.querySelector('.spell-cn');
            const rangeElement = row.querySelector('.spell-range');
            const targetElement = row.querySelector('.spell-target');
            const durationElement = row.querySelector('.spell-duration');
            const effectElement = row.querySelector('.spell-effect');
            
            // Get values based on element type (input/textarea vs div)
            const name = (nameElement.tagName === 'INPUT' || nameElement.tagName === 'TEXTAREA') ? (nameElement.value || '') : (nameElement.textContent || '');
            const cn = (cnElement.tagName === 'INPUT' || cnElement.tagName === 'TEXTAREA') ? (cnElement.value || '') : (cnElement.textContent || '');
            const range = (rangeElement.tagName === 'INPUT' || rangeElement.tagName === 'TEXTAREA') ? (rangeElement.value || '') : (rangeElement.textContent || '');
            const target = (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') ? (targetElement.value || '') : (targetElement.textContent || '');
            const duration = (durationElement.tagName === 'INPUT' || durationElement.tagName === 'TEXTAREA') ? (durationElement.value || '') : (durationElement.textContent || '');
            const effect = (effectElement.tagName === 'INPUT' || effectElement.tagName === 'TEXTAREA') ? (effectElement.value || '') : (effectElement.textContent || '');
            
            // Always save the spell, even if empty, to maintain the row
            this.character.spells.push({
                name: name,
                cn: cn,
                range: range,
                target: target,
                duration: duration,
                effect: effect
            });
        });
        
        this.saveCharacter();
        console.log('Spells saved:', this.character.spells);
    }

    toggleSpellsEditMode() {
        if (this.spellsEditMode) {
            // Save when exiting edit mode
            this.saveSpells();
        }
        this.setSpellsMode(!this.spellsEditMode);
    }

    populateOtherSections() {
        // Ambitions
        document.getElementById('short-ambition').value = this.character.ambitions.short || '';
        document.getElementById('long-ambition').value = this.character.ambitions.long || '';
        
        // Party
        document.getElementById('party-name').value = this.character.party.name || '';
        document.getElementById('party-short').value = this.character.party.short || '';
        document.getElementById('party-long').value = this.character.party.long || '';
        document.getElementById('party-members').value = this.character.party.members || '';
        
        // Psychology and Corruption
        document.getElementById('psychology').value = this.character.psychology || '';
        document.getElementById('corruption').value = this.character.corruption || '';
        
        // Wounds
        document.getElementById('sb').value = this.character.wounds.sb || 0;
        document.getElementById('tb-plus-2').value = this.character.wounds.tbPlus2 || 0;
        document.getElementById('wpb').value = this.character.wounds.wpb || 0;
        document.getElementById('hardy').value = this.character.wounds.hardy || 0;
        document.getElementById('wounds').value = this.character.wounds.wounds || 0;
        
        // Wealth
        document.getElementById('wealth-d').value = this.character.wealth.d || 0;
        document.getElementById('wealth-ss').value = this.character.wealth.ss || 0;
        document.getElementById('wealth-gc').value = this.character.wealth.gc || 0;
        
        // Encumbrance
        document.getElementById('enc-weapons').value = this.character.encumbrance.weapons || 0;
        document.getElementById('enc-armour').value = this.character.encumbrance.armour || 0;
        document.getElementById('enc-trappings').value = this.character.encumbrance.trappings || 0;
        document.getElementById('enc-max').value = this.character.encumbrance.max || 0;
        document.getElementById('enc-total').value = this.character.encumbrance.total || 0;
    }

    calculateDerivedStats() {
        // This method is now handled automatically by the state system
        // The DOM will be updated automatically when computed values change
        // This method is kept for backward compatibility but does nothing
        console.log('calculateDerivedStats called - now handled by reactive state system');
    }

    getCharacteristicValue(characteristic) {
        // Map characteristic abbreviations to computed keys (same logic as advanced skills)
        const getCharacteristicComputedKey = (char) => {
            if (!char) return 'currentWS'; // Default fallback
            const upperChar = char.toUpperCase();
            // Handle special cases for characteristic mappings
            if (upperChar === 'I') return 'currentI';
            if (upperChar === 'AG') return 'currentAG';
            if (upperChar === 'DEX') return 'currentDEX';
            if (upperChar === 'INT') return 'currentINT';
            if (upperChar === 'WP') return 'currentWP';
            if (upperChar === 'FEL') return 'currentFEL';
            // Standard cases
            return `current${upperChar}`;
        };
        
        const computedKey = getCharacteristicComputedKey(characteristic);
        return this.state.get(`_computed.${computedKey}`) || 0;
    }

    setupEventListeners() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            // Skip readonly inputs (computed values)
            if (input.readOnly) return;
            
            // Skip export/import modal textareas
            if (input.id === 'export-data' || input.id === 'import-data') return;
            
            input.addEventListener('change', (e) => {
                this.domSync.updateFromDOM(e.target);
            });
            
            // Also listen for input events for real-time updates
            input.addEventListener('input', (e) => {
                // Update state immediately for characteristics and skills for responsive calculations
                if (e.target.id.includes('-initial') || e.target.id.includes('-advances') || e.target.id.startsWith('skill-')) {
                    this.domSync.updateFromDOM(e.target);
                }
                // For text areas, also update immediately
                if (e.target.tagName === 'TEXTAREA') {
                    this.domSync.updateFromDOM(e.target);
                }
            });
            
            // Add blur event for additional safety
            input.addEventListener('blur', (e) => {
                this.domSync.updateFromDOM(e.target);
            });
        });
    }

    updateCharacterData(element) {
        // This method is now handled by domSync.updateFromDOM()
        // Kept for backward compatibility
        this.domSync.updateFromDOM(element);
    }

    addAdvancedSkillEventListeners(skillRow) {
        const advancesInput = skillRow.querySelector('.skill-adv input');
        const characteristicSelect = skillRow.querySelector('select.skill-char');
        const skillNameInput = skillRow.querySelector('input.skill-name');
        
        // Update state when any field changes
        const updateAdvancedSkillsState = () => {
            // Save all advanced skills to state
            this.saveAdvancedSkillsFromDOM();
        };
        
        // Always add listener for advances input (editable in both modes)
        if (advancesInput) {
            advancesInput.addEventListener('input', () => {
                updateAdvancedSkillsState();
                if (!this.advancedSkillsEditMode) {
                    // Auto-save advances in read-only mode
                    this.saveAdvancedSkills();
                }
            });
        }
        
        // Add listeners for edit mode elements
        if (characteristicSelect) {
            characteristicSelect.addEventListener('change', updateAdvancedSkillsState);
        }
        
        if (skillNameInput && !skillNameInput.readOnly) {
            skillNameInput.addEventListener('input', updateAdvancedSkillsState);
        }
    }

    saveAdvancedSkillsFromDOM() {
        const skillRows = document.querySelectorAll('#advanced-skills .skill-row');
        if (skillRows.length === 0) {
            // Don't clear advanced skills if there are no DOM rows - 
            // this happens during import when we're about to populate
            return;
        }
        
        const advancedSkills = Array.from(skillRows).map(row => {
            const nameElement = row.querySelector('.skill-name');
            const charElement = row.querySelector('.skill-char');
            const advInput = row.querySelector('.skill-adv input');
            
            return {
                name: nameElement ? (nameElement.value || nameElement.textContent || '') : '',
                characteristic: charElement ? (charElement.value || charElement.textContent || 'WS') : 'WS',
                advances: advInput ? parseInt(advInput.value) || 0 : 0
            };
        });
        
        // Update state instead of directly modifying character object
        this.state.set('advancedSkills', advancedSkills);
        
        // Keep backward compatibility
        this.character.advancedSkills = advancedSkills;
    }
    
    saveAdvancedSkills() {
        this.saveAdvancedSkillsFromDOM();
        this.saveCharacter();
        console.log('Advanced skills saved:', this.character.advancedSkills);
    }

    addTalentEventListeners(talentRow) {
        const nameInput = talentRow.querySelector('.talent-name');
        const timesInput = talentRow.querySelector('.talent-times');
        const descriptionInput = talentRow.querySelector('.talent-description');
        
        // Only add listeners if fields are editable (not readonly)
        if (nameInput && !nameInput.readOnly) {
            nameInput.addEventListener('input', () => {
                // Auto-save is handled by the edit mode toggle, no need for save button
            });
        }
        
        if (timesInput && !timesInput.readOnly) {
            timesInput.addEventListener('input', () => {
                // Auto-save is handled by the edit mode toggle, no need for save button
            });
        }
        
        if (descriptionInput && !descriptionInput.readOnly) {
            descriptionInput.addEventListener('input', () => {
                // Auto-save is handled by the edit mode toggle, no need for save button
            });
        }
    }

    saveTalents() {
        const talentRows = document.querySelectorAll('#talents-list .talent-row');
        this.character.talents = [];
        
        talentRows.forEach(row => {
            const name = row.querySelector('.talent-name').value || '';
            const times = parseInt(row.querySelector('.talent-times').value) || 0;
            const description = row.querySelector('.talent-description').value || '';
            
            // Always save the talent, even if empty, to maintain the row
            this.character.talents.push({
                name: name,
                times: times,
                description: description
            });
        });
        
        this.saveCharacter();
        console.log('Talents saved:', this.character.talents);
    }

    addTalent() {
        const talentsList = document.getElementById('talents-list');
        const talentRow = document.createElement('div');
        talentRow.className = 'talent-row';
        talentRow.innerHTML = `
            <input type="text" placeholder="Talent name" class="talent-name">
            <input type="number" placeholder="0" class="talent-times">
            <textarea placeholder="Description" class="talent-description"></textarea>
            <button type="button" onclick="this.parentElement.remove()">Remove</button>
        `;
        talentsList.appendChild(talentRow);
    }

    addWeapon() {
        const weaponsList = document.getElementById('weapons-list');
        const weaponRow = document.createElement('div');
        weaponRow.className = 'weapon-row';
        weaponRow.innerHTML = `
            <input type="text" placeholder="Weapon name" class="weapon-name">
            <input type="text" placeholder="Group" class="weapon-group">
            <input type="number" placeholder="0" class="weapon-enc">
            <input type="text" placeholder="Range/Reach" class="weapon-range">
            <input type="text" placeholder="Damage" class="weapon-damage">
            <input type="text" placeholder="Qualities" class="weapon-qualities">
            <button type="button" onclick="this.parentElement.remove()">Remove</button>
        `;
        weaponsList.appendChild(weaponRow);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.characterSheet = new WFRPCharacterSheet();
});

function addTalent() {
    if (!window.characterSheet.talentsEditMode) {
        return; // Only allow adding talents in edit mode
    }
    
    const talentsList = document.getElementById('talents-list');
    const talentRow = document.createElement('div');
    talentRow.className = 'talent-row';
    
    const newTalent = { name: '', times: 0, description: '' };
    window.characterSheet.createTalentRowEditMode(talentRow, newTalent);
    talentsList.appendChild(talentRow);
    
    // Add event listeners
    window.characterSheet.addTalentEventListeners(talentRow);
}

function addAdvancedSkill() {
    if (!window.characterSheet.advancedSkillsEditMode) {
        return; // Only allow adding skills in edit mode
    }
    
    const skillsList = document.getElementById('advanced-skills');
    const skillRow = document.createElement('div');
    skillRow.className = 'skill-row';
    
    const newSkill = { name: '', characteristic: 'WS', advances: 0 };
    window.characterSheet.createAdvancedSkillRowEditMode(skillRow, newSkill);
    skillsList.appendChild(skillRow);
    
    // Add event listeners for calculation
    window.characterSheet.addAdvancedSkillEventListeners(skillRow);
}

function getCharacteristicValueByName(characteristic) {
    // Use the character sheet's method which properly handles the state system
    if (window.characterSheet) {
        return window.characterSheet.getCharacteristicValue(characteristic);
    }
    
    // Fallback to DOM reading (for backward compatibility)
    const char = characteristic.toLowerCase();
    const currentInput = document.getElementById(`${char}-current`);
    if (currentInput) {
        return parseInt(currentInput.value) || 0;
    }
    return 0;
}

function addWeapon() {
    const weaponsList = document.getElementById('weapons-list');
    const weaponRow = document.createElement('div');
    weaponRow.className = 'weapon-row';
    weaponRow.innerHTML = `
        <input type="text" placeholder="Weapon name" class="weapon-name">
        <input type="text" placeholder="Group" class="weapon-group">
        <input type="number" placeholder="0" class="weapon-enc">
        <input type="text" placeholder="Range/Reach" class="weapon-range">
        <input type="text" placeholder="Damage" class="weapon-damage">
        <input type="text" placeholder="Qualities" class="weapon-qualities">
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    weaponsList.appendChild(weaponRow);
}

function addArmour() {
    const armourList = document.getElementById('armour-list');
    const armourRow = document.createElement('div');
    armourRow.className = 'armour-row';
    armourRow.innerHTML = `
        <input type="text" placeholder="Armour name" class="armour-name">
        <input type="text" placeholder="Locations" class="armour-locations">
        <input type="number" placeholder="0" class="armour-enc">
        <input type="number" placeholder="0" class="armour-ap">
        <input type="text" placeholder="Qualities" class="armour-qualities">
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    armourList.appendChild(armourRow);
}

function addTrapping() {
    const trappingList = document.getElementById('trapping-list');
    const trappingRow = document.createElement('div');
    trappingRow.className = 'trapping-row';
    trappingRow.innerHTML = `
        <input type="text" placeholder="Trapping name" class="trapping-name">
        <input type="number" placeholder="0" class="trapping-enc">
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    trappingList.appendChild(trappingRow);
}

function addSpell() {
    const spellsList = document.getElementById('spells-list');
    const spellRow = document.createElement('div');
    spellRow.className = 'spell-row';
    spellRow.innerHTML = `
        <input type="text" placeholder="Spell/Prayer name" class="spell-name">
        <input type="number" placeholder="0" class="spell-cn">
        <input type="text" placeholder="Range" class="spell-range">
        <input type="text" placeholder="Target" class="spell-target">
        <input type="text" placeholder="Duration" class="spell-duration">
        <textarea placeholder="Effect" class="spell-effect"></textarea>
        <button type="button" onclick="this.parentElement.remove()">Remove</button>
    `;
    spellsList.appendChild(spellRow);
}

function toggleAdvancedSkillsEditMode() {
    window.characterSheet.toggleAdvancedSkillsEditMode();
}

function toggleTalentsEditMode() {
    window.characterSheet.toggleTalentsEditMode();
}

function toggleWeaponsEditMode() {
    window.characterSheet.toggleWeaponsEditMode();
}

function toggleArmourEditMode() {
    window.characterSheet.toggleArmourEditMode();
}

function toggleTrappingsEditMode() {
    window.characterSheet.toggleTrappingsEditMode();
}

function toggleSpellsEditMode() {
    window.characterSheet.toggleSpellsEditMode();
}

// Import/Export Functions
function exportCharacter() {
    const exportModal = document.getElementById('export-modal');
    const exportData = document.getElementById('export-data');
    
    // Get current character data from state
    const characterData = window.characterSheet.state.toJSON();
    
    // Remove exportdata and importdata fields before converting to JSON
    delete characterData.exportdata;
    delete characterData.importdata;
    
    // Convert to JSON with pretty formatting
    const jsonData = JSON.stringify(characterData, null, 2);
    
    // Set the data in the textarea
    exportData.value = jsonData;
    
    // Show the modal
    exportModal.style.display = 'block';
    
    // Select all text for easy copying
    exportData.select();
    exportData.setSelectionRange(0, 99999); // For mobile devices
}

function closeExportModal() {
    const exportModal = document.getElementById('export-modal');
    exportModal.style.display = 'none';
}

function importCharacter() {
    const importModal = document.getElementById('import-modal');
    const importData = document.getElementById('import-data');
    
    // Clear the textarea
    importData.value = '';
    
    // Show the modal
    importModal.style.display = 'block';
    
    // Focus on the textarea
    importData.focus();
}

function closeImportModal() {
    const importModal = document.getElementById('import-modal');
    importModal.style.display = 'none';
}

function confirmImport() {
    const importData = document.getElementById('import-data');
    const jsonData = importData.value.trim();
    
    if (!jsonData) {
        alert('Please paste character data to import.');
        return;
    }
    
    try {
        // Parse the JSON data
        const characterData = JSON.parse(jsonData);
        
        // Validate that this looks like character data
        if (typeof characterData !== 'object' || characterData === null) {
            throw new Error('Invalid character data format');
        }
        
        // Update the state with imported data
        const mergedData = window.characterSheet.mergeCharacterData(
            window.characterSheet.state.data, 
            characterData
        );
        
        // Load the new data into state (this will trigger all updates automatically)
        window.characterSheet.state.fromJSON(mergedData);
        
        // Update the backward compatibility reference
        window.characterSheet.character = window.characterSheet.state.data;
        
        // Re-populate dynamic sections that require DOM reconstruction
        // These sections need to rebuild their DOM elements from the imported data
        window.characterSheet.populateAdvancedSkills();
        window.characterSheet.populateTalents();
        window.characterSheet.populateWeapons();
        window.characterSheet.populateArmour();
        window.characterSheet.populateTrappings();
        window.characterSheet.populateSpells();
        
        // Force sync to DOM to ensure all computed values are updated
        window.characterSheet.domSync.syncToDOM();
        
        // Close the modal
        closeImportModal();
        
    } catch (error) {
        alert('Error importing character data: ' + error.message + '\nPlease check that the data is valid JSON.');
    }
}