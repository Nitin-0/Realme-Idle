/* =========================================================
   REALM IDLE DEV - DEV MODE STATE
========================================================= */

window.devMode = {
    enabled: true,

    godMode: false,
    oneHitKill: false,
    infiniteGold: false,
    infiniteHealth: false,
    noCooldowns: false,

    damageMultiplier: 1,
    goldMultiplier: 1,
    gameSpeed: 1,

    activeTab: "player",
    panelVisible: false,

    togglePanel(show) {
        this.panelVisible = (typeof show === "boolean") ? show : !this.panelVisible;
        const modal = document.getElementById("devModal");
        if (modal) {
            if (this.panelVisible) {
                modal.classList.add("open");
                const input = document.getElementById("devConsoleInput");
                if (input && this.activeTab === "console") setTimeout(() => input.focus(), 100);
            } else {
                modal.classList.remove("open");
            }
        }
    },

    logToConsole(msg, type = "info") {
        const consoleLogs = document.getElementById("devConsoleLogs");
        if (!consoleLogs) return;

        const line = document.createElement("div");
        line.className = `dev-log-line ${type}`;

        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
        line.innerHTML = `<span class="dev-time">[${timestamp}]</span> ${msg}`;

        consoleLogs.appendChild(line);
        consoleLogs.scrollTop = consoleLogs.scrollHeight;
    },

    resetOverrides() {
        this.godMode = false;
        this.oneHitKill = false;
        this.infiniteGold = false;
        this.infiniteHealth = false;
        this.noCooldowns = false;
        this.damageMultiplier = 1;
        this.goldMultiplier = 1;
        this.gameSpeed = 1;

        if (window.MainEngine && typeof window.MainEngine.restartGameLoops === "function") {
            window.MainEngine.restartGameLoops();
        }
        if (window.GameState) window.GameState.notify();
        if (window.DevPanel) window.DevPanel.syncUI();
        this.logToConsole("All developer overrides reset.", "warn");
    }
};
