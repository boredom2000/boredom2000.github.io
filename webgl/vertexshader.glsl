#version 300 es

precision mediump float;
precision mediump int; 
uniform int uRenderMode;

uniform vec2 uResolution;
uniform vec2 uCameraPosition;
uniform vec2 uCameraSize;

uniform vec2 uScale; // Example: a model transformation matrix
uniform vec2 uTranslation; // Example: a model transformation matrix
in vec2 vertexPosition;
in vec2 vertexUV;
out vec2 fragmentUV;

void main() {
  fragmentUV = vertexUV;

  if (uRenderMode == 0)
  {
    gl_Position = vec4(vertexPosition.xy * uScale + uTranslation, 0.0, 1.0);
  }
  else
  {
    //absolution world position of the vertex
    vec2 worldPos = uTranslation + vertexPosition.xy * uScale * 0.5;

    //camera position relative world position of the vertex
    vec2 cameraRelative = worldPos - uCameraPosition;

    //scale position of the vertex to the size of the camera to get -1 to 1 % values
    vec2 clipSpace = cameraRelative / (uCameraSize * 0.5);

    //TODO: feed aspect ratio directly to save at least 1 division
    float screenAspect = uResolution.x / uResolution.y;
    float cameraAspect = uCameraSize.x / uCameraSize.y;

    if (screenAspect > cameraAspect) {
        // Screen is wider than camera: scale X
        clipSpace.x *= cameraAspect / screenAspect;
    } else {
        // Screen is taller than camera: scale Y
        clipSpace.y *= screenAspect / cameraAspect;
    }

    gl_Position = vec4(clipSpace, 0.0, 1.0);
  }
  


}