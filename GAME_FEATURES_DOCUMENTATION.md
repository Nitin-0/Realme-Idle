# 📖 Realm Idle — Complete Game Features & Architecture Documentation

This document provides a comprehensive analysis of all features, gameplay mechanics, mathematical formulas, and code implementations in **Realm Idle**, complete with exact file paths, line references, and execution logic.

---

## 📑 Summary of All Game Features (To Date)

* **Hero Classes & Vocations**: 4 distinct classes (Knight, Rogue, Mage, Paladin) featuring custom stat scalings, unique active abilities, auto-cast functionality, and vocation progression.
* **Real-Time Idle Combat Engine**: Automated tick-based combat with player auto-attacks, manual strikes, critical strikes, dodge checks, lifestealing, and multi-phase boss battles (Phase 2 Storms, Phase 3 Enraged Frenzy).
* **Fatigue & Exhaustion Recoil**: Combat actions generate fatigue (0–100%). Hitting 100% fatigue inflicts a severe **Exhaustion Recoil penalty** where every attack damages the player's own health by 6% Max HP. Stamina is recovered by resting at Camp or quaffing tonics.
* **Legendary "Break the Rules" Crowns**:
  * 👑 **Demon Crown (“Power at a Price”)**: Grants massive flat stats (+350 ATK, +150 DEF, +40% Crit), 45% Execution chance on foes under 15% HP, Demonic Aura passive burn, missing HP damage scaling, and Demon's Last Stand (+100% crit at $\le 25\%$ HP with -75% healing penalty). Exacts a **Blood Price of 0.1% Max HP per strike**. Plunges the world into darkness with low-HP screen glitches.
  * 👑 **Divine Crown (“Blessing of Heaven”)**: Grants +600 HP, +120 DEF, constant Holy Regeneration (3.5% HP/s), continuous Fatigue Purification (-3.5%/s), 25% damage negation, Overheal Holy Shield (up to 50% Max HP), Holy Retribution burst (+150% dmg), and a once-per-battle Guardian Angel resurrection with golden screen explosion.
  * 👁️ **Secret Destabilization & Equilibrium**: Holding both crowns triggers a cosmic paradox event, spawning the secret boss **The Weaver of Duality** in the Arena. Defeating it permanently forges the unified **Crown of Equilibrium**, combining light and void powers without self-harm.
  * ⏳ **30-Minute Celestial Lifespan**: All crowns exist for exactly 30 minutes once equipped. The countdown starts only when donned, after which they dissolve into astral ether. They cannot be sold.
* **Inventory & Equipment System**: 6 equipment slots (Weapon, Armor, Helmet, Boots, Trinket, Crown), 5 rarity tiers (Common to Legendary), dynamic tooltips with exact stat breakdowns, and inventory category filters & sorting.
* **Forge & Upgrade Workshop**: Crafting recipes using gathered materials (Iron Ore, Wood, Crystal, Dragon Scales, Shadow Essence) and gear enhancement up to +10.
* **Automated Economy & Passive Income**:
  * Gold from monster drops and active battle.
  * Passive income mechanism providing **1 Gold every 10 minutes** automatically.
* **Multi-Realm & Depth Progression**: 4 elemental maps (Moonlit Vale, Sunken Ruins, Frostpeak Citadel, Inferno Caldera), each featuring 3 deeper realm tiers (Tiers I–III) with scaling monster HP, ATK, and loot multipliers.
* **Temple Safe Zone & Death Recovery**: Retreating or falling in battle transports the player to the Temple Sanctuary, preventing death loops and allowing prayer healing, shopping, and gear preparation before re-entering combat.
* **Dynamic World Calamities & Weather**: Procedural climate conditions (Clear Sky, Rainstorm, Blizzard, Heatwave) and world events (Blood Moon, Titan Awakening, Cataclysm) that dynamically adjust player damage, enemy stats, and gold drops.
* **Kingdom & Settlement Buildings**: Upgradable Castle, Treasury, Blacksmith, Mage Tower, and Barracks providing kingdom-wide stat bonuses and passive bonuses.
* **Procedural Audio Synthesizer**: Web Audio API chord and tone generation creating distinct audio signatures for Demon, Divine, and Equilibrium actions without requiring external audio assets.
* **Admin, Dev & Debug Suite**:
  * **F2 Quick Debug Floating Card**: Fast cheats for Gold, Power, God Mode, One-Hit Kill, Instant Full Heal (clearing fatigue and restoring effective Max HP), and Crown Time setters (`5m`, `30m`, `60m`, `♾️ Inf`).
  * **GM Slash Command Console**: Full command interpreter (`/crowntime <mins>`, `/heal`, `/god`, `/gold`, `/spawn <mob> [boss]`, `/speed <mult>`, `/map <id>`, `/weather <id>`).
  * **Standalone Game Manager (`manager.html`)**: Web-based administration tool for live editing of mobs, items, recipes, drop rates, and world parameters.
