/* =========================================================
   REALM IDLE MANAGER - STANDALONE DASHBOARD CONTROLLER
========================================================= */

window.ManagerApp = {
    init() {
        this.bindTabs();
        this.bindEvents();
        this.renderDashboard();
        this.renderLists();
        this.startDashboardSync();
    },

    bindTabs() {
        document.querySelectorAll("[data-mgr-tab]").forEach(btn => {
            btn.addEventListener("click", () => {
                const target = btn.dataset.mgrTab;

                document.querySelectorAll("[data-mgr-tab]").forEach(b => b.classList.toggle("active", b === btn));
                document.querySelectorAll(".mgr-tab-content").forEach(tc => tc.classList.toggle("active", tc.id === `tab_${target}`));

                const titles = {
                    dashboard: "World Dashboard & Live Status",
                    classes: "Hero Classes & Combat Skills Configuration",
                    mobs: "Mob & AI Definitions & Drop Rates Editor",
                    items: "Items, Equipment Rarity & Drop Rates Catalog",
                    shop: "Merchant Shop Merchandise & Pricing Manager",
                    maps: "Realm Maps & Visual Gradients Editor",
                    weather: "Environmental Weather Phenomena Editor",
                    events: "Scenarios & World Events Designer",
                    data: "JSON Definitions Configuration Import/Export"
                };
                if (document.getElementById("mgrHeaderTitle")) {
                    document.getElementById("mgrHeaderTitle").textContent = titles[target] || "Game Manager";
                }

                if (target === "data") this.refreshJson();
            });
        });
    },

    bindEvents() {
        const api = window.GameAPI;

        // Return to game button
        const btnReturn = document.getElementById("btnReturnToGame");
        if (btnReturn) {
            btnReturn.addEventListener("click", () => {
                window.location.href = "index.html";
            });
        }

        // Export JSON button
        const btnExport = document.getElementById("btnMgrExport");
        if (btnExport) {
            btnExport.addEventListener("click", () => {
                const json = api.data.exportAllJSON();
                const blob = new Blob([json], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "realm_idle_config.json";
                a.click();
            });
        }

        // Mob Form Save
        const formMob = document.getElementById("formMobEditor");
        if (formMob) {
            formMob.addEventListener("submit", (e) => {
                e.preventDefault();
                const mobObj = {
                    id: document.getElementById("mobEdit_id").value.trim(),
                    name: document.getElementById("mobEdit_name").value.trim(),
                    icon: document.getElementById("mobEdit_icon").value.trim() || "👹",
                    type: document.getElementById("mobEdit_type").value.trim() || "MONSTER",
                    baseHp: parseInt(document.getElementById("mobEdit_hp").value, 10) || 1000,
                    baseDmg: parseInt(document.getElementById("mobEdit_dmg").value, 10) || 50,
                    goldReward: parseInt(document.getElementById("mobEdit_gold").value, 10) || 200,
                    xpReward: parseInt(document.getElementById("mobEdit_xp").value, 10) || 100,
                    dropChance: parseFloat(document.getElementById("mobEdit_dropChance") ? document.getElementById("mobEdit_dropChance").value : 0.35) || 0.35,
                    dropTable: (document.getElementById("mobEdit_dropTable") ? document.getElementById("mobEdit_dropTable").value : "")
                        .split(",").map(s => s.trim()).filter(Boolean),
                    levelMin: 1,
                    levelMax: 100
                };
                api.data.saveMob(mobObj);
                this.renderLists();
                alert(`Mob '${mobObj.name}' saved successfully!`);
            });
        }

        const btnSpawnEdited = document.getElementById("btnSpawnEditedMob");
        if (btnSpawnEdited) {
            btnSpawnEdited.addEventListener("click", () => {
                const mobId = document.getElementById("mobEdit_id").value.trim();
                if (mobId) api.combat.spawnMob(mobId);
            });
        }

        // Class Form Save & Apply
        const formClass = document.getElementById("formClassEditor");
        if (formClass) {
            formClass.addEventListener("submit", (e) => {
                e.preventDefault();
                const classId = document.getElementById("classEdit_id").value.trim();
                const heroObj = {
                    id: classId,
                    name: document.getElementById("classEdit_name").value.trim(),
                    icon: document.getElementById("classEdit_icon").value.trim() || "⚔️",
                    unlocked: document.getElementById("classEdit_unlocked").checked,
                    reqLevel: parseInt(document.getElementById("classEdit_reqLevel").value, 10) || 1,
                    hp: parseInt(document.getElementById("classEdit_hp").value, 10) || 100,
                    atk: parseInt(document.getElementById("classEdit_atk").value, 10) || 10,
                    critChance: parseFloat(document.getElementById("classEdit_crit").value) || 0.05,
                    lifesteal: parseFloat(document.getElementById("classEdit_lifesteal").value) || 0,
                    skill: {
                        id: (classId + "_skill"),
                        name: document.getElementById("classEdit_skillName").value.trim() || "Strike",
                        icon: document.getElementById("classEdit_skillIcon").value.trim() || "⚡",
                        cooldown: parseInt(document.getElementById("classEdit_skillCd").value, 10) || 8,
                        dmgMultiplier: parseFloat(document.getElementById("classEdit_skillMult").value) || 2.0,
                        desc: document.getElementById("classEdit_skillDesc").value.trim() || "Attacks enemy."
                    }
                };
                api.data.saveHeroClass(heroObj);
                this.renderLists();
                alert(`Hero Class '${heroObj.name}' saved and synced!`);
            });
        }

        const btnApplyClass = document.getElementById("btnApplyClassToPlayer");
        if (btnApplyClass) {
            btnApplyClass.addEventListener("click", () => {
                const classId = document.getElementById("classEdit_id").value.trim();
                if (classId && window.HeroesData[classId]) {
                    api.player.setHeroClass(classId);
                    alert(`Player class changed to '${window.HeroesData[classId].name}'!`);
                }
            });
        }

        // Shop Form Save & Delete
        const formShop = document.getElementById("formShopEditor");
        if (formShop) {
            formShop.addEventListener("submit", (e) => {
                e.preventDefault();
                const shopObj = {
                    id: document.getElementById("shopEdit_id").value.trim(),
                    name: document.getElementById("shopEdit_name").value.trim(),
                    category: document.getElementById("shopEdit_category").value,
                    icon: document.getElementById("shopEdit_icon").value.trim() || "🛍️",
                    itemId: document.getElementById("shopEdit_itemId").value.trim(),
                    costGold: parseInt(document.getElementById("shopEdit_costGold").value, 10) || 100,
                    reqLevel: parseInt(document.getElementById("shopEdit_reqLevel").value, 10) || 1,
                    matKey: document.getElementById("shopEdit_itemId").value.trim(),
                    matQty: parseInt(document.getElementById("shopEdit_matQty").value, 10) || 1,
                    desc: document.getElementById("shopEdit_desc").value.trim()
                };
                api.data.saveShopItem(shopObj);
                this.renderLists();
                alert(`Shop item '${shopObj.name}' listed successfully!`);
            });
        }

        const btnDeleteShop = document.getElementById("btnDeleteShopItem");
        if (btnDeleteShop) {
            btnDeleteShop.addEventListener("click", () => {
                const sId = document.getElementById("shopEdit_id").value.trim();
                if (sId && window.ShopData) {
                    const idx = window.ShopData.findIndex(s => s.id === sId);
                    if (idx >= 0) {
                        window.ShopData.splice(idx, 1);
                        api.data.persistCustomData();
                        api.data.broadcast("SHOP_UPDATED", null);
                        this.renderLists();
                        alert(`Removed item from shop.`);
                    }
                }
            });
        }

        // Item Form Save & Give
        const formItem = document.getElementById("formItemEditor");
        if (formItem) {
            formItem.addEventListener("submit", (e) => {
                e.preventDefault();
                const itemObj = {
                    id: document.getElementById("itemEdit_id").value.trim(),
                    name: document.getElementById("itemEdit_name").value.trim(),
                    slot: document.getElementById("itemEdit_slot").value,
                    rarity: document.getElementById("itemEdit_rarity").value,
                    icon: document.getElementById("itemEdit_icon").value.trim() || "📦",
                    sellValue: parseInt(document.getElementById("itemEdit_sellValue").value, 10) || 10,
                    atk: parseInt(document.getElementById("itemEdit_atk").value, 10) || 0,
                    hp: parseInt(document.getElementById("itemEdit_hp").value, 10) || 0,
                    critChance: parseFloat(document.getElementById("itemEdit_crit").value) || 0,
                    lifesteal: parseFloat(document.getElementById("itemEdit_lifesteal").value) || 0,
                    desc: document.getElementById("itemEdit_desc").value.trim()
                };
                api.data.saveItem(itemObj);
                this.renderLists();
                alert(`Item '${itemObj.name}' saved and synced!`);
            });
        }

        const btnGiveItem = document.getElementById("btnGiveItemToPlayer");
        if (btnGiveItem) {
            btnGiveItem.addEventListener("click", () => {
                const itemId = document.getElementById("itemEdit_id").value.trim();
                if (itemId && window.ItemsData[itemId]) {
                    const item = window.ItemsData[itemId];
                    if (item.slot === "consumable") {
                        window.gameState.player.potions[itemId] = (window.gameState.player.potions[itemId] || 0) + 5;
                        window.gameState.notify();
                        alert(`Granted 5x ${item.name} to player!`);
                    } else if (item.slot === "material") {
                        window.gameState.player.materials[itemId] = (window.gameState.player.materials[itemId] || 0) + 10;
                        window.gameState.notify();
                        alert(`Granted 10x ${item.name} to player!`);
                    } else {
                        if (window.InventoryManager) {
                            window.InventoryManager.addItem(itemId);
                            alert(`Granted 1x ${item.name} to player inventory!`);
                        }
                    }
                }
            });
        }

        const itemFilterSelect = document.getElementById("mgrItemFilter");
        if (itemFilterSelect) {
            itemFilterSelect.addEventListener("change", () => {
                this.renderItemList(itemFilterSelect.value);
            });
        }

        // Map Form Save
        const formMap = document.getElementById("formMapEditor");
        if (formMap) {
            formMap.addEventListener("submit", (e) => {
                e.preventDefault();
                const mapObj = {
                    id: document.getElementById("mapEdit_id").value.trim(),
                    name: document.getElementById("mapEdit_name").value.trim(),
                    realmIndex: parseInt(document.getElementById("mapEdit_realmIndex").value, 10) || 1,
                    roman: document.getElementById("mapEdit_roman").value.trim() || "I",
                    bgGradient: document.getElementById("mapEdit_bgGradient").value.trim(),
                    defaultWeather: "clear",
                    mobs: ["goblin"]
                };
                api.data.saveMap(mapObj);
                this.renderLists();
                alert(`Map '${mapObj.name}' saved successfully!`);
            });
        }

        const btnTravelEdited = document.getElementById("btnTravelEditedMap");
        if (btnTravelEdited) {
            btnTravelEdited.addEventListener("click", () => {
                const mapId = document.getElementById("mapEdit_id").value.trim();
                if (mapId) api.world.setMap(mapId);
            });
        }

        // Weather Form Save
        const formWeather = document.getElementById("formWeatherEditor");
        if (formWeather) {
            formWeather.addEventListener("submit", (e) => {
                e.preventDefault();
                const wId = document.getElementById("weatherEdit_id").value;
                if (window.WeatherData[wId]) {
                    const w = window.WeatherData[wId];
                    w.playerDmgMult = parseFloat(document.getElementById("weatherEdit_playerDmg").value);
                    w.enemyDmgMult = parseFloat(document.getElementById("weatherEdit_enemyDmg").value);
                    w.goldMult = parseFloat(document.getElementById("weatherEdit_gold").value);
                    w.xpMult = parseFloat(document.getElementById("weatherEdit_xp").value);
                    api.data.saveWeather(w);
                    alert(`Weather '${w.name}' updated!`);
                }
            });
        }

        const btnApplyWeather = document.getElementById("btnApplyEditedWeather");
        if (btnApplyWeather) {
            btnApplyWeather.addEventListener("click", () => {
                const wId = document.getElementById("weatherEdit_id").value;
                if (wId) api.world.setWeather(wId);
            });
        }

        // Scenarios Grid
        document.querySelectorAll("[data-mgr-scenario]").forEach(btn => {
            btn.addEventListener("click", () => {
                const scId = btn.dataset.mgrScenario;
                if (scId === "stop") api.scenarios.stop();
                else api.scenarios.run(scId);
            });
        });

        // JSON Actions
        const btnRefreshJson = document.getElementById("btnMgrRefreshJson");
        if (btnRefreshJson) btnRefreshJson.addEventListener("click", () => this.refreshJson());

        const btnImportJson = document.getElementById("btnMgrImportJson");
        if (btnImportJson) {
            btnImportJson.addEventListener("click", () => {
                const json = document.getElementById("txtJsonConfig").value;
                const ok = api.data.importAllJSON(json);
                if (ok) {
                    this.renderLists();
                    alert("JSON configuration imported successfully!");
                } else {
                    alert("Invalid JSON configuration.");
                }
            });
        }
    },

    startDashboardSync() {
        setInterval(() => this.renderDashboard(), 1000);
    },

    renderDashboard() {
        const state = window.gameState;
        if (!state) return;

        const map = window.MapsData[state.world.currentMapId] || window.MapsData.moonlit_vale;
        const weather = window.WeatherData[state.world.currentWeatherId] || window.WeatherData.clear;

        if (document.getElementById("dashMap")) document.getElementById("dashMap").textContent = map.name;
        if (document.getElementById("dashWeather")) document.getElementById("dashWeather").textContent = `${weather.icon} ${weather.name}`;
        if (document.getElementById("dashTime")) document.getElementById("dashTime").textContent = `${state.world.worldTime}:00`;
        if (document.getElementById("dashHero")) document.getElementById("dashHero").textContent = `Lvl ${state.player.level} · ${Math.floor(state.player.gold).toLocaleString()}g`;

        const mob = state.combat.currentMob;
        const activeMobContainer = document.getElementById("dashActiveMob");
        if (activeMobContainer && mob) {
            document.getElementById("dashMobName").textContent = mob.name;
            document.getElementById("dashMobHp").textContent = `${Math.max(0, Math.floor(mob.hp))} / ${mob.maxHp} HP`;
            activeMobContainer.querySelector(".mob-emoji").textContent = mob.icon;
        }

        const activeEvContainer = document.getElementById("dashActiveEvent");
        if (activeEvContainer) {
            if (state.world.activeScenarioId && window.ScenariosData[state.world.activeScenarioId]) {
                activeEvContainer.innerHTML = `<strong style="color: #ff5555;">🔥 ${window.ScenariosData[state.world.activeScenarioId].name} (${state.world.activeScenarioTimer}s)</strong>`;
            } else if (state.world.activeEventId && window.EventsData[state.world.activeEventId]) {
                activeEvContainer.innerHTML = `<strong style="color: #f2c76b;">🔴 ${window.EventsData[state.world.activeEventId].name} (${state.world.activeEventTimer}s)</strong>`;
            } else {
                activeEvContainer.innerHTML = `<span>No active world events</span>`;
            }
        }
    },

    renderLists() {
        // Render Classes List
        const classListEl = document.getElementById("mgrClassList");
        if (classListEl && window.HeroesData) {
            classListEl.innerHTML = "";
            Object.values(window.HeroesData).forEach(h => {
                const item = document.createElement("div");
                item.className = "mgr-list-item";
                const lockBadge = h.unlocked !== false ? `<span class="mgr-badge badge-uncommon">Available</span>` : `<span class="mgr-badge badge-legendary">Locked</span>`;
                item.innerHTML = `<span>${h.icon} <strong>${h.name}</strong> (Lv.${h.reqLevel || 1})</span> <div>${lockBadge} <small style="margin-left:6px; color:#edc76f;">${h.skill ? h.skill.name : 'No Skill'}</small></div>`;
                item.addEventListener("click", () => {
                    document.getElementById("classEdit_id").value = h.id;
                    document.getElementById("classEdit_name").value = h.name;
                    document.getElementById("classEdit_icon").value = h.icon;
                    document.getElementById("classEdit_unlocked").checked = (h.unlocked !== false);
                    document.getElementById("classEdit_reqLevel").value = h.reqLevel || 1;
                    document.getElementById("classEdit_hp").value = h.hp || 100;
                    document.getElementById("classEdit_atk").value = h.atk || 10;
                    document.getElementById("classEdit_crit").value = h.critChance || 0.05;
                    document.getElementById("classEdit_lifesteal").value = h.lifesteal || 0;
                    if (h.skill) {
                        document.getElementById("classEdit_skillName").value = h.skill.name || "";
                        document.getElementById("classEdit_skillIcon").value = h.skill.icon || "";
                        document.getElementById("classEdit_skillCd").value = h.skill.cooldown || 8;
                        document.getElementById("classEdit_skillMult").value = h.skill.dmgMultiplier || 2.0;
                        document.getElementById("classEdit_skillDesc").value = h.skill.desc || "";
                    }
                });
                classListEl.appendChild(item);
            });
        }

        // Render Mobs List
        const mobListEl = document.getElementById("mgrMobList");
        if (mobListEl && window.MobsData) {
            mobListEl.innerHTML = "";
            Object.values(window.MobsData).forEach(m => {
                const item = document.createElement("div");
                item.className = "mgr-list-item";
                const dropRateText = m.dropChance ? `${Math.round(m.dropChance * 100)}% Drop` : 'No Drops';
                item.innerHTML = `<span>${m.icon} <strong>${m.name}</strong></span> <small>HP: ${m.baseHp} | Dmg: ${m.baseDmg} | <span style="color:#edc76f;">${dropRateText}</span></small>`;
                item.addEventListener("click", () => {
                    document.getElementById("mobEdit_id").value = m.id;
                    document.getElementById("mobEdit_name").value = m.name;
                    document.getElementById("mobEdit_icon").value = m.icon;
                    document.getElementById("mobEdit_type").value = m.type;
                    document.getElementById("mobEdit_hp").value = m.baseHp;
                    document.getElementById("mobEdit_dmg").value = m.baseDmg;
                    document.getElementById("mobEdit_gold").value = m.goldReward;
                    document.getElementById("mobEdit_xp").value = m.xpReward;
                    if (document.getElementById("mobEdit_dropChance")) {
                        document.getElementById("mobEdit_dropChance").value = (m.dropChance !== undefined) ? m.dropChance : 0.35;
                    }
                    if (document.getElementById("mobEdit_dropTable")) {
                        document.getElementById("mobEdit_dropTable").value = m.dropTable ? m.dropTable.join(", ") : "";
                    }
                });
                mobListEl.appendChild(item);
            });
        }

        // Render Items List
        const filterVal = document.getElementById("mgrItemFilter") ? document.getElementById("mgrItemFilter").value : "all";
        this.renderItemList(filterVal);

        // Render Shop List
        const shopListEl = document.getElementById("mgrShopList");
        if (shopListEl && window.ShopData) {
            shopListEl.innerHTML = "";
            window.ShopData.forEach(s => {
                const item = document.createElement("div");
                item.className = "mgr-list-item";
                item.innerHTML = `<span>${s.icon} <strong>${s.name}</strong> <small style="color:#85899f;">[${s.category}]</small></span> <small style="color:#edc76f;">✦ ${s.costGold}g · Lv.${s.reqLevel || 1}</small>`;
                item.addEventListener("click", () => {
                    document.getElementById("shopEdit_id").value = s.id;
                    document.getElementById("shopEdit_name").value = s.name;
                    document.getElementById("shopEdit_category").value = s.category;
                    document.getElementById("shopEdit_icon").value = s.icon;
                    document.getElementById("shopEdit_itemId").value = s.itemId || s.matKey || "";
                    document.getElementById("shopEdit_costGold").value = s.costGold;
                    document.getElementById("shopEdit_reqLevel").value = s.reqLevel || 1;
                    document.getElementById("shopEdit_matQty").value = s.matQty || 1;
                    document.getElementById("shopEdit_desc").value = s.desc || "";
                });
                shopListEl.appendChild(item);
            });
        }

        // Render Maps List
        const mapListEl = document.getElementById("mgrMapList");
        if (mapListEl && window.MapsData) {
            mapListEl.innerHTML = "";
            Object.values(window.MapsData).forEach(m => {
                const item = document.createElement("div");
                item.className = "mgr-list-item";
                item.innerHTML = `<span>🗺️ <strong>${m.name}</strong> [Realm ${m.roman}]</span>`;
                item.addEventListener("click", () => {
                    document.getElementById("mapEdit_id").value = m.id;
                    document.getElementById("mapEdit_name").value = m.name;
                    document.getElementById("mapEdit_realmIndex").value = m.realmIndex;
                    document.getElementById("mapEdit_roman").value = m.roman;
                    document.getElementById("mapEdit_bgGradient").value = m.bgGradient;
                });
                mapListEl.appendChild(item);
            });
        }

        // Render Weather List
        const weatherListEl = document.getElementById("mgrWeatherList");
        if (weatherListEl && window.WeatherData) {
            weatherListEl.innerHTML = "";
            Object.values(window.WeatherData).forEach(w => {
                const item = document.createElement("div");
                item.className = "mgr-list-item";
                item.innerHTML = `<span>${w.icon} <strong>${w.name}</strong></span> <small>Dmg: ${w.playerDmgMult}x | Gold: ${w.goldMult}x</small>`;
                item.addEventListener("click", () => {
                    document.getElementById("weatherEdit_id").value = w.id;
                    document.getElementById("weatherEdit_playerDmg").value = w.playerDmgMult;
                    document.getElementById("weatherEdit_enemyDmg").value = w.enemyDmgMult;
                    document.getElementById("weatherEdit_gold").value = w.goldMult;
                    document.getElementById("weatherEdit_xp").value = w.xpMult;
                });
                weatherListEl.appendChild(item);
            });
        }
    },

    renderItemList(filter = "all") {
        const itemListEl = document.getElementById("mgrItemList");
        if (!itemListEl || !window.ItemsData) return;
        itemListEl.innerHTML = "";
        Object.values(window.ItemsData).forEach(it => {
            if (filter !== "all" && it.slot !== filter) return;
            const item = document.createElement("div");
            item.className = "mgr-list-item";
            const rarityBadge = `<span class="mgr-badge badge-${it.rarity || 'common'}">${it.rarity || 'common'}</span>`;
            let statText = "";
            if (it.atk) statText += `+${it.atk} Atk `;
            if (it.hp) statText += `+${it.hp} HP `;
            if (it.critChance) statText += `+${Math.round(it.critChance * 100)}% Crit `;
            if (it.lifesteal) statText += `+${Math.round(it.lifesteal * 100)}% LS `;
            if (!statText && it.desc) statText = it.desc;

            item.innerHTML = `<span>${it.icon} <strong>${it.name}</strong> ${rarityBadge}</span> <small style="color:#85899f;">${statText}</small>`;
            item.addEventListener("click", () => {
                document.getElementById("itemEdit_id").value = it.id;
                document.getElementById("itemEdit_name").value = it.name;
                document.getElementById("itemEdit_slot").value = it.slot;
                document.getElementById("itemEdit_rarity").value = it.rarity || "common";
                document.getElementById("itemEdit_icon").value = it.icon;
                document.getElementById("itemEdit_sellValue").value = it.sellValue || 20;
                document.getElementById("itemEdit_atk").value = it.atk || 0;
                document.getElementById("itemEdit_hp").value = it.hp || 0;
                document.getElementById("itemEdit_crit").value = it.critChance || 0;
                document.getElementById("itemEdit_lifesteal").value = it.lifesteal || 0;
                document.getElementById("itemEdit_desc").value = it.desc || "";
            });
            itemListEl.appendChild(item);
        });
    },

    refreshJson() {
        const area = document.getElementById("txtJsonConfig");
        if (area && window.GameAPI) {
            area.value = window.GameAPI.data.exportAllJSON();
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.ManagerApp.init();
});
