/* =========================================================
   REALM IDLE DATA - PRESET SCENARIOS DICTIONARY
========================================================= */

window.ScenariosData = {
    dragon_invasion: {
        id: "dragon_invasion",
        name: "🔥 DRAGON SIEGE INVASION",
        description: "An ancient dragon assaults Moonlit Vale amidst a violent thunderstorm!",
        mapId: "moonlit_vale",
        weatherId: "storm",
        timeHour: 23,
        bossMobId: "dragon",
        durationSec: 300,
        modifiers: {
            playerDmgMult: 1.5,
            enemyDmgMult: 2.5,
            goldMult: 3.0,
            xpMult: 3.0
        }
    },
    blood_moon_surge: {
        id: "blood_moon_surge",
        name: "🔴 BLOOD MOON SURGE",
        description: "A deep red lunar eclipse corrupts Bloodthorn Forest. Predators multiply!",
        mapId: "bloodthorn_forest",
        weatherId: "eclipse",
        timeHour: 0,
        bossMobId: "wolf",
        durationSec: 240,
        modifiers: {
            playerDmgMult: 1.3,
            enemyDmgMult: 2.0,
            goldMult: 2.5,
            xpMult: 2.5
        }
    },
    frostpeak_blizzard: {
        id: "frostpeak_blizzard",
        name: "❄️ FROSTPEAK BLIZZARD",
        description: "A freezing ice storm descends on Frostpeak Citadel.",
        mapId: "frostpeak",
        weatherId: "snow",
        timeHour: 18,
        bossMobId: "void_sentinel",
        durationSec: 200,
        modifiers: {
            playerDmgMult: 1.1,
            enemyDmgMult: 1.2,
            goldMult: 2.0,
            xpMult: 2.0
        }
    },
    goblin_horde: {
        id: "goblin_horde",
        name: "👹 GOBLIN HORDE SIEGE",
        description: "A swarm of fiery goblins invades Ashen Wastes!",
        mapId: "ashen_wastes",
        weatherId: "ashfall",
        timeHour: 12,
        bossMobId: "goblin",
        durationSec: 180,
        modifiers: {
            playerDmgMult: 1.2,
            enemyDmgMult: 1.1,
            goldMult: 4.0,
            xpMult: 2.0
        }
    },
    black_moon_calamity: {
        id: "black_moon_calamity",
        name: "🌑 BLACK MOON CALAMITY",
        description: "The skies turn pitch black. All monsters surge with abyssal rage, gaining doubled HP and +150% damage with massive 4x gold & XP!",
        mapId: "void_sanctum",
        weatherId: "eclipse",
        timeHour: 0,
        bossMobId: "lich",
        durationSec: 240,
        modifiers: {
            playerDmgMult: 1.2,
            enemyHpMult: 2.0,
            enemyDmgMult: 2.5,
            goldMult: 4.0,
            xpMult: 4.0,
            dropMult: 2.5
        }
    },
    rain_of_abundance: {
        id: "rain_of_abundance",
        name: "🌧️ RAIN OF ABUNDANCE",
        description: "A mythical rain descends upon Moonlit Vale, yielding immense material drops, riches, and overflowing bounty (5x Gold, 3x Drops)!",
        mapId: "moonlit_vale",
        weatherId: "rain",
        timeHour: 14,
        bossMobId: "wolf",
        durationSec: 180,
        modifiers: {
            playerDmgMult: 1.1,
            enemyHpMult: 0.85,
            enemyDmgMult: 0.8,
            goldMult: 5.0,
            xpMult: 3.0,
            dropMult: 3.0
        }
    },
    celestial_titan_awakening: {
        id: "celestial_titan_awakening",
        name: "🌟 CELESTIAL TITAN AWAKENING",
        description: "Astraeus the Starforged Titan awakens on Dragons Crown amidst a cosmic meteor storm!",
        mapId: "dragons_crown",
        weatherId: "arcane_storm",
        timeHour: 22,
        bossMobId: "dragon",
        durationSec: 300,
        modifiers: {
            playerDmgMult: 1.5,
            enemyHpMult: 2.5,
            enemyDmgMult: 3.0,
            goldMult: 5.0,
            xpMult: 5.0,
            dropMult: 3.0
        }
    },
    infernal_eruption: {
        id: "infernal_eruption",
        name: "🌋 INFERNAL ERUPTION",
        description: "Magma geysers erupt throughout Infernal Depths under falling ash, unleashing molten wyrms!",
        mapId: "infernal_depths",
        weatherId: "ashfall",
        timeHour: 16,
        bossMobId: "dragon",
        durationSec: 240,
        modifiers: {
            playerDmgMult: 1.3,
            enemyHpMult: 1.8,
            enemyDmgMult: 2.2,
            goldMult: 3.5,
            xpMult: 3.5,
            dropMult: 2.0
        }
    }
};
