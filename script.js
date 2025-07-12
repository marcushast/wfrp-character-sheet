class WFRPCharacterSheet {
    constructor() {
        this.character = this.loadCharacter();
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
        
        this.initializeSheet();
        this.setupEventListeners();
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
        localStorage.setItem('wfrp-character', JSON.stringify(this.character));
    }

    initializeSheet() {
        this.populateBasicInfo();
        this.populateCharacteristics();
        this.populateSecondaryStats();
        this.populateBasicSkills();
        this.populateAdvancedSkills();
        this.populateTalents();
        this.populateWeapons();
        this.populateArmour();
        this.populateTrappings();
        this.populateSpells();
        this.populateOtherSections();
        // Small delay to ensure all elements are populated before calculating
        setTimeout(() => {
            this.calculateDerivedStats();
        }, 100);
    }

    populateBasicInfo() {
        const fields = ['name', 'species', 'class', 'career-path', 'career', 'career-level', 'status', 'age', 'height', 'hair', 'eyes'];
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                const key = field.replace(/-/g, '');
                element.value = this.character[key] || '';
            }
        });
    }

    populateCharacteristics() {
        const chars = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];
        
        chars.forEach(char => {
            const initialInput = document.getElementById(`${char}-initial`);
            const advancesInput = document.getElementById(`${char}-advances`);
            const currentInput = document.getElementById(`${char}-current`);
            
            if (initialInput) {
                initialInput.value = this.character.characteristics[char]?.initial || 0;
            }
            if (advancesInput) {
                advancesInput.value = this.character.characteristics[char]?.advances || 0;
            }
            if (currentInput) {
                currentInput.value = (this.character.characteristics[char]?.initial || 0) + 
                                   (this.character.characteristics[char]?.advances || 0);
            }
        });
    }

    populateSecondaryStats() {
        const stats = ['fate', 'fortune', 'resilience', 'resolve', 'motivation', 'current-exp', 'spent-exp', 'movement', 'walk', 'run'];
        stats.forEach(stat => {
            const element = document.getElementById(stat);
            if (element) {
                const key = stat.replace('-', '');
                if (stat.includes('exp')) {
                    element.value = this.character.experience[key.replace('exp', '')] || 0;
                } else {
                    element.value = this.character[key] || '';
                }
            }
        });
    }

    populateBasicSkills() {
        const container = document.getElementById('basic-skills');
        container.innerHTML = '';
        
        this.basicSkills.forEach(skill => {
            const row = document.createElement('div');
            row.className = 'skill-row';
            
            row.innerHTML = `
                <div class="skill-name">${skill.name}</div>
                <div class="skill-char">${skill.characteristic}</div>
                <div class="skill-adv">
                    <input type="number" id="skill-${skill.name.toLowerCase().replace(/\s+/g, '-')}" 
                           name="skill-${skill.name.toLowerCase().replace(/\s+/g, '-')}" 
                           value="${this.character.skills[skill.name] || 0}">
                </div>
                <div class="skill-total">
                    <input type="number" readonly id="skill-total-${skill.name.toLowerCase().replace(/\s+/g, '-')}">
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

    createAdvancedSkillRow(skillRow, skill, editMode) {
        const characteristicOptions = ['WS', 'BS', 'S', 'T', 'I', 'Ag', 'Dex', 'Int', 'WP', 'Fel']
            .map(char => `<option value="${char}" ${skill.characteristic === char ? 'selected' : ''}>${char}</option>`)
            .join('');
        
        const nameField = editMode 
            ? `<input type="text" placeholder="Skill name" class="skill-name" value="${skill.name || ''}">`
            : `<div class="skill-name">${skill.name || ''}</div>`;
            
        const charField = editMode
            ? `<select class="skill-char">${characteristicOptions}</select>`
            : `<div class="skill-char">${skill.characteristic || 'WS'}</div>`;
            
        const removeButton = editMode
            ? `<button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>`
            : `<span class="remove-button"></span>`;
            
        skillRow.innerHTML = `
            ${nameField}
            ${charField}
            <div class="skill-adv">
                <input type="number" placeholder="0" value="${skill.advances || 0}">
            </div>
            <div class="skill-total">
                <input type="number" readonly value="0">
            </div>
            ${removeButton}
        `;
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
        this.populateAdvancedSkillsInMode();
    }

    populateAdvancedSkillsInMode() {
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
            this.createAdvancedSkillRow(skillRow, skill, this.advancedSkillsEditMode);
            container.appendChild(skillRow);
            this.addAdvancedSkillEventListeners(skillRow);
        });
    }

    toggleAdvancedSkillsEditMode() {
        if (this.advancedSkillsEditMode) {
            // Save when exiting edit mode
            this.saveAdvancedSkills();
        }
        this.setAdvancedSkillsMode(!this.advancedSkillsEditMode);
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
            talentRow.innerHTML = `
                <input type="text" placeholder="Talent name" class="talent-name" value="${talent.name || ''}">
                <input type="number" placeholder="0" class="talent-times" value="${talent.times || 0}">
                <textarea placeholder="Description" class="talent-description">${talent.description || ''}</textarea>
                <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
            `;
        } else {
            talentRow.innerHTML = `
                <input type="text" readonly class="talent-name" value="${talent.name || ''}">
                <input type="number" readonly class="talent-times" value="${talent.times || 0}">
                <textarea readonly class="talent-description">${talent.description || ''}</textarea>
                <span class="remove-button"></span>
            `;
        }
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
        
        // Re-populate talents with the new mode
        this.repopulateTalents();
    }

    repopulateTalents() {
        const container = document.getElementById('talents-list');
        const talentRows = container.querySelectorAll('.talent-row');
        
        // Ensure the array exists
        if (!this.character.talents) {
            this.character.talents = [];
        }
        
        talentRows.forEach((talentRow, index) => {
            // Get current values before repopulating
            const nameInput = talentRow.querySelector('.talent-name');
            const timesInput = talentRow.querySelector('.talent-times');
            const descriptionInput = talentRow.querySelector('.talent-description');
            
            let talent = this.character.talents[index] || { name: '', times: 0, description: '' };
            
            if (nameInput && timesInput && descriptionInput) {
                talent.name = nameInput.value;
                talent.times = parseInt(timesInput.value) || 0;
                talent.description = descriptionInput.value;
                
                // Update the array
                this.character.talents[index] = talent;
            }
            
            this.createTalentRow(talentRow, talent, this.talentsEditMode);
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
                <input type="number" placeholder="0" class="weapon-enc" value="${weapon.enc || 0}">
                <input type="text" placeholder="Range/Reach" class="weapon-range" value="${weapon.range || ''}">
                <input type="text" placeholder="Damage" class="weapon-damage" value="${weapon.damage || ''}">
                <input type="text" placeholder="Qualities" class="weapon-qualities" value="${weapon.qualities || ''}">
                <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
            `;
        } else {
            weaponRow.innerHTML = `
                <input type="text" readonly class="weapon-name" value="${weapon.name || ''}">
                <input type="text" readonly class="weapon-group" value="${weapon.group || ''}">
                <input type="number" readonly class="weapon-enc" value="${weapon.enc || 0}">
                <input type="text" readonly class="weapon-range" value="${weapon.range || ''}">
                <input type="text" readonly class="weapon-damage" value="${weapon.damage || ''}">
                <input type="text" readonly class="weapon-qualities" value="${weapon.qualities || ''}">
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
            const nameInput = weaponRow.querySelector('.weapon-name');
            const groupInput = weaponRow.querySelector('.weapon-group');
            const encInput = weaponRow.querySelector('.weapon-enc');
            const rangeInput = weaponRow.querySelector('.weapon-range');
            const damageInput = weaponRow.querySelector('.weapon-damage');
            const qualitiesInput = weaponRow.querySelector('.weapon-qualities');
            
            let weapon = this.character.weapons[index] || { name: '', group: '', enc: 0, range: '', damage: '', qualities: '' };
            
            if (nameInput && groupInput && encInput && rangeInput && damageInput && qualitiesInput) {
                weapon.name = nameInput.value;
                weapon.group = groupInput.value;
                weapon.enc = parseInt(encInput.value) || 0;
                weapon.range = rangeInput.value;
                weapon.damage = damageInput.value;
                weapon.qualities = qualitiesInput.value;
                
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
            const name = row.querySelector('.weapon-name').value || '';
            const group = row.querySelector('.weapon-group').value || '';
            const enc = parseInt(row.querySelector('.weapon-enc').value) || 0;
            const range = row.querySelector('.weapon-range').value || '';
            const damage = row.querySelector('.weapon-damage').value || '';
            const qualities = row.querySelector('.weapon-qualities').value || '';
            
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
                <input type="number" placeholder="0" class="armour-enc" value="${armour.enc || 0}">
                <input type="number" placeholder="0" class="armour-ap" value="${armour.ap || 0}">
                <input type="text" placeholder="Qualities" class="armour-qualities" value="${armour.qualities || ''}">
                <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
            `;
        } else {
            armourRow.innerHTML = `
                <input type="text" readonly class="armour-name" value="${armour.name || ''}">
                <input type="text" readonly class="armour-locations" value="${armour.locations || ''}">
                <input type="number" readonly class="armour-enc" value="${armour.enc || 0}">
                <input type="number" readonly class="armour-ap" value="${armour.ap || 0}">
                <input type="text" readonly class="armour-qualities" value="${armour.qualities || ''}">
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
            const nameInput = armourRow.querySelector('.armour-name');
            const locationsInput = armourRow.querySelector('.armour-locations');
            const encInput = armourRow.querySelector('.armour-enc');
            const apInput = armourRow.querySelector('.armour-ap');
            const qualitiesInput = armourRow.querySelector('.armour-qualities');
            
            let armour = this.character.armour[index] || { name: '', locations: '', enc: 0, ap: 0, qualities: '' };
            
            if (nameInput && locationsInput && encInput && apInput && qualitiesInput) {
                armour.name = nameInput.value;
                armour.locations = locationsInput.value;
                armour.enc = parseInt(encInput.value) || 0;
                armour.ap = parseInt(apInput.value) || 0;
                armour.qualities = qualitiesInput.value;
                
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
            const name = row.querySelector('.armour-name').value || '';
            const locations = row.querySelector('.armour-locations').value || '';
            const enc = parseInt(row.querySelector('.armour-enc').value) || 0;
            const ap = parseInt(row.querySelector('.armour-ap').value) || 0;
            const qualities = row.querySelector('.armour-qualities').value || '';
            
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
                <input type="number" placeholder="0" class="trapping-enc" value="${trapping.enc || 0}">
                <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
            `;
        } else {
            trappingRow.innerHTML = `
                <input type="text" readonly class="trapping-name" value="${trapping.name || ''}">
                <input type="number" readonly class="trapping-enc" value="${trapping.enc || 0}">
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
            const nameInput = trappingRow.querySelector('.trapping-name');
            const encInput = trappingRow.querySelector('.trapping-enc');
            
            let trapping = this.character.trappings[index] || { name: '', enc: 0 };
            
            if (nameInput && encInput) {
                trapping.name = nameInput.value;
                trapping.enc = parseInt(encInput.value) || 0;
                
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
            const name = row.querySelector('.trapping-name').value || '';
            const enc = parseInt(row.querySelector('.trapping-enc').value) || 0;
            
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
                <input type="number" placeholder="0" class="spell-cn" value="${spell.cn || 0}">
                <input type="text" placeholder="Range" class="spell-range" value="${spell.range || ''}">
                <input type="text" placeholder="Target" class="spell-target" value="${spell.target || ''}">
                <input type="text" placeholder="Duration" class="spell-duration" value="${spell.duration || ''}">
                <textarea placeholder="Effect" class="spell-effect">${spell.effect || ''}</textarea>
                <button type="button" class="remove-button" onclick="this.parentElement.remove();">Remove</button>
            `;
        } else {
            spellRow.innerHTML = `
                <input type="text" readonly class="spell-name" value="${spell.name || ''}">
                <input type="number" readonly class="spell-cn" value="${spell.cn || 0}">
                <input type="text" readonly class="spell-range" value="${spell.range || ''}">
                <input type="text" readonly class="spell-target" value="${spell.target || ''}">
                <input type="text" readonly class="spell-duration" value="${spell.duration || ''}">
                <textarea readonly class="spell-effect">${spell.effect || ''}</textarea>
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
            const nameInput = spellRow.querySelector('.spell-name');
            const cnInput = spellRow.querySelector('.spell-cn');
            const rangeInput = spellRow.querySelector('.spell-range');
            const targetInput = spellRow.querySelector('.spell-target');
            const durationInput = spellRow.querySelector('.spell-duration');
            const effectInput = spellRow.querySelector('.spell-effect');
            
            let spell = this.character.spells[index] || { name: '', cn: 0, range: '', target: '', duration: '', effect: '' };
            
            if (nameInput && cnInput && rangeInput && targetInput && durationInput && effectInput) {
                spell.name = nameInput.value;
                spell.cn = parseInt(cnInput.value) || 0;
                spell.range = rangeInput.value;
                spell.target = targetInput.value;
                spell.duration = durationInput.value;
                spell.effect = effectInput.value;
                
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
            const name = row.querySelector('.spell-name').value || '';
            const cn = parseInt(row.querySelector('.spell-cn').value) || 0;
            const range = row.querySelector('.spell-range').value || '';
            const target = row.querySelector('.spell-target').value || '';
            const duration = row.querySelector('.spell-duration').value || '';
            const effect = row.querySelector('.spell-effect').value || '';
            
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
        // Update total experience
        document.getElementById('total-exp').value = 
            (parseInt(document.getElementById('current-exp').value) || 0) + 
            (parseInt(document.getElementById('spent-exp').value) || 0);
        
        // Update characteristics current values
        const chars = ['ws', 'bs', 's', 't', 'i', 'ag', 'dex', 'int', 'wp', 'fel'];
        chars.forEach(char => {
            const initial = parseInt(document.getElementById(`${char}-initial`).value) || 0;
            const advances = parseInt(document.getElementById(`${char}-advances`).value) || 0;
            const currentInput = document.getElementById(`${char}-current`);
            if (currentInput) {
                currentInput.value = initial + advances;
            }
        });
        
        // Update skill totals
        this.basicSkills.forEach(skill => {
            const skillName = skill.name.toLowerCase().replace(/\s+/g, '-');
            const advancesElement = document.getElementById(`skill-${skillName}`);
            const totalElement = document.getElementById(`skill-total-${skillName}`);
            
            if (advancesElement && totalElement) {
                const advances = parseInt(advancesElement.value) || 0;
                const charValue = this.getCharacteristicValue(skill.characteristic);
                const total = charValue + advances;
                totalElement.value = total;
            }
        });
        
        // Update advanced skills totals
        const advancedSkillRows = document.querySelectorAll('#advanced-skills .skill-row');
        advancedSkillRows.forEach(row => {
            const characteristicSelect = row.querySelector('.skill-char');
            const advancesInput = row.querySelector('.skill-adv');
            const totalInput = row.querySelector('.skill-total');
            
            if (characteristicSelect && advancesInput && totalInput) {
                const characteristic = characteristicSelect.value;
                const advances = parseInt(advancesInput.value) || 0;
                const charValue = this.getCharacteristicValue(characteristic);
                totalInput.value = charValue + advances;
            }
        });
        
        // Update encumbrance total
        const weaponsEnc = parseInt(document.getElementById('enc-weapons').value) || 0;
        const armourEnc = parseInt(document.getElementById('enc-armour').value) || 0;
        const trappingsEnc = parseInt(document.getElementById('enc-trappings').value) || 0;
        const totalEnc = weaponsEnc + armourEnc + trappingsEnc;
        document.getElementById('enc-total').value = totalEnc;
    }

    getCharacteristicValue(characteristic) {
        const char = characteristic.toLowerCase();
        const currentInput = document.getElementById(`${char}-current`);
        if (currentInput) {
            return parseInt(currentInput.value) || 0;
        }
        // Fallback to calculating from initial + advances
        const initialInput = document.getElementById(`${char}-initial`);
        const advancesInput = document.getElementById(`${char}-advances`);
        if (initialInput && advancesInput) {
            return (parseInt(initialInput.value) || 0) + (parseInt(advancesInput.value) || 0);
        }
        // Final fallback to stored data
        const charData = this.character.characteristics[char];
        if (!charData) return 0;
        return (charData.initial || 0) + (charData.advances || 0);
    }

    setupEventListeners() {
        const inputs = document.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.updateCharacterData(e.target);
                this.calculateDerivedStats();
                this.saveCharacter();
            });
            
            // Also listen for input events for real-time updates
            input.addEventListener('input', (e) => {
                if (e.target.id.includes('-initial') || e.target.id.includes('-advances') || e.target.id.startsWith('skill-')) {
                    this.calculateDerivedStats();
                }
                // For text areas (ambitions, party, psychology, corruption), also save on input
                if (e.target.tagName === 'TEXTAREA') {
                    this.updateCharacterData(e.target);
                    this.saveCharacter();
                }
            });
            
            // Add blur event for additional safety on text areas
            if (input.tagName === 'TEXTAREA') {
                input.addEventListener('blur', (e) => {
                    this.updateCharacterData(e.target);
                    this.saveCharacter();
                });
            }
        });
    }

    updateCharacterData(element) {
        const id = element.id;
        const value = element.value;
        
        if (id.includes('current') && id.includes('exp')) {
            this.character.experience.current = parseInt(value) || 0;
        } else if (id.includes('spent') && id.includes('exp')) {
            this.character.experience.spent = parseInt(value) || 0;
        } else if (id.includes('-initial') || id.includes('-advances')) {
            const [char, type] = id.split('-');
            if (!this.character.characteristics[char]) {
                this.character.characteristics[char] = { initial: 0, advances: 0 };
            }
            this.character.characteristics[char][type] = parseInt(value) || 0;
        } else if (id.startsWith('skill-') && !id.includes('total')) {
            const skillName = id.replace('skill-', '').replace(/-/g, ' ');
            const skill = this.basicSkills.find(s => s.name.toLowerCase().replace(/\s+/g, ' ') === skillName);
            if (skill) {
                this.character.skills[skill.name] = parseInt(value) || 0;
            }
        } else if (id.includes('ambition')) {
            const type = id.includes('short') ? 'short' : 'long';
            this.character.ambitions[type] = value;
        } else if (id.includes('party')) {
            const key = id.replace('party-', '');
            if (key === 'name') {
                this.character.party.name = value;
            } else if (key === 'short') {
                this.character.party.short = value;
            } else if (key === 'long') {
                this.character.party.long = value;
            } else if (key === 'members') {
                this.character.party.members = value;
            }
        } else if (id === 'psychology') {
            this.character.psychology = value;
        } else if (id === 'corruption') {
            this.character.corruption = value;
        } else if (id === 'sb') {
            this.character.wounds.sb = parseInt(value) || 0;
        } else if (id === 'tb-plus-2') {
            this.character.wounds.tbPlus2 = parseInt(value) || 0;
        } else if (id === 'wpb') {
            this.character.wounds.wpb = parseInt(value) || 0;
        } else if (id === 'hardy') {
            this.character.wounds.hardy = parseInt(value) || 0;
        } else if (id === 'wounds') {
            this.character.wounds.wounds = parseInt(value) || 0;
        } else if (id === 'wealth-d') {
            this.character.wealth.d = parseInt(value) || 0;
        } else if (id === 'wealth-ss') {
            this.character.wealth.ss = parseInt(value) || 0;
        } else if (id === 'wealth-gc') {
            this.character.wealth.gc = parseInt(value) || 0;
        } else if (id === 'enc-weapons') {
            this.character.encumbrance.weapons = parseInt(value) || 0;
        } else if (id === 'enc-armour') {
            this.character.encumbrance.armour = parseInt(value) || 0;
        } else if (id === 'enc-trappings') {
            this.character.encumbrance.trappings = parseInt(value) || 0;
        } else if (id === 'enc-max') {
            this.character.encumbrance.max = parseInt(value) || 0;
        } else if (id === 'enc-total') {
            this.character.encumbrance.total = parseInt(value) || 0;
        } else {
            const key = id.replace(/-/g, '');
            this.character[key] = value;
        }
    }

    addAdvancedSkillEventListeners(skillRow) {
        const advancesInput = skillRow.querySelector('.skill-adv input');
        const totalInput = skillRow.querySelector('.skill-total input');
        
        const calculateAdvancedSkillTotal = () => {
            let characteristic;
            const characteristicSelect = skillRow.querySelector('select.skill-char');
            const characteristicInput = skillRow.querySelector('input.skill-char');
            
            if (characteristicSelect) {
                characteristic = characteristicSelect.value;
            } else if (characteristicInput) {
                characteristic = characteristicInput.value;
            } else {
                characteristic = 'WS';
            }
            
            const advances = parseInt(advancesInput.value) || 0;
            const charValue = getCharacteristicValueByName(characteristic);
            totalInput.value = charValue + advances;
        };
        
        // Always add listener for advances input (editable in both modes)
        advancesInput.addEventListener('input', () => {
            calculateAdvancedSkillTotal();
            if (!this.advancedSkillsEditMode) {
                // Auto-save advances in read-only mode
                this.saveAdvancedSkills();
            }
        });
        
        // Add listeners for edit mode elements
        const characteristicSelect = skillRow.querySelector('select.skill-char');
        const skillNameInput = skillRow.querySelector('input.skill-name');
        
        if (characteristicSelect) {
            characteristicSelect.addEventListener('change', calculateAdvancedSkillTotal);
        }
        
        if (skillNameInput && !skillNameInput.readOnly) {
            skillNameInput.addEventListener('input', () => {
                // Changes will be saved when exiting edit mode
            });
        }
        
        // Calculate initial value
        calculateAdvancedSkillTotal();
    }

    saveAdvancedSkillsFromDOM() {
        const skillRows = document.querySelectorAll('#advanced-skills .skill-row');
        if (skillRows.length === 0) return;
        
        this.character.advancedSkills = Array.from(skillRows).map(row => {
            const nameElement = row.querySelector('.skill-name');
            const charElement = row.querySelector('.skill-char');
            const advInput = row.querySelector('.skill-adv input');
            
            return {
                name: nameElement ? (nameElement.value || nameElement.textContent || '') : '',
                characteristic: charElement ? (charElement.value || charElement.textContent || 'WS') : 'WS',
                advances: advInput ? parseInt(advInput.value) || 0 : 0
            };
        });
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
    window.characterSheet.createTalentRow(talentRow, newTalent, true);
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
    window.characterSheet.createAdvancedSkillRow(skillRow, newSkill, true);
    skillsList.appendChild(skillRow);
    
    // Add event listeners for calculation
    window.characterSheet.addAdvancedSkillEventListeners(skillRow);
}

function getCharacteristicValueByName(characteristic) {
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
    
    // Get current character data
    const characterData = window.characterSheet.character;
    
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
        
        // Update the character sheet with imported data
        window.characterSheet.character = window.characterSheet.mergeCharacterData(
            window.characterSheet.character, 
            characterData
        );
        
        // Save to localStorage
        window.characterSheet.saveCharacter();
        
        // Re-initialize the sheet with new data
        window.characterSheet.initializeSheet();
        
        // Close the modal
        closeImportModal();
        
        alert('Character data imported successfully!');
        
    } catch (error) {
        alert('Error importing character data: ' + error.message + '\nPlease check that the data is valid JSON.');
    }
}