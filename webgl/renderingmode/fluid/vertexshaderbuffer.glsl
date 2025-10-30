#version 300 es

precision mediump float;
precision mediump int; 

uniform vec2 uCameraPosition;

uniform vec2 uToClipSpace;

uniform vec2 uSize; // Example: a model transformation matrix
uniform vec2 uPadding;
uniform vec2 uTranslation; // Example: a model transformation matrix
uniform float uRotation; // Example: a model transformation matrix
in vec2 vertexPosition;
in vec2 vertexUV;
out vec2 vUV;

void main() {
  {
    vUV = vertexUV;

    //absolution world position of the vertex
    vec2 scaledPos = vertexPosition.xy * (uSize + uPadding) * 0.5;
    //scaledPos += vec2(1.0, 1.0);

    // --- Rotate using 2D rotation matrix ---
    float cosR = cos(uRotation);
    float sinR = sin(uRotation);
    mat2 rotation = mat2(cosR, -sinR,
                         sinR,  cosR);
    vec2 rotatedPos = rotation * scaledPos;

    vec2 worldPos = rotatedPos + uTranslation;

    //camera position relative world position of the vertex
    vec2 cameraRelative = worldPos - uCameraPosition;

    //scale position of the vertex to the size of the camera to get -1 to 1 % values
    vec2 clipSpace = cameraRelative * uToClipSpace;

    gl_Position = vec4(clipSpace, 0.0, 1.0);
  }
  


}