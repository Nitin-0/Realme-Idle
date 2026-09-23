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
    }
};
