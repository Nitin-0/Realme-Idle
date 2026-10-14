/* =========================================================
   REALM IDLE SYSTEMS - MONSTER JOURNAL & COLLECTIONS
========================================================= */

window.JournalManager = {
    recordMob(mobId) {
        const state = window.gameState;
        if (!state.journal) state.journal = { discoveredMobs: {}, discoveredItems: {} };
        if (!state.journal.discoveredMobs) state.journal.discoveredMobs = {};

        const isFirstKill = !state.journal.discoveredMobs[mobId] || state.journal.discoveredMobs[mobId].count <= 0;
        if (!state.journal.discoveredMobs[mobId]) {
            state.journal.discoveredMobs[mobId] = { count: 0, discovered: true, firstSlainAt: Date.now() };
        }
        state.journal.discoveredMobs[mobId].count++;

        if (isFirstKill) {
            const mobDef = window.MobsData ? window.MobsData[mobId] : null;
            if (mobDef && state.addLog) {
                state.addLog(`📖 BESTIARY ENTRY: First victory over [${mobDef.name}]! Lore, stats, and drop tables unlocked.`, "system", "📖");
            }
        }
        state.notify();
    },

    isMobDiscovered(mobId) {
        const state = window.gameState;
        if (!state || !state.journal || !state.journal.discoveredMobs) return false;
        const entry = state.journal.discoveredMobs[mobId];
        return !!(entry && entry.count > 0);
    },

    getMobKillCount(mobId) {
        const state = window.gameState;
        if (!state || !state.journal || !state.journal.discoveredMobs) return 0;
        const entry = state.journal.discoveredMobs[mobId];
        return (entry && entry.count) ? entry.count : 0;
    },

    getDiscoveredMobCount() {
        const state = window.gameState;
        if (!state || !state.journal || !state.journal.discoveredMobs) return 0;
        return Object.values(state.journal.discoveredMobs).filter(entry => entry && entry.count > 0).length;
    },

    getTotalMobCount() {
        return window.MobsData ? Object.keys(window.MobsData).length : 0;
    },

    recordItem(itemId) {
        const state = window.gameState;
        if (!state.journal) state.journal = { discoveredMobs: {}, discoveredItems: {} };
        if (!state.journal.discoveredItems) state.journal.discoveredItems = {};
        if (!state.journal.discoveredItems[itemId]) {
            state.journal.discoveredItems[itemId] = true;
            state.notify();
        }
    },

    unlockAll() {
        const state = window.gameState;
        if (!state.journal) state.journal = { discoveredMobs: {}, discoveredItems: {} };
        if (!state.journal.discoveredMobs) state.journal.discoveredMobs = {};
        if (window.MobsData) {
            Object.keys(window.MobsData).forEach(mId => {
                state.journal.discoveredMobs[mId] = { count: 10, discovered: true, firstSlainAt: Date.now() };
            });
        }
        if (window.ItemsData) {
            Object.keys(window.ItemsData).forEach(iId => {
                state.journal.discoveredItems[iId] = true;
            });
        }
        if (window.devMode) window.devMode.logToConsole("📖 Unlocked all Journal entries!", "success");
        state.notify();
    }
};
