import * as vec3 from "../lib/vec3.js";
import { Particle } from "./Particle.js";

export default class ParticleSystem {
    static defaultDeviation = {
        x: { min:-0.003, max: 0.003 },
        y: { min: 0.015,  max: 0.02 },
        z: { min:-0.003, max: 0.003 },
    };
    static defaultSpawnDeviation = {
        x: { min:-0.1, max:0.1 },
        y: { min:-0.1, max:0.1 },
        z: { min:-0.1, max:0.1 }
    };
    static defaultRotation = {
        min: -Math.PI, max: Math.PI
    };
    static defaultGravity = -0.0001;
    static defaultLifeSpan = 2000;
    static defaultLifeDecrease = 1;
    static defaultSpawnDelay = 1000;
    static defaultScale = 10;

    constructor(model) {
        this.model = model;
        this.particles = new Map();
        this.spawnPosition = vec3.create();
        this.deviation = Object.assign({}, ParticleSystem.defaultDeviation);
        this.spawnDeviation = Object.assign({}, ParticleSystem.defaultSpawnDeviation);
        this.gravity = ParticleSystem.defaultGravity;
        this.lifeDecrease = ParticleSystem.defaultLifeDecrease;
        this.lifeSpan = ParticleSystem.defaultLifeSpan;
        this.spawnDelay = ParticleSystem.defaultSpawnDelay;
        this.scale = ParticleSystem.defaultScale;
        this.rotation = ParticleSystem.defaultRotation;
        this.timestamp = 0;
        this.nextSpawn = 0;
    }

    depthSortFunction(p1, p2) {
        return p1.position[2] > p2.position[2];
    }

    update(ellapsed, camera) {
        this.timestamp += ellapsed;
        for(const particles of this.particles.values()) {
            particles.sort(this.depthSortFunction);
            for(const particle of particles) {
                if(particle.stillAlive) {
                    particle.update(ellapsed, camera); 
                }
                else if(this.timestamp > this.nextSpawn) {
                    particle.reset(this.spawnPosition, this.deviation, this.spawnDeviation, this.lifeDecrease, this.lifeSpan, this.gravity, this.scale, this.rotation);
                    this.nextSpawn = this.timestamp + this.spawnDelay;
                }
            }
        }
    }

    addParticles(particleTexture, count = 1) {
        let particles = this.particles.get(particleTexture);
        if(particles === undefined) {
            particles = [];
        }

        for(let i = 0; i < count; ++i) {
            particles.push(new Particle(particleTexture));
        }

        this.particles.set(particleTexture, particles);
    }

    setSpawnPosition(x = 0, y = 0, z = 0) {
        vec3.set(this.spawnPosition, x, y, z);
    }

    get particleTextures() {
        return this.particles.entries();
    }
}