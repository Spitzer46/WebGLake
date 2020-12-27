#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform sampler2D reflectionTexture;
uniform sampler2D dudvTexture;
uniform sampler2D normalTexture;
uniform float time;

varying vec4 vClipSpaceReal;
varying vec2 vTexCoord;
varying vec3 vSurfaceToLight;
varying vec3 vSurfaceToCamera;

const float waveStrength = 0.005;
const float shineDamper = 20.0;
const float reflectivity = 0.6;
const vec3 lightColor = vec3(1.0);

void main() {
    vec2 refractTexCoords = (vClipSpaceReal.xy / vClipSpaceReal.w) / 2.0 + 0.5;
    
    vec2 distortedTexCoords = texture2D(dudvTexture, vec2(vTexCoord.x + time, vTexCoord.y)).rg * 0.1;
    distortedTexCoords = vTexCoord + vec2(distortedTexCoords.x, distortedTexCoords.y + time);
    vec2 totalDistortionCoords = texture2D(dudvTexture, distortedTexCoords).rg * 2.0 - 1.0;
    totalDistortionCoords *= waveStrength;

    refractTexCoords += totalDistortionCoords;

    vec3 surfaceToLight = normalize(vSurfaceToLight);
    vec3 surfaceToCamera = normalize(vSurfaceToCamera);

    vec4 normalTexel = texture2D(normalTexture, distortedTexCoords);
    vec3 normal = vec3(normalTexel.r * 2.0 - 1.0, normalTexel.b, normalTexel.g * 2.0 - 1.0);
    normal = normalize(normal);

    vec3 reflectedLight = reflect(-surfaceToLight, normal);
    float specular = max(dot(reflectedLight, surfaceToCamera), 0.0);
    specular = pow(specular, shineDamper);
    vec3 specularHightlights = lightColor * specular * reflectivity;

    gl_FragColor = texture2D(reflectionTexture, refractTexCoords) + vec4(specularHightlights, 0.0);
}