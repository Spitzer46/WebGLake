#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform samplerCube texture;

varying vec3 vTexCoord;

void main() {
    gl_FragColor = textureCube(texture, vTexCoord);
}