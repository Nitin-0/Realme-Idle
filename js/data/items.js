/* =========================================================
   REALM IDLE DATA - ITEMS, RARITY & CRAFTING DICTIONARY
========================================================= */

window.RarityData = {
    common: {
        id: "common",
        name: "Common",
        color: "#c0c4cc",
        border: "rgba(255, 255, 255, 0.2)",
        statMult: 1.0,
        sellMult: 1.0
    },
    uncommon: {
        id: "uncommon",
        name: "Uncommon",
        color: "#4ade80",
        border: "rgba(74, 222, 128, 0.4)",
        statMult: 1.35,
        sellMult: 1.6
    },
    rare: {
        id: "rare",
        name: "Rare",
        color: "#60a5fa",
        border: "rgba(96, 165, 250, 0.45)",
        statMult: 1.8,
        sellMult: 2.5
    },
    epic: {
        id: "epic",
        name: "Epic",
        color: "#c084fc",
        border: "rgba(192, 132, 252, 0.5)",
        statMult: 2.5,
        sellMult: 4.5
    },
    legendary: {
        id: "legendary",
        name: "Legendary",
        color: "#fbbf24",
        border: "rgba(251, 191, 36, 0.6)",
        statMult: 3.5,
        sellMult: 8.0
    }
};

window.ItemsData = {
    // Weapons
    iron_sword: {
        id: "iron_sword",
        name: "Iron Broadsword",
        slot: "weapon",
        type: "equipment",
        rarity: "common",
        baseValue: 80,
        icon: "🗡️",
        stats: { attack: 15 }
    },
    steel_rapier: {
        id: "steel_rapier",
        name: "Steel Quick-Rapier",
        slot: "weapon",
        type: "equipment",
        rarity: "uncommon",
        baseValue: 180,
        icon: "🗡️",
        stats: { attack: 28, critChance: 0.04 }
    },
    runed_blade: {
        id: "runed_blade",
        name: "Runed Shadowblade",
        slot: "weapon",
        type: "equipment",
        rarity: "rare",
        baseValue: 400,
        icon: "⚔️",
        stats: { attack: 55, critChance: 0.08 }
    },
    frostbite_axe: {
        id: "frostbite_axe",
        name: "Frostbite Great-Axe",
        slot: "weapon",
        type: "equipment",
        rarity: "epic",
        baseValue: 1200,
        icon: "🪓",
        stats: { attack: 120, critChance: 0.12, lifesteal: 0.04 }
    },
    dragon_slayer: {
        id: "dragon_slayer",
        name: "Dragon Slayer Greatsword",
        slot: "weapon",
        type: "equipment",
        rarity: "legendary",
        baseValue: 3500,
        icon: "🐉",
        stats: { attack: 240, critChance: 0.16, lifesteal: 0.08 }
    },

    // Armor
    iron_plate: {
        id: "iron_plate",
        name: "Iron Plate Armor",
        slot: "armor",
        type: "equipment",
        rarity: "common",
        baseValue: 80,
        icon: "🛡️",
        stats: { defense: 20, hp: 50 }
    },
    hardened_leather: {
        id: "hardened_leather",
        name: "Reinforced Leather Tunic",
        slot: "armor",
        type: "equipment",
        rarity: "uncommon",
        baseValue: 180,
        icon: "🥋",
        stats: { defense: 32, dodge: 0.04, hp: 90 }
    },
    shadow_cowl: {
        id: "shadow_cowl",
        name: "Shadowstalker Cowl",
        slot: "armor",
        type: "equipment",
        rarity: "rare",
        baseValue: 450,
        icon: "🥋",
        stats: { defense: 55, dodge: 0.10, hp: 150 }
    },
    celestial_mail: {
        id: "celestial_mail",
        name: "Celestial Mail of Aegis",
        slot: "armor",
        type: "equipment",
        rarity: "epic",
        baseValue: 1300,
        icon: "🛡️",
        stats: { defense: 110, hp: 320, dodge: 0.06 }
    },
    dragon_scale_mail: {
        id: "dragon_scale_mail",
        name: "Dragon Scale Cuirass",
        slot: "armor",
        type: "equipment",
        rarity: "legendary",
        baseValue: 4000,
        icon: "🐲",
        stats: { defense: 200, hp: 500, dodge: 0.08 }
    },

    // Rings & Trinkets
    copper_band: {
        id: "copper_band",
        name: "Copper Ring",
        slot: "ring",
        type: "equipment",
        rarity: "common",
        baseValue: 60,
        icon: "💍",
        stats: { attack: 6, defense: 6 }
    },
    jade_signet: {
        id: "jade_signet",
        name: "Jade Signet Ring",
        slot: "ring",
        type: "equipment",
        rarity: "uncommon",
        baseValue: 200,
        icon: "💍",
        stats: { attack: 14, defense: 14, critChance: 0.03 }
    },
    ring_of_wealth: {
        id: "ring_of_wealth",
        name: "Ring of Fortune",
        slot: "ring",
        type: "equipment",
        rarity: "rare",
        baseValue: 500,
        icon: "💍",
        stats: { goldMult: 0.20, defense: 20 }
    },
    abyssal_ring: {
        id: "abyssal_ring",
        name: "Abyssal Band of Leech",
        slot: "ring",
        type: "equipment",
        rarity: "epic",
        baseValue: 1400,
        icon: "💍",
        stats: { attack: 45, defense: 45, lifesteal: 0.06 }
    },
    void_artifact: {
        id: "void_artifact",
        name: "Void Star Relic",
        slot: "ring",
        type: "equipment",
        rarity: "legendary",
        baseValue: 4500,
        icon: "🔮",
        stats: { attack: 95, defense: 95, critChance: 0.12, lifesteal: 0.06 }
    },

    // Consumables (Healing & Elixirs)
    potion_minor: {
        id: "potion_minor",
        name: "Minor Health Potion",
        type: "consumable",
        rarity: "common",
        baseValue: 30,
        icon: "🧪",
        description: "Instantly restores 50 HP.",
        effect: { type: "heal", amount: 50 }
    },
    potion_major: {
        id: "potion_major",
        name: "Greater Health Potion",
        type: "consumable",
        rarity: "rare",
        baseValue: 120,
        icon: "🧪",
        description: "Instantly restores 180 HP.",
        effect: { type: "heal", amount: 180 }
    },
    potion_full: {
        id: "potion_full",
        name: "Elixir of Rebirth",
        type: "consumable",
        rarity: "legendary",
        baseValue: 400,
        icon: "🏺",
        description: "Completely restores 100% of maximum HP.",
        effect: { type: "heal_pct", amount: 1.0 }
    },
    elixir_fury: {
        id: "elixir_fury",
        name: "Berserker Draught",
        type: "consumable",
        rarity: "uncommon",
        baseValue: 90,
        icon: "🍷",
        description: "Grants +25% Attack power for 30 seconds.",
        effect: { type: "buff", stat: "attackMult", value: 0.25, duration: 30 }
    },
    elixir_iron: {
        id: "elixir_iron",
        name: "Stoneskin Flask",
        type: "consumable",
        rarity: "uncommon",
        baseValue: 90,
        icon: "🍶",
        description: "Grants +35 Defense for 30 seconds.",
        effect: { type: "buff", stat: "defense", value: 35, duration: 30 }
    },
    elixir_swift: {
        id: "elixir_swift",
        name: "Elixir of Swift Winds",
        type: "consumable",
        rarity: "uncommon",
        baseValue: 75,
        icon: "💨",
        description: "Grants +8% Dodge chance for 60 seconds.",
        effect: { type: "buff", stat: "dodge", value: 0.08, duration: 60 }
    },
    elixir_stone: {
        id: "elixir_stone",
        name: "Elixir of Stoneskin",
        type: "consumable",
        rarity: "rare",
        baseValue: 150,
        icon: "🪨",
        description: "Grants +35 Defense for 120 seconds.",
        effect: { type: "buff", stat: "defense", value: 35, duration: 120 }
    },
    elixir_crit: {
        id: "elixir_crit",
        name: "Elixir of Falcon Eye",
        type: "consumable",
        rarity: "rare",
        baseValue: 180,
        icon: "🎯",
        description: "Grants +12% Critical Strike Chance for 120 seconds.",
        effect: { type: "buff", stat: "critChance", value: 0.12, duration: 120 }
    },
    elixir_ambrosia: {
        id: "elixir_ambrosia",
        name: "Ambrosia of the Gods",
        type: "consumable",
        rarity: "epic",
        baseValue: 500,
        icon: "✨",
        description: "Grants +80 Attack Power for 180 seconds.",
        effect: { type: "buff", stat: "attack", value: 80, duration: 180 }
    },
    elixir_dragonheart: {
        id: "elixir_dragonheart",
        name: "Elixir of the Dragonheart",
        type: "consumable",
        rarity: "legendary",
        baseValue: 900,
        icon: "🐉",
        description: "Grants +70 Defense for 180 seconds.",
        effect: { type: "buff", stat: "defense", value: 70, duration: 180 }
    }
};

