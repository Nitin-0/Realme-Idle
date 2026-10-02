/* =========================================================
   REALM IDLE DATA - ALCHEMY RECIPES DICTIONARY
========================================================= */

window.AlchemyRecipes = [
    // ---------------- TIER 1: APPRENTICE ALCHEMY (Hero Lv. 1) ----------------
    {
        id: "alch_pot_minor",
        name: "Minor Healing Draught",
        icon: "🧪",
        tier: 1,
        tierName: "Apprentice Cauldron",
        reqLevel: 1,
        goldCost: 40,
        materials: { wood: 2 },
        result: { id: "potion_minor", type: "consumable", qty: 1 },
        effect: { type: "heal", value: 80 },
        description: "A soothing herbal potion distilled from enchanted hardwood. Restores 80 HP instantly."
    },
    {
        id: "alch_elixir_ironbark",
        name: "Elixir of Ironbark",
        icon: "🛡️",
        tier: 1,
        tierName: "Apprentice Cauldron",
        reqLevel: 1,
        goldCost: 60,
        materials: { wood: 2, ironOre: 1 },
        result: { id: "elixir_iron", type: "consumable", qty: 1 },
        effect: { type: "buff", stat: "defense", bonus: 15, duration: 60 },
        description: "Hardens the imbiber's flesh like ancient oak. Grants +15 Defense for 60 seconds."
    },
    {
        id: "alch_elixir_swiftwinds",
        name: "Elixir of Swift Winds",
        icon: "💨",
        tier: 1,
        tierName: "Apprentice Cauldron",
        reqLevel: 3,
        goldCost: 75,
        materials: { wood: 3 },
        result: { id: "elixir_swift", type: "consumable", qty: 1 },
        effect: { type: "buff", stat: "dodge", bonus: 0.08, duration: 60 },
        description: "Infuses the limbs with ethereal breeze. Increases Dodge chance by +8% for 60 seconds."
    },

    // ---------------- TIER 2: JOURNEYMAN ALCHEMY (Hero Lv. 10 - Locked) ----------------
    {
        id: "alch_pot_major",
        name: "Greater Health Potion",
        icon: "⚗️",
        tier: 2,
        tierName: "Journeyman Crucible",
        reqLevel: 10,
        goldCost: 180,
        materials: { ironOre: 3, wood: 3 },
        result: { id: "potion_major", type: "consumable", qty: 1 },
        effect: { type: "heal", value: 300 },
        description: "A potent alchemical brew charged with mineral essence. Restores 300 HP instantly."
    },
    {
        id: "alch_elixir_fury",
        name: "Elixir of Berserker Fury",
        icon: "⚔️",
        tier: 2,
        tierName: "Journeyman Crucible",
        reqLevel: 10,
        goldCost: 240,
        materials: { ironOre: 4, crystal: 1 },
        result: { id: "elixir_fury", type: "consumable", qty: 1 },
        effect: { type: "buff", stat: "attack", bonus: 35, duration: 120 },
        description: "Boils the blood with primal rage. Increases Attack Power by +35 for 120 seconds."
    },
    {
        id: "alch_elixir_stoneskin",
        name: "Elixir of Stoneskin",
        icon: "🪨",
        tier: 2,
        tierName: "Journeyman Crucible",
        reqLevel: 12,
        goldCost: 280,
        materials: { ironOre: 5, crystal: 1 },
        result: { id: "elixir_stone", type: "consumable", qty: 1 },
        effect: { type: "buff", stat: "defense", bonus: 35, duration: 120 },
        description: "Crystallizes the skin into impervious granite. Grants +35 Defense for 120 seconds."
    },
    {
        id: "alch_elixir_precision",
        name: "Elixir of Falcon Eye",
        icon: "🎯",
        tier: 2,
        tierName: "Journeyman Crucible",
        reqLevel: 14,
        goldCost: 320,
        materials: { crystal: 2, wood: 3 },
        result: { id: "elixir_crit", type: "consumable", qty: 1 },
        effect: { type: "buff", stat: "critChance", bonus: 0.12, duration: 120 },
        description: "Sharpens perception to pinpoint vital weaknesses. +12% Critical Strike Chance for 120s."
    },

    // ---------------- TIER 3: MASTER AINCRAD ALCHEMY (Hero Lv. 25 - Locked) ----------------
    {
        id: "alch_pot_full",
        name: "Full Rejuvenation Elixir",
        icon: "💖",
        tier: 3,
        tierName: "Aincrad Alchemical Altar",
        reqLevel: 25,
        goldCost: 800,
        materials: { crystal: 3, dragonScale: 1 },
        result: { id: "potion_full", type: "consumable", qty: 1 },
        effect: { type: "heal", value: 99999 },
        description: "Divine nectar brewed from dragon essence. Restores 100% of maximum HP instantly."
    },
    {
        id: "alch_ambrosia_gods",
        name: "Ambrosia of the Gods",
        icon: "✨",
        tier: 3,
        tierName: "Aincrad Alchemical Altar",
        reqLevel: 25,
        goldCost: 1400,
        materials: { crystal: 4, dragonScale: 2, shadowEssence: 1 },
        result: { id: "elixir_ambrosia", type: "consumable", qty: 1 },
        effect: { type: "buff", stat: "attack", bonus: 80, duration: 180 },
        description: "A mystical concoction of pure starlight. Grants +80 Attack and divine battle grace for 180s."
    },
    {
        id: "alch_elixir_immortality",
        name: "Elixir of the Dragonheart",
        icon: "🐉",
        tier: 3,
        tierName: "Aincrad Alchemical Altar",
        reqLevel: 28,
        goldCost: 2000,
        materials: { dragonScale: 3, shadowEssence: 2 },
        result: { id: "elixir_dragonheart", type: "consumable", qty: 1 },
        effect: { type: "buff", stat: "defense", bonus: 70, duration: 180 },
        description: "Transfuses ancient wyrm blood into your veins. Grants +70 Defense and unwavering vitality for 180s."
    }
];

window.AlchemyData = window.AlchemyRecipes;

