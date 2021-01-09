import * as mat4 from "../lib/mat4.js";
import Texture from "../Texture.js";
import Shader from "../Shader.js";

export default class WaterMesh {
    constructor(gl) {
        this.gl = gl;
        this.ready = false;
        this.shader = null;
        this.uniforms = null;
        this.attributes = null;
        this.color = null;
        this.reflectionTexture = new Texture(gl, { width:1024, height:1024 });
        this.refractionTexture = new Texture(gl, { width:512, height:512 });
        this.dudvTexture = Texture.load(gl, "../img/waterdudv.png", { wraps:gl.REPEAT, wrapt:gl.REPEAT });
        this.normalTexture = Texture.load(gl, "../img/waternormal.png", { wraps:gl.REPEAT, wrapt:gl.REPEAT });
        this.model = mat4.fromScaling(mat4.create(), [155, 155, 155]);
        this.mat4 = mat4.create();
        mat4.mul(this.model, mat4.fromRotation(this.mat4, Math.PI / 2, [-1, 0, 0]), this.model);
        mat4.mul(this.model, mat4.fromTranslation(this.mat4, [0, 0, 0]), this.model);
        this.time = 0.0;
        this.waveSpeed = 0.00005;
        // Start loading
        this.loading();
    }

    async loading() {
        const gl = this.gl;
        ///////// init ////////
        this.shader = await Shader.load(gl, "./water/shader.vert", "./water/shader.frag");
        this.uniforms = this.shader.uniforms;
        this.attributes = this.shader.generateAttributes();
        //////// build ////////
        this.attributes.position.set(new Float32Array([
           -1, 1, 0, // 0
           -1,-1, 0, // 2
            1, 1, 0, // 1
           -1,-1, 0, // 2
            1,-1, 0, // 3
            1, 1, 0  // 1
        ]));
        /////// ready /////////
        this.ready = true;
    }

    enable(state = true) {
        if(state) {
            this.shader.enable(true);
            this.reflectionTexture.bind(0);
            this.dudvTexture.bind(1);
            this.normalTexture.bind(2);
            this.refractionTexture.bind(3);
            for(const attrib in this.attributes) {
                this.attributes[attrib].enable();
            }
        }
        else {
            this.reflectionTexture.unbind(0);
            this.dudvTexture.unbind(1);
            this.normalTexture.unbind(2);
            this.refractionTexture.unbind(3);
        }
    }

    render(camera, light, pass) {
        const gl = this.gl;
        gl.cullFace(gl.BACK);
        this.enable(true);
        camera.loadProjectionMatrix(this.uniforms.projection);
        camera.loadViewMatrix(this.uniforms.view);
        camera.loadPositionVector(this.uniforms.cameraPosition);
        light.loadLightPosition(this.uniforms.lightPosition);
        this.uniforms.model.set(this.model);
        this.uniforms.reflectionTexture.set(0);
        this.uniforms.dudvTexture.set(1);
        this.uniforms.normalTexture.set(2);
        this.uniforms.refractionTexture.set(3);
        this.uniforms.time.set(this.time);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.attributes.position.count);
        this.enable(false);
    }

    update(ellapsed, camera) {
        this.time += ellapsed * this.waveSpeed;
        this.time %= 1;
    }

    dispose() {
        this.shader.dispose();
        this.reflectionTexture.dispose();
        this.dudvTexture.dispose();
        this.normalTexture.dispose();
        this.refractionTexture.dispose();
        for(const attrib in this.attributes) {
            this.attributes[attrib].dispose();
        }
    }
}