/* =========================================================
   REALM IDLE API - UNIFIED GAME CONTROLLER & BRIDGE
========================================================= */

// Inter-tab synchronization broadcast channel
const syncChannel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("realm_idle_sync") : null;

window.GameAPI = {
    // Player Controller
    player: {
        addGold(amount) { window.gameState.addGold(amount); },
        setGold(amount) { window.gameState.player.gold = Math.max(0, amount); window.gameState.notify(); },
        addPower(amount) { window.gameState.player.power += amount; window.gameState.notify(); },
        setPower(amount) { window.gameState.player.power = Math.max(1, amount); window.gameState.notify(); },
        heal() {
            const state = window.gameState;
            if (!state || !state.player) return;
            const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
            state.player.hp = effMaxHp;
            if (state.reduceFatigue) state.reduceFatigue(100);
            if (state.player.fatigue !== undefined) state.player.fatigue = 0;
            if (state.combat && state.combat.inTemple) {
                state.combat.inTemple = false;
            }
            if (window.CombatManager) {
                window.CombatManager.showDamagePopup(`❤️ +${Math.floor(effMaxHp)} HP (Full Heal)`, false, false, "heal");
            }
            if (state.addLog) {
                state.addLog("❤️ Full health and stamina restored!", "level", "❤️");
            }
            state.notify();
            if (window.MainEngine && typeof window.MainEngine.updateUI === "function") {
                window.MainEngine.updateUI();
            }
        },
        enableGodMode(enable) { window.devMode.godMode = enable; if (window.DebugWidget) window.DebugWidget.syncUI(); },
        enableOneHit(enable) { window.devMode.oneHitKill = enable; if (window.DebugWidget) window.DebugWidget.syncUI(); },
        enableInfiniteGold(enable) { window.devMode.infiniteGold = enable; window.gameState.notify(); },
        enableInfiniteHp(enable) { window.devMode.infiniteHealth = enable; },
        triggerPassivePayout() {
            if (window.gameState && typeof window.gameState.triggerPassiveIncomePayout === "function") {
                return window.gameState.triggerPassiveIncomePayout();
            }
            return 0;
        },

        castSkill() {
            if (window.CombatManager) window.CombatManager.triggerSkill();
        },
        toggleAutoCast(enable = null) {
            const state = window.gameState;
            state.player.skills.autoCast = (enable !== null) ? enable : !state.player.skills.autoCast;
            state.notify();
        },
        usePotion(potionId) {
            if (window.InventoryManager) window.InventoryManager.usePotion(potionId);
        },
        toggleAutoPotion(enable = null) {
            const state = window.gameState;
            state.player.autoPotion = (enable !== null) ? enable : !state.player.autoPotion;
            state.notify();
        },
        enableNoCooldowns(enable) {
            if (window.devMode) window.devMode.noCooldowns = enable;
            if (window.DebugWidget) window.DebugWidget.syncUI();
        },
        simulateOffline(hours = 8) {
            const elapsedSeconds = hours * 3600;
            const report = window.gameState.calculateOfflineProgress(elapsedSeconds);
            if (report && window.UIManager && typeof window.UIManager.showOfflineModal === "function") {
                window.UIManager.showOfflineModal(report);
            }
        },
        maxEquippedGear() {
            const state = window.gameState;
            Object.keys(state.player.equipment).forEach(slot => {
                const item = state.player.equipment[slot];
                if (item) {
                    item.upgradeLevel = 10;
                }
            });
            state.notify();
        },
        giveSupplies() {
            const state = window.gameState;
            state.player.potions.potion_minor = (state.player.potions.potion_minor || 0) + 50;
            state.player.potions.potion_major = (state.player.potions.potion_major || 0) + 50;
            state.player.potions.potion_full = (state.player.potions.potion_full || 0) + 50;
            state.player.potions.elixir_fury = (state.player.potions.elixir_fury || 0) + 20;
            state.player.potions.elixir_iron = (state.player.potions.elixir_iron || 0) + 20;
            state.player.materials.iron_ore = (state.player.materials.iron_ore || 0) + 100;
            state.player.materials.shadow_cloth = (state.player.materials.shadow_cloth || 0) + 100;
            state.player.materials.magic_shard = (state.player.materials.magic_shard || 0) + 100;
            state.player.materials.dragon_scale = (state.player.materials.dragon_scale || 0) + 100;
            state.notify();
        },
        completeOnboarding(name, gender, heroClass) {
            window.gameState.completeOnboarding(name, gender, heroClass);
        },
        setCrownTime(minutes) {
            if (window.CrownManager) {
                return window.CrownManager.setEquippedCrownDuration(minutes);
            }
            return false;
        },
        addCrownTime(minutes) {
            if (window.CrownManager) {
                return window.CrownManager.addEquippedCrownTime(minutes);
            }
            return false;
        },
        resetToNewGame() {
            window.gameState.resetToNewGame();
        },
        wipeAllDataAndRestart() {
            localStorage.removeItem("realmIdleRootSave");
            window.location.reload();
        },
        clearLogs() {
            if (window.gameState && typeof window.gameState.clearLogs === "function") {
                window.gameState.clearLogs();
            }
        },
        setKingdomUnlocked(unlocked) {
            const state = window.gameState;
            if (state && state.player) {
                state.player.moonlitVale3Cleared = !!unlocked;
                if (unlocked && state.player.level < 5) {
                    state.player.level = 5;
                }
                state.notify();
                if (window.GameAPI && window.GameAPI.data) {
                    window.GameAPI.data.broadcast("KINGDOM_OVERRIDE", { unlocked: !!unlocked });
                }
            }
        }
    },

    // Combat Controller
    combat: {
        toggleAutoFight(enable = null) {
            const state = window.gameState;
            state.combat.autoFight = (enable !== null) ? enable : !state.combat.autoFight;
            state.notify();
            return state.combat.autoFight;
        },
        manualStrike() {
            if (window.CombatManager) window.CombatManager.manualStrike();
        },
        resumeFromTemple() {
            window.gameState.resumeProgression();
        },
        killCurrentEnemy() {
            if (window.CombatManager && window.gameState.combat.currentMob) {
                window.gameState.combat.currentMob.hp = 0;
                window.CombatManager.onMobDefeated();
            }
        },
        spawnMob(mobId, customOpts) {
            if (window.SpawningManager) window.SpawningManager.spawnMobById(mobId, customOpts);
        },
        clearMobs() {
            if (window.SpawningManager) window.SpawningManager.clearMobs();
        }
    },

    // Shop Controller
    shop: {
        buyItem(shopId) {
            const state = window.gameState;
            const shopItem = (window.ShopData || []).find(s => s.id === shopId);
            if (!shopItem) return false;

            if (state.player.level < (shopItem.reqLevel || 1)) {
                alert(`Requires Hero Level ${shopItem.reqLevel}!`);
                return false;
            }

            if (!state.canAfford(shopItem.costGold)) {
                alert("Not enough gold!");
                return false;
            }

            state.spendGold(shopItem.costGold);

            if (shopItem.category === "material") {
                if (window.InventoryManager) window.InventoryManager.addMaterial(shopItem.matKey, shopItem.matQty || 5);
            } else if (shopItem.category === "consumable") {
                state.player.potions[shopItem.itemId] = (state.player.potions[shopItem.itemId] || 0) + 1;
                state.notify();
            } else {
                if (window.InventoryManager) window.InventoryManager.addItem(shopItem.itemId);
            }

            if (window.devMode && typeof window.devMode.logToConsole === "function") {
                window.devMode.logToConsole(`🛒 Purchased: ${shopItem.name || shopItem.itemId} for ${shopItem.costGold}g`, "success");
            }

            return true;
        },
        buyUpgrade(id) {
            if (window.buyUpgrade) return window.buyUpgrade(id);
            return false;
        }
    },

    // Inventory & Upgrades Controller
    inventory: {
        upgradeItem(itemInstanceId) {
            if (window.InventoryManager) window.InventoryManager.upgradeItem(itemInstanceId);
        },
        sellItem(itemInstanceId) {
            if (window.InventoryManager) window.InventoryManager.sellItem(itemInstanceId);
        },
        equipItem(itemInstanceId) {
            if (window.InventoryManager) window.InventoryManager.equipItem(itemInstanceId);
        },
        unequipSlot(slot) {
            if (window.InventoryManager) window.InventoryManager.unequipSlot(slot);
        },
        forge(tierIdx) {
            if (window.InventoryManager) return window.InventoryManager.forge(tierIdx);
            return false;
        }
    },

    // World & Environment Controller
    world: {
        setMap(mapId) { if (window.MapManager) window.MapManager.loadMap(mapId); },
        setWeather(weatherId) { if (window.WeatherManager) window.WeatherManager.setWeather(weatherId); },
        setTime(hour) { if (window.TimeManager) window.TimeManager.setTime(hour); },
        setGameSpeed(speed) {
            window.devMode.gameSpeed = speed;
            if (window.MainEngine) window.MainEngine.restartGameLoops();
            if (window.DebugWidget) window.DebugWidget.syncUI();
        }
    },

    // Events & Scenarios Controller
    events: {
        start(eventId) {
            if (window.EventManager) window.EventManager.startEvent(eventId);
            if (syncChannel) syncChannel.postMessage({ type: "EVENT_START", eventId, time: Date.now() });
        },
        stop() {
            if (window.EventManager) window.EventManager.stopEvent();
            if (syncChannel) syncChannel.postMessage({ type: "EVENT_STOP", time: Date.now() });
        }
    },

    scenarios: {
        run(scenarioId) {
            if (window.ScenarioManager) window.ScenarioManager.runScenario(scenarioId);
            if (syncChannel) syncChannel.postMessage({ type: "SCENARIO_RUN", scenarioId, time: Date.now() });
        },
        stop() {
            if (window.ScenarioManager) window.ScenarioManager.stopScenario();
            if (syncChannel) syncChannel.postMessage({ type: "SCENARIO_STOP", time: Date.now() });
        }
    },

    // Data Management & Admin Editor API
    data: {
        saveMob(mobObj) {
            window.MobsData[mobObj.id] = { ...mobObj };
            this.persistCustomData();
            this.broadcast("MOB_UPDATED", mobObj);
        },
        saveMap(mapObj) {
            window.MapsData[mapObj.id] = { ...mapObj };
            this.persistCustomData();
            this.broadcast("MAP_UPDATED", mapObj);
        },
        saveWeather(weatherObj) {
            window.WeatherData[weatherObj.id] = { ...weatherObj };
            this.persistCustomData();
            this.broadcast("WEATHER_UPDATED", weatherObj);
        },
        saveEvent(eventObj) {
            window.EventsData[eventObj.id] = { ...eventObj };
            this.persistCustomData();
            this.broadcast("EVENT_UPDATED", eventObj);
        },
        saveHeroClass(heroObj) {
            window.HeroesData[heroObj.id] = { ...heroObj };
            this.persistCustomData();
            this.broadcast("HERO_UPDATED", heroObj);
        },
        saveShopItem(shopObj) {
            const idx = (window.ShopData || []).findIndex(s => s.id === shopObj.id);
            if (idx >= 0) window.ShopData[idx] = { ...shopObj };
            else window.ShopData.push({ ...shopObj });
            this.persistCustomData();
            this.broadcast("SHOP_UPDATED", shopObj);
        },
        saveItem(itemObj) {
            window.ItemsData[itemObj.id] = { ...itemObj };
            this.persistCustomData();
            this.broadcast("ITEM_UPDATED", itemObj);
        },
        saveAlchemyRecipe(recipeObj) {
            if (!window.AlchemyRecipes) window.AlchemyRecipes = [];
            const idx = window.AlchemyRecipes.findIndex(r => r.id === recipeObj.id);
            if (idx >= 0) window.AlchemyRecipes[idx] = { ...recipeObj };
            else window.AlchemyRecipes.push({ ...recipeObj });
            this.persistCustomData();
            this.broadcast("RECIPE_UPDATED", recipeObj);
        },
        deleteAlchemyRecipe(id) {
            if (!window.AlchemyRecipes) return;
            const idx = window.AlchemyRecipes.findIndex(r => r.id === id);
            if (idx >= 0) window.AlchemyRecipes.splice(idx, 1);
            this.persistCustomData();
            this.broadcast("RECIPE_DELETED", { id });
        },
        saveScenario(scenObj) {
            if (!window.ScenariosData) window.ScenariosData = {};
            window.ScenariosData[scenObj.id] = { ...scenObj };
            this.persistCustomData();
            this.broadcast("SCENARIO_UPDATED", scenObj);
        },
        deleteScenario(id) {
            if (!window.ScenariosData) return;
            delete window.ScenariosData[id];
            this.persistCustomData();
            this.broadcast("SCENARIO_DELETED", { id });
        },
        deleteMob(id) {
            delete window.MobsData[id];
            this.persistCustomData();
            this.broadcast("MOB_DELETED", { id });
        },
        deleteHeroClass(id) {
            delete window.HeroesData[id];
            this.persistCustomData();
            this.broadcast("HERO_DELETED", { id });
        },
        deleteItem(id) {
            delete window.ItemsData[id];
            this.persistCustomData();
            this.broadcast("ITEM_DELETED", { id });
        },
        deleteShopItem(id) {
            const idx = (window.ShopData || []).findIndex(s => s.id === id);
            if (idx >= 0) window.ShopData.splice(idx, 1);
            this.persistCustomData();
            this.broadcast("SHOP_DELETED", { id });
        },
        deleteMap(id) {
            delete window.MapsData[id];
            this.persistCustomData();
            this.broadcast("MAP_DELETED", { id });
        },
        persistCustomData() {
            localStorage.setItem("realmIdleCustomData", JSON.stringify({
                mobs: window.MobsData,
                maps: window.MapsData,
                weather: window.WeatherData,
                events: window.EventsData,
                scenarios: window.ScenariosData,
                heroes: window.HeroesData,
                items: window.ItemsData,
                shop: window.ShopData,
                alchemy: window.AlchemyRecipes
            }));
        },
        loadCustomData() {
            const saved = localStorage.getItem("realmIdleCustomData");
            if (saved) {
                try {
                    const data = JSON.parse(saved);
                    if (data.mobs) Object.assign(window.MobsData, data.mobs);
                    if (data.maps) Object.assign(window.MapsData, data.maps);
                    if (data.weather) Object.assign(window.WeatherData, data.weather);
                    if (data.events) Object.assign(window.EventsData, data.events);
                    if (data.heroes) {
                        Object.assign(window.HeroesData, data.heroes);
                        Object.keys(window.HeroesData).forEach(hid => {
                            const h = window.HeroesData[hid];
                            if (!h.promotions || !Array.isArray(h.promotions) || h.promotions.length === 0) {
                                if (window.DefaultHeroPromotions && window.DefaultHeroPromotions[hid]) {
                                    h.promotions = JSON.parse(JSON.stringify(window.DefaultHeroPromotions[hid]));
                                }
                            }
                        });
                    }
                    if (data.items) Object.assign(window.ItemsData, data.items);
                    if (data.shop && Array.isArray(data.shop)) {
                        window.ShopData = data.shop.map(s => {
                            const it = (s.itemId && window.ItemsData && window.ItemsData[s.itemId]) ||
                                       (s.matKey && window.MaterialsData && window.MaterialsData[s.matKey]) ||
                                       (s.matKey && window.ItemsData && window.ItemsData[s.matKey]) || {};
                            return {
                                ...s,
                                name: (s.name && s.name !== "undefined") ? s.name : (it.name || s.id || "Shop Item"),
                                icon: (s.icon && s.icon !== "undefined") ? s.icon : (it.icon || "🛍️"),
                                category: (s.category && s.category !== "undefined") ? s.category : (it.slot || it.type || (s.matKey ? "material" : "item")),
                                costGold: s.costGold || s.cost || it.baseValue || 100,
                                reqLevel: s.reqLevel || 1,
                                reqMap: s.reqMap || "any",
                                reqDepth: s.reqDepth || 1,
                                description: s.description || s.desc || it.description || ""
                            };
                        });
                    }
                    if (data.alchemy && Array.isArray(data.alchemy)) window.AlchemyRecipes = data.alchemy;
                } catch (e) {
                    console.log("Custom data load failed.");
                }
            }
        },
        resetShopData() {
            try {
                const saved = localStorage.getItem("realmIdleCustomData");
                if (saved) {
                    const parsed = JSON.parse(saved);
                    delete parsed.shop;
                    localStorage.setItem("realmIdleCustomData", JSON.stringify(parsed));
                }
            } catch(e) {}
            this.broadcast("SHOP_RESET", null);
        },
        broadcast(action, payload) {
            if (syncChannel) {
                syncChannel.postMessage({ action, payload, time: Date.now() });
            }
        },
        exportAllJSON() {
            return JSON.stringify({
                mobs: window.MobsData,
                maps: window.MapsData,
                weather: window.WeatherData,
                events: window.EventsData,
                scenarios: window.ScenariosData,
                heroes: window.HeroesData,
                items: window.ItemsData,
                shop: window.ShopData,
                recipes: window.CraftingRecipes,
                alchemy: window.AlchemyRecipes
            }, null, 2);
        },
        importAllJSON(jsonString) {
            try {
                const data = JSON.parse(jsonString);
                if (data.mobs) Object.assign(window.MobsData, data.mobs);
                if (data.maps) Object.assign(window.MapsData, data.maps);
                if (data.weather) Object.assign(window.WeatherData, data.weather);
                if (data.events) Object.assign(window.EventsData, data.events);
                if (data.scenarios) Object.assign(window.ScenariosData, data.scenarios);
                if (data.heroes) {
                    Object.assign(window.HeroesData, data.heroes);
                    Object.keys(window.HeroesData).forEach(hid => {
                        const h = window.HeroesData[hid];
                        if (!h.promotions || !Array.isArray(h.promotions) || h.promotions.length === 0) {
                            if (window.DefaultHeroPromotions && window.DefaultHeroPromotions[hid]) {
                                h.promotions = JSON.parse(JSON.stringify(window.DefaultHeroPromotions[hid]));
                            }
                        }
                    });
                }
                if (data.items) Object.assign(window.ItemsData, data.items);
                if (data.shop && Array.isArray(data.shop)) window.ShopData = data.shop;
                if (data.alchemy && Array.isArray(data.alchemy)) window.AlchemyRecipes = data.alchemy;
                this.persistCustomData();
                this.broadcast("ALL_IMPORTED", null);
                return true;
            } catch (e) {
                return false;
            }
        }
    },

    // Game Rules & Economy Configuration API
    settings: {
        saveRules(rules) {
            const state = window.gameState;
            if (rules.guildIncome) {
                state.guildIncome = rules.guildIncome;
                localStorage.setItem("realmIdle_cfg_guildIncome", JSON.stringify(rules.guildIncome));
            }
            if (rules.templeDonation) {
                state.templeDonation = rules.templeDonation;
                localStorage.setItem("realmIdle_cfg_templeDonation", JSON.stringify(rules.templeDonation));
            }
            state.save();
            state.notify();
            if (syncChannel) syncChannel.postMessage({ type: "RULES_UPDATED", rules });
        },
        loadRules() {
            let gi = null;
            let td = null;
            try {
                const giStr = localStorage.getItem("realmIdle_cfg_guildIncome");
                if (giStr) {
                    gi = JSON.parse(giStr);
                    if (window.gameState) window.gameState.guildIncome = gi;
                } else if (window.gameState && window.gameState.guildIncome) {
                    gi = window.gameState.guildIncome;
                }
                const tdStr = localStorage.getItem("realmIdle_cfg_templeDonation");
                if (tdStr) {
                    td = JSON.parse(tdStr);
                    if (window.gameState) window.gameState.templeDonation = td;
                } else if (window.gameState && window.gameState.templeDonation) {
                    td = window.gameState.templeDonation;
                }
            } catch (e) {}
            return {
                guildIncome: gi || (window.gameState ? window.gameState.guildIncome : { enabled: true, goldPerSecond: 3 }),
                templeDonation: td || (window.gameState ? window.gameState.templeDonation : { enabled: true, cost: 50 })
            };
        }
    }
};

