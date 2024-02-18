var textCanvas = document.createElement("canvas");
var textCtx = textCanvas.getContext("2d");


var outlineSteps = 25;
var outlineSize = 100;


// Puts text in center of canvas.
function makeTextCanvas(text, width, height) {
  textCtx.canvas.width  = width;
  textCtx.canvas.height = height;
  textCtx.font = "lighter 160px monospace";
  textCtx.textAlign = "center";
  textCtx.textBaseline = "middle";
  textCtx.fillStyle = "white";
  textCtx.clearRect(0, 0, textCtx.canvas.width, textCtx.canvas.height);

  textCtx.rect(0, 0, textCtx.canvas.width, textCtx.canvas.height);
  textCtx.fillStyle = 'black';
  textCtx.fill();
  

  for (let i = outlineSteps; i >= 0; i--) {
    const val = 255 - Math.max(i / outlineSteps * 255.0);
    textCtx.strokeStyle = `rgb(${val},${val},${val})`;
    textCtx.lineWidth = (i / outlineSteps) * outlineSize;
    textCtx.strokeText(text, width / 2, height / 2);
  }

  textCtx.fillStyle = 'white';
  textCtx.fillText(text, width / 2, height / 2);
  

  return textCtx.canvas;
}

function createTextTexture(gl, text)
{
    // create text texture.
    var textCanvas = makeTextCanvas(text, 400, 400);
    var textWidth  = textCanvas.width;
    var textHeight = textCanvas.height;
    textTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, textTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textCanvas);
    // make sure we can render it even if it's not a power of 2
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}
function createBufferTexture(gl, width, height)
{
    // create to render to
    const targetTextureWidth = width;
    const targetTextureHeight = height;
    const targetTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, targetTexture);
    
    {
    // define size and format of level 0
    const level = 0;
    const internalFormat = gl.RGBA;
    const border = 0;
    const format = gl.RGBA;
    const type = gl.UNSIGNED_BYTE;
    const data = null;
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                    targetTextureWidth, targetTextureHeight, border,
                    format, type, data);
    
    // set the filtering so we don't need mips,
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    return targetTexture;
}



//
// Initialize a texture and load an image.
// When the image finished loading copy it into the texture.

function loadTexture(gl, url) {
    texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
  
    // Because images have to be downloaded over the internet
    // they might take a moment until they are ready.
    // Until then put a single pixel in the texture so we can
    // use it immediately. When the image has finished downloading
    // we'll update the texture with the contents of the image.
    console.log('1111111111');
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
    gl.texImage2D(
      gl.TEXTURE_2D,
      level,
      internalFormat,
      width,
      height,
      border,
      srcFormat,
      srcType,
      pixel,
    );

    let loadedImageCallback = function ()
    {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            img,
        );
  
        // WebGL1 has different requirements for power of 2 images
        // vs. non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
    };

    var img = new Image();
    img.crossOrigin = "";
    img.src = 'https://boredom2000.github.io/webgl/cubetexture.png';
    img.onload = function()
    {
        loadedImageCallback();
    }

    return texture;
}
  
function isPowerOf2(value) {
return (value & (value - 1)) === 0;
}


