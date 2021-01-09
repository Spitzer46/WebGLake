precision mediump float;

uniform sampler2D reflectionTexture;
uniform sampler2D refractionTexture;
uniform sampler2D dudvTexture;
uniform sampler2D normalTexture;
uniform float time;

varying vec4 vClipSpaceReal;
varying vec2 vTexCoord;
varying vec3 vSurfaceToLight;
varying vec3 vSurfaceToCamera;

const float waveStrength = 0.005;
const float shineDamper = 20.0;
const float reflectivity = 0.5;
const vec3 lightColor = vec3(1.0);
const vec3 oceanColor = vec3(0.113, 0.199, 0.289);

void main() {
    vec2 texCoords = (vClipSpaceReal.xy / vClipSpaceReal.w) / 2.0 + 0.5;
    
    vec2 distortedTexCoords = texture2D(dudvTexture, vec2(vTexCoord.x + time, vTexCoord.y)).rg * 0.1;
    distortedTexCoords = vTexCoord + vec2(distortedTexCoords.x, distortedTexCoords.y + time);
    vec2 totalDistortionCoords = texture2D(dudvTexture, distortedTexCoords).rg * 2.0 - 1.0;
    totalDistortionCoords *= waveStrength;

    texCoords += totalDistortionCoords;
    texCoords = clamp(texCoords, 0.001, 0.999);

    vec3 surfaceToLight = normalize(vSurfaceToLight);
    vec3 surfaceToCamera = normalize(vSurfaceToCamera);

    vec4 normalTexel = texture2D(normalTexture, distortedTexCoords);
    vec3 normal = vec3(normalTexel.r * 2.0 - 1.0, normalTexel.b, normalTexel.g * 2.0 - 1.0);
    normal = normalize(normal);

    vec3 reflectedLight = reflect(-surfaceToLight, normal);
    float specular = max(dot(reflectedLight, surfaceToCamera), 0.0);
    specular = pow(specular, shineDamper);
    vec3 specularHightlights = lightColor * specular * reflectivity;

    float refractiveFactor = dot(surfaceToCamera, vec3(0.0, 1.0, 0.0));
    vec3 reflectionTexel = texture2D(reflectionTexture, texCoords).rgb;
    vec3 refractionTexel = texture2D(refractionTexture, texCoords).rgb;

    gl_FragColor = vec4(mix(reflectionTexel, refractionTexel, refractiveFactor) + specularHightlights, 1.0);
}