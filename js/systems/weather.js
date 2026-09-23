/* =========================================================
   REALM IDLE SYSTEMS - WEATHER MANAGER & PARTICLE CANVAS
========================================================= */

window.WeatherManager = {
    canvas: null,
    ctx: null,
    particles: [],
    animId: null,

    init() {
        this.canvas = document.getElementById("weatherCanvas");
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext("2d");
        this.resize();

        window.addEventListener("resize", () => this.resize());
        this.startParticleLoop();
    },

    resize() {
        if (!this.canvas) return;
        const arena = document.getElementById("arena");
        if (arena) {
            this.canvas.width = arena.clientWidth;
            this.canvas.height = arena.clientHeight;
        }
    },

    setWeather(weatherId) {
        const state = window.GameState;
        if (!window.WeatherData[weatherId]) return;

        state.world.currentWeatherId = weatherId;
        this.createParticles();
        state.notify();
    },

    createParticles() {
        this.particles = [];
        if (!this.canvas) return;

        const weather = window.WeatherData[window.GameState.world.currentWeatherId];
        if (!weather || weather.particleType === "none") return;

        const count = weather.particleType === "rain" ? 60 :
                      weather.particleType === "snow" ? 50 :
                      weather.particleType === "ash" ? 40 : 35;

        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                length: Math.random() * 15 + 8,
                speedY: Math.random() * 8 + 4,
                speedX: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                alpha: Math.random() * 0.7 + 0.3,
                color: weather.particleType === "rain" ? "#7fa3ff" :
                       weather.particleType === "snow" ? "#ffffff" :
                       weather.particleType === "ash" ? "#ff7744" :
                       weather.particleType === "arcane" ? "#d97aff" : "#a48aff"
            });
        }
    },

    startParticleLoop() {
        const render = () => {
            if (this.ctx && this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

                const weather = window.WeatherData[window.GameState.world.currentWeatherId];
                if (weather && weather.particleType !== "none") {
                    this.particles.forEach(p => {
                        this.ctx.beginPath();
                        this.ctx.fillStyle = p.color;
                        this.ctx.strokeStyle = p.color;
                        this.ctx.globalAlpha = p.alpha;

                        if (weather.particleType === "rain" || weather.particleType === "storm") {
                            this.ctx.lineWidth = 1.5;
                            this.ctx.moveTo(p.x, p.y);
                            this.ctx.lineTo(p.x + p.speedX, p.y + p.length);
                            this.ctx.stroke();
                        } else {
                            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                            this.ctx.fill();
                        }

                        p.y += p.speedY;
                        p.x += p.speedX;

                        if (p.y > this.canvas.height) {
                            p.y = -10;
                            p.x = Math.random() * this.canvas.width;
                        }
                    });
                }
            }
            this.animId = requestAnimationFrame(render);
        };
        render();
    }
};
