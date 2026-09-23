/* =========================================================
   REALM IDLE SYSTEMS - ONE-CLICK SCENARIO ENGINE
========================================================= */

window.ScenarioManager = {
    runScenario(scenarioId) {
        const scenarioDef = window.ScenariosData[scenarioId];
        if (!scenarioDef) return;

        const state = window.gameState;
        state.world.activeScenarioId = scenarioId;
        state.world.activeScenarioTimer = scenarioDef.durationSec;

        // 1. Instant Map Shift
        if (window.MapManager && scenarioDef.mapId) {
            window.MapManager.loadMap(scenarioDef.mapId);
        }

        // 2. Instant Weather Shift
        if (window.WeatherManager && scenarioDef.weatherId) {
            window.WeatherManager.setWeather(scenarioDef.weatherId);
        }

        // 3. Instant Time Shift
        if (window.TimeManager && scenarioDef.timeHour !== undefined) {
            window.TimeManager.setTime(scenarioDef.timeHour);
        }

        // 4. Spawn Scenario Boss
        if (window.SpawningManager && scenarioDef.bossMobId) {
            window.SpawningManager.spawnMobById(scenarioDef.bossMobId, { isBoss: true });
        }

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`🔥 SCENARIO ACTIVATED: ${scenarioDef.name}!`, "success");
        }

        state.notify();
    },

    stopScenario() {
        const state = window.gameState;
        if (!state.world.activeScenarioId) return;

        state.world.activeScenarioId = null;
        state.world.activeScenarioTimer = 0;

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole("🛑 Scenario Concluded.", "warn");
        }

        state.notify();
    },

    tickScenario() {
        const state = window.gameState;
        if (!state.world.activeScenarioId) return;

        state.world.activeScenarioTimer--;
        if (state.world.activeScenarioTimer <= 0) {
            this.stopScenario();
        }
    }
};
