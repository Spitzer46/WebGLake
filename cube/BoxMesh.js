import * as mat4 from "../lib/mat4.js";
import Shader from "../Shader.js";
import Element from "../Element.js";
import Texture from "../Texture.js";
import { computeTangent } from "../util/computeTangent.js";

export default class BoxMesh {
    constructor(gl) {
        this.gl = gl;
        this.ready = false;
        this.shader = null;
        this.uniforms = null;
        this.attributes = null;
        this.texture = Texture.load(gl, "../img/albedo.png");
        this.normalMap = Texture.load(gl, "../img/albedo_normal.png");
        this.elements = new Element(gl);
        this.model = mat4.fromTranslation(mat4.create(), [0, 2, 0]);
        mat4.scale(this.model, this.model, [2, 2, 2]);
        // Start shader loading
        Shader.fromScripts(gl, "./cube/shader.vert", "./cube/shader.frag").then(shader => {
            ///////// init ////////
            this.shader = shader;
            this.uniforms = shader.uniforms;
            this.attributes = shader.generateAttributes();
            //////// build ////////
            const vertices = new Float32Array([
                0.5, 0.5, 0.5,
                0.5, 0.5,-0.5,
                0.5,-0.5, 0.5,
                0.5,-0.5,-0.5,
               -0.5, 0.5,-0.5,
               -0.5, 0.5, 0.5,
               -0.5,-0.5,-0.5,
               -0.5,-0.5, 0.5,
               -0.5, 0.5,-0.5,
                0.5, 0.5,-0.5,
               -0.5, 0.5, 0.5,
                0.5, 0.5, 0.5,
               -0.5,-0.5, 0.5,
                0.5,-0.5, 0.5,
               -0.5,-0.5,-0.5,
                0.5,-0.5,-0.5,
               -0.5, 0.5, 0.5,
                0.5, 0.5, 0.5,
               -0.5,-0.5, 0.5,
                0.5,-0.5, 0.5,
                0.5, 0.5,-0.5,
               -0.5, 0.5,-0.5,
                0.5,-0.5,-0.5,
               -0.5,-0.5,-0.5
            ]);
            const uv = new Float32Array([
                0, 1,
                1, 1,
                0, 0,
                1, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 0,
                0, 1,
                1, 1,
                0, 0,
                1, 0
            ]);
            const normal = new Float32Array([
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
                1, 0, 0,
               -1, 0, 0,
               -1, 0, 0,
               -1, 0, 0,
               -1, 0, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0, 1, 0,
                0,-1, 0,
                0,-1, 0,
                0,-1, 0,
                0,-1, 0,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0, 1,
                0, 0,-1,
                0, 0,-1,
                0, 0,-1,
                0, 0,-1
            ]);
            const element = new Uint16Array([
                0, 2, 1,
                2, 3, 1,
                4, 6, 5,
                6, 7, 5,
                8, 10, 9,
                10, 11, 9,
                12, 14, 13,
                14, 15, 13,
                16, 18, 17,
                18, 19, 17,
                20, 22, 21,
                22, 23, 21
            ]);
            const [ tangents, bitangents ] = computeTangent(element, vertices, uv);
            console.log(tangents, bitangents);
            this.attributes.position.set(vertices);
            this.attributes.uv.set(uv);
            this.attributes.normal.set(normal);
            this.attributes.tangent.set(tangents);
            this.attributes.bitangent.set(bitangents);
            this.elements.set(element);
            /////// ready /////////
            this.ready = true;
        });
    }

    enable(state = true) {
        if(state) {
            this.shader.enable(true);
            this.elements.enable();
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

    render(camera) {
        this.enable(true);
        camera.loadProjectionMatrix(this.uniforms.projection);
        camera.loadViewMatrix(this.uniforms.view);
        camera.loadPositionVector(this.uniforms.cameraPosition);
        this.uniforms.model.set(this.model);
        this.uniforms.texture.set(0);
        this.uniforms.normalMap.set(1);
        this.elements.draw();
        this.enable(false);
    }

    update(ellapsed) {
        mat4.rotateY(this.model, this.model, ellapsed * 0.0002);
        mat4.rotateX(this.model, this.model, ellapsed * 0.0002);
    }

    dispose() {
        this.shader.dispose();
        this.elements.dispose();
        for(const attrib in this.attributes) {
            this.attributes[attrib].dispose();
        }
    }
}