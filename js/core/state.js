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
            ring: null
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
            elixir_fury: 1,
            elixir_iron: 1
        },
        autoPotion: true,
        skills: {
            activeCooldown: 0,
            autoCast: true
        },
        activeBuffs: []
    },

    world: {
        currentMapId: "moonlit_vale",
        currentWeatherId: "clear",
        worldTime: 12,
        activeEventId: null,
        activeEventTimer: 0,
        activeScenarioId: null,
        activeScenarioTimer: 0,
        unlockedMaps: ["moonlit_vale"]
    },

    combat: {
        currentMob: null,
        autoFight: false,
        stage: 1,
        maxStages: 10,
        inTemple: false
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

    getEffectiveAttack() {
        let att = this.player.power;

        // Add equipment attack (with upgrade scaling)
        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.attack) att += eff.attack;
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

        return Math.floor(att);
    },

    getEffectiveDefense() {
        let def = this.player.defense;
        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.defense) def += eff.defense;
            }
        });

        this.player.activeBuffs.forEach(b => {
            if (b.stat === "defense") def += b.bonus;
        });

        return Math.floor(def);
    },

    getEffectiveCritChance() {
        let crit = this.player.critChance;
        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.critChance) crit += eff.critChance;
            }
        });
        // Mage Tower (+2% crit per level)
        crit += (this.kingdom.mageTower - 1) * 0.02;

        this.player.activeBuffs.forEach(b => {
            if (b.stat === "critChance") crit += b.bonus;
        });

        return Math.min(0.95, crit);
    },

    getEffectiveDodge() {
        let dodge = this.player.dodge;
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
        Object.values(this.player.equipment).forEach(item => {
            if (item) {
                const eff = this.getItemEffectiveStats(item);
                if (eff.lifesteal) ls += eff.lifesteal;
            }
        });
        return Math.min(0.50, ls);
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
            this.player.hp = this.player.maxHp;
            this.player.xpToNext = Math.floor(this.player.xpToNext * 1.4);

            if (window.devMode && typeof window.devMode.logToConsole === "function") {
                window.devMode.logToConsole(`🌟 LEVEL UP! You reached Level ${this.player.level}! (+6 Power, +25 Max HP)`, "success");
            }
            this.addLog(`⭐ LEVEL UP! Your hero reached Level ${this.player.level}! (+6 Power, +25 Max HP)`, "level", "⭐");
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
        this.player.hp = this.player.maxHp;

        if (window.SpawningManager) window.SpawningManager.spawnNextMob();
        this.save();
        this.notify();
    },

    respawnAtTemple() {
        this.combat.autoFight = false;
        this.combat.inTemple = true;
        this.combat.currentMob = null;
        this.player.hp = Math.max(1, Math.floor(this.player.maxHp * 0.5));

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

        // 1. Passive Guild Income
        const guildRate = (this.guildIncome && this.guildIncome.enabled !== false)
            ? (this.guildIncome.goldPerSecond !== undefined ? this.guildIncome.goldPerSecond : (this.costs.goldPerSecond || 3))
            : 0;
        const treasuryBonus = 1 + (this.kingdom.treasury - 1) * 0.10;
        const passiveGold = Math.floor(cappedSec * guildRate * treasuryBonus);

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
                        this.player.potions = { potion_minor: 5, potion_major: 1, potion_full: 0, elixir_fury: 1, elixir_iron: 1 };
                    }
                    if (!this.player.skills) {
                        this.player.skills = { activeCooldown: 0, autoCast: true };
                    }
                    if (!this.player.activeBuffs) {
                        this.player.activeBuffs = [];
                    }
                }
                if (data.world) Object.assign(this.world, data.world);
                if (data.combat) {
                    if (data.combat.stage) this.combat.stage = data.combat.stage;
                    if (data.combat.inTemple !== undefined) this.combat.inTemple = data.combat.inTemple;
                    if (data.combat.autoFight !== undefined) this.combat.autoFight = data.combat.autoFight;
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

