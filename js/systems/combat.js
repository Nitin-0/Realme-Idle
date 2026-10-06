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

        // Fatigue multiplier
        if (state.getFatigueMultiplier) {
            damage *= state.getFatigueMultiplier();
        }

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
        if (typeof document === "undefined") return;
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
        if (!state.player.hasCompletedOnboarding) {
            return;
        }

        if (state.combat.inTemple) {
            // Resting in Temple recovers fatigue and heals
            if (state.reduceFatigue && (state.player.fatigue || 0) > 0) {
                state.reduceFatigue(10);
            }
            return;
        }

        // 0. Crown Manager Passive Combat Tick
        if (window.CrownManager) {
            window.CrownManager.combatTick();
            if (!state.combat.currentMob) return; // enemy died to aura
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
        const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
        if (state.player.autoPotion && (state.player.hp / effMaxHp) <= 0.35 && state.player.hp < effMaxHp) {
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
            const critMult = state.getEffectiveCritDmg ? state.getEffectiveCritDmg() : state.player.critDmg;
            baseDmg *= critMult;
        }

        // 2. Dodge Check (5% base mob dodge)
        if (Math.random() < 0.05 && !isCrit) {
            isMiss = true;
            this.showDamagePopup("MISS!", false, true);
            state.notify();
            return;
        }

        // Crown Executioner and Holy Retribution check
        if (window.CrownManager) {
            const hook = window.CrownManager.onPlayerAttackHit(mob, isCrit, baseDmg);
            if (hook.executed) {
                this.onMobDefeated();
                return;
            }
            if (hook.bonusDmg) {
                baseDmg += hook.bonusDmg;
            }
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

        // Accumulate fatigue while actively fighting
        if (state.addFatigue) state.addFatigue(1.2);

        // 100% Fatigue Exhaustion Recoil Penalty: Deplete HP on attack!
        if (state.getFatigue && state.getFatigue() >= 100) {
            const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
            const recoilDmg = Math.max(8, Math.floor(effMaxHp * 0.06));
            state.player.hp -= recoilDmg;
            this.showDamagePopup(`😫 -${recoilDmg} HP (100% Fatigue!)`, false, false, "incoming");
            if (state.addLog) {
                state.addLog(`⚠️ EXHAUSTION RECOIL: Attacking at 100% Fatigue tore into your body for -${recoilDmg} HP! Rest or quaff a tonic!`, "danger", "😫");
            }
            if (state.player.hp <= 0) {
                state.player.hp = 0;
                this.onPlayerDeath();
                state.notify();
                return;
            }
        }

        // Lifesteal Recovery
        const lifestealPct = state.getEffectiveLifesteal();
        if (lifestealPct > 0) {
            const effMax = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
            const healed = Math.floor(finalDmg * lifestealPct);
            if (window.CrownManager) {
                window.CrownManager.healPlayer(healed, "Lifesteal");
            } else {
                state.player.hp = Math.min(effMax, state.player.hp + healed);
            }
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
            const critMult = state.getEffectiveCritDmg ? state.getEffectiveCritDmg() : state.player.critDmg;
            baseDmg *= critMult;
        }

        // Crown Executioner and Holy Retribution check
        if (window.CrownManager) {
            const hook = window.CrownManager.onPlayerAttackHit(mob, isCrit, baseDmg);
            if (hook.executed) {
                this.onMobDefeated();
                return;
            }
            if (hook.bonusDmg) {
                baseDmg += hook.bonusDmg;
            }
        }

        if (window.devMode && window.devMode.enabled && window.devMode.oneHitKill) {
            baseDmg = mob.hp;
        }

        const finalDmg = Math.max(1, Math.floor(baseDmg));
        mob.hp -= finalDmg;

        // Accumulate fatigue on strike
        if (state.addFatigue) state.addFatigue(1.0);

        // 100% Fatigue Exhaustion Recoil Penalty: Deplete HP on attack!
        if (state.getFatigue && state.getFatigue() >= 100) {
            const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
            const recoilDmg = Math.max(8, Math.floor(effMaxHp * 0.06));
            state.player.hp -= recoilDmg;
            this.showDamagePopup(`😫 -${recoilDmg} HP (100% Fatigue!)`, false, false, "incoming");
            if (state.addLog) {
                state.addLog(`⚠️ EXHAUSTION RECOIL: Attacking at 100% Fatigue tore into your body for -${recoilDmg} HP! Rest or quaff a tonic!`, "danger", "😫");
            }
            if (state.player.hp <= 0) {
                state.player.hp = 0;
                this.onPlayerDeath();
                state.notify();
                return;
            }
        }

        const lifestealPct = state.getEffectiveLifesteal();
        if (lifestealPct > 0) {
            const effMax = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
            const healed = Math.floor(finalDmg * lifestealPct);
            if (window.CrownManager) {
                window.CrownManager.healPlayer(healed, "Lifesteal");
            } else {
                state.player.hp = Math.min(effMax, state.player.hp + healed);
            }
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
        const skill = state.getActiveSkill ? state.getActiveSkill() : ((window.HeroesData[state.player.heroClass] || window.HeroesData.knight).skill);
        if (!skill) return false;

        if (state.player.skills.activeCooldown > 0 && !(window.devMode && window.devMode.noCooldowns)) {
            return false;
        }

        const mob = state.combat.currentMob;
        if (!mob) return false;

        // Calculate skill damage with upgraded multiplier
        const baseAtk = this.calculatePlayerDamage();
        let skillDmg = Math.floor(baseAtk * (skill.damageMult || 2.0));

        // Crown hooks (Blood Price, Retribution, Execution)
        if (window.CrownManager) {
            const hook = window.CrownManager.onPlayerAttackHit(mob, false, skillDmg);
            if (hook.executed) {
                this.onMobDefeated();
                return true;
            }
            if (hook.bonusDmg) {
                skillDmg += hook.bonusDmg;
            }
        }

        // Damage mob
        mob.hp -= skillDmg;

        // Apply heal if any
        if (skill.healPct && skill.healPct > 0) {
            const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
            const healed = Math.floor(effMaxHp * skill.healPct);
            state.player.hp = Math.min(effMaxHp, state.player.hp + healed);
            this.showDamagePopup(`+${healed} HP`, false, false, "heal");
        }

        // Apply temporary buff if defined
        if (skill.buff) {
            // Remove existing buff with same stat
            state.player.activeBuffs = (state.player.activeBuffs || []).filter(b => b.name !== skill.buff.name);
            state.player.activeBuffs.push({ ...skill.buff });
        }

        // Reset cooldown (fatigue penalty applies if collapsed)
        const fatiguePenalty = (state.getFatigue && state.getFatigue() >= 100) ? 1.4 : 1.0;
        state.player.skills.activeCooldown = (window.devMode && window.devMode.noCooldowns) ? 0 : Math.round(skill.cooldown * fatiguePenalty);

        // Visual FX
        const lvlTag = skill.level > 1 ? ` (Lv.${skill.level})` : '';
        this.showDamagePopup(`💥 ${skill.name}${lvlTag}! -${skillDmg}`, true, false, "skill");

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`⚡ CAST: ${skill.name}${lvlTag} for ${skillDmg} DMG!`, "success");
        }

        if (mob.hp <= 0) {
            this.onMobDefeated();
        } else {
            state.notify();
        }

        return true;
    },

    rest() {
        const state = window.gameState;
        if (state.combat.autoFight) {
            state.combat.autoFight = false;
        }
        state.combat.inTemple = true;
        if (state.reduceFatigue) state.reduceFatigue(60);
        const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
        state.player.hp = Math.min(effMaxHp, Math.round(state.player.hp + effMaxHp * 0.50));
        this.showDamagePopup("💤 Camped & Rested!", false, false, "heal");
        if (state.addLog) {
            state.addLog("Camp pitched. Hero took a deep rest, recovering fatigue and wounds.", "system", "💤");
        }
        state.save();
        state.notify();
    },

    checkAutoPotion() {
        const state = window.gameState;
        const pots = state.player.potions;
        if (!pots) return;

        const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
        if (state.player.hp >= effMaxHp) return;

        if (pots.potion_minor > 0 && (state.player.hp / effMaxHp) > 0.25) {
            window.InventoryManager.usePotion("potion_minor");
        } else if (pots.potion_major > 0) {
            window.InventoryManager.usePotion("potion_major");
        } else if (pots.potion_full > 0) {
            window.InventoryManager.usePotion("potion_full");
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

        // Reset Guardian Angel single-use trigger for the next battle
        if (state.combat) {
            state.combat.guardianAngelUsed = false;
        }

        // Secret Equilibrium Boss defeated hook
        if (mob.id === "weaver_of_duality" && window.CrownManager) {
            window.CrownManager.onParadoxBossDefeated();
        }

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

        if (bossMob.id === "weaver_of_duality") {
            const bonusGold = (bossMob.goldReward || 20000);
            const bonusXp = (bossMob.xpReward || 10000);
            state.addGold(bonusGold);
            state.addXp(bonusXp);
            if (state.addLog) {
                state.addLog(`👑 PARADOX SHATTERED! You defeated ${bossMob.name}! (+${bonusGold.toLocaleString()}g, +${bonusXp.toLocaleString()} XP)`, "boss", "👑");
            }
            if (window.SpawningManager) {
                window.SpawningManager.spawnNextMob();
            }
            return;
        }

        const currentMap = window.MapsData[state.world.currentMapId] || window.MapsData.moonlit_vale;
        const currentIdx = currentMap.realmIndex || 1;
        const nextMap = Object.values(window.MapsData).find(m => m.realmIndex === currentIdx + 1);

        // Unlock deeper version for current map if available
        const currentDepth = state.getMapCurrentDepth ? state.getMapCurrentDepth(currentMap.id) : 1;
        const currentTier = state.getDepthTier ? state.getDepthTier(currentMap.id, currentDepth) : { roman: "I" };
        const nextDepth = state.unlockNextDepth ? state.unlockNextDepth(currentMap.id) : null;
        const nextDepthTier = nextDepth ? (state.getDepthTier ? state.getDepthTier(currentMap.id, nextDepth) : { roman: "II", subtitle: "Deeper" }) : null;

        // Kingdom Domain Milestone: Defeating Boss of Moonlit Vale III
        if (currentMap.id === "moonlit_vale" && currentDepth >= 3) {
            if (!state.player.moonlitVale3Cleared) {
                state.player.moonlitVale3Cleared = true;
                if (state.addLog) {
                    state.addLog(`👑 ROYAL DECREE: Having banished the foul beast from this forest, the High King granted you sovereign land! Kingdom Domain is now unlocked!`, "legendary", "👑");
                }
            }
        }

        if (nextMap) {
            state.unlockMap(nextMap.id);
        }

        const bonusGold = (bossMob.goldReward || 100) * 3;
        const bonusXp = (bossMob.xpReward || 50) * 2;
        state.addGold(bonusGold);
        state.addXp(bonusXp);

        if (state.addLog) {
            state.addLog(`🏆 REALM CLEARED! You defeated Boss ${bossMob.name}! (+${bonusGold.toLocaleString()}g, +${bonusXp.toLocaleString()} XP)`, "boss", "🏆");
            if (nextDepthTier) {
                state.addLog(`🌲 Discovered deeper territory: ${currentMap.name} ${nextDepthTier.roman} (${nextDepthTier.subtitle})!`, "travel", "🌲");
            }
            if (nextMap) {
                state.addLog(`🗺️ Unlocked new realm: ${nextMap.name} [Realm ${nextMap.roman || nextMap.realmIndex}]!`, "travel", "🗺️");
            }
        }

        // Reset stage for future runs
        state.combat.stage = 1;

        if (window.UIManager && typeof window.UIManager.showVictoryModal === "function") {
            window.UIManager.showVictoryModal({
                bossName: bossMob.name,
                mapName: `${currentMap.name} ${currentTier.roman}`,
                currentMapId: currentMap.id,
                currentDepth: currentDepth,
                nextDepth: nextDepth ? `${currentMap.name} ${nextDepthTier.roman}` : null,
                nextDepthTier: nextDepthTier,
                nextDepthNum: nextDepth,
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
        let dmgTaken = Math.max(1, Math.floor(rawDmg - defense * 0.5));

        // Legendary Crown: Divine Protection (chance to negate) and Overheal Shield absorption
        if (window.CrownManager) {
            dmgTaken = window.CrownManager.onIncomingDamage(dmgTaken);
        }

        if (dmgTaken <= 0) {
            return;
        }

        // Legendary Crown: Guardian Angel lethal save (once per encounter)
        if (window.CrownManager && window.CrownManager.checkGuardianAngel(dmgTaken)) {
            return;
        }

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
        if (state.combat) {
            state.combat.guardianAngelUsed = false;
            if (state.combat.isDestabilized) {
                state.combat.isDestabilized = false;
                if (window.CrownManager) window.CrownManager.updateVisualAtmosphere();
            }
        }
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
