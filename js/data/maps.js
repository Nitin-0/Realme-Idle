/* =========================================================
   REALM IDLE DATA - MAPS DICTIONARY
========================================================= */

window.MapsData = {
    moonlit_vale: {
        id: "moonlit_vale",
        name: "Moonlit Vale",
        realmIndex: 1,
        roman: "I",
        levelMin: 1,
        levelMax: 5,
        defaultWeather: "clear",
        mobs: ["goblin", "wolf"],
        bossId: "wolf",
        bgGradient: "radial-gradient(circle at 50% 42%, #45376e 0%, #282143 23%, #161827 55%, #0c0e17 100%)",
        moonColor: "#eee5c9",
        maxDepth: 3,
        depthTiers: [
            { depth: 1, roman: "I", subtitle: "Fringe Clearing", statMult: 1.0, goldMult: 1.0, xpMult: 1.0 },
            { depth: 2, roman: "II", subtitle: "Deep Thicket", statMult: 1.45, goldMult: 1.5, xpMult: 1.5 },
            { depth: 3, roman: "III", subtitle: "Heart of the Vale", statMult: 2.1, goldMult: 2.3, xpMult: 2.2 }
        ]
    },
    ashen_wastes: {
        id: "ashen_wastes",
        name: "Ashen Wastes",
        realmIndex: 2,
        roman: "II",
        levelMin: 5,
        levelMax: 15,
        defaultWeather: "ashfall",
        mobs: ["skeleton", "orc"],
        bossId: "orc",
        bgGradient: "radial-gradient(circle at 50% 42%, #633324 0%, #361b14 25%, #190f0c 55%, #0d0806 100%)",
        moonColor: "#e8996b",
        maxDepth: 3,
        depthTiers: [
            { depth: 1, roman: "I", subtitle: "Scorched Sands", statMult: 1.0, goldMult: 1.0, xpMult: 1.0 },
            { depth: 2, roman: "II", subtitle: "Cinder Ravine", statMult: 1.45, goldMult: 1.5, xpMult: 1.5 },
            { depth: 3, roman: "III", subtitle: "Brimstone Caldera", statMult: 2.1, goldMult: 2.3, xpMult: 2.2 }
        ]
    },
    bloodthorn_forest: {
        id: "bloodthorn_forest",
        name: "Bloodthorn Forest",
        realmIndex: 3,
        roman: "III",
        levelMin: 15,
        levelMax: 25,
        defaultWeather: "fog",
        mobs: ["wolf", "skeleton"],
        bossId: "orc",
        bgGradient: "radial-gradient(circle at 50% 42%, #5c1e2d 0%, #301019 25%, #18090d 55%, #0d0507 100%)",
        moonColor: "#f27979",
        maxDepth: 3,
        depthTiers: [
            { depth: 1, roman: "I", subtitle: "Briar Edge", statMult: 1.0, goldMult: 1.0, xpMult: 1.0 },
            { depth: 2, roman: "II", subtitle: "Crimson Thicket", statMult: 1.45, goldMult: 1.5, xpMult: 1.5 },
            { depth: 3, roman: "III", subtitle: "Bramble Heart", statMult: 2.1, goldMult: 2.3, xpMult: 2.2 }
        ]
    },
    frostpeak: {
        id: "frostpeak",
        name: "Frostpeak Citadel",
        realmIndex: 4,
        roman: "IV",
        levelMin: 25,
        levelMax: 40,
        defaultWeather: "snow",
        mobs: ["skeleton", "orc"],
        bossId: "void_sentinel",
        bgGradient: "radial-gradient(circle at 50% 42%, #2d556e 0%, #172d3b 25%, #0b171f 55%, #050b0f 100%)",
        moonColor: "#ccebfb",
        maxDepth: 3,
        depthTiers: [
            { depth: 1, roman: "I", subtitle: "Lower Ascent", statMult: 1.0, goldMult: 1.0, xpMult: 1.0 },
            { depth: 2, roman: "II", subtitle: "Frozen Bastion", statMult: 1.45, goldMult: 1.5, xpMult: 1.5 },
            { depth: 3, roman: "III", subtitle: "Glacier Throne", statMult: 2.1, goldMult: 2.3, xpMult: 2.2 }
        ]
    },
    infernal_depths: {
        id: "infernal_depths",
        name: "Infernal Depths",
        realmIndex: 5,
        roman: "V",
        levelMin: 40,
        levelMax: 55,
        defaultWeather: "ashfall",
        mobs: ["orc", "void_sentinel"],
        bossId: "dragon",
        bgGradient: "radial-gradient(circle at 50% 42%, #7a2b16 0%, #42160a 25%, #210a05 55%, #0f0502 100%)",
        moonColor: "#ff5522",
        maxDepth: 3,
        depthTiers: [
            { depth: 1, roman: "I", subtitle: "Magma Tunnels", statMult: 1.0, goldMult: 1.0, xpMult: 1.0 },
            { depth: 2, roman: "II", subtitle: "Molten Forge", statMult: 1.45, goldMult: 1.5, xpMult: 1.5 },
            { depth: 3, roman: "III", subtitle: "Abyssal Core", statMult: 2.1, goldMult: 2.3, xpMult: 2.2 }
        ]
    },
    void_sanctum: {
        id: "void_sanctum",
        name: "Void Sanctum",
        realmIndex: 6,
        roman: "VI",
        levelMin: 55,
        levelMax: 70,
        defaultWeather: "arcane_storm",
        mobs: ["skeleton", "void_sentinel"],
        bossId: "dragon",
        bgGradient: "radial-gradient(circle at 50% 42%, #4f1d6b 0%, #2a0e3b 25%, #15061f 55%, #0a030f 100%)",
        moonColor: "#d97aff",
        maxDepth: 3,
        depthTiers: [
            { depth: 1, roman: "I", subtitle: "Event Horizon", statMult: 1.0, goldMult: 1.0, xpMult: 1.0 },
            { depth: 2, roman: "II", subtitle: "Singularity Gate", statMult: 1.45, goldMult: 1.5, xpMult: 1.5 },
            { depth: 3, roman: "III", subtitle: "Eternal Void", statMult: 2.1, goldMult: 2.3, xpMult: 2.2 }
        ]
    },
    dragons_crown: {
        id: "dragons_crown",
        name: "Dragon's Crown",
        realmIndex: 7,
        roman: "VII",
        levelMin: 70,
        levelMax: 85,
        defaultWeather: "storm",
        mobs: ["orc", "void_sentinel"],
        bossId: "dragon",
        bgGradient: "radial-gradient(circle at 50% 42%, #6e541b 0%, #3b2c0d 25%, #1f1706 55%, #0f0b03 100%)",
        moonColor: "#ffd675",
        maxDepth: 3,
        depthTiers: [
            { depth: 1, roman: "I", subtitle: "Wyrm Nest", statMult: 1.0, goldMult: 1.0, xpMult: 1.0 },
            { depth: 2, roman: "II", subtitle: "Dragon Roost", statMult: 1.45, goldMult: 1.5, xpMult: 1.5 },
            { depth: 3, roman: "III", subtitle: "Starfall Peak", statMult: 2.1, goldMult: 2.3, xpMult: 2.2 }
        ]
    },
    eternal_realm: {
        id: "eternal_realm",
        name: "Eternal Realm",
        realmIndex: 8,
        roman: "VIII",
        levelMin: 85,
        levelMax: 100,
        defaultWeather: "eclipse",
        mobs: ["void_sentinel", "dragon"],
        bossId: "lich",
        bgGradient: "radial-gradient(circle at 50% 42%, #3a3f6e 0%, #1f223d 25%, #0f101f 55%, #08080f 100%)",
        moonColor: "#e0e2ff",
        maxDepth: 3,
        depthTiers: [
            { depth: 1, roman: "I", subtitle: "Threshold", statMult: 1.0, goldMult: 1.0, xpMult: 1.0 },
            { depth: 2, roman: "II", subtitle: "Astral Plains", statMult: 1.45, goldMult: 1.5, xpMult: 1.5 },
            { depth: 3, roman: "III", subtitle: "The Apex", statMult: 2.1, goldMult: 2.3, xpMult: 2.2 }
        ]
    }
};