window.CraftingRecipes = [
    { itemId: "iron_sword", req: { ironOre: 10, wood: 5, gold: 100 } },
    { itemId: "steel_rapier", req: { ironOre: 20, wood: 10, gold: 250 } },
    { itemId: "runed_blade", req: { ironOre: 25, wood: 15, crystal: 5, gold: 500 } },
    { itemId: "frostbite_axe", req: { ironOre: 40, crystal: 15, shadowEssence: 3, gold: 1800 } },
    { itemId: "dragon_slayer", req: { dragonScale: 20, crystal: 15, shadowEssence: 5, gold: 5000 } },
    { itemId: "iron_plate", req: { ironOre: 15, wood: 5, gold: 150 } },
    { itemId: "hardened_leather", req: { wood: 20, ironOre: 10, gold: 220 } },
    { itemId: "shadow_cowl", req: { shadowEssence: 4, crystal: 10, gold: 600 } },
    { itemId: "celestial_mail", req: { crystal: 20, ironOre: 35, shadowEssence: 6, gold: 2200 } },
    { itemId: "dragon_scale_mail", req: { dragonScale: 25, ironOre: 30, gold: 6000 } },
    { itemId: "copper_band", req: { ironOre: 8, gold: 80 } },
    { itemId: "jade_signet", req: { crystal: 12, gold: 300 } },
    { itemId: "ring_of_wealth", req: { crystal: 15, gold: 1000 } },
    { itemId: "abyssal_ring", req: { shadowEssence: 8, crystal: 15, gold: 2500 } },
    { itemId: "void_artifact", req: { crystal: 20, shadowEssence: 10, gold: 8000 } }
];

