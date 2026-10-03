/* =========================================================
   REALM IDLE SYSTEMS - INVENTORY & CRAFTING MANAGER
========================================================= */

window.InventoryManager = {
    addItem(itemId, customOpts = {}) {
        let itemDef = null;
        if (typeof itemId === "object" && itemId !== null) {
            itemDef = itemId;
        } else {
            itemDef = window.ItemsData ? window.ItemsData[itemId] : null;
        }
        if (!itemDef) return;

        const state = window.gameState;
        const newItem = {
            ...itemDef,
            upgradeLevel: customOpts.upgradeLevel || itemDef.upgradeLevel || 0,
            instanceId: itemDef.instanceId || (Date.now() + "_" + Math.random().toString(36).substr(2, 6))
        };
        state.player.inventory.push(newItem);

        // Record in Monster/Item Journal
        if (window.JournalManager && typeof itemId === "string") window.JournalManager.recordItem(itemId);

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`🎒 Obtained: ${itemDef.icon || '🗡️'} ${itemDef.name} [${(itemDef.rarity || 'common').toUpperCase()}]`, "success");
        }

        if (state.addLog && itemDef.rarity && ["rare", "epic", "legendary"].includes(itemDef.rarity)) {
            state.addLog(`🎁 RARE LOOT! Found [${itemDef.name}] (${itemDef.rarity.toUpperCase()})!`, "loot", "🎁");
        }

        state.notify();
    },

    getSellPrice(item) {
        if (!item) return 0;
        const rarities = window.RarityData || {};
        const rarity = rarities[item.rarity] || { sellMult: 1, sell: 18 };
        if (item.baseValue) {
            const upgMult = 1 + (item.upgradeLevel || 0) * 0.5;
            return Math.floor(item.baseValue * (rarity.sellMult || 1) * upgMult);
        }
        // Rolled forge items
        const baseSell = rarity.sell || 18;
        const ilvl = item.ilvl || 1;
        return Math.floor(baseSell * (1 + ilvl * 0.25));
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

        const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
        const effect = itemDef.effect;

        if (effect.type === "fatigue" || effect.type === "fatigue_full") {
            const currentFatigue = state.getFatigue ? state.getFatigue() : (state.player.fatigue || 0);
            if (currentFatigue <= 0 && state.player.hp >= effMaxHp) {
                if (window.CombatManager) window.CombatManager.showDamagePopup("NOT TIRED!", false, false, "heal");
                return false;
            }

            state.player.potions[potionId]--;
            const fReduce = effect.type === "fatigue_full" ? 100 : (effect.fatigueAmount || 40);
            if (state.reduceFatigue) state.reduceFatigue(fReduce);

            if (effect.heal) {
                const healed = Math.min(effect.heal, effMaxHp - state.player.hp);
                state.player.hp = Math.min(effMaxHp, state.player.hp + effect.heal);
                if (window.CombatManager && healed > 0) window.CombatManager.showDamagePopup(`+${healed} HP`, false, false, "heal");
            }

            if (window.CombatManager) {
                window.CombatManager.showDamagePopup(`⚡ -${fReduce} Fatigue!`, false, false, "potion");
            }
            if (state.addLog) {
                state.addLog(`Quaffed ${itemDef.name}. Fatigue reduced by ${fReduce} points!`, "combat", "⚡");
            }
            state.save();
            state.notify();
            return true;
        }

        if (effect.type === "heal" || effect.type === "heal_pct") {
            if (state.player.hp >= effMaxHp) {
                if (window.CombatManager) window.CombatManager.showDamagePopup("HP FULL!", false, false, "heal");
                return false;
            }

            state.player.potions[potionId]--;

            if (effect.type === "heal") {
                const healVal = effect.amount !== undefined ? effect.amount : (effect.value !== undefined ? effect.value : 50);
                const healed = Math.max(1, Math.min(healVal, effMaxHp - state.player.hp));
                state.player.hp = Math.min(effMaxHp, state.player.hp + healVal);
                if (window.CombatManager) window.CombatManager.showDamagePopup(`+${healed} HP`, false, false, "heal");
                if (state.addLog) state.addLog(`Quaffed ${itemDef.name}. Recovered ${healed} HP!`, "combat", "🧪");
            } else if (effect.type === "heal_pct") {
                const healed = Math.max(1, effMaxHp - state.player.hp);
                state.player.hp = effMaxHp;
                if (window.CombatManager) window.CombatManager.showDamagePopup(`+${healed} HP (FULL)`, false, false, "heal");
                if (state.addLog) state.addLog(`Quaffed ${itemDef.name}. Fully restored HP! (+${healed} HP)`, "combat", "💖");
            }
        } else if (effect.type === "buff") {
            state.player.potions[potionId]--;
            state.player.activeBuffs = (state.player.activeBuffs || []).filter(b => b.name !== itemDef.name);
            state.player.activeBuffs.push({
                name: itemDef.name,
                stat: effect.stat,
                bonus: effect.value !== undefined ? effect.value : (effect.bonus !== undefined ? effect.bonus : 10),
                duration: effect.duration || 60
            });
            if (window.CombatManager) window.CombatManager.showDamagePopup(`🧪 ${itemDef.name}!`, false, false, "potion");
            if (state.addLog) state.addLog(`Consumed ${itemDef.name}! Active combat buff applied.`, "combat", "🧪");
        }

        state.notify();
        return true;
    },

    learnItem(itemInstanceId) {
        const state = window.gameState;
        const index = state.player.inventory.findIndex(i => i.instanceId === itemInstanceId || i.id === itemInstanceId);
        if (index === -1) return false;

        const item = state.player.inventory[index];
        if (!item || (item.type !== "learnable" && !item.learnType)) {
            alert("This item cannot be studied or learned.");
            return false;
        }

        const lType = item.learnType;
        const targetId = item.targetId;

        if (lType === "skill") {
            if (!state.player.skills.unlocked) state.player.skills.unlocked = [];
            if (state.player.skills.unlocked.includes(targetId)) {
                alert(`You have already mastered this skill!`);
                return false;
            }
            state.player.skills.unlocked.push(targetId);

            const skillDef = state.getSkillDefinition ? state.getSkillDefinition(targetId) : null;
            const skillName = skillDef ? skillDef.name : targetId;

            if (state.addLog) {
                state.addLog(`📜 MASTERED: You studied [${item.name}] and unlocked the [${skillName}] special skill!`, "level", "📜");
            }
            if (window.CombatManager) {
                window.CombatManager.showDamagePopup(`📜 LEARNED: ${skillName}!`, false, false, "crit");
            }

            // Auto-equip if for current class
            if (item.heroClass === state.player.heroClass) {
                state.player.skills.activeSkillId = targetId;
                state.player.skills.activeCooldown = 0;
            }
        } else if (lType === "alchemy") {
            if (!state.player.unlockedRecipes) state.player.unlockedRecipes = [];
            if (state.player.unlockedRecipes.includes(targetId)) {
                alert(`You have already learned this alchemy recipe!`);
                return false;
            }
            state.player.unlockedRecipes.push(targetId);

            const recipe = (window.AlchemyRecipes || []).find(r => r.id === targetId);
            const recipeName = recipe ? recipe.name : item.name;

            if (state.addLog) {
                state.addLog(`⚗️ RECIPE MASTERED: You learned how to brew [${recipeName}]!`, "craft", "⚗️");
            }
            if (window.CombatManager) {
                window.CombatManager.showDamagePopup(`⚗️ RECIPE LEARNED!`, false, false, "potion");
            }
        } else if (lType === "forge") {
            if (!state.player.unlockedBlueprints) state.player.unlockedBlueprints = [];
            const bpId = item.id;
            const gearId = item.targetId;
            if (state.player.unlockedBlueprints.includes(bpId) || state.player.unlockedBlueprints.includes(gearId)) {
                alert(`You have already learned this blacksmith blueprint!`);
                return false;
            }
            state.player.unlockedBlueprints.push(bpId);
            if (gearId && gearId !== bpId) state.player.unlockedBlueprints.push(gearId);

            const craftedItem = window.ItemsData ? window.ItemsData[gearId] : null;
            const gearName = craftedItem ? craftedItem.name : item.name;

            if (state.addLog) {
                state.addLog(`⚒️ BLUEPRINT MASTERED: You can now forge [${gearName}] at the Blacksmith!`, "craft", "⚒️");
            }
            if (window.CombatManager) {
                window.CombatManager.showDamagePopup(`⚒️ BLUEPRINT LEARNED!`, false, false, "crit");
            }
        }

        // Consume scroll/blueprint from inventory
        state.player.inventory.splice(index, 1);
        state.save();
        state.notify();
        return true;
    },

    equipItem(itemInstanceId) {
        const state = window.gameState;
        const index = state.player.inventory.findIndex(i => i.instanceId === itemInstanceId || i.id === itemInstanceId);

        if (index === -1) return;

        const item = state.player.inventory[index];
        let slot = item.slot || 'trinket';
        if (slot === 'ring') slot = 'trinket';

        // Unequip currently equipped item if present
        if (state.player.equipment[slot]) {
            state.player.inventory.push(state.player.equipment[slot]);
        } else if (slot === 'trinket' && state.player.equipment.ring) {
            state.player.inventory.push(state.player.equipment.ring);
            state.player.equipment.ring = null;
        }

        // Equip new item & remove from inventory
        state.player.equipment[slot] = item;
        state.player.inventory.splice(index, 1);
        if (state.addLog) {
            state.addLog(`Equipped [${item.name}].`, "loot", "🗡️");
        }
        state.notify();
    },

    unequipSlot(slot) {
        const state = window.gameState;
        if (slot === 'ring') slot = 'trinket';
        const current = state.player.equipment[slot] || (slot === 'trinket' ? state.player.equipment.ring : null);
        if (!current) return;

        state.player.inventory.push(current);
        state.player.equipment[slot] = null;
        if (slot === 'trinket') state.player.equipment.ring = null;
        if (state.addLog) {
            state.addLog(`Unequipped [${current.name}].`, "loot", "📦");
        }
        state.notify();
    },

    forge(tierIdx) {
        const state = window.gameState;
        const forgeTiers = window.ForgeData || [
            { tier: 'common', name: 'Basic Forge', icon: '🔨', cost: 250, pool: ['common', 'common', 'rare'], desc: 'Mostly common gear with a chance at something Rare.' },
            { tier: 'rare', name: 'Master Forge', icon: '⚒️', cost: 1600, pool: ['rare', 'rare', 'epic'], desc: 'Reliable Rare equipment. Occasionally Epic.' },
            { tier: 'legendary', name: 'Aincrad Forge', icon: '🔥', cost: 9000, pool: ['epic', 'epic', 'legendary'], desc: 'Epic guaranteed. A chance at a Legendary relic.' }
        ];

        const f = forgeTiers[tierIdx];
        if (!f) return false;

        const reqLv = f.reqLevel || 1;
        if ((state.player.level || 1) < reqLv) {
            alert(`🔒 Locked! Requires Hero Level ${reqLv} to use the ${f.name}!`);
            return false;
        }

        if (!state.canAfford(f.cost)) {
            alert("Not enough gold to forge!");
            return false;
        }

        state.spendGold(f.cost);

        const pool = f.pool;
        const rarity = pool[Math.floor(Math.random() * pool.length)];
        const ilvl = (state.player.level || 1) + (state.combat?.stage || 1) + (tierIdx * 2);
        const item = window.rollItem ? window.rollItem(rarity, null, ilvl) : null;

        if (item) {
            this.addItem(item);
            if (state.addLog) {
                state.addLog(`The forge blazes... you receive [${item.name}] (${item.rarity.toUpperCase()})!`, "loot", "🔥");
            }
        }

        state.notify();
        return true;
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

        // Check Blueprint requirement
        if (recipe.requiresBlueprint && recipe.blueprintId) {
            const isUnlocked = state.isBlueprintUnlocked ? state.isBlueprintUnlocked(recipe.blueprintId) : (state.player.unlockedBlueprints && state.player.unlockedBlueprints.includes(recipe.blueprintId));
            if (!isUnlocked) {
                alert(`🔒 Locked! You must acquire and study the schematic blueprint for this equipment before you can forge it!`);
                return;
            }
        }

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

    brewPotion(recipeId) {
        const state = window.gameState;
        const recipe = (window.AlchemyRecipes || []).find(r => r.id === recipeId);
        const notifyMsg = (msg) => {
            if (typeof alert !== "undefined") {
                try { alert(msg); } catch (e) {}
            }
            if (state && typeof state.addLog === "function") {
                state.addLog(msg, "system", "⚠️");
            }
        };

        if (!recipe) {
            notifyMsg("Recipe not found!");
            return false;
        }

        // Check Recipe requirement
        if (recipe.requiresRecipe) {
            const isUnlocked = state.isRecipeUnlocked ? state.isRecipeUnlocked(recipe.id) : (state.player.unlockedRecipes && state.player.unlockedRecipes.includes(recipe.id));
            if (!isUnlocked) {
                notifyMsg(`📜 Recipe Locked! You must acquire and study the recipe scroll for ${recipe.name} before you can brew it!`);
                return false;
            }
        }

        const reqLv = recipe.reqLevel || 1;
        if ((state.player.level || 1) < reqLv) {
            notifyMsg(`🔒 Locked! Requires Hero Level ${reqLv} to use the ${recipe.tierName || 'Alchemical Table'}!`);
            return false;
        }

        if (recipe.goldCost && !state.canAfford(recipe.goldCost)) {
            notifyMsg(`Cannot afford brewing cost! Requires ${recipe.goldCost.toLocaleString()}g.`);
            return false;
        }

        if (recipe.materials) {
            for (const [mat, reqQty] of Object.entries(recipe.materials)) {
                const currentQty = (state.player.materials && state.player.materials[mat]) || 0;
                if (currentQty < reqQty) {
                    notifyMsg(`Missing ingredient: need ${reqQty}x ${mat} (you have ${currentQty})!`);
                    return false;
                }
            }
        }

        // Deduct gold and materials
        if (recipe.goldCost) state.spendGold(recipe.goldCost);
        if (recipe.materials) {
            for (const [mat, reqQty] of Object.entries(recipe.materials)) {
                state.player.materials[mat] -= reqQty;
            }
        }

        // Add result
        const resultId = recipe.result?.id || recipe.id;
        const qty = recipe.result?.qty || 1;
        if (!state.player.potions) state.player.potions = {};
        state.player.potions[resultId] = (state.player.potions[resultId] || 0) + qty;

        if (state.addLog) {
            state.addLog(`⚗️ Brewed ${qty}x [${recipe.name}] at the ${recipe.tierName}!`, "craft", "⚗️");
        }

        if (window.CombatManager) {
            window.CombatManager.showDamagePopup(`⚗️ Brewed: ${recipe.name}!`, false, false, "potion");
        }

        state.save();
        state.notify();
        return true;
    },

    rollLootDrop(mob) {
        if (!mob) return;
        const state = window.gameState;

        let dropMult = 1.0;
        if (state.world.activeEventId && window.EventsData && window.EventsData[state.world.activeEventId]) {
            dropMult *= (window.EventsData[state.world.activeEventId].dropMult || 1.0);
        }
        if (state.world.activeScenarioId && window.ScenariosData && window.ScenariosData[state.world.activeScenarioId]) {
            dropMult *= (window.ScenariosData[state.world.activeScenarioId].modifiers?.dropMult || 1.0);
        }

        // If mob specifies explicit dropTable
        if (mob.dropTable && mob.dropTable.length > 0) {
            const effectiveChance = Math.min(1.0, (mob.dropChance || 0.5) * dropMult);
            if (Math.random() <= effectiveChance) {
                mob.dropTable.forEach(entry => {
                    const entryChance = Math.min(1.0, entry.chance * dropMult);
                    if (Math.random() <= entryChance) {
                        if (entry.type === "material") {
                            const baseQty = Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min;
                            const qty = Math.max(1, Math.round(baseQty * Math.max(1, dropMult * 0.8)));
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
        if (roll < Math.min(0.95, 0.60 * dropMult)) {
            const mats = ["ironOre", "wood", "crystal"];
            if (mob.level > 20) mats.push("dragonScale");
            if (mob.level > 40) mats.push("shadowEssence");

            const droppedMat = mats[Math.floor(Math.random() * mats.length)];
            const baseQty = Math.floor(Math.random() * 3) + 1;
            const qty = Math.max(1, Math.round(baseQty * Math.max(1, dropMult * 0.8)));
            this.addMaterial(droppedMat, qty);
        }

        if (roll < Math.min(0.60, 0.18 * dropMult)) {
            const possibleItems = Object.keys(window.ItemsData).filter(k => window.ItemsData[k].type === "equipment");
            const droppedId = possibleItems[Math.floor(Math.random() * possibleItems.length)];
            this.addItem(droppedId);
        }
    }
};
