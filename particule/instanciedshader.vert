precision mediump float;

attribute vec2 position;
attribute mat4 viewModel;
attribute vec2 texOffset1;
attribute vec2 texOffset2;
attribute vec2 texCoordInfo;

uniform mat4 projection;

varying vec2 vTexCoords1;
varying vec2 vTexCoords2;
varying float vBlendFactor;

void main() {
    vec2 texCoords = position.xy * 0.5 + vec2(0.5);
    texCoords /= texCoordInfo.x;
    vTexCoords1 = texCoords + texOffset1;
    vTexCoords2 = texCoords + texOffset2;
    vBlendFactor = texCoordInfo.y;

    gl_Position = projection * viewModel * vec4(position, 0.0, 1.0);
}