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
    // Consumables
    { id: "shop_pot_minor", itemId: "potion_minor", category: "consumable", costGold: 60, reqLevel: 1, stock: -1 },
    { id: "shop_pot_major", itemId: "potion_major", category: "consumable", costGold: 220, reqLevel: 5, stock: -1 },
    { id: "shop_pot_full", itemId: "potion_full", category: "consumable", costGold: 800, reqLevel: 12, stock: -1 },
    { id: "shop_elixir_fury", itemId: "elixir_fury", category: "consumable", costGold: 160, reqLevel: 3, stock: -1 },
    { id: "shop_elixir_iron", itemId: "elixir_iron", category: "consumable", costGold: 160, reqLevel: 3, stock: -1 },

    // Starter & Mid Equipment
    { id: "shop_sword_iron", itemId: "iron_sword", category: "equipment", costGold: 200, reqLevel: 1, stock: -1 },
    { id: "shop_armor_iron", itemId: "iron_plate", category: "equipment", costGold: 220, reqLevel: 1, stock: -1 },
    { id: "shop_ring_copper", itemId: "copper_band", category: "equipment", costGold: 150, reqLevel: 1, stock: -1 },
    { id: "shop_sword_steel", itemId: "steel_rapier", category: "equipment", costGold: 600, reqLevel: 4, stock: -1 },
    { id: "shop_armor_leather", itemId: "hardened_leather", category: "equipment", costGold: 550, reqLevel: 4, stock: -1 },
    { id: "shop_ring_jade", itemId: "jade_signet", category: "equipment", costGold: 700, reqLevel: 5, stock: -1 },
    { id: "shop_sword_runed", itemId: "runed_blade", category: "equipment", costGold: 1600, reqLevel: 8, stock: -1 },
    { id: "shop_armor_shadow", itemId: "shadow_cowl", category: "equipment", costGold: 1800, reqLevel: 8, stock: -1 },
    { id: "shop_ring_wealth", itemId: "ring_of_wealth", category: "equipment", costGold: 2500, reqLevel: 10, stock: -1 },

    // Raw Materials Bundles
    { id: "shop_mat_iron", matKey: "ironOre", matQty: 10, name: "Iron Ore x10", icon: "⛏️", category: "material", costGold: 120, reqLevel: 1, stock: -1 },
    { id: "shop_mat_wood", matKey: "wood", matQty: 10, name: "Hardwood x10", icon: "🪵", category: "material", costGold: 100, reqLevel: 1, stock: -1 },
    { id: "shop_mat_crystal", matKey: "crystal", matQty: 5, name: "Arcane Crystal x5", icon: "💎", category: "material", costGold: 300, reqLevel: 3, stock: -1 },
    { id: "shop_mat_scale", matKey: "dragonScale", matQty: 3, name: "Dragon Scale x3", icon: "🐉", category: "material", costGold: 1200, reqLevel: 10, stock: -1 },
    { id: "shop_mat_shadow", matKey: "shadowEssence", matQty: 2, name: "Shadow Essence x2", icon: "🔮", category: "material", costGold: 1500, reqLevel: 15, stock: -1 }
];

