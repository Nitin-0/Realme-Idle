/* =========================================================
   REALM IDLE DATA - BALANCED MOBS & BOSSES DICTIONARY
   Replaced with balanced, thematic progression across all 8 Realms.
========================================================= */

window.MobsData = {
    // ---------------- REALM I: MOONLIT VALE (Lv. 1 - 6) ----------------
    goblin_scout: {
        id: "goblin_scout",
        name: "Valewood Scout",
        type: "WOODLAND RAIDER",
        levelMin: 1,
        levelMax: 4,
        baseHp: 75,
        baseDmg: 6,
        goldReward: 18,
        xpReward: 12,
        icon: "👺",
        isBoss: false,
        isUniversal: true,
        assignedMap: "moonlit_vale",
        dropChance: 0.50,
        dropTable: [
            { type: "material", key: "wood", min: 1, max: 3, chance: 0.65 },
            { type: "material", key: "ironOre", min: 1, max: 2, chance: 0.45 },
            { type: "consumable", id: "potion_minor", chance: 0.30 },
            { type: "item", id: "iron_knuckles", chance: 0.08 },
            { type: "item", id: "steel_broadsword", chance: 0.08 },
            { type: "item", id: "hunting_shortbow", chance: 0.08 }
        ]
    },
    shadow_wolf: {
        id: "shadow_wolf",
        name: "Silverfang Moon Wolf",
        type: "LUNAR PREDATOR",
        levelMin: 2,
        levelMax: 5,
        baseHp: 140,
        baseDmg: 10,
        goldReward: 30,
        xpReward: 20,
        icon: "🐺",
        isBoss: false,
        isUniversal: false,
        assignedMap: "moonlit_vale",
        dropChance: 0.55,
        dropTable: [
            { type: "material", key: "wood", min: 2, max: 4, chance: 0.70 },
            { type: "material", key: "crystal", min: 1, max: 1, chance: 0.25 },
            { type: "consumable", id: "potion_minor", chance: 0.35 },
            { type: "consumable", id: "potion_stamina", chance: 0.20 },
            { type: "item", id: "iron_spear", chance: 0.10 },
            { type: "item", id: "apprentice_elemental_wand", chance: 0.10 }
        ]
    },
    corrupted_qi_spirit: {
        id: "corrupted_qi_spirit",
        name: "Corrupted Vale Qi Wisp",
        type: "ANOMALOUS SPIRIT",
        levelMin: 3,
        levelMax: 6,
        baseHp: 210,
        baseDmg: 14,
        goldReward: 45,
        xpReward: 30,
        icon: "✨",
        isBoss: false,
        isUniversal: false,
        assignedMap: "moonlit_vale",
        dropChance: 0.60,
        dropTable: [
            { type: "material", key: "crystal", min: 1, max: 2, chance: 0.45 },
            { type: "consumable", id: "potion_minor", chance: 0.35 },
            { type: "item", id: "cloth_qi_wraps", chance: 0.12 },
            { type: "item", id: "monk_silk_gi", chance: 0.10 },
            { type: "item", id: "bone_wand", chance: 0.10 }
        ]
    },
    ironbark_treant_golem: {
        id: "ironbark_treant_golem",
        name: "Ancient Ironbark Treant",
        type: "FOREST GUARDIAN · REALM BOSS",
        levelMin: 5,
        levelMax: 8,
        baseHp: 550,
        baseDmg: 22,
        goldReward: 140,
        xpReward: 90,
        icon: "🌲",
        isBoss: true,
        isUniversal: false,
        assignedMap: "moonlit_vale",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "wood", min: 5, max: 10, chance: 1.0 },
            { type: "material", key: "crystal", min: 2, max: 4, chance: 0.75 },
            { type: "consumable", id: "potion_major", chance: 0.45 },
            { type: "item", id: "qi_gloves", chance: 0.25 },
            { type: "item", id: "twin_azure_blades", chance: 0.25 },
            { type: "item", id: "reinforced_battle_tunic", chance: 0.25 }
        ]
    },

    // ---------------- REALM II: ASHEN WASTES (Lv. 6 - 15) ----------------
    ashen_dune_skulker: {
        id: "ashen_dune_skulker",
        name: "Ashen Dune Scythe",
        type: "WASTELAND BEAST",
        levelMin: 6,
        levelMax: 10,
        baseHp: 320,
        baseDmg: 22,
        goldReward: 65,
        xpReward: 45,
        icon: "🦂",
        isBoss: false,
        isUniversal: false,
        assignedMap: "ashen_wastes",
        dropChance: 0.60,
        dropTable: [
            { type: "material", key: "ironOre", min: 2, max: 4, chance: 0.70 },
            { type: "consumable", id: "potion_minor", chance: 0.35 },
            { type: "item", id: "cavalry_pike", chance: 0.10 },
            { type: "item", id: "yew_longbow", chance: 0.10 }
        ]
    },
    flame_cultist: {
        id: "flame_cultist",
        name: "Pyre Cultist Spellblade",
        type: "ASHEN ZEALOT",
        levelMin: 8,
        levelMax: 13,
        baseHp: 480,
        baseDmg: 30,
        goldReward: 95,
        xpReward: 65,
        icon: "🔥",
        isBoss: false,
        isUniversal: false,
        assignedMap: "ashen_wastes",
        dropChance: 0.65,
        dropTable: [
            { type: "material", key: "crystal", min: 2, max: 3, chance: 0.50 },
            { type: "consumable", id: "elixir_fury", chance: 0.30 },
            { type: "item", id: "fire_frost_staff", chance: 0.12 },
            { type: "item", id: "tome_of_the_crypt", chance: 0.12 }
        ]
    },
    ashen_berserker: {
        id: "ashen_berserker",
        name: "Ashen War Berserker",
        type: "ORCISH BRUTE",
        levelMin: 10,
        levelMax: 15,
        baseHp: 680,
        baseDmg: 38,
        goldReward: 130,
        xpReward: 90,
        icon: "🧟",
        isBoss: false,
        isUniversal: false,
        assignedMap: "ashen_wastes",
        dropChance: 0.70,
        dropTable: [
            { type: "material", key: "ironOre", min: 3, max: 6, chance: 0.75 },
            { type: "consumable", id: "potion_major", chance: 0.30 },
            { type: "item", id: "spiked_war_cestus", chance: 0.14 },
            { type: "item", id: "blood_rend_claws", chance: 0.14 }
        ]
    },
    magma_lord_pyroclast: {
        id: "magma_lord_pyroclast",
        name: "Lord Pyroclast of the Ash",
        type: "ELEMENTAL TITAN · REALM BOSS",
        levelMin: 12,
        levelMax: 16,
        baseHp: 1400,
        baseDmg: 52,
        goldReward: 350,
        xpReward: 220,
        icon: "🌋",
        isBoss: true,
        isUniversal: false,
        assignedMap: "ashen_wastes",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "ironOre", min: 6, max: 12, chance: 1.0 },
            { type: "material", key: "crystal", min: 3, max: 6, chance: 0.85 },
            { type: "consumable", id: "potion_major", chance: 0.60 },
            { type: "item", id: "adamantine_knuckles", chance: 0.20 },
            { type: "item", id: "muramasa_katana", chance: 0.20 },
            { type: "item", id: "ironclad_plate_cuirass", chance: 0.20 }
        ]
    },

    // ---------------- REALM III: BLOODTHORN FOREST (Lv. 15 - 28) ----------------
    blood_fiend: {
        id: "blood_fiend",
        name: "Bloodthorn Fiend",
        type: "VAMPIRIC PARASITE",
        levelMin: 15,
        levelMax: 20,
        baseHp: 950,
        baseDmg: 48,
        goldReward: 180,
        xpReward: 120,
        icon: "🩸",
        isBoss: false,
        isUniversal: false,
        assignedMap: "bloodthorn_forest",
        dropChance: 0.65,
        dropTable: [
            { type: "material", key: "wood", min: 4, max: 8, chance: 0.70 },
            { type: "consumable", id: "potion_major", chance: 0.35 },
            { type: "item", id: "fury_carnage_blades", chance: 0.12 },
            { type: "item", id: "shadow_composite_bow", chance: 0.12 }
        ]
    },
    spectral_assassin: {
        id: "spectral_assassin",
        name: "Crimson Shadow Wraith",
        type: "PHANTOM BLADE",
        levelMin: 18,
        levelMax: 24,
        baseHp: 1350,
        baseDmg: 62,
        goldReward: 240,
        xpReward: 165,
        icon: "👻",
        isBoss: false,
        isUniversal: false,
        assignedMap: "bloodthorn_forest",
        dropChance: 0.70,
        dropTable: [
            { type: "material", key: "crystal", min: 3, max: 5, chance: 0.60 },
            { type: "material", key: "shadowEssence", min: 1, max: 1, chance: 0.30 },
            { type: "consumable", id: "elixir_iron", chance: 0.30 },
            { type: "item", id: "celestial_qi_gloves", chance: 0.14 },
            { type: "item", id: "soul_reaper_scythe", chance: 0.14 }
        ]
    },
    thorn_wyrm: {
        id: "thorn_wyrm",
        name: "Venomfang Forest Drake",
        type: "DRACONIC BEAST",
        levelMin: 20,
        levelMax: 27,
        baseHp: 1800,
        baseDmg: 76,
        goldReward: 320,
        xpReward: 220,
        icon: "🐉",
        isBoss: false,
        isUniversal: false,
        assignedMap: "bloodthorn_forest",
        dropChance: 0.75,
        dropTable: [
            { type: "material", key: "dragonScale", min: 1, max: 2, chance: 0.40 },
            { type: "consumable", id: "potion_major", chance: 0.40 },
            { type: "item", id: "crimson_dragonlance", chance: 0.15 },
            { type: "item", id: "void_crystal_wand", chance: 0.15 }
        ]
    },
    crimson_vampire_lord: {
        id: "crimson_vampire_lord",
        name: "Archon Malakor the Blood Sovereign",
        type: "IMMORTAL ARCHON · REALM BOSS",
        levelMin: 24,
        levelMax: 28,
        baseHp: 3400,
        baseDmg: 98,
        goldReward: 800,
        xpReward: 500,
        icon: "🦇",
        isBoss: true,
        isUniversal: false,
        assignedMap: "bloodthorn_forest",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "dragonScale", min: 2, max: 4, chance: 0.85 },
            { type: "material", key: "shadowEssence", min: 2, max: 3, chance: 0.70 },
            { type: "consumable", id: "potion_full", chance: 0.30 },
            { type: "item", id: "vorpal_dragon_blade", chance: 0.25 },
            { type: "item", id: "valkyrie_war_halberd", chance: 0.25 }
        ]
    },

    // ---------------- REALM IV: FROSTPEAK CITADEL (Lv. 28 - 45) ----------------
    frost_shield_sentinel: {
        id: "frost_shield_sentinel",
        name: "Glacial Iron Sentinel",
        type: "ANCIENT CONSTRUCT",
        levelMin: 28,
        levelMax: 35,
        baseHp: 2600,
        baseDmg: 92,
        goldReward: 450,
        xpReward: 300,
        icon: "🛡️",
        isBoss: false,
        isUniversal: false,
        assignedMap: "frostpeak",
        dropChance: 0.70,
        dropTable: [
            { type: "material", key: "ironOre", min: 4, max: 8, chance: 0.80 },
            { type: "material", key: "crystal", min: 3, max: 5, chance: 0.60 },
            { type: "consumable", id: "potion_major", chance: 0.40 },
            { type: "item", id: "colossus_war_gauntlets", chance: 0.14 }
        ]
    },
    ice_lich: {
        id: "ice_lich",
        name: "Permafrost Cryomancer",
        type: "FROZEN SPELLWEAVER",
        levelMin: 32,
        levelMax: 40,
        baseHp: 3400,
        baseDmg: 115,
        goldReward: 580,
        xpReward: 400,
        icon: "❄️",
        isBoss: false,
        isUniversal: false,
        assignedMap: "frostpeak",
        dropChance: 0.75,
        dropTable: [
            { type: "material", key: "crystal", min: 4, max: 7, chance: 0.75 },
            { type: "consumable", id: "potion_major", chance: 0.45 },
            { type: "item", id: "hexa_prismatic_archstaff", chance: 0.15 },
            { type: "item", id: "storm_windrunner_bow", chance: 0.15 }
        ]
    },
    frost_dragon_boss: {
        id: "frost_dragon_boss",
        name: "High Wyrm Boreas the Frost Lord",
        type: "ANCIENT ICE DRAGON · REALM BOSS",
        levelMin: 40,
        levelMax: 48,
        baseHp: 7800,
        baseDmg: 175,
        goldReward: 1800,
        xpReward: 1200,
        icon: "🐲",
        isBoss: true,
        isUniversal: false,
        assignedMap: "frostpeak",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "dragonScale", min: 3, max: 6, chance: 0.95 },
            { type: "material", key: "crystal", min: 6, max: 12, chance: 0.90 },
            { type: "consumable", id: "potion_full", chance: 0.50 },
            { type: "item", id: "dragon_qi_talons", chance: 0.25 },
            { type: "item", id: "astral_spellweave_robe", chance: 0.25 }
        ]
    },

    // ---------------- REALM V: INFERNAL DEPTHS (Lv. 45 - 65) ----------------
    hellhound: {
        id: "hellhound",
        name: "Brimstone Cerberus",
        type: "NETHER BEAST",
        levelMin: 45,
        levelMax: 52,
        baseHp: 5800,
        baseDmg: 165,
        goldReward: 1050,
        xpReward: 750,
        icon: "🐕",
        isBoss: false,
        isUniversal: false,
        assignedMap: "infernal_depths",
        dropChance: 0.75,
        dropTable: [
            { type: "material", key: "dragonScale", min: 2, max: 4, chance: 0.70 },
            { type: "consumable", id: "potion_full", chance: 0.35 },
            { type: "item", id: "berserker_frenzy_talons", chance: 0.16 }
        ]
    },
    infernal_demon: {
        id: "infernal_demon",
        name: "Netherflame Warmaster",
        type: "INFERNAL NOBLE",
        levelMin: 50,
        levelMax: 60,
        baseHp: 7600,
        baseDmg: 210,
        goldReward: 1400,
        xpReward: 1000,
        icon: "👿",
        isBoss: false,
        isUniversal: false,
        assignedMap: "infernal_depths",
        dropChance: 0.80,
        dropTable: [
            { type: "material", key: "shadowEssence", min: 2, max: 4, chance: 0.75 },
            { type: "consumable", id: "potion_full", chance: 0.40 },
            { type: "item", id: "lich_bone_staff", chance: 0.18 }
        ]
    },
    infernal_overlord: {
        id: "infernal_overlord",
        name: "Infernus the Molten Tyrant",
        type: "CALAMITY OVERLORD · REALM BOSS",
        levelMin: 58,
        levelMax: 66,
        baseHp: 16000,
        baseDmg: 295,
        goldReward: 4200,
        xpReward: 2800,
        icon: "🔥",
        isBoss: true,
        isUniversal: false,
        assignedMap: "infernal_depths",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "dragonScale", min: 4, max: 8, chance: 1.0 },
            { type: "material", key: "shadowEssence", min: 3, max: 6, chance: 0.85 },
            { type: "consumable", id: "potion_full", chance: 0.60 },
            { type: "item", id: "excalibur_lightbringer", chance: 0.25 },
            { type: "item", id: "celestial_dragon_armor", chance: 0.25 }
        ]
    },

    // ---------------- REALM VI: VOID SANCTUM (Lv. 65 - 80) ----------------
    void_stalker: {
        id: "void_stalker",
        name: "Singularity Reaver",
        type: "COSMIC ENTITY",
        levelMin: 65,
        levelMax: 74,
        baseHp: 11500,
        baseDmg: 280,
        goldReward: 2200,
        xpReward: 1600,
        icon: "🕳️",
        isBoss: false,
        isUniversal: false,
        assignedMap: "void_sanctum",
        dropChance: 0.80,
        dropTable: [
            { type: "material", key: "shadowEssence", min: 3, max: 5, chance: 0.85 },
            { type: "consumable", id: "potion_full", chance: 0.50 },
            { type: "item", id: "chaos_nightmare_staff", chance: 0.20 }
        ]
    },
    chaos_avatar: {
        id: "chaos_avatar",
        name: "Arch-Harbinger of Oblivion",
        type: "VOID SOVEREIGN · REALM BOSS",
        levelMin: 75,
        levelMax: 85,
        baseHp: 28000,
        baseDmg: 440,
        goldReward: 8500,
        xpReward: 5500,
        icon: "🌌",
        isBoss: true,
        isUniversal: false,
        assignedMap: "void_sanctum",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "shadowEssence", min: 5, max: 10, chance: 1.0 },
            { type: "consumable", id: "potion_full", chance: 0.80 },
            { type: "item", id: "asura_world_crushers", chance: 0.30 },
            { type: "item", id: "starfall_celestial_greatbow", chance: 0.30 }
        ]
    },

    // ---------------- REALM VII: DRAGON'S CROWN (Lv. 80 - 92) ----------------
    wyrmguard_drake: {
        id: "wyrmguard_drake",
        name: "Primal Elder Drake",
        type: "STARFORGED DRAKE",
        levelMin: 80,
        levelMax: 88,
        baseHp: 21000,
        baseDmg: 420,
        goldReward: 4500,
        xpReward: 3200,
        icon: "🐲",
        isBoss: false,
        isUniversal: false,
        assignedMap: "dragons_crown",
        dropChance: 0.85,
        dropTable: [
            { type: "material", key: "dragonScale", min: 5, max: 8, chance: 1.0 },
            { type: "consumable", id: "potion_full", chance: 0.60 },
            { type: "item", id: "gungnir_god_spear", chance: 0.22 }
        ]
    },
    celestial_dragon_aurelius: {
        id: "celestial_dragon_aurelius",
        name: "Aurelius the Star Emperor Dragon",
        type: "CELESTIAL DRAGON · REALM BOSS",
        levelMin: 88,
        levelMax: 95,
        baseHp: 46000,
        baseDmg: 650,
        goldReward: 16000,
        xpReward: 11000,
        icon: "🐉",
        isBoss: true,
        isUniversal: false,
        assignedMap: "dragons_crown",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "dragonScale", min: 8, max: 15, chance: 1.0 },
            { type: "material", key: "crystal", min: 15, max: 25, chance: 1.0 },
            { type: "consumable", id: "potion_full", chance: 1.0 },
            { type: "item", id: "phoenix_transcendence_fists", chance: 0.35 },
            { type: "item", id: "celestial_elemental_orb", chance: 0.35 }
        ]
    },

    // ---------------- REALM VIII: ETERNAL REALM (Lv. 92 - 100) ----------------
    astral_revenant: {
        id: "astral_revenant",
        name: "Ascended Star Revenant",
        type: "APEX CELESTIAL",
        levelMin: 92,
        levelMax: 98,
        baseHp: 36000,
        baseDmg: 620,
        goldReward: 8500,
        xpReward: 6000,
        icon: "🌟",
        isBoss: false,
        isUniversal: false,
        assignedMap: "eternal_realm",
        dropChance: 0.90,
        dropTable: [
            { type: "material", key: "shadowEssence", min: 6, max: 12, chance: 1.0 },
            { type: "consumable", id: "potion_full", chance: 0.80 },
            { type: "item", id: "behemoth_bloodlust_claws", chance: 0.25 }
        ]
    },
    lich_king_immortal: {
        id: "lich_king_immortal",
        name: "Primordial Lich King Thanatos",
        type: "ETERNAL REALM OVERLORD",
        levelMin: 95,
        levelMax: 100,
        baseHp: 62000,
        baseDmg: 780,
        goldReward: 28000,
        xpReward: 18000,
        icon: "🔮",
        isBoss: true,
        isUniversal: false,
        assignedMap: "eternal_realm",
        dropChance: 1.0,
        dropTable: [
            { type: "material", key: "shadowEssence", min: 10, max: 20, chance: 1.0 },
            { type: "material", key: "crystal", min: 15, max: 30, chance: 1.0 },
            { type: "consumable", id: "potion_full", chance: 1.0 },
            { type: "item", id: "death_god_reliquary", chance: 0.40 },
            { type: "item", id: "sol_invictus_pillar", chance: 0.40 }
        ]
    },
    weaver_of_duality: {
        id: "weaver_of_duality",
        name: "The Weaver of Duality",
        type: "PARADOX ENTITY · DUALITY SOVEREIGN",
        levelMin: 5,
        levelMax: 100,
        baseHp: 24000,
        baseDmg: 95,
        goldReward: 50000,
        xpReward: 30000,
        icon: "👁️",
        isBoss: true,
        isParadoxBoss: true,
        isUniversal: false,
        assignedMap: "all",
        dropChance: 1.0,
        dropTable: [
            { type: "item", id: "equilibrium_crown", chance: 1.0 }
        ]
    }
};

// Aliases for backwards compatibility with any hardcoded references
window.MobsData.goblin = window.MobsData.goblin_scout;
window.MobsData.wolf = window.MobsData.shadow_wolf;
window.MobsData.skeleton = window.MobsData.corrupted_qi_spirit;
window.MobsData.orc = window.MobsData.ashen_berserker;
window.MobsData.void_sentinel = window.MobsData.frost_shield_sentinel;
window.MobsData.dragon = window.MobsData.frost_dragon_boss;
window.MobsData.lich = window.MobsData.lich_king_immortal;
