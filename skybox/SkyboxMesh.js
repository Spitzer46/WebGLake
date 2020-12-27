import * as mat4 from "../lib/mat4.js";
import Shader from "../Shader.js";
import Element from "../Element.js";
import TextureCubeMap from "../TextureCubeMap.js";
import loadImage from "../util/loadImage.js";

export class SkyboxMesh {
    constructor(gl) {
        this.gl = gl;
        this.ready = false;
        this.shader = null;
        this.uniforms = null;
        this.attributes = null;
        this.elements = new Element(gl);
        this.model = mat4.create();
        this.textureCube = new TextureCubeMap(gl);
        // Start shader loading
        Shader.fromScripts(gl, "./skybox/shader.vert", "./skybox/shader.frag").then(shader => {
            ///////// init ////////
            this.shader = shader;
            this.uniforms = shader.uniforms;
            this.attributes = shader.generateAttributes();
            //////// build ////////
            const s = 4000;
            this.attributes.position.set(new Float32Array([
                s, s, s,
                s, s,-s,
                s,-s, s,
                s,-s,-s,
               -s, s,-s,
               -s, s, s,
               -s,-s,-s,
               -s,-s, s,
               -s, s,-s,
                s, s,-s,
               -s, s, s,
                s, s, s,
               -s,-s, s,
                s,-s, s,
               -s,-s,-s,
                s,-s,-s,
               -s, s, s,
                s, s, s,
               -s,-s, s,
                s,-s, s,
                s, s,-s,
               -s, s,-s,
                s,-s,-s,
               -s,-s,-s
            ]));
            /////// element ///////
            this.elements.set(new Uint16Array([
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
            ]));
            /////// ready /////////
            this.ready = true;
        });
        // Start load images
        const promiseImages = [];
        promiseImages.push(loadImage("../img/skybox/front.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Z));
        promiseImages.push(loadImage("../img/skybox/back.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z));
        promiseImages.push(loadImage("../img/skybox/right.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_X));
        promiseImages.push(loadImage("../img/skybox/left.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_X));
        promiseImages.push(loadImage("../img/skybox/top.jpg", gl.TEXTURE_CUBE_MAP_POSITIVE_Y));
        promiseImages.push(loadImage("../img/skybox/bottom.jpg", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y));
        Promise.all(promiseImages).then(imagesLoaded => {
            this.textureCube.set(imagesLoaded.map(il => { 
                return { target:il.args[0], data:il.img }
            }));
        });
    }

    enable(state = true) {
        if(state) {
            this.shader.enable(true);
            this.elements.enable();
            this.textureCube.bind(0);
            for(const attrib in this.attributes) {
                this.attributes[attrib].enable();
            }
        }
        else {
            this.textureCube.unbind(0)
        }
    }
    
    render(camera) {
        this.enable(true);
        camera.loadProjectionMatrix(this.uniforms.projection);
        camera.loadViewMatrix(this.uniforms.view, false);
        this.uniforms.model.set(this.model);
        this.uniforms.texture.set(0);
        this.elements.draw();
        this.enable(false);
    }

    update(ellapsed) {}

    dispose() {
        this.shader.dispose();
        this.elements.dispose();
        this.textureCube.dispose();
        for(const attrib in this.attributes) {
            this.attributes[attrib].dispose();
        }
    }
}