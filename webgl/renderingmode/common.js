

function createStaticVertexBuffer(gl, data) {
	const buffer = gl.createBuffer();
	if (!buffer) {
		showError('Failed to allocate buffer');
		return null;
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	return buffer;
}

function createTwoBufferVao(gl, positionBuffer, uvBuffer, positionAttribLocation, uvAttribLocation) {
	const vao = gl.createVertexArray();
	if (!vao) {
		showError('Failed to allocate VAO for two buffers');
		return null;
	}

	gl.bindVertexArray(vao);

	gl.enableVertexAttribArray(positionAttribLocation);
	gl.enableVertexAttribArray(uvAttribLocation);

	gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
	gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
	gl.vertexAttribPointer(uvAttribLocation, 2, gl.FLOAT, true, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	gl.bindVertexArray(null);

	return vao;
}

function createProgram(gl, vertexShaderSource, fragmentShaderSource)
{
	const vertexShader = gl.createShader(gl.VERTEX_SHADER);
	const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	const program = gl.createProgram();

	if (!vertexShader || !fragmentShader || !program) {
		showError(`Failed to allocate GL objects (`
			+ `vs=${!!vertexShader}, `
			+ `fs=${!!fragmentShader}, `
			+ `program=${!!program})`);
		return null;
	}

	gl.shaderSource(vertexShader, vertexShaderSource);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		const errorMessage = gl.getShaderInfoLog(vertexShader);
		showError(`Failed to compile vertex shader: ${errorMessage}`);
		return null;
	}

	gl.shaderSource(fragmentShader, fragmentShaderSource);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		const errorMessage = gl.getShaderInfoLog(fragmentShader);
		showError(`Failed to compile fragment shader: ${errorMessage}`);
		return null;
	}

	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		const errorMessage = gl.getProgramInfoLog(program);
		showError(`Failed to link GPU program: ${errorMessage}`);
		return null;
	}

	return program;
}

// simple noise texture
function makeNoise(gl, size){
  const data = new Uint8Array(size*size*4);
  for(let i=0;i<data.length;i++) data[i]=Math.random()*255;
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D,t);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,size,size,0,gl.RGBA,gl.UNSIGNED_BYTE,data);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  return t;
}

// create pingpong FBOs
function createFBO(gl,width,height){
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
  const fb = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  return {tex, fb};
}

function getContext(canvas) {
	const gl = canvas.getContext('webgl2');
	if (!gl) {
		const isWebGl1Supported = !!(document.createElement('canvas')).getContext('webgl');
		if (isWebGl1Supported) {
			throw new Error('WebGL 1 is supported, but not v2 - try using a different device or browser');
		} else {
			throw new Error('WebGL is not supported on this device - try using a different device or browser');
		}
	}

	return gl;
}

async function loadShaderSource(url) {
	const response = await fetch(url);
	return await response.text();
}

let canvas = document.getElementById('demo-canvas');
if (!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error('Failed to get demo canvas reference');

let gl = getContext(canvas);