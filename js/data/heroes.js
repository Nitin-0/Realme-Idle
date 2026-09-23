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
        }
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
        }
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
        }
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
        }
    }
};
