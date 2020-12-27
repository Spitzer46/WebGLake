precision highp float;

attribute vec3 position;
attribute vec2 uv;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform vec3 cameraPosition;

varying vec4 vClipSpaceReal;
varying vec2 vTexCoord;
varying vec3 vSurfaceToLight;
varying vec3 vSurfaceToCamera;

const float tiling = 30.0;
const vec3 lightPosition = vec3(-270.0, 300.0, -500.0);

void main() {
    vec4 worldPosition = model * vec4(position, 1.0);
    gl_Position = projection * view * worldPosition;
    vClipSpaceReal = gl_Position;
    vTexCoord = position.xy / 2.0 + 0.5;
    vTexCoord *= tiling;

    vSurfaceToLight = lightPosition - worldPosition.xyz;
    vSurfaceToCamera = cameraPosition - worldPosition.xyz;
}