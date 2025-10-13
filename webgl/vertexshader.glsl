#version 300 es
precision mediump float;

uniform vec2 uScale; // Example: a model transformation matrix
uniform vec2 uTranslation; // Example: a model transformation matrix
in vec2 vertexPosition;
in vec2 vertexUV;
out vec2 fragmentUV;

void main() {
  fragmentUV = vertexUV;
  gl_Position = vec4(vertexPosition.xy * uScale + uTranslation, 0.0, 1.0);
}