window.ShopData = [
    // ---------------- STARTER PROVISIONS (MOONLIT VALE · DEPTH 1) ----------------
    { id: "shop_mat_wood", matKey: "wood", matQty: 10, name: "Hardwood Bundle x10", icon: "🪵", category: "material", costGold: 80, reqLevel: 1, reqMap: "moonlit_vale", reqDepth: 1, stock: -1, description: "Timber gathered from the Moonlit Vale fringes." },
    { id: "shop_mat_iron", matKey: "ironOre", matQty: 10, name: "Iron Ore Bundle x10", icon: "⛏️", category: "material", costGold: 100, reqLevel: 1, reqMap: "moonlit_vale", reqDepth: 1, stock: -1, description: "Common iron ore veins mined near the surface." },
    { id: "shop_pot_minor", itemId: "potion_minor", name: "Minor Health Potion", icon: "🧪", category: "consumable", costGold: 50, reqLevel: 1, reqMap: "moonlit_vale", reqDepth: 1, stock: -1, description: "Instantly restores 50 HP." },
    { id: "shop_sword_iron", itemId: "iron_sword", name: "Iron Broadsword", icon: "🗡️", category: "equipment", costGold: 180, reqLevel: 1, reqMap: "moonlit_vale", reqDepth: 1, stock: -1, description: "A balanced starter blade forged from iron (+15 Attack)." },
    { id: "shop_armor_iron", itemId: "iron_plate", name: "Iron Breastplate", icon: "🛡️", category: "equipment", costGold: 200, reqLevel: 1, reqMap: "moonlit_vale", reqDepth: 1, stock: -1, description: "Sturdy standard iron breastplate (+12 Def, +30 HP)." },
    { id: "shop_ring_copper", itemId: "copper_band", name: "Copper Band", icon: "💍", category: "equipment", costGold: 140, reqLevel: 1, reqMap: "moonlit_vale", reqDepth: 1, stock: -1, description: "A simple polished band granting wealth (+3g/s, +3% Crit)." },

    // ---------------- DEEP MOONLIT VALE (DEPTHS 2 & 3) ----------------
    { id: "shop_pot_major", itemId: "potion_major", name: "Greater Health Potion", icon: "🧪", category: "consumable", costGold: 180, reqLevel: 5, reqMap: "moonlit_vale", reqDepth: 2, stock: -1, description: "Concentrated healing draught. Restores 180 HP." },
    { id: "shop_mat_crystal", matKey: "crystal", matQty: 5, name: "Arcane Crystal x5", icon: "💎", category: "material", costGold: 280, reqLevel: 5, reqMap: "moonlit_vale", reqDepth: 2, stock: -1, description: "Glowing geological crystals found in the Deep Thicket." },
    { id: "shop_sword_steel", itemId: "steel_rapier", name: "Steel Rapier", icon: "🗡️", category: "equipment", costGold: 550, reqLevel: 5, reqMap: "moonlit_vale", reqDepth: 2, stock: -1, description: "Sharp, agile blade forged for critical thrusts (+30 Attack, +6% Crit)." },
    { id: "shop_armor_leather", itemId: "hardened_leather", name: "Hardened Leather Armor", icon: "🛡️", category: "equipment", costGold: 500, reqLevel: 5, reqMap: "moonlit_vale", reqDepth: 3, stock: -1, description: "Supple predator hide granting agility (+22 Def, +5% Dodge)." },

    // ---------------- ASHEN WASTES (REALM II) ----------------
    { id: "shop_elixir_fury", itemId: "elixir_fury", name: "Berserker Draught", icon: "🧪", category: "consumable", costGold: 150, reqLevel: 8, reqMap: "ashen_wastes", reqDepth: 1, stock: -1, description: "Fiery tonic granting +20 Attack for 60 seconds." },
    { id: "shop_ring_jade", itemId: "jade_signet", name: "Jade Signet", icon: "💍", category: "equipment", costGold: 700, reqLevel: 8, reqMap: "ashen_wastes", reqDepth: 1, stock: -1, description: "Radiates verdant serenity (+8g/s, +60 HP)." },
    { id: "shop_sword_runed", itemId: "runed_blade", name: "Runed Broadsword", icon: "🗡️", category: "equipment", costGold: 1400, reqLevel: 10, reqMap: "ashen_wastes", reqDepth: 2, stock: -1, description: "Inscribed with ancient runes (+55 Attack, +4% Lifesteal)." },

    // ---------------- BLOODTHORN FOREST (REALM III) ----------------
    { id: "shop_elixir_iron", itemId: "elixir_iron", name: "Elixir of Ironbark", icon: "🧪", category: "consumable", costGold: 160, reqLevel: 12, reqMap: "bloodthorn_forest", reqDepth: 1, stock: -1, description: "Hardens the flesh like granite, granting +25 Defense for 60s." },
    { id: "shop_mat_scale", matKey: "dragonScale", matQty: 3, name: "Dragon Scale x3", icon: "🐉", category: "material", costGold: 1000, reqLevel: 14, reqMap: "bloodthorn_forest", reqDepth: 1, stock: -1, description: "Impervious wyrm plating harvested from primal drakes." },
    { id: "shop_armor_shadow", itemId: "shadow_cowl", name: "Shadow Cowl", icon: "🛡️", category: "equipment", costGold: 1600, reqLevel: 15, reqMap: "bloodthorn_forest", reqDepth: 2, stock: -1, description: "Woven from twilight threads (+45 Def, +100 HP, +8% Dodge)." },

    // ---------------- FROSTPEAK CITADEL & INFERNAL DEPTHS (REALMS IV & V) ----------------
    { id: "shop_pot_full", itemId: "potion_full", name: "Elixir of Rebirth", icon: "🏺", category: "consumable", costGold: 800, reqLevel: 20, reqMap: "frostpeak", reqDepth: 1, stock: -1, description: "Miraculous nectar that completely restores 100% of maximum HP." },
    { id: "shop_mat_shadow", matKey: "shadowEssence", matQty: 2, name: "Shadow Essence x2", icon: "🔮", category: "material", costGold: 1400, reqLevel: 22, reqMap: "frostpeak", reqDepth: 2, stock: -1, description: "Dark metaphysical matter collected from void apparitions." },
    { id: "shop_ring_wealth", itemId: "ring_of_wealth", name: "Ring of Imperial Wealth", icon: "💍", category: "equipment", costGold: 2400, reqLevel: 25, reqMap: "infernal_depths", reqDepth: 1, stock: -1, description: "Adorned with royal gemstones (+25g/s, +12% Crit)." }
];

