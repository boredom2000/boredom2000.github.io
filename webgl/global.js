// let textTexture;
// let canvas;
// let gl;
// The resulting vector (x, y)
let movementVector = { x: 0, y: 0 };

let playAreaWidth = 1.0;
let playAreaHeight = 2.0;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}