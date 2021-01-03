precision highp float;

attribute vec3 position;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;

varying vec3 vTexCoord;
varying vec3 vPosition;

void main() {
    gl_Position = projection * view * model * vec4(position, 1.0);
    vTexCoord = normalize(position.xyz);
}