/* =========================================================
   FORGE, UPGRADES & PROCEDURAL GEAR GENERATION
========================================================= */

window.ForgeData = [
    { tier: 'common', name: 'Basic Forge', icon: '🔨', cost: 250, reqLevel: 1, pool: ['common', 'common', 'rare'], desc: 'Mostly common gear with a chance at something Rare.' },
    { tier: 'rare', name: 'Master Forge', icon: '⚒️', cost: 1600, reqLevel: 10, pool: ['rare', 'rare', 'epic'], desc: 'Reliable Rare equipment. Occasionally Epic. Unlocks at Hero Lv. 10.' },
    { tier: 'legendary', name: 'Aincrad Forge', icon: '🔥', cost: 9000, reqLevel: 25, pool: ['epic', 'epic', 'legendary'], desc: 'Epic guaranteed. A chance at a Legendary relic. Unlocks at Hero Lv. 25.' }
];

window.UpgradesData = [
    { id: 'attack', name: 'Whetstone Rites', desc: '+8 Attack Power', icon: '⚔️', base: 60, growth: 1.33 },
    { id: 'defense', name: 'Armor Plating', desc: '+4 Defense, +0.2% Dodge', icon: '🛡️', base: 55, growth: 1.30 },
    { id: 'hp', name: 'Vitality Training', desc: '+30 Maximum HP', icon: '❤️', base: 50, growth: 1.29 },
    { id: 'crit', name: 'Precision Drills', desc: '+1% Crit · +0.03x Crit Damage', icon: '🎯', base: 95, growth: 1.38 },
    { id: 'income', name: 'Trade Routes', desc: '+2.5 Gold / second', icon: '💰', base: 80, growth: 1.36 },
    { id: 'life', name: 'Vampiric Rune', desc: '+1% Lifesteal', icon: '🩸', base: 170, growth: 1.46 }
];

