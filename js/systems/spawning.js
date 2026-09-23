/* =========================================================
   REALM IDLE SYSTEMS - SPAWNING MANAGER
========================================================= */

window.SpawningManager = {
    createMobInstance(mobId, level = null) {
        const template = window.MobsData[mobId] || window.MobsData.goblin;
        const state = window.gameState;

        const targetLevel = level || Math.max(template.levelMin, Math.min(template.levelMax, state.player.level));
        const levelScale = 1 + (targetLevel - 1) * 0.18;

        // Apply Weather, Event & Scenario modifiers
        let weatherDmgMult = 1.0;
        let eventDmgMult = 1.0;
        let scenarioHpMult = 1.0;
        let scenarioDmgMult = 1.0;

        const weather = window.WeatherData ? window.WeatherData[state.world.currentWeatherId] : null;
        if (weather && weather.enemyDmgMult) {
            weatherDmgMult = weather.enemyDmgMult;
        }

        if (state.world.activeEventId && window.EventsData[state.world.activeEventId]) {
            eventDmgMult = window.EventsData[state.world.activeEventId].enemyDmgMult || 1.0;
        }

        if (state.world.activeScenarioId && window.ScenariosData[state.world.activeScenarioId]) {
            scenarioHpMult = window.ScenariosData[state.world.activeScenarioId].modifiers.enemyHpMult || 1.0;
            scenarioDmgMult = window.ScenariosData[state.world.activeScenarioId].modifiers.enemyDmgMult || 1.0;
        }

        const maxHp = Math.floor(template.baseHp * levelScale * scenarioHpMult);
        const damage = Math.max(1, Math.floor(template.baseDmg * levelScale * weatherDmgMult * eventDmgMult * scenarioDmgMult));
        const goldReward = Math.floor(template.goldReward * levelScale);
        const xpReward = Math.floor(template.xpReward * levelScale);

        return {
            id: template.id,
            name: template.name,
            type: template.type,
            icon: template.icon,
            level: targetLevel,
            hp: maxHp,
            maxHp: maxHp,
            damage: damage,
            goldReward: goldReward,
            xpReward: xpReward,
            dropChance: template.dropChance || 0.5,
            dropTable: template.dropTable || [],
            isBoss: false,
            currentPhase: 1,
            phaseText: ""
        };
    },

    spawnNextMob() {
        const state = window.gameState;
        const map = window.MapsData[state.world.currentMapId] || window.MapsData.moonlit_vale;

        const mobsList = map.mobs && map.mobs.length > 0 ? map.mobs : ["goblin"];
        const randomMobId = mobsList[Math.floor(Math.random() * mobsList.length)];

        state.combat.currentMob = this.createMobInstance(randomMobId);
        state.notify();
    },

    spawnMobById(mobId, customOpts = {}) {
        const state = window.gameState;
        const mob = this.createMobInstance(mobId, customOpts.level);

        if (customOpts.isBoss) {
            mob.isBoss = true;
            mob.name = "👑 BOSS: " + mob.name;
            mob.maxHp = Math.floor(mob.maxHp * 3.0);
            mob.hp = mob.maxHp;
            mob.goldReward = Math.floor(mob.goldReward * 4.0);
            mob.xpReward = Math.floor(mob.xpReward * 4.0);
            mob.currentPhase = 1;
            mob.phaseText = "⚔ PHASE 1: NORMAL COMBAT";
        }

        state.combat.currentMob = mob;
        state.notify();
    },

    clearMobs() {
        const state = window.gameState;
        state.combat.currentMob = null;
        state.notify();
    }
};
