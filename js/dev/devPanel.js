/* =========================================================
   REALM IDLE DEV - 10-TAB GM PANEL UI MANAGER
========================================================= */

window.DevPanel = {
    init() {
        this.bindGlobalKeys();
        this.bindTabs();
        this.populateDropdowns();
        this.bindActions();
        this.syncUI();
    },

    bindGlobalKeys() {
        // Note: F2 is handled by DebugWidget (debug.js) which targets #debugWidget in index.html
    },

    bindTabs() {
        document.querySelectorAll(".dev-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const targetTab = btn.dataset.tab;
                this.switchTab(targetTab);
            });
        });
    },

    switchTab(tabId) {
        window.devMode.activeTab = tabId;

        document.querySelectorAll(".dev-tab-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tab === tabId);
        });

        document.querySelectorAll(".dev-tab-content").forEach(content => {
            content.classList.toggle("active", content.id === `tabContent_${tabId}`);
        });
    },

    populateDropdowns() {
        // Hero Select
        const selHero = document.getElementById("devSelectHero");
        if (selHero && window.HeroesData) {
            selHero.innerHTML = "";
            Object.values(window.HeroesData).forEach(h => {
                const opt = document.createElement("option");
                opt.value = h.id;
                opt.textContent = `${h.icon} ${h.name} (${h.description})`;
                selHero.appendChild(opt);
            });
        }

        // Mob Select
        const selMob = document.getElementById("devSelectMob");
        if (selMob && window.MobsData) {
            selMob.innerHTML = "";
            Object.values(window.MobsData).forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.id;
                opt.textContent = `${m.icon} ${m.name} (Lvl ${m.levelMin}-${m.levelMax})`;
                selMob.appendChild(opt);
            });
        }

        // Map Select
        const selMap = document.getElementById("devSelectMap");
        if (selMap && window.MapsData) {
            selMap.innerHTML = "";
            Object.values(window.MapsData).forEach(m => {
                const opt = document.createElement("option");
                opt.value = m.id;
                opt.textContent = `${m.name} [Realm ${m.roman}]`;
                selMap.appendChild(opt);
            });
        }

        // Weather Select
        const selWeather = document.getElementById("devSelectWeather");
        if (selWeather && window.WeatherData) {
            selWeather.innerHTML = "";
            Object.values(window.WeatherData).forEach(w => {
                const opt = document.createElement("option");
                opt.value = w.id;
                opt.textContent = `${w.icon} ${w.name}`;
                selWeather.appendChild(opt);
            });
        }

        // Item Select
        const selItem = document.getElementById("devSelectItem");
        if (selItem && window.ItemsData) {
            selItem.innerHTML = "";
            Object.values(window.ItemsData).forEach(i => {
                const opt = document.createElement("option");
                opt.value = i.id;
                opt.textContent = `${i.icon} ${i.name} [${i.rarity.toUpperCase()}]`;
                selItem.appendChild(opt);
            });
        }
    },

    bindActions() {
        const state = window.gameState;
        const dev = window.devMode;

        // Modal triggers
        const btnToggle = document.getElementById("btnDevToggle");
        if (btnToggle) btnToggle.addEventListener("click", () => {
            console.log("clicked f2");

            if (window.DebugWidget) window.DebugWidget.toggle();
        });

        const btnClose = document.getElementById("devModalClose");
        if (btnClose) btnClose.addEventListener("click", () => dev.togglePanel(false));

        const modal = document.getElementById("devModal");
        if (modal) {
            modal.addEventListener("click", (e) => {
                if (e.target === modal) dev.togglePanel(false);
            });
        }

        // Tab 1: Player Actions
        const btnSetHero = document.getElementById("btnDevSetHero");
        if (btnSetHero) {
            btnSetHero.addEventListener("click", () => {
                const classId = document.getElementById("devSelectHero").value;
                state.setHeroClass(classId);
            });
        }

        document.querySelectorAll("[data-player-action]").forEach(btn => {
            btn.addEventListener("click", () => {
                const act = btn.dataset.playerAction;
                const val = parseInt(btn.dataset.value || "0", 10);

                if (act === "addGold") state.addGold(val);
                else if (act === "addPower") { state.player.power += val; state.notify(); }
                else if (act === "addXp") state.addXp(val);
                else if (act === "levelUp") state.addXp(state.player.xpToNext - state.player.xp);
                else if (act === "heal") { state.player.hp = state.player.maxHp; state.notify(); }
            });
        });

        const chkGod = document.getElementById("chkGodMode");
        if (chkGod) chkGod.addEventListener("change", e => dev.godMode = e.target.checked);

        const chkOneHit = document.getElementById("chkOneHitKill");
        if (chkOneHit) chkOneHit.addEventListener("change", e => dev.oneHitKill = e.target.checked);

        const chkInfGold = document.getElementById("chkInfiniteGold");
        if (chkInfGold) chkInfGold.addEventListener("change", e => { dev.infiniteGold = e.target.checked; state.notify(); });

        const chkInfHp = document.getElementById("chkInfiniteHp");
        if (chkInfHp) chkInfHp.addEventListener("change", e => dev.infiniteHealth = e.target.checked);

        // Tab 2: Spawner
        const btnSpawn = document.getElementById("btnDevSpawnMob");
        if (btnSpawn) {
            btnSpawn.addEventListener("click", () => {
                const mobId = document.getElementById("devSelectMob").value;
                const isBoss = document.getElementById("chkSpawnBoss").checked;
                if (window.SpawningManager) window.SpawningManager.spawnMobById(mobId, { isBoss: isBoss });
            });
        }

        const btnClearMobs = document.getElementById("btnDevClearMobs");
        if (btnClearMobs) {
            btnClearMobs.addEventListener("click", () => {
                if (window.SpawningManager) window.SpawningManager.clearMobs();
            });
        }

        // Tab 3: Bosses
        document.querySelectorAll("[data-boss-action]").forEach(btn => {
            btn.addEventListener("click", () => {
                const act = btn.dataset.bossAction;
                if (act === "spawnDragon") {
                    if (window.SpawningManager) window.SpawningManager.spawnMobById("dragon", { isBoss: true });
                } else if (act === "spawnLich") {
                    if (window.SpawningManager) window.SpawningManager.spawnMobById("lich", { isBoss: true });
                } else if (act === "triggerPhase2") {
                    if (state.combat.currentMob && state.combat.currentMob.isBoss) {
                        state.combat.currentMob.hp = Math.floor(state.combat.currentMob.maxHp * 0.65);
                        state.notify();
                    }
                } else if (act === "triggerPhase3") {
                    if (state.combat.currentMob && state.combat.currentMob.isBoss) {
                        state.combat.currentMob.hp = Math.floor(state.combat.currentMob.maxHp * 0.25);
                        state.notify();
                    }
                }
            });
        });

        // Tab 4: Maps
        const btnTravelMap = document.getElementById("btnDevTravelMap");
        if (btnTravelMap) {
            btnTravelMap.addEventListener("click", () => {
                const mapId = document.getElementById("devSelectMap").value;
                if (window.MapManager) window.MapManager.loadMap(mapId);
            });
        }

        // Tab 5: Weather
        const btnApplyWeather = document.getElementById("btnDevApplyWeather");
        if (btnApplyWeather) {
            btnApplyWeather.addEventListener("click", () => {
                const weatherId = document.getElementById("devSelectWeather").value;
                if (window.WeatherManager) window.WeatherManager.setWeather(weatherId);
            });
        }

        // Tab 6: Time & Speed
        const rngTime = document.getElementById("rngDevTime");
        if (rngTime) {
            rngTime.addEventListener("input", (e) => {
                const hour = parseInt(e.target.value, 10);
                if (window.TimeManager) window.TimeManager.setTime(hour);
            });
        }

        document.querySelectorAll("[data-time-preset]").forEach(btn => {
            btn.addEventListener("click", () => {
                const hour = parseInt(btn.dataset.timePreset, 10);
                if (window.TimeManager) window.TimeManager.setTime(hour);
            });
        });

        document.querySelectorAll(".dev-speed-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const spd = parseFloat(btn.dataset.speed);
                dev.gameSpeed = spd;
                if (window.MainEngine) window.MainEngine.restartGameLoops();
                this.syncUI();
            });
        });

        // Tab 7: Kingdom
        document.querySelectorAll("[data-kingdom-bldg]").forEach(btn => {
            btn.addEventListener("click", () => {
                const bldg = btn.dataset.kingdomBldg;
                if (window.KingdomManager) window.KingdomManager.upgradeBuilding(bldg);
            });
        });

        // Tab 8: Items & Crafting
        const btnGiveItem = document.getElementById("btnDevGiveItem");
        if (btnGiveItem) {
            btnGiveItem.addEventListener("click", () => {
                const itemId = document.getElementById("devSelectItem").value;
                if (window.InventoryManager) window.InventoryManager.addItem(itemId);
            });
        }

        const btnGiveMats = document.getElementById("btnDevGiveMats");
        if (btnGiveMats) {
            btnGiveMats.addEventListener("click", () => {
                if (window.InventoryManager) {
                    window.InventoryManager.addMaterial("ironOre", 50);
                    window.InventoryManager.addMaterial("wood", 50);
                    window.InventoryManager.addMaterial("crystal", 25);
                    window.InventoryManager.addMaterial("dragonScale", 25);
                    window.InventoryManager.addMaterial("shadowEssence", 10);
                }
            });
        }

        // Tab 9: Scenarios & Events
        document.querySelectorAll("[data-scenario-id]").forEach(btn => {
            btn.addEventListener("click", () => {
                const scId = btn.dataset.scenarioId;
                if (scId === "stop") {
                    if (window.ScenarioManager) window.ScenarioManager.stopScenario();
                } else if (window.ScenarioManager) {
                    window.ScenarioManager.runScenario(scId);
                }
            });
        });

        document.querySelectorAll("[data-event-id]").forEach(btn => {
            btn.addEventListener("click", () => {
                const eventId = btn.dataset.eventId;
                if (eventId === "stop") {
                    if (window.EventManager) window.EventManager.stopEvent();
                } else if (window.EventManager) {
                    window.EventManager.startEvent(eventId);
                }
            });
        });

        // Tab 10: Console Form
        const consoleForm = document.getElementById("devConsoleForm");
        const consoleInput = document.getElementById("devConsoleInput");
        if (consoleForm && consoleInput) {
            consoleForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const cmd = consoleInput.value;
                consoleInput.value = "";
                if (window.DevCommands) window.DevCommands.execute(cmd);
            });
        }

        // Reset Overrides
        const btnResetDev = document.getElementById("btnDevResetOverrides");
        if (btnResetDev) btnResetDev.addEventListener("click", () => dev.resetOverrides());
    },

    syncUI() {
        const dev = window.devMode;
        const state = window.gameState;
        if (!state) return;

        const chkGod = document.getElementById("chkGodMode");
        if (chkGod) chkGod.checked = dev.godMode;

        const chkOneHit = document.getElementById("chkOneHitKill");
        if (chkOneHit) chkOneHit.checked = dev.oneHitKill;

        const chkInfGold = document.getElementById("chkInfiniteGold");
        if (chkInfGold) chkInfGold.checked = dev.infiniteGold;

        const chkInfHp = document.getElementById("chkInfiniteHp");
        if (chkInfHp) chkInfHp.checked = dev.infiniteHealth;

        // Sync Speed buttons
        document.querySelectorAll(".dev-speed-btn").forEach(btn => {
            btn.classList.toggle("active", parseFloat(btn.dataset.speed) === dev.gameSpeed);
        });

        // Sync Time slider
        const rngTime = document.getElementById("rngDevTime");
        const lblTime = document.getElementById("lblDevTime");
        if (rngTime) rngTime.value = state.world.worldTime;
        if (lblTime && window.TimeManager) {
            lblTime.textContent = `${state.world.worldTime}:00 (${window.TimeManager.getTimeLabel(state.world.worldTime)})`;
        }
    }
};
