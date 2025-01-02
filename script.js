        const additionalStyles = document.createElement('style');
        additionalStyles.textContent = `
            .celestial-body {
                position: absolute;
                border-radius: 50%;
                transform-origin: center;
            }
            .planet-texture {
                width: 100%;
                height: 100%;
                border-radius: 50%;
                position: relative;
            }
            #mercury .planet-texture {
                background: linear-gradient(90deg, 
                    rgba(255,255,255,0.3) 0%, 
                    #8c8c8c 20%, 
                    #b3b3b3 80%, 
                    rgba(0,0,0,0.3) 100%
                );
            }
            #venus .planet-texture {
                background: linear-gradient(90deg, 
                    rgba(255,255,255,0.3) 0%, 
                    #e6b800 20%, 
                    #ffcc00 80%, 
                    rgba(0,0,0,0.3) 100%
                );
            }
            #earth .planet-texture {
                background: linear-gradient(90deg, 
                    rgba(255,255,255,0.3) 0%, 
                    #4d94ff 20%, 
                    #0047b3 80%, 
                    rgba(0,0,0,0.3) 100%
                );
            }
            #mars .planet-texture {
                background: linear-gradient(90deg, 
                    rgba(255,255,255,0.3) 0%, 
                    #cc3300 20%, 
                    #ff4d4d 80%, 
                    rgba(0,0,0,0.3) 100%
                );
            }
            #jupiter .planet-texture {
                background: linear-gradient(90deg, 
                    rgba(255,255,255,0.3) 0%, 
                    #cc9966 20%, 
                    #ffcc99 80%, 
                    rgba(0,0,0,0.3) 100%
                );
            }
            .moon .planet-texture {
                background: linear-gradient(90deg, 
                    rgba(255,255,255,0.3) 0%, 
                    #ffffff 20%, 
                    #cccccc 80%, 
                    rgba(0,0,0,0.3) 100%
                );
            }
        `;
        document.head.appendChild(additionalStyles);

        const ASTRONOMICAL_BODIES = {
            mercury: {
                name: 'Mercury',
                orbitalPeriod: 87.97,
                radius: 100,
                size: 10,
                rotationPeriod: 58.6,
                color: '#b3b3b3',
                initialAngle: 45
            },
            venus: {
                name: 'Venus',
                orbitalPeriod: 224.7,
                radius: 150,
                size: 18,
                rotationPeriod: -243,
                color: '#ffcc00',
                initialAngle: 90
            },
            earth: {
                name: 'Earth',
                orbitalPeriod: 365.25,
                radius: 200,
                size: 20,
                rotationPeriod: 1,
                color: '#4d94ff',
                initialAngle: 135,
                satellites: {
                    moon: {
                        name: 'Moon',
                        orbitalPeriod: 27.321582,
                        radius: 30,
                        size: 6,
                        rotationPeriod: 27.321582,
                        color: '#ffffff',
                        initialAngle: 0
                    }
                }
            },
            mars: {
                name: 'Mars',
                orbitalPeriod: 687,
                radius: 250,
                size: 15,
                rotationPeriod: 1.03,
                color: '#ff4d4d',
                initialAngle: 180
            },
            jupiter: {
                name: 'Jupiter',
                orbitalPeriod: 4333,
                radius: 350,
                size: 40,
                rotationPeriod: 0.41,
                color: '#ffcc99',
                initialAngle: 225
            }
        };

        class CelestialSystem {
            constructor() {
                this.orbitsContainer = document.getElementById('orbits');
                this.bodies = new Map();
                this.scale = 1;
                this.speed = 1;
                this.startRealDate = new Date();
                this.simulationStartTime = performance.now();
                this.lastFrameTime = performance.now();

                this.initializeControls();
                this.createStarfield();
                this.createBodies();
                this.animate();
            }

            initializeControls() {
                const scaleSlider = document.getElementById('scaleSlider');
                const speedSlider = document.getElementById('speedSlider');
                const scaleValue = document.getElementById('scaleValue');
                const speedValue = document.getElementById('speedValue');

                scaleSlider.addEventListener('input', (e) => {
                    this.scale = parseFloat(e.target.value);
                    scaleValue.textContent = `${this.scale}x`;
                    this.updateScale();
                });

                speedSlider.addEventListener('input', (e) => {
                    this.speed = parseFloat(e.target.value);
                    speedValue.textContent = `${this.speed}x`;
                });

                speedSlider.value = this.speed;
                speedValue.textContent = `${this.speed}x`;
            }

            updateScale() {
                for (const [id, { system, config }] of this.bodies) {
                    const orbit = system.querySelector('.orbit');
                    orbit.style.width = `${config.radius * 2 * this.scale}px`;
                    orbit.style.height = `${config.radius * 2 * this.scale}px`;
                }
            }

            createStarfield() {
                const stars = document.getElementById('stars');
                const numberOfStars = 500;

                for (let i = 0; i < numberOfStars; i++) {
                    const star = document.createElement('div');
                    star.className = 'star';
                    
                    const size = 0.5 + Math.random() * 1.5;
                    star.style.width = `${size}px`;
                    star.style.height = `${size}px`;
                    star.style.left = `${Math.random() * 100}%`;
                    star.style.top = `${Math.random() * 100}%`;
                    star.style.opacity = 0.3 + Math.random() * 0.7;

                    if (Math.random() > 0.97) {
                        star.style.boxShadow = `0 0 ${2 + Math.random() * 2}px white`;
                    }
                    
                    stars.appendChild(star);
                }
            }

            createBodies() {
                for (const [id, config] of Object.entries(ASTRONOMICAL_BODIES)) {
                    const system = this.createPlanetSystem(id, config);
                    this.bodies.set(id, { system, config });
                }
            }

            createPlanetSystem(id, config) {
                const system = document.createElement('div');
                system.className = 'planet-system';
                
                const orbit = document.createElement('div');
                orbit.className = 'orbit';
                orbit.style.width = `${config.radius * 2}px`;
                orbit.style.height = `${config.radius * 2}px`;
                
                const planet = document.createElement('div');
                planet.className = 'celestial-body';
                planet.id = id;
                planet.style.width = `${config.size}px`;
                planet.style.height = `${config.size}px`;
                
                const texture = document.createElement('div');
                texture.className = 'planet-texture';
                planet.appendChild(texture);
                
                const label = document.createElement('div');
                label.className = 'label';
                label.textContent = config.name;
                planet.appendChild(label);

                if (config.satellites) {
                    for (const [moonId, moonConfig] of Object.entries(config.satellites)) {
                        const moonSystem = this.createMoonSystem(moonId, moonConfig);
                        planet.appendChild(moonSystem);
                    }
                }

                system.appendChild(orbit);
                system.appendChild(planet);
                this.orbitsContainer.appendChild(system);

                return system;
            }

            createMoonSystem(id, config) {
                const moonSystem = document.createElement('div');
                moonSystem.className = 'planet-system';
                
                const moonOrbit = document.createElement('div');
                moonOrbit.className = 'orbit';
                moonOrbit.style.width = `${config.radius * 2}px`;
                moonOrbit.style.height = `${config.radius * 2}px`;
                
                const moon = document.createElement('div');
                moon.className = 'celestial-body moon';
                moon.id = id;
                moon.style.width = `${config.size}px`;
                moon.style.height = `${config.size}px`;

                const texture = document.createElement('div');
                texture.className = 'planet-texture';
                moon.appendChild(texture);
                
                moonSystem.appendChild(moonOrbit);
                moonSystem.appendChild(moon);
                
                return moonSystem;
            }

            calculateRotation(body, elapsedSeconds) {
                const config = ASTRONOMICAL_BODIES[body];
                if (!config || !config.rotationPeriod) return 0;
                
                const rotationPeriodSeconds = Math.abs(config.rotationPeriod) * 24 * 60 * 60;
                const rotations = (elapsedSeconds * this.speed) / rotationPeriodSeconds;
                const angle = (rotations * 360) % 360;
                
                return config.rotationPeriod > 0 ? angle : -angle;
            }

            calculateOrbitPosition(elapsedSeconds, orbitalPeriod, initialAngle = 0) {
                const orbitalPeriodSeconds = orbitalPeriod * 24 * 60 * 60;
                const orbits = (elapsedSeconds * this.speed) / orbitalPeriodSeconds;
                return (initialAngle - (orbits * 360)) % 360;
            }

            updatePositions(timestamp) {
                const elapsedSeconds = (timestamp - this.simulationStartTime) / 1000;
                const currentDate = new Date(this.startRealDate.getTime() + (elapsedSeconds * 1000 * this.speed));

                for (const [id, { system, config }] of this.bodies) {
                    const planet = system.querySelector(`#${id}`);
                    
                    const orbitalAngle = this.calculateOrbitPosition(elapsedSeconds, config.orbitalPeriod, config.initialAngle);
                    const radians = (orbitalAngle - 90) * (Math.PI / 180);
                    
                    const x = Math.cos(radians) * config.radius * this.scale;
                    const y = Math.sin(radians) * config.radius * this.scale;
                    
                    const rotationAngle = this.calculateRotation(id, elapsedSeconds);
                    
                    planet.style.transform = `translate(${x}px, ${y}px) rotate(${rotationAngle}deg)`;

                    if (config.satellites) {
                        for (const [moonId, moonConfig] of Object.entries(config.satellites)) {
                            const moon = planet.querySelector(`#${moonId}`);
                            
                            const moonOrbitalAngle = this.calculateOrbitPosition(
                                elapsedSeconds,
                                moonConfig.orbitalPeriod,
                                moonConfig.initialAngle
                            );
                            const moonRadians = (moonOrbitalAngle - 90) * (Math.PI / 180);
                            
                            const moonX = Math.cos(moonRadians) * moonConfig.radius;
                            const moonY = Math.sin(moonRadians) * moonConfig.radius;
                            
                            const moonRotation = this.calculateRotation(moonId, elapsedSeconds);
                            
                            moon.style.transform = `translate(${moonX}px, ${moonY}px) rotate(${moonRotation}deg)`;
                        }
                    }
                }

                this.updateInfo(currentDate, elapsedSeconds);
                requestAnimationFrame(this.animate.bind(this));
            }

            updateInfo(currentDate, elapsedSeconds) {
                const infoDisplay = document.getElementById('infoDisplay');
                let info = `
                    <div class="title">Solar System</div>
                    <div class="info-section">
                        <strong>Simulation Info:</strong><br>
                        Current Date: ${currentDate.toLocaleDateString()}<br>
                        Time: ${currentDate.toLocaleTimeString()}<br>
                        Speed: ${this.speed}x<br>
                        Scale: ${this.scale}x
                    </div>
                `;
                
                for (const [id, { config }] of this.bodies) {
                    const orbitalAngle = this.calculateOrbitPosition(
                        elapsedSeconds,
                        config.orbitalPeriod,
                        config.initialAngle
                    ) % 360;
                    const rotationAngle = this.calculateRotation(id, elapsedSeconds) % 360;
                    
                    info += `
                        <div class="info-section">
                            <strong>${config.name}:</strong><br>
                            Orbital Period: ${config.orbitalPeriod.toFixed(1)} days<br>
                            Current Position: ${Math.abs(orbitalAngle).toFixed(1)}°<br>
                            Rotation Period: ${Math.abs(config.rotationPeriod).toFixed(2)} Earth days<br>
                            Current Rotation: ${Math.abs(rotationAngle).toFixed(1)}°
                        </div>
                    `;

                    if (config.satellites) {
                        for (const [moonId, moonConfig] of Object.entries(config.satellites)) {
                            const moonOrbitalAngle = this.calculateOrbitPosition(
                                elapsedSeconds,
                                moonConfig.orbitalPeriod,
                                moonConfig.initialAngle
                            ) % 360;
                            const moonRotation = this.calculateRotation(moonId, elapsedSeconds) % 360;
                            
                            info += `
                                <div class="info-section ml-4">
                                    <strong>${moonConfig.name}:</strong><br>
                                    Orbital Period: ${moonConfig.orbitalPeriod.toFixed(1)} days<br>
                                    Current Position: ${Math.abs(moonOrbitalAngle).toFixed(1)}°<br>
                                    Current Rotation: ${Math.abs(moonRotation).toFixed(1)}°
                                </div>
                            `;
                        }
                    }
                }

                infoDisplay.innerHTML = info;
            }

            animate(timestamp) {
                this.updatePositions(timestamp);
            }
        }

        let solarSystem;
        window.addEventListener('load', () => {
            solarSystem = new CelestialSystem();
        });

 
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                if (solarSystem) {
                    const currentSpeed = solarSystem.speed;
                    const currentScale = solarSystem.scale;
                    
                    solarSystem = new CelestialSystem();
                    solarSystem.speed = currentSpeed;
                    solarSystem.scale = currentScale;
                    
                    document.getElementById('speedSlider').value = currentSpeed;
                    document.getElementById('scaleSlider').value = currentScale;
                    document.getElementById('speedValue').textContent = `${currentSpeed}x`;
                    document.getElementById('scaleValue').textContent = `${currentScale}x`;
                } else {
                    solarSystem = new CelestialSystem();
                }
            }
        });

        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const oldSystem = solarSystem;
                const oldSpeed = oldSystem ? oldSystem.speed : 100;
                const oldScale = oldSystem ? oldSystem.scale : 1;
                
                solarSystem = new CelestialSystem();
                solarSystem.speed = oldSpeed;
                solarSystem.scale = oldScale;
                
                document.getElementById('speedSlider').value = oldSpeed;
                document.getElementById('scaleSlider').value = oldScale;
                document.getElementById('speedValue').textContent = `${oldSpeed}x`;
                document.getElementById('scaleValue').textContent = `${oldScale}x`;
            }, 250);
        });
