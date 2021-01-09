precision mediump float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform vec3 cameraPosition;
uniform vec3 lightPosition;

varying vec4 vClipSpaceReal;
varying vec2 vTexCoord;
varying vec3 vSurfaceToLight;
varying vec3 vSurfaceToCamera;

const float tiling = 10.0;

void main() {
    vec4 worldPosition = model * vec4(position, 1.0);
    vec4 viewPosition = view * worldPosition;
    gl_Position = projection * viewPosition;
    vClipSpaceReal = gl_Position;
    vTexCoord = position.xy / 2.0 + 0.5;
    vTexCoord *= tiling;

    vSurfaceToLight = lightPosition - worldPosition.xyz;
    vSurfaceToCamera = cameraPosition - worldPosition.xyz;
}