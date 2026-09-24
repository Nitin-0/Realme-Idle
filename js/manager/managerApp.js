/* =========================================================
   REALM IDLE MANAGER - ADVANCED CRUD DASHBOARD CONTROLLER
========================================================= */

window.ManagerApp = {
    mobSearchQuery: "",
    itemSearchQuery: "",
    itemFilter: "all",
    classSearchQuery: "",
    shopSearchQuery: "",
    currentMobDrops: [],

    init() {
        this.bindTabs();
        this.bindEvents();
        this.populateDropdowns();
        this.loadGameRulesForm();
        this.renderDashboard();
        this.renderLists();
        this.startDashboardSync();
    },

    showToast(message, type = "success") {
        const container = document.getElementById("mgrToastContainer");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = `mgr-toast ${type}`;
        const icon = type === "success" ? "✅" : (type === "error" ? "❌" : "ℹ️");
        toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add("fade-out");
            setTimeout(() => toast.remove(), 250);
        }, 3200);
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
                this.showToast("Exported configuration JSON file!", "info");
            });
        }

        // ==================== GAME RULES & ECONOMY ====================
        const formRules = document.getElementById("formGameRules");
        if (formRules) {
            formRules.addEventListener("submit", (e) => {
                e.preventDefault();
                const guildEnabled = document.getElementById("cfg_guildIncomeEnabled").checked;
                const guildRate = parseInt(document.getElementById("cfg_guildIncomeRate").value, 10) || 0;
                const templeEnabled = document.getElementById("cfg_templeDonationEnabled").checked;
                const templeCost = parseInt(document.getElementById("cfg_templeDonationCost").value, 10) || 0;

                api.settings.saveRules({
                    guildIncome: { enabled: guildEnabled, goldPerSecond: Math.max(0, guildRate) },
                    templeDonation: { enabled: templeEnabled, cost: Math.max(0, templeCost) }
                });
                this.showToast("Game Rules & Rewards updated and synced across all tabs!", "success");
            });
        }

        // ==================== MOBS CRUD ====================
        const btnNewMob = document.getElementById("btnNewMob");
        if (btnNewMob) {
            btnNewMob.addEventListener("click", () => this.newMob());
        }

        const mobSearch = document.getElementById("mobSearchInput");
        if (mobSearch) {
            mobSearch.addEventListener("input", (e) => {
                this.mobSearchQuery = (e.target.value || "").trim().toLowerCase();
                this.renderMobList();
            });
        }

        const btnAddDrop = document.getElementById("btnAddDropRow");
        if (btnAddDrop) {
            btnAddDrop.addEventListener("click", () => {
                this.addDropRow({ type: "material", key: "ironOre", chance: 0.5, min: 1, max: 2 });
            });
        }

        const formMob = document.getElementById("formMobEditor");
        if (formMob) {
            formMob.addEventListener("submit", (e) => {
                e.preventDefault();
                const mobId = document.getElementById("mobEdit_id").value.trim();
                const mobName = document.getElementById("mobEdit_name").value.trim();
                if (!mobId || !mobName) {
                    this.showToast("Mob ID and Name are required.", "error");
                    return;
                }

                const existing = (window.MobsData && window.MobsData[mobId]) || {};
                const dropTable = this.collectDropTable();
                const mobObj = {
                    ...existing,
                    id: mobId,
                    name: mobName,
                    icon: document.getElementById("mobEdit_icon").value.trim() || "👹",
                    type: document.getElementById("mobEdit_type").value.trim() || "MONSTER",
                    baseHp: parseInt(document.getElementById("mobEdit_hp").value, 10) || 1000,
                    baseDmg: parseInt(document.getElementById("mobEdit_dmg").value, 10) || 50,
                    goldReward: parseInt(document.getElementById("mobEdit_gold").value, 10) || 200,
                    xpReward: parseInt(document.getElementById("mobEdit_xp").value, 10) || 100,
                    dropChance: parseFloat(document.getElementById("mobEdit_dropChance").value) || 0.45,
                    isBoss: document.getElementById("mobEdit_isBoss").checked,
                    isUniversal: document.getElementById("mobEdit_isUniversal").checked,
                    assignedMap: document.getElementById("mobEdit_assignedMap").value,
                    dropTable: dropTable,
                    levelMin: existing.levelMin || 1,
                    levelMax: existing.levelMax || 100
                };
                api.data.saveMob(mobObj);
                this.populateDropdowns();
                this.renderMobList();
                this.showToast(`Mob '${mobObj.name}' saved and synced!`, "success");
            });
        }

        const btnDeleteMob = document.getElementById("btnDeleteMob");
        if (btnDeleteMob) {
            btnDeleteMob.addEventListener("click", () => {
                const mobId = document.getElementById("mobEdit_id").value.trim();
                if (!mobId || !window.MobsData[mobId]) {
                    this.showToast("Select a valid mob to delete.", "error");
                    return;
                }
                if (confirm(`Permanently delete mob '${window.MobsData[mobId].name}' (${mobId})?`)) {
                    api.data.deleteMob(mobId);
                    this.populateDropdowns();
                    this.renderMobList();
                    this.newMob();
                    this.showToast(`Deleted mob ${mobId}.`, "info");
                }
            });
        }

        const btnSpawnEdited = document.getElementById("btnSpawnEditedMob");
        if (btnSpawnEdited) {
            btnSpawnEdited.addEventListener("click", () => {
                const mobId = document.getElementById("mobEdit_id").value.trim();
                if (mobId) {
                    api.combat.spawnMob(mobId);
                    this.showToast(`Spawned '${mobId}' into active combat!`, "info");
                }
            });
        }

        // ==================== CLASSES CRUD ====================
        const btnNewClass = document.getElementById("btnNewClass");
        if (btnNewClass) {
            btnNewClass.addEventListener("click", () => this.newClass());
        }

        const classSearch = document.getElementById("classSearchInput");
        if (classSearch) {
            classSearch.addEventListener("input", (e) => {
                this.classSearchQuery = (e.target.value || "").trim().toLowerCase();
                this.renderClassList();
            });
        }

        const formClass = document.getElementById("formClassEditor");
        if (formClass) {
            formClass.addEventListener("submit", (e) => {
                e.preventDefault();
                const classId = document.getElementById("classEdit_id").value.trim();
                const className = document.getElementById("classEdit_name").value.trim();
                if (!classId || !className) {
                    this.showToast("Class ID and Name are required.", "error");
                    return;
                }

                const heroObj = {
                    id: classId,
                    name: className,
                    icon: document.getElementById("classEdit_icon").value.trim() || "⚔️",
                    unlocked: document.getElementById("classEdit_unlocked").checked,
                    reqLevel: parseInt(document.getElementById("classEdit_reqLevel").value, 10) || 1,
                    baseHp: parseInt(document.getElementById("classEdit_hp").value, 10) || 100,
                    baseAttack: parseInt(document.getElementById("classEdit_atk").value, 10) || 10,
                    baseDefense: parseInt(document.getElementById("classEdit_def").value, 10) || 10,
                    baseDodge: parseFloat(document.getElementById("classEdit_dodge").value) || 0.05,
                    baseCritChance: parseFloat(document.getElementById("classEdit_crit").value) || 0.05,
                    baseLifesteal: parseFloat(document.getElementById("classEdit_lifesteal").value) || 0,
                    skill: {
                        id: (classId + "_skill"),
                        name: document.getElementById("classEdit_skillName").value.trim() || "Strike",
                        icon: document.getElementById("classEdit_skillIcon").value.trim() || "⚡",
                        cooldown: parseInt(document.getElementById("classEdit_skillCd").value, 10) || 8,
                        damageMult: parseFloat(document.getElementById("classEdit_skillMult").value) || 2.0,
                        description: document.getElementById("classEdit_skillDesc").value.trim() || "Attacks enemy."
                    }
                };
                api.data.saveHeroClass(heroObj);
                this.renderClassList();
                this.showToast(`Hero Class '${heroObj.name}' saved and synced!`, "success");
            });
        }

        const btnDeleteClass = document.getElementById("btnDeleteClass");
        if (btnDeleteClass) {
            btnDeleteClass.addEventListener("click", () => {
                const classId = document.getElementById("classEdit_id").value.trim();
                if (!classId || !window.HeroesData[classId]) {
                    this.showToast("Select a valid class to delete.", "error");
                    return;
                }
                const count = Object.keys(window.HeroesData).length;
                if (count <= 1) {
                    this.showToast("At least one hero class must remain in the game.", "error");
                    return;
                }
                if (confirm(`Permanently delete class '${window.HeroesData[classId].name}' (${classId})?`)) {
                    api.data.deleteHeroClass(classId);
                    this.renderClassList();
                    this.newClass();
                    this.showToast(`Deleted class ${classId}.`, "info");
                }
            });
        }

        const btnApplyClass = document.getElementById("btnApplyClassToPlayer");
        if (btnApplyClass) {
            btnApplyClass.addEventListener("click", () => {
                const classId = document.getElementById("classEdit_id").value.trim();
                if (classId && window.HeroesData[classId]) {
                    api.player.setHeroClass(classId);
                    this.showToast(`Player class set to '${window.HeroesData[classId].name}'!`, "success");
                }
            });
        }

        // ==================== ITEMS CRUD ====================
        const btnNewItem = document.getElementById("btnNewItem");
        if (btnNewItem) {
            btnNewItem.addEventListener("click", () => this.newItem());
        }

        const itemSearch = document.getElementById("itemSearchInput");
        if (itemSearch) {
            itemSearch.addEventListener("input", (e) => {
                this.itemSearchQuery = (e.target.value || "").trim().toLowerCase();
                this.renderItemList();
            });
        }

        const itemFilterSelect = document.getElementById("mgrItemFilter");
        if (itemFilterSelect) {
            itemFilterSelect.addEventListener("change", () => {
                this.itemFilter = itemFilterSelect.value;
                this.renderItemList();
            });
        }

        const formItem = document.getElementById("formItemEditor");
        if (formItem) {
            formItem.addEventListener("submit", (e) => {
                e.preventDefault();
                const itemId = document.getElementById("itemEdit_id").value.trim();
                const itemName = document.getElementById("itemEdit_name").value.trim();
                if (!itemId || !itemName) {
                    this.showToast("Item ID and Name are required.", "error");
                    return;
                }

                const itemObj = {
                    id: itemId,
                    name: itemName,
                    slot: document.getElementById("itemEdit_slot").value,
                    rarity: document.getElementById("itemEdit_rarity").value,
                    icon: document.getElementById("itemEdit_icon").value.trim() || "📦",
                    sellValue: parseInt(document.getElementById("itemEdit_sellValue").value, 10) || 10,
                    attackBonus: parseInt(document.getElementById("itemEdit_atk").value, 10) || 0,
                    defenseBonus: parseInt(document.getElementById("itemEdit_def").value, 10) || 0,
                    hpBonus: parseInt(document.getElementById("itemEdit_hp").value, 10) || 0,
                    dodgeBonus: parseFloat(document.getElementById("itemEdit_dodge").value) || 0,
                    critBonus: parseFloat(document.getElementById("itemEdit_crit").value) || 0,
                    lifestealBonus: parseFloat(document.getElementById("itemEdit_lifesteal").value) || 0,
                    description: document.getElementById("itemEdit_desc").value.trim()
                };
                api.data.saveItem(itemObj);
                this.renderItemList();
                this.showToast(`Item '${itemObj.name}' saved and synced!`, "success");
            });
        }

        const btnDeleteItem = document.getElementById("btnDeleteItem");
        if (btnDeleteItem) {
            btnDeleteItem.addEventListener("click", () => {
                const itemId = document.getElementById("itemEdit_id").value.trim();
                if (!itemId || !window.ItemsData[itemId]) {
                    this.showToast("Select a valid item to delete.", "error");
                    return;
                }
                if (confirm(`Permanently delete item '${window.ItemsData[itemId].name}' (${itemId})?`)) {
                    api.data.deleteItem(itemId);
                    this.renderItemList();
                    this.newItem();
                    this.showToast(`Deleted item ${itemId}.`, "info");
                }
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
                        this.showToast(`Granted 5x ${item.name} to player!`, "success");
                    } else if (item.slot === "material") {
                        window.gameState.player.materials[itemId] = (window.gameState.player.materials[itemId] || 0) + 10;
                        window.gameState.notify();
                        this.showToast(`Granted 10x ${item.name} to player!`, "success");
                    } else {
                        if (window.InventoryManager) {
                            window.InventoryManager.addItem(itemId);
                            this.showToast(`Granted 1x ${item.name} to backpack!`, "success");
                        }
                    }
                } else {
                    this.showToast("Save or select a valid item first.", "error");
                }
            });
        }

        // ==================== SHOP CRUD ====================
        const btnNewShop = document.getElementById("btnNewShopItem");
        if (btnNewShop) {
            btnNewShop.addEventListener("click", () => this.newShopItem());
        }

        const shopSearch = document.getElementById("shopSearchInput");
        if (shopSearch) {
            shopSearch.addEventListener("input", (e) => {
                this.shopSearchQuery = (e.target.value || "").trim().toLowerCase();
                this.renderShopList();
            });
        }

        const formShop = document.getElementById("formShopEditor");
        if (formShop) {
            formShop.addEventListener("submit", (e) => {
                e.preventDefault();
                const sId = document.getElementById("shopEdit_id").value.trim();
                const sName = document.getElementById("shopEdit_name").value.trim();
                if (!sId || !sName) {
                    this.showToast("Shop Item ID and Name are required.", "error");
                    return;
                }

                const shopObj = {
                    id: sId,
                    name: sName,
                    category: document.getElementById("shopEdit_category").value,
                    icon: document.getElementById("shopEdit_icon").value.trim() || "🛍️",
                    itemId: document.getElementById("shopEdit_itemId").value.trim(),
                    costGold: parseInt(document.getElementById("shopEdit_costGold").value, 10) || 100,
                    reqLevel: parseInt(document.getElementById("shopEdit_reqLevel").value, 10) || 1,
                    matKey: document.getElementById("shopEdit_itemId").value.trim(),
                    matQty: parseInt(document.getElementById("shopEdit_matQty").value, 10) || 1,
                    description: document.getElementById("shopEdit_desc").value.trim()
                };
                api.data.saveShopItem(shopObj);
                this.renderShopList();
                this.showToast(`Shop item '${shopObj.name}' saved and synced!`, "success");
            });
        }

        const btnDeleteShop = document.getElementById("btnDeleteShopItem");
        if (btnDeleteShop) {
            btnDeleteShop.addEventListener("click", () => {
                const sId = document.getElementById("shopEdit_id").value.trim();
                if (sId) {
                    api.data.deleteShopItem(sId);
                    this.renderShopList();
                    this.newShopItem();
                    this.showToast(`Removed item from shop.`, "info");
                }
            });
        }

        // ==================== MAPS CRUD ====================
        const btnNewMap = document.getElementById("btnNewMap");
        if (btnNewMap) {
            btnNewMap.addEventListener("click", () => this.newMap());
        }

        const formMap = document.getElementById("formMapEditor");
        if (formMap) {
            formMap.addEventListener("submit", (e) => {
                e.preventDefault();
                const mapId = document.getElementById("mapEdit_id").value.trim();
                const mapName = document.getElementById("mapEdit_name").value.trim();
                if (!mapId || !mapName) {
                    this.showToast("Map ID and Name are required.", "error");
                    return;
                }

                const existing = (window.MapsData && window.MapsData[mapId]) || {};
                const bossVal = document.getElementById("mapEdit_bossId").value.trim();
                const mobsRaw = document.getElementById("mapEdit_mobs").value.trim();
                const mobsArr = mobsRaw ? mobsRaw.split(",").map(s => s.trim()).filter(Boolean) : (existing.mobs || ["goblin"]);

                const mapObj = {
                    ...existing,
                    id: mapId,
                    name: mapName,
                    realmIndex: parseInt(document.getElementById("mapEdit_realmIndex").value, 10) || 1,
                    roman: document.getElementById("mapEdit_roman").value.trim() || "I",
                    bgGradient: document.getElementById("mapEdit_bgGradient").value.trim(),
                    bossId: bossVal || undefined,
                    mobs: mobsArr,
                    defaultWeather: existing.defaultWeather || "clear"
                };
                api.data.saveMap(mapObj);
                this.populateDropdowns();
                this.renderMapList();
                this.showToast(`Map '${mapObj.name}' saved and synced!`, "success");
            });
        }

        const btnDeleteMap = document.getElementById("btnDeleteMap");
        if (btnDeleteMap) {
            btnDeleteMap.addEventListener("click", () => {
                const mapId = document.getElementById("mapEdit_id").value.trim();
                if (!mapId || !window.MapsData[mapId]) {
                    this.showToast("Select a valid map to delete.", "error");
                    return;
                }
                if (confirm(`Permanently delete map '${window.MapsData[mapId].name}' (${mapId})?`)) {
                    api.data.deleteMap(mapId);
                    this.populateDropdowns();
                    this.renderMapList();
                    this.newMap();
                    this.showToast(`Deleted map ${mapId}.`, "info");
                }
            });
        }

        const btnTravelEdited = document.getElementById("btnTravelEditedMap");
        if (btnTravelEdited) {
            btnTravelEdited.addEventListener("click", () => {
                const mapId = document.getElementById("mapEdit_id").value.trim();
                if (mapId) {
                    api.world.setMap(mapId);
                    this.showToast(`Traveled to '${mapId}'!`, "info");
                }
            });
        }

        // ==================== WEATHER ====================
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
                    this.showToast(`Weather '${w.name}' updated!`, "success");
                }
            });
        }

        const btnApplyWeather = document.getElementById("btnApplyEditedWeather");
        if (btnApplyWeather) {
            btnApplyWeather.addEventListener("click", () => {
                const wId = document.getElementById("weatherEdit_id").value;
                if (wId) {
                    api.world.setWeather(wId);
                    this.showToast(`Environmental weather changed to '${wId}'!`, "info");
                }
            });
        }

        // ==================== SCENARIOS & EVENTS ====================
        document.querySelectorAll("[data-mgr-scenario]").forEach(btn => {
            btn.addEventListener("click", () => {
                const scId = btn.dataset.mgrScenario;
                if (scId === "stop") {
                    api.scenarios.stop();
                    this.showToast("Stopped active scenario.", "info");
                } else {
                    api.scenarios.run(scId);
                    this.showToast(`Launched scenario: ${scId}!`, "success");
                }
            });
        });

        // ==================== JSON IMPORT/EXPORT ====================
        const btnRefreshJson = document.getElementById("btnMgrRefreshJson");
        if (btnRefreshJson) btnRefreshJson.addEventListener("click", () => this.refreshJson());

        const btnImportJson = document.getElementById("btnMgrImportJson");
        if (btnImportJson) {
            btnImportJson.addEventListener("click", () => {
                const json = document.getElementById("txtJsonConfig").value;
                const ok = api.data.importAllJSON(json);
                if (ok) {
                    this.renderLists();
                    this.showToast("JSON configuration imported successfully!", "success");
                } else {
                    this.showToast("Invalid JSON syntax or schema.", "error");
                }
            });
        }
    },

    /* =========================================================
       VISUAL DROP TABLE BUILDER
    ========================================================= */
    renderDropTableRows(drops = null) {
        if (drops !== null) this.currentMobDrops = [...drops];
        const container = document.getElementById("mobDropRowsContainer");
        if (!container) return;

        container.innerHTML = "";

        if (this.currentMobDrops.length === 0) {
            container.innerHTML = `<div class="drop-empty-msg">No drops configured. Click "➕ Add Drop" to attach items or materials!</div>`;
            return;
        }

        const materialKeys = ["ironOre", "wood", "crystal", "dragonScale", "shadowEssence"];
        const consumableKeys = ["potion_minor", "potion_major", "potion_full", "elixir_fury", "elixir_iron"];
        const itemKeys = Object.keys(window.ItemsData || {});

        this.currentMobDrops.forEach((drop, index) => {
            const row = document.createElement("div");
            row.className = "drop-row";

            const dropType = drop.type || "item";
            const targetId = drop.id || drop.key || (dropType === "material" ? "ironOre" : dropType === "consumable" ? "potion_minor" : "iron_sword");
            const chance = (drop.chance !== undefined) ? drop.chance : 0.25;
            const minQty = drop.min || 1;
            const maxQty = drop.max || 1;

            // Generate target options
            let targetOptions = "";
            if (dropType === "material") {
                targetOptions = materialKeys.map(k => `<option value="${k}" ${k === targetId ? 'selected' : ''}>⛏️ ${k}</option>`).join("");
            } else if (dropType === "consumable") {
                targetOptions = consumableKeys.map(k => `<option value="${k}" ${k === targetId ? 'selected' : ''}>🧪 ${k}</option>`).join("");
            } else {
                targetOptions = itemKeys.map(k => {
                    const it = window.ItemsData[k];
                    return `<option value="${k}" ${k === targetId ? 'selected' : ''}>${it ? it.icon : '🗡️'} ${it ? it.name : k}</option>`;
                }).join("");
            }

            row.innerHTML = `
                <select class="drop-col-type">
                    <option value="item" ${dropType === 'item' ? 'selected' : ''}>Equipment</option>
                    <option value="material" ${dropType === 'material' ? 'selected' : ''}>Material</option>
                    <option value="consumable" ${dropType === 'consumable' ? 'selected' : ''}>Consumable</option>
                </select>
                <select class="drop-col-target">
                    ${targetOptions}
                </select>
                <input type="number" step="0.05" min="0.01" max="1.0" class="drop-col-chance" value="${chance}" title="Drop Chance (0.01 - 1.0)">
                <input type="number" min="1" class="drop-col-qty qty-min" value="${minQty}" title="Min Qty">
                <input type="number" min="1" class="drop-col-qty qty-max" value="${maxQty}" title="Max Qty">
                <button type="button" class="btn-remove-drop" title="Remove Drop">✕</button>
            `;

            // Change Type updates Target options
            const typeSelect = row.querySelector(".drop-col-type");
            typeSelect.addEventListener("change", (e) => {
                this.currentMobDrops[index].type = e.target.value;
                if (e.target.value === "material") {
                    this.currentMobDrops[index].key = "ironOre";
                    delete this.currentMobDrops[index].id;
                } else if (e.target.value === "consumable") {
                    this.currentMobDrops[index].id = "potion_minor";
                    delete this.currentMobDrops[index].key;
                } else {
                    this.currentMobDrops[index].id = itemKeys[0] || "iron_sword";
                    delete this.currentMobDrops[index].key;
                }
                this.renderDropTableRows();
            });

            // Target Select
            const targetSelect = row.querySelector(".drop-col-target");
            targetSelect.addEventListener("change", (e) => {
                if (this.currentMobDrops[index].type === "material") {
                    this.currentMobDrops[index].key = e.target.value;
                } else {
                    this.currentMobDrops[index].id = e.target.value;
                }
            });

            // Chance input
            const chanceInput = row.querySelector(".drop-col-chance");
            chanceInput.addEventListener("change", (e) => {
                this.currentMobDrops[index].chance = parseFloat(e.target.value) || 0.25;
            });

            // Min / Max inputs
            const minInput = row.querySelector(".qty-min");
            minInput.addEventListener("change", (e) => {
                this.currentMobDrops[index].min = parseInt(e.target.value, 10) || 1;
            });

            const maxInput = row.querySelector(".qty-max");
            maxInput.addEventListener("change", (e) => {
                this.currentMobDrops[index].max = parseInt(e.target.value, 10) || 1;
            });

            // Remove button
            row.querySelector(".btn-remove-drop").addEventListener("click", () => {
                this.currentMobDrops.splice(index, 1);
                this.renderDropTableRows();
            });

            container.appendChild(row);
        });
    },

    addDropRow(drop) {
        this.currentMobDrops.push({ ...drop });
        this.renderDropTableRows();
    },

    collectDropTable() {
        return this.currentMobDrops.map(d => {
            const out = {
                type: d.type || "item",
                chance: (d.chance !== undefined) ? d.chance : 0.25,
                min: d.min || 1,
                max: d.max || 1
            };
            if (out.type === "material") {
                out.key = d.key || d.id || "ironOre";
            } else {
                out.id = d.id || d.key || "iron_sword";
            }
            return out;
        });
    },

    /* =========================================================
       FORM CLEARERS / CREATE TEMPLATES
    ========================================================= */
    newMob() {
        const randId = `mob_${Date.now().toString().slice(-4)}`;
        document.getElementById("mobEdit_id").value = randId;
        document.getElementById("mobEdit_name").value = "New Monster";
        document.getElementById("mobEdit_icon").value = "👹";
        document.getElementById("mobEdit_type").value = "WILD BEAST";
        document.getElementById("mobEdit_hp").value = 250;
        document.getElementById("mobEdit_dmg").value = 20;
        document.getElementById("mobEdit_gold").value = 40;
        document.getElementById("mobEdit_xp").value = 25;
        document.getElementById("mobEdit_dropChance").value = 0.5;
        document.getElementById("mobEdit_isBoss").checked = false;
        document.getElementById("mobEdit_isUniversal").checked = true;
        document.getElementById("mobEdit_assignedMap").value = "all";
        const title = document.getElementById("mobFormTitle");
        if (title) title.textContent = "CREATE NEW MOB";
        this.renderDropTableRows([
            { type: "material", key: "ironOre", chance: 0.5, min: 1, max: 2 },
            { type: "consumable", id: "potion_minor", chance: 0.3 }
        ]);
        this.showToast("Ready to configure new mob.", "info");
    },

    newClass() {
        const randId = `class_${Date.now().toString().slice(-4)}`;
        document.getElementById("classEdit_id").value = randId;
        document.getElementById("classEdit_name").value = "New Hero Class";
        document.getElementById("classEdit_icon").value = "🛡️";
        document.getElementById("classEdit_unlocked").checked = true;
        document.getElementById("classEdit_reqLevel").value = 1;
        document.getElementById("classEdit_hp").value = 120;
        document.getElementById("classEdit_atk").value = 14;
        document.getElementById("classEdit_def").value = 12;
        document.getElementById("classEdit_dodge").value = 0.05;
        document.getElementById("classEdit_crit").value = 0.08;
        document.getElementById("classEdit_lifesteal").value = 0;
        document.getElementById("classEdit_skillName").value = "Heroic Cleave";
        document.getElementById("classEdit_skillIcon").value = "⚡";
        document.getElementById("classEdit_skillCd").value = 8;
        document.getElementById("classEdit_skillMult").value = 2.2;
        document.getElementById("classEdit_skillDesc").value = "Delivers a devastating strike.";
        const title = document.getElementById("classFormTitle");
        if (title) title.textContent = "CREATE NEW CLASS";
        this.showToast("Ready to configure new hero class.", "info");
    },

    newItem() {
        const randId = `item_${Date.now().toString().slice(-4)}`;
        document.getElementById("itemEdit_id").value = randId;
        document.getElementById("itemEdit_name").value = "New Relic Blade";
        document.getElementById("itemEdit_slot").value = "weapon";
        document.getElementById("itemEdit_rarity").value = "rare";
        document.getElementById("itemEdit_icon").value = "🗡️";
        document.getElementById("itemEdit_sellValue").value = 150;
        document.getElementById("itemEdit_atk").value = 35;
        document.getElementById("itemEdit_def").value = 0;
        document.getElementById("itemEdit_hp").value = 20;
        document.getElementById("itemEdit_dodge").value = 0.02;
        document.getElementById("itemEdit_crit").value = 0.10;
        document.getElementById("itemEdit_lifesteal").value = 0.03;
        document.getElementById("itemEdit_desc").value = "A mastercrafted weapon found deep within the forgotten catacombs.";
        const title = document.getElementById("itemFormTitle");
        if (title) title.textContent = "CREATE NEW ITEM";
        this.showToast("Ready to configure new item.", "info");
    },

    newShopItem() {
        const randId = `shop_${Date.now().toString().slice(-4)}`;
        document.getElementById("shopEdit_id").value = randId;
        document.getElementById("shopEdit_name").value = "Major Rejuvenation Draught";
        document.getElementById("shopEdit_category").value = "consumable";
        document.getElementById("shopEdit_icon").value = "🧪";
        document.getElementById("shopEdit_itemId").value = "potion_major";
        document.getElementById("shopEdit_costGold").value = 250;
        document.getElementById("shopEdit_reqLevel").value = 1;
        document.getElementById("shopEdit_matQty").value = 1;
        document.getElementById("shopEdit_desc").value = "Restores 150 HP instantly.";
        const title = document.getElementById("shopFormTitle");
        if (title) title.textContent = "CREATE NEW SHOP ITEM";
        this.showToast("Ready to list new shop offering.", "info");
    },

    newMap() {
        const randId = `map_${Date.now().toString().slice(-4)}`;
        document.getElementById("mapEdit_id").value = randId;
        document.getElementById("mapEdit_name").value = "New Province Realm";
        document.getElementById("mapEdit_realmIndex").value = (Object.keys(window.MapsData || {}).length + 1);
        document.getElementById("mapEdit_roman").value = "VI";
        document.getElementById("mapEdit_bgGradient").value = "radial-gradient(circle at 50% 42%, #2d184a 0%, #0d0614 100%)";
        document.getElementById("mapEdit_bossId").value = "";
        document.getElementById("mapEdit_mobs").value = "goblin, wolf";
        const title = document.getElementById("mapFormTitle");
        if (title) title.textContent = "CREATE NEW REALM MAP";
        this.showToast("Ready to design new realm map.", "info");
    },

    /* =========================================================
       LIST RENDERING
    ========================================================= */
    renderLists() {
        this.renderClassList();
        this.renderMobList();
        this.renderItemList();
        this.renderShopList();
        this.renderMapList();
        this.renderWeatherList();
    },

    renderClassList() {
        const classListEl = document.getElementById("mgrClassList");
        if (!classListEl || !window.HeroesData) return;
        classListEl.innerHTML = "";

        const q = this.classSearchQuery;
        Object.values(window.HeroesData).forEach(h => {
            if (q && !h.name.toLowerCase().includes(q) && !h.id.toLowerCase().includes(q)) return;

            const item = document.createElement("div");
            item.className = "mgr-list-item";
            const lockBadge = (h.unlocked !== false) ? `<span class="mgr-badge badge-uncommon">Available</span>` : `<span class="mgr-badge badge-legendary">Locked</span>`;
            item.innerHTML = `<span>${h.icon} <strong>${h.name}</strong> (Lv.${h.reqLevel || 1})</span> <div>${lockBadge} <small style="margin-left:6px; color:#edc76f;">${h.skill ? h.skill.name : 'No Skill'}</small></div>`;
            item.addEventListener("click", () => {
                const title = document.getElementById("classFormTitle");
                if (title) title.textContent = `EDIT CLASS: ${h.name.toUpperCase()}`;
                document.getElementById("classEdit_id").value = h.id;
                document.getElementById("classEdit_name").value = h.name;
                document.getElementById("classEdit_icon").value = h.icon;
                document.getElementById("classEdit_unlocked").checked = (h.unlocked !== false);
                document.getElementById("classEdit_reqLevel").value = h.reqLevel || 1;
                document.getElementById("classEdit_hp").value = h.baseHp || h.hp || 100;
                document.getElementById("classEdit_atk").value = h.baseAttack || h.atk || 10;
                document.getElementById("classEdit_def").value = h.baseDefense || h.def || 10;
                document.getElementById("classEdit_dodge").value = h.baseDodge || h.dodge || 0.05;
                document.getElementById("classEdit_crit").value = h.baseCritChance || h.critChance || 0.05;
                document.getElementById("classEdit_lifesteal").value = h.baseLifesteal || h.lifesteal || 0;
                if (h.skill) {
                    document.getElementById("classEdit_skillName").value = h.skill.name || "";
                    document.getElementById("classEdit_skillIcon").value = h.skill.icon || "";
                    document.getElementById("classEdit_skillCd").value = h.skill.cooldown || 8;
                    document.getElementById("classEdit_skillMult").value = h.skill.damageMult || h.skill.dmgMultiplier || 2.0;
                    document.getElementById("classEdit_skillDesc").value = h.skill.description || h.skill.desc || "";
                }
            });
            classListEl.appendChild(item);
        });
    },

    renderMobList() {
        const mobListEl = document.getElementById("mgrMobList");
        if (!mobListEl || !window.MobsData) return;
        mobListEl.innerHTML = "";

        const q = this.mobSearchQuery;
        Object.values(window.MobsData).forEach(m => {
            if (q && !m.name.toLowerCase().includes(q) && !m.id.toLowerCase().includes(q) && !m.type.toLowerCase().includes(q)) return;

            const item = document.createElement("div");
            item.className = "mgr-list-item";
            const dropCount = m.dropTable ? m.dropTable.length : 0;
            const dropRateText = m.dropChance ? `${Math.round(m.dropChance * 100)}% Drop (${dropCount} items)` : 'No Drops';
            item.innerHTML = `<span>${m.icon} <strong>${m.name}</strong></span> <small>HP: ${m.baseHp} | Dmg: ${m.baseDmg} | <span style="color:#edc76f;">${dropRateText}</span></small>`;
            item.addEventListener("click", () => {
                const title = document.getElementById("mobFormTitle");
                if (title) title.textContent = `EDIT MOB: ${m.name.toUpperCase()}`;
                document.getElementById("mobEdit_id").value = m.id;
                document.getElementById("mobEdit_name").value = m.name;
                document.getElementById("mobEdit_icon").value = m.icon;
                document.getElementById("mobEdit_type").value = m.type;
                document.getElementById("mobEdit_hp").value = m.baseHp;
                document.getElementById("mobEdit_dmg").value = m.baseDmg;
                document.getElementById("mobEdit_gold").value = m.goldReward;
                document.getElementById("mobEdit_xp").value = m.xpReward;
                document.getElementById("mobEdit_dropChance").value = (m.dropChance !== undefined) ? m.dropChance : 0.45;
                document.getElementById("mobEdit_isBoss").checked = !!m.isBoss;
                document.getElementById("mobEdit_isUniversal").checked = (m.isUniversal !== false);
                document.getElementById("mobEdit_assignedMap").value = m.assignedMap || (m.isUniversal !== false ? "all" : "");
                this.renderDropTableRows(m.dropTable || []);
            });
            mobListEl.appendChild(item);
        });
    },

    renderItemList() {
        const itemListEl = document.getElementById("mgrItemList");
        if (!itemListEl || !window.ItemsData) return;
        itemListEl.innerHTML = "";

        const q = this.itemSearchQuery;
        const filter = this.itemFilter;

        Object.values(window.ItemsData).forEach(it => {
            if (filter !== "all" && it.slot !== filter) return;
            if (q && !it.name.toLowerCase().includes(q) && !it.id.toLowerCase().includes(q)) return;

            const item = document.createElement("div");
            item.className = "mgr-list-item";
            const rarityBadge = `<span class="mgr-badge badge-${it.rarity || 'common'}">${it.rarity || 'common'}</span>`;
            let statText = "";
            if (it.attackBonus || it.atk) statText += `+${it.attackBonus || it.atk} Atk `;
            if (it.defenseBonus || it.def) statText += `+${it.defenseBonus || it.def} Def `;
            if (it.hpBonus || it.hp) statText += `+${it.hpBonus || it.hp} HP `;
            if (it.critBonus || it.critChance) statText += `+${Math.round((it.critBonus || it.critChance) * 100)}% Crit `;
            if (!statText && it.description) statText = it.description;

            item.innerHTML = `<span>${it.icon} <strong>${it.name}</strong> ${rarityBadge}</span> <small style="color:#85899f;">${statText}</small>`;
            item.addEventListener("click", () => {
                const title = document.getElementById("itemFormTitle");
                if (title) title.textContent = `EDIT ITEM: ${it.name.toUpperCase()}`;
                document.getElementById("itemEdit_id").value = it.id;
                document.getElementById("itemEdit_name").value = it.name;
                document.getElementById("itemEdit_slot").value = it.slot || "weapon";
                document.getElementById("itemEdit_rarity").value = it.rarity || "common";
                document.getElementById("itemEdit_icon").value = it.icon;
                document.getElementById("itemEdit_sellValue").value = it.sellValue || 20;
                document.getElementById("itemEdit_atk").value = it.attackBonus || it.atk || 0;
                document.getElementById("itemEdit_def").value = it.defenseBonus || it.def || 0;
                document.getElementById("itemEdit_hp").value = it.hpBonus || it.hp || 0;
                document.getElementById("itemEdit_dodge").value = it.dodgeBonus || it.dodge || 0;
                document.getElementById("itemEdit_crit").value = it.critBonus || it.critChance || 0;
                document.getElementById("itemEdit_lifesteal").value = it.lifestealBonus || it.lifesteal || 0;
                document.getElementById("itemEdit_desc").value = it.description || it.desc || "";
            });
            itemListEl.appendChild(item);
        });
    },

    renderShopList() {
        const shopListEl = document.getElementById("mgrShopList");
        if (!shopListEl || !window.ShopData) return;
        shopListEl.innerHTML = "";

        const q = this.shopSearchQuery;
        window.ShopData.forEach(s => {
            if (q && !s.name.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q) && !s.category.toLowerCase().includes(q)) return;

            const item = document.createElement("div");
            item.className = "mgr-list-item";
            item.innerHTML = `<span>${s.icon} <strong>${s.name}</strong> <small style="color:#85899f;">[${s.category}]</small></span> <small style="color:#edc76f;">✦ ${s.costGold}g · Lv.${s.reqLevel || 1}</small>`;
            item.addEventListener("click", () => {
                const title = document.getElementById("shopFormTitle");
                if (title) title.textContent = `EDIT LISTING: ${s.name.toUpperCase()}`;
                document.getElementById("shopEdit_id").value = s.id;
                document.getElementById("shopEdit_name").value = s.name;
                document.getElementById("shopEdit_category").value = s.category;
                document.getElementById("shopEdit_icon").value = s.icon;
                document.getElementById("shopEdit_itemId").value = s.itemId || s.matKey || "";
                document.getElementById("shopEdit_costGold").value = s.costGold;
                document.getElementById("shopEdit_reqLevel").value = s.reqLevel || 1;
                document.getElementById("shopEdit_matQty").value = s.matQty || 1;
                document.getElementById("shopEdit_desc").value = s.description || s.desc || "";
            });
            shopListEl.appendChild(item);
        });
    },

    renderMapList() {
        const mapListEl = document.getElementById("mgrMapList");
        if (!mapListEl || !window.MapsData) return;
        mapListEl.innerHTML = "";
        Object.values(window.MapsData).forEach(m => {
            const item = document.createElement("div");
            item.className = "mgr-list-item";
            item.innerHTML = `<span>🗺️ <strong>${m.name}</strong> [Realm ${m.roman}]</span>`;
            item.addEventListener("click", () => {
                const title = document.getElementById("mapFormTitle");
                if (title) title.textContent = `EDIT MAP: ${m.name.toUpperCase()}`;
                document.getElementById("mapEdit_id").value = m.id;
                document.getElementById("mapEdit_name").value = m.name;
                document.getElementById("mapEdit_realmIndex").value = m.realmIndex;
                document.getElementById("mapEdit_roman").value = m.roman;
                document.getElementById("mapEdit_bgGradient").value = m.bgGradient;
                document.getElementById("mapEdit_bossId").value = m.bossId || "";
                document.getElementById("mapEdit_mobs").value = Array.isArray(m.mobs) ? m.mobs.join(", ") : "";
            });
            mapListEl.appendChild(item);
        });
    },

    populateDropdowns() {
        // Assigned Map dropdown in mob editor
        const mapSelect = document.getElementById("mobEdit_assignedMap");
        if (mapSelect && window.MapsData) {
            const curVal = mapSelect.value;
            mapSelect.innerHTML = `<option value="all">All Realms (Universal)</option>`;
            Object.values(window.MapsData).forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.id;
                opt.textContent = `${m.name} [Realm ${m.roman || m.realmIndex}]`;
                mapSelect.appendChild(opt);
            });
            if (curVal) mapSelect.value = curVal;
        }

        // Boss ID dropdown in map editor
        const bossSelect = document.getElementById("mapEdit_bossId");
        if (bossSelect && window.MobsData) {
            const curVal = bossSelect.value;
            bossSelect.innerHTML = `<option value="">-- None / Default --</option>`;
            Object.values(window.MobsData).forEach(mob => {
                const opt = document.createElement("option");
                opt.value = mob.id;
                const bossTag = mob.isBoss ? " 👑" : "";
                opt.textContent = `${mob.icon || '👹'} ${mob.name} (${mob.id})${bossTag}`;
                bossSelect.appendChild(opt);
            });
            if (curVal) bossSelect.value = curVal;
        }
    },

    loadGameRulesForm() {
        const rules = (window.GameAPI && window.GameAPI.settings) ? window.GameAPI.settings.loadRules() : null;
        if (rules) {
            if (rules.guildIncome) {
                const chk = document.getElementById("cfg_guildIncomeEnabled");
                if (chk) chk.checked = (rules.guildIncome.enabled !== false);
                const rate = document.getElementById("cfg_guildIncomeRate");
                if (rate) rate.value = rules.guildIncome.goldPerSecond !== undefined ? rules.guildIncome.goldPerSecond : 3;
            }
            if (rules.templeDonation) {
                const chk = document.getElementById("cfg_templeDonationEnabled");
                if (chk) chk.checked = (rules.templeDonation.enabled !== false);
                const cost = document.getElementById("cfg_templeDonationCost");
                if (cost) cost.value = rules.templeDonation.cost !== undefined ? rules.templeDonation.cost : 50;
            }
        }
    },

    renderWeatherList() {
        const weatherListEl = document.getElementById("mgrWeatherList");
        if (!weatherListEl || !window.WeatherData) return;
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
