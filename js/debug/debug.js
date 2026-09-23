/* =========================================================
   REALM IDLE DEBUG - TINY FAST F2 FLOATING WIDGET
========================================================= */

window.DebugWidget = {
    visible: false,

    init() {
        this.bindKeys();
        this.bindUI();
        this.syncUI();
    },

    bindKeys() {
        window.addEventListener("keydown", (e) => {
            if (e.key === "F2") {
                e.preventDefault();
                this.toggle();
            }
        });
    },

    toggle(show) {
        this.visible = (typeof show === "boolean") ? show : !this.visible;
        const el = document.getElementById("debugWidget");
        if (el) {
            el.classList.toggle("open", this.visible);
        }
    },

    bindUI() {
        const api = window.GameAPI;

        // Close button
        const btnClose = document.getElementById("debugClose");
        if (btnClose) btnClose.addEventListener("click", () => this.toggle(false));

        // Quick Gold
        document.querySelectorAll("[data-dbg-gold]").forEach(btn => {
            btn.addEventListener("click", () => {
                const val = parseInt(btn.dataset.dbgGold, 10);
                api.player.addGold(val);
            });
        });

        // Quick Power
        document.querySelectorAll("[data-dbg-power]").forEach(btn => {
            btn.addEventListener("click", () => {
                const val = parseInt(btn.dataset.dbgPower, 10);
                api.player.addPower(val);
            });
        });

        // Cheats
        const chkGod = document.getElementById("dbgChkGod");
        if (chkGod) chkGod.addEventListener("change", e => api.player.enableGodMode(e.target.checked));

        const chkOneHit = document.getElementById("dbgChkOneHit");
        if (chkOneHit) chkOneHit.addEventListener("change", e => api.player.enableOneHit(e.target.checked));

        const chkNoCd = document.getElementById("dbgChkNoCd");
        if (chkNoCd) chkNoCd.addEventListener("change", e => api.player.enableNoCooldowns(e.target.checked));

        // Instant Actions
        const btnHeal = document.getElementById("dbgBtnHeal");
        if (btnHeal) btnHeal.addEventListener("click", () => api.player.heal());

        const btnKill = document.getElementById("dbgBtnKill");
        if (btnKill) btnKill.addEventListener("click", () => api.combat.killCurrentEnemy());

        const btnSimOffline = document.getElementById("dbgBtnSimOffline");
        if (btnSimOffline) btnSimOffline.addEventListener("click", () => api.player.simulateOffline(8));

        const btnMaxGear = document.getElementById("dbgBtnMaxGear");
        if (btnMaxGear) btnMaxGear.addEventListener("click", () => api.player.maxEquippedGear());

        const btnGiveSupplies = document.getElementById("dbgBtnGiveSupplies");
        if (btnGiveSupplies) btnGiveSupplies.addEventListener("click", () => api.player.giveSupplies());

        const btnGiveGold = document.getElementById("dbgBtnGiveGold");
        if (btnGiveGold) btnGiveGold.addEventListener("click", () => api.player.addGold(100000));

        // Speed Select
        document.querySelectorAll(".dbg-speed-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const spd = parseFloat(btn.dataset.speed);
                api.world.setGameSpeed(spd);
            });
        });

        // Open Standalone Game Manager in new tab
        const btnOpenManager = document.getElementById("dbgBtnOpenManager");
        if (btnOpenManager) {
            btnOpenManager.addEventListener("click", () => {
                window.open("manager.html", "_blank");
            });
        }
    },

    syncUI() {
        const dev = window.devMode;
        if (!dev) return;

        const chkGod = document.getElementById("dbgChkGod");
        if (chkGod) chkGod.checked = dev.godMode;

        const chkOneHit = document.getElementById("dbgChkOneHit");
        if (chkOneHit) chkOneHit.checked = dev.oneHitKill;

        const chkNoCd = document.getElementById("dbgChkNoCd");
        if (chkNoCd) chkNoCd.checked = !!dev.noCooldowns;

        document.querySelectorAll(".dbg-speed-btn").forEach(btn => {
            btn.classList.toggle("active", parseFloat(btn.dataset.speed) === dev.gameSpeed);
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    window.DebugWidget.init();
});
