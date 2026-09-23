/* =========================================================
   REALM IDLE SYSTEMS - WORLD EVENT MANAGER
========================================================= */

window.EventManager = {
    startEvent(eventId, durationSec = null) {
        const state = window.GameState;
        const eventDef = window.EventsData[eventId];
        if (!eventDef) return;

        state.world.activeEventId = eventId;
        state.world.activeEventTimer = durationSec || eventDef.durationSec;

        // Force event weather if specified
        if (eventDef.forcedWeather && window.WeatherManager) {
            window.WeatherManager.setWeather(eventDef.forcedWeather);
        }

        // Spawn event boss if defined
        if (eventDef.bossMob && window.SpawningManager) {
            window.SpawningManager.spawnMobById(eventDef.bossMob, { isBoss: true });
        }

        // Show Banner
        this.updateBanner();

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`⚡ WORLD EVENT STARTED: ${eventDef.name} (${state.world.activeEventTimer}s)`, "success");
        }

        state.notify();
    },

    stopEvent() {
        const state = window.GameState;
        if (!state.world.activeEventId) return;

        const eventName = window.EventsData[state.world.activeEventId] ? window.EventsData[state.world.activeEventId].name : state.world.activeEventId;

        state.world.activeEventId = null;
        state.world.activeEventTimer = 0;

        // Restore map weather
        const map = window.MapsData[state.world.currentMapId];
        if (map && map.defaultWeather && window.WeatherManager) {
            window.WeatherManager.setWeather(map.defaultWeather);
        }

        this.updateBanner();

        if (window.devMode && typeof window.devMode.logToConsole === "function") {
            window.devMode.logToConsole(`⚡ EVENT CONCLUDED: ${eventName}`, "warn");
        }

        state.notify();
    },

    tickEvent() {
        const state = window.GameState;
        if (!state.world.activeEventId) return;

        state.world.activeEventTimer--;
        if (state.world.activeEventTimer <= 0) {
            this.stopEvent();
        } else {
            this.updateBanner();
        }
    },

    updateBanner() {
        const state = window.GameState;
        const bannerEl = document.getElementById("eventBanner");
        if (!bannerEl) return;

        if (state.world.activeEventId && window.EventsData[state.world.activeEventId]) {
            const eventDef = window.EventsData[state.world.activeEventId];
            bannerEl.innerHTML = `${eventDef.bannerText} <span class="event-timer">[${state.world.activeEventTimer}s]</span>`;
            bannerEl.classList.add("visible");
        } else {
            bannerEl.classList.remove("visible");
        }
    }
};
