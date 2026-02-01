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

vec3 fbm(vec3 p){
  vec3 result = vec3(0.0);
  float amplitude = 0.1;
  for(float i=0.0;i<3.0;i++){
    result += texture(uNoiseTexture, p.xy/amplitude).xyz * amplitude;
    amplitude /= falloff;
  }
  return result;
}

void main()
{
  vec2 fragCoord = gl_FragCoord.xy;

  //writing the previous full screen buffer into the current full screen buffer
  if (uRenderMode == 0)
  {
    vec2 uv = fragCoord/iResolution.xy;
    vec4 frame = texture(uSourceTexture, uv*0.999 + vec2(0.001, 0.001));
    float paint = max(0.0, frame.x - iTimeDelta * 0.999);
    fragColor = frame * vec4(0.999999, 0.999999, 0.999999, 1.0);
  }
  else if (uRenderMode == 1)
  {
    vec2 aspect = uSize + uPadding;
    vec2 center = vec2(0.5);
    vec2 pos = (fragmentUV - center) * aspect;
    float dist = length(pos);
    float radius = uSize.x * 0.5;
    float outlineWidth = 0.12;
    float edge = length(vec2(dFdx(dist), dFdy(dist)));
    vec3 color = cos(length(uTranslation)*0.5 + iTime * 0.5 + vec3(0.0, 1.0, 2.0)) + 1.0;
    float outlineFactor = smoothstep(radius - edge, radius, dist) - smoothstep(radius + outlineWidth - edge, radius + outlineWidth, dist);
    vec3 outline = outlineFactor * color;
    fragColor = vec4(outline, outlineFactor);
  }
  else if (uRenderMode == 2)
  {
    float horizontalEdgeSize = abs(dFdx(fragmentUV.x));
    float verticalEdgeSize = abs(dFdy(fragmentUV.y));

    vec2 trueShape = uSize / (uSize + uPadding);
    vec2 radius = trueShape * 0.5;
    vec2 outlineSize = vec2(0.12, 0.12) / uSize;

    vec2 dist = abs(fragmentUV - vec2(0.5, 0.5));

    vec2 inside = vec2(1., 1.) - smoothstep(radius , radius + outlineSize + vec2(horizontalEdgeSize, verticalEdgeSize), dist);

    vec3 color = cos(length(uTranslation)*0.5 + iTime * 0.5 + vec3(0.0, 1.0, 2.0)) + 1.0;
    float outlineX = smoothstep(radius.x - horizontalEdgeSize, radius.x, dist.x) - smoothstep(radius.x + outlineSize.x - horizontalEdgeSize, radius.x + outlineSize.x, dist.x);
    float outlineY = smoothstep(radius.y - verticalEdgeSize, radius.y, dist.y) - smoothstep(radius.y + outlineSize.y - verticalEdgeSize, radius.y + outlineSize.y, dist.y);
    vec3 outline = inside.x * inside.y * max(outlineX, outlineY) * color;
    fragColor=vec4(outline,inside.x * inside.y);
    //fragColor=vec4(1.,0.,0.,1.);
  }
  else
  {
    vec2 fragCoord = gl_FragCoord.xy;
    vec4 data = texture(uSourceTexture, fragmentUV);
    fragColor=vec4(data);
  }




}