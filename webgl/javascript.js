
/** Display an error message to the DOM, beneath the demo element */
function showError(errorText) {
	console.error(errorText);
	const errorBoxDiv = document.getElementById('error-box');
	if (errorBoxDiv === null) {
		return;
	}
	const errorElement = document.createElement('p');
	errorElement.innerText = errorText;
	errorBoxDiv.appendChild(errorElement);
}


function showLog(logText)
{
	const errorBoxDiv = document.getElementById('log-box');
	if (errorBoxDiv === null) {
		return;
	}
	errorBoxDiv.innerHTML = logText;
}

const squarePositions = new Float32Array([ -1, 1, -1, -1, 1, -1,  -1, 1, 1, -1, 1, 1 ]);
var rectUVs = new Float32Array([ 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0 ]);

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

function getRandomInRange(min, max) {
	return Math.random() * (max - min) + min;
}


//
// DEMO
//

async function loadShaderSource(url) {
	const response = await fetch(url);
	return await response.text();
}


async function movementAndColorDemo() {
	canvas = document.getElementById('demo-canvas');
	if (!canvas || !(canvas instanceof HTMLCanvasElement)) throw new Error('Failed to get demo canvas reference');

	gl = getContext(canvas);

	// Get attribute locations
	
	const vertexShaderSourceCode = await loadShaderSource('vertexshader.glsl');
	const fragmentShaderSourceCode = await loadShaderSource('fragmentshader.glsl');
	const movementAndColorProgram = createProgram(gl, vertexShaderSourceCode, fragmentShaderSourceCode);
	if (!movementAndColorProgram) {
		showError('Failed to create Movement and Color WebGL program');
		return;
	}

	const vertexPositionAttributeLocation = gl.getAttribLocation(movementAndColorProgram, 'vertexPosition');
	const vertexUVAttributeLocation = gl.getAttribLocation(movementAndColorProgram, 'vertexUV');
	if (vertexPositionAttributeLocation < 0 || vertexUVAttributeLocation < 0) {
		showError(`Failed to get attribute locations: (pos=${vertexPositionAttributeLocation},`
			+ ` color=${vertexUVAttributeLocation})`);
		return;
	} 


		// Load texture
	const texture = loadTexture(gl, "cubetexture.png");
	createTextTexture(gl, "00");
	let targetTexture;
	// Flip image pixels into the bottom-to-top order that WebGL expects.
	//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

	// Get uniform locations
	const uniformPositionPlayerPos = gl.getUniformLocation(movementAndColorProgram, 'uPlayerPosition');
	const uniformPositionPlayerSize = gl.getUniformLocation(movementAndColorProgram, 'uPlayerSize');
	const uniformPositionTime = gl.getUniformLocation(movementAndColorProgram, 'uTime');
	const uniformPositionBallPosition = gl.getUniformLocation(movementAndColorProgram, 'uBallPosition');
	const uniformPositionBallSize = gl.getUniformLocation(movementAndColorProgram, 'uBallSize');
	const uniformPositionLastHitTime = gl.getUniformLocation(movementAndColorProgram, 'uLastHitTime');
	const uniformPositionBallHits = gl.getUniformLocation(movementAndColorProgram, 'uBallHits');
	const uniformPositionPlayerHits = gl.getUniformLocation(movementAndColorProgram, 'uPlayerHits');
	const uniformPositionSampler = gl.getUniformLocation(movementAndColorProgram, 'uSampler');
	const uniformSize = gl.getUniformLocation(movementAndColorProgram, 'uSize');
	const uniformPadding = gl.getUniformLocation(movementAndColorProgram, 'uPadding');
	const uniformTranslation = gl.getUniformLocation(movementAndColorProgram, 'uTranslation');
	const uniformRotation = gl.getUniformLocation(movementAndColorProgram, 'uRotation');
	const uniformRenderMode = gl.getUniformLocation(movementAndColorProgram, 'uRenderMode');
	const uniformResolution = gl.getUniformLocation(movementAndColorProgram, 'uResolution');
	const uniformToClipSize = gl.getUniformLocation(movementAndColorProgram, 'uToClipSpace');
	const uniformCameraPosition = gl.getUniformLocation(movementAndColorProgram, 'uCameraPosition');
	const uniformCameraSize = gl.getUniformLocation(movementAndColorProgram, 'uCameraSize');

	if (uniformPositionPlayerPos === null || uniformPositionPlayerSize === null || uniformPositionTime === null
		|| uniformPositionBallPosition === null || uniformPositionBallSize === null ||
		uniformPositionLastHitTime === null || uniformPositionBallHits === null || uniformPositionPlayerHits === null) {
		showError(`Failed to get uniform locations (uniformPositionPlayerPos=${!!uniformPositionPlayerPos}`
		 + `, uTime=${!!uniformPositionTime}`
		 + `, uniformPositionPlayerSize=${!!uniformPositionPlayerSize}`
		 + `, uBallPosition=${!!uniformPositionBallPosition}`
		 + `, uBallSize=${!!uniformPositionBallSize}`
		 + `, uLastHitTime=${!!uniformPositionLastHitTime}`
		 + `, uBallHits=${!!uniformPositionBallHits}`
		 + `, uPlayerHits=${!!uniformPositionPlayerHits}`
		 + `, uniformPositionSampler=${!!uniformPositionSampler})`);
		return;
	}

	// Create VAOs
	const squareGeoBuffer = createStaticVertexBuffer(gl, squarePositions);
	const squareUvBuffer = createStaticVertexBuffer(gl, rectUVs);

	if (!squareGeoBuffer || !squareUvBuffer) {
		showError(`Failed to create vertex buffers (`
			+ `, square geo=${!!squareGeoBuffer}`
			+ `, square uv=${!!squareUvBuffer}`);
		return null;
	}

	const backgroundVertexArray = createTwoBufferVao(gl, squareGeoBuffer, squareUvBuffer, vertexPositionAttributeLocation, vertexUVAttributeLocation);

	if (!backgroundVertexArray) {
		showError(`Failed to create VAOs: (`
			+ `backgroundVertexArray=${!!backgroundVertexArray})`);
		return;
	}

	const rectVertexArray = createTwoBufferVao(gl, squareGeoBuffer, squareUvBuffer, vertexPositionAttributeLocation, vertexUVAttributeLocation);

	if (!rectVertexArray) {
		showError(`Failed to create VAOs: (`
			+ `rectVertexArray=${!!rectVertexArray})`);
		return;
	}

	var uvTop, uvLeft, uvBottom, uvRight, uvWidth, uvHeight;
	let fb;



	function updatePlayArea()
	{
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		var currentAspectRatio = canvas.width / canvas.height; //2
		var playAreaAspectRatio = playAreaWidth / playAreaHeight; //0.5
		var ratioDifference = currentAspectRatio / playAreaAspectRatio;

		if (ratioDifference > 1.0) //too wide
		{
			uvLeft = 0 - ratioDifference * 0.5;
			uvTop = -1;
			uvRight = 0 + ratioDifference * 0.5;
			uvBottom = 1;
		}
		else if (ratioDifference > 1.0)
		{
			uvLeft = -0.5;
			uvTop = 0 - ratioDifference * 1;
			uvRight = 0.5;
			uvBottom = 0 + ratioDifference * 1;
		}
		else
		{
			//never used but this is the ideal UV setup these metrics are used for the game itself
			uvLeft = -0.5;
			uvTop = -1;
			uvRight = 0.5;
			uvBottom = 1;
		}

		uvWidth = uvRight - uvLeft;
		uvHeight = uvBottom - uvTop;

		//rectUVs = new Float32Array([ uvLeft, uvTop, uvLeft, uvBottom, uvRight, uvBottom, uvLeft, uvTop, uvRight, uvBottom, uvRight, uvTop ]);

		gl.bindBuffer(gl.ARRAY_BUFFER, squareUvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, rectUVs, gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		gl.bindVertexArray(backgroundVertexArray);
		gl.bindBuffer(gl.ARRAY_BUFFER, squareUvBuffer);
		gl.vertexAttribPointer(vertexUVAttributeLocation, 2, gl.FLOAT, true, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
		gl.bindVertexArray(null);

		targetTexture = createBufferTexture(gl, canvas.width, canvas.height);

		// Create and bind the framebuffer
		fb = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

		// attach the texture as the first color attachment
		const attachmentPoint = gl.COLOR_ATTACHMENT0;
		const level = 0;
		gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

		gl.viewport(0, 0, canvas.width, canvas.height);

		gl.uniform2f(uniformResolution, canvas.width, canvas.height);
		gl.uniform2f(uniformCameraSize, playAreaWidth, playAreaHeight);
		gl.uniform2f(uniformCameraPosition, 0.0, 0.0);
	}

	window.addEventListener('resize', updatePlayArea, true);

	const updateGame = function(time, dt)
	{
		if (player != null)
		{
			player.update(dt, movementVector);

			showLog("Ball Position= " + ball.position[0] + ", " + ball.position[1] +
		"<br \>Player Position= " + player.position[0] + ", " + player.position[1] +
		"<br \>Ball Size= " + ball.size[0] + ", " + player.size[1] +
		"<br \>movementVector= " + movementVector[0] + ", " + movementVector[1] +
		"<br \>Delta Time= " + dt +
		"<br \>time=" + time


		);
		}
		if (ball != null)
		{
			ball.update(dt);
		}
		updateGameState(time, dt);
		

		
	}

	const renderGame = function (time, deltaTime)
	{
		{
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			
			// Render the Frame
			gl.clearColor(0.00, 0.00, 0.00, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			

			// Set uniforms shared across frame...
			
			gl.uniform1f(uniformPositionTime, time / 1000.0);
			//gl.uniform2f(uniformPositionPlayerPos, player.position[0], player.position[1]);
			//gl.uniform2f(uniformPositionPlayerSize, player.size[0], player.size[1]);
			//gl.uniform2f(uniformPositionBallPosition, ball.position[0], ball.position[1]);
			//gl.uniform2f(uniformPositionBallSize, ball.size[0], ball.size[1]);
			gl.uniform1f(uniformPositionLastHitTime, hitTime);
			gl.uniform3fv(uniformPositionBallHits, ballHits);
			gl.uniform3fv(uniformPositionPlayerHits, playerHits);
			gl.uniform2f(uniformSize, 1.0, 1.0);
			gl.uniform2f(uniformPadding, 0.0, 0.0);
			gl.uniform2f(uniformTranslation, 0.0, 0.0);
			gl.uniform1f(uniformRotation, 0.0);
			gl.uniform1i(uniformRenderMode, 0);

			if (player != null && ball != null)
			{
				gl.uniform2f(uniformCameraPosition, (player.position[0] + ball.position[0]) / 2.0, (player.position[1] + ball.position[1]) / 2.0);
			}

			let screenAspect = canvas.width / canvas.height; //1.77
			let cameraAspect = playAreaWidth / playAreaHeight; //0.5

			if (screenAspect > cameraAspect) {
				// Screen is wider than camera: scale X
				gl.uniform2f(uniformToClipSize, (cameraAspect / screenAspect) * (2.0 / playAreaWidth), 2.0 / playAreaHeight);
			} else {
				// Screen is taller than camera: scale Y
				gl.uniform2f(uniformToClipSize, 2.0 / playAreaWidth, (screenAspect / cameraAspect) * (2.0 / playAreaHeight));
			}

			// Tell WebGL we want to affect texture unit 0
			gl.activeTexture(gl.TEXTURE0);

			// Bind the texture to texture unit 0
			gl.bindTexture(gl.TEXTURE_2D, textTexture);

			// Tell the shader we bound the texture to texture unit 0
			gl.uniform1i(uniformPositionSampler, 0);

			gl.bindVertexArray(backgroundVertexArray);
			gl.drawArrays(gl.TRIANGLES, 0, 6);
			
			//draw the ball
			if (ball != null)
			{
				gl.uniform2f(uniformSize, ball.size[0] * 3.0, ball.size[1] * 3.0);
				gl.uniform2f(uniformPadding, 0.2, 0.2);
				
				gl.uniform2f(uniformTranslation, ball.position[0], ball.position[1]);
				gl.uniform1i(uniformRenderMode, 1);
				gl.drawArrays(gl.TRIANGLES, 0, 6);
			}


			//draw the player
			if (player != null)
			{
				gl.uniform2f(uniformSize, player.size[0] * 3.0, player.size[1] * 3.0);
				gl.uniform2f(uniformPadding, 0.2, 0.2);
				gl.uniform2f(uniformTranslation, player.position[0], player.position[1]);
				//gl.uniform1i(uniformRenderMode, 1);
				gl.drawArrays(gl.TRIANGLES, 0, 6);
			}


			rects.forEach(rect => {
				gl.uniform2f(uniformSize, rect.size[0], rect.size[1]);
				gl.uniform2f(uniformPadding, 0.2, 0.2);
				gl.uniform2f(uniformTranslation, rect.position[0], rect.position[1]);
				gl.uniform1f(uniformRotation, rect.rotation * 0.0055555555555556 * Math.PI);
				gl.uniform1i(uniformRenderMode, 2);
				gl.drawArrays(gl.TRIANGLES, 0, 6);
			});
		}

	}

	gl.useProgram(movementAndColorProgram);
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.ONE, gl.ONE);

	updatePlayArea();

	let lastFrameTime = performance.now();
	const frame = function () {
		const thisFrameTime = performance.now();
		const dt = (thisFrameTime - lastFrameTime) / 1000;
		lastFrameTime = thisFrameTime;

		updateGame(thisFrameTime, dt);
		renderGame(thisFrameTime, dt);

		requestAnimationFrame(frame);
	};
	requestAnimationFrame(frame);
}

try {
	movementAndColorDemo();
} catch (e) {
	showError(`Uncaught JavaScript exception: ${e}`);
}