window.PREFIX = ['Rusty', 'Sturdy', 'Sharp', 'Blessed', 'Cursed', 'Ancient', 'Aincrad', 'Radiant', 'Abyssal', 'Hollow'];
window.BASES = {
    weapon: ['Short Sword', 'Rapier', 'Greatsword', 'Dual Blades', 'Estoc', 'Katana', 'War Hammer', 'Anneal Blade', 'Elucidator'],
    armor: ['Leather Cuirass', 'Iron Plate', 'Dark Cloak', 'Dragon Scale Mail', 'Buckler', 'Chainmail', 'Coat of Midnight'],
    trinket: ['Ruby Ring', 'Amulet of Vigor', 'Guild Emblem', 'Wind Crystal', 'Divine Stone', 'Gleam Eye', 'Silver Ring']
};

window.rollItem = function(rarityKey, slot, ilvl) {
    const rarities = window.RarityData || {};
    const rk = rarities[rarityKey] ? rarityKey : 'common';
    const r = rarities[rk] || { statMult: 1, mult: 1, sellMult: 1, sell: 18 };
    const mult = r.statMult || r.mult || 1;
    slot = slot || (['weapon', 'armor', 'trinket'])[Math.floor(Math.random() * 3)];
    if (slot === 'ring') slot = 'trinket';

    const pList = window.PREFIX;
    const bList = (window.BASES && window.BASES[slot]) || ['Gear Piece'];
    const p = pList[Math.floor(Math.random() * pList.length)];
    const b = bList[Math.floor(Math.random() * bList.length)];
    const name = `${p} ${b}`;
    const level = ilvl || 1;
    const power = (1 + level * 0.42) * mult;
    const stats = {};

    if (slot === 'weapon') {
        stats.atk = Math.max(1, Math.round((3 + Math.random() * 5) * power));
    } else if (slot === 'armor') {
        stats.def = Math.max(1, Math.round((2 + Math.random() * 4) * power));
        stats.hp = Math.max(2, Math.round((8 + Math.random() * 14) * power));
    } else {
        stats.gold = Math.max(1, Math.round((1 + Math.random() * 3) * power));
        stats.crit = Math.round((0.4 + Math.random() * 1.4) * power * 10) / 10;
    }

    return {
        id: "rolled_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        instanceId: Date.now() + "_" + Math.random().toString(36).substr(2, 6),
        name,
        slot,
        type: "equipment",
        rarity: rk,
        stats,
        ilvl: level,
        icon: slot === 'weapon' ? '🗡️' : (slot === 'armor' ? '🛡️' : '💍')
    };
};

