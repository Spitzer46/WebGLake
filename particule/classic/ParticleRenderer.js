import * as mat4 from "../../lib/mat4.js";
import * as vec2 from "../../lib/vec2.js";
import Shader from "../../Shader.js";
import Texture from "../../Texture.js";
import { Particle } from "../Particle.js";
import ParticleSystem from "../ParticleSystem.js";
import ParticleTexture from "../ParticleTexture.js";

export default class ParticleRenderer {
    static zaxis = new Float32Array([0, 0, 1]);

    constructor(gl) {
        this.gl = gl;
        this.ready = false;
        this.shader = null;
        this.uniforms = null;
        this.attributes = null;
        this.modelMatrix = mat4.create();
        this.viewModelMatrix = mat4.create();
        this.textInfo = vec2.create();
        this.textureStar = Texture.load(gl, "../img/smoke.png");
        this.particleSystem = new ParticleSystem(Particle);
        this.particleSystem.addParticles(new ParticleTexture(0, 8, false), 100);
        this.particleSystem.lifeSpan = 5000;
        this.particleSystem.spawnDelay = 50;
        this.particleSystem.gravity = 0;
        this.particleSystem.scale = 15;
        this.particleSystem.setSpawnPosition(-90, 15, 10);
        this.loading();
    }

    async loading() {
        const gl = this.gl;
        this.shader = await Shader.load(gl, "./particule/classic/shader.vert", "./particule/classic/shader.frag");
        this.uniforms = this.shader.uniforms;
        this.attributes = this.shader.generateAttributes();
        //////// build ////////
        this.attributes.position.set(new Float32Array([
            1,-1,
            1, 1,
           -1,-1,
           -1, 1
        ]));
        this.ready = true;
    }

    enable(state = true) {
        const gl = this.gl;
        if(state) {
            this.shader.enable();
            this.textureStar.bind(0);
            for(const attrib in this.attributes) {
                this.attributes[attrib].enable();
            }
            gl.enable(gl.BLEND);
            gl.depthMask(false);
        }
        else {
            this.textureStar.unbind(0);
            gl.disable(gl.BLEND);
            gl.depthMask(true);
        }
    }

    render(camera, light, pass) {
        const gl = this.gl;
        gl.cullFace(gl.BACK);
        this.enable();
        camera.loadProjectionMatrix(this.uniforms.projection);
        for(const particleTextures of this.particleSystem.particleTextures) {
            const texture = particleTextures[0];
            const particules = particleTextures[1];
            this.uniforms.textureStar.set(texture.textureId);
            if(texture.additive) {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);   
            }
            else {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }
            for(const particle of particules) {
                if(particle.stillAlive) {
                    mat4.identity(this.modelMatrix);
                    mat4.translate(this.modelMatrix, this.modelMatrix, particle.position);
                    this.modelMatrix[0] = camera.viewMatrix[0]; // 00 - 00
                    this.modelMatrix[1] = camera.viewMatrix[4]; // 01 - 10
                    this.modelMatrix[2] = camera.viewMatrix[8]; // 02 - 20
                    this.modelMatrix[4] = camera.viewMatrix[1]; // 10 - 01
                    this.modelMatrix[5] = camera.viewMatrix[5]; // 11 - 11
                    this.modelMatrix[6] = camera.viewMatrix[9]; // 12 - 21
                    this.modelMatrix[8] = camera.viewMatrix[2]; // 20 - 02
                    this.modelMatrix[9] = camera.viewMatrix[6]; // 21 - 12
                    this.modelMatrix[10] = camera.viewMatrix[10]; // 22 - 22
                    mat4.rotate(this.modelMatrix, this.modelMatrix, particle.rotation, ParticleRenderer.zaxis);
                    mat4.scale(this.modelMatrix, this.modelMatrix, particle.scale);
                    mat4.multiply(this.viewModelMatrix, camera.viewMatrix, this.modelMatrix);
                    this.uniforms.viewModel.set(this.viewModelMatrix);
                    this.uniforms.texOffset1.set(particle.texOffset1);
                    this.uniforms.texOffset2.set(particle.texOffset2);
                    vec2.set(this.textInfo, texture.numOfRows, particle.blendFactor);
                    this.uniforms.textCoordInfo.set(this.textInfo);
                    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.attributes.position.count);
                }
            }
        }
        this.enable(false);
    }

    update(ellapsed, camera) {
        this.particleSystem.update(ellapsed, camera);
    }

    dispose() {
        this.shader.dispose();
        this.textureStar.dispose();
        for(const attrib in this.attributes) {
            this.attributes[attrib].dispose();
        }
    }
}