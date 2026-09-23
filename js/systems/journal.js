/* =========================================================
   REALM IDLE SYSTEMS - MONSTER JOURNAL & COLLECTIONS
========================================================= */

window.JournalManager = {
    recordMob(mobId) {
        const state = window.gameState;
        if (!state.journal.discoveredMobs[mobId]) {
            state.journal.discoveredMobs[mobId] = { count: 0, discovered: true };
        }
        state.journal.discoveredMobs[mobId].count++;
        state.notify();
    },

    recordItem(itemId) {
        const state = window.gameState;
        if (!state.journal.discoveredItems[itemId]) {
            state.journal.discoveredItems[itemId] = true;
            state.notify();
        }
    },

    unlockAll() {
        const state = window.gameState;
        if (window.MobsData) {
            Object.keys(window.MobsData).forEach(mId => {
                state.journal.discoveredMobs[mId] = { count: 10, discovered: true };
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