window.formatItemStatLine = function(it) {
    if (!it || !it.stats) return '';
    const STAT_ICON = { atk: '⚔', attack: '⚔', def: '🛡', defense: '🛡', hp: '❤', crit: '🎯', critChance: '🎯', gold: '💰', goldMult: '💰', lifesteal: '🩸', dodge: '💨' };
    const STAT_LABEL = { atk: 'Atk', attack: 'Atk', def: 'Def', defense: 'Def', hp: 'HP', crit: 'Crit', critChance: 'Crit', gold: 'g/s', goldMult: 'g/s', lifesteal: 'Lifesteal', dodge: 'Dodge' };

    return Object.entries(it.stats).map(([k, v]) => {
        const icon = STAT_ICON[k] || '✦';
        const label = STAT_LABEL[k] || k;
        const isPct = k.toLowerCase().includes('crit') || k.toLowerCase().includes('dodge') || k.toLowerCase().includes('lifesteal');
        const displayVal = (typeof v === 'number' && isPct && v < 1) ? `${Math.round(v * 100)}%` : (isPct ? `${v}%` : v);
        return `${icon} +${displayVal} ${label}`;
    }).join(' · ');
};

window.getUpgradeCost = function(id) {
    const u = (window.UpgradesData || []).find(x => x.id === id);
    if (!u) return 999999;
    const state = window.gameState;
    const currentLv = (state && state.player && state.player.upgrades && state.player.upgrades[id]) || 0;
    return Math.floor(u.base * Math.pow(u.growth, currentLv));
};

window.buyUpgrade = function(id) {
    const state = window.gameState;
    if (!state) return false;
    const cost = window.getUpgradeCost(id);
    if (!state.canAfford(cost)) {
        alert("Not enough gold for this upgrade!");
        return false;
    }

    state.spendGold(cost);
    if (!state.player.upgrades) {
        state.player.upgrades = { attack: 0, defense: 0, hp: 0, crit: 0, income: 0, life: 0 };
    }
    state.player.upgrades[id] = (state.player.upgrades[id] || 0) + 1;

    const u = (window.UpgradesData || []).find(x => x.id === id);
    if (state.addLog && u) {
        state.addLog(`Purchased [${u.name}] (Lv ${state.player.upgrades[id]}) for ${cost.toLocaleString()}g!`, "level", u.icon);
    }
    state.notify();
    return true;
};

