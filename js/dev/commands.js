/* =========================================================
   REALM IDLE DEV - EXTENDED COMMAND CONSOLE INTERPRETER
========================================================= */

window.DevCommands = {
    execute(rawCommand) {
        const command = rawCommand.trim();
        if (!command) return;

        const dev = window.devMode;
        dev.logToConsole(`&gt; ${command}`, "command");

        const parts = command.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const arg1 = parts[1];
        const arg2 = parts[2];

        const state = window.gameState;

        switch (cmd) {
            case "/scenario":
                if (!arg1) {
                    dev.logToConsole("Usage: /scenario &lt;dragon_invasion | blood_moon_surge | frostpeak_blizzard | goblin_horde&gt; | /scenario stop", "error");
                } else if (arg1 === "stop") {
                    if (window.ScenarioManager) window.ScenarioManager.stopScenario();
                } else if (window.ScenarioManager) {
                    window.ScenarioManager.runScenario(arg1);
                }
                break;

            case "/hero":
                if (!arg1 || !window.HeroesData[arg1]) {
                    dev.logToConsole("Usage: /hero &lt;knight | rogue | mage | paladin&gt;", "error");
                } else {
                    state.setHeroClass(arg1);
                    dev.logToConsole(`Switched hero class to ${window.HeroesData[arg1].name}.`, "success");
                }
                break;

            case "/giveitem":
                if (!arg1 || !window.ItemsData[arg1]) {
                    dev.logToConsole("Usage: /giveitem &lt;item_id&gt; (e.g. /giveitem dragon_slayer)", "error");
                } else if (window.InventoryManager) {
                    window.InventoryManager.addItem(arg1);
                }
                break;

            case "/givemat":
                if (!arg1 || !arg2) {
                    dev.logToConsole("Usage: /givemat &lt;ironOre | wood | crystal | dragonScale | shadowEssence&gt; &lt;amount&gt;", "error");
                } else if (window.InventoryManager) {
                    window.InventoryManager.addMaterial(arg1, parseInt(arg2, 10));
                    dev.logToConsole(`Added +${arg2} ${arg1}.`, "success");
                }
                break;

            case "/craft":
                if (!arg1) {
                    dev.logToConsole("Usage: /craft &lt;item_id&gt; (e.g. /craft runed_blade)", "error");
                } else if (window.InventoryManager) {
                    window.InventoryManager.craftItem(arg1);
                }
                break;

            case "/building":
                if (!arg1 || !arg2) {
                    dev.logToConsole("Usage: /building &lt;castle | treasury | blacksmith | mageTower | barracks&gt; &lt;level&gt;", "error");
                } else if (state.kingdom[arg1] !== undefined) {
                    state.kingdom[arg1] = Math.max(1, parseInt(arg2, 10));
                    state.notify();
                    dev.logToConsole(`Set ${arg1} level to ${arg2}.`, "success");
                }
                break;

            case "/unlockjournal":
                if (window.JournalManager) window.JournalManager.unlockAll();
                break;

            case "/gold":
                if (!arg1) {
                    dev.logToConsole("Usage: /gold &lt;amount&gt; | /gold +1000", "error");
                } else if (arg1.startsWith("+")) {
                    state.addGold(parseInt(arg1.slice(1), 10));
                    dev.logToConsole(`Added Gold.`, "success");
                } else {
                    state.player.gold = Math.max(0, parseInt(arg1, 10));
                    state.notify();
                    dev.logToConsole(`Set Gold to ${state.player.gold.toLocaleString()}.`, "success");
                }
                break;

            case "/power":
                if (!arg1) {
                    dev.logToConsole("Usage: /power &lt;amount&gt;", "error");
                } else {
                    state.player.power = Math.max(1, parseInt(arg1, 10));
                    state.notify();
                    dev.logToConsole(`Set Base Power to ${state.player.power.toLocaleString()}.`, "success");
                }
                break;

            case "/xp":
                if (!arg1) {
                    dev.logToConsole("Usage: /xp &lt;amount&gt;", "error");
                } else {
                    state.addXp(parseInt(arg1, 10));
                    dev.logToConsole(`Added ${arg1} XP.`, "success");
                }
                break;

            case "/level":
                if (!arg1) {
                    dev.logToConsole("Usage: /level &lt;level_num&gt;", "error");
                } else {
                    state.player.level = Math.max(1, parseInt(arg1, 10));
                    state.notify();
                    dev.logToConsole(`Set Level to ${state.player.level}.`, "success");
                }
                break;

            case "/god":
                dev.godMode = !dev.godMode;
                if (window.DevPanel) window.DevPanel.syncUI();
                dev.logToConsole(`God Mode: ${dev.godMode ? "ENABLED" : "DISABLED"}`, dev.godMode ? "success" : "warn");
                break;

            case "/onehit":
                dev.oneHitKill = !dev.oneHitKill;
                if (window.DevPanel) window.DevPanel.syncUI();
                dev.logToConsole(`One-Hit Kill: ${dev.oneHitKill ? "ENABLED" : "DISABLED"}`, dev.oneHitKill ? "success" : "warn");
                break;

            case "/infgold":
                dev.infiniteGold = !dev.infiniteGold;
                state.notify();
                if (window.DevPanel) window.DevPanel.syncUI();
                dev.logToConsole(`Infinite Gold: ${dev.infiniteGold ? "ENABLED" : "DISABLED"}`, dev.infiniteGold ? "success" : "warn");
                break;

            case "/infhp":
                dev.infiniteHealth = !dev.infiniteHealth;
                if (window.DevPanel) window.DevPanel.syncUI();
                dev.logToConsole(`Infinite HP: ${dev.infiniteHealth ? "ENABLED" : "DISABLED"}`, dev.infiniteHealth ? "success" : "warn");
                break;

            case "/spawn":
                if (!arg1) {
                    dev.logToConsole("Usage: /spawn &lt;mob_id&gt; [boss]", "error");
                } else if (window.SpawningManager) {
                    const isBoss = arg2 === "boss";
                    window.SpawningManager.spawnMobById(arg1, { isBoss: isBoss });
                    dev.logToConsole(`Spawned ${arg1}${isBoss ? " (BOSS)" : ""}.`, "success");
                }
                break;

            case "/map":
                if (!arg1) {
                    dev.logToConsole("Usage: /map &lt;map_id&gt;", "error");
                } else if (window.MapManager) {
                    window.MapManager.loadMap(arg1);
                    dev.logToConsole(`Traveled to map '${arg1}'.`, "success");
                }
                break;

            case "/weather":
                if (!arg1) {
                    dev.logToConsole("Usage: /weather &lt;weather_id&gt;", "error");
                } else if (window.WeatherManager) {
                    window.WeatherManager.setWeather(arg1);
                    dev.logToConsole(`Set weather to '${arg1}'.`, "success");
                }
                break;

            case "/time":
                if (!arg1) {
                    dev.logToConsole("Usage: /time &lt;0-23&gt;", "error");
                } else if (window.TimeManager) {
                    window.TimeManager.setTime(parseInt(arg1, 10));
                    dev.logToConsole(`Set time to ${arg1}:00.`, "success");
                }
                break;

            case "/speed":
                if (!arg1) {
                    dev.logToConsole("Usage: /speed &lt;0.5 | 1 | 2 | 5 | 10&gt;", "error");
                } else {
                    dev.gameSpeed = parseFloat(arg1);
                    if (window.MainEngine) window.MainEngine.restartGameLoops();
                    if (window.DevPanel) window.DevPanel.syncUI();
                    dev.logToConsole(`Game speed set to ${dev.gameSpeed}x.`, "success");
                }
                break;

            case "/kill":
                if (window.CombatManager && state.combat.currentMob) {
                    state.combat.currentMob.hp = 0;
                    window.CombatManager.onMobDefeated();
                    dev.logToConsole("Mob slain!", "success");
                }
                break;

            case "/heal":
                state.player.hp = state.player.maxHp;
                state.notify();
                dev.logToConsole("Player fully healed.", "success");
                break;

            case "/clear":
                const logs = document.getElementById("devConsoleLogs");
                if (logs) logs.innerHTML = "";
                break;

            case "/help":
                dev.logToConsole("=== GM SLASH COMMANDS ===", "info");
                dev.logToConsole("• /scenario &lt;id&gt; | /hero &lt;class&gt; | /giveitem &lt;id&gt; | /givemat &lt;key&gt; &lt;qty&gt;", "info");
                dev.logToConsole("• /building &lt;name&gt; &lt;lvl&gt; | /unlockjournal | /craft &lt;id&gt;", "info");
                dev.logToConsole("• /gold &lt;amt&gt; | /power &lt;amt&gt; | /xp &lt;amt&gt; | /level &lt;lvl&gt;", "info");
                dev.logToConsole("• /god | /onehit | /infgold | /infhp", "info");
                dev.logToConsole("• /spawn &lt;mob_id&gt; [boss] | /map &lt;map_id&gt; | /weather &lt;weather_id&gt;", "info");
                dev.logToConsole("• /time &lt;0-23&gt; | /speed &lt;mult&gt; | /kill | /heal | /clear", "info");
                break;

            default:
                dev.logToConsole(`Unknown command '${cmd}'. Type /help for assistance.`, "error");
                break;
        }
    }
};
