#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D texture;
uniform sampler2D normalMap;

varying vec2 vUv;
varying vec3 vSurfaceToLight;
varying vec3 vSurfaceToCamera;
varying mat3 vTbn;

const vec3 ambiantColor = vec3(0.95);
const float ambientIntensity = 0.5;
const vec3 directionalColor = vec3(0.95);
const float diffuseIntensity = 2.5;
const float specularIntensity = 0.5;
const float specularPower = 2.0;

void main() {
    vec3 normal = texture2D(normalMap, vUv).xyz * 2.0 - 1.0;
    normal = normalize(vTbn * normal);

    vec3 surfaceToLight = normalize(vSurfaceToLight);
    vec3 surfaceToCamera = normalize(vSurfaceToCamera);

    vec4 ambiantColor = vec4(ambiantColor, 1.0) * ambientIntensity;
    vec4 diffuseColor = vec4(0.0);
    vec4 specularColor = vec4(0.0);

    float diffuseFactor = dot(normal, surfaceToLight);
    if(diffuseFactor > 0.0) {
        diffuseColor = vec4(directionalColor, 1.0) * diffuseIntensity * diffuseFactor;

        vec3 halfVector = normalize(surfaceToLight + surfaceToCamera);
        float specularFactor = dot(normal, halfVector);
        if(specularFactor > 0.0) {
            specularFactor = pow(specularFactor, specularPower);
            specularColor = vec4(directionalColor, 1.0) * specularIntensity * specularFactor;
        }
    }

    gl_FragColor = texture2D(texture, vUv) * (ambiantColor + diffuseColor + specularColor);
}