// Auto-load custom data & rules on startup
window.GameAPI.data.loadCustomData();
if (window.GameAPI.settings) window.GameAPI.settings.loadRules();

// Listen for broadcast sync across tabs
if (syncChannel) {
    syncChannel.onmessage = (e) => {
        if (!e.data) return;
        if (e.data.type === "SCENARIO_RUN" && window.ScenarioManager) {
            window.ScenarioManager.runScenario(e.data.scenarioId);
        } else if (e.data.type === "SCENARIO_STOP" && window.ScenarioManager) {
            window.ScenarioManager.stopScenario();
        } else if (e.data.type === "EVENT_START" && window.EventManager) {
            window.EventManager.startEvent(e.data.eventId);
        } else if (e.data.type === "EVENT_STOP" && window.EventManager) {
            window.EventManager.stopEvent();
        } else if (e.data.action === "KINGDOM_OVERRIDE") {
            if (window.gameState) {
                window.gameState.player.moonlitVale3Cleared = !!(e.data.payload && e.data.payload.unlocked);
                if (e.data.payload && e.data.payload.unlocked && window.gameState.player.level < 5) {
                    window.gameState.player.level = 5;
                }
            }
        }

        window.GameAPI.data.loadCustomData();
        if (window.GameAPI.settings) window.GameAPI.settings.loadRules();
        if (window.gameState) window.gameState.notify();
    };
}

