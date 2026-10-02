/* =========================================================
   REALM IDLE MANAGER - ADVANCED CRUD DASHBOARD CONTROLLER
========================================================= */

window.ManagerApp = {
    mobSearchQuery: "",
    itemSearchQuery: "",
    itemFilter: "all",
    classSearchQuery: "",
    shopSearchQuery: "",
    alchemySearchQuery: "",
    activeLogFilter: "all",
    logSearchQuery: "",
    currentMobDrops: [],
    currentClassPassives: [],

    init() {
        this.bindTabs();
        this.bindEvents();
        this.bindMobileNav();
        this.populateDropdowns();
        this.loadGameRulesForm();
        this.renderDashboard();
        this.renderLogs();
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
                    logs: "Player Adventure & Combat Logs Inspector",
                    classes: "Hero Classes & Combat Skills Configuration",
                    mobs: "Mob & AI Definitions & Drop Rates Editor",
                    items: "Items, Equipment Rarity & Drop Rates Catalog",
                    alchemy: "Alchemical Laboratory & Potion Brewing Editor",
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
                if (target === "logs") this.renderLogs();
                if (target === "alchemy") this.renderAlchemyList();
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

        const btnGmUnlock = document.getElementById("btnGmUnlockKingdom");
        if (btnGmUnlock) {
            btnGmUnlock.addEventListener("click", () => {
                if (api.player && api.player.setKingdomUnlocked) {
                    api.player.setKingdomUnlocked(true);
                    this.showToast("Granted Sovereign Domain! Moonlit Vale III boss cleared & Lv 5 unlocked.", "success");
                }
            });
        }

        const btnGmLock = document.getElementById("btnGmLockKingdom");
        if (btnGmLock) {
            btnGmLock.addEventListener("click", () => {
                if (api.player && api.player.setKingdomUnlocked) {
                    api.player.setKingdomUnlocked(false);
                    this.showToast("Relocked Kingdom Domain pending royal decree.", "info");
                }
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
                    },
                    promotions: [
                        {
                            rank: 2,
                            reqLevel: 10,
                            title: document.getElementById("classEdit_r2_title")?.value?.trim() || "Veteran",
                            goldCost: parseInt(document.getElementById("classEdit_r2_gold")?.value, 10) || 500,
                            materials: (() => {
                                const res = {};
                                const raw = document.getElementById("classEdit_r2_mats")?.value || "";
                                raw.split(",").forEach(p => {
                                    const [k, v] = p.split(":").map(s => s && s.trim());
                                    if (k && v !== undefined) res[k] = parseInt(v, 10) || 1;
                                });
                                return res;
                            })(),
                            bonusStats: (() => {
                                const res = {};
                                const raw = document.getElementById("classEdit_r2_stats")?.value || "";
                                raw.split(",").forEach(p => {
                                    const [k, v] = p.split(":").map(s => s && s.trim());
                                    if (k && v !== undefined) res[k] = parseFloat(v) || 0;
                                });
                                return res;
                            })(),
                            description: "Attained Rank 2 veteran mastery at Level 10."
                        },
                        {
                            rank: 3,
                            reqLevel: 20,
                            title: document.getElementById("classEdit_r3_title")?.value?.trim() || "Master",
                            goldCost: parseInt(document.getElementById("classEdit_r3_gold")?.value, 10) || 2500,
                            materials: (() => {
                                const res = {};
                                const raw = document.getElementById("classEdit_r3_mats")?.value || "";
                                raw.split(",").forEach(p => {
                                    const [k, v] = p.split(":").map(s => s && s.trim());
                                    if (k && v !== undefined) res[k] = parseInt(v, 10) || 1;
                                });
                                return res;
                            })(),
                            bonusStats: (() => {
                                const res = {};
                                const raw = document.getElementById("classEdit_r3_stats")?.value || "";
                                raw.split(",").forEach(p => {
                                    const [k, v] = p.split(":").map(s => s && s.trim());
                                    if (k && v !== undefined) res[k] = parseFloat(v) || 0;
                                });
                                return res;
                            })(),
                            description: "Ascended to Rank 3 master prestige at Level 20."
                        }
                    ],
                    passives: this.currentClassPassives || []
                };
                api.data.saveHeroClass(heroObj);
                this.renderClassList();
                this.showToast(`Hero Class '${heroObj.name}' saved and synced!`, "success");
            });
        }

        const btnAddPass = document.getElementById("btnClassAddPassive");
        if (btnAddPass) {
            btnAddPass.addEventListener("click", () => {
                const reqLv = parseInt(prompt("Required Hero Level for new divine blessing (e.g. 1, 5, 10, 15, 20):", "5"), 10);
                if (isNaN(reqLv)) return;
                const name = prompt("Blessing / Passive Skill Name:", "Blessing of the High Heavens");
                if (!name) return;
                const lore = prompt("Divine Lore Text (Must include 'You have been blessed by the gods:'):", "You have been blessed by the gods: The heavens infuse your spirit with divine grace.");
                if (!lore) return;
                const bonusRaw = prompt("Stat Bonuses (e.g. attack:20, maxHp:50, defense:10):", "attack:15, maxHp:40");
                const bonus = {};
                if (bonusRaw) {
                    bonusRaw.split(",").forEach(part => {
                        const [k, v] = part.split(":").map(s => s && s.trim());
                        if (k && v !== undefined) bonus[k] = parseFloat(v) || 0;
                    });
                }

                if (!this.currentClassPassives) this.currentClassPassives = [];
                this.currentClassPassives.push({
                    id: `p_${Date.now().toString().slice(-4)}`,
                    reqLevel: reqLv,
                    name: name,
                    icon: "✨",
                    lore: lore,
                    bonus: bonus,
                    description: bonusRaw
                });
                this.currentClassPassives.sort((a, b) => a.reqLevel - b.reqLevel);
                this.renderClassPassivesList();
                this.showToast(`Added divine passive '${name}'! Remember to click 'Save Class'.`, "success");
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

        const btnResetShop = document.getElementById("btnResetShopData");
        if (btnResetShop) {
            btnResetShop.addEventListener("click", () => {
                if (confirm("Reset merchant shop catalog to the official 19-item SAO progression defaults? This clears custom listings.")) {
                    if (api.data && api.data.resetShopData) {
                        api.data.resetShopData();
                    }
                    // Refresh from window.ShopData or reload
                    window.location.reload();
                }
            });
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

                const reqMapVal = document.getElementById("shopEdit_reqMap") ? document.getElementById("shopEdit_reqMap").value : "any";
                const reqDepthVal = document.getElementById("shopEdit_reqDepth") ? (parseInt(document.getElementById("shopEdit_reqDepth").value, 10) || 1) : 1;

                const shopObj = {
                    id: sId,
                    name: sName,
                    category: document.getElementById("shopEdit_category").value,
                    icon: document.getElementById("shopEdit_icon").value.trim() || "🛍️",
                    itemId: document.getElementById("shopEdit_itemId").value.trim(),
                    costGold: parseInt(document.getElementById("shopEdit_costGold").value, 10) || 100,
                    reqLevel: parseInt(document.getElementById("shopEdit_reqLevel").value, 10) || 1,
                    reqMap: reqMapVal,
                    reqDepth: reqDepthVal,
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

                const maxDepthVal = parseInt(document.getElementById("mapEdit_maxDepth")?.value, 10) || 3;
                const subsRaw = (document.getElementById("mapEdit_depthSubtitles")?.value || "").split("|").map(s => s.trim()).filter(Boolean);
                const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
                const depthTiers = [];
                for (let i = 1; i <= maxDepthVal; i++) {
                    const idx = i - 1;
                    const subtitle = subsRaw[idx] || (i === 1 ? "Fringe" : (i === 2 ? "Depths" : "Inner Core"));
                    const statMult = 1 + (i - 1) * 0.45;
                    const goldMult = 1 + (i - 1) * 0.50;
                    const xpMult = 1 + (i - 1) * 0.50;
                    depthTiers.push({
                        depth: i,
                        roman: romans[idx] || `${i}`,
                        subtitle,
                        statMult: parseFloat(statMult.toFixed(2)),
                        goldMult: parseFloat(goldMult.toFixed(2)),
                        xpMult: parseFloat(xpMult.toFixed(2))
                    });
                }

                const mapObj = {
                    ...existing,
                    id: mapId,
                    name: mapName,
                    realmIndex: parseInt(document.getElementById("mapEdit_realmIndex").value, 10) || 1,
                    roman: document.getElementById("mapEdit_roman").value.trim() || "I",
                    bgGradient: document.getElementById("mapEdit_bgGradient").value.trim(),
                    bossId: bossVal || undefined,
                    mobs: mobsArr,
                    defaultWeather: existing.defaultWeather || "clear",
                    maxDepth: maxDepthVal,
                    depthTiers: depthTiers
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

        document.querySelectorAll("[data-mgr-event]").forEach(btn => {
            btn.addEventListener("click", () => {
                const evId = btn.dataset.mgrEvent;
                if (evId === "stop") {
                    api.events.stop();
                    this.showToast("Stopped active world event.", "info");
                } else {
                    api.events.start(evId);
                    this.showToast(`Triggered world event: ${evId}!`, "success");
                }
            });
        });

        const formScen = document.getElementById("formScenarioDesigner");
        if (formScen) {
            formScen.addEventListener("submit", (e) => {
                e.preventDefault();
                const scId = document.getElementById("scenEdit_id").value.trim();
                const scName = document.getElementById("scenEdit_name").value.trim();
                if (!scId || !scName) {
                    this.showToast("Scenario ID and Name required.", "error");
                    return;
                }
                const scObj = {
                    id: scId,
                    name: scName,
                    duration: parseInt(document.getElementById("scenEdit_duration").value, 10) || 60,
                    bannerText: document.getElementById("scenEdit_banner").value.trim(),
                    modifiers: {
                        playerDmgMult: 1.0,
                        enemyHpMult: parseFloat(document.getElementById("scenEdit_enemyHp").value) || 1.0,
                        enemyDmgMult: parseFloat(document.getElementById("scenEdit_enemyDmg").value) || 1.0,
                        goldMult: parseFloat(document.getElementById("scenEdit_gold").value) || 1.0,
                        xpMult: parseFloat(document.getElementById("scenEdit_xp").value) || 1.0,
                        dropMult: parseFloat(document.getElementById("scenEdit_dropMult").value) || 1.0
                    }
                };
                api.data.saveScenario(scObj);
                this.showToast(`Custom scenario '${scObj.name}' saved & synced!`, "success");
            });
        }

        const btnLaunchCustom = document.getElementById("btnLaunchCustomScenario");
        if (btnLaunchCustom) {
            btnLaunchCustom.addEventListener("click", () => {
                const scId = document.getElementById("scenEdit_id").value.trim();
                if (scId && window.ScenariosData && window.ScenariosData[scId]) {
                    api.scenarios.run(scId);
                    this.showToast(`Launched custom scenario '${scId}' live!`, "success");
                } else {
                    this.showToast("Save the scenario first before launching.", "warn");
                }
            });
        }

        // ==================== ALCHEMY RECIPES CRUD ====================
        const btnNewAlch = document.getElementById("btnNewAlchemyRecipe");
        if (btnNewAlch) {
            btnNewAlch.addEventListener("click", () => this.newAlchemyRecipe());
        }

        const alchSearch = document.getElementById("alchemySearchInput");
        if (alchSearch) {
            alchSearch.addEventListener("input", (e) => {
                this.alchemySearchQuery = (e.target.value || "").trim().toLowerCase();
                this.renderAlchemyList();
            });
        }

        const formAlch = document.getElementById("formAlchemyEditor");
        if (formAlch) {
            formAlch.addEventListener("submit", (e) => {
                e.preventDefault();
                const id = document.getElementById("alchEdit_id").value.trim();
                const name = document.getElementById("alchEdit_name").value.trim();
                if (!id || !name) {
                    this.showToast("Recipe ID and Name are required.", "error");
                    return;
                }

                const mats = {};
                const rawMats = document.getElementById("alchEdit_materials").value.trim();
                if (rawMats) {
                    rawMats.split(",").forEach(part => {
                        const [k, v] = part.split(":").map(s => s && s.trim());
                        if (k && v !== undefined) mats[k] = parseInt(v, 10) || 1;
                    });
                }

                const tier = parseInt(document.getElementById("alchEdit_tier").value, 10) || 1;
                const tierNames = { 1: "Apprentice Cauldron", 2: "Journeyman Crucible", 3: "Aincrad Alchemical Altar" };

                const recipeObj = {
                    id: id,
                    name: name,
                    icon: document.getElementById("alchEdit_icon").value.trim() || "🧪",
                    tier: tier,
                    tierName: tierNames[tier] || `Tier ${tier}`,
                    reqLevel: parseInt(document.getElementById("alchEdit_reqLevel").value, 10) || 1,
                    goldCost: parseInt(document.getElementById("alchEdit_goldCost").value, 10) || 0,
                    materials: mats,
                    result: {
                        id: document.getElementById("alchEdit_resultId").value.trim() || "potion_minor",
                        type: "consumable",
                        qty: parseInt(document.getElementById("alchEdit_resultQty").value, 10) || 1
                    },
                    effect: {
                        type: document.getElementById("alchEdit_effectType").value,
                        stat: document.getElementById("alchEdit_effectStat").value,
                        value: parseFloat(document.getElementById("alchEdit_effectVal").value) || 0,
                        duration: parseInt(document.getElementById("alchEdit_effectDuration").value, 10) || 60
                    },
                    description: document.getElementById("alchEdit_desc").value.trim()
                };

                api.data.saveAlchemyRecipe(recipeObj);
                this.renderAlchemyList();
                this.showToast(`Alchemy Recipe '${recipeObj.name}' saved and synced!`, "success");
            });
        }

        const btnDeleteAlch = document.getElementById("btnDeleteAlchemyRecipe");
        if (btnDeleteAlch) {
            btnDeleteAlch.addEventListener("click", () => {
                const id = document.getElementById("alchEdit_id").value.trim();
                if (!id) return;
                if (confirm(`Delete alchemy recipe '${id}'?`)) {
                    api.data.deleteAlchemyRecipe(id);
                    this.renderAlchemyList();
                    this.newAlchemyRecipe();
                    this.showToast(`Deleted recipe ${id}.`, "info");
                }
            });
        }

        const btnBrewTest = document.getElementById("btnBrewTestToPlayer");
        if (btnBrewTest) {
            btnBrewTest.addEventListener("click", () => {
                const id = document.getElementById("alchEdit_id").value.trim();
                if (id && window.InventoryManager) {
                    const ok = window.InventoryManager.brewPotion(id);
                    if (ok) this.showToast(`Brewed test potion '${id}' for player!`, "success");
                }
            });
        }

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

        // ==================== ADVENTURE & COMBAT LOGS ====================
        const logFilterPills = document.querySelectorAll("#logFilterPills .log-filter-pill");
        logFilterPills.forEach(btn => {
            btn.addEventListener("click", () => {
                logFilterPills.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                this.activeLogFilter = btn.dataset.logFilter || "all";
                this.renderLogs();
            });
        });

        const logSearch = document.getElementById("logSearchInput");
        if (logSearch) {
            logSearch.addEventListener("input", (e) => {
                this.logSearchQuery = (e.target.value || "").trim().toLowerCase();
                this.renderLogs();
            });
        }

        const btnClearLogs = document.getElementById("btnClearLogs");
        if (btnClearLogs) {
            btnClearLogs.addEventListener("click", () => {
                if (confirm("Clear all recorded adventure and combat logs?")) {
                    this.clearLogs();
                }
            });
        }

        const btnDashClearLogs = document.getElementById("btnDashClearLogs");
        if (btnDashClearLogs) {
            btnDashClearLogs.addEventListener("click", () => {
                if (confirm("Clear live adventure logs?")) {
                    this.clearLogs();
                }
            });
        }

        const btnExportLogs = document.getElementById("btnExportLogs");
        if (btnExportLogs) {
            btnExportLogs.addEventListener("click", () => {
                this.exportLogs();
            });
        }

        const btnDashViewAll = document.getElementById("btnDashViewAllLogs");
        if (btnDashViewAll) {
            btnDashViewAll.addEventListener("click", () => {
                const logsTabBtn = document.querySelector('[data-mgr-tab="logs"]');
                if (logsTabBtn) logsTabBtn.click();
            });
        }
    },

    bindMobileNav() {
        const btnToggle = document.getElementById("btnMgrToggleSidebar");
        const sidebar = document.getElementById("mgrSidebar");
        const backdrop = document.getElementById("mgrSidebarBackdrop");
        const btnClose = document.getElementById("btnSidebarClose");

        const toggleMenu = (open) => {
            if (sidebar) sidebar.classList.toggle("mobile-open", open);
            if (backdrop) backdrop.classList.toggle("active", open);
        };

        if (btnToggle) {
            btnToggle.addEventListener("click", () => {
                const isOpen = sidebar ? sidebar.classList.contains("mobile-open") : false;
                toggleMenu(!isOpen);
            });
        }

        if (btnClose) {
            btnClose.addEventListener("click", () => toggleMenu(false));
        }

        if (backdrop) {
            backdrop.addEventListener("click", () => toggleMenu(false));
        }

        // Auto-close sidebar on mobile when navigating
        document.querySelectorAll(".mgr-nav-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                if (window.innerWidth <= 960) {
                    toggleMenu(false);
                }
            });
        });
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

    renderClassPassivesList() {
        const container = document.getElementById("classPassivesContainer");
        if (!container) return;
        container.innerHTML = "";

        if (!this.currentClassPassives || this.currentClassPassives.length === 0) {
            container.innerHTML = `<div style="color:#85899f; font-size:11px; font-style:italic;">No divine passives configured. Click "➕ Add Passive" above.</div>`;
            return;
        }

        this.currentClassPassives.forEach((p, idx) => {
            const row = document.createElement("div");
            row.style.cssText = "display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.25); border:1px solid rgba(255,255,255,0.05); border-radius:6px; padding:6px 10px; font-size:11px;";
            const bonusStr = p.bonus ? Object.entries(p.bonus).map(([k, v]) => `${k}: +${v}`).join(", ") : (p.description || "None");
            row.innerHTML = `
                <div>
                    <strong style="color:#f2c94c;">Lv.${p.reqLevel || 1} ${p.icon || '✨'} ${p.name}</strong>
                    <div style="color:#a78bfa; font-size:10px;">${bonusStr}</div>
                    <div style="color:#85899f; font-size:9px; font-style:italic;">"${p.lore || ''}"</div>
                </div>
                <button type="button" class="btn-danger btn-xs" style="padding:2px 6px; font-size:10px;" title="Remove Passive">✕</button>
            `;
            row.querySelector("button").addEventListener("click", () => {
                this.currentClassPassives.splice(idx, 1);
                this.renderClassPassivesList();
            });
            container.appendChild(row);
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

        if (document.getElementById("classEdit_r2_title")) document.getElementById("classEdit_r2_title").value = "Veteran";
        if (document.getElementById("classEdit_r2_gold")) document.getElementById("classEdit_r2_gold").value = 500;
        if (document.getElementById("classEdit_r2_mats")) document.getElementById("classEdit_r2_mats").value = "ironOre:15, wood:10";
        if (document.getElementById("classEdit_r2_stats")) document.getElementById("classEdit_r2_stats").value = "attack:15, defense:20, hp:100";

        if (document.getElementById("classEdit_r3_title")) document.getElementById("classEdit_r3_title").value = "Master";
        if (document.getElementById("classEdit_r3_gold")) document.getElementById("classEdit_r3_gold").value = 2500;
        if (document.getElementById("classEdit_r3_mats")) document.getElementById("classEdit_r3_mats").value = "crystal:10, dragonScale:5";
        if (document.getElementById("classEdit_r3_stats")) document.getElementById("classEdit_r3_stats").value = "attack:40, defense:50, hp:300";

        this.currentClassPassives = [];
        this.renderClassPassivesList();

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
        document.getElementById("shopEdit_desc").value = "Restores 180 HP instantly.";
        if (document.getElementById("shopEdit_reqMap")) document.getElementById("shopEdit_reqMap").value = "any";
        if (document.getElementById("shopEdit_reqDepth")) document.getElementById("shopEdit_reqDepth").value = 1;
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
        if (document.getElementById("mapEdit_maxDepth")) document.getElementById("mapEdit_maxDepth").value = 3;
        if (document.getElementById("mapEdit_depthSubtitles")) document.getElementById("mapEdit_depthSubtitles").value = "Fringe Clearing | Deep Thicket | Heart";
        const title = document.getElementById("mapFormTitle");
        if (title) title.textContent = "CREATE NEW REALM MAP";
        this.showToast("Ready to design new realm map.", "info");
    },

    newAlchemyRecipe() {
        const randId = `alch_${Date.now().toString().slice(-4)}`;
        document.getElementById("alchEdit_id").value = randId;
        document.getElementById("alchEdit_name").value = "New Elixir of Power";
        document.getElementById("alchEdit_icon").value = "🧪";
        document.getElementById("alchEdit_tier").value = "1";
        document.getElementById("alchEdit_reqLevel").value = 1;
        document.getElementById("alchEdit_goldCost").value = 50;
        document.getElementById("alchEdit_materials").value = "wood:2, ironOre:1";
        document.getElementById("alchEdit_resultId").value = "potion_minor";
        document.getElementById("alchEdit_resultQty").value = 1;
        document.getElementById("alchEdit_effectType").value = "heal";
        document.getElementById("alchEdit_effectStat").value = "attack";
        document.getElementById("alchEdit_effectVal").value = 80;
        document.getElementById("alchEdit_effectDuration").value = 60;
        document.getElementById("alchEdit_desc").value = "Brewed using sacred herbs and minerals.";
        const title = document.getElementById("alchFormTitle");
        if (title) title.textContent = "CREATE NEW ALCHEMY RECIPE";
        this.showToast("Ready to configure new alchemy recipe.", "info");
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
        this.renderAlchemyList();
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

                const p2 = (h.promotions && h.promotions.find(p => p.rank === 2)) || null;
                const p3 = (h.promotions && h.promotions.find(p => p.rank === 3)) || null;

                if (document.getElementById("classEdit_r2_title")) {
                    document.getElementById("classEdit_r2_title").value = p2 ? p2.title : "Veteran";
                    document.getElementById("classEdit_r2_gold").value = p2 ? (p2.goldCost || 500) : 500;
                    document.getElementById("classEdit_r2_mats").value = p2 && p2.materials ? Object.entries(p2.materials).map(([k, v]) => `${k}:${v}`).join(", ") : "ironOre:15, wood:10";
                    document.getElementById("classEdit_r2_stats").value = p2 && p2.bonusStats ? Object.entries(p2.bonusStats).map(([k, v]) => `${k}:${v}`).join(", ") : "attack:15, defense:20, hp:100";
                }
                if (document.getElementById("classEdit_r3_title")) {
                    document.getElementById("classEdit_r3_title").value = p3 ? p3.title : "Master";
                    document.getElementById("classEdit_r3_gold").value = p3 ? (p3.goldCost || 2500) : 2500;
                    document.getElementById("classEdit_r3_mats").value = p3 && p3.materials ? Object.entries(p3.materials).map(([k, v]) => `${k}:${v}`).join(", ") : "crystal:10, dragonScale:5";
                    document.getElementById("classEdit_r3_stats").value = p3 && p3.bonusStats ? Object.entries(p3.bonusStats).map(([k, v]) => `${k}:${v}`).join(", ") : "attack:40, defense:50, hp:300";
                }

                this.currentClassPassives = JSON.parse(JSON.stringify(h.passives || []));
                this.renderClassPassivesList();
            });
            classListEl.appendChild(item);
        });

        if ((!this.currentClassPassives || this.currentClassPassives.length === 0) && Object.values(window.HeroesData).length > 0) {
            const first = Object.values(window.HeroesData)[0];
            this.currentClassPassives = JSON.parse(JSON.stringify(first.passives || []));
            this.renderClassPassivesList();
        }
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
            const it = (s.itemId && window.ItemsData && window.ItemsData[s.itemId]) ||
                       (s.matKey && window.MaterialsData && window.MaterialsData[s.matKey]) ||
                       (s.matKey && window.ItemsData && window.ItemsData[s.matKey]) || {};

            const displayName = (s.name && s.name !== "undefined") ? s.name : (it.name || s.id || "Shop Item");
            const displayIcon = (s.icon && s.icon !== "undefined") ? s.icon : (it.icon || "🛍️");
            const displayCat = (s.category && s.category !== "undefined") ? s.category : (it.slot || it.type || (s.matKey ? "material" : "item"));
            const cost = s.costGold || s.cost || it.baseValue || 100;
            const reqLv = s.reqLevel || 1;
            const reqMap = s.reqMap || "any";
            const reqDepth = s.reqDepth || 1;
            const desc = s.description || s.desc || it.description || "";

            if (q && !displayName.toLowerCase().includes(q) && !s.id.toLowerCase().includes(q) && !displayCat.toLowerCase().includes(q)) return;

            const mapBadge = reqMap !== "any" ? `[${reqMap} D${reqDepth}]` : `[Universal]`;

            const item = document.createElement("div");
            item.className = "mgr-list-item";
            item.innerHTML = `<span>${displayIcon} <strong>${displayName}</strong> <small style="color:#85899f;">${mapBadge}</small></span> <small style="color:#edc76f;">✦ ${cost}g · Lv.${reqLv}</small>`;
            item.addEventListener("click", () => {
                const title = document.getElementById("shopFormTitle");
                if (title) title.textContent = `EDIT LISTING: ${displayName.toUpperCase()}`;
                document.getElementById("shopEdit_id").value = s.id || "";
                document.getElementById("shopEdit_name").value = displayName;
                document.getElementById("shopEdit_category").value = displayCat;
                document.getElementById("shopEdit_icon").value = displayIcon;
                document.getElementById("shopEdit_itemId").value = s.itemId || s.matKey || "";
                document.getElementById("shopEdit_costGold").value = cost;
                document.getElementById("shopEdit_reqLevel").value = reqLv;
                document.getElementById("shopEdit_matQty").value = s.matQty || 1;
                document.getElementById("shopEdit_desc").value = desc;
                if (document.getElementById("shopEdit_reqMap")) {
                    document.getElementById("shopEdit_reqMap").value = reqMap;
                }
                if (document.getElementById("shopEdit_reqDepth")) {
                    document.getElementById("shopEdit_reqDepth").value = reqDepth;
                }
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

                if (document.getElementById("mapEdit_maxDepth")) {
                    document.getElementById("mapEdit_maxDepth").value = m.maxDepth || 3;
                }
                if (document.getElementById("mapEdit_depthSubtitles")) {
                    const subtitles = (m.depthTiers || []).map(t => t.subtitle).join(" | ");
                    document.getElementById("mapEdit_depthSubtitles").value = subtitles || "Fringe Clearing | Deep Thicket | Heart";
                }
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

        // Shop Req Map dropdown
        const shopMapSelect = document.getElementById("shopEdit_reqMap");
        if (shopMapSelect && window.MapsData) {
            const curVal = shopMapSelect.value;
            shopMapSelect.innerHTML = `<option value="any">Any Realm (Unlocked by Level)</option>`;
            Object.values(window.MapsData).forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.id;
                opt.textContent = `${m.name} [Realm ${m.roman || m.realmIndex}]`;
                shopMapSelect.appendChild(opt);
            });
            if (curVal) shopMapSelect.value = curVal;
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

    renderAlchemyList() {
        const listEl = document.getElementById("mgrAlchemyList");
        if (!listEl || !window.AlchemyData) return;
        listEl.innerHTML = "";

        const q = this.alchemySearchQuery;
        const recipes = Array.isArray(window.AlchemyData) ? window.AlchemyData : Object.values(window.AlchemyData);

        recipes.forEach(rec => {
            if (q && !rec.name.toLowerCase().includes(q) && !rec.id.toLowerCase().includes(q) && !(rec.tierName && rec.tierName.toLowerCase().includes(q))) return;

            const item = document.createElement("div");
            item.className = "mgr-list-item";
            const tierBadgeClass = rec.tier === 3 ? "badge-legendary" : (rec.tier === 2 ? "badge-rare" : "badge-common");
            const matCount = rec.materials ? Object.keys(rec.materials).length : 0;

            item.innerHTML = `
                <span>${rec.icon || '🧪'} <strong>${rec.name}</strong> <span class="mgr-badge ${tierBadgeClass}">T${rec.tier || 1} · Lv.${rec.reqLevel || 1}</span></span>
                <small style="color:#edc76f;">✦ ${rec.goldCost || 0}g · ${matCount} mats</small>
            `;

            item.addEventListener("click", () => {
                const title = document.getElementById("alchFormTitle");
                if (title) title.textContent = `EDIT RECIPE: ${rec.name.toUpperCase()}`;
                if (document.getElementById("alchEdit_id")) document.getElementById("alchEdit_id").value = rec.id;
                if (document.getElementById("alchEdit_name")) document.getElementById("alchEdit_name").value = rec.name;
                if (document.getElementById("alchEdit_icon")) document.getElementById("alchEdit_icon").value = rec.icon || "🧪";
                if (document.getElementById("alchEdit_tier")) document.getElementById("alchEdit_tier").value = rec.tier || 1;
                if (document.getElementById("alchEdit_reqLevel")) document.getElementById("alchEdit_reqLevel").value = rec.reqLevel || 1;
                if (document.getElementById("alchEdit_goldCost")) document.getElementById("alchEdit_goldCost").value = rec.goldCost || 0;
                if (document.getElementById("alchEdit_materials")) {
                    document.getElementById("alchEdit_materials").value = rec.materials ? Object.entries(rec.materials).map(([k, v]) => `${k}:${v}`).join(", ") : "";
                }
                if (document.getElementById("alchEdit_resultId")) document.getElementById("alchEdit_resultId").value = (rec.result && rec.result.id) || "potion_minor";
                if (document.getElementById("alchEdit_resultQty")) document.getElementById("alchEdit_resultQty").value = (rec.result && rec.result.qty) || 1;

                if (rec.effect) {
                    if (document.getElementById("alchEdit_effectType")) document.getElementById("alchEdit_effectType").value = rec.effect.type || "heal";
                    if (document.getElementById("alchEdit_effectStat")) document.getElementById("alchEdit_effectStat").value = rec.effect.stat || "attack";
                    if (document.getElementById("alchEdit_effectVal")) document.getElementById("alchEdit_effectVal").value = (rec.effect.value !== undefined) ? rec.effect.value : 0;
                    if (document.getElementById("alchEdit_effectDuration")) document.getElementById("alchEdit_effectDuration").value = rec.effect.duration || 60;
                }
                if (document.getElementById("alchEdit_desc")) document.getElementById("alchEdit_desc").value = rec.description || "";
            });

            listEl.appendChild(item);
        });
    },

    refreshJson() {
        const area = document.getElementById("txtJsonConfig");
        if (area && window.GameAPI) {
            area.value = window.GameAPI.data.exportAllJSON();
        }
    },

    /* =========================================================
       WORLD DASHBOARD & LIVE STATUS
    ========================================================= */
    renderDashboard() {
        let state = window.gameState;
        if (!state) {
            try {
                const saved = localStorage.getItem("realmIdleRootSave");
                if (saved) state = JSON.parse(saved);
            } catch (e) {}
        }
        if (!state) return;

        // Current Map
        const mapEl = document.getElementById("dashMap");
        if (mapEl) {
            const mapId = (state.world && state.world.currentMapId) || "moonlit_vale";
            const mapDef = (window.MapsData && window.MapsData[mapId]) || { name: "Moonlit Vale", roman: "I" };
            mapEl.textContent = `${mapDef.name} [Realm ${mapDef.roman || 'I'}]`;
        }

        // Current Weather
        const weatherEl = document.getElementById("dashWeather");
        if (weatherEl) {
            const weatherId = (state.world && state.world.currentWeatherId) || "clear";
            const weatherDef = (window.WeatherData && window.WeatherData[weatherId]) || { name: "Clear Sky", icon: "☀️" };
            weatherEl.textContent = `${weatherDef.icon || '☀️'} ${weatherDef.name}`;
        }

        // World Time
        const timeEl = document.getElementById("dashTime");
        if (timeEl) {
            const hour = (state.world && state.world.worldTime !== undefined) ? state.world.worldTime : 12;
            const period = (hour >= 6 && hour < 18) ? "Day" : "Night";
            timeEl.textContent = `${hour}:00 (${period})`;
        }

        // Hero Info
        const heroEl = document.getElementById("dashHero");
        if (heroEl && state.player) {
            const heroClass = state.player.heroClass || "knight";
            const heroDef = (window.HeroesData && window.HeroesData[heroClass]) || { name: "Knight" };
            const gold = (state.player.gold || 0).toLocaleString();
            const heroName = state.player.name || "Hero";
            heroEl.textContent = `Lvl ${state.player.level || 1} · ${gold}g (${heroName} - ${heroDef.name})`;
        }

        // Active Mob Wave
        const mobNameEl = document.getElementById("dashMobName");
        const mobHpEl = document.getElementById("dashMobHp");
        const mobEmojiEl = document.querySelector(".mgr-active-mob .mob-emoji");

        if (state.combat && state.combat.inTemple) {
            if (mobNameEl) mobNameEl.textContent = "Sanctuary of Revival (Safe Zone)";
            if (mobHpEl) mobHpEl.textContent = "Hero Recovering · Combat Paused";
            if (mobEmojiEl) mobEmojiEl.textContent = "🏛️";
        } else if (state.combat && state.combat.currentMob) {
            const mob = state.combat.currentMob;
            const bossTag = mob.isBoss ? " 👑" : "";
            const stage = state.combat.stage || 1;
            const maxStages = state.combat.maxStages || 10;
            if (mobNameEl) mobNameEl.textContent = `${mob.name}${bossTag} (Stage ${stage}/${maxStages})`;
            if (mobHpEl) mobHpEl.textContent = `${Math.max(0, mob.hp)} / ${mob.maxHp} HP`;
            if (mobEmojiEl) mobEmojiEl.textContent = mob.icon || "👹";
        } else {
            if (mobNameEl) mobNameEl.textContent = "Awaiting Next Encounter...";
            if (mobHpEl) mobHpEl.textContent = "Ready to engage";
            if (mobEmojiEl) mobEmojiEl.textContent = "⚔️";
        }

        // Active Scenarios & Events
        const eventEl = document.getElementById("dashActiveEvent");
        if (eventEl) {
            if (state.world && state.world.activeScenarioId && window.ScenariosData && window.ScenariosData[state.world.activeScenarioId]) {
                const sc = window.ScenariosData[state.world.activeScenarioId];
                eventEl.innerHTML = `<span style="color:#ffd700;">🔥 SCENARIO: <strong>${sc.name}</strong></span>`;
            } else if (state.world && state.world.activeEventId && window.EventsData && window.EventsData[state.world.activeEventId]) {
                const ev = window.EventsData[state.world.activeEventId];
                eventEl.innerHTML = `<span style="color:#9b7cff;">⚡ EVENT: <strong>${ev.name}</strong></span>`;
            } else {
                eventEl.innerHTML = `<span style="color:#85899f;">No active world events</span>`;
            }
        }

        // Active Scenarios & Events in Event tab monitor
        const scNameEl = document.getElementById("mgrActiveScenarioName");
        const scDescEl = document.getElementById("mgrActiveScenarioDetails");
        if (scNameEl && scDescEl) {
            if (state.world && state.world.activeScenarioId && window.ScenariosData && window.ScenariosData[state.world.activeScenarioId]) {
                const sc = window.ScenariosData[state.world.activeScenarioId];
                scNameEl.innerHTML = `<span style="color:#f2c94c;">${sc.icon || '🔥'} ${sc.name}</span>`;
                scDescEl.textContent = sc.description || `HP: x${sc.enemyHpMult || 1}, Dmg: x${sc.enemyDmgMult || 1}, Drops: x${sc.dropMult || 1}`;
            } else {
                scNameEl.textContent = "None";
                scDescEl.textContent = "No scenario active. Enemies have standard parameters.";
            }
        }

        const evNameEl = document.getElementById("mgrActiveEventName");
        const evDescEl = document.getElementById("mgrActiveEventDetails");
        if (evNameEl && evDescEl) {
            if (state.world && state.world.activeEventId && window.EventsData && window.EventsData[state.world.activeEventId]) {
                const ev = window.EventsData[state.world.activeEventId];
                evNameEl.innerHTML = `<span style="color:#60a5fa;">${ev.icon || '⚡'} ${ev.name}</span>`;
                evDescEl.textContent = ev.description || `Gold: x${ev.goldMult || 1}, Drop Rate: x${ev.dropMult || 1}`;
            } else {
                evNameEl.textContent = "None";
                evDescEl.textContent = "No world event active. Standard realm drops & weather apply.";
            }
        }

        // Live Dashboard Logs
        this.renderDashboardLogs();
    },

    renderDashboardLogs() {
        const stream = document.getElementById("dashLogsStream");
        const countBadge = document.getElementById("dashLogsCount");
        const logs = (window.gameState && window.gameState.logs) ? window.gameState.logs : [];

        if (countBadge) {
            countBadge.textContent = `${logs.length} Event${logs.length === 1 ? '' : 's'}`;
        }

        if (!stream) return;

        if (logs.length === 0) {
            stream.innerHTML = `<div class="mgr-log-empty">No adventure events recorded yet. Events like player defeat, boss clears, and rare loot will stream here in real time.</div>`;
            return;
        }

        const recent = logs.slice(0, 6);
        stream.innerHTML = recent.map(log => `
            <div class="mgr-log-item type-${log.type || 'info'}">
                <span class="log-icon">${log.icon || 'ℹ️'}</span>
                <span class="log-time">${log.timeStr || ''}</span>
                <span class="log-text">${log.text}</span>
            </div>
        `).join("");
    },

    /* =========================================================
       ADVENTURE LOGS INSPECTOR (DEEP DIVE)
    ========================================================= */
    renderLogs() {
        const feed = document.getElementById("mgrLogsFeed");
        const logs = (window.gameState && window.gameState.logs) ? window.gameState.logs : [];

        // Update counts on filter pills
        const setBadge = (id, count) => {
            const el = document.getElementById(id);
            if (el) el.textContent = count;
        };

        setBadge("countLogAll", logs.length);
        setBadge("countLogDeath", logs.filter(l => l.type === "death" || l.type === "revival").length);
        setBadge("countLogBoss", logs.filter(l => l.type === "boss").length);
        setBadge("countLogLoot", logs.filter(l => l.type === "loot").length);
        setBadge("countLogLevel", logs.filter(l => l.type === "level").length);
        setBadge("countLogTravel", logs.filter(l => l.type === "travel").length);
        setBadge("countLogSystem", logs.filter(l => l.type === "system" || l.type === "combat").length);

        if (!feed) return;

        let filtered = logs;

        // Apply type filter
        if (this.activeLogFilter && this.activeLogFilter !== "all") {
            if (this.activeLogFilter === "death") {
                filtered = filtered.filter(l => l.type === "death" || l.type === "revival");
            } else if (this.activeLogFilter === "system") {
                filtered = filtered.filter(l => l.type === "system" || l.type === "combat");
            } else {
                filtered = filtered.filter(l => l.type === this.activeLogFilter);
            }
        }

        // Apply search query
        if (this.logSearchQuery) {
            const q = this.logSearchQuery;
            filtered = filtered.filter(l => (l.text && l.text.toLowerCase().includes(q)) || (l.timeStr && l.timeStr.toLowerCase().includes(q)));
        }

        if (filtered.length === 0) {
            feed.innerHTML = `<div class="mgr-log-empty">No adventure events match the current filter/search.</div>`;
            return;
        }

        feed.innerHTML = filtered.map(log => `
            <div class="mgr-log-item type-${log.type || 'info'}">
                <span class="log-icon">${log.icon || 'ℹ️'}</span>
                <span class="log-time">${log.timeStr || ''}</span>
                <span class="log-text">${log.text}</span>
            </div>
        `).join("");
    },

    clearLogs() {
        if (window.gameState && typeof window.gameState.clearLogs === "function") {
            window.gameState.clearLogs();
        } else if (window.gameState) {
            window.gameState.logs = [];
            window.gameState.save();
        }
        this.renderLogs();
        this.renderDashboardLogs();
        this.showToast("Adventure and combat event logs cleared.", "info");
    },

    exportLogs() {
        const logs = (window.gameState && window.gameState.logs) ? window.gameState.logs : [];
        const json = JSON.stringify(logs, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `realm_idle_adventure_logs_${Date.now()}.json`;
        a.click();
        this.showToast("Exported adventure logs to JSON file!", "success");
    },

    startDashboardSync() {
        // Ticker to refresh dashboard stats
        setInterval(() => {
            this.renderDashboard();
        }, 2000);

        // Listen for BroadcastChannel synchronization
        if (typeof syncChannel !== "undefined" && syncChannel) {
            syncChannel.onmessage = (e) => {
                const data = e.data || {};
                if (data.action === "NEW_LOG" && data.payload) {
                    if (window.gameState) {
                        if (!window.gameState.logs) window.gameState.logs = [];
                        if (!window.gameState.logs.some(l => l.id === data.payload.id)) {
                            window.gameState.logs.unshift(data.payload);
                            if (window.gameState.logs.length > 80) window.gameState.logs.pop();
                        }
                    }
                    this.renderLogs();
                    this.renderDashboardLogs();
                } else if (data.action === "LOGS_CLEARED") {
                    if (window.gameState) window.gameState.logs = [];
                    this.renderLogs();
                    this.renderDashboardLogs();
                } else {
                    this.renderDashboard();
                }
            };
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.ManagerApp.init();
});
