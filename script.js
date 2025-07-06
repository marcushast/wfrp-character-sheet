class WFRPCharacterSheet {
    constructor() {
        this.character = this.loadCharacter();
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
        const saved = localStorage.getItem('wfrp-character');
        return saved ? JSON.parse(saved) : {
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
            weapons: []
        };
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
        const container = document.getElementById('advanced-skills');
        container.innerHTML = '';
        
        if (this.character.advancedSkills && this.character.advancedSkills.length > 0) {
            this.character.advancedSkills.forEach(skill => {
            const skillRow = document.createElement('div');
            skillRow.className = 'skill-row';
            skillRow.innerHTML = `
                <input type="text" placeholder="Skill name" class="skill-name" value="${skill.name || ''}">
                <select class="skill-char">
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
                </select>
                <input type="number" placeholder="0" class="skill-adv" value="${skill.advances || 0}">
                <input type="number" readonly class="skill-total" value="0">
                <button type="button" onclick="this.parentElement.remove(); showAdvancedSkillsSaveButton();">Remove</button>
            `;
            container.appendChild(skillRow);
            
            // Add event listeners
            this.addAdvancedSkillEventListeners(skillRow);
            });
        }
    }

    populateTalents() {
        const container = document.getElementById('talents-list');
        container.innerHTML = '';
        
        if (this.character.talents && this.character.talents.length > 0) {
            this.character.talents.forEach(talent => {
            const talentRow = document.createElement('div');
            talentRow.className = 'talent-row';
            talentRow.innerHTML = `
                <input type="text" placeholder="Talent name" class="talent-name" value="${talent.name || ''}">
                <input type="number" placeholder="0" class="talent-times" value="${talent.times || 0}">
                <textarea placeholder="Description" class="talent-description">${talent.description || ''}</textarea>
                <button type="button" onclick="this.parentElement.remove(); showTalentsSaveButton();">Remove</button>
            `;
            container.appendChild(talentRow);
            
            // Add event listeners
            this.addTalentEventListeners(talentRow);
            });
        }
    }

    populateOtherSections() {
        document.getElementById('short-ambition').value = this.character.ambitions.short || '';
        document.getElementById('long-ambition').value = this.character.ambitions.long || '';
        document.getElementById('party-name').value = this.character.party.name || '';
        document.getElementById('party-short').value = this.character.party.short || '';
        document.getElementById('party-long').value = this.character.party.long || '';
        document.getElementById('party-members').value = this.character.party.members || '';
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
            });
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
            const key = id.replace('party-', '').replace('-', '');
            this.character.party[key] = value;
        } else {
            const key = id.replace(/-/g, '');
            this.character[key] = value;
        }
    }

    addAdvancedSkillEventListeners(skillRow) {
        const characteristicSelect = skillRow.querySelector('.skill-char');
        const advancesInput = skillRow.querySelector('.skill-adv');
        const skillNameInput = skillRow.querySelector('.skill-name');
        const totalInput = skillRow.querySelector('.skill-total');
        
        const calculateAdvancedSkillTotal = () => {
            const characteristic = characteristicSelect.value;
            const advances = parseInt(advancesInput.value) || 0;
            const charValue = getCharacteristicValueByName(characteristic);
            totalInput.value = charValue + advances;
        };
        
        const showAdvancedSkillsSaveButton = () => {
            const saveButtons = document.querySelectorAll('.save-button');
            const advancedSkillsSaveButton = Array.from(saveButtons).find(btn => btn.textContent.includes('Advanced Skills'));
            if (advancedSkillsSaveButton) {
                advancedSkillsSaveButton.classList.add('show');
            }
        };
        
        characteristicSelect.addEventListener('change', () => {
            calculateAdvancedSkillTotal();
            showAdvancedSkillsSaveButton();
        });
        
        advancesInput.addEventListener('input', () => {
            calculateAdvancedSkillTotal();
            showAdvancedSkillsSaveButton();
        });
        
        skillNameInput.addEventListener('input', showAdvancedSkillsSaveButton);
        
        // Calculate initial value
        calculateAdvancedSkillTotal();
    }

    saveAdvancedSkills() {
        const advancedSkillRows = document.querySelectorAll('#advanced-skills .skill-row');
        this.character.advancedSkills = [];
        
        advancedSkillRows.forEach(row => {
            const name = row.querySelector('.skill-name').value || '';
            const characteristic = row.querySelector('.skill-char').value || 'WS';
            const advances = parseInt(row.querySelector('.skill-adv').value) || 0;
            
            // Always save the skill, even if empty, to maintain the row
            this.character.advancedSkills.push({
                name: name,
                characteristic: characteristic,
                advances: advances
            });
        });
        
        this.saveCharacter();
        
        // Visual feedback and hide save button
        const saveButtons = document.querySelectorAll('.save-button');
        const advancedSkillsSaveButton = Array.from(saveButtons).find(btn => btn.textContent.includes('Advanced Skills'));
        if (advancedSkillsSaveButton) {
            const originalText = advancedSkillsSaveButton.textContent;
            advancedSkillsSaveButton.textContent = 'Saved!';
            advancedSkillsSaveButton.style.backgroundColor = '#32CD32';
            setTimeout(() => {
                advancedSkillsSaveButton.textContent = originalText;
                advancedSkillsSaveButton.style.backgroundColor = '#228B22';
                advancedSkillsSaveButton.classList.remove('show');
            }, 1000);
        }
        
        console.log('Advanced skills saved:', this.character.advancedSkills);
    }

    addTalentEventListeners(talentRow) {
        const nameInput = talentRow.querySelector('.talent-name');
        const timesInput = talentRow.querySelector('.talent-times');
        const descriptionInput = talentRow.querySelector('.talent-description');
        
        const showTalentsSaveButton = () => {
            const saveButtons = document.querySelectorAll('.save-button');
            const talentsSaveButton = Array.from(saveButtons).find(btn => btn.textContent.includes('Talents'));
            if (talentsSaveButton) {
                talentsSaveButton.classList.add('show');
            }
        };
        
        nameInput.addEventListener('input', showTalentsSaveButton);
        timesInput.addEventListener('input', showTalentsSaveButton);
        descriptionInput.addEventListener('input', showTalentsSaveButton);
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
        
        // Visual feedback and hide save button
        const saveButtons = document.querySelectorAll('.save-button');
        const talentSaveButton = Array.from(saveButtons).find(btn => btn.textContent.includes('Talents'));
        if (talentSaveButton) {
            const originalText = talentSaveButton.textContent;
            talentSaveButton.textContent = 'Saved!';
            talentSaveButton.style.backgroundColor = '#32CD32';
            setTimeout(() => {
                talentSaveButton.textContent = originalText;
                talentSaveButton.style.backgroundColor = '#228B22';
                talentSaveButton.classList.remove('show');
            }, 1000);
        }
        
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
    const talentsList = document.getElementById('talents-list');
    const talentRow = document.createElement('div');
    talentRow.className = 'talent-row';
    talentRow.innerHTML = `
        <input type="text" placeholder="Talent name" class="talent-name">
        <input type="number" placeholder="0" class="talent-times">
        <textarea placeholder="Description" class="talent-description"></textarea>
        <button type="button" onclick="this.parentElement.remove(); showTalentsSaveButton();">Remove</button>
    `;
    talentsList.appendChild(talentRow);
    
    // Add event listeners for showing save button
    window.characterSheet.addTalentEventListeners(talentRow);
}

