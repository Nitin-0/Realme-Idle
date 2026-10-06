/* =========================================================
   REALM IDLE SYSTEMS - LEGENDARY BREAK-THE-RULES CROWNS
   - Demon Crown: "Power at a Price"
   - Divine Crown: "Blessing of Heaven"
   - Crown of Equilibrium: "The Sovereign of Duality" (Secret Fusion)
========================================================= */

window.CrownManager = {
    audioCtx: null,

    _lifespanInterval: null,

    init() {
        this.updateVisualAtmosphere();
        // Check coexistence periodically or on state notifications
        if (window.gameState && window.gameState.subscribe) {
            window.gameState.subscribe(() => {
                this.updateVisualAtmosphere();
            });
        }
        // 1-second interval to monitor 30-minute crown lifespans and update live countdown badges
        if (!this._lifespanInterval) {
            this._lifespanInterval = setInterval(() => {
                this.checkCrownLifespans();
                this.updateCrownTimerLabels();
            }, 1000);
        }
    },

    isCrownItem(item) {
        if (!item) return false;
        return item.slot === "crown" || ["demon_crown", "divine_crown", "equilibrium_crown"].includes(item.id);
    },

    getCrownRemainingSeconds(item) {
        if (!item) return 0;
        if (!item.expiresAt) {
            item.expiresAt = Date.now() + (item.duration || 1800) * 1000;
        }
        return Math.max(0, Math.ceil((item.expiresAt - Date.now()) / 1000));
    },

    formatCrownTime(seconds) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    },

    checkCrownLifespans() {
        const state = window.gameState;
        if (!state || !state.player) return;
        const now = Date.now();
        let changed = false;

        // Check equipped crown
        const equipped = state.player.equipment && state.player.equipment.crown;
        if (equipped && this.isCrownItem(equipped)) {
            if (!equipped.expiresAt) {
                equipped.expiresAt = now + (equipped.duration || 1800) * 1000;
                changed = true;
            } else if (now >= equipped.expiresAt) {
                this.expireCrown(equipped, true);
                changed = true;
            }
        }

        // Check inventory crowns
        if (state.player.inventory && state.player.inventory.length > 0) {
            for (let i = state.player.inventory.length - 1; i >= 0; i--) {
                const item = state.player.inventory[i];
                if (item && this.isCrownItem(item)) {
                    if (!item.expiresAt) {
                        item.expiresAt = now + (item.duration || 1800) * 1000;
                        changed = true;
                    } else if (now >= item.expiresAt) {
                        this.expireCrown(item, false);
                        changed = true;
                    }
                }
            }
        }

        if (changed && state.notify) {
            state.notify();
        }
    },

    expireCrown(item, wasEquipped) {
        const state = window.gameState;
        if (!state) return;
        if (wasEquipped) {
            state.player.equipment.crown = null;
            if (state.combat && state.combat.isDestabilized) {
                state.combat.isDestabilized = false;
            }
            this.updateVisualAtmosphere();
            if (state.addLog) {
                state.addLog(`⏳ ${item.name || 'Legendary Crown'} dissolved into astral ether! Its 30-minute celestial duration has expired.`, "warning", "👑");
            }
        } else {
            if (state.player.inventory) {
                state.player.inventory = state.player.inventory.filter(i => (i.instanceId ? i.instanceId !== item.instanceId : i !== item));
            }
            if (state.addLog) {
                state.addLog(`⏳ ${item.name || 'Legendary Crown'} in your inventory dissolved into ether after 30 minutes!`, "warning", "👑");
            }
        }
        if (window.MainEngine) {
            if (window.MainEngine.renderEquipment) window.MainEngine.renderEquipment();
            if (window.MainEngine.renderInventory) window.MainEngine.renderInventory();
            if (window.MainEngine.updateUI) window.MainEngine.updateUI();
        }
    },

    updateCrownTimerLabels() {
        if (typeof document === "undefined") return;
        document.querySelectorAll("[data-crown-instance]").forEach(el => {
            const instId = el.getAttribute("data-crown-instance");
            const state = window.gameState;
            if (!state) return;
            let item = null;
            if (state.player.equipment && state.player.equipment.crown && state.player.equipment.crown.instanceId === instId) {
                item = state.player.equipment.crown;
            } else if (state.player.inventory) {
                item = state.player.inventory.find(i => i.instanceId === instId);
            }
            if (item) {
                const rem = this.getCrownRemainingSeconds(item);
                el.textContent = `⏳ ${this.formatCrownTime(rem)} remaining`;
            }
        });
    },

    getAudioContext() {
        if (!this.audioCtx && (typeof AudioContext !== "undefined" || typeof webkitAudioContext !== "undefined")) {
            const AudioClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioClass();
        }
        if (this.audioCtx && this.audioCtx.state === "suspended") {
            this.audioCtx.resume().catch(() => {});
        }
        return this.audioCtx;
    },

    playDemonSound() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(65, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 1.2);
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 1.2);
        } catch (e) {}
    },

    playDivineSound() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
                gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 1.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(ctx.currentTime + idx * 0.08);
                osc.stop(ctx.currentTime + idx * 0.08 + 1.4);
            });
        } catch (e) {}
    },

    playEquilibriumSound() {
        try {
            const ctx = this.getAudioContext();
            if (!ctx) return;
            // Dissonant chord resolving to cosmic harmony
            [110, 220, 311.13, 440, 554.37, 880].forEach((freq) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "triangle";
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(freq * 1.5, ctx.currentTime + 2.0);
                gain.gain.setValueAtTime(0.2, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 2.2);
            });
        } catch (e) {}
    },

    /* =========================
       EQUIPPED CROWN CHECKS
    ========================= */
    getEquippedCrown() {
        const state = window.gameState;
        if (!state || !state.player || !state.player.equipment) return null;
        return state.player.equipment.crown || null;
    },

    isDemonCrownEquipped() {
        const c = this.getEquippedCrown();
        return c && c.id === "demon_crown";
    },

    isDivineCrownEquipped() {
        const c = this.getEquippedCrown();
        return c && c.id === "divine_crown";
    },

    isEquilibriumCrownEquipped() {
        const c = this.getEquippedCrown();
        return c && c.id === "equilibrium_crown";
    },

    isDestabilized() {
        const state = window.gameState;
        return state && state.combat && state.combat.isDestabilized === true;
    },

    /* =========================
       COEXISTENCE & EQUILIBRIUM TRIGGER
    ========================= */
    checkCrownCoexistence() {
        const state = window.gameState;
        if (!state || !state.player) return;

        const hasDemon = (state.player.equipment.crown && state.player.equipment.crown.id === "demon_crown") ||
            (state.player.inventory && state.player.inventory.some(i => i.id === "demon_crown"));

        const hasDivine = (state.player.equipment.crown && state.player.equipment.crown.id === "divine_crown") ||
            (state.player.inventory && state.player.inventory.some(i => i.id === "divine_crown"));

        if (hasDemon && hasDivine && !this.isDestabilized() && !state.player.equilibriumForged) {
            this.triggerDestabilizationEvent();
        }
    },

    triggerDestabilizationEvent() {
        const state = window.gameState;
        if (!state) return;

        state.combat.isDestabilized = true;
        this.playEquilibriumSound();

        // Unequip separate crowns and set temporary unstable equilibrium
        state.player.equipment.crown = {
            id: "equilibrium_crown",
            instanceId: "crown_eq_" + Date.now(),
            name: "Crown of Equilibrium (Destabilized)",
            slot: "crown",
            type: "equipment",
            rarity: "legendary",
            baseValue: 0,
            unsellable: true,
            duration: 1800,
            expiresAt: Date.now() + 1800 * 1000,
            icon: "👁️",
            stats: { attack: 300, defense: 140, hp: 500, critChance: 0.35, critDmg: 1.5, lifesteal: 0.12 },
            description: "⚫ 50% Demon + ⚪ 50% Divine. Unstable duality tearing through reality! (30m Lifespan)",
            isBreakTheRules: true,
            isDestabilized: true
        };

        if (state.addLog) {
            state.addLog("⚡ COSMIC DESTABILIZATION: Two crowns recognize the same soul!", "danger", "👁️");
        }

        // Show cinematic crisis modal
        this.showDestabilizationModal();

        // Switch to arena and spawn the secret boss
        if (window.UIManager && typeof window.UIManager.switchTab === "function") {
            window.UIManager.switchTab("arena");
        }

        if (window.SpawningManager) {
            window.SpawningManager.spawnMobById("weaver_of_duality", {
                isBoss: true,
                level: Math.max(10, state.player.level + 2)
            });
        }

        this.updateVisualAtmosphere();
        state.notify();
    },

    showDestabilizationModal() {
        const modal = document.getElementById("equilibriumModal");
        if (modal) {
            modal.style.display = "flex";
        }
    },

    closeDestabilizationModal() {
        const modal = document.getElementById("equilibriumModal");
        if (modal) {
            modal.style.display = "none";
        }
    },

    onParadoxBossDefeated() {
        const state = window.gameState;
        if (!state) return;

        state.combat.isDestabilized = false;
        state.player.equilibriumForged = true;

        // Permanently remove Demon and Divine crowns from inventory
        state.player.inventory = state.player.inventory.filter(i => i.id !== "demon_crown" && i.id !== "divine_crown");

        // Award permanent true Crown of Equilibrium
        const trueCrown = {
            id: "equilibrium_crown",
            instanceId: "crown_true_eq_" + Date.now(),
            name: "Crown of Equilibrium",
            slot: "crown",
            type: "equipment",
            rarity: "legendary",
            baseValue: 0,
            unsellable: true,
            duration: 1800,
            expiresAt: Date.now() + 1800 * 1000,
            icon: "👑",
            stats: { attack: 280, defense: 160, hp: 500, critChance: 0.25, critDmg: 1.0, lifesteal: 0.10, dodge: 0.08 },
            description: "The Sovereign of Duality. Harmonizes void and light into supreme mastery without self-destruction. (30m Lifespan)",
            crownType: "equilibrium",
            isBreakTheRules: true
        };

        state.player.equipment.crown = trueCrown;

        if (state.addLog) {
            state.addLog("👑 EQUILIBRIUM ATTAINED: The Weaver of Duality fell! Crown of Equilibrium forged!", "level", "👑");
        }

        this.playDivineSound();

        // Show grand victory modal
        const vicModal = document.getElementById("equilibriumVictoryModal");
        if (vicModal) {
            vicModal.style.display = "flex";
        }

        this.updateVisualAtmosphere();
        state.save();
        state.notify();
    },

    closeEquilibriumVictoryModal() {
        const vicModal = document.getElementById("equilibriumVictoryModal");
        if (vicModal) {
            vicModal.style.display = "none";
        }
    },

    /* =========================
       COMBAT TICK & PASSIVES
    ========================= */
    combatTick() {
        const state = window.gameState;
        if (!state || state.combat.inTemple) return;

        const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);
        const mob = state.combat.currentMob;

        // ---------------- DEMON CROWN OR DESTABILIZED ----------------
        if (this.isDemonCrownEquipped() || this.isDestabilized()) {
            // 1. Darken environment over time
            if (state.player.darknessLevel === undefined) state.player.darknessLevel = 0;
            if (state.player.darknessLevel < 100) {
                state.player.darknessLevel = Math.min(100, state.player.darknessLevel + 1);
            }

            // 2. Demonic Aura — periodic damage to nearby enemy
            if (mob && mob.hp > 0) {
                const auraDmg = Math.max(12, Math.floor(state.getEffectiveAttack() * 0.12));
                mob.hp = Math.max(0, mob.hp - auraDmg);
                if (window.CombatManager) {
                    window.CombatManager.showDamagePopup(`🔥 -${auraDmg} (Demonic Aura)`, false, false, "crit");
                }
                if (mob.hp <= 0 && window.CombatManager) {
                    window.CombatManager.onMobDefeated();
                    return;
                }
            }

            // 3. Blood Price — HP constantly drains while equipped (never drops below 1 HP)
            const bloodDrain = Math.max(4, Math.floor(effMaxHp * 0.022));
            if (state.player.hp > 1) {
                state.player.hp = Math.max(1, state.player.hp - bloodDrain);
                if (window.CombatManager) {
                    window.CombatManager.showDamagePopup(`🩸 -${bloodDrain} HP (Blood Price)`, false, false, "incoming");
                }
            }

            // 4. Low HP Glitch check
            if ((state.player.hp / effMaxHp) <= 0.30) {
                this.triggerLowHpGlitch();
            }
        } else {
            // Gradually recover darkness level when Demon Crown is unequipped
            if (state.player.darknessLevel > 0) {
                state.player.darknessLevel = Math.max(0, state.player.darknessLevel - 4);
            }
        }

        // ---------------- DIVINE CROWN OR DESTABILIZED ----------------
        if (this.isDivineCrownEquipped() || this.isDestabilized()) {
            // 1. Holy Regeneration
            const holyRegen = Math.floor(effMaxHp * 0.035) + 15;
            this.healPlayer(holyRegen, "Holy Regen");

            // 2. Purification — removes fatigue and active debuffs
            if (state.reduceFatigue) {
                state.reduceFatigue(3.5);
            }

            // 3. Radiant Presence — chance to blind current mob
            if (mob && !mob.isBlind && Math.random() < 0.20) {
                mob.isBlind = true;
                if (window.CombatManager) {
                    window.CombatManager.showDamagePopup("☀️ BLINDED BY RADIANCE!", false, false, "heal");
                }
            }
        }

        // ---------------- EQUILIBRIUM CROWN (PERMANENT STABLE) ----------------
        if (this.isEquilibriumCrownEquipped()) {
            // Harmonious cosmic regen without blood drain
            const eqRegen = Math.floor(effMaxHp * 0.025) + 12;
            this.healPlayer(eqRegen, "Cosmic Harmony");

            // Cosmic aura damage to enemy
            if (mob && mob.hp > 0) {
                const cosmicDmg = Math.max(15, Math.floor(state.getEffectiveAttack() * 0.10));
                mob.hp = Math.max(0, mob.hp - cosmicDmg);
                if (window.CombatManager) {
                    window.CombatManager.showDamagePopup(`👁️ -${cosmicDmg} (Twilight Pulse)`, false, false, "blessing");
                }
                if (mob.hp <= 0 && window.CombatManager) {
                    window.CombatManager.onMobDefeated();
                    return;
                }
            }
        }

        // ---------------- DESTABILIZED UNSTABLE CHAOS ----------------
        if (this.isDestabilized()) {
            // Random volatile paradox explosion (30% chance per tick)
            if (Math.random() < 0.30 && mob && mob.hp > 0) {
                const blastDmg = Math.floor(state.getEffectiveAttack() * (1.5 + Math.random()));
                mob.hp = Math.max(0, mob.hp - blastDmg);
                if (window.CombatManager) {
                    window.CombatManager.showDamagePopup(`💥 PARADOX SHOCKWAVE! -${blastDmg}`, true, false, "crit");
                }
                if (mob.hp <= 0 && window.CombatManager) {
                    window.CombatManager.onMobDefeated();
                }
            }
        }

        this.updateVisualAtmosphere();
    },

    /* =========================
       HEALING & OVERHEAL SHIELD
    ========================= */
    healPlayer(amount, sourceName = "Heal") {
        const state = window.gameState;
        if (!state) return 0;
        const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);

        // Demon's Last Stand healing penalty (-75% healing when HP <= 25%)
        let actualAmount = amount;
        if (this.isDemonCrownEquipped() && (state.player.hp / effMaxHp) <= 0.25) {
            actualAmount = Math.max(1, Math.floor(amount * 0.25));
        }

        // Enhanced Healing (+120% bonus) from Divine Crown
        if (this.isDivineCrownEquipped()) {
            actualAmount = Math.floor(actualAmount * 2.2);
            state.player.holyRetributionCharged = true;
        }

        const missingHp = effMaxHp - state.player.hp;
        let hpHealed = Math.min(missingHp, actualAmount);
        state.player.hp += hpHealed;

        // Overheal converts into Holy Shield for Divine / Equilibrium crowns
        const excess = actualAmount - hpHealed;
        if (excess > 0 && (this.isDivineCrownEquipped() || this.isEquilibriumCrownEquipped() || this.isDestabilized())) {
            if (state.player.holyShield === undefined) state.player.holyShield = 0;
            const maxShield = Math.floor(effMaxHp * 0.50);
            const shieldAdded = Math.min(maxShield - state.player.holyShield, excess);
            if (shieldAdded > 0) {
                state.player.holyShield += shieldAdded;
                if (window.CombatManager) {
                    window.CombatManager.showDamagePopup(`🛡️ +${shieldAdded} Holy Shield`, false, false, "heal");
                }
            }
        }

        if (hpHealed > 0 && window.CombatManager) {
            window.CombatManager.showDamagePopup(`+${hpHealed} HP (${sourceName})`, false, false, "heal");
        }

        return hpHealed;
    },

    /* =========================
       COMBAT HOOKS: ATTACK & DEFENSE
    ========================= */
    onPlayerAttackHit(mob, isCrit, baseDmg) {
        const state = window.gameState;
        if (!mob || mob.hp <= 0) return { executed: false, bonusDmg: 0 };

        // 1. Executioner (Demon Crown / Equilibrium)
        // Enemies below 15% HP have 45% chance to be executed
        if ((this.isDemonCrownEquipped() || this.isEquilibriumCrownEquipped() || this.isDestabilized()) && !mob.isBoss) {
            if ((mob.hp / mob.maxHp) <= 0.15 && Math.random() < 0.45) {
                mob.hp = 0;
                if (window.CombatManager) {
                    window.CombatManager.showDamagePopup("👹 EXECUTE! 99999", true, false, "crit");
                }
                this.shakeScreen();
                return { executed: true, bonusDmg: 0 };
            }
        }

        // 2. Holy Retribution (Divine Crown / Equilibrium)
        let bonusDmg = 0;
        if (state.player.holyRetributionCharged && (this.isDivineCrownEquipped() || this.isEquilibriumCrownEquipped() || this.isDestabilized())) {
            bonusDmg = Math.floor(baseDmg * 1.5);
            state.player.holyRetributionCharged = false;
            if (window.CombatManager) {
                window.CombatManager.showDamagePopup(`⚡ HOLY RETRIBUTION! -${bonusDmg}`, true, false, "heal");
            }
        }

        return { executed: false, bonusDmg };
    },

    onIncomingDamage(rawDmg) {
        const state = window.gameState;
        if (!state) return rawDmg;

        // 1. Divine Protection — 25% chance to negate damage completely
        if ((this.isDivineCrownEquipped() || this.isDestabilized()) && Math.random() < 0.25) {
            if (window.CombatManager) {
                window.CombatManager.showDamagePopup("🛡️ NEGATED! (Divine Protection)", false, false, "heal");
            }
            return 0;
        }

        // 2. Overheal Shield Absorption
        if (state.player.holyShield && state.player.holyShield > 0) {
            if (state.player.holyShield >= rawDmg) {
                state.player.holyShield -= rawDmg;
                if (window.CombatManager) {
                    window.CombatManager.showDamagePopup(`🌟 SHIELD ABSORBED! -${rawDmg}`, false, false, "heal");
                }
                return 0;
            } else {
                const absorbed = state.player.holyShield;
                const remaining = rawDmg - absorbed;
                state.player.holyShield = 0;
                if (window.CombatManager) {
                    window.CombatManager.showDamagePopup(`🌟 SHIELD BROKEN! -${absorbed}`, false, false, "heal");
                }
                return remaining;
            }
        }

        return rawDmg;
    },

    checkGuardianAngel(dmgTaken) {
        const state = window.gameState;
        if (!state) return false;

        const effMaxHp = state.getEffectiveMaxHp ? state.getEffectiveMaxHp() : (state.player.maxHp || 100);

        if ((this.isDivineCrownEquipped() || this.isDestabilized()) && !state.combat.guardianAngelUsed && (state.player.hp - dmgTaken) <= 0) {
            state.combat.guardianAngelUsed = true;
            state.player.hp = Math.floor(effMaxHp * 0.60);

            // Trigger full-screen golden flash
            this.triggerGuardianAngelFlash();
            this.playDivineSound();

            if (window.CombatManager) {
                window.CombatManager.showDamagePopup("🕊️ GUARDIAN ANGEL RESCUE!", true, false, "heal");
                // Smite mob with holy vengeance
                if (state.combat.currentMob) {
                    const vengeanceDmg = Math.floor(state.getEffectiveAttack() * 2.0);
                    state.combat.currentMob.hp = Math.max(0, state.combat.currentMob.hp - vengeanceDmg);
                    window.CombatManager.showDamagePopup(`⚡ ANGELIC SMITE! -${vengeanceDmg}`, true, false, "heal");
                }
            }

            if (state.addLog) {
                state.addLog("🕊️ GUARDIAN ANGEL: Divine light averted fatal strike and restored 60% HP!", "buff", "🕊️");
            }

            return true;
        }

        return false;
    },

    /* =========================
       VISUAL ATMOSPHERE & SHADERS
    ========================= */
    updateVisualAtmosphere() {
        if (typeof document === "undefined") return;
        const body = document.body;
        if (!body) return;

        const state = window.gameState;
        const darkness = (state && state.player && state.player.darknessLevel !== undefined) ? state.player.darknessLevel : 0;
        body.style.setProperty("--darkness-level", (darkness / 100).toFixed(2));

        if (this.isDestabilized()) {
            body.classList.add("equilibrium-destabilizing");
            body.classList.remove("world-of-darkness", "world-of-light", "world-of-equilibrium");
        } else if (this.isDemonCrownEquipped()) {
            body.classList.add("world-of-darkness");
            body.classList.remove("world-of-light", "world-of-equilibrium", "equilibrium-destabilizing");
        } else if (this.isDivineCrownEquipped()) {
            body.classList.add("world-of-light");
            body.classList.remove("world-of-darkness", "world-of-equilibrium", "equilibrium-destabilizing");
        } else if (this.isEquilibriumCrownEquipped()) {
            body.classList.add("world-of-equilibrium");
            body.classList.remove("world-of-darkness", "world-of-light", "equilibrium-destabilizing");
        } else {
            body.classList.remove("world-of-darkness", "world-of-light", "world-of-equilibrium", "equilibrium-destabilizing");
        }
    },

    triggerLowHpGlitch() {
        if (typeof document === "undefined") return;
        const arena = document.getElementById("arena");
        if (arena && !arena.classList.contains("ui-glitch-active")) {
            arena.classList.add("ui-glitch-active");
            setTimeout(() => {
                arena.classList.remove("ui-glitch-active");
            }, 600);
        }
    },

    triggerGuardianAngelFlash() {
        if (typeof document === "undefined" || !document.body || typeof document.body.appendChild !== "function") return;
        const flash = document.createElement("div");
        flash.className = "guardian-angel-flash-overlay";
        document.body.appendChild(flash);
        setTimeout(() => {
            flash.remove();
        }, 1200);
    },

    shakeScreen() {
        if (typeof document === "undefined") return;
        const game = document.querySelector(".game");
        if (game) {
            game.classList.add("screen-shake");
            setTimeout(() => game.classList.remove("screen-shake"), 400);
        }
    },

    /* =========================
       EQUIP WARNING MODAL (DEMON CROWN)
    ========================= */
    pendingEquipInstanceId: null,

    promptDemonEquip(itemInstanceId) {
        const state = window.gameState;
        if (!state) return;

        // If player has already accepted the curse or this isn't demon crown, proceed directly
        if (state.player.demonWarningAccepted) {
            window.InventoryManager.confirmEquipItem(itemInstanceId);
            this.playDemonSound();
            return;
        }

        this.pendingEquipInstanceId = itemInstanceId;
        const modal = document.getElementById("demonWarningModal");
        if (modal) {
            modal.style.display = "flex";
            this.playDemonSound();
        } else {
            // Fallback confirmation
            const ok = confirm("⚠️ THE FORBIDDEN PACT:\n'The crown does not grant power. It borrows it from your life.'\n\nEquipping the Demon Crown will extract a perpetual Blood Price from your vitality. Do you dare accept the curse?");
            if (ok) {
                state.player.demonWarningAccepted = true;
                window.InventoryManager.confirmEquipItem(itemInstanceId);
            }
        }
    },

    confirmDemonPact() {
        const state = window.gameState;
        if (state) state.player.demonWarningAccepted = true;
        const modal = document.getElementById("demonWarningModal");
        if (modal) modal.style.display = "none";

        if (this.pendingEquipInstanceId) {
            window.InventoryManager.confirmEquipItem(this.pendingEquipInstanceId);
            this.pendingEquipInstanceId = null;
        }
        this.playDemonSound();
        this.updateVisualAtmosphere();
    },

    cancelDemonPact() {
        this.pendingEquipInstanceId = null;
        const modal = document.getElementById("demonWarningModal");
        if (modal) modal.style.display = "none";
    }
};

if (typeof window !== "undefined" && typeof window.addEventListener === "function") {
    window.addEventListener("DOMContentLoaded", () => {
        window.CrownManager.init();
    });
}
