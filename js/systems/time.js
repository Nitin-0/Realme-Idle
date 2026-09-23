/* =========================================================
   REALM IDLE SYSTEMS - TIME CONTROLLER
========================================================= */

window.TimeManager = {
    getTimeLabel(hour) {
        if (hour >= 5 && hour < 8) return "🌅 DAWN";
        if (hour >= 8 && hour < 17) return "☀️ DAY";
        if (hour >= 17 && hour < 20) return "🌅 SUNSET";
        if (hour >= 20 && hour < 23) return "🌙 NIGHT";
        return "🌌 MIDNIGHT";
    },

    setTime(hour) {
        const state = window.GameState;
        state.world.worldTime = (hour + 24) % 24;

        // Apply visual ambient sky filter
        const arena = document.getElementById("arena");
        if (arena) {
            const h = state.world.worldTime;
            let filter = "none";
            if (h >= 20 || h < 5) filter = "brightness(0.7) contrast(1.1) hue-rotate(220deg)";
            else if (h >= 17 && h < 20) filter = "sepia(0.3) hue-rotate(320deg)";
            else if (h >= 5 && h < 8) filter = "sepia(0.2) hue-rotate(350deg)";
            arena.style.filter = filter;
        }

        state.notify();
    },

    tickTime() {
        const state = window.GameState;
        this.setTime(state.world.worldTime + 1);
    }
};
