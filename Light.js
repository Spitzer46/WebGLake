import * as vec3 from "./lib/vec3.js";

export default class Light {
    constructor(x = 0, y = 0, z = 0) {
        this.position = vec3.create();
        vec3.set(this.position, x, y, z);
    }

    loadLightPosition(uniform) {
        uniform.set(this.position);
    } 
}