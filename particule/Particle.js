import * as vec3 from "../lib/vec3.js";
import * as vec2 from "../lib/vec2.js";

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

export class Particle {
    constructor(particleTexture) {
        this.particleTexture = particleTexture;
        this.position = vec3.create();
        this.velocity = vec3.create();
        this.relativeVelocity = vec3.create();
        this.acceleration = vec3.create();
        this.lifeDecrease = 0;
        this.lifeSpan = 0;
        this.life = 0;
        this.texOffset1 = vec2.create();
        this.texOffset2 = vec2.create();
        this.blendFactor = 0;
        this.distance = 0;
        this.scale = vec3.create();
        this.rotation = 0;
    }

    reset(spwanPosition, deviation, spawnDeviation, lifeDecrease, lifeSpan, gravity, scale, rotation) {
        vec3.copy(this.position, spwanPosition);
        vec3.set(this.velocity, 0, 0, 0);
        vec3.set(this.acceleration, 
                 rand(deviation.x.min, deviation.x.max),
                 rand(deviation.y.min, deviation.y.max),
                 rand(deviation.z.min, deviation.z.max)
        );
        this.position[0] += rand(spawnDeviation.x.min, spawnDeviation.x.max);
        this.position[1] += rand(spawnDeviation.y.min, spawnDeviation.y.max);
        this.position[2] += rand(spawnDeviation.z.min, spawnDeviation.z.max);
        this.lifeDecrease = lifeDecrease;
        this.lifeSpan = lifeSpan;
        this.gravity = gravity;
        vec3.set(this.scale, scale, scale, scale);
        this.rotation = rand(rotation.min, rotation.max);
        this.life = 0;
    }

    update(ellapsed, camera) {
        this.acceleration[1] += this.gravity;
        vec3.add(this.velocity, this.velocity, this.acceleration);
        vec3.multiplyByScalar(this.acceleration, this.acceleration, 0);
        vec3.copy(this.relativeVelocity, this.velocity);
        vec3.multiplyByScalar(this.relativeVelocity, this.velocity, ellapsed);
        vec3.add(this.position, this.position, this.relativeVelocity);
        this.distance = vec3.distance(camera.getPosition(), this.position);
        this.updateTextureCoordInfo();
        this.life += this.lifeDecrease * ellapsed;
    }

    updateTextureCoordInfo() {
        const lifeFactor = 1 - this.life / this.lifeSpan;
        const stageCount = this.particleTexture.numOfRows * this.particleTexture.numOfRows;
        const atlasProgression = lifeFactor * stageCount;
        const index1 = Math.floor(atlasProgression);
        const index2 = index1 < stageCount - 1 ? index1 + 1 : index1;
        this.blendFactor = atlasProgression % 1;
        this.setTextureOffset(this.texOffset1, index1);
        this.setTextureOffset(this.texOffset2, index2);
    }

    setTextureOffset(offset, index) {
        const column = index % this.particleTexture.numOfRows;
        const row = Math.floor(index / this.particleTexture.numOfRows);
        offset[0] = column / this.particleTexture.numOfRows;
        offset[1] = row / this.particleTexture.numOfRows;
    }

    get stillAlive() {
        return this.life < this.lifeSpan;
    }
}