/* =========================================================
   REALM IDLE SYSTEMS - ADVANCED COMBAT MANAGER
========================================================= */

window.CombatManager = {
    calculatePlayerDamage() {
        const state = window.gameState;
        let damage = state.getEffectiveAttack();

        // Weather multiplier
        const weather = window.WeatherData ? window.WeatherData[state.world.currentWeatherId] : null;
        if (weather) damage *= weather.playerDmgMult;

        // World Event / Scenario multiplier
        if (state.world.activeEventId && window.EventsData[state.world.activeEventId]) {
            damage *= window.EventsData[state.world.activeEventId].playerDmgMult;
        }
        if (state.world.activeScenarioId && window.ScenariosData[state.world.activeScenarioId]) {
            damage *= window.ScenariosData[state.world.activeScenarioId].modifiers.playerDmgMult;
        }

        // Dev Mode multiplier
        if (window.devMode && window.devMode.enabled) {
            damage *= window.devMode.damageMultiplier;
        }

        return Math.max(1, Math.floor(damage));
    },

    showDamagePopup(text, isCrit = false, isMiss = false, customType = "") {
        const arena = document.getElementById("arena");
        if (!arena) return;

        const popup = document.createElement("div");
        popup.className = `damage-popup ${isCrit ? "crit" : ""} ${isMiss ? "miss" : ""} ${customType}`;
        popup.textContent = text;

        popup.style.left = (40 + Math.random() * 15) + "%";
        popup.style.top = (35 + Math.random() * 15) + "%";

        arena.appendChild(popup);

        setTimeout(() => {
            popup.remove();
        }, 1100);
    },

    attackTick() {
        const state = window.gameState;
        if (!state.player.hasCompletedOnboarding || state.combat.inTemple) {
            return;
        }

        // 1. Tick Buffs Duration & Expiration
        if (state.player.activeBuffs && state.player.activeBuffs.length > 0) {
            state.player.activeBuffs.forEach(b => b.duration--);
            state.player.activeBuffs = state.player.activeBuffs.filter(b => b.duration > 0);
        }

        // 2. Tick Skill Cooldown
        if (state.player.skills.activeCooldown > 0) {
            const cdReduction = (window.devMode && window.devMode.noCooldowns) ? 999 : 1;
            state.player.skills.activeCooldown = Math.max(0, state.player.skills.activeCooldown - cdReduction);
        }

        // 3. Emergency Auto-Potion Check (when HP <= 35%)
        if (state.player.autoPotion && (state.player.hp / state.player.maxHp) <= 0.35) {
            this.checkAutoPotion();
        }

        // If autoFight is disabled, do not execute automated attack
        if (!state.combat.autoFight) {
            return;
        }

        if (!state.combat.currentMob) {
            if (window.SpawningManager) window.SpawningManager.spawnNextMob();
            return;
        }

        // 4. Auto-Cast Skill if ready
        if (state.player.skills.autoCast && state.player.skills.activeCooldown <= 0) {
            this.triggerSkill();
            if (!state.combat.currentMob) return; // enemy died to skill
        }

        const mob = state.combat.currentMob;
        let baseDmg = this.calculatePlayerDamage();
        let isCrit = false;
        let isMiss = false;

        // 1. Crit Check
        const critChance = state.getEffectiveCritChance();
        if (Math.random() < critChance) {
            isCrit = true;
            baseDmg *= state.player.critDmg;
        }

        // 2. Dodge Check (5% base mob dodge)
        if (Math.random() < 0.05 && !isCrit) {
            isMiss = true;
            this.showDamagePopup("MISS!", false, true);
            state.notify();
            return;
        }

        // 3. One hit kill cheat
        if (window.devMode && window.devMode.enabled && window.devMode.oneHitKill) {
            baseDmg = mob.hp;
        }

        // 4. Multi-Phase Boss Handling
        if (mob.isBoss) {
            const hpRatio = mob.hp / mob.maxHp;
            if (hpRatio <= 0.30 && mob.currentPhase < 3) {
                mob.currentPhase = 3;
                mob.phaseText = "🔥 PHASE 3: ENRAGED FRENZY!";
                if (window.devMode) window.devMode.logToConsole("⚠️ BOSS ENTERED PHASE 3: FRENZY MODE!", "error");
            } else if (hpRatio <= 0.70 && mob.currentPhase < 2) {
                mob.currentPhase = 2;
                mob.phaseText = "⚡ PHASE 2: SHIELD & STORMS!";
                if (window.devMode) window.devMode.logToConsole("⚠️ BOSS ENTERED PHASE 2!", "warn");
            }
        }

        // Apply Damage to Mob
        const finalDmg = Math.max(1, Math.floor(baseDmg));
        mob.hp -= finalDmg;

        // Lifesteal Recovery
        const lifestealPct = state.getEffectiveLifesteal();
        if (lifestealPct > 0) {
            const healed = Math.floor(finalDmg * lifestealPct);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + healed);
        }

        this.showDamagePopup(isCrit ? `CRIT! -${finalDmg}` : `-${finalDmg}`, isCrit, false);

        const enemyEl = document.getElementById("enemy");
        if (enemyEl) {
            enemyEl.classList.remove("hit");
            void enemyEl.offsetWidth;
            enemyEl.classList.add("hit");
        }

        if (mob.hp <= 0) {
            this.onMobDefeated();
        } else {
            // Mob counter-attack
            this.mobAttackTick(mob);
            state.notify();
        }
    },

    manualStrike() {
        const state = window.gameState;
        if (!state.player.hasCompletedOnboarding || state.combat.inTemple) return;

        if (!state.combat.currentMob) {
            if (window.SpawningManager) window.SpawningManager.spawnNextMob();
            return;
        }

        const mob = state.combat.currentMob;
        let baseDmg = this.calculatePlayerDamage();
        let isCrit = false;

        const critChance = state.getEffectiveCritChance();
        if (Math.random() < critChance) {
            isCrit = true;
            baseDmg *= state.player.critDmg;
        }

        if (window.devMode && window.devMode.enabled && window.devMode.oneHitKill) {
            baseDmg = mob.hp;
        }

        const finalDmg = Math.max(1, Math.floor(baseDmg));
        mob.hp -= finalDmg;

        const lifestealPct = state.getEffectiveLifesteal();
        if (lifestealPct > 0) {
            const healed = Math.floor(finalDmg * lifestealPct);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + healed);
        }

        this.showDamagePopup(isCrit ? `CRIT! -${finalDmg}` : `-${finalDmg}`, isCrit, false);

        const enemyEl = document.getElementById("enemy");
        if (enemyEl) {
            enemyEl.classList.remove("hit");
            void enemyEl.offsetWidth;
            enemyEl.classList.add("hit");
        }

        if (mob.hp <= 0) {
            this.onMobDefeated();
        } else {
            this.mobAttackTick(mob);
            state.notify();
        }
    },

    triggerSkill() {
        const state = window.gameState;
        const heroDef = window.HeroesData[state.player.heroClass] || window.HeroesData.knight;
        if (!heroDef || !heroDef.skill) return false;

        if (state.player.skills.activeCooldown > 0 && !(window.devMode && window.devMode.noCooldowns)) {
            return false;
        }

        const skill = heroDef.skill;
        const mob = state.combat.currentMob;
        if (!mob) return false;

        // Calculate skill damage
        const baseAtk = this.calculatePlayerDamage();
        const skillDmg = Math.floor(baseAtk * (skill.damageMult || 2.0));

        // Damage mob
        mob.hp -= skillDmg;

        // Apply heal if any
        if (skill.healPct && skill.healPct > 0) {
            const healed = Math.floor(state.player.maxHp * skill.healPct);
            state.player.hp = Math.min(state.player.maxHp, state.player.hp + healed);
            this.showDamagePopup(`+${healed} HP`, false, false, "heal");
        }

        // Apply temporary buff if defined
        if (skill.buff) {
            // Remove existing buff with same stat
            state.player.activeBuffs = state.player.activeBuffs.filter(b => b.name !== skill.buff.name);
            state.player.activeBuffs.push({ ...skill.buff });
        }

        // Reset cooldown
        state.player.skills.activeCooldown = (window.devMode && window.devMode.noCooldowns) ? 0 : skill.cooldown;

        // Visual FX
        this.showDamagePopup(`💥 ${skill.name}! -${skillDmg}`, true, false, "skill");

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`⚡ CAST: ${skill.name} for ${skillDmg} DMG!`, "success");
        }

        if (mob.hp <= 0) {
            this.onMobDefeated();
        } else {
            state.notify();
        }

        return true;
    },

    checkAutoPotion() {
        const state = window.gameState;
        const pots = state.player.potions;
        if (!pots) return;

        if (pots.potion_full > 0) {
            window.InventoryManager.usePotion("potion_full");
        } else if (pots.potion_major > 0) {
            window.InventoryManager.usePotion("potion_major");
        } else if (pots.potion_minor > 0) {
            window.InventoryManager.usePotion("potion_minor");
        }
    },

    onMobDefeated() {
        const state = window.gameState;
        const mob = state.combat.currentMob;
        if (!mob) return;

        state.addGold(mob.goldReward);
        state.addXp(mob.xpReward);

        // Record in Journal
        if (window.JournalManager) window.JournalManager.recordMob(mob.id);

        // Roll Loot Drops
        if (window.InventoryManager) window.InventoryManager.rollLootDrop(mob);

        // Check Quests
        if (window.QuestManager) window.QuestManager.checkProgress("kill", mob.id, 1);

        const wasBoss = !!mob.isBoss;
        state.combat.currentMob = null;

        if (wasBoss) {
            this.handleBossDefeated(mob);
        } else {
            // Stage progression
            state.combat.stage = (state.combat.stage || 1) + 1;
            if (state.combat.stage > state.combat.maxStages) {
                state.combat.stage = state.combat.maxStages;
            }

            const statusEl = document.getElementById("status");
            if (statusEl) {
                if (state.combat.stage === state.combat.maxStages) {
                    statusEl.textContent = `👑 BOSS ENCOUNTER! Defeat the Realm Guardian to clear the area!`;
                } else {
                    statusEl.textContent = `✦ ${mob.name} Defeated · Stage ${state.combat.stage}/${state.combat.maxStages}`;
                }
            }

            if (window.SpawningManager) {
                window.SpawningManager.spawnNextMob();
            }
        }
        state.notify();
    },

    handleBossDefeated(bossMob) {
        const state = window.gameState;
        const currentMap = window.MapsData[state.world.currentMapId] || window.MapsData.moonlit_vale;
        const currentIdx = currentMap.realmIndex || 1;
        const nextMap = Object.values(window.MapsData).find(m => m.realmIndex === currentIdx + 1);

        if (nextMap) {
            state.unlockMap(nextMap.id);
        }

        const bonusGold = (bossMob.goldReward || 100) * 3;
        const bonusXp = (bossMob.xpReward || 50) * 2;
        state.addGold(bonusGold);
        state.addXp(bonusXp);

        if (state.addLog) {
            state.addLog(`🏆 REALM CLEARED! You defeated Boss ${bossMob.name}! (+${bonusGold.toLocaleString()}g, +${bonusXp.toLocaleString()} XP)`, "boss", "🏆");
            if (nextMap) {
                state.addLog(`🗺️ Unlocked new realm: ${nextMap.name} [Realm ${nextMap.roman || nextMap.realmIndex}]!`, "travel", "🗺️");
            }
        }

        // Reset stage for future runs
        state.combat.stage = 1;

        if (window.UIManager && typeof window.UIManager.showVictoryModal === "function") {
            window.UIManager.showVictoryModal({
                bossName: bossMob.name,
                mapName: currentMap.name,
                nextMap: nextMap ? nextMap.name : null,
                nextMapId: nextMap ? nextMap.id : null,
                gold: bonusGold,
                xp: bonusXp
            });
        }

        const statusEl = document.getElementById("status");
        if (statusEl) {
            statusEl.textContent = `🏆 REALM CLEARED! You defeated ${bossMob.name}!`;
        }

        if (window.SpawningManager) {
            window.SpawningManager.spawnNextMob();
        }
    },

    mobAttackTick(mob) {
        const state = window.gameState;

        // God Mode bypass
        if (window.devMode && window.devMode.enabled && window.devMode.godMode) return;

        // Player dodge check
        const dodgeChance = state.getEffectiveDodge();
        if (Math.random() < dodgeChance) {
            this.showDamagePopup("DODGE!", false, true);
            return;
        }

        // Mob damage reduced by player defense (min 1)
        const rawDmg = mob.damage || 1;
        const defense = state.getEffectiveDefense();
        const dmgTaken = Math.max(1, Math.floor(rawDmg - defense * 0.5));

        state.player.hp = Math.max(0, state.player.hp - dmgTaken);

        // Show incoming damage popup (styled differently)
        this.showIncomingDamagePopup(dmgTaken);

        if (state.player.hp <= 0) {
            this.onPlayerDeath();
        }
    },

    showIncomingDamagePopup(dmg) {
        const arena = document.getElementById("arena");
        if (!arena) return;

        const popup = document.createElement("div");
        popup.className = "damage-popup incoming";
        popup.textContent = `-${dmg} HP`;
        popup.style.left = (25 + Math.random() * 10) + "%";
        popup.style.top  = (55 + Math.random() * 10) + "%";
        arena.appendChild(popup);
        setTimeout(() => popup.remove(), 900);
    },

    onPlayerDeath() {
        const state = window.gameState;
        state.respawnAtTemple();

        const statusEl = document.getElementById("status");
        if (statusEl) {
            statusEl.textContent = "💀 Your hero fell in battle... You have awakened at the Temple of Revival.";
        }

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole("💀 PLAYER DEFEATED — Resurrected at Temple of Solitude.", "error");
        }

        if (window.UIManager && typeof window.UIManager.showTempleModal === "function") {
            window.UIManager.showTempleModal();
        }
    }
};
