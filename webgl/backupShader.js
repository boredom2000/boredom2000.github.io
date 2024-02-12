const backupFragmentShaderSourceCode = `#version 300 es
precision mediump float;

uniform vec2 uCanvasSize;
uniform vec2 uMousePos;
uniform float uTime;

in vec2 fragmentUV;
out vec4 outputColor;

vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    vec2 uv = (fragmentUV * 2.0 - vec2(1.0, 1.0));
    vec2 uv0 = uv;
    vec3 finalColor = vec3(0.0);
    
    for (float i = 0.0; i < 4.0; i++) {
        uv = fract(uv * 1.5) - 0.5;

        float d = length(uv) * exp(-length(uv0));

        vec3 col = palette(length(uv0) + i*.4 + uTime*.4); //color

        d = sin(d*8. + uTime)/8.; //alternating from -1 to 1
        d = abs(d); //alternating from 0 to 1

        d = pow(0.01 / d, 1.2); //smoothstepping glowy

        finalColor += col * d;
    }
        
    outputColor = vec4(finalColor, uMousePos * uCanvasSize.x * uTime * 0.0 + 1.0);
}`;
