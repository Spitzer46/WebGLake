precision mediump float;

attribute vec3 position;
attribute vec2 uv;
attribute vec3 normal;
attribute vec3 tangent;
attribute vec3 bitangent;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform vec4 plane;
uniform vec3 lightPosition;

varying vec2 vUv;
varying mat3 vTbn;
varying vec3 vSurfaceToLight;
varying float vClipDistance;

void main() {
    vec4 worldPosition = model * vec4(position, 1.0);
    gl_Position = projection * view * worldPosition;

    vec3 worldNormal = normalize(vec3(model * vec4(normal, 0.0)));
    vec3 worldTangent = normalize(vec3(model * vec4(tangent, 0.0)));
    vec3 worldBitangent = normalize(vec3(model * vec4(bitangent, 0.0)));

    vUv = uv;
    vTbn = mat3(worldTangent, worldBitangent, worldNormal);
    vSurfaceToLight = lightPosition - worldPosition.xyz;
    vClipDistance = dot(worldPosition, plane);
}