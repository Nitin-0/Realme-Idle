/* =========================================================
   REALM IDLE SYSTEMS - KINGDOM BUILDINGS MANAGER
========================================================= */

window.KingdomManager = {
    getBuildingCost(bldgKey) {
        const state = window.gameState;
        const level = state.kingdom[bldgKey] || (bldgKey === "farms" ? state.kingdom.blacksmith : (bldgKey === "blacksmith" ? state.kingdom.farms : 1)) || 1;
        const baseCosts = {
            castle: 200,
            treasury: 300,
            farms: 350,
            blacksmith: 350, // backwards-compatible alias
            mageTower: 500,
            barracks: 350
        };

        const base = baseCosts[bldgKey] || 250;
        return Math.floor(base * Math.pow(1.65, level - 1));
    },

    upgradeBuilding(bldgKey) {
        const state = window.gameState;
        const targetKey = (bldgKey === "blacksmith") ? "farms" : bldgKey;
        if (state.kingdom[targetKey] === undefined && state.kingdom[bldgKey] === undefined) return;
        if (state.isKingdomDomainUnlocked && !state.isKingdomDomainUnlocked()) {
            if (window.devMode) window.devMode.logToConsole("Kingdom Domain is locked pending royal decree.", "error");
            return;
        }

        const cost = this.getBuildingCost(bldgKey);
        if (!state.canAfford(cost)) {
            if (window.devMode) window.devMode.logToConsole("Cannot afford building upgrade.", "error");
            return;
        }

        state.spendGold(cost);
        if (targetKey === "farms") {
            state.kingdom.farms = (state.kingdom.farms || state.kingdom.blacksmith || 1) + 1;
            state.kingdom.blacksmith = state.kingdom.farms; // keep alias in sync
            const newLvl = state.kingdom.farms;

            if (state.harvestFarms) state.harvestFarms(true);

            if (state.addLog) {
                const milestoneFoods = {
                    3: "🥧 Hearty Meat Pie",
                    5: "🍗 Roasted Boar Shank",
                    7: "🍲 Dragon-Fire Stew",
                    9: "🍇 Royal Ambrosia Feast"
                };
                if (milestoneFoods[newLvl]) {
                    state.addLog(`⭐ ROYAL FARMS UPGRADED (Lv. ${newLvl})! NEW CUISINE UNLOCKED: [${milestoneFoods[newLvl]}]! Takes less creation time and restores greater HP!`, "level", "⭐");
                } else {
                    const nextTarget = newLvl < 3 ? 3 : newLvl < 5 ? 5 : newLvl < 7 ? 7 : newLvl < 9 ? 9 : (newLvl + 1);
                    state.addLog(`🌾 ROYAL FARMS UPGRADED to Level ${newLvl}! Food creation time reduced by -1s and HP recovery improved! (Next cuisine unlocks at Lv. ${nextTarget})`, "system", "🌾");
                }
            }
        } else {
            state.kingdom[targetKey] = (state.kingdom[targetKey] || 1) + 1;
        }

        // Special building instant bonuses
        if (targetKey === "castle") {
            state.player.maxHp += 25;
            state.player.hp = state.player.maxHp;
        }

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`🏰 Upgraded ${targetKey.toUpperCase()} to Level ${state.kingdom[targetKey]}!`, "success");
        }

        state.notify();
    }
};
