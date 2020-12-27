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
        this.dudvTexture = Texture.load(gl, "../img/waterdudv.png", { wraps:gl.REPEAT, wrapt:gl.REPEAT });
        this.normalTexture = Texture.load(gl, "../img/waternormal.jpg", { wraps:gl.REPEAT, wrapt:gl.REPEAT });
        this.model = mat4.fromScaling(mat4.create(), [500, 500, 500]);
        this.mat4 = mat4.create();
        this.time = 0.0;
        this.waveSpeed = 0.000025;

        // Start shader loading
        Shader.fromScripts(gl, "./water/shader.vert", "./water/shader.frag").then(shader => {
            ///////// init ////////
            this.shader = shader;
            this.uniforms = shader.uniforms;
            this.attributes = shader.generateAttributes();
            mat4.mul(this.model, mat4.fromRotation(this.mat4, Math.PI / 2, [-1, 0, 0]), this.model);
            mat4.mul(this.model, mat4.fromTranslation(this.mat4, [0, 0, 0]), this.model);
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
        });
    }

    enable(state = true) {
        if(state) {
            this.shader.enable(true);
            this.reflectionTexture.bind(0);
            this.dudvTexture.bind(1);
            this.normalTexture.bind(2);
            for(const attrib in this.attributes) {
                this.attributes[attrib].enable();
            }
            
        }
        else {
            this.reflectionTexture.unbind(0);
            this.dudvTexture.unbind(1);
            this.normalTexture.unbind(2);
        }
    }

    render(camera) {
        this.enable(true);
        camera.loadProjectionMatrix(this.uniforms.projection);
        camera.loadViewMatrix(this.uniforms.view);
        camera.loadPositionVector(this.uniforms.cameraPosition);
        this.uniforms.model.set(this.model);
        this.uniforms.reflectionTexture.set(0);
        this.uniforms.dudvTexture.set(1);
        this.uniforms.normalTexture.set(2);
        this.uniforms.time.set(this.time);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.attributes.position.count);
        this.enable(false);
    }

    update(ellapsed) {
        this.time += ellapsed * this.waveSpeed;
        this.time %= 1;
    }

    dispose() {
        this.texture.dispose();
        for(const attrib in this.attributes) {
            this.attributes[attrib].dispose();
        }
    }
}