* **Fully Responsive Mobile Interface**: Optimized viewports, touch-friendly navigation, scroll-locking modal backdrops, and mobile-responsive character cards.

---

## 🏛️ Comprehensive Feature Breakdown & Code Architecture

### 1. Hero Classes, Stats & Scaling Logic
* **File References**:
  * Definitions: [`js/data/heroes.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/data/heroes.js#L5-L95)
  * Calculation Methods: [`js/core/state.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/core/state.js#L350-L520)
* **Logic**:
  * Each hero has base stats (`power`, `defense`, `hp`, `critChance`, `critDmg`, `dodge`, `lifesteal`).
  * **Effective Attack Calculation** (`state.getEffectiveAttack()`):
    $$\text{ATK} = (\text{basePower} + \text{gearATK} + \text{upgradeATK} + \text{bldgBonus}) \times \text{classMult} \times \text{weatherMult} \times \text{demonLowHpBonus}$$
    When the Demon Crown is equipped, low HP provides an additional scalar:
    $$\text{DemonMult} = 1.0 + (1.0 - \frac{\text{Current HP}}{\text{Max HP}}) \times 0.75$$
  * **Effective Max HP Calculation** (`state.getEffectiveMaxHp()`):
    $$\text{Max HP} = \text{baseMaxHp} + \text{gearHp} + \text{upgradeHp} + \text{divineBonus (600)} + \text{equilibriumBonus (500)}$$
  * **Vocation Mastery**: Mastered levels scale linearly without showing premature mastery at rank 1.

---

### 2. Real-Time Combat Engine & Multi-Phase Bosses
* **File References**:
  * Main Engine: [`js/systems/combat.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/systems/combat.js#L100-L290)
  * Skill Triggers: [`js/systems/combat.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/systems/combat.js#L305-L355)
* **Logic**:
  * **Attack Loop** (`attackTick()`): Fires at an interval of `1100ms / gameSpeed`.
  * **Crit & Dodge**: 5% base enemy dodge check; player crit rolls against `getEffectiveCritChance()`.
  * **Multi-Phase Boss Transitions**:
    * When Boss HP $\le 70\%$, enters **Phase 2: Shield & Storms**.
    * When Boss HP $\le 30\%$, enters **Phase 3: Enraged Frenzy** with increased attack speed and burst damage.
  * **One-Hit Kill Cheat Check**: If `window.devMode.oneHitKill` is active, damage is automatically set to `mob.hp`.

---

### 3. Fatigue & Exhaustion Recoil Penalty
* **File References**:
  * Accumulation & Check: [`js/systems/combat.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/systems/combat.js#L164-L182)
  * Manual Strike Check: [`js/systems/combat.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/systems/combat.js#L253-L272)
  * State Reducers: [`js/core/state.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/core/state.js#L515-L545)
* **Logic**:
  * Every auto-attack adds $+1.2\%$ fatigue; manual strikes add $+1.0\%$.
  * At **100% Fatigue**:
    $$\text{Recoil Damage} = \max(8, \lfloor \text{EffectiveMaxHp} \times 0.06 \rfloor)$$
    Every strike drains this damage directly from the player's health with warning popup `😫 -X HP (100% Fatigue!)`. Attacking continuously while exhausted can cause death.
  * Resting at Camp or quaffing stamina potions reduces fatigue to 0%.

---

### 4. Legendary Crowns (“Break the Rules”) System
* **File References**:
  * Core Crown Manager: [`js/systems/crowns.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/systems/crowns.js#L1-L830)
  * Item Data: [`js/data/items.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/data/items.js#L208-L255)
  * Inventory Hook: [`js/systems/inventory.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/systems/inventory.js#L325-L368)

#### A. 👑 Demon Crown
* **Blood Price on Strike** (`onPlayerAttackHit` in `crowns.js` line ~600):
  $$\text{Strike Drain} = \max(0.01, \text{EffectiveMaxHp} \times 0.001)$$
  Deducts 0.1% Max HP on every strike down to a minimum of 1 HP (never suicides the player directly). Shows floating text `🩸 -X HP (Blood Price)`.
* **Executioner**: If target is a non-boss mob with $\le 15\%$ HP, has a $45\%$ chance on hit to instantly kill it with `👹 EXECUTE! 99999`.
* **Demon's Last Stand**: If player HP $\le 25\%$, critical chance reaches 100%, but all incoming healing is reduced by $-75\%$.
* **World of Darkness**: Every second equipped, `darknessLevel` increases by $+1$ up to $100\%$, applying CSS filters `--darkness-level`. Screen glitches when HP $\le 30\%$.

#### B. 👑 Divine Crown
* **Holy Regeneration** (`passiveCrownTick` in `crowns.js` line ~465):
  $$\text{Regen} = \lfloor \text{EffectiveMaxHp} \times 0.035 \rfloor + 15 \text{ HP/sec}$$
* **Purification**: Cleanses $-3.5\%$ fatigue per second.
* **Overheal Holy Shield** (`healPlayer` in `crowns.js` line ~580):
  Excess heals above Max HP convert into a protective shield up to $50\%$ of Max HP.
* **Divine Protection**: $25\%$ chance to completely negate incoming hits to $0$ damage.
* **Guardian Angel**: Once per battle, lethal damage leaves player at $1$ HP and grants a massive emergency healing wave.

#### C. 👁️ Destabilization & The Sovereign Crown of Equilibrium
* **Trigger** (`checkCrownCoexistence` in `crowns.js` line ~253):
  If both Demon Crown and Divine Crown exist simultaneously in equipment or inventory, the system triggers the cosmic paradox event.
* **Boss Battle**: Spawns **The Weaver of Duality** in the Arena.
* **Reward**: Defeating the boss destroys both volatile crowns and permanently crafts the **Crown of Equilibrium**, providing $+280$ ATK, $+160$ DEF, $+500$ HP, $+25\%$ Crit, $+10\%$ Lifesteal, Overheal Shields, and Twilight Pulses with no self-damage.

#### D. 30-Minute Lifespan Rule
* Timer starts **only when equipped** (`onCrownEquipped` in `crowns.js` line ~395). Crowns in inventory show `⏳ 30:00 (Starts on equip)`.
* Crowns are strictly **unsellable** (`unsellable: true`).
* Upon expiration (`expireCrown`), crowns dissolve into astral ether and are removed.

---

### 5. Economy & 10-Minute Passive Gold Income
* **File References**:
  * Ticker: [`js/core/state.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/core/state.js#L1475-L1510)
  * Loop Interval: [`js/main.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/main.js#L552-L558)
* **Logic**:
  * `passiveGoldTimer` increments every second.
  * When `passiveGoldTimer >= 600` (10 minutes), the player is awarded **+1 Gold**.
  * The top resource HUD displays clean gold numbers without timer clutter.

---

### 6. Admin, Dev & Debug Suite
* **File References**:
  * F2 Debug Widget: [`js/debug/debug.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/debug/debug.js#L1-L164)
  * Slash Commands: [`js/dev/commands.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/dev/commands.js#L1-L260)
  * Game API: [`js/api/gameApi.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/api/gameApi.js#L1-L120)
* **Logic**:
  * **Heal Player Fix (`GameAPI.player.heal()`)**:
    * Restores player health to full **Effective Max HP** (`state.getEffectiveMaxHp()`), taking all equipped gear and crowns into account.
    * Resets fatigue to `0%`.
    * Clears Temple retreat lock if dead or resting.
    * Displays `❤️ +X HP (Full Heal)` popup and updates UI immediately.
    * Button displays temporary feedback: `✨ Healed!`.
  * **Crown Time Modification**:
    * In F2 widget: buttons for `5m`, `30m`, `60m`, and `♾️ Inf (999h)`.
    * Slash command: `/crowntime <minutes>`, `/crowntime +<minutes>`, `/crowntime inf`.
    * Direct API: `CrownManager.setEquippedCrownDuration(minutes)`.

---

### 7. Audio & Visual Atmospheric Systems
* **File References**:
  * Procedural Sound: [`js/systems/crowns.js`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/js/systems/crowns.js#L163-L220)
  * Atmosphere CSS & Filters: [`style.css`](file:///c:/Users/nitin/OneDrive/Desktop/Real-main/Realme%20Idle/style.css#L420-L530)
* **Logic**:
  * **Demon Audio**: Synthesizes a low 65Hz sawtooth wave descending to 35Hz.
  * **Divine Audio**: Synthesizes a bright ascending major arpeggio ($C_5, E_5, G_5, C_6$) using sine oscillators.
  * **Equilibrium Audio**: Dissonant tritone chord resolving into harmonic resonance.
  * **Visual Atmosphere**: Dynamically manages `--darkness-level` CSS custom properties, screen-shake classes, and CRT scanline glitch animations.
