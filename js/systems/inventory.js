/* =========================================================
   REALM IDLE SYSTEMS - INVENTORY & CRAFTING MANAGER
========================================================= */

window.InventoryManager = {
    addItem(itemId, customOpts = {}) {
        const itemDef = window.ItemsData[itemId];
        if (!itemDef) return;

        const state = window.gameState;
        state.player.inventory.push({
            ...itemDef,
            upgradeLevel: customOpts.upgradeLevel || 0,
            instanceId: Date.now() + "_" + Math.random().toString(36).substr(2, 6)
        });

        // Record in Monster/Item Journal
        if (window.JournalManager) window.JournalManager.recordItem(itemId);

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`🎒 Obtained: ${itemDef.icon} ${itemDef.name} [${itemDef.rarity.toUpperCase()}]`, "success");
        }

        if (state.addLog && itemDef.rarity && ["rare", "epic", "legendary"].includes(itemDef.rarity)) {
            state.addLog(`🎁 RARE LOOT! Found [${itemDef.name}] (${itemDef.rarity.toUpperCase()})!`, "loot", "🎁");
        }

        state.notify();
    },

    getSellPrice(item) {
        if (!item) return 0;
        const rarity = window.RarityData[item.rarity] || window.RarityData.common;
        const base = item.baseValue || 50;
        const upgMult = 1 + (item.upgradeLevel || 0) * 0.5;
        return Math.floor(base * rarity.sellMult * upgMult);
    },

    getUpgradeCost(item) {
        if (!item) return null;
        const level = item.upgradeLevel || 0;
        const baseGold = item.baseValue || 100;
        const goldCost = Math.floor(baseGold * 1.4 * Math.pow(1.5, level));

        let matKey = "ironOre";
        let matQty = Math.min(30, 4 + level * 2);

        if (item.rarity === "rare" || item.rarity === "epic") {
            if (level >= 3) { matKey = "crystal"; matQty = Math.min(15, 2 + Math.floor(level / 2)); }
        } else if (item.rarity === "legendary") {
            if (level >= 4) { matKey = "dragonScale"; matQty = Math.min(10, 1 + Math.floor(level / 3)); }
            else if (level >= 2) { matKey = "crystal"; matQty = Math.min(15, 3 + level); }
        }

        return { gold: goldCost, matKey, matQty };
    },

    upgradeItem(itemInstanceId) {
        const state = window.gameState;

        // Search in inventory or equipped slots
        let item = state.player.inventory.find(i => i.instanceId === itemInstanceId);
        let isEquipped = false;

        if (!item) {
            for (const [slot, eq] of Object.entries(state.player.equipment)) {
                if (eq && eq.instanceId === itemInstanceId) {
                    item = eq;
                    isEquipped = true;
                    break;
                }
            }
        }

        if (!item) return false;

        const cost = this.getUpgradeCost(item);
        if (!cost) return false;

        if (!state.canAfford(cost.gold)) {
            alert(`Not enough gold! Need ${cost.gold.toLocaleString()}g`);
            return false;
        }

        if ((state.player.materials[cost.matKey] || 0) < cost.matQty) {
            alert(`Not enough materials! Need ${cost.matQty}x ${cost.matKey}`);
            return false;
        }

        // Deduct
        state.spendGold(cost.gold);
        state.player.materials[cost.matKey] -= cost.matQty;

        item.upgradeLevel = (item.upgradeLevel || 0) + 1;

        if (window.CombatManager) {
            window.CombatManager.showDamagePopup(`⚒️ ${item.name} upgraded to +${item.upgradeLevel}!`, false, false, "upgrade");
        }

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`⚒️ Upgraded ${item.name} to +${item.upgradeLevel}!`, "success");
        }

        state.notify();
        return true;
    },

    sellItem(itemInstanceId) {
        const state = window.gameState;
        const index = state.player.inventory.findIndex(i => i.instanceId === itemInstanceId);
        if (index === -1) return false;

        const item = state.player.inventory[index];
        const price = this.getSellPrice(item);

        state.player.inventory.splice(index, 1);
        state.addGold(price);

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`💰 Sold ${item.name} for ${price.toLocaleString()}g`, "success");
        }

        state.notify();
        return true;
    },

    usePotion(potionId) {
        const state = window.gameState;
        if (!state.player.potions || (state.player.potions[potionId] || 0) <= 0) return false;

        const itemDef = window.ItemsData[potionId];
        if (!itemDef || !itemDef.effect) return false;

        state.player.potions[potionId]--;

        const effect = itemDef.effect;
        if (effect.type === "heal") {
            const healed = Math.min(effect.amount, state.player.maxHp - state.player.hp);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + effect.amount);
            if (window.CombatManager) window.CombatManager.showDamagePopup(`+${healed} HP`, false, false, "heal");
        } else if (effect.type === "heal_pct") {
            state.player.hp = state.player.maxHp;
            if (window.CombatManager) window.CombatManager.showDamagePopup(`MAX HP RESTORED!`, false, false, "heal");
        } else if (effect.type === "buff") {
            state.player.activeBuffs = state.player.activeBuffs.filter(b => b.name !== itemDef.name);
            state.player.activeBuffs.push({
                name: itemDef.name,
                stat: effect.stat,
                bonus: effect.value,
                duration: effect.duration
            });
            if (window.CombatManager) window.CombatManager.showDamagePopup(`🧪 ${itemDef.name} Active!`, false, false, "potion");
        }

        state.notify();
        return true;
    },

    equipItem(itemInstanceId) {
        const state = window.gameState;
        const index = state.player.inventory.findIndex(i => i.instanceId === itemInstanceId || i.id === itemInstanceId);

        if (index === -1) return;

        const item = state.player.inventory[index];
        const slot = item.slot;

        // Unequip currently equipped item if present
        if (state.player.equipment[slot]) {
            state.player.inventory.push(state.player.equipment[slot]);
        }

        // Equip new item & remove from inventory
        state.player.equipment[slot] = item;
        state.player.inventory.splice(index, 1);
        state.notify();
    },

    unequipSlot(slot) {
        const state = window.gameState;
        const current = state.player.equipment[slot];
        if (!current) return;

        state.player.inventory.push(current);
        state.player.equipment[slot] = null;
        state.notify();
    },

    addMaterial(matKey, amount) {
        const state = window.gameState;
        if (state.player.materials[matKey] !== undefined) {
            state.player.materials[matKey] += amount;
            state.notify();
        }
    },

    craftItem(itemId) {
        const recipe = window.CraftingRecipes.find(r => r.itemId === itemId);
        if (!recipe) return;

        const state = window.gameState;

        // Check Gold
        if (!state.canAfford(recipe.req.gold)) {
            alert("Cannot afford crafting gold cost.");
            return;
        }

        // Check Materials
        for (const [mat, reqQty] of Object.entries(recipe.req)) {
            if (mat === "gold") continue;
            if ((state.player.materials[mat] || 0) < reqQty) {
                alert(`Missing material: ${mat} (need ${reqQty})`);
                return;
            }
        }

        // Deduct Gold & Materials
        state.spendGold(recipe.req.gold);
        for (const [mat, reqQty] of Object.entries(recipe.req)) {
            if (mat === "gold") continue;
            state.player.materials[mat] -= reqQty;
        }

        // Add crafted item
        this.addItem(itemId);

        // Check quest progress
        if (window.QuestManager) window.QuestManager.checkProgress("craft", itemId);
    },

    rollLootDrop(mob) {
        if (!mob) return;
        const state = window.gameState;

        // If mob specifies explicit dropTable
        if (mob.dropTable && mob.dropTable.length > 0) {
            if (Math.random() <= (mob.dropChance || 0.5)) {
                mob.dropTable.forEach(entry => {
                    if (Math.random() <= entry.chance) {
                        if (entry.type === "material") {
                            const qty = Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min;
                            this.addMaterial(entry.key, qty);
                        } else if (entry.type === "consumable") {
                            state.player.potions[entry.id] = (state.player.potions[entry.id] || 0) + 1;
                            state.notify();
                        } else if (entry.type === "item") {
                            this.addItem(entry.id);
                        }
                    }
                });
            }
            return;
        }

        // Fallback default loot roll
        const roll = Math.random();
        if (roll < 0.60) {
            const mats = ["ironOre", "wood", "crystal"];
            if (mob.level > 20) mats.push("dragonScale");
            if (mob.level > 40) mats.push("shadowEssence");

            const droppedMat = mats[Math.floor(Math.random() * mats.length)];
            const qty = Math.floor(Math.random() * 3) + 1;
            this.addMaterial(droppedMat, qty);
        }

        if (roll < 0.18) {
            const possibleItems = Object.keys(window.ItemsData).filter(k => window.ItemsData[k].type === "equipment");
            const droppedId = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            this.addItem(droppedId);
        }
    }
};
