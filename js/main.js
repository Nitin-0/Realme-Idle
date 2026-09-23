/* =========================================================
   REALM IDLE MAIN ENGINE - RPG & GM BOOTSTRAPPER
========================================================= */

window.MainEngine = {
    combatLoopId: null,
    passiveGoldLoopId: null,
    eventLoopId: null,
    saveLoopId: null,

    activeTab: "arena",
    selectedInventoryItemInstanceId: null,
    currentInvFilter: "all",
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

        // 3. Init Canvas Weather
        if (window.WeatherManager) window.WeatherManager.init();

        // 4. Init GM Panel
        if (window.DevPanel) window.DevPanel.init();

        // 5. Subscribe UI sync to root gameState changes
        window.gameState.subscribe(() => this.updateUI());

        // 6. Initial Map setup
        if (window.MapManager) {
            window.MapManager.loadMap(window.gameState.world.currentMapId);
        }

        // 7. Bind upgrade buttons & UI actions
        this.bindEvents();

        // 8. Start Loops
        this.restartGameLoops();

        // Render Initial UI
        this.updateUI();

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

        // Reset
        const btnReset = document.getElementById("reset");
        if (btnReset) {
            btnReset.addEventListener("click", () => {
                if (!confirm("Reset all progress? This cannot be undone.")) return;
                localStorage.removeItem("realmIdleRootSave");
                window.location.reload();
            });
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

        // Inventory Category Filter Buttons
        document.querySelectorAll("[data-inv-filter]").forEach(btn => {
            btn.addEventListener("click", () => {
                this.currentInvFilter = btn.dataset.invFilter;
                document.querySelectorAll("[data-inv-filter]").forEach(b => b.classList.toggle("active", b === btn));
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
    },

    showOfflineModal(report) {
        const modal = document.getElementById("offlineModal");
        if (!modal || !report) return;

        const minutes = Math.floor(report.elapsedSec / 60);
        const hours = (minutes / 60).toFixed(1);
        const timeStr = minutes >= 60 ? `${hours} hours` : `${minutes} minutes`;

        const timeText = document.getElementById("offlineTimeText");
        if (timeText) timeText.textContent = `While you were away for ${timeStr}, your hero continued the quest:`;

        if (document.getElementById("offStatKills")) document.getElementById("offStatKills").textContent = report.kills.toLocaleString();
        if (document.getElementById("offStatGold")) document.getElementById("offStatGold").textContent = `+${report.totalGold.toLocaleString()}g`;
        if (document.getElementById("offStatXp")) document.getElementById("offStatXp").textContent = `+${report.totalXp.toLocaleString()} XP`;
        if (document.getElementById("offStatPots")) document.getElementById("offStatPots").textContent = `+${report.potionsGathered}`;

        const lootBox = document.getElementById("offlineLootBox");
        if (lootBox) {
            lootBox.innerHTML = "";
            let lootItems = [];

            for (const [mat, qty] of Object.entries(report.materialsGathered)) {
                if (qty > 0) lootItems.push(`${mat}: +${qty}`);
            }
            report.gearGathered.forEach(g => lootItems.push(`🗡️ ${g}`));

            if (lootItems.length > 0) {
                lootBox.innerHTML = `<strong>Loot Recovered:</strong> ${lootItems.join(" · ")}`;
            } else {
                lootBox.innerHTML = `<em>No gear drops discovered during this rest.</em>`;
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
            window.gameState.addGold(window.gameState.costs.goldPerSecond);
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

        if (document.getElementById("realm")) document.getElementById("realm").textContent = map.roman;
        if (document.getElementById("realmName")) document.getElementById("realmName").textContent = map.name;

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

        // Arena Stage Tracker Bar
        const stageRealmEl = document.getElementById("arenaRealmName");
        if (stageRealmEl) stageRealmEl.textContent = map.name;

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
        if (document.getElementById("playerHpCard")) document.getElementById("playerHpCard").textContent = Math.max(0, Math.floor(state.player.hp)).toLocaleString();
        if (document.getElementById("playerMaxHpCard")) document.getElementById("playerMaxHpCard").textContent = Math.floor(state.player.maxHp).toLocaleString();
        if (document.getElementById("playerHpText")) document.getElementById("playerHpText").textContent = Math.max(0, Math.floor(state.player.hp)).toLocaleString();
        if (document.getElementById("playerMaxHpText")) document.getElementById("playerMaxHpText").textContent = Math.floor(state.player.maxHp).toLocaleString();

        const playerHpPct = Math.max(0, Math.min(100, (state.player.hp / state.player.maxHp) * 100));
        if (document.getElementById("playerHpFill")) document.getElementById("playerHpFill").style.width = playerHpPct + "%";

        // Stats Breakdown Strip
        if (document.getElementById("statDefense")) document.getElementById("statDefense").textContent = state.getEffectiveDefense();
        if (document.getElementById("statCrit")) document.getElementById("statCrit").textContent = Math.round(state.getEffectiveCritChance() * 100) + "%";
        if (document.getElementById("statDodge")) document.getElementById("statDodge").textContent = Math.round(state.getEffectiveDodge() * 100) + "%";
        if (document.getElementById("statLifesteal")) document.getElementById("statLifesteal").textContent = Math.round(state.getEffectiveLifesteal() * 100) + "%";

        // Skill Bar
        if (heroDef.skill) {
            const skill = heroDef.skill;
            if (document.getElementById("skillIcon")) document.getElementById("skillIcon").textContent = skill.icon;
            if (document.getElementById("skillName")) document.getElementById("skillName").textContent = skill.name;
            if (document.getElementById("skillDesc")) document.getElementById("skillDesc").textContent = `${Math.round(skill.damageMult * 100)}% Dmg · ${skill.cooldown}s CD`;

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
        ["weapon", "armor", "ring"].forEach(slot => {
            const el = document.getElementById(`eqSlot_${slot}`);
            if (el) {
                const item = state.player.equipment[slot];
                if (item) {
                    const upgStr = item.upgradeLevel ? ` <span class="eq-upg">+${item.upgradeLevel}</span>` : "";
                    el.innerHTML = `<span class="eq-icon">${item.icon}</span> <span class="eq-name ${item.rarity}">${item.name}${upgStr}</span>`;
                    el.onclick = () => {
                        this.selectedInventoryItemInstanceId = item.instanceId;
                        this.switchTab("inventory");
                    };
                } else {
                    el.innerHTML = `<span class="eq-empty">Empty ${slot}</span>`;
                    el.onclick = null;
                }
            }
        });

        // Kingdom Buildings UI
        ["castle", "treasury", "blacksmith", "mageTower", "barracks"].forEach(bldg => {
            const lvlEl = document.getElementById(`bldgLvl_${bldg}`);
            const costEl = document.getElementById(`bldgCost_${bldg}`);
            const btnEl = document.getElementById(`btnBldg_${bldg}`);

            if (lvlEl) lvlEl.textContent = state.kingdom[bldg];
            if (window.KingdomManager && costEl) {
                const cost = window.KingdomManager.getBuildingCost(bldg);
                costEl.textContent = "✦ " + cost.toLocaleString();
                if (btnEl) btnEl.disabled = !state.canAfford(cost);
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

        if (document.getElementById("charStatAttack")) document.getElementById("charStatAttack").textContent = state.getEffectiveAttack().toLocaleString();
        if (document.getElementById("charStatDefense")) document.getElementById("charStatDefense").textContent = state.getEffectiveDefense().toLocaleString();
        if (document.getElementById("charStatCrit")) document.getElementById("charStatCrit").textContent = Math.round(state.getEffectiveCritChance() * 100) + "%";
        if (document.getElementById("charStatCritDmg")) document.getElementById("charStatCritDmg").textContent = `${state.player.critDmg}x`;
        if (document.getElementById("charStatDodge")) document.getElementById("charStatDodge").textContent = Math.round(state.getEffectiveDodge() * 100) + "%";
        if (document.getElementById("charStatLifesteal")) document.getElementById("charStatLifesteal").textContent = Math.round(state.getEffectiveLifesteal() * 100) + "%";
        if (document.getElementById("charStatHp")) document.getElementById("charStatHp").textContent = `${Math.floor(state.player.hp)} / ${Math.floor(state.player.maxHp)}`;
        if (document.getElementById("charStatGps")) document.getElementById("charStatGps").textContent = `${state.costs.goldPerSecond * (1 + (state.kingdom.treasury - 1) * 0.10)}g / sec`;

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
    },

    renderInventoryView() {
        this.renderMaterialsBar();
        this.renderInventory();
        this.renderCrafting();
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

    renderInventory() {
        const state = window.gameState;
        const grid = document.getElementById("inventoryGrid");
        if (!grid) return;

        grid.innerHTML = "";

        let items = state.player.inventory;
        if (this.currentInvFilter === "equipment") {
            items = items.filter(i => i.type === "equipment" || (!i.type && i.slot));
        } else if (this.currentInvFilter === "consumable") {
            items = items.filter(i => i.type === "consumable");
        }

        if (items.length === 0) {
            grid.innerHTML = `<div class="empty-inv-msg">Backpack is empty in this category. Defeat enemies or visit the Shop!</div>`;
        }

        items.forEach(item => {
            const isSelected = (this.selectedInventoryItemInstanceId === item.instanceId);
            const rarity = window.RarityData[item.rarity] || window.RarityData.common;
            const upg = item.upgradeLevel ? `+${item.upgradeLevel}` : "";

            const slotEl = document.createElement("div");
            slotEl.className = `inv-slot ${item.rarity} ${isSelected ? 'selected' : ''}`;
            slotEl.style.borderColor = rarity.border;
            slotEl.innerHTML = `
                <div class="inv-slot-icon">${item.icon}</div>
                <div class="inv-slot-name">${item.name}</div>
                ${upg ? `<div class="inv-slot-upg">${upg}</div>` : ''}
            `;
            slotEl.onclick = () => {
                this.selectedInventoryItemInstanceId = item.instanceId;
                this.renderInventory();
                this.renderItemDetails(item);
            };
            grid.appendChild(slotEl);
        });

        // Also check if selected item is equipped
        let selectedItem = state.player.inventory.find(i => i.instanceId === this.selectedInventoryItemInstanceId);
        if (!selectedItem) {
            for (const eq of Object.values(state.player.equipment)) {
                if (eq && eq.instanceId === this.selectedInventoryItemInstanceId) {
                    selectedItem = eq;
                    break;
                }
            }
        }

        this.renderItemDetails(selectedItem);
    },

    renderItemDetails(item) {
        const panel = document.getElementById("itemDetailsPanel");
        if (!panel) return;

        if (!item) {
            panel.innerHTML = `<div class="empty-select-hint">Select an item from your backpack to inspect, equip, upgrade, or sell.</div>`;
            return;
        }

        const state = window.gameState;
        const rarity = window.RarityData[item.rarity] || window.RarityData.common;
        const effStats = state.getItemEffectiveStats(item);
        const upgCost = window.InventoryManager ? window.InventoryManager.getUpgradeCost(item) : null;
        const sellPrice = window.InventoryManager ? window.InventoryManager.getSellPrice(item) : 0;

        let statLines = [];
        for (const [st, val] of Object.entries(effStats)) {
            statLines.push(`<span>${st.toUpperCase()}: <strong>+${val}</strong></span>`);
        }

        const isEquipped = Object.values(state.player.equipment).some(eq => eq && eq.instanceId === item.instanceId);

        panel.innerHTML = `
            <div class="detail-header" style="border-left: 4px solid ${rarity.color};">
                <span class="detail-icon">${item.icon}</span>
                <div>
                    <h4 style="color: ${rarity.color}">${item.name} ${item.upgradeLevel ? `(+${item.upgradeLevel})` : ''}</h4>
                    <small class="rarity-tag" style="color: ${rarity.color}">${rarity.name.toUpperCase()} · ${item.slot ? item.slot.toUpperCase() : 'CONSUMABLE'}</small>
                </div>
            </div>

            <div class="detail-stats">
                ${statLines.join("")}
                ${item.description ? `<p class="item-desc">${item.description}</p>` : ''}
            </div>

            <div class="detail-actions">
                ${item.slot ? (
                    isEquipped ?
                    `<button class="btn-action-unequip" onclick="window.GameAPI.inventory.unequipSlot('${item.slot}')">UNEQUIP</button>` :
                    `<button class="btn-action-equip" onclick="window.GameAPI.inventory.equipItem('${item.instanceId}')">EQUIP</button>`
                ) : (
                    `<button class="btn-action-use" onclick="window.InventoryManager.usePotion('${item.id}')">USE CONSUMABLE</button>`
                )}

                ${item.slot && upgCost ? `
                    <button class="btn-action-upgrade" onclick="window.GameAPI.inventory.upgradeItem('${item.instanceId}')">
                        🔨 UPGRADE (+1)
                        <small>✦ ${upgCost.gold.toLocaleString()}g + ${upgCost.matQty}x ${upgCost.matKey}</small>
                    </button>
                ` : ''}

                ${!isEquipped ? `
                    <button class="btn-action-sell" onclick="window.GameAPI.inventory.sellItem('${item.instanceId}')">
                        💰 SELL FOR ${sellPrice.toLocaleString()}g
                    </button>
                ` : ''}
            </div>
        `;
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

            const card = document.createElement("div");
            card.className = "craft-card";
            card.innerHTML = `
                <div class="craft-info">
                    <span class="craft-icon">${item.icon}</span>
                    <div>
                        <strong style="color: ${rarity.color}">${item.name}</strong>
                        <small>${reqs.join(" · ")}</small>
                    </div>
                </div>
                <button class="btn-craft" onclick="window.InventoryManager.craftItem('${recipe.itemId}')">CRAFT</button>
            `;
            grid.appendChild(card);
        });
    },

    renderShop() {
        const grid = document.getElementById("shopGrid");
        const state = window.gameState;
        if (!grid || !window.ShopData) return;

        grid.innerHTML = "";

        let items = window.ShopData;
        if (this.currentShopFilter !== "all") {
            items = items.filter(s => s.category === this.currentShopFilter);
        }

        items.forEach(shopItem => {
            let name = shopItem.name;
            let icon = shopItem.icon;
            let color = "#e0dede";

            if (shopItem.itemId && window.ItemsData[shopItem.itemId]) {
                const it = window.ItemsData[shopItem.itemId];
                name = it.name;
                icon = it.icon;
                const r = window.RarityData[it.rarity] || window.RarityData.common;
                color = r.color;
            }

            const canLevel = state.player.level >= (shopItem.reqLevel || 1);
            const canAfford = state.canAfford(shopItem.costGold);

            const card = document.createElement("div");
            card.className = "shop-card";
            card.innerHTML = `
                <div class="shop-card-icon">${icon}</div>
                <div class="shop-card-info">
                    <strong style="color: ${color}">${name}</strong>
                    <small>Req Lvl: ${shopItem.reqLevel || 1} · ✦ ${shopItem.costGold.toLocaleString()}g</small>
                </div>
                <button class="btn-buy" ${!canLevel || !canAfford ? 'disabled' : ''} onclick="window.GameAPI.shop.buyItem('${shopItem.id}')">
                    BUY
                </button>
            `;
            grid.appendChild(card);
        });
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
    showTempleModal() {
        const modal = document.getElementById("templeModal");
        if (modal) modal.classList.add("visible");
    },

    hideTempleModal() {
        const modal = document.getElementById("templeModal");
        if (modal) modal.classList.remove("visible");
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
            document.getElementById("vicRewardNext").textContent = details.nextMap ? `🗺️ Unlocked: ${details.nextMap}!` : `✨ Realm Fully Conquered!`;
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

