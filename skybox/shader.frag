precision mediump float;

uniform samplerCube texture;

varying vec3 vTexCoord;

void main() {
    gl_FragColor = textureCube(texture, vTexCoord);
}