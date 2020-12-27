import * as vec3 from "../lib/vec3.js";
import * as vec2 from "../lib/vec2.js";

export function computeTangent(indices = [], vertices = [], uv = []) {
    const tangents = new Float32Array(vertices.length);
    const bitangents = new Float32Array(vertices.length);

    const v0 = vec3.create();
    const v1 = vec3.create();
    const v2 = vec3.create();
    const uv0 = vec2.create();
    const uv1 = vec2.create();
    const uv2 = vec2.create();
    const deltaPos1 = vec3.create();
    const deltaPos2 = vec3.create();
    const deltaUv1 = vec2.create();
    const deltaUv2 = vec2.create();
    const right = vec3.create();
    const left = vec3.create();
    const tangent = vec3.create();
    const bitangent = vec3.create();

    for(let i = 0; i < indices.length; i+=3) {
        const index0 = indices[i];
        const index1 = indices[i+1];
        const index2 = indices[i+2];

        vec3.set(v0, vertices[index0*3], vertices[index0*3+1], vertices[index0*3+2]);
        vec3.set(v1, vertices[index1*3], vertices[index1*3+1], vertices[index1*3+2]);
        vec3.set(v2, vertices[index2*3], vertices[index2*3+1], vertices[index2*3+2]);
        vec2.set(uv0, uv[index0*2], uv[index0*2+1]);
        vec2.set(uv1, uv[index1*2], uv[index1*2+1]);
        vec2.set(uv2, uv[index2*2], uv[index2*2+1]);

        vec3.sub(deltaPos1, v1, v0);
        vec3.sub(deltaPos2, v2, v0);
        vec2.sub(deltaUv1, uv1, uv0);
        vec2.sub(deltaUv2, uv2, uv0);

        const r = 1.0 / (deltaUv1[0] * deltaUv2[1] - deltaUv1[1] * deltaUv2[0]);
        // Compute tangent
        vec3.multiplyByScalar(left, deltaPos1, deltaUv2[1]);
        vec3.multiplyByScalar(right, deltaPos2, deltaUv1[1]);
        vec3.subtract(tangent, left, right);
        vec3.multiplyByScalar(tangent, tangent, r);

        // Compute bitantent
        vec3.multiplyByScalar(left, deltaPos2, deltaUv1[0]);
        vec3.multiplyByScalar(right, deltaPos1, deltaUv2[0]);
        vec3.subtract(bitangent, left, right);
        vec3.multiplyByScalar(bitangent, bitangent, r);

        const tx = tangent[0];
        const ty = tangent[1];
        const tz = tangent[2];
        const bx = bitangent[0];
        const by = bitangent[1];
        const bz = bitangent[2];

        tangents[index0*3] = tx;
        tangents[index0*3+1] = ty;
        tangents[index0*3+2] = tz;
        tangents[index1*3] = tx;
        tangents[index1*3+1] = ty;
        tangents[index1*3+2] = tz;
        tangents[index2*3] = tx;
        tangents[index2*3+1] = ty;
        tangents[index2*3+2] = tz;

        bitangents[index0*3] = bx;
        bitangents[index0*3+1] = by;
        bitangents[index0*3+2] = bz;
        bitangents[index1*3] = bx;
        bitangents[index1*3+1] = by;
        bitangents[index1*3+2] = bz;
        bitangents[index2*3] = bx;
        bitangents[index2*3+1] = by;
        bitangents[index2*3+2] = bz;
    }

    return [ tangents, bitangents ];
}