function addAdvancedSkill() {
    const skillsList = document.getElementById('advanced-skills');
    const skillRow = document.createElement('div');
    skillRow.className = 'skill-row';
    skillRow.innerHTML = `
        <input type="text" placeholder="Skill name" class="skill-name">
        <select class="skill-char">
            <option value="WS">WS</option>
            <option value="BS">BS</option>
            <option value="S">S</option>
            <option value="T">T</option>
            <option value="I">I</option>
            <option value="Ag">Ag</option>
            <option value="Dex">Dex</option>
            <option value="Int">Int</option>
            <option value="WP">WP</option>
            <option value="Fel">Fel</option>
        </select>
        <input type="number" placeholder="0" class="skill-adv" value="0">
        <input type="number" readonly class="skill-total" value="0">
        <button type="button" onclick="this.parentElement.remove(); showAdvancedSkillsSaveButton();">Remove</button>
    `;
    skillsList.appendChild(skillRow);
    
    // Add event listeners for calculation and save button visibility
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

function showAdvancedSkillsSaveButton() {
    const saveButtons = document.querySelectorAll('.save-button');
    const advancedSkillsSaveButton = Array.from(saveButtons).find(btn => btn.textContent.includes('Advanced Skills'));
    if (advancedSkillsSaveButton) {
        advancedSkillsSaveButton.classList.add('show');
    }
}

function showTalentsSaveButton() {
    const saveButtons = document.querySelectorAll('.save-button');
    const talentsSaveButton = Array.from(saveButtons).find(btn => btn.textContent.includes('Talents'));
    if (talentsSaveButton) {
        talentsSaveButton.classList.add('show');
    }
}