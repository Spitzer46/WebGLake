precision mediump float;

uniform sampler2D texture;

varying vec2 vTexCoords1;
varying vec2 vTexCoords2;
varying float vBlendFactor;

void main() {
    vec4 texel1 = texture2D(texture, vTexCoords1);
    vec4 texel2 = texture2D(texture, vTexCoords2);
    gl_FragColor = mix(texel1, texel2, vBlendFactor);
}