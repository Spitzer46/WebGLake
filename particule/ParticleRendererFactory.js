import ParticleInstanciedRenderer from "./ParticleInstanciedRenderer.js";
import ParticleRenderer from "./ParticleRenderer.js";

export default function(gl) {
    const instancedArraysExt = gl.getExtension('ANGLE_instanced_arrays');
    if(instancedArraysExt !== null) {
        return new ParticleInstanciedRenderer(gl, instancedArraysExt);
    }
    return new ParticleRenderer(gl);
    // return new ParticleRenderer(gl);
}