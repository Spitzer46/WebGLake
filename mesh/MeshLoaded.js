import * as mat4 from "../lib/mat4.js";
import * as vec4 from "../lib/vec4.js";
import Shader from "../Shader.js";
import Texture from "../Texture.js";
import { computeTangentWithoutIndexes } from "../util/computeTangent.js";
import loadObj from "../util/loadObj.js";

export default class MeshLoaded {
    constructor(gl, objUrl, textureUrl, normalUrl) {
        this.gl = gl;
        this.ready = false;
        this.shader = null;
        this.uniforms = null;
        this.attributes = null;
        this.model = mat4.create();
        this.texture = Texture.load(gl, textureUrl, { wraps:gl.REPEAT, wrapt:gl.REPEAT });
        this.normalMap = Texture.load(gl, normalUrl, { wraps:gl.REPEAT, wrapt:gl.REPEAT });
        this.plane = new Float32Array([0, 0, 0, 0]);
        // Start loading
        this.loading(objUrl);
    }

    async loading(objUrl) {
        const gl = this.gl;
        ///////// init ////////
        this.shader = await Shader.load(gl, "./mesh/standart.vert", "./mesh/standart.frag");
        this.uniforms = this.shader.uniforms;
        this.attributes = this.shader.generateAttributes();
        //// load geometry ////
        const objects = await loadObj(objUrl);
        this.attributes.position.set(new Float32Array(objects[0].vertices));
        this.attributes.normal.set(new Float32Array(objects[0].normal));
        this.attributes.uv.set(new Float32Array(objects[0].uv));

        const [ tangents, bitangents ] = computeTangentWithoutIndexes(objects[0].vertices, objects[0].uv);
        this.attributes.tangent.set(new Float32Array(tangents));
        this.attributes.bitangent.set(new Float32Array(bitangents));
        /////// ready /////////
        this.ready = true;
        console.log(this);
    }

    enable(state = true)  {
        if(state) {
            this.shader.enable(true);
            this.texture.bind(0);
            this.normalMap.bind(1);
            for(const attrib in this.attributes) {
                this.attributes[attrib].enable();
            }
        }
        else {
            this.texture.unbind(0);
            this.normalMap.unbind(1);
        }
    }

    render(camera, light, pass) {
        this.enable(true);
        const gl = this.gl;
        switch(pass) {
            case 0: // Reflection pass
                gl.cullFace(gl.FRONT);
                vec4.set(this.plane, 0, 1, 0, 0.1);
                break;
            case 1: // Refraction pass
                gl.cullFace(gl.BACK);
                vec4.set(this.plane, 0, -1, 0, 2);
                break;
            case 2: // Render pass
                gl.cullFace(gl.BACK);
                vec4.set(this.plane, 0, 1, 0, 0);
                break;
            default:
        }
        camera.loadProjectionMatrix(this.uniforms.projection);
        camera.loadViewMatrix(this.uniforms.view);
        light.loadLightPosition(this.uniforms.lightPosition);
        this.uniforms.model.set(this.model);
        this.uniforms.texture.set(0);
        this.uniforms.normalMap.set(1);
        this.uniforms.plane.set(this.plane);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.attributes.position.count);
        this.enable(false);
    }

    update(ellapsed, camera) {}

    dispose() {
        this.shader.dispose();
        this.texture.dispose();
        this.normalMap.dispose();
        for(const attrib in this.attributes) {
            this.attributes[attrib].dispose();
        }
    }
}