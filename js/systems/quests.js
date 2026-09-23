/* =========================================================
   REALM IDLE SYSTEMS - DYNAMIC QUEST MANAGER
========================================================= */

window.QuestManager = {
    initDefaultQuests() {
        const state = window.gameState;
        if (!state.quests.active || state.quests.active.length === 0) {
            state.quests.active = [
                { id: "q_slay_goblin", title: "Slay 5 Goblins", targetType: "kill", targetId: "goblin", required: 5, current: 0, rewardGold: 300, rewardXp: 100, completed: false },
                { id: "q_reach_lvl3", title: "Reach Hero Level 3", targetType: "level", targetId: "3", required: 3, current: 1, rewardGold: 500, rewardXp: 200, completed: false },
                { id: "q_craft_sword", title: "Craft Iron Broadsword", targetType: "craft", targetId: "iron_sword", required: 1, current: 0, rewardGold: 1000, rewardXp: 400, completed: false }
            ];
        }
    },

    checkProgress(type, id, qty = 1) {
        const state = window.gameState;
        let updated = false;

        state.quests.active.forEach(q => {
            if (q.completed) return;

            if (q.targetType === type) {
                if (type === "kill" && q.targetId === id) {
                    q.current = Math.min(q.required, q.current + qty);
                    updated = true;
                } else if (type === "level") {
                    q.current = Math.min(q.required, state.player.level);
                    updated = true;
                } else if (type === "craft" && q.targetId === id) {
                    q.current = Math.min(q.required, q.current + qty);
                    updated = true;
                }

                if (q.current >= q.required) {
                    q.completed = true;
                    if (window.devMode) window.devMode.logToConsole(`📜 QUEST COMPLETED: ${q.title}!`, "success");
                }
            }
        });

        if (updated) state.notify();
    },

    claimReward(questId) {
        const state = window.gameState;
        const index = state.quests.active.findIndex(q => q.id === questId);
        if (index === -1) return;

        const q = state.quests.active[index];
        if (!q.completed) return;

        state.addGold(q.rewardGold);
        state.addXp(q.rewardXp);
        state.quests.completedCount++;

        // Replace with new random dynamic quest
        state.quests.active.splice(index, 1);
        this.generateNewQuest();

        state.notify();
    },

    generateNewQuest() {
        const state = window.gameState;
        const roll = Math.random();

        // Weighted: 55% kill, 25% level, 20% craft
        if (roll < 0.55) {
            // Kill quest — scale count with player level
            const targets = ["goblin", "wolf", "skeleton", "orc", "void_sentinel"];
            const randomTarget = targets[Math.floor(Math.random() * targets.length)];
            const count = Math.floor(Math.random() * 5) + Math.max(3, Math.floor(state.player.level * 0.8));

            state.quests.active.push({
                id: "q_" + Date.now(),
                title: `Slay ${count} ${randomTarget.toUpperCase()}s`,
                targetType: "kill",
                targetId: randomTarget,
                required: count,
                current: 0,
                rewardGold: count * Math.max(80, state.player.level * 20),
                rewardXp: count * Math.max(50, state.player.level * 12),
                completed: false
            });

        } else if (roll < 0.80) {
            // Level quest — target 2–5 levels ahead
            const targetLevel = state.player.level + Math.floor(Math.random() * 4) + 2;

            state.quests.active.push({
                id: "q_" + Date.now(),
                title: `Reach Hero Level ${targetLevel}`,
                targetType: "level",
                targetId: String(targetLevel),
                required: targetLevel,
                current: state.player.level,
                rewardGold: targetLevel * 250,
                rewardXp: targetLevel * 150,
                completed: false
            });

        } else {
            // Craft quest — pick a random craftable item
            const craftableIds = (window.CraftingRecipes || []).map(r => r.itemId);
            if (craftableIds.length === 0) {
                // Fallback to kill quest if no recipes exist
                this.generateNewQuest();
                return;
            }
            const itemId = craftableIds[Math.floor(Math.random() * craftableIds.length)];
            const itemDef = window.ItemsData ? window.ItemsData[itemId] : null;
            const itemName = itemDef ? itemDef.name : itemId;

            state.quests.active.push({
                id: "q_" + Date.now(),
                title: `Craft: ${itemName}`,
                targetType: "craft",
                targetId: itemId,
                required: 1,
                current: 0,
                rewardGold: 1200 + state.player.level * 80,
                rewardXp: 600 + state.player.level * 40,
                completed: false
            });
        }
    }
};
