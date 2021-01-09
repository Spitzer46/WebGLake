precision mediump float;

uniform sampler2D normalMap;
uniform sampler2D texture;

varying vec2 vUv;
varying mat3 vTbn;
varying vec3 vSurfaceToLight;
varying float vClipDistance;

const vec3 ambiantColor = vec3(0.95);
const float ambientIntensity = 0.5;
const vec3 directionalColor = vec3(0.95);
const float diffuseIntensity = 1.1;

void main() {
    if(vClipDistance < 0.0) {
        discard;
    }

    vec3 normal = texture2D(normalMap, vUv).rgb * 2.0 - 1.0;
    normal = normalize(vTbn * normal);

    vec3 ambiantColor = ambiantColor * ambientIntensity;
    vec3 diffuseColor = vec3(0.0);

    vec3 surfaceToLight = normalize(vSurfaceToLight);
    float diffuseFactor = dot(normal, surfaceToLight);
    if(diffuseFactor > 0.0) {
        diffuseColor = directionalColor * diffuseIntensity * diffuseFactor;
    }

    gl_FragColor = vec4(texture2D(texture, vUv).rgb * (ambiantColor + diffuseColor), 1.0);
}