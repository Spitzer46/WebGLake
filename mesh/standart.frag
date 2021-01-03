#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D normalMap;
uniform sampler2D texture;

varying vec2 vUv;
varying mat3 vTbn;
varying vec3 vSurfaceToLight;
varying vec4 vWorldPosition;
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

    vec4 ambiantColor = vec4(ambiantColor, 1.0) * ambientIntensity;
    vec4 diffuseColor = vec4(0.0);

    vec3 surfaceToLight = normalize(vSurfaceToLight);
    float diffuseFactor = dot(normal, surfaceToLight);
    if(diffuseFactor > 0.0) {
        diffuseColor = vec4(directionalColor, 1.0) * diffuseIntensity * diffuseFactor;
    }

    gl_FragColor = texture2D(texture, vUv) * (ambiantColor + diffuseColor);
}