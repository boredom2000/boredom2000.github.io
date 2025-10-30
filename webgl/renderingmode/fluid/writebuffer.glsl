#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

#define TEX(uv) texture(iChannel0, uv).r
#define TEX1(uv) texture(iChannel1, uv).r
#define trace(edge, thin) smoothstep(thin, .0, edge)
#define ss(a,b,t) smoothstep(a,b,t)

const float speed = .001;
const float scale = .01;
const float falloff = 3.;
const float fade = .8;
const float strength = 1.;
const float range = 5.;

vec3 fbm(vec3 p){
  vec3 result = vec3(0.0);
  float amplitude = 0.5;
  for(float i=0.0;i<3.0;i++){
    result += texture(iChannel0, p.xy/amplitude).xyz * amplitude;
    amplitude /= falloff;
  }
  return result;
}

void main(){
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = (fragCoord - iResolution.xy/2.0)/iResolution.y;
  vec2 aspect = vec2(iResolution.x/iResolution.y,1.0);
  vec3 spice = fbm(vec3(uv*scale,iTime*speed));
  float t = iTime*2.0;
  //uv -= vec2(cos(t),sin(t))*0.3;
  float paint = trace(length(uv),0.04);
  vec2 offset = vec2(0.0);
  uv = fragCoord/iResolution.xy;
  vec4 data = texture(iChannel1, uv);
  vec3 unit = vec3(range/472.0/aspect,0.0);
  vec3 normal = normalize(vec3(
      TEX1(uv - unit.xz)-TEX1(uv + unit.xz),
      TEX1(uv - unit.zy)-TEX1(uv + unit.zy),
      data.x*data.x)+0.001);
  offset -= normal.xy;
  spice.x *= 6.28*2.0;
  spice.x += iTime;
  offset += vec2(cos(spice.x),sin(spice.x));
  uv += strength * offset / aspect / 472.0;
  vec4 frame = texture(iChannel1, uv);
  paint = max(paint, frame.x - iTimeDelta * fade);
  fragColor = vec4(clamp(paint,0.0,1.0));

  float dist = length(fragCoord - vec2(0.5,0.5)) * 0.0005;
  fragColor = vec4(dist, dist,dist,dist);
}