precision mediump float;

attribute vec2 position;

uniform mat4 projection;
uniform mat4 viewModel;
uniform vec2 texOffset1;
uniform vec2 texOffset2;
uniform vec2 textCoordInfo;

varying vec2 vTexCoords1;
varying vec2 vTexCoords2;
varying float vBlendFactor;

void main() {
    vec2 texCoords = position.xy * 0.5 + vec2(0.5);
    texCoords /= textCoordInfo.x;
    vTexCoords1 = texCoords + texOffset1;
    vTexCoords2 = texCoords + texOffset2;
    vBlendFactor = textCoordInfo.y;

    gl_Position = projection * viewModel * vec4(position, 0.0, 1.0);
}