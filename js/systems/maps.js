/* =========================================================
   REALM IDLE SYSTEMS - MAP MANAGER
========================================================= */

window.MapManager = {
    loadMap(mapId) {
        const state = window.GameState;
        const map = window.MapsData[mapId];

        if (!map) {
            console.error(`Map '${mapId}' not found.`);
            return;
        }

        state.world.currentMapId = mapId;

        // Apply arena visual styling
        const arenaEl = document.getElementById("arena");
        if (arenaEl && map.bgGradient) {
            arenaEl.style.background = map.bgGradient;
        }

        const moonEl = document.querySelector(".moon");
        if (moonEl && map.moonColor) {
            moonEl.style.background = map.moonColor;
        }

        // Apply map default weather if no event is active
        if (!state.world.activeEventId && map.defaultWeather) {
            if (window.WeatherManager) {
                window.WeatherManager.setWeather(map.defaultWeather);
            }
        }

        // Respawn mob for new map
        if (window.SpawningManager) {
            window.SpawningManager.spawnNextMob();
        }

        if (state.addLog) {
            state.addLog(`🗺️ Traveled to ${map.name} [Realm ${map.roman || map.realmIndex}].`, "travel", "🗺️");
        }

        state.notify();
    }
};
