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

    spawnBossForMap(mapId) {
        const state = window.gameState;
        const currentId = mapId || state.world.currentMapId;
        const map = window.MapsData[currentId] || window.MapsData.moonlit_vale;
        
        let bossId = map.bossId;
        if (!bossId || !window.MobsData[bossId]) {
            const mobsList = map.mobs && map.mobs.length > 0 ? map.mobs : ["goblin"];
            bossId = mobsList[mobsList.length - 1];
        }

        this.spawnMobById(bossId, {
            isBoss: true,
            level: (map.levelMax || 5)
        });
    },

    spawnNextMob() {
        const state = window.gameState;
        if (state.combat.inTemple) {
            state.combat.currentMob = null;
            state.notify();
            return;
        }

        const currentId = state.world.currentMapId;
        const map = window.MapsData[currentId] || window.MapsData.moonlit_vale;

        if (state.combat.stage >= state.combat.maxStages) {
            this.spawnBossForMap(currentId);
            return;
        }

        // Build spawn pool: map-specific mobs + universal mobs (excluding pure bosses)
        const mapMobs = map.mobs && map.mobs.length > 0 ? [...map.mobs] : ["goblin"];
        const universalMobs = Object.values(window.MobsData || {})
            .filter(m => m.isUniversal === true && !mapMobs.includes(m.id))
            .map(m => m.id);

        const combinedPool = [...mapMobs, ...universalMobs];
        const validPool = combinedPool.filter(id => {
            const def = window.MobsData[id];
            return def && !def.isBoss;
        });

        const pool = validPool.length > 0 ? validPool : mapMobs;
        const randomMobId = pool[Math.floor(Math.random() * pool.length)];

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
