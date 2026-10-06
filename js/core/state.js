/* =========================================================
   REALM IDLE CORE - UNIFIED SINGLE ROOT GAME STATE
========================================================= */

window.gameState = {
    lastSaveTime: Date.now(),
    offlineReport: null,

    player: {
        name: "Hero",
        gender: "male",
        hasCompletedOnboarding: false,
        heroClass: "knight",
        level: 1,
        xp: 0,
        xpToNext: 100,
        gold: 1240,
        power: 42,
        defense: 10,
        critChance: 0.10,
        critDmg: 1.5,
        dodge: 0.05,
        lifesteal: 0.0,
        hp: 100,
        maxHp: 100,
        equipment: {
            weapon: null,
            armor: null,
            trinket: null,
            ring: null,
            crown: null
        },
        holyShield: 0,
        darknessLevel: 0,
        demonWarningAccepted: false,
        guardianAngelUsed: false,
        holyRetributionCharged: false,
        equilibriumForged: false,
        upgrades: {
            attack: 0,
            defense: 0,
            hp: 0,
            crit: 0,
            income: 0,
            life: 0
        },
        inventory: [],
        materials: {
            ironOre: 15,
            wood: 15,
            crystal: 5,
            dragonScale: 0,
            shadowEssence: 0
        },
        potions: {
            potion_minor: 5,
            potion_major: 1,
            potion_full: 0,
            potion_stamina: 2,
            potion_elixir_rest: 0,
            elixir_fury: 1,
            elixir_iron: 1,
            elixir_shadow: 0,
            elixir_titans: 0
        },
        autoPotion: true,
        fatigue: 0,
        skills: {
            activeSkillId: null,
            activeCooldown: 0,
            autoCast: true,
            levels: {},
            unlocked: []
        },
        activeBuffs: [],
        classRanks: { knight: 1, rogue: 1, mage: 1, paladin: 1 },
        moonlitVale3Cleared: false,
        unlockedRecipes: [],
        unlockedBlueprints: [],
        lastPassiveGoldAt: null
    },

    world: {
        currentMapId: "moonlit_vale",
        currentWeatherId: "clear",
        worldTime: 12,
        activeEventId: null,
        activeEventTimer: 0,
        activeScenarioId: null,
        activeScenarioTimer: 0,
        unlockedMaps: ["moonlit_vale"],
        mapDepths: { moonlit_vale: 1 },
        unlockedDepths: { moonlit_vale: 1 }
    },

    combat: {
        currentMob: null,
        autoFight: false,
        stage: 1,
        maxStages: 10,
        inTemple: false,
        isDestabilized: false,
        destabilizedBossSpawned: false
    },

    kingdom: {
        castle: 1,
        treasury: 1,
        blacksmith: 1,
        mageTower: 1,
        barracks: 1
    },

    quests: {
        active: [],
        completedCount: 0
    },

    journal: {
        discoveredMobs: {},
        discoveredItems: {}
    },

    costs: {
        damageCost: 120,
        incomeCost: 250,
        realmCost: 1000,
        goldPerSecond: 3
    },

    templeDonation: {
        enabled: true,
        cost: 50
    },

    guildIncome: {
        enabled: true,
        goldPerSecond: 3
    },

    lastTempleDonation: 0,
    logs: [],

    listeners: [],

    subscribe(fn) {
        this.listeners.push(fn);
    },

    notify() {
        this.listeners.forEach(fn => fn(this));
    },

    /* =========================
       COMPATIBILITY ACCESSORS
    ========================= */
    get currentMapId() { return this.world.currentMapId; },
    set currentMapId(val) { this.world.currentMapId = val; },

    get currentWeatherId() { return this.world.currentWeatherId; },
    set currentWeatherId(val) { this.world.currentWeatherId = val; },

    get worldTime() { return this.world.worldTime; },
    set worldTime(val) { this.world.worldTime = val; },

    get activeEventId() { return this.world.activeEventId; },
    set activeEventId(val) { this.world.activeEventId = val; },

    get activeEventTimer() { return this.world.activeEventTimer; },
    set activeEventTimer(val) { this.world.activeEventTimer = val; },

    get activeScenarioId() { return this.world.activeScenarioId; },
    set activeScenarioId(val) { this.world.activeScenarioId = val; },

    get activeScenarioTimer() { return this.world.activeScenarioTimer; },
    set activeScenarioTimer(val) { this.world.activeScenarioTimer = val; },

    /* =========================
       HELPERS & STAT FORMULAS
    ========================= */

    getItemEffectiveStats(item) {
        if (!item || !item.stats) return {};
        const upgLevel = item.upgradeLevel || 0;
        const mult = 1 + upgLevel * 0.15; // +15% per upgrade level
        const res = {};
        for (const [key, val] of Object.entries(item.stats)) {
            if (typeof val === "number") {
                res[key] = key.toLowerCase().includes("chance") || key.toLowerCase().includes("mult") || key.toLowerCase().includes("lifesteal") || key.toLowerCase().includes("dodge")
                    ? +(val * (1 + upgLevel * 0.08)).toFixed(3)
                    : Math.round(val * mult);
            }
        }
        return res;
    },

    getClassPromotionsBonus(statKey) {
        let total = 0;
        const heroClass = this.player.heroClass;
        const currentRank = (this.player.classRanks && this.player.classRanks[heroClass]) || 1;
        const heroDef = window.HeroesData ? window.HeroesData[heroClass] : null;
        if (!heroDef || !heroDef.promotions || currentRank <= 1) return 0;

        heroDef.promotions.forEach(p => {
            if (p.rank <= currentRank) {
                const b = p.bonus || p.bonusStats;
                if (!b) return;
                if (b[statKey] !== undefined) total += b[statKey];
                else if (statKey === "attack" && b.atk !== undefined) total += b.atk;
                else if (statKey === "defense" && b.def !== undefined) total += b.def;
                else if (statKey === "maxHp" && b.hp !== undefined) total += b.hp;
                else if (statKey === "critChance" && b.crit !== undefined) total += (b.crit > 1 ? b.crit / 100 : b.crit);
            }
        });
        return total;
    },

    getClassPassivesBonus(statKey) {
        let total = 0;
        const heroClass = this.player.heroClass;
        const heroLevel = this.player.level || 1;
        const heroDef = window.HeroesData ? window.HeroesData[heroClass] : null;
        if (!heroDef || !heroDef.passives) return 0;

        heroDef.passives.forEach(p => {
            if (p.reqLevel <= heroLevel) {
                const b = p.bonus || {};
                if (b[statKey] !== undefined) total += b[statKey];
                else if (statKey === "attack" && b.atk !== undefined) total += b.atk;
                else if (statKey === "defense" && b.def !== undefined) total += b.def;
                else if (statKey === "maxHp" && b.hp !== undefined) total += b.hp;
                else if (statKey === "critChance" && b.crit !== undefined) total += (b.crit > 1 ? b.crit / 100 : b.crit);
                else if (statKey === "dodge" && b.eva !== undefined) total += b.eva;
                else if (statKey === "lifesteal" && b.vamp !== undefined) total += b.vamp;
            }
        });
        return total;
    },

    isKingdomDomainUnlocked() {
        const lvlMet = (this.player.level || 1) >= 5;
        const bossMet = !!this.player.moonlitVale3Cleared ||
                        (this.world.unlockedMaps && this.world.unlockedMaps.includes("ashen_wastes")) ||
                        (this.getMapMaxUnlockedDepth && this.getMapMaxUnlockedDepth("moonlit_vale") > 3);
        return lvlMet && bossMet;
    },

    getStatBreakdown(statKey) {
        let base = 0;
        const gearItems = [];
        let passives = 0;
        let promotions = 0;
        let upgrades = 0;
        let total = 0;
        let isPct = false;

        if (statKey === "attack") {
            base = this.player.power;
            if (this.player.upgrades && this.player.upgrades.attack) {
                upgrades = this.player.upgrades.attack * 8;
            }
            promotions = this.getClassPromotionsBonus("attack");
            passives = this.getClassPassivesBonus("attack");
            Object.entries(this.player.equipment).forEach(([slot, item]) => {
                if (item) {
                    const eff = this.getItemEffectiveStats(item);
                    const val = eff.attack || eff.atk || 0;
                    if (val > 0) {
                        gearItems.push({
                            slot: slot.toUpperCase(),
                            name: item.name || slot,
                            value: Math.round(val)
                        });
                    }
                }
            });
            total = this.getEffectiveAttack();
        } else if (statKey === "defense") {
            base = this.player.defense;
            if (this.player.upgrades && this.player.upgrades.defense) {
                upgrades = this.player.upgrades.defense * 4;
            }
            promotions = this.getClassPromotionsBonus("defense");
            passives = this.getClassPassivesBonus("defense");
            Object.entries(this.player.equipment).forEach(([slot, item]) => {
                if (item) {
                    const eff = this.getItemEffectiveStats(item);
                    const val = eff.defense || eff.def || 0;
                    if (val > 0) {
                        gearItems.push({
                            slot: slot.toUpperCase(),
                            name: item.name || slot,
                            value: Math.round(val)
                        });
                    }
                }
            });
            total = this.getEffectiveDefense();
        } else if (statKey === "maxHp") {
            base = this.player.maxHp;
            if (this.player.upgrades && this.player.upgrades.hp) {
                upgrades = this.player.upgrades.hp * 30;
            }
            promotions = this.getClassPromotionsBonus("maxHp");
            passives = this.getClassPassivesBonus("maxHp");
            Object.entries(this.player.equipment).forEach(([slot, item]) => {
                if (item) {
                    const eff = this.getItemEffectiveStats(item);
                    const val = eff.hp || 0;
                    if (val > 0) {
                        gearItems.push({
                            slot: slot.toUpperCase(),
                            name: item.name || slot,
                            value: Math.round(val)
                        });
                    }
                }
            });
            total = this.getEffectiveMaxHp();
        } else if (statKey === "critChance") {
            isPct = true;
            base = Math.round(this.player.critChance * 100);
            if (this.player.upgrades && this.player.upgrades.crit) {
                upgrades = Math.round(this.player.upgrades.crit * 1);
            }
            promotions = Math.round(this.getClassPromotionsBonus("critChance") * 100);
            passives = Math.round(this.getClassPassivesBonus("critChance") * 100);
            Object.entries(this.player.equipment).forEach(([slot, item]) => {
                if (item) {
                    const eff = this.getItemEffectiveStats(item);
                    const raw = eff.critChance || (eff.crit ? (eff.crit > 1 ? eff.crit / 100 : eff.crit) : 0);
                    if (raw > 0) {
                        gearItems.push({
                            slot: slot.toUpperCase(),
                            name: item.name || slot,
                            value: Math.round(raw * 100)
                        });
                    }
                }
            });
            total = Math.round(this.getEffectiveCritChance() * 100);
        } else if (statKey === "dodge") {
            isPct = true;
            base = Math.round(this.player.dodge * 100);
            if (this.player.upgrades && this.player.upgrades.defense) {
                upgrades = Math.round(this.player.upgrades.defense * 0.2);
            }
            promotions = Math.round(this.getClassPromotionsBonus("dodge") * 100);
            passives = Math.round(this.getClassPassivesBonus("dodge") * 100);
            Object.entries(this.player.equipment).forEach(([slot, item]) => {
                if (item) {
                    const eff = this.getItemEffectiveStats(item);
                    const raw = eff.dodge || eff.eva || 0;
                    if (raw > 0) {
                        gearItems.push({
                            slot: slot.toUpperCase(),
                            name: item.name || slot,
                            value: Math.round(raw * 100)
                        });
                    }
                }
            });
            total = Math.round(this.getEffectiveDodge() * 100);
        } else if (statKey === "lifesteal") {
            isPct = true;
            base = Math.round(this.player.lifesteal * 100);
            if (this.player.upgrades && this.player.upgrades.life) {
                upgrades = Math.round(this.player.upgrades.life * 1);
            }
            promotions = Math.round(this.getClassPromotionsBonus("lifesteal") * 100);
            passives = Math.round(this.getClassPassivesBonus("lifesteal") * 100);
            Object.entries(this.player.equipment).forEach(([slot, item]) => {
                if (item) {
                    const eff = this.getItemEffectiveStats(item);
                    const raw = eff.lifesteal || eff.vamp || 0;
                    if (raw > 0) {
                        gearItems.push({
                            slot: slot.toUpperCase(),
                            name: item.name || slot,
                            value: Math.round(raw * 100)
                        });
                    }
                }
            });
            total = Math.round(this.getEffectiveLifesteal() * 100);
        }

        // Build detailed tooltip detailing where every point comes from
        const parts = [`Base Class: ${base}${isPct ? '%' : ''}`];
        gearItems.forEach(g => {
            parts.push(`${g.name} [${g.slot}]: +${g.value}${isPct ? '%' : ''}`);
        });
        if (passives > 0) parts.push(`Divine Passives: +${passives}${isPct ? '%' : ''}`);
        if (promotions > 0) parts.push(`Rank Mastery: +${promotions}${isPct ? '%' : ''}`);
        if (upgrades > 0) parts.push(`Upgrades: +${upgrades}${isPct ? '%' : ''}`);
        parts.push(`Total: ${total}${isPct ? '%' : ''}`);

        const tooltip = parts.join("  |  ");

        // Format separated display string: e.g. 258+12+12
        let displayStr = `${base}${isPct ? '%' : ''}`;
        if (gearItems.length > 0 || passives > 0 || promotions > 0 || upgrades > 0) {
            const extraAdditions = [];
            gearItems.forEach(g => extraAdditions.push(`${g.value}${isPct ? '%' : ''}`));
            const otherBonus = passives + promotions + upgrades;
            if (otherBonus > 0) {
                extraAdditions.push(`${otherBonus}${isPct ? '%' : ''}`);
            }
            displayStr = `${base}${isPct ? '%' : ''} + ${extraAdditions.join(" + ")} (= ${total}${isPct ? '%' : ''})`;
        }

        return {
            base,
            gearItems,
            passives,
            promotions,
            upgrades,
            total,
            isPct,
            tooltip,
            displayStr
        };
    },

    getEffectiveAttack() {
        let att = this.player.power;

        // Permanent Upgrades (Whetstone Rites: +8 Atk per lv)
        if (this.player.upgrades && this.player.upgrades.attack) {
            att += this.player.upgrades.attack * 8;
        }

        // Class Promotion Mastery Bonus
        att += this.getClassPromotionsBonus("attack");

        // Class Divine Passives Bonus ("Blessed by the Gods")
        att += this.getClassPassivesBonus("attack");

        // Add equipment attack (with upgrade scaling)
        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.attack) att += eff.attack;
                if (eff.atk) att += eff.atk;
            }
        });

        // Add Kingdom Barracks multiplier (+5% per level)
        att *= (1 + (this.kingdom.barracks - 1) * 0.05);

        // Add Blacksmith multiplier (+5% per level)
        att *= (1 + (this.kingdom.blacksmith - 1) * 0.05);

        // Active buffs
        this.player.activeBuffs.forEach(b => {
            if (b.stat === "attack") att += b.bonus;
            else if (b.stat === "attackMult") att *= (1 + b.bonus);
        });

        // Break-the-rules crown scaling
        const crown = this.player.equipment && this.player.equipment.crown;
        const isDemon = crown && crown.id === "demon_crown";
        const isEquilibrium = (crown && crown.id === "equilibrium_crown") || (this.combat && this.combat.isDestabilized);
        if (isDemon) {
            const effMax = (this.player.maxHp || 100);
            const missingRatio = Math.max(0, 1 - (this.player.hp / effMax));
            // Low HP = More Power (up to +150% bonus damage)
            att *= (1 + missingRatio * 1.5);

            // Demon's Last Stand: insane ATK surge when HP <= 25%
            if ((this.player.hp / effMax) <= 0.25) {
                att *= 1.5;
            }
        } else if (isEquilibrium) {
            att *= 1.25;
        }

        return Math.floor(att);
    },

    getEffectiveDefense() {
        let def = this.player.defense;

        // Permanent Upgrades (Armor Plating: +4 Def per lv)
        if (this.player.upgrades && this.player.upgrades.defense) {
            def += this.player.upgrades.defense * 4;
        }

        // Class Promotion Mastery Bonus
        def += this.getClassPromotionsBonus("defense");

        // Class Divine Passives Bonus ("Blessed by the Gods")
        def += this.getClassPassivesBonus("defense");

        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.defense) def += eff.defense;
                if (eff.def) def += eff.def;
            }
        });

        this.player.activeBuffs.forEach(b => {
            if (b.stat === "defense") def += b.bonus;
        });

        return Math.floor(def);
    },

    getEffectiveCritChance() {
        let crit = this.player.critChance;

        // Permanent Upgrades (Precision Drills: +1% Crit per lv)
        if (this.player.upgrades && this.player.upgrades.crit) {
            crit += this.player.upgrades.crit * 0.01;
        }

        // Class Promotion Mastery Bonus
        crit += this.getClassPromotionsBonus("critChance");

        // Class Divine Passives Bonus ("Blessed by the Gods")
        crit += this.getClassPassivesBonus("critChance");

        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.critChance) crit += eff.critChance;
                if (eff.crit) crit += (eff.crit > 1 ? eff.crit / 100 : eff.crit);
            }
        });
        // Mage Tower (+2% crit per level)
        crit += (this.kingdom.mageTower - 1) * 0.02;

        this.player.activeBuffs.forEach(b => {
            if (b.stat === "critChance") crit += b.bonus;
        });

        // Demon's Last Stand: 100% Guaranteed Crit
        const crown = this.player.equipment && this.player.equipment.crown;
        const isDemon = crown && crown.id === "demon_crown";
        if (isDemon) {
            const effMax = (this.player.maxHp || 100);
            if ((this.player.hp / effMax) <= 0.25) {
                return 1.0;
            }
        }

        return Math.min(0.95, crit);
    },

    getEffectiveCritDmg() {
        let mult = this.player.critDmg || 1.5;
        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.critDmg) mult += eff.critDmg;
            }
        });
        if (this.combat && this.combat.isDestabilized && Math.random() < 0.35) {
            mult *= (3.0 + Math.random() * 3.0); // Reality-shattering Paradox Crits!
        }
        return mult;
    },

    getEffectiveDodge() {
        let dodge = this.player.dodge;

        // Permanent Upgrades (Armor Plating: +0.2% Dodge per lv)
        if (this.player.upgrades && this.player.upgrades.defense) {
            dodge += this.player.upgrades.defense * 0.002;
        }

        // Class Promotion Mastery Bonus
        dodge += this.getClassPromotionsBonus("dodge");

        // Class Divine Passives Bonus ("Blessed by the Gods")
        dodge += this.getClassPassivesBonus("dodge");

        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.dodge) dodge += eff.dodge;
            }
        });

        this.player.activeBuffs.forEach(b => {
            if (b.stat === "dodge") dodge += b.bonus;
        });

        return Math.min(0.75, dodge);
    },

    getEffectiveLifesteal() {
        let ls = this.player.lifesteal;

        // Permanent Upgrades (Vampiric Rune: +1% Lifesteal per lv)
        if (this.player.upgrades && this.player.upgrades.life) {
            ls += this.player.upgrades.life * 0.01;
        }

        // Class Promotion Mastery Bonus
        ls += this.getClassPromotionsBonus("lifesteal");

        // Class Divine Passives Bonus ("Blessed by the Gods")
        ls += this.getClassPassivesBonus("lifesteal");

        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.lifesteal) ls += eff.lifesteal;
            }
        });
        return Math.min(0.50, ls);
    },

    getEffectiveMaxHp() {
        let hp = this.player.maxHp;

        // Permanent Upgrades (Vitality Training: +30 Max HP per lv)
        if (this.player.upgrades && this.player.upgrades.hp) {
            hp += this.player.upgrades.hp * 30;
        }

        // Class Promotion Mastery Bonus
        hp += this.getClassPromotionsBonus("maxHp");

        // Class Divine Passives Bonus ("Blessed by the Gods")
        hp += this.getClassPassivesBonus("maxHp");

        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.hp) hp += eff.hp;
            }
        });

        return Math.floor(hp);
    },

    /* =========================
       MAP DEPTH / VERSION HELPERS
    ========================= */
    getMapCurrentDepth(mapId = this.world.currentMapId) {
        if (!this.world.mapDepths) this.world.mapDepths = {};
        return this.world.mapDepths[mapId] || 1;
    },

    getMapMaxUnlockedDepth(mapId = this.world.currentMapId) {
        if (!this.world.unlockedDepths) this.world.unlockedDepths = {};
        return this.world.unlockedDepths[mapId] || 1;
    },

    getDepthTier(mapId = this.world.currentMapId, depth = null) {
        const d = depth || this.getMapCurrentDepth(mapId);
        const map = window.MapsData ? window.MapsData[mapId] : null;
        if (map && map.depthTiers && map.depthTiers[d - 1]) {
            return map.depthTiers[d - 1];
        }
        const romans = ["I", "II", "III", "IV", "V"];
        const subNames = ["Fringe", "Deep Thicket", "Abyssal Heart", "Sanctum Depth", "Core"];
        return {
            depth: d,
            roman: romans[d - 1] || `${d}`,
            subtitle: subNames[d - 1] || `Depth ${d}`,
            statMult: 1 + (d - 1) * 0.45,
            goldMult: 1 + (d - 1) * 0.50,
            xpMult: 1 + (d - 1) * 0.50
        };
    },

    getCurrentDepthMultiplier(mapId = this.world.currentMapId) {
        const tier = this.getDepthTier(mapId);
        return {
            statMult: tier.statMult || 1.0,
            goldMult: tier.goldMult || 1.0,
            xpMult: tier.xpMult || 1.0
        };
    },

    setMapDepth(mapId, depth) {
        const map = window.MapsData ? window.MapsData[mapId] : null;
        if (!map) return;
        const maxUnlocked = this.getMapMaxUnlockedDepth(mapId);
        const targetDepth = Math.max(1, Math.min(depth, maxUnlocked));

        if (!this.world.mapDepths) this.world.mapDepths = {};
        this.world.mapDepths[mapId] = targetDepth;
        this.combat.stage = 1;

        const tier = this.getDepthTier(mapId, targetDepth);
        if (this.addLog) {
            this.addLog(`🌲 Delved into ${map.name} ${tier.roman} (${tier.subtitle})!`, "travel", "🌲");
        }

        if (window.SpawningManager) window.SpawningManager.spawnNextMob();
        this.notify();
    },

    unlockNextDepth(mapId = this.world.currentMapId) {
        const map = window.MapsData ? window.MapsData[mapId] : null;
        const maxLimit = (map && map.maxDepth) || 3;
        const currentUnlocked = this.getMapMaxUnlockedDepth(mapId);

        if (currentUnlocked < maxLimit) {
            const next = currentUnlocked + 1;
            if (!this.world.unlockedDepths) this.world.unlockedDepths = {};
            this.world.unlockedDepths[mapId] = next;
            this.save();
            return next;
        }
        return null;
    },

    /* =========================
       FATIGUE SYSTEM
    ========================= */
    getFatigue() {
        return Math.max(0, Math.min(100, Math.round(this.player.fatigue || 0)));
    },

    addFatigue(amount) {
        this.player.fatigue = Math.max(0, Math.min(100, (this.player.fatigue || 0) + amount));
        this.notify();
    },

    reduceFatigue(amount) {
        this.player.fatigue = Math.max(0, Math.min(100, (this.player.fatigue || 0) - amount));
        this.notify();
    },

    getFatigueMultiplier() {
        const f = this.getFatigue();
        if (f < 50) return 1.0;
        if (f < 80) return 0.85; // -15% Attack
        if (f < 100) return 0.65; // -35% Attack
        return 0.40; // Total exhaustion (-60% Attack)
    },

    getFatigueStatus() {
        const f = this.getFatigue();
        if (f < 50) {
            return {
                tier: "rested",
                label: "Well Rested",
                icon: "⚡",
                color: "#4ade80",
                penaltyText: "Peak Battle Condition (100% Effectiveness)"
            };
        }
        if (f < 80) {
            return {
                tier: "tired",
                label: "Fatigued",
                icon: "⚠️",
                color: "#f2c94c",
                penaltyText: "-15% Attack Power (Consider resting or drinking Stamina Tonic)"
            };
        }
        if (f < 100) {
            return {
                tier: "exhausted",
                label: "Exhausted",
                icon: "🔥",
                color: "#ff8a9b",
                penaltyText: "-35% Attack Power · Enemies strike +20% harder"
            };
        }
        return {
            tier: "collapsed",
            label: "Over-Exhausted",
            icon: "💀",
            color: "#ff4d6d",
            penaltyText: "CRITICAL: -60% Attack Power! Rest at Temple immediately!"
        };
    },

    /* =========================================================
       PASSIVE INCOME: ADD 1 GOLD TO PLAYER AFTER EVERY 10 MIN ONLY
    ========================================================= */
    tickPassiveIncome() {
        const now = Date.now();
        if (!this.player.lastPassiveGoldAt) {
            this.player.lastPassiveGoldAt = now;
            return;
        }
        const speed = (window.devMode && window.devMode.enabled) ? (window.devMode.gameSpeed || 1) : 1;
        const tenMinutesMs = (10 * 60 * 1000) / (speed > 0 ? speed : 1);
        if (now - this.player.lastPassiveGoldAt >= tenMinutesMs) {
            this.addGold(1);
            this.player.lastPassiveGoldAt = now;
        }
    },

    triggerPassiveIncomePayout() {
        this.addGold(1);
        this.player.lastPassiveGoldAt = Date.now();
        return 1;
    },

    /* =========================
       SKILL UPGRADE & LOADOUT ENGINE
    ========================= */
    getActiveSkillId() {
        if (this.player.skills && this.player.skills.activeSkillId) {
            return this.player.skills.activeSkillId;
        }
        const heroDef = window.HeroesData ? window.HeroesData[this.player.heroClass] : null;
        return (heroDef && heroDef.skill && heroDef.skill.id) || "shield_slam";
    },

    getSkillDefinition(skillId) {
        if (window.AllSkillsData && window.AllSkillsData[skillId]) {
            return window.AllSkillsData[skillId];
        }
        const heroDef = window.HeroesData ? window.HeroesData[this.player.heroClass] : null;
        if (heroDef && heroDef.skillsPool) {
            const found = heroDef.skillsPool.find(s => s.id === skillId);
            if (found) return found;
        }
        return (heroDef && heroDef.skill) || null;
    },

    getSkillLevel(skillId) {
        if (!this.player.skills) return 1;
        if (!this.player.skills.levels) this.player.skills.levels = {};
        return this.player.skills.levels[skillId] || 1;
    },

    getSkillEffectiveStats(skillId) {
        const def = this.getSkillDefinition(skillId);
        if (!def) return null;
        const level = this.getSkillLevel(skillId);
        const damageMult = +( (def.damageMult || 2.0) + (level - 1) * 0.30 ).toFixed(2);
        const cooldown = Math.max(3, +( (def.cooldown || 8) - (level - 1) * 0.5 ).toFixed(1));
        const healPct = def.healPct ? +( def.healPct + (level - 1) * 0.02 ).toFixed(2) : 0;
        
        let buff = null;
        if (def.buff) {
            buff = {
                ...def.buff,
                bonus: def.buff.bonus ? Math.round(def.buff.bonus * (1 + (level - 1) * 0.20)) : def.buff.bonus,
                duration: def.buff.duration || 4
            };
        }

        return {
            ...def,
            level,
            damageMult,
            cooldown,
            healPct,
            buff
        };
    },

    getActiveSkill() {
        const skillId = this.getActiveSkillId();
        return this.getSkillEffectiveStats(skillId);
    },

    getSkillUpgradeCost(skillId) {
        const level = this.getSkillLevel(skillId);
        const gold = Math.floor(180 * Math.pow(1.5, level - 1));
        let materials = { ironOre: 4 + (level - 1) * 3 };
        if (level >= 3) {
            materials.crystal = 2 + (level - 3) * 2;
        }
        if (level >= 5) {
            materials.dragonScale = 1 + (level - 5);
        }
        return { gold, materials, nextLevel: level + 1 };
    },

    canUpgradeSkill(skillId) {
        const cost = this.getSkillUpgradeCost(skillId);
        if (!this.canAfford(cost.gold)) return { can: false, reason: `Need ${cost.gold.toLocaleString()} gold!` };
        for (const [mat, need] of Object.entries(cost.materials)) {
            const have = (this.player.materials && this.player.materials[mat]) || 0;
            if (have < need) return { can: false, reason: `Missing ${need - have}x ${mat}!` };
        }
        return { can: true, cost };
    },

    upgradeSkill(skillId) {
        const check = this.canUpgradeSkill(skillId);
        if (!check.can) {
            if (typeof alert !== "undefined") alert(check.reason);
            return false;
        }

        const cost = check.cost;
        this.spendGold(cost.gold);
        for (const [mat, need] of Object.entries(cost.materials)) {
            this.player.materials[mat] -= need;
        }

        if (!this.player.skills.levels) this.player.skills.levels = {};
        this.player.skills.levels[skillId] = cost.nextLevel;

        const skillDef = this.getSkillDefinition(skillId);
        const skillName = skillDef ? skillDef.name : skillId;
        if (this.addLog) {
            this.addLog(`⚡ SKILL UPGRADED! [${skillName}] reached Rank ${cost.nextLevel}!`, "level", "⚡");
        }
        if (window.CombatManager) {
            window.CombatManager.showDamagePopup(`⚡ ${skillName} Lv.${cost.nextLevel}!`, false, false, "crit");
        }

        this.save();
        this.notify();
        return true;
    },

    equipSkill(skillId) {
        const skillDef = this.getSkillDefinition(skillId);
        if (!skillDef) return false;
        this.player.skills.activeSkillId = skillId;
        this.player.skills.activeCooldown = 0;
        if (this.addLog) {
            this.addLog(`Equipped active special skill: [${skillDef.name}].`, "combat", skillDef.icon || "⚔️");
        }
        this.save();
        this.notify();
        return true;
    },

    isSkillUnlocked(skillId) {
        const heroDef = window.HeroesData ? window.HeroesData[this.player.heroClass] : null;
        if (heroDef && heroDef.skill && heroDef.skill.id === skillId) return true;
        if (heroDef && heroDef.skillsPool) {
            const match = heroDef.skillsPool.find(s => s.id === skillId);
            if (match && match.isDefault) return true;
        }
        return (this.player.skills && Array.isArray(this.player.skills.unlocked) && this.player.skills.unlocked.includes(skillId));
    },

    isRecipeUnlocked(recipeId) {
        const recipe = (window.AlchemyRecipes || []).find(r => r.id === recipeId);
        if (!recipe || !recipe.requiresRecipe) return true;
        return (this.player.unlockedRecipes && this.player.unlockedRecipes.includes(recipeId));
    },

    isBlueprintUnlocked(blueprintId) {
        if (!blueprintId) return true;
        if (!this.player.unlockedBlueprints || this.player.unlockedBlueprints.length === 0) return false;
        if (this.player.unlockedBlueprints.includes(blueprintId)) return true;
        // Check if matching substring or alias
        return this.player.unlockedBlueprints.some(b => b.includes(blueprintId) || blueprintId.includes(b));
    },

    /* =========================
       CLASS PROMOTION & ASCENSION
    ========================= */
    getClassRank(classId = this.player.heroClass) {
        if (!this.player.classRanks) this.player.classRanks = {};
        return this.player.classRanks[classId] || 1;
    },

    getNextClassPromotion(classId = this.player.heroClass) {
        const rank = this.getClassRank(classId);
        const heroDef = window.HeroesData ? window.HeroesData[classId] : null;
        const promos = (heroDef && heroDef.promotions && heroDef.promotions.length > 0)
            ? heroDef.promotions
            : ((window.DefaultHeroPromotions && window.DefaultHeroPromotions[classId]) || null);
        if (!promos) return null;
        return promos.find(p => p.rank === rank + 1) || null;
    },

    canPromoteClass(classId = this.player.heroClass) {
        const promo = this.getNextClassPromotion(classId);
        if (!promo) return { can: false, reason: "Max Rank already attained!" };

        if ((this.player.level || 1) < promo.reqLevel) {
            return { can: false, reason: `Requires Hero Level ${promo.reqLevel}!` };
        }

        if (promo.goldCost && !this.canAfford(promo.goldCost)) {
            return { can: false, reason: `Requires ${promo.goldCost.toLocaleString()} gold!` };
        }

        if (promo.materials) {
            for (const [mat, qty] of Object.entries(promo.materials)) {
                const have = (this.player.materials && this.player.materials[mat]) || 0;
                if (have < qty) {
                    return { can: false, reason: `Need ${qty}x ${mat} (Have ${have})!` };
                }
            }
        }

        return { can: true, promo };
    },

    promoteClass(classId = this.player.heroClass) {
        const check = this.canPromoteClass(classId);
        if (!check.can) {
            alert(check.reason);
            return false;
        }

        const promo = check.promo;
        if (promo.goldCost) this.spendGold(promo.goldCost);

        if (promo.materials) {
            for (const [mat, qty] of Object.entries(promo.materials)) {
                this.player.materials[mat] -= qty;
            }
        }

        if (!this.player.classRanks) this.player.classRanks = {};
        this.player.classRanks[classId] = promo.rank;

        const heroDef = window.HeroesData ? window.HeroesData[classId] : { name: "Hero" };
        if (this.addLog) {
            this.addLog(`⭐ VOCATION ASCENDED! ${heroDef.name} promoted to Rank ${promo.rank} [${promo.title}]! (${promo.description})`, "level", "⭐");
        }

        if (window.CombatManager) {
            window.CombatManager.showDamagePopup(`⭐ PROMOTED: ${promo.title}!`, false, false, "crit");
        }

        this.save();
        this.notify();
        return true;
    },

    addGold(amount) {
        const devMult = (window.devMode && window.devMode.enabled) ? window.devMode.goldMultiplier : 1;
        const weather = window.WeatherData ? window.WeatherData[this.world.currentWeatherId] : null;
        const weatherMult = weather ? weather.goldMult : 1;

        let eventMult = 1;
        if (this.world.activeEventId && window.EventsData && window.EventsData[this.world.activeEventId]) {
            eventMult *= window.EventsData[this.world.activeEventId].goldMult;
        }
        if (this.world.activeScenarioId && window.ScenariosData && window.ScenariosData[this.world.activeScenarioId]) {
            eventMult *= window.ScenariosData[this.world.activeScenarioId].modifiers.goldMult;
        }

        // Equipment Gold Bonus (e.g. Ring of Fortune)
        let gearGoldMult = 1;
        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.goldMult) gearGoldMult += eff.goldMult;
            }
        });

        // Kingdom Treasury Bonus (+10% per level)
        const treasuryMult = 1 + (this.kingdom.treasury - 1) * 0.10;

        const totalGold = amount * devMult * weatherMult * eventMult * treasuryMult * gearGoldMult;
        this.player.gold += totalGold;
        this.notify();
    },

    spendGold(cost) {
        if (window.devMode && window.devMode.enabled && window.devMode.infiniteGold) return;
        this.player.gold = Math.max(0, this.player.gold - cost);
        this.notify();
    },

    canAfford(cost) {
        if (window.devMode && window.devMode.enabled && window.devMode.infiniteGold) return true;
        return this.player.gold >= cost;
    },

    addXp(amount) {
        const weather = window.WeatherData ? window.WeatherData[this.world.currentWeatherId] : null;
        const weatherMult = weather ? weather.xpMult : 1;

        let eventMult = 1;
        if (this.world.activeEventId && window.EventsData && window.EventsData[this.world.activeEventId]) {
            eventMult *= window.EventsData[this.world.activeEventId].xpMult;
        }
        if (this.world.activeScenarioId && window.ScenariosData && window.ScenariosData[this.world.activeScenarioId]) {
            eventMult *= window.ScenariosData[this.world.activeScenarioId].modifiers.xpMult;
        }

        const totalXp = amount * weatherMult * eventMult;
        this.player.xp += Math.floor(totalXp);

        while (this.player.xp >= this.player.xpToNext) {
            this.player.xp -= this.player.xpToNext;
            this.player.level++;
            this.player.power += 6;
            this.player.maxHp += 25;
            this.player.hp = this.getEffectiveMaxHp();
            this.player.xpToNext = Math.floor(this.player.xpToNext * 1.4);

            if (window.devMode && typeof window.devMode.logToConsole === "function") {
                window.devMode.logToConsole(`🌟 LEVEL UP! You reached Level ${this.player.level}! (+6 Power, +25 Max HP)`, "success");
            }
            this.addLog(`⭐ LEVEL UP! Your hero reached Level ${this.player.level}! (+6 Power, +25 Max HP)`, "level", "⭐");

            // Check divine passives unlocked at this new level
            const heroDef = window.HeroesData ? window.HeroesData[this.player.heroClass] : null;
            if (heroDef && heroDef.passives) {
                const newPassives = heroDef.passives.filter(p => p.reqLevel === this.player.level);
                newPassives.forEach(p => {
                    this.addLog(`✨ BLESSING OF THE GODS! ${p.lore}`, "blessing", "✨");
                    if (window.CombatManager) {
                        window.CombatManager.showDamagePopup(`✨ Blessed: ${p.name}!`, false, false, "blessing");
                    }
                });
            }
        }
        this.notify();
    },

    setHeroClass(classId) {
        const heroDef = window.HeroesData[classId];
        if (!heroDef) return;

        this.player.heroClass = classId;
        this.player.power = heroDef.baseAttack;
        this.player.defense = heroDef.baseDefense;
        this.player.critChance = heroDef.baseCritChance;
        this.player.critDmg = heroDef.baseCritDmg;
        this.player.dodge = heroDef.baseDodge;
        this.player.lifesteal = heroDef.baseLifesteal;
        this.player.skills.activeCooldown = 0;
        this.addLog(`🛡️ Switched class to ${heroDef.name}!`, "class", "🛡️");
        this.notify();
    },

    completeOnboarding(name, gender, heroClass) {
        this.player.name = name || "Hero";
        this.player.gender = gender || "male";
        this.player.hasCompletedOnboarding = true;
        this.player.level = 1;
        this.player.xp = 0;
        this.player.xpToNext = 100;
        this.setHeroClass(heroClass || "knight");

        // Starter supplies
        this.player.gold = 100;
        this.player.potions = {
            potion_minor: 5,
            potion_major: 0,
            potion_full: 0,
            elixir_fury: 0,
            elixir_iron: 0
        };

        // Class starter equipment
        this.player.equipment = { weapon: null, armor: null, ring: null };
        this.player.inventory = [];
        const starterGear = {
            knight: { weapon: "iron_sword", armor: "iron_plate" },
            rogue: { weapon: "steel_rapier", armor: "hardened_leather" },
            mage: { weapon: "apprentice_staff", armor: "silk_robes" },
            paladin: { weapon: "blessed_mace", armor: "crusader_plate" }
        };
        const gear = starterGear[heroClass] || starterGear.knight;
        if (window.InventoryManager) {
            if (gear.weapon) {
                window.InventoryManager.addItem(gear.weapon);
                window.InventoryManager.equipItem(gear.weapon);
            }
            if (gear.armor) {
                window.InventoryManager.addItem(gear.armor);
                window.InventoryManager.equipItem(gear.armor);
            }
        }

        this.combat.stage = 1;
        this.combat.inTemple = false;
        this.combat.autoFight = false;
        this.player.hp = this.getEffectiveMaxHp();

        if (window.SpawningManager) window.SpawningManager.spawnNextMob();
        this.save();
        this.notify();
    },

    respawnAtTemple() {
        this.combat.autoFight = false;
        this.combat.inTemple = true;
        this.combat.currentMob = null;
        this.player.hp = Math.max(1, Math.floor(this.getEffectiveMaxHp() * 0.5));

        // Temple Donation / Tithe on Death
        let tithe = 0;
        if (this.templeDonation && this.templeDonation.enabled !== false) {
            const cost = (typeof this.templeDonation.cost === "number") ? this.templeDonation.cost : 50;
            tithe = Math.min(this.player.gold, cost);
            this.player.gold -= tithe;
        }
        this.lastTempleDonation = tithe;

        this.addLog("💀 Your hero fell in battle... You have awakened at the Temple of Revival.", "death", "💀");
        if (tithe > 0) {
            this.addLog(`🏛️ The Priests mended your wounds (50% HP) and accepted ${tithe}g as Temple Tithe.`, "revival", "🏛️");
        }

        this.save();
        this.notify();
    },

    resumeProgression() {
        this.combat.inTemple = false;
        this.combat.autoFight = false;
        this.addLog("⚔️ Resumed active progression from the Temple of Revival.", "combat", "⚔️");
        if (!this.combat.currentMob && window.SpawningManager) {
            window.SpawningManager.spawnNextMob();
        }
        this.notify();
    },

    resetToNewGame() {
        this.player.hasCompletedOnboarding = false;
        this.player.name = "Hero";
        this.player.gender = "male";
        this.player.level = 1;
        this.player.xp = 0;
        this.player.xpToNext = 100;
        this.combat.stage = 1;
        this.combat.autoFight = false;
        this.combat.inTemple = false;
        this.combat.currentMob = null;
        this.world.currentMapId = "moonlit_vale";
        this.world.unlockedMaps = ["moonlit_vale"];
        this.player.lastPassiveGoldAt = Date.now();
        this.save();
        this.notify();
    },

    unlockMap(mapId) {
        if (!this.world.unlockedMaps) this.world.unlockedMaps = ["moonlit_vale"];
        if (!this.world.unlockedMaps.includes(mapId)) {
            this.world.unlockedMaps.push(mapId);
            this.save();
            this.notify();
        }
    },

    addLog(text, type = "info", icon = "ℹ️", details = null) {
        if (!this.logs) this.logs = [];
        const entry = {
            id: "log_" + Date.now() + "_" + Math.floor(Math.random() * 1000),
            timestamp: Date.now(),
            timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            type: type,
            icon: icon,
            text: text,
            details: details
        };
        this.logs.unshift(entry);
        if (this.logs.length > 80) this.logs.pop();
        this.save();
        this.notify();
        if (typeof BroadcastChannel !== "undefined") {
            try {
                const ch = new BroadcastChannel("realm_idle_sync");
                ch.postMessage({ action: "NEW_LOG", payload: entry, time: Date.now() });
                ch.close();
            } catch (e) {}
        }
    },

    clearLogs() {
        this.logs = [];
        this.save();
        this.notify();
        if (typeof BroadcastChannel !== "undefined") {
            try {
                const ch = new BroadcastChannel("realm_idle_sync");
                ch.postMessage({ action: "LOGS_CLEARED", time: Date.now() });
                ch.close();
            } catch (e) {}
        }
    },

    /* =========================
       OFFLINE PROGRESS ENGINE
    ========================= */
    calculateOfflineProgress(customElapsedSec = null) {
        const now = Date.now();
        const last = this.lastSaveTime || now;
        const elapsedSec = (customElapsedSec !== null) ? customElapsedSec : Math.floor((now - last) / 1000);

        // Minimum 15 seconds to trigger offline report, max 12 hours (43200s)
        if (elapsedSec < 15) {
            this.lastSaveTime = now;
            return null;
        }

        const cappedSec = Math.min(elapsedSec, 43200);
        const hoursAway = (cappedSec / 3600).toFixed(1);

        // 1. Passive Income: add 1 gold to player after every 10 minutes only
        const tenMinCycles = Math.floor(cappedSec / 600);
        const passiveGold = tenMinCycles * 1;
        this.player.lastPassiveGoldAt = now - (cappedSec % 600) * 1000;

        // Check if player was actively in combat with autofight enabled
        const wasFighting = (this.combat && this.combat.autoFight === true && !this.combat.inTemple);

        let kills = 0;
        let combatGold = 0;
        let combatXp = 0;
        const materialsGathered = { ironOre: 0, wood: 0, crystal: 0, dragonScale: 0, shadowEssence: 0 };
        let potionsGathered = 0;
        let gearGathered = [];
        let activityText = "";

        if (wasFighting) {
            // Simulated combat kills (assume 1 mob defeated every ~3.0s)
            kills = Math.floor(cappedSec / 3.0);
            const map = window.MapsData[this.world.currentMapId] || window.MapsData.moonlit_vale;
            const mobPool = (map.mobs && map.mobs.length > 0) ? map.mobs : ["goblin"];
            const avgMobId = mobPool[0];
            const mobDef = window.MobsData[avgMobId] || window.MobsData.goblin;

            combatGold = Math.floor(kills * (mobDef.goldReward || 25) * 0.7);
            combatXp = Math.floor(kills * (mobDef.xpReward || 15) * 0.7);

            for (let i = 0; i < Math.min(kills, 100); i++) {
                if (Math.random() < 0.40) {
                    materialsGathered.ironOre += Math.floor(Math.random() * 2) + 1;
                    materialsGathered.wood += Math.floor(Math.random() * 2) + 1;
                }
                if (Math.random() < 0.15) {
                    materialsGathered.crystal += 1;
                }
                if (Math.random() < 0.10) {
                    potionsGathered += 1;
                    this.player.potions.potion_minor = (this.player.potions.potion_minor || 0) + 1;
                }
                if (Math.random() < 0.05 && gearGathered.length < 3) {
                    const possible = Object.keys(window.ItemsData).filter(k => window.ItemsData[k].type === "equipment");
                    const picked = possible[Math.floor(Math.random() * possible.length)];
                    if (picked && window.InventoryManager) {
                        window.InventoryManager.addItem(picked);
                        gearGathered.push(window.ItemsData[picked].name);
                    }
                }
            }

            // Apply materials
            for (const [mat, qty] of Object.entries(materialsGathered)) {
                if (this.player.materials[mat] !== undefined) {
                    this.player.materials[mat] += qty;
                }
            }

            activityText = `While you were away for ${hoursAway} hours, your hero continued fighting in battle:`;
        } else {
            // Peaceful offline exploration / training in the kingdom
            kills = 0;
            combatGold = 0;
            combatXp = Math.floor(cappedSec * 0.35); // Modest training XP
            activityText = `While you were away for ${hoursAway} hours, you trained and looked around the kingdom:`;
        }

        const totalGold = passiveGold + combatGold;
        this.addGold(totalGold);
        this.addXp(combatXp);
        this.lastSaveTime = now;

        const report = {
            elapsedSec,
            cappedSec,
            hoursAway,
            wasFighting,
            activityText,
            totalGold,
            totalXp: combatXp,
            kills,
            materialsGathered,
            potionsGathered,
            gearGathered
        };

        this.offlineReport = report;
        return report;
    },

    save() {
        this.lastSaveTime = Date.now();
        localStorage.setItem("realmIdleRootSave", JSON.stringify({
            lastSaveTime: this.lastSaveTime,
            player: this.player,
            world: this.world,
            combat: { stage: this.combat.stage, inTemple: this.combat.inTemple, autoFight: this.combat.autoFight },
            kingdom: this.kingdom,
            quests: this.quests,
            journal: this.journal,
            costs: this.costs,
            templeDonation: this.templeDonation,
            guildIncome: this.guildIncome,
            logs: this.logs || []
        }));
    },

    load() {
        const saved = localStorage.getItem("realmIdleRootSave");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                if (data.lastSaveTime) this.lastSaveTime = data.lastSaveTime;
                if (data.player) {
                    Object.assign(this.player, data.player);
                    if (!this.player.potions) {
                        this.player.potions = { potion_minor: 5, potion_major: 1, potion_full: 0, potion_stamina: 2, potion_elixir_rest: 0, elixir_fury: 1, elixir_iron: 1, elixir_shadow: 0, elixir_titans: 0 };
                    } else {
                        if (this.player.potions.potion_stamina === undefined) this.player.potions.potion_stamina = 0;
                        if (this.player.potions.potion_elixir_rest === undefined) this.player.potions.potion_elixir_rest = 0;
                    }
                    if (this.player.fatigue === undefined) {
                        this.player.fatigue = 0;
                    }
                    if (!this.player.skills) {
                        this.player.skills = { activeSkillId: null, activeCooldown: 0, autoCast: true, levels: {}, unlocked: [] };
                    } else {
                        if (this.player.skills.levels === undefined) this.player.skills.levels = {};
                        if (this.player.skills.unlocked === undefined) this.player.skills.unlocked = [];
                        if (this.player.skills.activeSkillId === undefined) this.player.skills.activeSkillId = null;
                    }
                    if (!this.player.unlockedRecipes) {
                        this.player.unlockedRecipes = [];
                    }
                    if (!this.player.unlockedBlueprints) {
                        this.player.unlockedBlueprints = [];
                    }
                    if (!this.player.activeBuffs) {
                        this.player.activeBuffs = [];
                    }
                    if (!this.player.classRanks) {
                        this.player.classRanks = { knight: 1, rogue: 1, mage: 1, paladin: 1 };
                    }
                    if (!this.player.equipment) {
                        this.player.equipment = { weapon: null, armor: null, trinket: null, ring: null, crown: null };
                    } else if (this.player.equipment.crown === undefined) {
                        this.player.equipment.crown = null;
                    }
                    if (this.player.holyShield === undefined) this.player.holyShield = 0;
                    if (this.player.darknessLevel === undefined) this.player.darknessLevel = 0;
                    if (this.player.demonWarningAccepted === undefined) this.player.demonWarningAccepted = false;
                    if (this.player.guardianAngelUsed === undefined) this.player.guardianAngelUsed = false;
                    if (this.player.holyRetributionCharged === undefined) this.player.holyRetributionCharged = false;
                    if (this.player.equilibriumForged === undefined) this.player.equilibriumForged = false;
                    if (!this.player.lastPassiveGoldAt) {
                        this.player.lastPassiveGoldAt = Date.now();
                    }
                    if (this.player.inventory && Array.isArray(this.player.inventory)) {
                        this.player.inventory.forEach(i => {
                            if (i && (i.slot === "crown" || ["demon_crown", "divine_crown", "equilibrium_crown"].includes(i.id))) {
                                // If unequipped in inventory, ensure timer has not prematurely expired or started
                                if (!this.player.equipment || !this.player.equipment.crown || this.player.equipment.crown.instanceId !== i.instanceId) {
                                    if (i.expiresAt && Date.now() >= i.expiresAt) {
                                        i.expiresAt = null;
                                    }
                                }
                            }
                        });
                    }
                }
                if (data.world) {
                    Object.assign(this.world, data.world);
                    if (!this.world.mapDepths) this.world.mapDepths = { moonlit_vale: 1 };
                    if (!this.world.unlockedDepths) this.world.unlockedDepths = { moonlit_vale: 1 };
                }
                if (data.combat) {
                    if (data.combat.stage) this.combat.stage = data.combat.stage;
                    if (data.combat.inTemple !== undefined) this.combat.inTemple = data.combat.inTemple;
                    if (data.combat.autoFight !== undefined) this.combat.autoFight = data.combat.autoFight;
                    if (data.combat.isDestabilized !== undefined) this.combat.isDestabilized = data.combat.isDestabilized;
                }
                if (data.kingdom) Object.assign(this.kingdom, data.kingdom);
                if (data.quests) Object.assign(this.quests, data.quests);
                if (data.journal) Object.assign(this.journal, data.journal);
                if (data.costs) Object.assign(this.costs, data.costs);
                if (data.templeDonation) Object.assign(this.templeDonation, data.templeDonation);
                if (data.guildIncome) Object.assign(this.guildIncome, data.guildIncome);
                if (data.logs && Array.isArray(data.logs) && data.logs.length > 0) {
                    this.logs = data.logs;
                } else if (!this.logs || this.logs.length === 0) {
                    this.logs = [
                        {
                            id: "log_welcome",
                            timestamp: Date.now(),
                            timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                            type: "system",
                            icon: "👑",
                            text: "Realm Idle Adventure initialized. Welcome, brave hero!"
                        }
                    ];
                }
            } catch (e) {
                console.log("Save could not be parsed.");
            }
        } else if (!this.logs || this.logs.length === 0) {
            this.logs = [
                {
                    id: "log_welcome",
                    timestamp: Date.now(),
                    timeStr: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    type: "system",
                    icon: "👑",
                    text: "Realm Idle Adventure initialized. Welcome, brave hero!"
                }
            ];
        }
    }
};

// Backward compatibility alias for GameState
window.GameState = window.gameState;

