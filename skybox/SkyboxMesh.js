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
        this.model = mat4.fromTranslation(mat4.create(), [0, -400, 0]);
        this.textureCube = new TextureCubeMap(gl);
        // Start shader loading
        this.loading();
    }

    async loading() {
        const gl = this.gl;
        ///////// init ////////
        this.shader = await Shader.load(gl, "./skybox/shader.vert", "./skybox/shader.frag");
        this.uniforms = this.shader.uniforms;
        this.attributes = this.shader.generateAttributes();
        //////// build ////////
        const s = 1000;
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
        // Start image loadings
        const promiseImages = [];
        promiseImages.push(loadImage("../img/daylight/front.bmp", gl.TEXTURE_CUBE_MAP_POSITIVE_Z));
        promiseImages.push(loadImage("../img/daylight/back.bmp", gl.TEXTURE_CUBE_MAP_NEGATIVE_Z));
        promiseImages.push(loadImage("../img/daylight/right.bmp", gl.TEXTURE_CUBE_MAP_POSITIVE_X));
        promiseImages.push(loadImage("../img/daylight/left.bmp", gl.TEXTURE_CUBE_MAP_NEGATIVE_X));
        promiseImages.push(loadImage("../img/daylight/top.bmp", gl.TEXTURE_CUBE_MAP_POSITIVE_Y));
        promiseImages.push(loadImage("../img/daylight/bottom.bmp", gl.TEXTURE_CUBE_MAP_NEGATIVE_Y));
        const imagesLoaded = await Promise.all(promiseImages);
        this.textureCube.set(imagesLoaded.map(il => {
            return { target:il.args[0], data:il.img }
        }));
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
    
    render(camera, light, pass) {
        const gl = this.gl;
        if(pass === 2) {
            gl.cullFace(gl.FRONT);
        }
        else {
            gl.cullFace(gl.BACK);
        }
        this.enable(true);
        camera.loadProjectionMatrix(this.uniforms.projection);
        camera.loadViewMatrix(this.uniforms.view, false);
        this.uniforms.model.set(this.model);
        this.uniforms.texture.set(0);
        this.elements.draw();
        this.enable(false);
    }

    update(ellapsed, camera) {
        mat4.rotateY(this.model, this.model, ellapsed * 0.000015);
    }

    dispose() {
        this.shader.dispose();
        this.elements.dispose();
        this.textureCube.dispose();
        for(const attrib in this.attributes) {
            this.attributes[attrib].dispose();
        }
    }
}