/* =========================================================
   REALM IDLE SYSTEMS - KINGDOM BUILDINGS MANAGER
========================================================= */

window.KingdomManager = {
    getBuildingCost(bldgKey) {
        const state = window.gameState;
        const level = state.kingdom[bldgKey] || 1;
        const baseCosts = {
            castle: 200,
            treasury: 300,
            blacksmith: 400,
            mageTower: 500,
            barracks: 350
        };

        const base = baseCosts[bldgKey] || 250;
        return Math.floor(base * Math.pow(1.65, level - 1));
    },

    upgradeBuilding(bldgKey) {
        const state = window.gameState;
        if (state.kingdom[bldgKey] === undefined) return;

        const cost = this.getBuildingCost(bldgKey);
        if (!state.canAfford(cost)) {
            if (window.devMode) window.devMode.logToConsole("Cannot afford building upgrade.", "error");
            return;
        }

        state.spendGold(cost);
        state.kingdom[bldgKey]++;

        // Special building instant bonuses
        if (bldgKey === "castle") {
            state.player.maxHp += 25;
            state.player.hp = state.player.maxHp;
        }

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`🏰 Upgraded ${bldgKey.toUpperCase()} to Level ${state.kingdom[bldgKey]}!`, "success");
        }

        state.notify();
    }
};
