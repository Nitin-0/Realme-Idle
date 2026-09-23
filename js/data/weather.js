/* =========================================================
   REALM IDLE DATA - WEATHER DICTIONARY
========================================================= */

window.WeatherData = {
    clear: {
        id: "clear",
        name: "Clear Sky",
        icon: "☀️",
        playerDmgMult: 1.0,
        enemyDmgMult: 1.0,
        goldMult: 1.0,
        xpMult: 1.0,
        particleType: "none"
    },
    rain: {
        id: "rain",
        name: "Torrential Rain",
        icon: "🌧️",
        playerDmgMult: 0.95,
        enemyDmgMult: 0.9,
        goldMult: 1.1,
        xpMult: 1.1,
        particleType: "rain"
    },
    storm: {
        id: "storm",
        name: "Thunderstorm",
        icon: "⛈️",
        playerDmgMult: 1.1,
        enemyDmgMult: 1.25,
        goldMult: 1.3,
        xpMult: 1.25,
        particleType: "storm"
    },
    snow: {
        id: "snow",
        name: "Blinding Blizzard",
        icon: "❄️",
        playerDmgMult: 0.9,
        enemyDmgMult: 0.85,
        goldMult: 1.15,
        xpMult: 1.15,
        particleType: "snow"
    },
    fog: {
        id: "fog",
        name: "Dense Mist",
        icon: "🌫️",
        playerDmgMult: 0.85,
        enemyDmgMult: 0.95,
        goldMult: 1.2,
        xpMult: 1.2,
        particleType: "fog"
    },
    eclipse: {
        id: "eclipse",
        name: "Solar Eclipse",
        icon: "🌙",
        playerDmgMult: 1.5,
        enemyDmgMult: 1.5,
        goldMult: 2.0,
        xpMult: 2.0,
        particleType: "eclipse"
    },
    ashfall: {
        id: "ashfall",
        name: "Volcanic Ashfall",
        icon: "🌋",
        playerDmgMult: 1.05,
        enemyDmgMult: 1.15,
        goldMult: 1.25,
        xpMult: 1.25,
        particleType: "ash"
    },
    arcane_storm: {
        id: "arcane_storm",
        name: "Arcane Tempest",
        icon: "✨",
        playerDmgMult: 1.4,
        enemyDmgMult: 1.3,
        goldMult: 1.75,
        xpMult: 1.75,
        particleType: "arcane"
    }
};
