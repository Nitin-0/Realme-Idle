/* =========================================================
   REALM IDLE DATA - HERO CLASSES & SUBCLASSES DICTIONARY
   Classes: Martial Artist, Weapon Master, Mage
   Subclasses:
     - Martial Artist: Warrior, Qi Warrior, Berserker
     - Weapon Master: Swordsman, Spearman, Archer
     - Mage: Elemental Mage (6 Elements), Necromancer, Divine Sorcerer, Dark Sorcerer, Spirit Mage
========================================================= */

window.HeroesData = {
    // =========================================================
    // 1. MARTIAL ARTIST (Body & Qi Mastery)
    // =========================================================
    martial_artist: {
        id: "martial_artist",
        name: "Martial Artist",
        icon: "🥋",
        description: "Master of physical discipline, internal Qi energy, and close-quarters hand-to-hand combat.",
        unlocked: true,
        baseAttack: 46,
        baseDefense: 14,
        baseCritChance: 0.12,
        baseCritDmg: 1.6,
        baseDodge: 0.10,
        baseLifesteal: 0.02,
        perks: "High baseline agility and balance; gains +20% bonus from unarmed wraps, cestus, and robes.",
        subclasses: [
            {
                id: "warrior",
                name: "Warrior",
                icon: "🛡️",
                role: "Iron Vanguard & Armor Breaker",
                description: "Hardens the body into living steel. Excels at high defense, sustained physical damage, and crushing enemy armor.",
                bonus: { defense: 18, maxHp: 120, attack: 15 },
                primaryStat: "STR",
                specialSkill: {
                    id: "colossus_strike",
                    name: "Colossus Stomp & Strike",
                    icon: "💥",
                    cooldown: 8,
                    damageMult: 2.8,
                    healPct: 0.0,
                    buff: { name: "Iron Body", stat: "defense", bonus: 35, duration: 5 },
                    description: "Smashes the ground with colossal force for 280% damage and fortifies defense by +35 for 5s."
                }
            },
            {
                id: "qi_warrior",
                name: "Qi Warrior",
                icon: "☯️",
                role: "Internal Energy & Spirit Palm",
                description: "Channels ancestral Ki / Qi meridians. Harmonizes internal energy for celestial palm blasts, spirit shields, and healing.",
                bonus: { attack: 22, maxHp: 80, lifesteal: 0.04, dodge: 0.05 },
                primaryStat: "INT",
                specialSkill: {
                    id: "celestial_qi_palm",
                    name: "Celestial Qi Palm Blast",
                    icon: "✨",
                    cooldown: 7,
                    damageMult: 3.2,
                    healPct: 0.14,
                    buff: { name: "Qi Harmony", stat: "critChance", bonus: 0.12, duration: 4 },
                    description: "Unleashes concentrated spiritual Qi for 320% damage, restores 14% Max HP, and gains +12% Crit for 4s."
                }
            },
            {
                id: "berserker",
                name: "Berserker",
                icon: "🪓",
                role: "Fury Rampage & Savage Cleave",
                description: "Surrenders to untamed battle rage. Unleashes blistering multi-strikes, colossal critical bursts, and savage lifesteal.",
                bonus: { attack: 35, critChance: 0.08, critDmg: 0.35 },
                primaryStat: "STR",
                specialSkill: {
                    id: "bloodlust_frenzy",
                    name: "Bloodlust Rampage",
                    icon: "🩸",
                    cooldown: 8,
                    damageMult: 3.8,
                    healPct: 0.08,
                    buff: { name: "Primal Frenzy", stat: "attack", bonus: 50, duration: 5 },
                    description: "Rages into a whirlwind frenzy for 380% savage damage, heals 8% Max HP on hit, and gains +50 Attack for 5s."
                }
            }
        ],
        skill: {
            id: "tiger_palm",
            name: "Iron Tiger Palm",
            icon: "🐅",
            cooldown: 7,
            damageMult: 2.5,
            healPct: 0.05,
            buff: { name: "Tiger Stance", stat: "attack", bonus: 20, duration: 4 },
            description: "Strikes with fierce martial pressure for 250% damage, heals 5% Max HP, and increases Attack by +20 for 4s."
        },
        skillsPool: [
            {
                id: "tiger_palm",
                name: "Iron Tiger Palm",
                icon: "🐅",
                cooldown: 7,
                damageMult: 2.5,
                healPct: 0.05,
                buff: { name: "Tiger Stance", stat: "attack", bonus: 20, duration: 4 },
                description: "Strikes with fierce martial pressure for 250% damage, heals 5% Max HP, and increases Attack by +20 for 4s.",
                isDefault: true
            },
            {
                id: "colossus_strike",
                name: "Colossus Stomp & Strike",
                icon: "💥",
                cooldown: 8,
                damageMult: 2.8,
                healPct: 0.0,
                buff: { name: "Iron Body", stat: "defense", bonus: 35, duration: 5 },
                description: "Smashes the ground with colossal force for 280% damage and fortifies defense by +35 for 5s.",
                subclassReq: "warrior"
            },
            {
                id: "celestial_qi_palm",
                name: "Celestial Qi Palm Blast",
                icon: "✨",
                cooldown: 7,
                damageMult: 3.2,
                healPct: 0.14,
                buff: { name: "Qi Harmony", stat: "critChance", bonus: 0.12, duration: 4 },
                description: "Unleashes concentrated spiritual Qi for 320% damage, restores 14% Max HP, and gains +12% Crit for 4s.",
                subclassReq: "qi_warrior"
            },
            {
                id: "bloodlust_frenzy",
                name: "Bloodlust Rampage",
                icon: "🩸",
                cooldown: 8,
                damageMult: 3.8,
                healPct: 0.08,
                buff: { name: "Primal Frenzy", stat: "attack", bonus: 50, duration: 5 },
                description: "Rages into a whirlwind frenzy for 380% savage damage, heals 8% Max HP on hit, and gains +50 Attack for 5s.",
                subclassReq: "berserker"
            },
            {
                id: "dragon_breath_kick",
                name: "Dragon Ascension Kick",
                icon: "🐉",
                cooldown: 10,
                damageMult: 4.5,
                healPct: 0.10,
                buff: { name: "Dragon Presence", stat: "attack", bonus: 65, duration: 5 },
                description: "Leaps with soaring dragon energy for 450% devastation, heals 10% Max HP, and increases Attack by +65 for 5s.",
                scrollId: "scroll_dragon_kick"
            }
        ],
        promotions: [
            {
                rank: 2,
                title: "Grand Martial Master",
                reqLevel: 10,
                materials: { ironOre: 8, wood: 8 },
                goldCost: 500,
                bonus: { attack: 28, defense: 18, maxHp: 100 },
                description: "Rank 2 Mastery: +28 Attack, +18 Defense, +100 Max HP."
            },
            {
                rank: 3,
                title: "Enlightened Sovereign",
                reqLevel: 20,
                materials: { crystal: 5, dragonScale: 2 },
                goldCost: 2500,
                bonus: { attack: 65, defense: 35, maxHp: 260, dodge: 0.06 },
                description: "Rank 3 Mastery: +65 Attack, +35 Defense, +260 Max HP, +6% Dodge."
            }
        ],
        passives: [
            { id: "ma_p1", reqLevel: 1, name: "Iron Bone Tempering", icon: "🥋", lore: "Your flesh and bone are tempered in ancient martial kilns.", bonus: { maxHp: 40, defense: 10 }, description: "+40 Max HP, +10 Defense" },
            { id: "ma_p5", reqLevel: 5, name: "Flowing Wind Stance", icon: "💨", lore: "Footwork as unpredictable and swift as mountain gale.", bonus: { attack: 18, dodge: 0.05, critChance: 0.04 }, description: "+18 Attack, +5% Dodge, +4% Crit" },
            { id: "ma_p10", reqLevel: 10, name: "Meridian Enlightenment", icon: "☯️", lore: "Opening all eight internal extraordinary vessels.", bonus: { attack: 42, maxHp: 90, lifesteal: 0.04 }, description: "+42 Attack, +90 HP, +4% Lifesteal" },
            { id: "ma_p15", reqLevel: 15, name: "Vajra Adamantine Shell", icon: "🛡️", lore: "Your body becomes an adamantine bell impenetrable to mortal strikes.", bonus: { defense: 45, maxHp: 180, attack: 35 }, description: "+45 Defense, +180 HP, +35 Attack" },
            { id: "ma_p20", reqLevel: 20, name: "Avatar of the Nine Dragons", icon: "🐉", lore: "Nine dragons of pure primordial force spiral around your aura.", bonus: { attack: 110, defense: 50, critChance: 0.08, maxHp: 250 }, description: "+110 Attack, +50 Def, +8% Crit, +250 HP" },
            { id: "ma_p25", reqLevel: 25, name: "World-Shaking War God", icon: "⚡", lore: "Gods of war infuse your strikes with shattering shockwaves.", bonus: { attack: 180, defense: 75, dodge: 0.08, critChance: 0.10 }, description: "+180 Attack, +75 Def, +8% Dodge, +10% Crit" },
            { id: "ma_p30", reqLevel: 30, name: "Transcendent Grandmaster", icon: "🌟", lore: "Transcendence beyond mortality; one with the infinite cosmos.", bonus: { attack: 280, defense: 110, maxHp: 500, critChance: 0.15, lifesteal: 0.08 }, description: "+280 Attack, +110 Def, +500 HP, +15% Crit, +8% Lifesteal" }
        ]
    },

    // =========================================================
    // 2. WEAPON MASTER (Blades, Polearms & Marksmanship)
    // =========================================================
    weapon_master: {
        id: "weapon_master",
        name: "Weapon Master",
        icon: "⚔️",
        description: "Versatile supreme combatant master of blades, polearms, spears, bows, and tactical warfare.",
        unlocked: true,
        baseAttack: 48,
        baseDefense: 12,
        baseCritChance: 0.15,
        baseCritDmg: 1.75,
        baseDodge: 0.08,
        baseLifesteal: 0.0,
        perks: "Weapon versatility mastery; gains +25% bonus attack and critical scaling from all forged arms.",
        subclasses: [
            {
                id: "swordsman",
                name: "Swordsman",
                icon: "🗡️",
                role: "Blade Master & Precision Slashes",
                description: "Pure blade discipline. Slices through armor with blinding speed, devastating critical thrusts, and parry counterattacks.",
                bonus: { attack: 26, critChance: 0.08, critDmg: 0.30 },
                primaryStat: "STR",
                specialSkill: {
                    id: "blade_dance_cleave",
                    name: "Bladestorm Dance",
                    icon: "⚔️",
                    cooldown: 7,
                    damageMult: 3.4,
                    healPct: 0.0,
                    buff: { name: "Razor Edge", stat: "critChance", bonus: 0.18, duration: 4 },
                    description: "Dances forward with razor blades for 340% damage and increases Critical Chance by +18% for 4s."
                }
            },
            {
                id: "spearman",
                name: "Spearman",
                icon: "🔱",
                role: "Armor Pierce & Sweeping Reach",
                description: "Commands the battlefield with extended spear reach, armor-shattering impales, and impenetrable defensive stances.",
                bonus: { attack: 22, defense: 18, maxHp: 100 },
                primaryStat: "RNG",
                specialSkill: {
                    id: "dragon_spear_pierce",
                    name: "Heaven-Piercing Dragon Spear",
                    icon: "🐉",
                    cooldown: 8,
                    damageMult: 3.2,
                    healPct: 0.06,
                    buff: { name: "Spear Wall", stat: "defense", bonus: 40, duration: 5 },
                    description: "Impales the enemy line for 320% armor-piercing damage, heals 6% Max HP, and raises Defense by +40 for 5s."
                }
            },
            {
                id: "archer",
                name: "Archer",
                icon: "🏹",
                role: "Long-Range Sniper & Arrow Volleys",
                description: "Lethal deadeye sniper. Strikes from safe distance with arrow volleys, eagle-eyed precision, and evasive acrobatics.",
                bonus: { attack: 28, dodge: 0.12, critChance: 0.12 },
                primaryStat: "RNG",
                specialSkill: {
                    id: "rain_of_arrows",
                    name: "Celestial Arrow Storm",
                    icon: "🎯",
                    cooldown: 7,
                    damageMult: 3.6,
                    healPct: 0.0,
                    buff: { name: "Eagle Eye", stat: "dodge", bonus: 0.20, duration: 4 },
                    description: "Rains down a tempest of piercing arrows for 360% damage with +20% Dodge for 4s."
                }
            }
        ],
        skill: {
            id: "tactical_strike",
            name: "Tactical Arsenal Strike",
            icon: "⚔️",
            cooldown: 7,
            damageMult: 2.6,
            healPct: 0.0,
            buff: { name: "Tactical Edge", stat: "critChance", bonus: 0.10, duration: 4 },
            description: "A calculated martial strike dealing 260% Attack damage with +10% Crit Chance for 4s."
        },
        skillsPool: [
            {
                id: "tactical_strike",
                name: "Tactical Arsenal Strike",
                icon: "⚔️",
                cooldown: 7,
                damageMult: 2.6,
                healPct: 0.0,
                buff: { name: "Tactical Edge", stat: "critChance", bonus: 0.10, duration: 4 },
                description: "A calculated martial strike dealing 260% Attack damage with +10% Crit Chance for 4s.",
                isDefault: true
            },
            {
                id: "blade_dance_cleave",
                name: "Bladestorm Dance",
                icon: "⚔️",
                cooldown: 7,
                damageMult: 3.4,
                healPct: 0.0,
                buff: { name: "Razor Edge", stat: "critChance", bonus: 0.18, duration: 4 },
                description: "Dances forward with razor blades for 340% damage and increases Critical Chance by +18% for 4s.",
                subclassReq: "swordsman"
            },
            {
                id: "dragon_spear_pierce",
                name: "Heaven-Piercing Dragon Spear",
                icon: "🐉",
                cooldown: 8,
                damageMult: 3.2,
                healPct: 0.06,
                buff: { name: "Spear Wall", stat: "defense", bonus: 40, duration: 5 },
                description: "Impales the enemy line for 320% armor-piercing damage, heals 6% Max HP, and raises Defense by +40 for 5s.",
                subclassReq: "spearman"
            },
            {
                id: "rain_of_arrows",
                name: "Celestial Arrow Storm",
                icon: "🎯",
                cooldown: 7,
                damageMult: 3.6,
                healPct: 0.0,
                buff: { name: "Eagle Eye", stat: "dodge", bonus: 0.20, duration: 4 },
                description: "Rains down a tempest of piercing arrows for 360% damage with +20% Dodge for 4s.",
                subclassReq: "archer"
            },
            {
                id: "judgement_execution",
                name: "Supreme Armament Verdict",
                icon: "⚡",
                cooldown: 11,
                damageMult: 4.8,
                healPct: 0.08,
                buff: { name: "Warlord's Might", stat: "attack", bonus: 70, duration: 5 },
                description: "Combines sword, spear, and arrow into an unstoppable assault for 480% damage and +70 Attack for 5s.",
                scrollId: "scroll_judgement_execution"
            }
        ],
        promotions: [
            {
                rank: 2,
                title: "Arsenal Vanguard",
                reqLevel: 10,
                materials: { ironOre: 10, wood: 6 },
                goldCost: 500,
                bonus: { attack: 30, critChance: 0.05, maxHp: 80 },
                description: "Rank 2 Mastery: +30 Attack, +5% Crit Chance, +80 Max HP."
            },
            {
                rank: 3,
                title: "Peerless Warmaster",
                reqLevel: 20,
                materials: { crystal: 6, dragonScale: 2 },
                goldCost: 2500,
                bonus: { attack: 70, critChance: 0.10, dodge: 0.06, maxHp: 220 },
                description: "Rank 3 Mastery: +70 Attack, +10% Crit Chance, +6% Dodge, +220 Max HP."
            }
        ],
        passives: [
            { id: "wm_p1", reqLevel: 1, name: "Armament Honing", icon: "⚔️", lore: "Constant whetstone rites turn any weapon into a razor edge.", bonus: { attack: 16, critChance: 0.03 }, description: "+16 Attack, +3% Crit Chance" },
            { id: "wm_p5", reqLevel: 5, name: "Combat Stride", icon: "💨", lore: "Fluid positioning enables fluid weapon transitions.", bonus: { attack: 28, dodge: 0.04, defense: 10 }, description: "+28 Attack, +4% Dodge, +10 Defense" },
            { id: "wm_p10", reqLevel: 10, name: "Deadeye Focus", icon: "🎯", lore: "Every strike seeks the enemy's vital weakness.", bonus: { attack: 52, critChance: 0.07, critDmg: 0.20 }, description: "+52 Attack, +7% Crit, +20% Crit Dmg" },
            { id: "wm_p15", reqLevel: 15, name: "Titan's Battle Armor", icon: "🛡️", lore: "Plated battle armor forged to withstand siege weapons.", bonus: { defense: 40, maxHp: 160, attack: 40 }, description: "+40 Defense, +160 HP, +40 Attack" },
            { id: "wm_p20", reqLevel: 20, name: "Warlord's Ascendancy", icon: "⚜️", lore: "The tactical mastery of thousands of battles flows through you.", bonus: { attack: 120, critChance: 0.10, dodge: 0.08, maxHp: 200 }, description: "+120 Attack, +10% Crit, +8% Dodge, +200 HP" },
            { id: "wm_p25", reqLevel: 25, name: "God of Thousand Blades", icon: "⚡", lore: "Celestial gods crown you master of all forged steel and bowstring.", bonus: { attack: 195, critChance: 0.14, lifesteal: 0.06, defense: 60 }, description: "+195 Attack, +14% Crit, +6% Lifesteal, +60 Def" },
            { id: "wm_p30", reqLevel: 30, name: "Eternal Sovereign Warlord", icon: "🌟", lore: "An undefeated paragon of war whose name echoes across eternity.", bonus: { attack: 300, critChance: 0.18, dodge: 0.12, maxHp: 450 }, description: "+300 Attack, +18% Crit, +12% Dodge, +450 HP" }
        ]
    },

    // =========================================================
    // 3. MAGE (Elemental, Necromantic & Sorcerous Arcana)
    // =========================================================
    mage: {
        id: "mage",
        name: "Mage",
        icon: "🔮",
        description: "Master of primordial elemental spheres, necromantic soulcraft, and divine/dark sorcery.",
        unlocked: true,
        baseAttack: 54,
        baseDefense: 8,
        baseCritChance: 0.14,
        baseCritDmg: 1.7,
        baseDodge: 0.06,
        baseLifesteal: 0.04,
        perks: "Supreme spellcasting power; spells bypass 20% monster defense and scale strongly with Intelligence (INT).",
        subclasses: [
            {
                id: "elemental_mage",
                name: "Elemental Mage",
                icon: "🌪️",
                role: "Master of 6 Primal Elements",
                description: "Harnesses all 6 Primal Elements: 🔥 Fire, ❄️ Ice, ⚡ Lightning, 🌍 Earth, 💨 Wind, and 🌟 Light. Casts catastrophic elemental storms.",
                bonus: { attack: 32, critChance: 0.08, maxHp: 60 },
                primaryStat: "INT",
                specialSkill: {
                    id: "six_elements_calamity",
                    name: "Hexa-Elemental Calamity",
                    icon: "🌈",
                    cooldown: 8,
                    damageMult: 4.0,
                    healPct: 0.05,
                    buff: { name: "Prismatic Aura", stat: "attack", bonus: 55, duration: 5 },
                    description: "Unleashes Fire, Ice, Thunder, Earth, Wind & Light in unison for 400% catastrophic damage and +55 Attack for 5s."
                }
            },
            {
                id: "necromancer",
                name: "Necromancer",
                icon: "💀",
                role: "Soul Siphon & Death Magic",
                description: "Commands the dead and siphons mortal souls. Specializes in soul-drain lifesteal, dark bone shards, and decaying curses.",
                bonus: { attack: 26, lifesteal: 0.10, maxHp: 80 },
                primaryStat: "INT",
                specialSkill: {
                    id: "soul_reap_siphon",
                    name: "Soul Siphon & Bone Storm",
                    icon: "☠️",
                    cooldown: 7,
                    damageMult: 3.2,
                    healPct: 0.20,
                    buff: { name: "Soul Harvest", stat: "lifesteal", bonus: 0.10, duration: 6 },
                    description: "Rips the soul from the target for 320% necrotic damage, drains 20% Max HP to heal, and +10% Lifesteal for 6s."
                }
            },
            {
                id: "divine_sorcerer",
                name: "Divine Sorcerer",
                icon: "✨",
                role: "Celestial Holy Radiance",
                description: "Channels radiant heavenly authority. Purifies foes with holy solar smites, divine sanctuary heal, and invulnerable barrier wards.",
                bonus: { attack: 24, defense: 20, maxHp: 120, lifesteal: 0.03 },
                primaryStat: "INT",
                specialSkill: {
                    id: "heavenly_solar_smite",
                    name: "Heavens Pillar of Dawn",
                    icon: "☀️",
                    cooldown: 8,
                    damageMult: 3.0,
                    healPct: 0.25,
                    buff: { name: "Divine Aegis", stat: "defense", bonus: 40, duration: 5 },
                    description: "Calls down celestial solar light dealing 300% Holy damage, restores 25% Max HP, and raises Defense by +40 for 5s."
                }
            },
            {
                id: "dark_sorcerer",
                name: "Dark Sorcerer",
                icon: "🌑",
                role: "Abyssal Void & Chaos Hexes",
                description: "Dwells within the forbidden abyssal dark. Unleashes reality-collapsing void rifts, chaos hexes, and catastrophic dread.",
                bonus: { attack: 38, critDmg: 0.50, critChance: 0.08 },
                primaryStat: "INT",
                specialSkill: {
                    id: "abyssal_void_collapse",
                    name: "Abyssal Singularity",
                    icon: "🕳️",
                    cooldown: 9,
                    damageMult: 4.4,
                    healPct: 0.0,
                    buff: { name: "Void Dread", stat: "critChance", bonus: 0.20, duration: 4 },
                    description: "Creates an event horizon that collapses spacetime for 440% Void damage with +20% Crit for 4s."
                }
            },
            {
                id: "spirit_mage",
                name: "Spirit Mage",
                icon: "👻",
                role: "Astral Phantoms & Mind Tempest",
                description: "Attuned to the spirit realm and ancestral ghosts. Wards against damage, phases between planes, and blasts spiritual tempests.",
                bonus: { attack: 26, dodge: 0.12, defense: 14, maxHp: 70 },
                primaryStat: "INT",
                specialSkill: {
                    id: "ancestral_spirit_tempest",
                    name: "Ancestral Phantom Tempest",
                    icon: "🌌",
                    cooldown: 7,
                    damageMult: 3.3,
                    healPct: 0.10,
                    buff: { name: "Phase Shift", stat: "dodge", bonus: 0.25, duration: 5 },
                    description: "Summons phantom spirits to assault the foe for 330% damage, recovers 10% Max HP, and gains +25% Dodge for 5s."
                }
            }
        ],
        skill: {
            id: "arcane_orb_blast",
            name: "Arcane Nova Blast",
            icon: "🔮",
            cooldown: 7,
            damageMult: 2.8,
            healPct: 0.05,
            buff: { name: "Arcane Focus", stat: "attack", bonus: 25, duration: 4 },
            description: "Condenses raw arcane leyline energy for 280% damage, recovers 5% Max HP, and +25 Attack for 4s."
        },
        skillsPool: [
            {
                id: "arcane_orb_blast",
                name: "Arcane Nova Blast",
                icon: "🔮",
                cooldown: 7,
                damageMult: 2.8,
                healPct: 0.05,
                buff: { name: "Arcane Focus", stat: "attack", bonus: 25, duration: 4 },
                description: "Condenses raw arcane leyline energy for 280% damage, recovers 5% Max HP, and +25 Attack for 4s.",
                isDefault: true
            },
            {
                id: "six_elements_calamity",
                name: "Hexa-Elemental Calamity",
                icon: "🌈",
                cooldown: 8,
                damageMult: 4.0,
                healPct: 0.05,
                buff: { name: "Prismatic Aura", stat: "attack", bonus: 55, duration: 5 },
                description: "Unleashes Fire, Ice, Thunder, Earth, Wind & Light in unison for 400% catastrophic damage and +55 Attack for 5s.",
                subclassReq: "elemental_mage"
            },
            {
                id: "soul_reap_siphon",
                name: "Soul Siphon & Bone Storm",
                icon: "☠️",
                cooldown: 7,
                damageMult: 3.2,
                healPct: 0.20,
                buff: { name: "Soul Harvest", stat: "lifesteal", bonus: 0.10, duration: 6 },
                description: "Rips the soul from the target for 320% necrotic damage, drains 20% Max HP to heal, and +10% Lifesteal for 6s.",
                subclassReq: "necromancer"
            },
            {
                id: "heavenly_solar_smite",
                name: "Heavens Pillar of Dawn",
                icon: "☀️",
                cooldown: 8,
                damageMult: 3.0,
                healPct: 0.25,
                buff: { name: "Divine Aegis", stat: "defense", bonus: 40, duration: 5 },
                description: "Calls down celestial solar light dealing 300% Holy damage, restores 25% Max HP, and raises Defense by +40 for 5s.",
                subclassReq: "divine_sorcerer"
            },
            {
                id: "abyssal_void_collapse",
                name: "Abyssal Singularity",
                icon: "🕳️",
                cooldown: 9,
                damageMult: 4.4,
                healPct: 0.0,
                buff: { name: "Void Dread", stat: "critChance", bonus: 0.20, duration: 4 },
                description: "Creates an event horizon that collapses spacetime for 440% Void damage with +20% Crit for 4s.",
                subclassReq: "dark_sorcerer"
            },
            {
                id: "ancestral_spirit_tempest",
                name: "Ancestral Phantom Tempest",
                icon: "🌌",
                cooldown: 7,
                damageMult: 3.3,
                healPct: 0.10,
                buff: { name: "Phase Shift", stat: "dodge", bonus: 0.25, duration: 5 },
                description: "Summons phantom spirits to assault the foe for 330% damage, recovers 10% Max HP, and gains +25% Dodge for 5s.",
                subclassReq: "spirit_mage"
            },
            {
                id: "cosmic_supernova",
                name: "Cosmic Supernova Calamity",
                icon: "💥",
                cooldown: 12,
                damageMult: 5.4,
                healPct: 0.12,
                buff: { name: "Supernova Grace", stat: "attack", bonus: 75, duration: 5 },
                description: "Tears open cosmic dimensions for 540% Cataclysmic damage, +75 Attack, and 12% Max HP heal.",
                scrollId: "scroll_supernova"
            }
        ],
        promotions: [
            {
                rank: 2,
                title: "High Archon",
                reqLevel: 10,
                materials: { crystal: 6, wood: 6 },
                goldCost: 500,
                bonus: { attack: 36, lifesteal: 0.04, maxHp: 60 },
                description: "Rank 2 Mastery: +36 Attack, +4% Lifesteal, +60 Max HP."
            },
            {
                rank: 3,
                title: "Primordial Spellweaver",
                reqLevel: 20,
                materials: { crystal: 8, shadowEssence: 3 },
                goldCost: 2500,
                bonus: { attack: 80, lifesteal: 0.06, critChance: 0.08, maxHp: 180 },
                description: "Rank 3 Mastery: +80 Attack, +6% Lifesteal, +8% Crit, +180 Max HP."
            }
        ],
        passives: [
            { id: "mg_p1", reqLevel: 1, name: "Leyline Attunement", icon: "🔮", lore: "Your mind resonates directly with the planet's arcane leylines.", bonus: { attack: 18, lifesteal: 0.02 }, description: "+18 Attack, +2% Lifesteal" },
            { id: "mg_p5", reqLevel: 5, name: "Prismatic Font", icon: "✨", lore: "Elemental power flows boundlessly through your fingertips.", bonus: { attack: 34, critChance: 0.05, maxHp: 40 }, description: "+34 Attack, +5% Crit, +40 HP" },
            { id: "mg_p10", reqLevel: 10, name: "Chronomancer Insight", icon: "⏳", lore: "Time slows down as your incantations weave through reality.", bonus: { attack: 62, critChance: 0.07, lifesteal: 0.04, maxHp: 80 }, description: "+62 Attack, +7% Crit, +4% Lifesteal, +80 HP" },
            { id: "mg_p15", reqLevel: 15, name: "Astral Siphon", icon: "🌌", lore: "Draws celestial ether from distant constellations into every spell.", bonus: { attack: 100, critChance: 0.09, lifesteal: 0.05, maxHp: 120 }, description: "+100 Attack, +9% Crit, +5% Lifesteal, +120 HP" },
            { id: "mg_p20", reqLevel: 20, name: "Cosmic Nexus Avatar", icon: "🌟", lore: "Starforged titan energy converts your spells into cataclysms.", bonus: { attack: 160, critChance: 0.12, lifesteal: 0.06, maxHp: 180 }, description: "+160 Attack, +12% Crit, +6% Lifesteal, +180 HP" },
            { id: "mg_p25", reqLevel: 25, name: "Lord of Primal Arcana", icon: "🔮", lore: "Ancient deities bestow supreme authority over reality and ether.", bonus: { attack: 235, critChance: 0.15, lifesteal: 0.08, maxHp: 250 }, description: "+235 Attack, +15% Crit, +8% Lifesteal, +250 HP" },
            { id: "mg_p30", reqLevel: 30, name: "Transcendent Starweaver", icon: "✨", lore: "The fabric of creation and magic answers your sovereign command.", bonus: { attack: 330, critChance: 0.20, lifesteal: 0.10, maxHp: 380 }, description: "+330 Attack, +20% Crit, +10% Lifesteal, +380 HP" }
        ]
    }
};

// Universal map of all skills indexed by ID
window.AllSkillsData = {};
window.DefaultHeroPromotions = {};

Object.values(window.HeroesData).forEach(hero => {
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
