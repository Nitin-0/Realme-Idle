/* =========================================================
   REALM IDLE DATA - HERO CLASSES DICTIONARY
========================================================= */

window.HeroesData = {
    knight: {
        id: "knight",
        name: "Knight Templar",
        icon: "🛡️",
        description: "Stalwart defender with high Defense, armor block, and damage mitigation.",
        unlocked: true,
        baseAttack: 40,
        baseDefense: 15,
        baseCritChance: 0.10,
        baseCritDmg: 1.5,
        baseDodge: 0.05,
        baseLifesteal: 0.0,
        perks: "+50% bonus from Shields and Armor; high baseline durability.",
        skill: {
            id: "shield_slam",
            name: "Shield Slam",
            icon: "🛡️",
            cooldown: 8,
            damageMult: 2.2,
            healPct: 0.0,
            buff: { name: "Iron Bastion", stat: "defense", bonus: 25, duration: 4 },
            description: "Crushes enemy for 220% Attack damage and increases Defense by +25 for 4s."
        },
        skillsPool: [
            {
                id: "shield_slam",
                name: "Shield Slam",
                icon: "🛡️",
                cooldown: 8,
                damageMult: 2.2,
                healPct: 0.0,
                buff: { name: "Iron Bastion", stat: "defense", bonus: 25, duration: 4 },
                description: "Crushes enemy for 220% Attack damage and increases Defense by +25 for 4s.",
                isDefault: true
            },
            {
                id: "whirlwind_slash",
                name: "Whirlwind Slash",
                icon: "🌪️",
                cooldown: 7,
                damageMult: 2.8,
                healPct: 0.0,
                buff: { name: "Battle Trance", stat: "critChance", bonus: 0.10, duration: 4 },
                description: "Spins through enemy defenses for 280% Attack damage and +10% Crit for 4s.",
                scrollId: "scroll_whirlwind"
            },
            {
                id: "holy_bastion",
                name: "Holy Bastion",
                icon: "🏰",
                cooldown: 9,
                damageMult: 1.8,
                healPct: 0.15,
                buff: { name: "Aegis Wall", stat: "defense", bonus: 40, duration: 5 },
                description: "Fortifies stance for 180% damage, recovers 15% Max HP, and +40 Defense for 5s.",
                scrollId: "scroll_holy_bastion"
            },
            {
                id: "judgment_blade",
                name: "Heavenly Judgment",
                icon: "⚡",
                cooldown: 11,
                damageMult: 3.8,
                healPct: 0.08,
                buff: { name: "Divine Retribution", stat: "attack", bonus: 45, duration: 5 },
                description: "Strikes with divine thunder for 380% damage, +45 Attack, and 8% Max HP heal.",
                scrollId: "scroll_judgment"
            }
        ],
        promotions: [
            {
                rank: 2,
                title: "Knight Captain",
                reqLevel: 10,
                materials: { ironOre: 10, wood: 5 },
                goldCost: 500,
                bonus: { attack: 20, defense: 15, maxHp: 80 },
                description: "Rank 2 Mastery: +20 Attack, +15 Defense, +80 Max HP."
            },
            {
                rank: 3,
                title: "Grand Templar",
                reqLevel: 20,
                materials: { crystal: 5, dragonScale: 2 },
                goldCost: 2500,
                bonus: { attack: 45, defense: 30, maxHp: 200, dodge: 0.03 },
                description: "Rank 3 Mastery: +45 Attack, +30 Defense, +200 Max HP, +3% Dodge."
            }
        ],
        passives: [
            { id: "k_p1", reqLevel: 1, name: "Aegis of the Sun God", icon: "🛡️", lore: "You have been blessed by the gods: Sol Invictus infuses your shield with impenetrable radiant light.", bonus: { maxHp: 30, defense: 8 }, description: "+30 Max HP, +8 Defense" },
            { id: "k_p5", reqLevel: 5, name: "Titan's Granite Bulwark", icon: "🪨", lore: "You have been blessed by the gods: The Earth Mother strengthens your bones like ancient mountain stone.", bonus: { maxHp: 60, defense: 16, attack: 12 }, description: "+60 Max HP, +16 Defense, +12 Attack" },
            { id: "k_p10", reqLevel: 10, name: "Vow of the Iron Fortress", icon: "🏰", lore: "You have been blessed by the gods: Hephaestus tempers your soul and armor in sacred celestial flame.", bonus: { maxHp: 110, defense: 26, attack: 22, critChance: 0.03 }, description: "+110 Max HP, +26 Defense, +22 Attack, +3% Crit" },
            { id: "k_p15", reqLevel: 15, name: "Divine Aegis of Aincrad", icon: "🛡️", lore: "You have been blessed by the gods: Towering celestials grant supreme fortress deflection.", bonus: { maxHp: 160, defense: 38, attack: 34, dodge: 0.03 }, description: "+160 Max HP, +38 Defense, +34 Attack, +3% Dodge" },
            { id: "k_p20", reqLevel: 20, name: "Ascendant Templar Avatar", icon: "⚜️", lore: "You have been blessed by the gods: The highest pantheon makes your blade unbreakable.", bonus: { maxHp: 240, defense: 55, attack: 50, critChance: 0.05 }, description: "+240 Max HP, +55 Defense, +50 Attack, +5% Crit" },
            { id: "k_p25", reqLevel: 25, name: "God of Iron & Thunder", icon: "⚡", lore: "You have been blessed by the gods: Thunderous divinities crown your eternal vigilance.", bonus: { maxHp: 340, defense: 80, attack: 70, dodge: 0.05 }, description: "+340 Max HP, +80 Defense, +70 Attack, +5% Dodge" },
            { id: "k_p30", reqLevel: 30, name: "Immortal World-Breaker", icon: "🌟", lore: "You have been blessed by the gods: The celestial gods manifest entirely through your armor.", bonus: { maxHp: 520, defense: 120, attack: 105, dodge: 0.08, critChance: 0.05 }, description: "+520 Max HP, +120 Defense, +105 Attack, +8% Dodge, +5% Crit" }
        ]
    },
    rogue: {
        id: "rogue",
        name: "Shadow Rogue",
        icon: "🗡️",
        description: "Deadly assassin specializing in high Critical strike chance, Dodge, and burst strikes.",
        unlocked: true,
        baseAttack: 48,
        baseDefense: 8,
        baseCritChance: 0.25,
        baseCritDmg: 2.0,
        baseDodge: 0.15,
        baseLifesteal: 0.0,
        perks: "+15% inherent Dodge; 200% base Critical damage multiplier.",
        skill: {
            id: "shadowstrike",
            name: "Shadowstrike",
            icon: "🗡️",
            cooldown: 7,
            damageMult: 3.2,
            healPct: 0.0,
            buff: { name: "Smoke Veil", stat: "dodge", bonus: 0.25, duration: 4 },
            description: "Strikes from stealth for 320% Attack damage with +25% Dodge for 4s."
        },
        skillsPool: [
            {
                id: "shadowstrike",
                name: "Shadowstrike",
                icon: "🗡️",
                cooldown: 7,
                damageMult: 3.2,
                healPct: 0.0,
                buff: { name: "Smoke Veil", stat: "dodge", bonus: 0.25, duration: 4 },
                description: "Strikes from stealth for 320% Attack damage with +25% Dodge for 4s.",
                isDefault: true
            },
            {
                id: "poison_blade",
                name: "Venomous Flurry",
                icon: "🐍",
                cooldown: 6,
                damageMult: 2.6,
                healPct: 0.0,
                buff: { name: "Viper Essence", stat: "lifesteal", bonus: 0.08, duration: 6 },
                description: "Coats daggers in deadly venom for 260% damage and +8% Lifesteal for 6s.",
                scrollId: "scroll_poison_blade"
            },
            {
                id: "smoke_bomb",
                name: "Smoke Veil Bomb",
                icon: "💨",
                cooldown: 8,
                damageMult: 2.0,
                healPct: 0.0,
                buff: { name: "Total Concealment", stat: "dodge", bonus: 0.35, duration: 5 },
                description: "Blinds the foe for 200% damage, granting +35% Dodge and +12% Crit for 5s.",
                scrollId: "scroll_smoke_bomb"
            },
            {
                id: "assassinate",
                name: "Death Blossom",
                icon: "🩸",
                cooldown: 10,
                damageMult: 4.4,
                healPct: 0.0,
                buff: { name: "Blood Rush", stat: "critChance", bonus: 0.20, duration: 4 },
                description: "Lethal execution dealing 440% Critical Pierce damage with +20% Crit for 4s.",
                scrollId: "scroll_assassinate"
            }
        ],
        promotions: [
            {
                rank: 2,
                title: "Shadowblade",
                reqLevel: 10,
                materials: { ironOre: 8, wood: 8 },
                goldCost: 500,
                bonus: { attack: 28, critChance: 0.05, maxHp: 50 },
                description: "Rank 2 Mastery: +28 Attack, +5% Crit Chance, +50 Max HP."
            },
            {
                rank: 3,
                title: "Phantom Assassin",
                reqLevel: 20,
                materials: { crystal: 4, shadowEssence: 2 },
                goldCost: 2500,
                bonus: { attack: 60, critChance: 0.10, dodge: 0.08, maxHp: 120 },
                description: "Rank 3 Mastery: +60 Attack, +10% Crit Chance, +8% Dodge, +120 Max HP."
            }
        ],
        passives: [
            { id: "r_p1", reqLevel: 1, name: "Shadow Mother's Whisper", icon: "🗡️", lore: "You have been blessed by the gods: The Night Mother shrouds your footsteps in silent dread.", bonus: { attack: 15, dodge: 0.04 }, description: "+15 Attack, +4% Dodge" },
            { id: "r_p5", reqLevel: 5, name: "Eye of the Moon Raven", icon: "👁️", lore: "You have been blessed by the gods: Raven divinities guide your daggers to mortal seams.", bonus: { attack: 26, critChance: 0.05, dodge: 0.04 }, description: "+26 Attack, +5% Crit Chance, +4% Dodge" },
            { id: "r_p10", reqLevel: 10, name: "Zephyr of the Wind God", icon: "💨", lore: "You have been blessed by the gods: The God of Gales grants miraculous velocity.", bonus: { attack: 48, critChance: 0.08, dodge: 0.06, maxHp: 50 }, description: "+48 Attack, +8% Crit, +6% Dodge, +50 HP" },
            { id: "r_p15", reqLevel: 15, name: "Divine Daggerstorm", icon: "🗡️", lore: "You have been blessed by the gods: Gods of slaughter double the swiftness of your strikes.", bonus: { attack: 80, critChance: 0.10, dodge: 0.08, lifesteal: 0.04 }, description: "+80 Attack, +10% Crit, +8% Dodge, +4% Lifesteal" },
            { id: "r_p20", reqLevel: 20, name: "Void Walker Avatar", icon: "✨", lore: "You have been blessed by the gods: You walk between planes where blades cannot graze you.", bonus: { attack: 125, critChance: 0.12, dodge: 0.10, maxHp: 110 }, description: "+125 Attack, +12% Crit, +10% Dodge, +110 HP" },
            { id: "r_p25", reqLevel: 25, name: "Reaper of Astral Void", icon: "💀", lore: "You have been blessed by the gods: Cosmic deities bestow devastating execution prowess.", bonus: { attack: 185, critChance: 0.15, lifesteal: 0.08, dodge: 0.12 }, description: "+185 Attack, +15% Crit, +8% Lifesteal, +12% Dodge" },
            { id: "r_p30", reqLevel: 30, name: "Incarnate of Eternal Dusk", icon: "🌟", lore: "You have been blessed by the gods: You are become death, blessed by primordial night gods.", bonus: { attack: 270, critChance: 0.20, dodge: 0.15, maxHp: 220 }, description: "+270 Attack, +20% Crit, +15% Dodge, +220 HP" }
        ]
    },
    mage: {
        id: "mage",
        name: "Arcane Archmage",
        icon: "🔮",
        description: "Master of devastating elemental burst damage and arcane energy drain.",
        unlocked: true,
        baseAttack: 55,
        baseDefense: 5,
        baseCritChance: 0.15,
        baseCritDmg: 1.6,
        baseDodge: 0.05,
        baseLifesteal: 0.05,
        perks: "Highest base attack power; innate 5% arcane lifesteal on all strikes.",
        skill: {
            id: "arcane_meteor",
            name: "Arcane Meteor",
            icon: "☄️",
            cooldown: 10,
            damageMult: 4.2,
            healPct: 0.05,
            buff: { name: "Arcane Surge", stat: "critChance", bonus: 0.15, duration: 5 },
            description: "Calls down an arcane meteor for 420% Attack damage and +15% Crit for 5s."
        },
        skillsPool: [
            {
                id: "arcane_meteor",
                name: "Arcane Meteor",
                icon: "☄️",
                cooldown: 10,
                damageMult: 4.2,
                healPct: 0.05,
                buff: { name: "Arcane Surge", stat: "critChance", bonus: 0.15, duration: 5 },
                description: "Calls down an arcane meteor for 420% Attack damage and +15% Crit for 5s.",
                isDefault: true
            },
            {
                id: "frost_nova",
                name: "Frost Nova",
                icon: "❄️",
                cooldown: 8,
                damageMult: 3.0,
                healPct: 0.0,
                buff: { name: "Permafrost Shield", stat: "defense", bonus: 25, duration: 5 },
                description: "Deep freezes enemy for 300% Ice damage and grants +25 Defense for 5s.",
                scrollId: "scroll_frost_nova"
            },
            {
                id: "mana_shield",
                name: "Arcane Barrier",
                icon: "🔮",
                cooldown: 9,
                damageMult: 2.2,
                healPct: 0.20,
                buff: { name: "Rune Ward", stat: "defense", bonus: 35, duration: 6 },
                description: "Conjures an astral sphere for 220% damage, recovers 20% Max HP, and +35 Def for 6s.",
                scrollId: "scroll_mana_shield"
            },
            {
                id: "meteor_strike",
                name: "Meteor Calamity",
                icon: "🌌",
                cooldown: 12,
                damageMult: 5.2,
                healPct: 0.05,
                buff: { name: "Supernova Grace", stat: "attack", bonus: 60, duration: 5 },
                description: "Tears open cosmic rifts for 520% Cataclysmic damage and +60 Attack for 5s.",
                scrollId: "scroll_meteor"
            }
        ],
        promotions: [
            {
                rank: 2,
                title: "High Magus",
                reqLevel: 10,
                materials: { crystal: 6, wood: 6 },
                goldCost: 500,
                bonus: { attack: 35, lifesteal: 0.03, maxHp: 40 },
                description: "Rank 2 Mastery: +35 Attack, +3% Lifesteal, +40 Max HP."
            },
            {
                rank: 3,
                title: "Void Elementalist",
                reqLevel: 20,
                materials: { crystal: 8, shadowEssence: 3 },
                goldCost: 2500,
                bonus: { attack: 75, lifesteal: 0.05, critChance: 0.06, maxHp: 100 },
                description: "Rank 3 Mastery: +75 Attack, +5% Lifesteal, +6% Crit, +100 Max HP."
            }
        ],
        passives: [
            { id: "m_p1", reqLevel: 1, name: "Gift of the Astral Muse", icon: "🔮", lore: "You have been blessed by the gods: The Celestial Muse channels starlight directly into your mind.", bonus: { attack: 18, lifesteal: 0.03 }, description: "+18 Attack, +3% Lifesteal" },
            { id: "m_p5", reqLevel: 5, name: "Flame of Primordial Forge", icon: "🔥", lore: "You have been blessed by the gods: The Fire God ignites sacred arcane combustion in your soul.", bonus: { attack: 32, critChance: 0.05, maxHp: 35 }, description: "+32 Attack, +5% Crit Chance, +35 HP" },
            { id: "m_p10", reqLevel: 10, name: "Eye of Chronomancer God", icon: "⏳", lore: "You have been blessed by the gods: The Time Keeper decelerates reality around your incantations.", bonus: { attack: 58, critChance: 0.07, lifesteal: 0.04, maxHp: 70 }, description: "+58 Attack, +7% Crit, +4% Lifesteal, +70 HP" },
            { id: "m_p15", reqLevel: 15, name: "Pillar of Celestial Eternity", icon: "☄️", lore: "You have been blessed by the gods: Ancient gods grant infinite conduit to astral magic.", bonus: { attack: 95, critChance: 0.09, lifesteal: 0.05, maxHp: 100 }, description: "+95 Attack, +9% Crit, +5% Lifesteal, +100 HP" },
            { id: "m_p20", reqLevel: 20, name: "Astral Titan Conduit", icon: "🌟", lore: "You have been blessed by the gods: Starforged titans infuse your incantations with cataclysmic power.", bonus: { attack: 150, critChance: 0.12, lifesteal: 0.06, maxHp: 150 }, description: "+150 Attack, +12% Crit, +6% Lifesteal, +150 HP" },
            { id: "m_p25", reqLevel: 25, name: "Lord of Cosmic Nexus", icon: "🔮", lore: "You have been blessed by the gods: Primordial deities grant absolute mastery over reality.", bonus: { attack: 220, critChance: 0.15, lifesteal: 0.08, maxHp: 210 }, description: "+220 Attack, +15% Crit, +8% Lifesteal, +210 HP" },
            { id: "m_p30", reqLevel: 30, name: "Avatar of Starry Expanse", icon: "✨", lore: "You have been blessed by the gods: The cosmos itself bows to your divine will.", bonus: { attack: 310, critChance: 0.20, lifesteal: 0.10, maxHp: 320 }, description: "+310 Attack, +20% Crit, +10% Lifesteal, +320 HP" }
        ]
    },
    paladin: {
        id: "paladin",
        name: "Holy Paladin",
        icon: "⚜️",
        description: "Holy warrior combining resilient plate armor with radiant healing strikes.",
        unlocked: true,
        baseAttack: 42,
        baseDefense: 18,
        baseCritChance: 0.12,
        baseCritDmg: 1.5,
        baseDodge: 0.05,
        baseLifesteal: 0.03,
        perks: "Balanced high defense and natural sustain through holy radiance.",
        skill: {
            id: "holy_radiance",
            name: "Holy Radiance",
            icon: "✨",
            cooldown: 9,
            damageMult: 2.0,
            healPct: 0.25,
            buff: { name: "Blessed Ward", stat: "defense", bonus: 15, duration: 5 },
            description: "Deals 200% Holy damage and immediately restores 25% of maximum HP."
        },
        skillsPool: [
            {
                id: "holy_radiance",
                name: "Holy Radiance",
                icon: "✨",
                cooldown: 9,
                damageMult: 2.0,
                healPct: 0.25,
                buff: { name: "Blessed Ward", stat: "defense", bonus: 15, duration: 5 },
                description: "Deals 200% Holy damage and immediately restores 25% of maximum HP.",
                isDefault: true
            },
            {
                id: "divine_retribution",
                name: "Divine Retribution",
                icon: "🔨",
                cooldown: 8,
                damageMult: 3.1,
                healPct: 0.10,
                buff: { name: "Holy Aegis", stat: "defense", bonus: 30, duration: 5 },
                description: "Smites for 310% Holy damage, restores 10% Max HP, and +30 Defense for 5s.",
                scrollId: "scroll_divine_retribution"
            },
            {
                id: "consecration",
                name: "Sacred Ground",
                icon: "🌟",
                cooldown: 9,
                damageMult: 2.6,
                healPct: 0.18,
                buff: { name: "Consecrated Armor", stat: "defense", bonus: 25, duration: 6 },
                description: "Consecrates the earth for 260% damage, recovers 18% Max HP, and +25 Def for 6s.",
                scrollId: "scroll_consecration"
            },
            {
                id: "wrath_of_heavens",
                name: "Avatar of Light",
                icon: "⚜️",
                cooldown: 11,
                damageMult: 4.2,
                healPct: 0.22,
                buff: { name: "Heavenly Might", stat: "attack", bonus: 40, duration: 5 },
                description: "Channels heavenly power for 420% damage, +40 Attack, +30 Def, and 22% Max HP heal.",
                scrollId: "scroll_wrath_of_heavens"
            }
        ],
        promotions: [
            {
                rank: 2,
                title: "Crusader Warden",
                reqLevel: 10,
                materials: { ironOre: 10, crystal: 3 },
                goldCost: 500,
                bonus: { attack: 22, defense: 18, maxHp: 90 },
                description: "Rank 2 Mastery: +22 Attack, +18 Defense, +90 Max HP."
            },
            {
                rank: 3,
                title: "Divine Justiciar",
                reqLevel: 20,
                materials: { dragonScale: 3, crystal: 5 },
                goldCost: 2500,
                bonus: { attack: 50, defense: 35, maxHp: 220, lifesteal: 0.04 },
                description: "Rank 3 Mastery: +50 Attack, +35 Defense, +220 Max HP, +4% Lifesteal."
            }
        ],
        passives: [
            { id: "p_p1", reqLevel: 1, name: "Benediction of Seraphim", icon: "✨", lore: "You have been blessed by the gods: Radiant seraph wings deflect malicious strikes.", bonus: { maxHp: 35, defense: 8, lifesteal: 0.02 }, description: "+35 Max HP, +8 Defense, +2% Lifesteal" },
            { id: "p_p5", reqLevel: 5, name: "Righteous Hammer of Justice", icon: "🔨", lore: "You have been blessed by the gods: The God of Righteousness weights your strikes with divine verdict.", bonus: { attack: 22, defense: 15, maxHp: 70 }, description: "+22 Attack, +15 Defense, +70 HP" },
            { id: "p_p10", reqLevel: 10, name: "Crusader Paragon's Halo", icon: "✨", lore: "You have been blessed by the gods: The divine pantheon crowns you a living avatar of the light.", bonus: { attack: 40, defense: 25, maxHp: 120, lifesteal: 0.04 }, description: "+40 Attack, +25 Defense, +120 HP, +4% Lifesteal" },
            { id: "p_p15", reqLevel: 15, name: "Radiant Bastion of Dawn", icon: "☀️", lore: "You have been blessed by the gods: Solar deities bless you with everlasting endurance.", bonus: { attack: 65, defense: 38, maxHp: 180, lifesteal: 0.05 }, description: "+65 Attack, +38 Defense, +180 HP, +5% Lifesteal" },
            { id: "p_p20", reqLevel: 20, name: "Divine Justiciar Avatar", icon: "⚜️", lore: "You have been blessed by the gods: Archangels manifest in your presence, crushing all darkness.", bonus: { attack: 100, defense: 58, maxHp: 260, lifesteal: 0.06 }, description: "+100 Attack, +58 Defense, +260 HP, +6% Lifesteal" },
            { id: "p_p25", reqLevel: 25, name: "Sovereign of Holy Sanctum", icon: "🏰", lore: "You have been blessed by the gods: The highest heavens bestow invulnerable majesty.", bonus: { attack: 155, defense: 85, maxHp: 380, lifesteal: 0.08 }, description: "+155 Attack, +85 Defense, +380 HP, +8% Lifesteal" },
            { id: "p_p30", reqLevel: 30, name: "Seraphic High Paragon", icon: "🌟", lore: "You have been blessed by the gods: True immortality through holy transcendence.", bonus: { attack: 230, defense: 120, maxHp: 540, lifesteal: 0.10 }, description: "+230 Attack, +120 Defense, +540 HP, +10% Lifesteal" }
        ]
    }
};

// Universal map of all skills indexed by ID
window.AllSkillsData = {};
window.DefaultHeroPromotions = {};

Object.values(window.HeroesData).forEach(hero => {
    // Ensure promotions have both bonus and bonusStats for cross-compatibility
    if (hero.promotions) {
        hero.promotions.forEach(p => {
            if (!p.bonusStats && p.bonus) p.bonusStats = { ...p.bonus };
            if (!p.bonus && p.bonusStats) p.bonus = { ...p.bonusStats };
        });
        window.DefaultHeroPromotions[hero.id] = JSON.parse(JSON.stringify(hero.promotions));
    }

    if (hero.skillsPool) {
        hero.skillsPool.forEach(sk => {
            window.AllSkillsData[sk.id] = { ...sk, heroClass: hero.id };
        });
    } else if (hero.skill) {
        window.AllSkillsData[hero.skill.id] = { ...hero.skill, heroClass: hero.id };
    }
});
