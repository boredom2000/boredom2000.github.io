#version 300 es
precision highp float;
out vec4 fragColor;
uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;

#define TEX(uv) texture(iChannel0, uv).r
#define ss(a,b,t) smoothstep(a,b,t)

void main(){
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 uv = fragCoord/iResolution.xy;
  vec3 dither = texture(iChannel1, fragCoord/1024.0).rgb;
  vec4 data = texture(iChannel0, uv);

  float gray = data.x;
  float range = 3.0;
  vec2 aspect = vec2(iResolution.x/iResolution.y,1.0);
  vec3 unit = vec3(range/472.0/aspect,0.0);
  vec3 normal = normalize(vec3(
      TEX(uv+unit.xz)-TEX(uv-unit.xz),
      TEX(uv-unit.zy)-TEX(uv+unit.zy),
      gray*gray*gray));
  vec3 color = vec3(0.3)*(1.0-abs(dot(normal,vec3(0,0,1))));
  vec3 dir = normalize(vec3(0,1,2));
  float specular = pow(dot(normal,dir)*0.5+0.5,20.0);
  color += vec3(0.5)*ss(0.2,1.0,specular);
  vec3 tint = 0.5+0.5*cos(vec3(1,2,3)*1.0+dot(normal,dir)*4.0-uv.y*3.0-3.0);
  color += tint*smoothstep(0.15,0.0,gray);
  color -= dither.x*0.1;
  vec3 background = vec3(1.0);
  background *= smoothstep(1.5,-0.5,length(uv-0.5));
  color = mix(background,(clamp(color,0.0,1.0)),ss(0.01,0.1,gray));
  color += vec3(0.5)*ss(0.2,1.0,specular);
  fragColor=vec4(color,1.0);
}