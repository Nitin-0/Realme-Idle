/* =========================================================
   REALM IDLE MAIN ENGINE - RPG & GM BOOTSTRAPPER
========================================================= */

window.MainEngine = {
    combatLoopId: null,
    passiveGoldLoopId: null,
    eventLoopId: null,
    saveLoopId: null,

    activeTab: "character",
    selectedInventoryItemInstanceId: null,
    currentInvFilter: "all",
    currentInvSort: "rarity",
    currentShopFilter: "all",

    onboardState: {
        step: 1,
        name: "Roland",
        gender: "male",
        selectedClass: "knight"
    },
    victoryDetails: null,

    init() {
        // 1. Load State & Initialize Quests
        window.gameState.load();
        if (window.QuestManager) window.QuestManager.initDefaultQuests();

        // 2. Check Onboarding
        if (!window.gameState.player.hasCompletedOnboarding) {
            this.showOnboardingModal();
        }

        // 3. Check & Report Offline Progress
        const offReport = window.gameState.calculateOfflineProgress();
        if (offReport) {
            this.showOfflineModal(offReport);
        }

        // 4. Init Canvas Weather
        if (window.WeatherManager) window.WeatherManager.init();

        // 5. Init GM Panel
        if (window.DevPanel) window.DevPanel.init();

        // 6. Subscribe UI sync to root gameState changes
        window.gameState.subscribe(() => this.updateUI());

        // 7. Initial Map setup
        if (window.MapManager) {
            window.MapManager.loadMap(window.gameState.world.currentMapId);
        }

        // 8. Bind upgrade buttons & UI actions
        this.bindEvents();

        // 9. Start Loops
        this.restartGameLoops();

        // 10. Render Initial Active Tab (Character Sheet & Class Hall)
        this.switchTab(this.activeTab);
        this.renderCharacterView();

        // 11. Render Initial UI
        this.updateUI();

        // 12. Expose Developer & User Console Shortcuts
        window.wipeAllSaveData = () => this.wipeAllSaveData();
        window.clearSave = () => this.wipeAllSaveData();
        window.resetGame = () => this.wipeAllSaveData();
        window.startNewAdventure = () => this.wipeAllSaveData();
        window.clearLogs = () => {
            if (window.gameState) window.gameState.clearLogs();
            console.log("%c📜 REALM IDLE: Adventure logs cleared.", "color: #00e676;");
        };
        console.log("%c👑 REALM IDLE: Type clearSave() or resetGame() in console anytime to wipe storage and restart adventure!", "color: #edc76f; font-weight: bold; font-size: 12px;");

        console.log("👑 Realm Idle RPG & GM Engine Initialized!");
    },

    bindEvents() {
        const state = window.gameState;
        const api = window.GameAPI;

        // Main Navigation Tabs
        document.querySelectorAll(".nav-tab-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const targetTab = btn.dataset.tab;
                this.switchTab(targetTab);
            });
        });

        // Upgrades
        const btnDmg = document.getElementById("damageUpgrade");
        if (btnDmg) {
            btnDmg.addEventListener("click", () => {
                if (!state.canAfford(state.costs.damageCost)) return;
                state.spendGold(state.costs.damageCost);
                state.player.power += 5;
                state.costs.damageCost = Math.floor(state.costs.damageCost * 1.55);
                state.notify();
            });
        }

        const btnInc = document.getElementById("incomeUpgrade");
        if (btnInc) {
            btnInc.addEventListener("click", () => {
                if (!state.canAfford(state.costs.incomeCost)) return;
                state.spendGold(state.costs.incomeCost);
                state.costs.goldPerSecond += 2;
                state.costs.incomeCost = Math.floor(state.costs.incomeCost * 1.65);
                state.notify();
            });
        }

        const btnRealm = document.getElementById("nextRealm");
        if (btnRealm) {
            btnRealm.addEventListener("click", () => {
                if (!state.canAfford(state.costs.realmCost)) return;
                state.spendGold(state.costs.realmCost);

                const currentMap = window.MapsData[state.world.currentMapId];
                const nextRealmIndex = (currentMap ? currentMap.realmIndex : 1) + 1;

                const nextMap = Object.values(window.MapsData).find(m => m.realmIndex === nextRealmIndex);
                if (nextMap && window.MapManager) {
                    state.player.power += 10;
                    state.costs.realmCost = Math.floor(state.costs.realmCost * 2.5);
                    window.MapManager.loadMap(nextMap.id);

                    const statusEl = document.getElementById("status");
                    if (statusEl) statusEl.textContent = `🌌 Entered ${nextMap.name} (Realm ${nextMap.roman})`;
                }
            });
        }

        // Travel Back (Previous Realm)
        const btnPrevRealm = document.getElementById("btnPrevRealm");
        if (btnPrevRealm) {
            btnPrevRealm.addEventListener("click", () => {
                const currentMap = window.MapsData[state.world.currentMapId];
                const prevRealmIndex = (currentMap ? currentMap.realmIndex : 2) - 1;
                const prevMap = Object.values(window.MapsData).find(m => m.realmIndex === prevRealmIndex);
                if (prevMap && window.MapManager) {
                    window.MapManager.loadMap(prevMap.id);
                    const statusEl = document.getElementById("status");
                    if (statusEl) statusEl.textContent = `⬅️ Traveled back to ${prevMap.name} (Realm ${prevMap.roman})`;
                }
            });
        }

        // Reset & Full Wipe
        const btnReset = document.getElementById("reset");
        if (btnReset) {
            btnReset.addEventListener("click", () => this.wipeAllSaveData());
        }

        // Hero Class Icon Quick Access Menu
        const heroClassIcon = document.getElementById("heroClassIcon");
        if (heroClassIcon) {
            heroClassIcon.addEventListener("click", () => this.toggleHeroQuickMenu());
        }

        const btnQuickClose = document.getElementById("btnQuickClose");
        if (btnQuickClose) btnQuickClose.addEventListener("click", () => this.hideHeroQuickMenu());

        const btnQuickChar = document.getElementById("btnQuickCharSheet");
        if (btnQuickChar) {
            btnQuickChar.addEventListener("click", () => {
                this.hideHeroQuickMenu();
                this.switchTab("character");
            });
        }

        const btnQuickNewHero = document.getElementById("btnQuickNewHero");
        if (btnQuickNewHero) {
            btnQuickNewHero.addEventListener("click", () => {
                this.hideHeroQuickMenu();
                this.showOnboardingModal(true);
            });
        }

        const btnQuickDbg = document.getElementById("btnQuickDebug");
        if (btnQuickDbg) {
            btnQuickDbg.addEventListener("click", () => {
                this.hideHeroQuickMenu();
                if (window.DebugWidget) window.DebugWidget.toggle(true);
            });
        }

        const btnQuickAdm = document.getElementById("btnQuickAdmin");
        if (btnQuickAdm) {
            btnQuickAdm.addEventListener("click", () => {
                window.open("manager.html", "_blank");
            });
        }

        const btnQuickWipe = document.getElementById("btnQuickWipe");
        if (btnQuickWipe) {
            btnQuickWipe.addEventListener("click", () => this.wipeAllSaveData());
        }

        const dbgWipe = document.getElementById("dbgBtnWipeRestart");
        if (dbgWipe) {
            dbgWipe.addEventListener("click", () => this.wipeAllSaveData());
        }

        // Kingdom building buttons
        document.querySelectorAll("[data-bldg-upgrade]").forEach(btn => {
            btn.addEventListener("click", () => {
                const bldg = btn.dataset.bldgUpgrade;
                if (window.KingdomManager) window.KingdomManager.upgradeBuilding(bldg);
            });
        });

        // Skill Button & Auto-Cast
        const btnCastSkill = document.getElementById("btnCastSkill");
        if (btnCastSkill) {
            btnCastSkill.addEventListener("click", () => api.player.castSkill());
        }

        const chkAutoCast = document.getElementById("chkAutoCast");
        if (chkAutoCast) {
            chkAutoCast.addEventListener("change", (e) => api.player.toggleAutoCast(e.target.checked));
        }

        // Potions Belt & Auto-Potion
        document.querySelectorAll("[data-pot]").forEach(btn => {
            btn.addEventListener("click", () => {
                const potId = btn.dataset.pot;
                api.player.usePotion(potId);
            });
        });

        const chkAutoPotion = document.getElementById("chkAutoPotion");
        if (chkAutoPotion) {
            chkAutoPotion.addEventListener("change", (e) => api.player.toggleAutoPotion(e.target.checked));
        }

        // Rest at Camp Button
        const btnRestCamp = document.getElementById("btnRestCamp");
        if (btnRestCamp) {
            btnRestCamp.addEventListener("click", () => {
                if (window.CombatManager && typeof window.CombatManager.rest === "function") {
                    window.CombatManager.rest();
                }
            });
        }

        // Inventory Category Filter Buttons
        document.querySelectorAll("[data-inv-filter]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.currentInvFilter = btn.dataset.invFilter;
                document.querySelectorAll("[data-inv-filter]").forEach(b => b.classList.toggle("active", b === btn));
                this.renderInventory();
            });
        });

        // Inventory Sort Buttons
        document.querySelectorAll("[data-inv-sort]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.currentInvSort = btn.dataset.invSort;
                document.querySelectorAll("[data-inv-sort]").forEach(b => b.classList.toggle("active", b === btn));
                this.renderInventory();
            });
        });

        // Shop Category Filter Buttons
        document.querySelectorAll("[data-shop-filter]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.currentShopFilter = btn.dataset.shopFilter;
                document.querySelectorAll("[data-shop-filter]").forEach(b => b.classList.toggle("active", b === btn));
                this.renderShop();
            });
        });

        // Claim Offline Modal
        const btnClaimOffline = document.getElementById("btnClaimOffline");
        if (btnClaimOffline) {
            btnClaimOffline.addEventListener("click", () => {
                const modal = document.getElementById("offlineModal");
                if (modal) modal.classList.remove("visible");
            });
        }

        // Onboarding Wizard Navigation & Inputs
        const btnToStep2 = document.getElementById("btnOnboardToStep2");
        if (btnToStep2) {
            btnToStep2.addEventListener("click", () => {
                this.onboardState.step = 2;
                this.renderOnboardingStep();
            });
        }

        const btnBackTo1 = document.getElementById("btnBackToStep1");
        if (btnBackTo1) {
            btnBackTo1.addEventListener("click", () => {
                this.onboardState.step = 1;
                this.renderOnboardingStep();
            });
        }

        const btnRandName = document.getElementById("btnRandomName");
        if (btnRandName) {
            btnRandName.addEventListener("click", () => this.randomizeHeroName());
        }

        const inputHeroName = document.getElementById("onboardHeroName");
        if (inputHeroName) {
            inputHeroName.addEventListener("input", (e) => {
                this.onboardState.name = (e.target.value || "").trim();
            });
        }

        const genderGroup = document.getElementById("genderButtonGroup");
        if (genderGroup) {
            genderGroup.addEventListener("click", (e) => {
                const btn = e.target.closest(".btn-gender");
                if (!btn) return;
                this.onboardState.gender = btn.dataset.gender || "male";
                genderGroup.querySelectorAll(".btn-gender").forEach(b => b.classList.toggle("active", b === btn));
            });
        }

        const btnToStep3 = document.getElementById("btnOnboardToStep3");
        if (btnToStep3) {
            btnToStep3.addEventListener("click", () => {
                if (!this.onboardState.name) this.onboardState.name = "Hero";
                this.onboardState.step = 3;
                this.renderOnboardingStep();
            });
        }

        const btnBackTo2 = document.getElementById("btnBackToStep2");
        if (btnBackTo2) {
            btnBackTo2.addEventListener("click", () => {
                this.onboardState.step = 2;
                this.renderOnboardingStep();
            });
        }

        const btnToStep4 = document.getElementById("btnOnboardToStep4");
        if (btnToStep4) {
            btnToStep4.addEventListener("click", () => {
                this.onboardState.step = 4;
                this.renderOnboardingStep();
            });
        }

        const btnBackTo3 = document.getElementById("btnBackToStep3");
        if (btnBackTo3) {
            btnBackTo3.addEventListener("click", () => {
                this.onboardState.step = 3;
                this.renderOnboardingStep();
            });
        }

        const btnEmbark = document.getElementById("btnOnboardEmbark");
        if (btnEmbark) {
            btnEmbark.addEventListener("click", () => {
                const chosenName = this.onboardState.name || "Hero";
                const chosenGender = this.onboardState.gender || "male";
                const chosenClass = this.onboardState.selectedClass || "knight";
                api.player.completeOnboarding(chosenName, chosenGender, chosenClass);
                this.hideOnboardingModal();
            });
        }

        // Combat Control Strip
        const btnAuto = document.getElementById("btnAutoFight");
        if (btnAuto) {
            btnAuto.addEventListener("click", () => api.combat.toggleAutoFight());
        }

        const btnStrike = document.getElementById("btnManualStrike");
        if (btnStrike) {
            btnStrike.addEventListener("click", () => api.combat.manualStrike());
        }

        // Temple Safe Zone & Modal Actions
        const btnResumeBanner = document.getElementById("btnResumeFromBanner");
        if (btnResumeBanner) {
            btnResumeBanner.addEventListener("click", () => {api.combat.resumeFromTemple()
                console.log("resume battle");
                
            });
        }

        const btnTempleResume = document.getElementById("btnTempleResumeBattle");
        if (btnTempleResume) {
            btnTempleResume.addEventListener("click", () => {
                this.hideTempleModal();
                api.combat.resumeFromTemple();
            });
        }

        const btnTemplePray = document.getElementById("btnTemplePrayHeal");
        if (btnTemplePray) {
            btnTemplePray.addEventListener("click", () => {
                state.player.hp = state.player.maxHp;
                state.notify();
                btnTemplePray.textContent = "✨ Full Health Restored!";
                setTimeout(() => {
                    if (btnTemplePray) btnTemplePray.textContent = "❤️ Pray for Divine Health (+50% HP)";
                }, 2000);
            });
        }

        const btnTempleShop = document.getElementById("btnTempleOpenShop");
        if (btnTempleShop) {
            btnTempleShop.addEventListener("click", () => {
                this.hideTempleModal();
                this.switchTab("shop");
            });
        }

        const btnTempleForge = document.getElementById("btnTempleOpenForge");
        if (btnTempleForge) {
            btnTempleForge.addEventListener("click", () => {
                this.hideTempleModal();
                this.switchTab("inventory");
            });
        }

        // Victory Modal Actions
        const btnVicTravel = document.getElementById("btnVictoryTravel");
        if (btnVicTravel) {
            btnVicTravel.addEventListener("click", () => {
                this.hideVictoryModal();
                if (this.victoryDetails && this.victoryDetails.nextMapId && window.MapManager) {
                    window.MapManager.loadMap(this.victoryDetails.nextMapId);
                }
            });
        }

        const btnVicDeeper = document.getElementById("btnVictoryGoDeeper");
        if (btnVicDeeper) {
            btnVicDeeper.addEventListener("click", () => {
                this.hideVictoryModal();
                if (this.victoryDetails && this.victoryDetails.currentMapId && this.victoryDetails.nextDepthNum) {
                    state.setMapDepth(this.victoryDetails.currentMapId, this.victoryDetails.nextDepthNum);
                    state.combat.stage = 1;
                    if (window.CombatEngine) window.CombatEngine.respawnEnemy();
                    this.updateUI();
                }
            });
        }

        const btnVicStay = document.getElementById("btnVictoryStay");
        if (btnVicStay) {
            btnVicStay.addEventListener("click", () => {
                this.hideVictoryModal();
            });
        }

        // New Game / Reset Hero
        const btnNewHero = document.getElementById("btnNewGame");
        if (btnNewHero) {
            btnNewHero.addEventListener("click", () => {
                if (confirm("👑 Create a new hero and restart the realm journey? Current hero progress will be reset.")) {
                    api.player.resetToNewGame();
                    this.showOnboardingModal();
                }
            });
        }
    },

    switchTab(tabId) {
        this.activeTab = tabId;

        document.querySelectorAll(".nav-tab-btn").forEach(btn => {
            btn.classList.toggle("active", btn.dataset.tab === tabId);
        });

        document.querySelectorAll(".game-tab-page").forEach(page => {
            page.classList.toggle("active", page.id === `tab_${tabId}`);
        });

        this.updateUI();

        if (tabId === "arena" && window.WeatherManager) {
            setTimeout(() => window.WeatherManager.resize(), 50);
        }
    },

    showOfflineModal(report) {
        const modal = document.getElementById("offlineModal");
        if (!modal || !report) return;

        const minutes = Math.floor(report.elapsedSec / 60);
        const hours = (minutes / 60).toFixed(1);
        const timeStr = minutes >= 60 ? `${hours} hours` : `${minutes} minutes`;

        const timeText = document.getElementById("offlineTimeText");
        if (timeText) timeText.textContent = `You were away for ${timeStr}.`;

        const activityEl = document.getElementById("offlineActivityText");
        if (activityEl) {
            activityEl.textContent = report.activityText || (report.wasFighting
                ? `While you were away for ${timeStr}, your hero continued fighting in battle:`
                : `While you were away for ${timeStr}, you trained and looked around the kingdom:`);
        }

        if (document.getElementById("offStatKills")) {
            document.getElementById("offStatKills").textContent = report.kills > 0 ? report.kills.toLocaleString() : "0 (Resting/Idle)";
        }
        if (document.getElementById("offStatGold")) document.getElementById("offStatGold").textContent = `+${report.totalGold.toLocaleString()}g`;
        if (document.getElementById("offStatXp")) document.getElementById("offStatXp").textContent = `+${report.totalXp.toLocaleString()} XP`;
        if (document.getElementById("offStatPots")) document.getElementById("offStatPots").textContent = `+${report.potionsGathered}`;

        const lootBox = document.getElementById("offlineLootBox");
        if (lootBox) {
            lootBox.innerHTML = "";
            if (!report.wasFighting) {
                lootBox.innerHTML = `<em>🌿 No battle loot recovered (Hero was resting & exploring kingdom). Enjoy your peaceful training gains!</em>`;
            } else {
                let lootItems = [];
                for (const [mat, qty] of Object.entries(report.materialsGathered || {})) {
                    if (qty > 0) lootItems.push(`${mat}: +${qty}`);
                }
                (report.gearGathered || []).forEach(g => lootItems.push(`🗡️ ${g}`));

                if (lootItems.length > 0) {
                    lootBox.innerHTML = `<strong>Loot Recovered:</strong> ${lootItems.join(" · ")}`;
                } else {
                    lootBox.innerHTML = `<em>No gear drops discovered during this rest.</em>`;
                }
            }
        }

        modal.classList.add("visible");
    },

    restartGameLoops() {
        if (this.combatLoopId) clearInterval(this.combatLoopId);
        if (this.passiveGoldLoopId) clearInterval(this.passiveGoldLoopId);
        if (this.eventLoopId) clearInterval(this.eventLoopId);
        if (this.saveLoopId) clearInterval(this.saveLoopId);

        const speed = (window.devMode && window.devMode.enabled) ? window.devMode.gameSpeed : 1;
        if (speed <= 0) return;

        const combatInterval = Math.max(50, 1100 / speed);
        const passiveInterval = Math.max(50, 1000 / speed);
        const eventInterval = Math.max(50, 1000 / speed);

        this.combatLoopId = setInterval(() => {
            if (window.CombatManager) window.CombatManager.attackTick();
        }, combatInterval);

        this.passiveGoldLoopId = setInterval(() => {
            const state = window.gameState;
            if (state.guildIncome && state.guildIncome.enabled !== false) {
                const baseRate = (state.guildIncome.goldPerSecond !== undefined) ? state.guildIncome.goldPerSecond : (state.costs.goldPerSecond || 3);
                const upgradeBonus = (state.player.upgrades && state.player.upgrades.income) ? state.player.upgrades.income * 2.5 : 0;
                let gearGps = 0;
                Object.values(state.player.equipment).forEach(item => {
                    if (item && item.stats && item.stats.gold) gearGps += item.stats.gold;
                });
                const treasuryBonus = 1 + (state.kingdom.treasury - 1) * 0.10;
                const actualEarned = Math.floor((baseRate + upgradeBonus + gearGps) * treasuryBonus);
                if (actualEarned > 0) {
                    state.addGold(actualEarned);
                }
            }
        }, passiveInterval);

        this.eventLoopId = setInterval(() => {
            if (window.EventManager) window.EventManager.tickEvent();
            if (window.ScenarioManager) window.ScenarioManager.tickScenario();
        }, eventInterval);

        this.saveLoopId = setInterval(() => {
            window.gameState.save();
        }, 5000);
    },

    updateUI() {
        const state = window.gameState;
        const map = window.MapsData[state.world.currentMapId] || window.MapsData.moonlit_vale;
        const heroDef = window.HeroesData[state.player.heroClass] || window.HeroesData.knight;

        // Player & Resources
        if (document.getElementById("gold")) document.getElementById("gold").textContent = Math.floor(state.player.gold).toLocaleString();
        if (document.getElementById("power")) document.getElementById("power").textContent = state.getEffectiveAttack().toLocaleString();

        const curDepth = state.getMapCurrentDepth ? state.getMapCurrentDepth(map.id) : 1;
        const curTier = state.getDepthTier ? state.getDepthTier(map.id, curDepth) : { roman: "I", subtitle: "" };
        const depthSuffix = curTier.subtitle ? ` (${curTier.subtitle})` : '';

        if (document.getElementById("realm")) document.getElementById("realm").textContent = `${map.roman || 1}.${curTier.roman}`;
        if (document.getElementById("realmName")) document.getElementById("realmName").textContent = `${map.name} ${curTier.roman}${depthSuffix}`;

        if (document.getElementById("heroClassIcon")) document.getElementById("heroClassIcon").textContent = heroDef.icon;
        if (document.getElementById("heroClassName")) document.getElementById("heroClassName").textContent = heroDef.name;

        // Player Level, XP & Health
        if (document.getElementById("playerLevel")) document.getElementById("playerLevel").textContent = state.player.level;
        if (document.getElementById("playerXp")) document.getElementById("playerXp").textContent = state.player.xp.toLocaleString();
        if (document.getElementById("playerXpNext")) document.getElementById("playerXpNext").textContent = state.player.xpToNext.toLocaleString();

        const nameEl = document.getElementById("playerNameDisplay");
        if (nameEl) nameEl.textContent = state.player.name || "Hero";

        const genderEl = document.getElementById("playerGenderDisplay");
        if (genderEl) {
            const g = state.player.gender || "male";
            const icon = g === "female" ? "♀" : (g === "other" ? "⚧" : "♂");
            genderEl.textContent = `· ${icon}`;
        }

        const xpPercent = Math.min(100, Math.max(0, (state.player.xp / state.player.xpToNext) * 100));
        if (document.getElementById("xpFill")) document.getElementById("xpFill").style.width = xpPercent + "%";

        // Update Weather Chip in HUD
        const weatherChip = document.getElementById("hudWeatherChip");
        if (weatherChip) {
            const wId = state.world.currentWeatherId || "clear";
            const wDef = (window.WeatherData && window.WeatherData[wId]) || { name: "Clear Sky", icon: "☀️", playerDmgMult: 1, goldMult: 1 };
            const wIconEl = document.getElementById("hudWeatherIcon");
            const wNameEl = document.getElementById("hudWeatherName");
            const wDetailEl = document.getElementById("hudWeatherDetail");
            const wBadgeEl = document.getElementById("hudWeatherBadge");
            if (wIconEl) wIconEl.textContent = wDef.icon || "☀️";
            if (wNameEl) wNameEl.textContent = wDef.name || "Clear Sky";
            if (wDetailEl) {
                const parts = [];
                if (wDef.goldMult && wDef.goldMult !== 1) parts.push(`Gold x${wDef.goldMult}`);
                if (wDef.playerDmgMult && wDef.playerDmgMult !== 1) parts.push(`Dmg x${wDef.playerDmgMult}`);
                if (wDef.enemyDmgMult && wDef.enemyDmgMult !== 1) parts.push(`Enemy x${wDef.enemyDmgMult}`);
                wDetailEl.textContent = parts.length > 0 ? parts.join(" · ") : "Standard Realm Climate";
            }
            if (wBadgeEl) {
                const mult = wDef.goldMult || wDef.playerDmgMult || 1.0;
                wBadgeEl.textContent = `${mult.toFixed(1)}x`;
                wBadgeEl.className = mult > 1 ? "chip-badge badge-success" : (mult < 1 ? "chip-badge badge-danger" : "chip-badge");
            }
            weatherChip.title = `Weather: ${wDef.name}\nPlayer Dmg: x${wDef.playerDmgMult || 1}\nEnemy Dmg: x${wDef.enemyDmgMult || 1}\nGold: x${wDef.goldMult || 1}`;
        }

        // Update Scenario / Event Chip in HUD
        const scenChip = document.getElementById("hudScenarioChip");
        if (scenChip) {
            const scId = state.world.activeScenarioId;
            const evId = state.world.activeEventId;
            const scDef = (scId && window.ScenariosData) ? window.ScenariosData[scId] : null;
            const evDef = (evId && window.EventsData) ? window.EventsData[evId] : null;

            const scIconEl = document.getElementById("hudScenarioIcon");
            const scNameEl = document.getElementById("hudScenarioName");
            const scDetailEl = document.getElementById("hudScenarioDetail");
            const scBadgeEl = document.getElementById("hudScenarioBadge");

            scenChip.classList.remove("active-cataclysm", "active-fortune", "active-celestial");

            if (scDef) {
                if (scIconEl) scIconEl.textContent = scDef.name.includes("BLACK MOON") ? "🌑" : (scDef.name.includes("RAIN") ? "🌧️" : (scDef.name.includes("TITAN") ? "⚡" : "🔥"));
                if (scNameEl) scNameEl.textContent = scDef.name;
                const mods = scDef.modifiers || {};
                if (scDetailEl) scDetailEl.textContent = `HP x${mods.enemyHpMult || 1} · Drops x${mods.dropMult || 1} · Gold x${mods.goldMult || 1}`;
                if (scBadgeEl) {
                    scBadgeEl.textContent = "CALAMITY";
                    scBadgeEl.className = "chip-badge badge-danger";
                }
                scenChip.classList.add(scDef.name.includes("RAIN") ? "active-fortune" : (scDef.name.includes("TITAN") ? "active-celestial" : "active-cataclysm"));
                scenChip.title = `Active Scenario: ${scDef.name}\n${scDef.description || ''}`;
            } else if (evDef) {
                if (scIconEl) scIconEl.textContent = evDef.icon || "⚡";
                if (scNameEl) scNameEl.textContent = evDef.name;
                if (scDetailEl) scDetailEl.textContent = `Drops x${evDef.dropMult || 1} · Gold x${evDef.goldMult || 1}`;
                if (scBadgeEl) {
                    scBadgeEl.textContent = "EVENT";
                    scBadgeEl.className = "chip-badge badge-success";
                }
                scenChip.classList.add(evDef.name.includes("Rain") ? "active-fortune" : "active-cataclysm");
                scenChip.title = `World Event: ${evDef.name}\n${evDef.description || ''}`;
            } else {
                if (scIconEl) scIconEl.textContent = "✨";
                if (scNameEl) scNameEl.textContent = "Peaceful Realm";
                if (scDetailEl) scDetailEl.textContent = "Standard Monster Encounters";
                if (scBadgeEl) {
                    scBadgeEl.textContent = "Active";
                    scBadgeEl.className = "chip-badge";
                }
                scenChip.title = "No active world calamities. Standard realm parameters apply.";
            }
        }

        // Arena Stage Tracker Bar
        const stageRealmEl = document.getElementById("arenaRealmName");
        if (stageRealmEl) stageRealmEl.textContent = `${map.name} ${curTier.roman}`;

        const stageNumEl = document.getElementById("arenaStageNum");
        if (stageNumEl) stageNumEl.textContent = state.combat.stage || 1;

        const stageFillEl = document.getElementById("stageProgressFill");
        if (stageFillEl) {
            const pct = Math.min(100, Math.max(10, ((state.combat.stage || 1) / 10) * 100));
            stageFillEl.style.width = pct + "%";
        }

        const bossBadgeEl = document.getElementById("arenaBossBadge");
        if (bossBadgeEl) {
            bossBadgeEl.classList.toggle("active", (state.combat.stage || 1) >= 10);
            bossBadgeEl.textContent = (state.combat.stage || 1) >= 10 ? "⚠️ BOSS BATTLE!" : "👑 BOSS AT STAGE 10";
        }

        // Autofight Button State
        const btnAuto = document.getElementById("btnAutoFight");
        const autoTxt = document.getElementById("autoFightStatusText");
        if (btnAuto && autoTxt) {
            if (state.combat.autoFight) {
                btnAuto.classList.add("active");
                autoTxt.textContent = "AUTOFIGHT [ON]";
            } else {
                btnAuto.classList.remove("active");
                autoTxt.textContent = "AUTOFIGHT [OFF]";
            }
        }

        // Temple Safe Zone Banner
        const templeBanner = document.getElementById("templeSafeBanner");
        if (templeBanner) {
            templeBanner.style.display = state.combat.inTemple ? "flex" : "none";
        }

        // Hero HP Sync
        const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : state.player.maxHp;
        if (state.player.hp > effMaxHp) state.player.hp = effMaxHp;

        const currentHp = Math.max(0, Math.floor(state.player.hp));
        const holyShield = Math.floor(state.player.holyShield || 0);

        if (document.getElementById("playerHpCard")) document.getElementById("playerHpCard").textContent = currentHp.toLocaleString();
        if (document.getElementById("playerMaxHpCard")) document.getElementById("playerMaxHpCard").textContent = Math.floor(effMaxHp).toLocaleString();
        if (document.getElementById("playerHpText")) {
            document.getElementById("playerHpText").textContent = holyShield > 0 ? `${currentHp.toLocaleString()} (+${holyShield.toLocaleString()}🛡️)` : currentHp.toLocaleString();
        }
        if (document.getElementById("playerMaxHpText")) document.getElementById("playerMaxHpText").textContent = Math.floor(effMaxHp).toLocaleString();

        const playerHpPct = Math.max(0, Math.min(100, (state.player.hp / effMaxHp) * 100));
        if (document.getElementById("playerHpFill")) document.getElementById("playerHpFill").style.width = playerHpPct + "%";

        const shieldPct = Math.max(0, Math.min(100, (holyShield / effMaxHp) * 100));
        const shieldEl = document.getElementById("playerShieldFill");
        if (shieldEl) {
            shieldEl.style.width = shieldPct + "%";
            shieldEl.style.display = shieldPct > 0 ? "block" : "none";
        }

        // Stats Breakdown Strip
        if (document.getElementById("statDefense")) document.getElementById("statDefense").textContent = state.getEffectiveDefense();
        if (document.getElementById("statCrit")) document.getElementById("statCrit").textContent = Math.round(state.getEffectiveCritChance() * 100) + "%";
        if (document.getElementById("statDodge")) document.getElementById("statDodge").textContent = Math.round(state.getEffectiveDodge() * 100) + "%";
        if (document.getElementById("statLifesteal")) document.getElementById("statLifesteal").textContent = Math.round(state.getEffectiveLifesteal() * 100) + "%";

        // Fatigue Stat Badge
        const fatigue = state.getFatigue ? state.getFatigue() : (state.player.fatigue || 0);
        const fatigueStatus = state.getFatigueStatus ? state.getFatigueStatus() : { label: "Fresh", color: "#4ade80" };
        const fEl = document.getElementById("statFatigue");
        const fLbl = document.getElementById("statFatigueLabel");
        const fBadge = document.getElementById("fatigueStatBadge");
        if (fEl) fEl.textContent = `${Math.floor(fatigue)}%`;
        if (fLbl) {
            fLbl.textContent = fatigueStatus.label;
            fLbl.style.color = fatigueStatus.color;
        }
        if (fBadge) {
            fBadge.style.borderColor = fatigue >= 75 ? "#ef4444" : (fatigue >= 50 ? "#f59e0b" : "rgba(255,255,255,0.12)");
            fBadge.title = `Current Fatigue: ${Math.floor(fatigue)}% (${fatigueStatus.label}). Combat damage penalty: -${Math.round((1 - (state.getFatigueMultiplier ? state.getFatigueMultiplier() : 1)) * 100)}%. Pitch camp or drink Stamina Tonics to recover.`;
        }

        // Pitch Camp Rest Button
        const btnRest = document.getElementById("btnRestCamp");
        if (btnRest) {
            const restCd = (window.CombatManager && window.CombatManager.restCooldown) ? window.CombatManager.restCooldown : 0;
            if (restCd > 0) {
                btnRest.textContent = `⛺ Rest (${restCd}s)`;
                btnRest.disabled = true;
            } else if (fatigue <= 0 && state.player.hp >= effMaxHp) {
                btnRest.textContent = `⛺ Rest (Camp)`;
                btnRest.disabled = true;
                btnRest.title = "Hero is fully refreshed and at maximum HP.";
            } else {
                btnRest.textContent = `⛺ Rest (Camp)`;
                btnRest.disabled = false;
                btnRest.title = "Pitch Camp & Rest: Recovers 60 Fatigue and 50% HP (30s Cooldown)";
            }
        }

        // Active Combat Skill Bar
        const activeSkill = state.getActiveSkill ? state.getActiveSkill() : heroDef.skill;
        if (activeSkill) {
            if (document.getElementById("skillIcon")) document.getElementById("skillIcon").textContent = activeSkill.icon;
            if (document.getElementById("skillName")) document.getElementById("skillName").textContent = activeSkill.name;
            const lvStr = activeSkill.level ? ` (Lv. ${activeSkill.level})` : '';
            if (document.getElementById("skillDesc")) document.getElementById("skillDesc").textContent = `${Math.round(activeSkill.damageMult * 100)}% Dmg${lvStr} · ${activeSkill.cooldown}s CD`;

            const cdBadge = document.getElementById("skillCdBadge");
            const btnSkill = document.getElementById("btnCastSkill");
            if (cdBadge && btnSkill) {
                if (state.player.skills.activeCooldown > 0) {
                    cdBadge.textContent = `${state.player.skills.activeCooldown}s`;
                    cdBadge.classList.add("cooldown");
                    btnSkill.disabled = true;
                } else {
                    cdBadge.textContent = "READY";
                    cdBadge.classList.remove("cooldown");
                    btnSkill.disabled = false;
                }
            }
        }

        // Potions Belt Counts
        if (state.player.potions) {
            if (document.getElementById("potCount_minor")) document.getElementById("potCount_minor").textContent = `x${state.player.potions.potion_minor || 0}`;
            if (document.getElementById("potCount_major")) document.getElementById("potCount_major").textContent = `x${state.player.potions.potion_major || 0}`;
            if (document.getElementById("potCount_full")) document.getElementById("potCount_full").textContent = `x${state.player.potions.potion_full || 0}`;
            if (document.getElementById("potCount_stamina")) document.getElementById("potCount_stamina").textContent = `x${state.player.potions.potion_stamina || 0}`;
        }

        const chkAutoPot = document.getElementById("chkAutoPotion");
        if (chkAutoPot) chkAutoPot.checked = !!state.player.autoPotion;

        const chkAutoCast = document.getElementById("chkAutoCast");
        if (chkAutoCast) chkAutoCast.checked = !!state.player.skills.autoCast;

        // Active Buffs Strip
        const buffsStrip = document.getElementById("activeBuffsStrip");
        if (buffsStrip) {
            buffsStrip.innerHTML = "";
            (state.player.activeBuffs || []).forEach(b => {
                const bEl = document.createElement("div");
                bEl.className = "buff-badge";
                bEl.innerHTML = `✨ <strong>${b.name}</strong> [${b.duration}s]`;
                buffsStrip.appendChild(bEl);
            });
        }

        // Active Mob rendering
        const mob = state.combat.currentMob;
        if (mob) {
            if (document.getElementById("enemy")) document.getElementById("enemy").textContent = mob.icon;
            if (document.getElementById("enemyName")) document.getElementById("enemyName").textContent = mob.name;

            const enemyTypeEl = document.querySelector(".enemy-type");
            if (enemyTypeEl) {
                enemyTypeEl.textContent = `LVL ${mob.level} · ${mob.type} ${mob.phaseText ? "· " + mob.phaseText : ""}`;
            }

            if (document.getElementById("hp")) document.getElementById("hp").textContent = Math.max(0, Math.floor(mob.hp)).toLocaleString();
            if (document.getElementById("maxHp")) document.getElementById("maxHp").textContent = Math.floor(mob.maxHp).toLocaleString();

            const hpPercent = Math.max(0, (mob.hp / mob.maxHp) * 100);
            if (document.getElementById("healthFill")) document.getElementById("healthFill").style.width = hpPercent + "%";
        }

        // Equipment Slots
        ["weapon", "armor", "ring", "crown"].forEach(slot => {
            const el = document.getElementById(`eqSlot_${slot}`);
            if (el) {
                const item = state.player.equipment[slot] || (slot === "ring" ? (state.player.equipment.ring || state.player.equipment.trinket) : null);
                if (item) {
                    const upgStr = item.upgradeLevel ? ` <span class="eq-upg">+${item.upgradeLevel}</span>` : "";
                    let timerStr = "";
                    if (slot === "crown" && window.CrownManager) {
                        const rem = window.CrownManager.getCrownRemainingSeconds(item);
                        timerStr = ` <span class="eq-timer" data-crown-instance="${item.instanceId}">(${window.CrownManager.formatCrownTime(rem)})</span>`;
                    }
                    el.innerHTML = `<span class="eq-icon">${item.icon}</span> <span class="eq-name ${item.rarity}">${item.name}${upgStr}${timerStr}</span>`;
                    el.onclick = () => {
                        this.selectedInventoryItemInstanceId = item.instanceId;
                        this.switchTab("inventory");
                    };
                } else {
                    el.innerHTML = `<span class="eq-empty">Empty ${slot.charAt(0).toUpperCase() + slot.slice(1)}</span>`;
                    el.onclick = null;
                }
            }
        });

        // Kingdom Buildings UI
        const kingdomUnlocked = state.isKingdomDomainUnlocked ? state.isKingdomDomainUnlocked() : true;
        const kingdomLockedState = document.getElementById("kingdomLockedState");
        const kingdomUnlockedState = document.getElementById("kingdomUnlockedState");
        const kingdomStatusTag = document.getElementById("kingdomStatusTag");

        if (kingdomLockedState && kingdomUnlockedState) {
            if (!kingdomUnlocked) {
                kingdomLockedState.style.display = "block";
                kingdomUnlockedState.style.display = "none";
                if (kingdomStatusTag) {
                    kingdomStatusTag.textContent = "🔒 ROYAL CHARTER LOCKED";
                    kingdomStatusTag.style.color = "#ff4d6d";
                }

                const heroLvl = state.player.level || 1;
                const lvlMet = heroLvl >= 5;
                const bossMet = !!state.player.moonlitVale3Cleared ||
                                (state.world.unlockedMaps && state.world.unlockedMaps.includes("ashen_wastes")) ||
                                (state.getMapMaxUnlockedDepth && state.getMapMaxUnlockedDepth("moonlit_vale") > 3);

                const reqLvlEl = document.getElementById("reqKingdomLevel");
                const lblLvlEl = document.getElementById("lblKingdomLevel");
                if (reqLvlEl && lblLvlEl) {
                    reqLvlEl.className = `charter-req-chip ${lvlMet ? 'met' : 'unmet'}`;
                    lblLvlEl.textContent = `Lv. ${heroLvl} / 5 ${lvlMet ? '✓' : ''}`;
                }

                const reqBossEl = document.getElementById("reqKingdomBoss");
                const lblBossEl = document.getElementById("lblKingdomBoss");
                if (reqBossEl && lblBossEl) {
                    reqBossEl.className = `charter-req-chip ${bossMet ? 'met' : 'unmet'}`;
                    lblBossEl.textContent = bossMet ? 'Vanquished ✓' : 'Awaiting Battle';
                }
            } else {
                kingdomLockedState.style.display = "none";
                kingdomUnlockedState.style.display = "block";
                if (kingdomStatusTag) {
                    kingdomStatusTag.textContent = "👑 SOVEREIGN DOMAIN";
                    kingdomStatusTag.style.color = "#f2c94c";
                }
            }
        }

        ["castle", "treasury", "blacksmith", "mageTower", "barracks"].forEach(bldg => {
            const lvlEl = document.getElementById(`bldgLvl_${bldg}`);
            const costEl = document.getElementById(`bldgCost_${bldg}`);
            const btnEl = document.getElementById(`btnBldg_${bldg}`);

            if (lvlEl) lvlEl.textContent = state.kingdom[bldg];
            if (window.KingdomManager && costEl) {
                const cost = window.KingdomManager.getBuildingCost(bldg);
                costEl.textContent = "✦ " + cost.toLocaleString();
                if (btnEl) btnEl.disabled = !kingdomUnlocked || !state.canAfford(cost);
            }
        });

        // Dynamic Quests UI
        const questsListEl = document.getElementById("questsList");
        if (questsListEl && state.quests.active) {
            questsListEl.innerHTML = "";
            state.quests.active.forEach(q => {
                const qEl = document.createElement("div");
                qEl.className = `quest-card ${q.completed ? "completed" : ""}`;
                qEl.innerHTML = `
                    <div class="quest-title">${q.title}</div>
                    <div class="quest-progress">${q.current} / ${q.required}</div>
                    ${q.completed ? `<button class="btn-claim-quest" onclick="window.QuestManager.claimReward('${q.id}')">CLAIM (+${q.rewardGold}g, +${q.rewardXp}xp)</button>` : ''}
                `;
                questsListEl.appendChild(qEl);
            });
        }

        // Costs & Upgrade Buttons
        if (document.getElementById("damageCost")) document.getElementById("damageCost").textContent = "✦ " + state.costs.damageCost.toLocaleString();
        if (document.getElementById("incomeCost")) document.getElementById("incomeCost").textContent = "✦ " + state.costs.incomeCost.toLocaleString();
        if (document.getElementById("realmCost")) document.getElementById("realmCost").textContent = "✦ " + state.costs.realmCost.toLocaleString();

        // Adventurer's Guild Stipend Pill
        const guildPill = document.getElementById("guildIncomePill");
        if (guildPill) {
            if (state.guildIncome && state.guildIncome.enabled === false) {
                guildPill.textContent = "+0/s (Off)";
            } else {
                const baseRate = (state.guildIncome && state.guildIncome.goldPerSecond !== undefined) ? state.guildIncome.goldPerSecond : (state.costs.goldPerSecond || 3);
                const upgradeBonus = (state.player.upgrades && state.player.upgrades.income) ? state.player.upgrades.income * 2.5 : 0;
                let gearGps = 0;
                Object.values(state.player.equipment).forEach(item => {
                    if (item && item.stats && item.stats.gold) gearGps += item.stats.gold;
                });
                const treasuryBonus = 1 + (state.kingdom.treasury - 1) * 0.10;
                const totalRate = Math.floor((baseRate + upgradeBonus + gearGps) * treasuryBonus);
                guildPill.textContent = `+${totalRate}/s`;
            }
        }

        // Temple Banner Text
        const templeBannerTxt = document.getElementById("templeBannerText");
        if (templeBannerTxt && state.combat.inTemple) {
            if (state.lastTempleDonation > 0) {
                templeBannerTxt.textContent = `Resting safely at the Temple (50% HP). An offering of ${state.lastTempleDonation} gold was tithed to the sanctuary altar. Prepare your gear, then click Resume.`;
            } else {
                templeBannerTxt.textContent = `Resting safely at the Temple (50% HP). Priests have mended your wounds with divine grace. Prepare your gear, then click Resume.`;
            }
        }

        // Realm Navigation (Previous & Fast Travel Chips)
        const btnPrev = document.getElementById("btnPrevRealm");
        if (btnPrev) {
            const curMap = window.MapsData[state.world.currentMapId];
            btnPrev.disabled = (!curMap || curMap.realmIndex <= 1);
        }

        const chipsContainer = document.getElementById("unlockedRealmsChips");
        if (chipsContainer && window.MapsData) {
            chipsContainer.innerHTML = "";
            const unlocked = state.world.unlockedMaps || ["moonlit_vale"];
            unlocked.forEach(mId => {
                const mDef = window.MapsData[mId];
                if (!mDef) return;
                const chip = document.createElement("button");
                chip.type = "button";
                const isCurrent = (mId === state.world.currentMapId);
                chip.className = `realm-chip ${isCurrent ? 'active-chip' : ''}`;
                chip.innerHTML = `${mDef.name} [Realm ${mDef.roman}] ${isCurrent ? '✓' : ''}`;
                if (!isCurrent) {
                    chip.addEventListener("click", () => {
                        if (window.MapManager) window.MapManager.loadMap(mId);
                    });
                }
                chipsContainer.appendChild(chip);
            });
        }

        const depthChipsContainer = document.getElementById("mapDepthChips");
        if (depthChipsContainer && window.MapsData) {
            depthChipsContainer.innerHTML = "";
            const curMapId = state.world.currentMapId;
            const curMapDef = window.MapsData[curMapId];
            const maxUnlockedDepth = state.getMapMaxUnlockedDepth(curMapId);
            const activeDepth = state.getMapCurrentDepth(curMapId);
            const depthTiers = (curMapDef && curMapDef.depthTiers) || [
                { depth: 1, roman: "I", subtitle: "Fringe Clearing" },
                { depth: 2, roman: "II", subtitle: "Deep Thicket" },
                { depth: 3, roman: "III", subtitle: "Heart" }
            ];

            for (let d = 1; d <= maxUnlockedDepth; d++) {
                const tier = depthTiers.find(t => t.depth === d) || { depth: d, roman: `${d}`, subtitle: `Tier ${d}` };
                const chip = document.createElement("button");
                chip.type = "button";
                const isCurrent = (d === activeDepth);
                chip.className = `map-depth-chip ${isCurrent ? 'active' : ''}`;
                chip.innerHTML = `<strong>${tier.roman}</strong> · ${tier.subtitle} ${isCurrent ? '⚔' : ''}`;
                chip.title = isCurrent ? `Currently delving in Tier ${tier.roman}` : `Delve into ${curMapDef ? curMapDef.name : ''} Tier ${tier.roman} (${tier.subtitle})`;
                if (!isCurrent) {
                    chip.addEventListener("click", () => {
                        state.setMapDepth(curMapId, d);
                        this.updateUI();
                    });
                }
                depthChipsContainer.appendChild(chip);
            }
        }

        if (document.getElementById("damageUpgrade")) document.getElementById("damageUpgrade").disabled = !state.canAfford(state.costs.damageCost);
        if (document.getElementById("incomeUpgrade")) document.getElementById("incomeUpgrade").disabled = !state.canAfford(state.costs.incomeCost);
        if (document.getElementById("nextRealm")) document.getElementById("nextRealm").disabled = !state.canAfford(state.costs.realmCost);

        // Render Page-Specific Views
        if (this.activeTab === "character") this.renderCharacterView();
        if (this.activeTab === "inventory") this.renderInventoryView();
        if (this.activeTab === "shop") this.renderShop();

        // Sync Dev Panel UI if open
        if (window.DevPanel) window.DevPanel.syncUI();
    },

    renderCharacterView() {
        const state = window.gameState;
        const heroDef = window.HeroesData[state.player.heroClass] || window.HeroesData.knight;

        if (document.getElementById("charSheetIcon")) document.getElementById("charSheetIcon").textContent = heroDef.icon;
        if (document.getElementById("charSheetName")) document.getElementById("charSheetName").textContent = `${heroDef.name} (Lv. ${state.player.level})`;
        if (document.getElementById("charSheetDesc")) document.getElementById("charSheetDesc").textContent = heroDef.description;
        if (document.getElementById("charSheetPerks")) document.getElementById("charSheetPerks").textContent = `Class Perk: ${heroDef.perks || "None"}`;

        const updateStatDisplay = (id, statKey, fallbackVal) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (state.getStatBreakdown) {
                const b = state.getStatBreakdown(statKey);
                el.textContent = b.displayStr;
                el.title = b.tooltip;
                if (b.gearItems.length > 0 || b.passives > 0 || b.promotions > 0 || b.upgrades > 0) {
                    el.classList.add("has-breakdown");
                } else {
                    el.classList.remove("has-breakdown");
                }
            } else {
                el.textContent = fallbackVal;
            }
        };

        updateStatDisplay("charStatAttack", "attack", state.getEffectiveAttack().toLocaleString());
        updateStatDisplay("charStatDefense", "defense", state.getEffectiveDefense().toLocaleString());
        updateStatDisplay("charStatCrit", "critChance", Math.round(state.getEffectiveCritChance() * 100) + "%");
        if (document.getElementById("charStatCritDmg")) document.getElementById("charStatCritDmg").textContent = `${state.player.critDmg}x`;
        updateStatDisplay("charStatDodge", "dodge", Math.round(state.getEffectiveDodge() * 100) + "%");
        updateStatDisplay("charStatLifesteal", "lifesteal", Math.round(state.getEffectiveLifesteal() * 100) + "%");

        const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : state.player.maxHp;
        const hpEl = document.getElementById("charStatHp");
        if (hpEl) {
            if (state.getStatBreakdown) {
                const bHp = state.getStatBreakdown("maxHp");
                hpEl.textContent = `${Math.floor(state.player.hp)} / ${bHp.displayStr}`;
                hpEl.title = `Current HP: ${Math.floor(state.player.hp)}  |  ${bHp.tooltip}`;
                hpEl.classList.add("has-breakdown");
            } else {
                hpEl.textContent = `${Math.floor(state.player.hp)} / ${Math.floor(effMaxHp)}`;
            }
        }
        if (document.getElementById("charStatGps")) {
            const baseRate = (state.guildIncome && state.guildIncome.goldPerSecond !== undefined) ? state.guildIncome.goldPerSecond : (state.costs.goldPerSecond || 3);
            const upgradeBonus = (state.player.upgrades && state.player.upgrades.income) ? state.player.upgrades.income * 2.5 : 0;
            let gearGps = 0;
            Object.values(state.player.equipment).forEach(item => {
                if (item && item.stats && item.stats.gold) gearGps += item.stats.gold;
            });
            const treasuryBonus = 1 + (state.kingdom.treasury - 1) * 0.10;
            const totalRate = Math.floor((baseRate + upgradeBonus + gearGps) * treasuryBonus);
            document.getElementById("charStatGps").textContent = `${totalRate}g / sec`;
        }

        // Render Class Promotion & Ascension Card
        const promoCard = document.getElementById("classPromotionCard");
        if (promoCard && state.getNextClassPromotion) {
            const curClass = state.player.heroClass;
            const curRank = state.getClassRank(curClass);
            const nextPromo = state.getNextClassPromotion(curClass);
            const check = state.canPromoteClass(curClass);
            const heroDef = (window.HeroesData && window.HeroesData[curClass]) || { name: "Hero" };

            if (!nextPromo) {
                promoCard.innerHTML = `
                    <div class="promo-header">
                        <span class="promo-trophy">👑</span>
                        <div>
                            <h4>Pinnacle Vocation Mastered (Rank ${curRank})</h4>
                            <p class="muted">You have attained the pinnacle of ${heroDef.name} mastery. All class rank attributes and perks are maximized.</p>
                        </div>
                    </div>
                `;
            } else {
                const reqLvMet = (state.player.level || 1) >= nextPromo.reqLevel;
                const goldMet = state.canAfford(nextPromo.goldCost || 0);

                let matsHtml = '';
                if (nextPromo.materials) {
                    matsHtml = Object.entries(nextPromo.materials).map(([mat, need]) => {
                        const have = (state.player.materials && state.player.materials[mat]) || 0;
                        const ok = have >= need;
                        const matLabels = {
                            ironOre: "⛏️ Iron Ore",
                            wood: "🪵 Hardwood",
                            crystal: "💎 Crystal",
                            dragonScale: "🐉 Dragon Scale",
                            shadowEssence: "🔮 Shadow Essence"
                        };
                        const label = matLabels[mat] || mat;
                        return `<div class="promo-req-item ${ok ? 'met' : 'unmet'}">
                            <span>${label}:</span> <strong>${have} / ${need}</strong> <span class="req-icon">${ok ? '✓' : '✗'}</span>
                        </div>`;
                    }).join('');
                }

                let bonusStatsHtml = '';
                const bStats = nextPromo.bonusStats || nextPromo.bonus;
                if (bStats) {
                    bonusStatsHtml = Object.entries(bStats).map(([st, val]) => {
                        const statLabels = {
                            attack: "⚔ Attack",
                            defense: "🛡 Defense",
                            hp: "❤ Max HP",
                            maxHp: "❤ Max HP",
                            critChance: "🎯 Crit Rate",
                            dodge: "💨 Dodge",
                            lifesteal: "🩸 Lifesteal"
                        };
                        const isPct = st.toLowerCase().includes('crit') || st.toLowerCase().includes('dodge') || st.toLowerCase().includes('lifesteal');
                        const displayVal = (typeof val === 'number' && isPct && val < 1) ? `+${Math.round(val * 100)}%` : (isPct ? `+${val}%` : `+${val}`);
                        return `<span class="promo-stat-pill">${statLabels[st] || st}: ${displayVal}</span>`;
                    }).join(' ');
                }

                promoCard.innerHTML = `
                    <div class="promo-header">
                        <span class="promo-badge">Rank ${curRank} ➜ ${nextPromo.rank}</span>
                        <div>
                            <h4>${nextPromo.title} <small style="color:var(--gold); font-size:12px;">(Rank ${nextPromo.rank} Milestone)</small></h4>
                            <p class="muted" style="margin:2px 0 0; font-size:13px;">${nextPromo.description || 'Ascend vocation to gain powerful permanent attributes.'}</p>
                        </div>
                    </div>

                    <div class="promo-body">
                        <div class="promo-section">
                            <span class="promo-section-title">PERMANENT STAT BONUSES:</span>
                            <div class="promo-stats-row">${bonusStatsHtml || '<span class="muted">Enhanced combat mastery</span>'}</div>
                        </div>

                        <div class="promo-section">
                            <span class="promo-section-title">ASCENSION REQUIREMENTS:</span>
                            <div class="promo-req-grid">
                                <div class="promo-req-item ${reqLvMet ? 'met' : 'unmet'}">
                                    <span>Hero Level:</span> <strong>Lv. ${state.player.level} / ${nextPromo.reqLevel}</strong> <span class="req-icon">${reqLvMet ? '✓' : '✗'}</span>
                                </div>
                                <div class="promo-req-item ${goldMet ? 'met' : 'unmet'}">
                                    <span>Gold:</span> <strong>${(nextPromo.goldCost || 0).toLocaleString()}g</strong> <span class="req-icon">${goldMet ? '✓' : '✗'}</span>
                                </div>
                                ${matsHtml}
                            </div>
                        </div>

                        <div class="promo-actions">
                            <button type="button" class="btn btn-gold btn-promote" id="btnPromoteClass" ${check.can ? '' : 'disabled'}>
                                ${check.can ? `⭐ Ascend to ${nextPromo.title}` : `🔒 Locked (${check.reason})`}
                            </button>
                        </div>
                    </div>
                `;

                const btnPromote = document.getElementById("btnPromoteClass");
                if (btnPromote && check.can) {
                    btnPromote.addEventListener("click", () => {
                        const ok = state.promoteClass(curClass);
                        if (ok) {
                            this.renderCharacterView();
                            this.updateUI();
                        }
                    });
                }
            }
        }

        // Render Class Hall Picker Cards
        const grid = document.getElementById("classesGrid");
        if (grid && window.HeroesData) {
            grid.innerHTML = "";
            Object.values(window.HeroesData).forEach(h => {
                const isCurrent = (state.player.heroClass === h.id);
                const isUnlocked = h.unlocked !== false;

                const card = document.createElement("div");
                card.className = `class-card ${isCurrent ? "current" : ""} ${!isUnlocked ? "locked" : ""}`;
                card.innerHTML = `
                    <div class="class-card-header">
                        <span class="class-card-icon">${h.icon}</span>
                        <div>
                            <h4>${h.name}</h4>
                            <small>${h.description}</small>
                        </div>
                    </div>
                    <div class="class-card-stats">
                        <span>⚔️ Atk: ${h.baseAttack}</span>
                        <span>🛡️ Def: ${h.baseDefense}</span>
                        <span>🎯 Crit: ${Math.round(h.baseCritChance * 100)}%</span>
                        <span>💨 Dodge: ${Math.round(h.baseDodge * 100)}%</span>
                    </div>
                    ${h.skill ? `<div class="class-card-skill"><strong>Skill:</strong> ${h.skill.name} (${h.skill.description})</div>` : ''}
                    <button class="btn-select-class ${isCurrent ? 'selected' : ''}" ${isCurrent || !isUnlocked ? 'disabled' : ''} onclick="window.GameAPI.player.setHeroClass('${h.id}')">
                        ${isCurrent ? 'ACTIVE CLASS' : isUnlocked ? 'SELECT CLASS' : 'LOCKED BY ADMIN'}
                    </button>
                `;
                grid.appendChild(card);
            });
        }

        // Render Special Skills & Ability Mastery Center
        this.renderSpecialSkills();

        // Render Divine Blessings & Passives ("Blessed by the Gods")
        this.renderDivineBlessings();
    },

    renderSpecialSkills() {
        const upgradeCenter = document.getElementById("skillUpgradeCenter");
        const arsenalGrid = document.getElementById("skillArsenalGrid");
        const headerTag = document.getElementById("specialSkillsHeaderTag");
        if (!upgradeCenter || !arsenalGrid) return;

        const state = window.gameState;
        const heroDef = (window.HeroesData && window.HeroesData[state.player.heroClass]) || window.HeroesData.knight;
        const activeSkill = state.getActiveSkill ? state.getActiveSkill() : heroDef.skill;
        const activeSkillId = state.getActiveSkillId ? state.getActiveSkillId() : (activeSkill ? activeSkill.id : null);
        const curLevel = state.getSkillLevel ? state.getSkillLevel(activeSkillId) : 1;
        const nextStats = (state.getSkillEffectiveStats && activeSkillId) ? state.getSkillEffectiveStats(activeSkillId, curLevel + 1) : null;
        const upgradeCost = (state.getSkillUpgradeCost && activeSkillId) ? state.getSkillUpgradeCost(activeSkillId) : null;
        const canUpgrade = (state.canUpgradeSkill && activeSkillId) ? state.canUpgradeSkill(activeSkillId) : { can: false, reason: "N/A" };

        if (headerTag) {
            headerTag.textContent = `${heroDef.name.toUpperCase()} SPECIAL SKILLS`;
        }

        // 1. Render Active Skill Upgrade Center
        if (activeSkill && upgradeCost && nextStats) {
            let matsChipsHtml = "";
            if (upgradeCost.materials) {
                const matLabels = {
                    ironOre: "⛏️ Iron",
                    wood: "🪵 Wood",
                    crystal: "💎 Crystal",
                    dragonScale: "🐉 Dragon Scale",
                    shadowEssence: "🔮 Shadow Essence"
                };
                matsChipsHtml = Object.entries(upgradeCost.materials).map(([mat, need]) => {
                    const have = (state.player.materials && state.player.materials[mat]) || 0;
                    const ok = have >= need;
                    return `<span class="skill-cost-chip ${ok ? 'ok' : 'missing'}">${matLabels[mat] || mat}: ${have}/${need}</span>`;
                }).join(" ");
            }

            const goldOk = state.canAfford(upgradeCost.gold);
            const goldChip = `<span class="skill-cost-chip ${goldOk ? 'ok' : 'missing'}">💰 ${upgradeCost.gold.toLocaleString()}g</span>`;

            const dmgDiff = Math.round((nextStats.damageMult - activeSkill.damageMult) * 100);
            const cdDiff = (activeSkill.cooldown - nextStats.cooldown).toFixed(1);

            let bonusNotes = "";
            if (activeSkill.healPct) {
                bonusNotes += ` · ❤️ Heals ${Math.round(activeSkill.healPct * 100)}% HP`;
            }
            if (activeSkill.buff) {
                bonusNotes += ` · ✨ Grants ${activeSkill.buff.name || 'Buff'}`;
            }

            upgradeCenter.innerHTML = `
                <div class="skill-active-hero-box">
                    <div class="skill-active-info-col">
                        <div class="skill-active-big-icon">${activeSkill.icon}</div>
                        <div class="skill-active-title-block">
                            <h3>${activeSkill.name} <span class="skill-lv-badge">Mastery Lv. ${curLevel}</span></h3>
                            <p class="skill-active-desc">${activeSkill.description}${bonusNotes}</p>
                        </div>
                    </div>
                </div>

                <div class="skill-stats-compare-grid">
                    <div class="skill-stat-box">
                        <div class="skill-stat-lbl">Damage Multiplier</div>
                        <div class="skill-stat-val">
                            ${Math.round(activeSkill.damageMult * 100)}%
                            <span class="skill-stat-next">➜ ${Math.round(nextStats.damageMult * 100)}% (+${dmgDiff}%)</span>
                        </div>
                    </div>
                    <div class="skill-stat-box">
                        <div class="skill-stat-lbl">Ability Cooldown</div>
                        <div class="skill-stat-val">
                            ${activeSkill.cooldown}s
                            <span class="skill-stat-next">➜ ${nextStats.cooldown}s (-${cdDiff}s)</span>
                        </div>
                    </div>
                </div>

                <div class="skill-upgrade-footer">
                    <div class="skill-upgrade-cost-list">
                        <strong style="font-size:11px; color:#8f89a8; margin-right:4px;">UPGRADE COST:</strong>
                        ${goldChip}
                        ${matsChipsHtml}
                    </div>
                    <button type="button" class="btn-upgrade-skill" id="btnUpgradeActiveSkill" ${canUpgrade.can ? '' : 'disabled'}>
                        ${canUpgrade.can ? `⭐ Upgrade Skill (Lv. ${curLevel} ➜ ${curLevel + 1})` : `🔒 ${canUpgrade.reason}`}
                    </button>
                </div>
            `;

            const btnUp = document.getElementById("btnUpgradeActiveSkill");
            if (btnUp && canUpgrade.can) {
                btnUp.addEventListener("click", () => {
                    const ok = state.upgradeSkill(activeSkillId);
                    if (ok) {
                        this.renderSpecialSkills();
                        this.updateUI();
                    }
                });
            }
        } else {
            upgradeCenter.innerHTML = `<div class="empty-state" style="padding:16px; color:#8f89a8;">No active special skill equipped. Select a skill from your class arsenal below.</div>`;
        }

        // 2. Render Class Skill Arsenal Grid
        const skillsPool = (heroDef && heroDef.skillsPool) || (heroDef && heroDef.skill ? [heroDef.skill] : []);
        arsenalGrid.innerHTML = "";

        skillsPool.forEach(skill => {
            const isUnlocked = state.isSkillUnlocked ? state.isSkillUnlocked(skill.id) : true;
            const isEquipped = activeSkillId === skill.id;
            const skillLevel = state.getSkillLevel ? state.getSkillLevel(skill.id) : 1;
            const effectiveStats = state.getSkillEffectiveStats ? state.getSkillEffectiveStats(skill.id, skillLevel) : skill;

            const card = document.createElement("div");
            card.className = `skill-arsenal-card ${isEquipped ? 'active-equipped' : ''} ${!isUnlocked ? 'locked-skill' : ''}`;

            let specialBadge = "";
            if (skill.healPct) specialBadge += `<span class="skill-arsenal-badge">❤️ Heal ${Math.round(skill.healPct * 100)}%</span>`;
            if (skill.buff) specialBadge += `<span class="skill-arsenal-badge">✨ ${skill.buff.name || 'Buff'}</span>`;

            let actionBtn = "";
            if (isEquipped) {
                actionBtn = `<button class="btn-equip-skill is-active" disabled>✓ EQUIPPED ACTIVE</button>`;
            } else if (isUnlocked) {
                actionBtn = `<button class="btn-equip-skill btn-purple" onclick="window.gameState.equipSkill('${skill.id}'); window.MainEngine.renderSpecialSkills(); window.MainEngine.updateUI();">⚔️ Equip Active Skill</button>`;
            } else {
                const scrollItem = window.ItemsData ? window.ItemsData[skill.scrollId] : null;
                const scrollName = scrollItem ? scrollItem.name : "Skill Scroll";
                actionBtn = `<button class="btn-equip-skill btn-disabled" disabled title="Acquire and study [${scrollName}] from the Realm Shop or monsters to master this ability">🔒 Locked (${scrollName})</button>`;
            }

            card.innerHTML = `
                <div class="skill-arsenal-top">
                    <div class="skill-arsenal-icon">${skill.icon}</div>
                    <div class="skill-arsenal-title-box">
                        <h4>${skill.name} ${isUnlocked ? `<span class="skill-lv-badge" style="font-size:9.5px; padding:1px 6px;">Lv. ${skillLevel}</span>` : ''}</h4>
                        <div class="skill-arsenal-stats">
                            <span class="skill-arsenal-badge">⚔️ ${Math.round(effectiveStats.damageMult * 100)}% Dmg</span>
                            <span class="skill-arsenal-badge">⏱️ ${effectiveStats.cooldown}s CD</span>
                            ${specialBadge}
                        </div>
                    </div>
                </div>
                <p class="skill-arsenal-desc">${skill.description}</p>
                ${actionBtn}
            `;
            arsenalGrid.appendChild(card);
        });
    },

    renderDivineBlessings() {
        const list = document.getElementById("divineBlessingsList");
        const countBadge = document.getElementById("divineBlessingsCount");
        if (!list) return;

        const state = window.gameState;
        const heroDef = window.HeroesData ? window.HeroesData[state.player.heroClass] : null;
        const passives = (heroDef && heroDef.passives) || [];
        const playerLevel = state.player.level || 1;

        let unlockedCount = 0;
        list.innerHTML = "";

        if (passives.length === 0) {
            list.innerHTML = `<div class="empty-state" style="padding:16px; color:#8f89a8;">No divine blessings recorded for this vocation.</div>`;
            if (countBadge) countBadge.textContent = "0 BLESSINGS";
            return;
        }

        passives.forEach(p => {
            const isUnlocked = playerLevel >= p.reqLevel;
            if (isUnlocked) unlockedCount++;

            const card = document.createElement("div");
            card.className = `divine-blessing-card ${isUnlocked ? 'unlocked' : 'locked'}`;

            let bonusPills = "";
            if (p.bonus) {
                const statLabels = {
                    attack: "⚔ Attack",
                    atk: "⚔ Attack",
                    defense: "🛡 Defense",
                    def: "🛡 Defense",
                    maxHp: "❤ Max HP",
                    hp: "❤ Max HP",
                    critChance: "🎯 Crit",
                    crit: "🎯 Crit",
                    dodge: "💨 Dodge",
                    eva: "💨 Dodge",
                    lifesteal: "🩸 Lifesteal",
                    vamp: "🩸 Lifesteal"
                };
                bonusPills = Object.entries(p.bonus).map(([k, v]) => {
                    const isPct = k.toLowerCase().includes("crit") || k.toLowerCase().includes("dodge") || k.toLowerCase().includes("lifesteal") || k.toLowerCase().includes("eva") || k.toLowerCase().includes("vamp");
                    const disp = (isPct && v < 1) ? `+${Math.round(v * 100)}%` : (isPct ? `+${v}%` : `+${v}`);
                    return `<span class="blessing-stat-pill">${statLabels[k] || k}: ${disp}</span>`;
                }).join(" ");
            }

            card.innerHTML = `
                <div class="blessing-card-header">
                    <div class="blessing-title-box">
                        <span class="blessing-icon">${p.icon || '✨'}</span>
                        <div>
                            <h4>${p.name} <small class="blessing-level-tag">${isUnlocked ? `✓ Unlocked (Lv. ${p.reqLevel})` : `🔒 Unlocks at Hero Lv. ${p.reqLevel}`}</small></h4>
                            <div class="blessing-lore">${p.lore || ''}</div>
                        </div>
                    </div>
                    <span class="blessing-status-badge ${isUnlocked ? 'badge-active' : 'badge-locked'}">
                        ${isUnlocked ? 'ACTIVE' : `LVL ${p.reqLevel}`}
                    </span>
                </div>
                <div class="blessing-footer">
                    <div class="blessing-bonus-row">${bonusPills || p.description || ''}</div>
                </div>
            `;
            list.appendChild(card);
        });

        if (countBadge) {
            countBadge.textContent = `${unlockedCount} / ${passives.length} UNLOCKED`;
        }
    },

    renderInventoryView() {
        this.renderMaterialsBar();
        this.renderEquipment();
        this.renderInventory();
        this.renderForge();
        this.renderAlchemy();
        this.renderCrafting();
    },

    renderAlchemy() {
        const grid = document.getElementById("alchemyGrid");
        if (!grid) return;

        const state = window.gameState;
        const recipes = window.AlchemyRecipes || [];
        const playerLevel = state.player.level || 1;

        grid.innerHTML = "";

        if (recipes.length === 0) {
            grid.innerHTML = `<div class="empty-state" style="padding:16px; color:#8f89a8;">No alchemical recipes discovered.</div>`;
            return;
        }

        const tiers = [
            { tier: 1, name: "Apprentice Cauldron", minLv: 1, desc: "Introductory potions and minor elixirs" },
            { tier: 2, name: "Journeyman Crucible", minLv: 10, desc: "Potent battle draughts and stone concoctions" },
            { tier: 3, name: "Aincrad Alchemical Altar", minLv: 25, desc: "Mythical divine nectars and dragonheart draughts" }
        ];

        tiers.forEach(t => {
            const tierRecipes = recipes.filter(r => (r.tier || 1) === t.tier);
            if (tierRecipes.length === 0) return;

            const isTierLocked = playerLevel < t.minLv;

            const tierSection = document.createElement("div");
            tierSection.className = `alch-tier-section ${isTierLocked ? 'tier-locked' : ''}`;
            tierSection.innerHTML = `
                <div class="alch-tier-header">
                    <div>
                        <h3 class="alch-tier-title">
                            ${t.tier === 1 ? '🧪' : (t.tier === 2 ? '⚗️' : '🔥')} ${t.name}
                            ${isTierLocked ? `<span class="alch-lock-badge">🔒 Locked until Hero Lv. ${t.minLv}</span>` : `<span class="alch-unlocked-badge">✓ Unlocked (Lv. ${t.minLv}+)</span>`}
                        </h3>
                        <p class="alch-tier-desc">${t.desc}</p>
                    </div>
                </div>
                <div class="alch-cards-grid" id="alchGridTier_${t.tier}"></div>
            `;
            grid.appendChild(tierSection);

            const tierCardsGrid = tierSection.querySelector(`#alchGridTier_${t.tier}`);

            tierRecipes.forEach(recipe => {
                const reqLv = recipe.reqLevel || t.minLv;
                const isLevelLocked = playerLevel < reqLv;
                const isRecipeLocked = recipe.requiresRecipe ? (state.isRecipeUnlocked ? !state.isRecipeUnlocked(recipe.id) : (state.player.unlockedRecipes ? !state.player.unlockedRecipes.includes(recipe.id) : true)) : false;

                const goldMet = state.canAfford(recipe.goldCost || 0);
                let matsMet = true;

                let matsHtml = "";
                if (recipe.materials) {
                    matsHtml = Object.entries(recipe.materials).map(([mat, need]) => {
                        const have = (state.player.materials && state.player.materials[mat]) || 0;
                        const ok = have >= need;
                        if (!ok) matsMet = false;
                        const matLabels = {
                            ironOre: "⛏️ Iron",
                            wood: "🪵 Wood",
                            crystal: "💎 Crystal",
                            dragonScale: "🐉 Dragon Scale",
                            shadowEssence: "🔮 Shadow Essence"
                        };
                        return `<span class="alch-ingredient ${ok ? 'ok' : 'missing'}">${matLabels[mat] || mat}: ${have}/${need}</span>`;
                    }).join(" · ");
                }

                const canBrew = !isTierLocked && !isLevelLocked && !isRecipeLocked && goldMet && matsMet;

                const resultId = recipe.result?.id || recipe.id;
                const ownedQty = (state.player.potions && state.player.potions[resultId]) || 0;

                let recipeTag = "";
                if (recipe.requiresRecipe) {
                    recipeTag = isRecipeLocked
                        ? `<div style="margin-top:4px;"><span class="alch-recipe-tag locked">🔒 Recipe Required</span></div>`
                        : `<div style="margin-top:4px;"><span class="alch-recipe-tag unlocked">✓ Recipe Mastered</span></div>`;
                }

                const card = document.createElement("div");
                card.className = `alch-recipe-card ${isLevelLocked || isRecipeLocked ? 'locked' : ''}`;
                card.innerHTML = `
                    <div class="alch-recipe-top">
                        <span class="alch-recipe-icon">${recipe.icon || '🧪'}</span>
                        <div style="flex:1;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <h4>${recipe.name}</h4>
                                <span class="alch-owned-badge">Pouch: <strong>${ownedQty}</strong></span>
                            </div>
                            <p class="alch-recipe-desc">${recipe.description || ''}</p>
                            ${recipeTag}
                        </div>
                    </div>

                    <div class="alch-cost-box">
                        <div class="alch-cost-gold ${goldMet ? 'ok' : 'missing'}">
                            <span>Cost:</span> <strong>${(recipe.goldCost || 0).toLocaleString()}g</strong>
                        </div>
                        <div class="alch-cost-mats">
                            ${matsHtml || '<em>No ingredients required</em>'}
                        </div>
                    </div>

                    <div class="alch-card-actions">
                        <button type="button" class="btn alch-brew-btn ${canBrew ? 'btn-gold' : 'btn-disabled'}" ${canBrew ? '' : 'disabled'}>
                            ${isLevelLocked ? `🔒 Locked (Lv. ${reqLv})` : (isRecipeLocked ? `🔒 Study Recipe Scroll` : (canBrew ? `⚗️ Brew Potion` : (!goldMet ? 'Need Gold' : 'Missing Mats')))}
                        </button>
                    </div>
                `;

                const brewBtn = card.querySelector(".alch-brew-btn");
                if (brewBtn && canBrew) {
                    brewBtn.addEventListener("click", () => {
                        if (window.InventoryManager) {
                            const success = window.InventoryManager.brewPotion(recipe.id);
                            if (success) {
                                this.renderInventoryView();
                                this.updateUI();
                            }
                        }
                    });
                }

                tierCardsGrid.appendChild(card);
            });
        });
    },

    renderMaterialsBar() {
        const bar = document.getElementById("materialsBar");
        const mats = window.gameState.player.materials || {};
        if (!bar) return;

        bar.innerHTML = `
            <div class="mat-badge">⛏️ Iron Ore: <strong>${mats.ironOre || 0}</strong></div>
            <div class="mat-badge">🪵 Hardwood: <strong>${mats.wood || 0}</strong></div>
            <div class="mat-badge">💎 Crystal: <strong>${mats.crystal || 0}</strong></div>
            <div class="mat-badge">🐉 Dragon Scale: <strong>${mats.dragonScale || 0}</strong></div>
            <div class="mat-badge">🔮 Shadow Essence: <strong>${mats.shadowEssence || 0}</strong></div>
        `;
    },

    renderEquipment() {
        const state = window.gameState;
        const grid = document.getElementById("equipGrid");
        if (!grid) return;
        grid.innerHTML = "";

        const slots = [
            { id: "weapon", name: "Weapon" },
            { id: "armor", name: "Armor" },
            { id: "trinket", name: "Trinket" },
            { id: "crown", name: "Crown / Relic" }
        ];

        slots.forEach(s => {
            const item = state.player.equipment[s.id] || (s.id === "trinket" ? state.player.equipment.ring : null);
            const card = document.createElement("div");

            if (item) {
                const rar = (window.RarityData && window.RarityData[item.rarity]) || { color: "#8b5cf6", name: "Common" };
                const statStr = window.formatItemStatLine ? window.formatItemStatLine(item) : "";
                let timerHtml = "";
                if (s.id === "crown" && window.CrownManager) {
                    const rem = window.CrownManager.getCrownRemainingSeconds(item);
                    timerHtml = `<div class="crown-timer-badge" data-crown-instance="${item.instanceId}">⏳ ${window.CrownManager.formatCrownTime(rem)} remaining</div>`;
                }
                card.className = "slot-card filled";
                card.style.setProperty("--rc", rar.color);
                card.innerHTML = `
                    <div class="slot-name">${s.name}</div>
                    <div class="item-name" style="color: ${rar.color};">${item.name}</div>
                    ${timerHtml}
                    <div class="item-stats">${statStr || "No bonus stats"}</div>
                    <button class="btn btn-ghost sm" onclick="window.InventoryManager.unequipSlot('${s.id}')">Unequip</button>
                `;
            } else {
                card.className = "slot-card";
                card.innerHTML = `
                    <div class="slot-name">${s.name}</div>
                    <div class="empty">— empty —</div>
                    <button class="btn btn-ghost sm" disabled>Unequip</button>
                `;
            }
            grid.appendChild(card);
        });
    },

    renderInventory() {
        const state = window.gameState;
        const bagCountEl = document.getElementById("bagCount");
        const grid = document.getElementById("bagGrid");
        if (!grid) return;

        let items = state.player.inventory ? [...state.player.inventory] : [];
        const totalItemsCount = items.length;
        if (bagCountEl) {
            bagCountEl.textContent = `${totalItemsCount} / 50 Items`;
        }

        // Apply Category Filter
        const filter = this.currentInvFilter || "all";
        if (filter === "equipment") {
            items = items.filter(it => it.type === "equipment" || (!it.type && (it.slot || it.stats)));
        } else if (filter === "consumable") {
            items = items.filter(it => it.type === "consumable");
        } else if (filter === "scroll") {
            items = items.filter(it => it.type === "learnable" && it.learnType === "skill");
        } else if (filter === "blueprint") {
            items = items.filter(it => it.type === "learnable" && (it.learnType === "forge" || it.learnType === "alchemy"));
        }

        // Apply Sorting
        const sortMode = this.currentInvSort || "rarity";
        const rarityWeights = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
        if (sortMode === "rarity") {
            items.sort((a, b) => (rarityWeights[b.rarity] || 0) - (rarityWeights[a.rarity] || 0));
        } else if (sortMode === "value") {
            items.sort((a, b) => {
                const valA = window.InventoryManager ? window.InventoryManager.getSellPrice(a) : (a.baseValue || 0);
                const valB = window.InventoryManager ? window.InventoryManager.getSellPrice(b) : (b.baseValue || 0);
                return valB - valA;
            });
        } else if (sortMode === "name") {
            items.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        }

        grid.innerHTML = "";

        if (items.length === 0) {
            grid.innerHTML = `<div class="empty-bag">No items found matching this filter in your inventory.</div>`;
            return;
        }

        items.forEach(item => {
            const rar = (window.RarityData && window.RarityData[item.rarity]) || { color: "#8b5cf6", name: "Common" };
            const statStr = window.formatItemStatLine ? window.formatItemStatLine(item) : (item.description || "");
            const price = window.InventoryManager ? window.InventoryManager.getSellPrice(item) : (item.baseValue || 20);
            const isEquippable = item.type === "equipment" || (!item.type && (item.slot || item.stats));
            const isLearnable = item.type === "learnable" || !!item.learnType;

            const card = document.createElement("div");
            card.className = `item ${isLearnable ? 'learnable' : ''}`;
            card.style.setProperty("--rc", rar.color);

            let actionBtn = "";
            let tagHtml = "";

            if (isLearnable) {
                const tagClass = item.learnType === "skill" ? "tag-skill" : (item.learnType === "alchemy" ? "tag-alchemy" : "tag-forge");
                const tagLabel = item.learnType === "skill" ? "📜 SKILL SCROLL" : (item.learnType === "alchemy" ? "⚗️ ALCHEMY RECIPE" : "⚒️ FORGE BLUEPRINT");
                tagHtml = `<div class="item-learn-tag ${tagClass}">${tagLabel}</div>`;
                actionBtn = `<button class="btn btn-study sm" onclick="window.InventoryManager.learnItem('${item.instanceId}'); window.MainEngine.renderInventoryView(); window.MainEngine.updateUI();">📜 Study & Learn</button>`;
            } else if (isEquippable) {
                actionBtn = `<button class="btn btn-purple sm" onclick="window.InventoryManager.equipItem('${item.instanceId}'); window.MainEngine.renderInventoryView(); window.MainEngine.updateUI();">Equip</button>`;
            } else if (item.type === "consumable") {
                actionBtn = `<button class="btn btn-gold sm" onclick="window.InventoryManager.usePotion('${item.id}'); window.MainEngine.renderInventoryView(); window.MainEngine.updateUI();">Use</button>`;
            }

            const isCrown = item.slot === "crown" || ["demon_crown", "divine_crown", "equilibrium_crown"].includes(item.id);
            const isUnsellable = item.unsellable || isCrown;

            let timerHtml = "";
            if (isCrown && window.CrownManager) {
                const rem = window.CrownManager.getCrownRemainingSeconds(item);
                timerHtml = `<div class="crown-timer-badge" data-crown-instance="${item.instanceId}">⏳ ${window.CrownManager.formatCrownTime(rem)} remaining</div>`;
            }

            const sellBtnHtml = isUnsellable
                ? `<button class="btn btn-ghost sm" disabled style="opacity: 0.45; cursor: not-allowed; border-color: rgba(255,255,255,0.08);">Unsellable</button>`
                : `<button class="btn btn-ghost sm" onclick="window.InventoryManager.sellItem('${item.instanceId}'); window.MainEngine.renderInventoryView(); window.MainEngine.updateUI();">Sell ${price.toLocaleString()}g</button>`;

            card.innerHTML = `
                <div class="item-top">
                    <div>
                        ${tagHtml}
                        <span class="item-name">${item.name}</span>
                        ${timerHtml}
                    </div>
                    <span class="item-rar">${(rar.name || item.rarity || 'Common').toUpperCase()}</span>
                </div>
                <div class="item-stats">${statStr}</div>
                <div class="item-actions">
                    ${actionBtn}
                    ${sellBtnHtml}
                </div>
            `;
            grid.appendChild(card);
        });
    },

    renderForge() {
        const state = window.gameState;
        const grid = document.getElementById("forgeGrid");
        if (!grid) return;

        const tiers = window.ForgeData || [
            { tier: 'common', name: 'Basic Forge', icon: '🔨', cost: 250, reqLevel: 1, desc: 'Mostly common gear with a chance at something Rare.' },
            { tier: 'rare', name: 'Master Forge', icon: '⚒️', cost: 1600, reqLevel: 10, desc: 'Reliable Rare equipment. Occasionally Epic. Unlocks at Hero Lv. 10.' },
            { tier: 'legendary', name: 'Aincrad Forge', icon: '🔥', cost: 9000, reqLevel: 25, desc: 'Epic guaranteed. A chance at a Legendary relic. Unlocks at Hero Lv. 25.' }
        ];

        grid.innerHTML = "";
        tiers.forEach((t, idx) => {
            const reqLv = t.reqLevel || 1;
            const isLocked = (state.player.level || 1) < reqLv;
            const canAfford = state.canAfford(t.cost);
            const btnClass = idx === 1 ? "btn-purple" : "btn-gold";

            const card = document.createElement("div");
            card.className = `forge-card ${isLocked ? 'locked-forge' : ''}`;
            card.innerHTML = `
                <div class="fi">${isLocked ? '🔒' : t.icon}</div>
                <h4>${t.name}</h4>
                <p>${isLocked ? `<span style="color:#ff8a9b;font-weight:700;">🔒 Locked (Requires Hero Lv. ${reqLv})</span><br><small style="color:#8f89a8;">Reach Level ${reqLv} to unlock this forge tier.</small>` : t.desc}</p>
                <button class="btn ${btnClass} sm" ${isLocked || !canAfford ? 'disabled' : ''} onclick="window.InventoryManager.forge(${idx})">
                    ${isLocked ? `🔒 Locked (Lv ${reqLv})` : `Forge · ${t.cost.toLocaleString()}g`}
                </button>
            `;
            grid.appendChild(card);
        });
    },

    renderCrafting() {
        const grid = document.getElementById("craftingGrid");
        const state = window.gameState;
        if (!grid || !window.CraftingRecipes) return;

        grid.innerHTML = "";
        window.CraftingRecipes.forEach(recipe => {
            const item = window.ItemsData[recipe.itemId];
            if (!item) return;

            const rarity = window.RarityData[item.rarity] || window.RarityData.common;
            let reqs = [];
            reqs.push(`✦ ${recipe.req.gold}g`);
            for (const [mat, qty] of Object.entries(recipe.req)) {
                if (mat === "gold") continue;
                const have = state.player.materials[mat] || 0;
                reqs.push(`${mat}: ${have}/${qty}`);
            }

            const isBlueprintUnlocked = recipe.requiresBlueprint ? (state.isBlueprintUnlocked ? state.isBlueprintUnlocked(recipe.blueprintId || recipe.itemId) : (state.player.unlockedBlueprints && state.player.unlockedBlueprints.includes(recipe.blueprintId || recipe.itemId))) : true;

            const card = document.createElement("div");
            card.className = `craft-card ${!isBlueprintUnlocked ? 'blueprint-locked' : ''}`;

            let bpTag = "";
            let btnText = "CRAFT";
            let btnDisabled = false;

            if (recipe.requiresBlueprint) {
                if (isBlueprintUnlocked) {
                    bpTag = `<span class="craft-bp-tag unlocked">✓ Schematic Learned</span>`;
                } else {
                    bpTag = `<span class="craft-bp-tag locked">🔒 Blueprint Required</span>`;
                    btnText = "🔒 Study Blueprint";
                    btnDisabled = true;
                }
            }

            card.innerHTML = `
                <div class="craft-info">
                    <span class="craft-icon">${item.icon}</span>
                    <div>
                        <strong style="color: ${rarity.color}">${item.name}</strong>
                        <small>${reqs.join(" · ")}</small>
                        ${bpTag ? `<div style="margin-top:2px;">${bpTag}</div>` : ''}
                    </div>
                </div>
                <button class="btn-craft" ${btnDisabled ? 'disabled' : ''} onclick="window.InventoryManager.craftItem('${recipe.itemId}'); window.MainEngine.renderInventoryView(); window.MainEngine.updateUI();">${btnText}</button>
            `;
            grid.appendChild(card);
        });
    },

    renderShop() {
        const state = window.gameState;

        // 1. Permanent Upgrades List
        const shopListEl = document.getElementById("shopList");
        if (shopListEl && window.UpgradesData) {
            shopListEl.innerHTML = "";
            window.UpgradesData.forEach(u => {
                const currentLv = (state.player.upgrades && state.player.upgrades[u.id]) || 0;
                const cost = window.getUpgradeCost ? window.getUpgradeCost(u.id) : u.base;
                const canAfford = state.canAfford(cost);

                const row = document.createElement("div");
                row.className = "shop-row";
                row.innerHTML = `
                    <div class="sr-icon">${u.icon}</div>
                    <div class="sr-body">
                        <div class="sr-name">
                            <span>${u.name}</span>
                            <span class="sr-lvl">LV ${currentLv}</span>
                        </div>
                        <div class="sr-desc">${u.desc}</div>
                    </div>
                    <button class="btn btn-gold sm sr-buy" ${!canAfford ? 'disabled' : ''} onclick="window.buyUpgrade('${u.id}')">
                        ✦ ${cost.toLocaleString()}g
                    </button>
                `;
                shopListEl.appendChild(row);
            });
        }

        // 2. Merchant Supplies & Potions Grid
        const grid = document.getElementById("shopGrid");
        if (grid && window.ShopData) {
            grid.innerHTML = "";

            let items = window.ShopData;
            if (this.currentShopFilter === "blueprint") {
                items = items.filter(s => s.category === "blueprint" || s.category === "recipe");
            } else if (this.currentShopFilter && this.currentShopFilter !== "all") {
                items = items.filter(s => s.category === this.currentShopFilter);
            }

            items.forEach(shopItem => {
                const it = (shopItem.itemId && window.ItemsData && window.ItemsData[shopItem.itemId]) || null;
                const name = shopItem.name || (it ? it.name : shopItem.id);
                const icon = shopItem.icon || (it ? it.icon : "🛍️");
                const desc = shopItem.description || shopItem.desc || (it ? it.description : "");
                let color = "#e0dede";

                if (it && it.rarity && window.RarityData && window.RarityData[it.rarity]) {
                    color = window.RarityData[it.rarity].color;
                } else if (shopItem.category === "material") {
                    color = "#4ade80";
                } else if (shopItem.category === "consumable") {
                    color = "#60a5fa";
                } else if (shopItem.category === "scroll") {
                    color = "#c4b5fd";
                } else if (shopItem.category === "recipe" || shopItem.category === "blueprint") {
                    color = "#fcd34d";
                }

                const reqMapId = shopItem.reqMap || "any";
                const reqDepth = shopItem.reqDepth || 1;
                const isUniversal = !reqMapId || reqMapId === "any";
                const isMapUnlocked = isUniversal ||
                                      (state.world && state.world.unlockedMaps && state.world.unlockedMaps.includes(reqMapId)) ||
                                      (state.player && state.player.unlockedMaps && state.player.unlockedMaps.includes(reqMapId));
                const curMaxDepth = isUniversal ? 99 : ((state.getMapMaxUnlockedDepth) ? state.getMapMaxUnlockedDepth(reqMapId) : 1);
                const isDepthUnlocked = isUniversal || (curMaxDepth >= reqDepth);
                const isAreaUnlocked = isMapUnlocked && isDepthUnlocked;

                const mapDef = (window.MapsData && window.MapsData[reqMapId]) || { name: "Realm" };
                const romans = ["I", "II", "III", "IV", "V"];
                const depthRoman = romans[reqDepth - 1] || `${reqDepth}`;

                const canLevel = (state.player.level || 1) >= (shopItem.reqLevel || 1);
                const canAfford = state.canAfford(shopItem.costGold);

                const card = document.createElement("div");
                card.className = `shop-card ${!isAreaUnlocked ? 'realm-locked' : (!canLevel ? 'level-locked' : '')}`;

                let lockNotice = "";
                let buyBtnText = "BUY";
                let btnDisabled = false;

                if (!isAreaUnlocked) {
                    lockNotice = `<div class="shop-lock-tag">🔒 Unlocks: ${mapDef.name} ${depthRoman}</div>`;
                    buyBtnText = `🔒 Locked (${mapDef.name} ${depthRoman})`;
                    btnDisabled = true;
                } else if (!canLevel) {
                    lockNotice = `<div class="shop-lock-tag">🔒 Requires Hero Lv. ${shopItem.reqLevel}</div>`;
                    buyBtnText = `Lv. ${shopItem.reqLevel} Required`;
                    btnDisabled = true;
                } else if (!canAfford) {
                    buyBtnText = "Need Gold";
                    btnDisabled = true;
                }

                card.innerHTML = `
                    <div class="shop-card-icon">${icon}</div>
                    <div class="shop-card-info">
                        <strong style="color: ${color}">${name}</strong>
                        <small>✦ ${shopItem.costGold.toLocaleString()}g · Req Lv. ${shopItem.reqLevel || 1}</small>
                        ${desc ? `<div class="shop-item-desc">${desc}</div>` : ''}
                        ${lockNotice}
                    </div>
                    <button class="btn-buy" ${btnDisabled ? 'disabled' : ''} onclick="window.GameAPI.shop.buyItem('${shopItem.id}')">
                        ${buyBtnText}
                    </button>
                `;
                grid.appendChild(card);
            });
        }
    },

    /* =========================================================
       NEW PLAYER ONBOARDING & PROGRESSION MODALS
    ========================================================= */
    showOnboardingModal() {
        const modal = document.getElementById("onboardingModal");
        if (!modal) return;
        this.onboardState.step = 1;
        this.renderOnboardingStep();
        modal.classList.add("visible");
    },

    hideOnboardingModal() {
        const modal = document.getElementById("onboardingModal");
        if (modal) modal.classList.remove("visible");
    },

    randomizeHeroName() {
        const names = [
            "Roland", "Aria", "Valerius", "Lyra", "Gideon",
            "Seraphina", "Kaelen", "Thorne", "Eldrin", "Morrigan",
            "Caelum", "Zephyr", "Rowan", "Aeloria", "Darius"
        ];
        const chosen = names[Math.floor(Math.random() * names.length)];
        this.onboardState.name = chosen;
        const input = document.getElementById("onboardHeroName");
        if (input) input.value = chosen;
    },

    renderOnboardingStep() {
        for (let i = 1; i <= 4; i++) {
            const stepEl = document.getElementById(`onboardStep_${i}`);
            if (stepEl) {
                stepEl.classList.toggle("active", i === this.onboardState.step);
            }
        }

        if (this.onboardState.step === 2) {
            const input = document.getElementById("onboardHeroName");
            if (input && !input.value) input.value = this.onboardState.name;
            const genderGroup = document.getElementById("genderButtonGroup");
            if (genderGroup) {
                genderGroup.querySelectorAll(".btn-gender").forEach(b => {
                    b.classList.toggle("active", b.dataset.gender === this.onboardState.gender);
                });
            }
        } else if (this.onboardState.step === 3) {
            this.renderOnboardingClassGrid();
        } else if (this.onboardState.step === 4) {
            this.renderOnboardingGearSummary();
        }
    },

    renderOnboardingClassGrid() {
        const grid = document.getElementById("onboardClassGrid");
        if (!grid || !window.HeroesData) return;
        grid.innerHTML = "";

        Object.values(window.HeroesData).forEach(h => {
            if (h.unlocked === false) return; // Managed by Admin Panel: only show unlocked classes
            const isSelected = (this.onboardState.selectedClass === h.id);
            const card = document.createElement("div");
            card.className = `onboard-class-card ${isSelected ? "selected" : ""}`;
            card.innerHTML = `
                <div class="onboard-class-icon">${h.icon}</div>
                <div class="onboard-class-info">
                    <h4>${h.name}</h4>
                    <p>${h.description}</p>
                    <div class="onboard-class-stats">
                        <span>⚔️ Atk: ${h.baseAttack}</span>
                        <span>🛡️ Def: ${h.baseDefense}</span>
                        <span>🎯 Crit: ${Math.round(h.baseCritChance * 100)}%</span>
                        <span>💨 Dodge: ${Math.round(h.baseDodge * 100)}%</span>
                    </div>
                    ${h.skill ? `<small class="onboard-class-skill">Skill: <strong>${h.skill.name}</strong> (${h.skill.description})</small>` : ""}
                </div>
                <div class="onboard-select-indicator">${isSelected ? "✓ SELECTED" : "SELECT"}</div>
            `;
            card.addEventListener("click", () => {
                this.onboardState.selectedClass = h.id;
                this.renderOnboardingClassGrid();
            });
            grid.appendChild(card);
        });
    },

    renderOnboardingGearSummary() {
        const summary = document.getElementById("starterGearSummary");
        if (!summary) return;

        const starterGear = {
            knight: { weapon: "iron_sword", armor: "iron_chestplate" },
            mage: { weapon: "apprentice_wand", armor: "apprentice_robes" },
            rogue: { weapon: "shadow_daggers", armor: "leather_armor" },
            paladin: { weapon: "blessed_mace", armor: "crusader_plate" }
        };
        const gear = starterGear[this.onboardState.selectedClass] || starterGear.knight;
        const weaponItem = (window.ItemsData && gear.weapon) ? window.ItemsData[gear.weapon] : null;
        const armorItem = (window.ItemsData && gear.armor) ? window.ItemsData[gear.armor] : null;

        summary.innerHTML = `
            <div class="starter-gear-card">
                <span class="gear-slot-label">MAIN WEAPON</span>
                <div class="gear-item-line">
                    <span class="gear-icon">${weaponItem ? weaponItem.icon : "🗡️"}</span>
                    <strong>${weaponItem ? weaponItem.name : "Class Starter Weapon"}</strong>
                    <span class="gear-stats">(Atk +${weaponItem ? weaponItem.attackBonus : 5})</span>
                </div>
            </div>
            <div class="starter-gear-card">
                <span class="gear-slot-label">CHEST ARMOR</span>
                <div class="gear-item-line">
                    <span class="gear-icon">${armorItem ? armorItem.icon : "🛡️"}</span>
                    <strong>${armorItem ? armorItem.name : "Class Starter Armor"}</strong>
                    <span class="gear-stats">(Def +${armorItem ? armorItem.defenseBonus : 3})</span>
                </div>
            </div>
        `;
    },

    /* =========================================================
       TEMPLE OF REVIVAL (SANCTUARY SAFE HAVEN)
    ========================================================= */
    /* =========================================================
       TEMPLE OF REVIVAL (SANCTUARY SAFE HAVEN)
    ========================================================= */
    showTempleModal() {
        const modal = document.getElementById("templeModal");
        if (!modal) return;
        const msgEl = modal.querySelector(".temple-revival-msg");
        if (msgEl) {
            const state = window.gameState;
            if (state.lastTempleDonation > 0) {
                msgEl.textContent = `Your hero was overwhelmed in battle. The Priests of the Temple have resurrected your spirit and cleansed your wounds (50% HP restored). A tithe of ${state.lastTempleDonation} gold was donated to the sanctuary altar.`;
            } else {
                msgEl.textContent = `Your hero was overwhelmed in battle. The Priests of the Temple have resurrected your spirit and cleansed your wounds (50% HP restored).`;
            }
        }
        modal.classList.add("visible");
    },

    hideTempleModal() {
        const modal = document.getElementById("templeModal");
        if (modal) modal.classList.remove("visible");
    },

    /* =========================================================
       HERO QUICK ACCESS MENU
    ========================================================= */
    toggleHeroQuickMenu() {
        const modal = document.getElementById("heroQuickMenuModal");
        if (!modal) return;
        if (modal.classList.contains("visible") || modal.style.display === "flex") {
            this.hideHeroQuickMenu();
        } else {
            this.showHeroQuickMenu();
        }
    },

    showHeroQuickMenu() {
        const modal = document.getElementById("heroQuickMenuModal");
        if (!modal) return;
        const state = window.gameState;
        const heroDef = window.HeroesData[state.player.heroClass] || window.HeroesData.knight;
        const map = window.MapsData[state.world.currentMapId] || window.MapsData.moonlit_vale;

        if (document.getElementById("quickMenuIcon")) document.getElementById("quickMenuIcon").textContent = heroDef.icon;
        if (document.getElementById("quickMenuName")) document.getElementById("quickMenuName").textContent = state.player.name || "Hero";
        if (document.getElementById("quickMenuClass")) document.getElementById("quickMenuClass").textContent = heroDef.name;
        if (document.getElementById("quickMenuGender")) {
            const g = state.player.gender || "male";
            document.getElementById("quickMenuGender").textContent = g === "female" ? "♀ Female" : (g === "other" ? "⚧ Other" : "♂ Male");
        }
        if (document.getElementById("quickMenuLevel")) document.getElementById("quickMenuLevel").textContent = state.player.level;
        if (document.getElementById("quickMenuRealm")) document.getElementById("quickMenuRealm").textContent = `📍 Realm ${map.roman}: ${map.name}`;

        modal.style.display = "flex";
        modal.classList.add("visible");
    },

    hideHeroQuickMenu() {
        const modal = document.getElementById("heroQuickMenuModal");
        if (modal) {
            modal.classList.remove("visible");
            modal.style.display = "none";
        }
    },

    wipeAllSaveData() {
        if (!confirm("Are you sure you want to completely wipe all saved game data and restart with a fresh hero?")) return;
        localStorage.removeItem("realmIdleRootSave");
        window.location.reload();
    },

    /* =========================================================
       REALM CLEARED VICTORY CELEBRATION
    ========================================================= */
    showVictoryModal(details) {
        this.victoryDetails = details;
        const modal = document.getElementById("victoryModal");
        if (!modal) return;

        if (document.getElementById("victoryTitle")) {
            document.getElementById("victoryTitle").textContent = `${details.mapName.toUpperCase()} CLEARED!`;
        }
        if (document.getElementById("victorySubtitle")) {
            document.getElementById("victorySubtitle").textContent = `GUARDIAN ${details.bossName.toUpperCase()} DEFEATED`;
        }
        if (document.getElementById("vicRewardGold")) {
            document.getElementById("vicRewardGold").textContent = `💰 +${details.gold.toLocaleString()} Gold`;
        }
        if (document.getElementById("vicRewardXp")) {
            document.getElementById("vicRewardXp").textContent = `⭐ +${details.xp.toLocaleString()} XP`;
        }
        if (document.getElementById("vicRewardNext")) {
            if (details.nextDepth && details.nextMap) {
                document.getElementById("vicRewardNext").textContent = `🗺️ Unlocked: ${details.nextDepth} & Realm: ${details.nextMap}!`;
            } else if (details.nextDepth) {
                document.getElementById("vicRewardNext").textContent = `🌲 Unlocked Deeper Tier: ${details.nextDepth}!`;
            } else if (details.nextMap) {
                document.getElementById("vicRewardNext").textContent = `🗺️ Unlocked Next Realm: ${details.nextMap}!`;
            } else {
                document.getElementById("vicRewardNext").textContent = `✨ Realm Fully Conquered!`;
            }
        }

        const btnDeeper = document.getElementById("btnVictoryGoDeeper");
        if (btnDeeper) {
            if (details.nextDepth) {
                btnDeeper.style.display = "block";
                const sub = details.nextDepthTier ? ` (${details.nextDepthTier.subtitle})` : '';
                btnDeeper.textContent = `🌲 Delve Deeper: ${details.nextDepth}${sub}`;
            } else {
                btnDeeper.style.display = "none";
            }
        }

        const btnTravel = document.getElementById("btnVictoryTravel");
        if (btnTravel) {
            if (details.nextMapId) {
                btnTravel.style.display = "block";
                btnTravel.textContent = `🗺️ Travel to Next Realm (${details.nextMap})`;
            } else {
                btnTravel.style.display = details.nextDepth ? "none" : "block";
            }
        }

        modal.classList.add("visible");
    },

    hideVictoryModal() {
        const modal = document.getElementById("victoryModal");
        if (modal) modal.classList.remove("visible");
    }
};

window.UIManager = window.MainEngine;

document.addEventListener("DOMContentLoaded", () => {
    window.MainEngine.init();
});

