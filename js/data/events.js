/* =========================================================
   REALM IDLE DATA - WORLD EVENTS DICTIONARY
========================================================= */

window.EventsData = {
    blood_moon: {
        id: "blood_moon",
        name: "Blood Moon Rising",
        bannerText: "🔴 BLOOD MOON ACTIVE · Enemies Empowered! +100% Gold & XP",
        durationSec: 120,
        forcedWeather: "eclipse",
        playerDmgMult: 1.5,
        enemyDmgMult: 2.0,
        goldMult: 2.0,
        xpMult: 2.5,
        bossMob: "wolf"
    },
    goblin_invasion: {
        id: "goblin_invasion",
        name: "Goblin Horde Invasion",
        bannerText: "👹 GOBLIN INVASION · Swarm Horde Active! +200% Gold",
        durationSec: 90,
        forcedWeather: "storm",
        playerDmgMult: 1.2,
        enemyDmgMult: 1.1,
        goldMult: 3.0,
        xpMult: 1.5,
        bossMob: "goblin"
    },
    dragon_attack: {
        id: "dragon_attack",
        name: "Ancient Dragon Siege",
        bannerText: "🐉 DRAGON SIEGE · Extreme Danger! +300% Gold & XP",
        durationSec: 180,
        forcedWeather: "ashfall",
        playerDmgMult: 1.3,
        enemyDmgMult: 2.5,
        goldMult: 4.0,
        xpMult: 3.0,
        bossMob: "dragon"
    },
    treasure_rain: {
        id: "treasure_rain",
        name: "Treasure Rain",
        bannerText: "💰 TREASURE RAIN · Enormous Wealth Drops! +400% Gold",
        durationSec: 60,
        forcedWeather: "clear",
        playerDmgMult: 1.0,
        enemyDmgMult: 0.5,
        goldMult: 5.0,
        xpMult: 2.0,
        bossMob: null
    },
    meteor_shower: {
        id: "meteor_shower",
        name: "Cosmic Meteor Shower",
        bannerText: "✨ METEOR SHOWER · Arcane Overload! +100% Damage, +200% XP",
        durationSec: 90,
        forcedWeather: "arcane_storm",
        playerDmgMult: 2.0,
        enemyDmgMult: 1.5,
        goldMult: 2.5,
        xpMult: 3.0,
        bossMob: null
    },
    double_gold: {
        id: "double_gold",
        name: "Golden Era Boost",
        bannerText: "✦ DOUBLE GOLD EVENT ACTIVE · 2x All Gold Gains!",
        durationSec: 300,
        forcedWeather: null,
        playerDmgMult: 1.0,
        enemyDmgMult: 1.0,
        goldMult: 2.0,
        xpMult: 1.0,
        bossMob: null
    },
    double_xp: {
        id: "double_xp",
        name: "Wisdom Surge Boost",
        bannerText: "⭐ DOUBLE XP EVENT ACTIVE · 2x All Experience Gains!",
        durationSec: 300,
        forcedWeather: null,
        playerDmgMult: 1.0,
        enemyDmgMult: 1.0,
        goldMult: 1.0,
        xpMult: 2.0,
        bossMob: null
    }
};
