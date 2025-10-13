#version 300 es
precision mediump float;

in vec2 vertexPosition;
in vec2 vertexUV;
out vec2 fragmentUV;

void main() {
  fragmentUV = vertexUV;
  gl_Position = vec4(vertexPosition.xy, 0.0, 1.0);
}