#version 300 es
precision mediump float;
precision mediump int;
out vec4 fragColor;
in vec2 fragmentUV;
uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform int uRenderMode;
uniform vec2 uTranslation;
uniform sampler2D uSourceTexture;
uniform sampler2D uNoiseTexture;
uniform vec2 uSize; // Example: a model transformation matrix
uniform vec2 uPadding;

#define TEXTURE_SOURCE(uv) texture(uSourceTexture, uv).r
#define TEXTURE_NOISE(uv) texture(uNoiseTexture, uv).r
#define trace(edge, thin) smoothstep(thin, .0, edge)
#define ss(a,b,t) smoothstep(a,b,t)

const float speed = .01;
const float scale = .01;
const float falloff = 3.;
const float fade = 5.;
const float strength = 0.2;
const float range = 10.;

vec3 color(vec2 pos){
  vec3 result = vec3(0.0);

  result = cos(length(uTranslation+pos)*0.5 + iTime * 0.5 + vec3(0.0, 1.0, 2.0)) + 1.0;
  result = normalize(result);

  return result;
}

void main()
{
  vec2 fragCoord = gl_FragCoord.xy;

  //writing the previous full screen buffer into the current full screen buffer
  if (uRenderMode == 0)
  {
    vec2 uv = fragCoord/iResolution.xy*1.05 - vec2(0.025, 0.025);
    vec4 frame = texture(uSourceTexture, uv);
    float paint = max(0.0, frame.x - iTimeDelta * 0.999);
    fragColor = frame * vec4(0.999999, 0.999999, 0.999999, 1.0);
  }
  //drawing circle
  else if (uRenderMode == 1)
  {
    //example uSize = 150, and uPadding = 50
    vec2 totalSize = uSize + uPadding; // Size of the shape being drawn including padding, example 200x100
    vec2 center = vec2(0.5); // Define the center point in UV space (0.5, 0.5)
    vec2 relativePositionFromCenter = fragmentUV - center; // -0.5 to 0.5 range
    vec2 pos = relativePositionFromCenter * totalSize; // Absolute coordinate relative to center, example -100 to 100 on x axis, -50 to 50 on y axis
    float dist = length(pos); // Calculate the absolute distance of the current fragment from the center, example 0 to 111.8
    float radius = uSize.x * 0.5; // Determine the radius of the circle based on the x component of size, example 75
    float edge = length(vec2(dFdx(dist), dFdy(dist))); // Calculate the gradient magnitude of the distance for anti-aliasing
    vec3 color = color(pos); // Generate a time-varying color based on translation and time

    float inside = smoothstep(radius, radius - edge, dist); // Compute the inside mask using smoothstep for anti-aliasing
    float outlineFactor = smoothstep(radius - edge, radius, dist) - smoothstep(radius, radius + edge, dist); // Compute the outline mask using smoothstep for soft edges
    
    //vec3 outline = outlineFactor * color; // Apply the generated color to the outline mask

    float glow = smoothstep(radius - 0.1, radius, dist) - smoothstep(radius, radius + 0.1, dist); // Additional glow effect outside the circle
    glow = glow * glow * glow;
    fragColor = vec4(glow * color, 1. - smoothstep(radius, radius + 0.1, dist));
    fragColor = max(fragColor, outlineFactor);
  }
  //drawing rectangles
  else if (uRenderMode == 2)
  {
    vec2 totalSize = uSize + uPadding; // Size of the shape being drawn including padding
    vec2 center = vec2(0.5); // Define the center point in UV space
    vec2 pos = (fragmentUV - center) * totalSize; // Absolute coordinate relative to center
    vec2 dist = abs(pos); // Calculate the absolute distance from center for each axis
    vec2 radius = uSize * 0.5; // Determine the radius (half-size) for each axis
    vec2 edge = vec2(length(vec2(dFdx(dist.x), dFdy(dist.x))), length(vec2(dFdx(dist.y), dFdy(dist.y)))); // Calculate gradient magnitude for AA per axis
    vec3 color = color(pos); // Generate time-varying color

    vec2 insideVec = smoothstep(radius, radius - edge, dist); // Compute inside mask per axis
    vec2 outlineFactorVec = smoothstep(radius - edge, radius, dist) - smoothstep(radius, radius + edge, dist); // Compute outline mask per axis
    
    float inside = insideVec.x * insideVec.y; // Combine inside masks
    vec2 outerVec = 1.0 - smoothstep(radius, radius + edge, dist); // Compute mask for outline bounds
    float outlineFactor = max(outlineFactorVec.x * outerVec.y, outlineFactorVec.y * outerVec.x); // Combine outline masks

    vec2 glowVec = smoothstep(radius - 0.1, radius, dist) - smoothstep(radius, radius + 0.1, dist); // Compute glow gradient per axis
    vec2 glowMask = 1.0 - smoothstep(radius, radius + 0.1, dist); // Compute mask to limit glow extension
    float glow = max(glowVec.x * glowMask.y, glowVec.y * glowMask.x); // Combine axis glows
    glow = glow * glow * glow; // Apply cubic falloff to glow
    fragColor = vec4(glow * color, glow); // Set fragment color with glow
    fragColor = max(fragColor, outlineFactor); // Overlay the solid outline
    fragColor = mix(fragColor, vec4(0.0, 0.0, 0.0, 1.0), inside);
  }
  else
  {
    vec2 fragCoord = gl_FragCoord.xy;
    vec4 data = texture(uSourceTexture, fragmentUV);
    fragColor=vec4(data);
  }




}