import Shader from "../../Shader.js";
import Texture from "../../Texture.js";
import { Particle } from "../Particle.js";
import ParticleSystem from "../ParticleSystem.js";
import ParticleTexture from "../ParticleTexture.js";
import * as mat4 from "../../lib/mat4.js";
import * as vec2 from "../../lib/vec2.js";

export default class ParticleInstanciedRenderer {
    static zaxis = new Float32Array([0, 0, 1]);
    static optionAttributes = {
        viewModel: { instanced:true },
        texOffset1: { instanced:true },
        texOffset2: { instanced:true },
        texCoordInfo: { instanced:true }
    }

    constructor(gl, ext) {
        this.gl = gl;
        this.ext = ext;
        this.ready = false;
        this.shader = null;
        this.unifoms = null;
        this.attributes = null;
        this.modelMatrix = mat4.create();

        this.texture = Texture.load(gl, "../img/smoke.png");
        this.particleSystem = new ParticleSystem(Particle);
        this.particleSystem.addParticles(
            new ParticleTexture(0, 8, false), 100);
        this.particleSystem.lifeSpan = 5000;
        this.particleSystem.spawnDelay = 50;
        this.particleSystem.gravity = 0;
        this.particleSystem.scale = 15;
        this.particleSystem.setSpawnPosition(-90, 15, 10);
        const numMaxParticle = this.particleSystem.maxParticleCount;
        // View model matrix arrays
        this.viewModelMatrix = this.generateDataArrays(numMaxParticle, 16);
        // Texture offset 1 arrays
        this.textureOffsets1 = this.generateDataArrays(numMaxParticle, 2);
        // Texture offset 2 arrays
        this.textureOffsets2 = this.generateDataArrays(numMaxParticle, 2);
        // Texture info arrays
        this.textureInfos = this.generateDataArrays(numMaxParticle, 2);
        // Loading
        this.loading();
    }

    async loading() {
        const gl = this.gl;
        this.shader = await Shader.load(gl, "./particule/instancied/shader.vert", "./particule/instancied/shader.frag");
        this.uniforms = this.shader.uniforms;
        this.attributes = this.shader.generateAttributes(ParticleInstanciedRenderer.optionAttributes, this.ext);
        //////// build ////////
        this.attributes.position.set(new Float32Array([
            1,-1,
            1, 1,
           -1,-1,
           -1, 1
        ]));
        const numMaxParticle = this.particleSystem.maxParticleCount;
        this.attributes.viewModel.allocate(4, true, numMaxParticle);
        this.attributes.texOffset1.allocate(2, false, numMaxParticle);
        this.attributes.texOffset2.allocate(2, false, numMaxParticle);
        this.attributes.texCoordInfo.allocate(2, false, numMaxParticle);
        this.ready = true;
    }

    generateDataArrays(numInstance = 1, dim = 3) {
        const data = new Float32Array(numInstance * dim);
        const view = [];
        for(let i = 0; i < numInstance; ++i) {
            const byteOffsetToMatrix = i * dim * Float32Array.BYTES_PER_ELEMENT;
            view.push(
                new Float32Array(data.buffer, byteOffsetToMatrix, dim)
            );
        }
        return { data, view };
    }

    enable(state = true) {
        const gl = this.gl;
        if(state) {
            this.shader.enable();
            this.texture.bind(0);
            for(const attrib in this.attributes) {
                this.attributes[attrib].enable();
            }
            gl.cullFace(gl.BACK);
            gl.enable(gl.BLEND);
            gl.depthMask(false);
        }
        else {
            this.texture.unbind(0);
            for(const attrib in this.attributes) {
                this.attributes[attrib].enable(false);
            }
            gl.disable(gl.BLEND);
            gl.depthMask(true);
        }
    }

    render(camera, light, pass) {
        const gl = this.gl;
        this.enable();
        camera.loadProjectionMatrix(this.uniforms.projection);
        // Update data
        for(const particleTextures of this.particleSystem.particleTextures) {
            const texture = particleTextures[0];
            const particules = particleTextures[1];
            this.uniforms.texture.set(texture.textureId);
            if(texture.additive) {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE);   
            }
            else {
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
            }
            let instance = 0;
            for(const particle of particules) {
                if(particle.stillAlive) {
                    // Set model matrix
                    const viewModelMatrix = this.viewModelMatrix.view[instance];
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
                    mat4.rotate(this.modelMatrix, this.modelMatrix, particle.rotation, ParticleInstanciedRenderer.zaxis);
                    mat4.scale(this.modelMatrix, this.modelMatrix, particle.scale);
                    mat4.multiply(viewModelMatrix, camera.viewMatrix, this.modelMatrix);
                    // Set texture offset 1
                    vec2.copy(this.textureOffsets1.view[instance], particle.texOffset1);
                    // Set texture offset 2
                    vec2.copy(this.textureOffsets2.view[instance], particle.texOffset2);
                    // Set texture info
                    const textureInfo = this.textureInfos.view[instance];
                    textureInfo[0] = texture.numOfRows;
                    textureInfo[1] = particle.blendFactor;
                    ++instance;
                }
            }
            this.attributes.viewModel.set(this.viewModelMatrix.data);
            this.attributes.texOffset1.set(this.textureOffsets1.data);
            this.attributes.texOffset2.set(this.textureOffsets2.data);
            this.attributes.texCoordInfo.set(this.textureInfos.data);
            // Draw call
            this.ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, this.attributes.position.count, instance);
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