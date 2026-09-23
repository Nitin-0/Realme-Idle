/* =========================================================
   REALM IDLE DATA - MOBS DICTIONARY
========================================================= */

window.MobsData = {
    goblin: {
        id: "goblin",
        name: "Hollow Goblin",
        type: "ANCIENT GUARDIAN",
        levelMin: 1,
        levelMax: 5,
        baseHp: 100,
        baseDmg: 8,
        goldReward: 25,
        xpReward: 15,
        icon: "👹",
        dropChance: 0.45,
        dropTable: [
            { type: "material", key: "ironOre", min: 1, max: 2, chance: 0.60 },
            { type: "material", key: "wood", min: 1, max: 2, chance: 0.50 },
            { type: "consumable", id: "potion_minor", chance: 0.25 },
            { type: "item", id: "iron_sword", chance: 0.08 },
            { type: "item", id: "iron_plate", chance: 0.08 },
            { type: "item", id: "copper_band", chance: 0.10 }
        ]
    },
    wolf: {
        id: "wolf",
        name: "Bloodthorn Stalker",
        type: "FOREST ABOMINATION",
        levelMin: 3,
        levelMax: 10,
        baseHp: 220,
        baseDmg: 18,
        goldReward: 45,
        xpReward: 30,
        icon: "🐺",
        dropChance: 0.55,
        dropTable: [
            { type: "material", key: "wood", min: 2, max: 4, chance: 0.70 },
            { type: "material", key: "crystal", min: 1, max: 2, chance: 0.35 },
            { type: "consumable", id: "potion_minor", chance: 0.30 },
            { type: "consumable", id: "elixir_fury", chance: 0.15 },
            { type: "item", id: "steel_rapier", chance: 0.10 },
            { type: "item", id: "hardened_leather", chance: 0.10 }
        ]
    },
    skeleton: {
        id: "skeleton",
        name: "Restless Skeleton",
        type: "UNDEAD SOLDIER",
        levelMin: 5,
        levelMax: 15,
        baseHp: 450,
        baseDmg: 32,
        goldReward: 90,
        xpReward: 60,
        icon: "💀",
        dropChance: 0.60,
        dropTable: [
            { type: "material", key: "ironOre", min: 2, max: 5, chance: 0.75 },
            { type: "material", key: "crystal", min: 1, max: 3, chance: 0.40 },
            { type: "consumable", id: "potion_major", chance: 0.20 },
            { type: "consumable", id: "elixir_iron", chance: 0.18 },
            { type: "item", id: "jade_signet", chance: 0.12 },
            { type: "item", id: "steel_rapier", chance: 0.12 }
        ]
    },
    orc: {
        id: "orc",
        name: "Ashen Orc Marauder",
        type: "WASTELAND BEAST",
        levelMin: 10,
        levelMax: 25,
        baseHp: 1200,
        baseDmg: 75,
        goldReward: 220,
        xpReward: 150,
        icon: "🧟",
        dropChance: 0.70,
        dropTable: [
            { type: "material", key: "ironOre", min: 4, max: 8, chance: 0.80 },
            { type: "material", key: "crystal", min: 2, max: 4, chance: 0.50 },
            { type: "consumable", id: "potion_major", chance: 0.30 },
            { type: "item", id: "runed_blade", chance: 0.14 },
            { type: "item", id: "shadow_cowl", chance: 0.14 },
            { type: "item", id: "ring_of_wealth", chance: 0.08 }
        ]
    },
    void_sentinel: {
        id: "void_sentinel",
        name: "Void Sentinel",
        type: "COSMIC HORROR",
        levelMin: 20,
        levelMax: 40,
        baseHp: 4500,
        baseDmg: 210,
        goldReward: 800,
        xpReward: 500,
        icon: "👿",
        dropChance: 0.80,
        dropTable: [
            { type: "material", key: "crystal", min: 4, max: 8, chance: 0.85 },
            { type: "material", key: "shadowEssence", min: 1, max: 3, chance: 0.50 },
            { type: "consumable", id: "potion_major", chance: 0.40 },
            { type: "consumable", id: "potion_full", chance: 0.15 },
            { type: "item", id: "frostbite_axe", chance: 0.15 },
            { type: "item", id: "celestial_mail", chance: 0.15 },
            { type: "item", id: "abyssal_ring", chance: 0.12 }
        ]
    },
    dragon: {
        id: "dragon",
        name: "Crown Wyrm Dragon",
        type: "ANCIENT DRAGON",
        levelMin: 35,
        levelMax: 70,
        baseHp: 18000,
        baseDmg: 750,
        goldReward: 3500,
        xpReward: 2000,
        icon: "🐉",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "dragonScale", min: 3, max: 8, chance: 0.95 },
            { type: "material", key: "shadowEssence", min: 2, max: 5, chance: 0.70 },
            { type: "consumable", id: "potion_full", chance: 0.50 },
            { type: "item", id: "dragon_slayer", chance: 0.25 },
            { type: "item", id: "dragon_scale_mail", chance: 0.25 }
        ]
    },
    lich: {
        id: "lich",
        name: "Eternal Lich Overlord",
        type: "REALM OVERLORD",
        levelMin: 60,
        levelMax: 100,
        baseHp: 85000,
        baseDmg: 3200,
        goldReward: 15000,
        xpReward: 10000,
        icon: "🔮",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "shadowEssence", min: 5, max: 12, chance: 1.0 },
            { type: "material", key: "crystal", min: 10, max: 20, chance: 1.0 },
            { type: "consumable", id: "potion_full", chance: 0.80 },
            { type: "item", id: "void_artifact", chance: 0.40 },
            { type: "item", id: "dragon_slayer", chance: 0.35 },
            { type: "item", id: "dragon_scale_mail", chance: 0.35 }
        ]
    }
};
