export let renderer = {};




// Get attribute locations

const vertexShaderSourceCode = await loadShaderSource('/renderingmode/basic/vertexshader.glsl');
const fragmentShaderSourceCode = await loadShaderSource('/renderingmode/basic/fragmentshader.glsl');
const movementAndColorProgram = createProgram(gl, vertexShaderSourceCode, fragmentShaderSourceCode);
if (!movementAndColorProgram)
{
    showError('Failed to create Movement and Color WebGL program');
}

// Load texture
createTextTexture(gl, "00");
let targetTexture;
// Flip image pixels into the bottom-to-top order that WebGL expects.
//gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

// Get uniform locations
const uniformPositionTime = gl.getUniformLocation(movementAndColorProgram, 'uTime');
const uniformPositionSampler = gl.getUniformLocation(movementAndColorProgram, 'uSampler');
const uniformSize = gl.getUniformLocation(movementAndColorProgram, 'uSize');
const uniformPadding = gl.getUniformLocation(movementAndColorProgram, 'uPadding');
const uniformTranslation = gl.getUniformLocation(movementAndColorProgram, 'uTranslation');
const uniformRotation = gl.getUniformLocation(movementAndColorProgram, 'uRotation');
const uniformRenderMode = gl.getUniformLocation(movementAndColorProgram, 'uRenderMode');
const uniformToClipSize = gl.getUniformLocation(movementAndColorProgram, 'uToClipSpace');
const uniformCameraPosition = gl.getUniformLocation(movementAndColorProgram, 'uCameraPosition');
const uniformRatio = gl.getUniformLocation(movementAndColorProgram, 'uRatio');
const uniformColorMode = gl.getUniformLocation(movementAndColorProgram, 'uColorMode');

if (uniformPositionTime === null)
{
    showError(`Failed to get uniform locations`
        + `, uTime=${ !!uniformPositionTime }`
        + `, uniformPositionSampler=${ !!uniformPositionSampler })`);
}

// Create VAOs
const squarePositions = new Float32Array([ -1, 1, -1, -1, 1, -1,  -1, 1, 1, -1, 1, 1 ]);
var rectUVs = new Float32Array([ 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0 ]);
const squareGeoBuffer = createStaticVertexBuffer(gl, squarePositions);
const squareUvBuffer = createStaticVertexBuffer(gl, rectUVs);

if (!squareGeoBuffer || !squareUvBuffer)
{
    showError(`Failed to create vertex buffers (`
        + `, square geo=${ !!squareGeoBuffer }`
        + `, square uv=${ !!squareUvBuffer }`);
}

const vertexPositionAttributeLocation = gl.getAttribLocation(movementAndColorProgram, 'vertexPosition');
const vertexUVAttributeLocation = gl.getAttribLocation(movementAndColorProgram, 'vertexUV');
if (vertexPositionAttributeLocation < 0 || vertexUVAttributeLocation < 0)
{
    showError(`Failed to get attribute locations: (pos=${ vertexPositionAttributeLocation },`
        + ` color=${ vertexUVAttributeLocation })`);
}

const backgroundVertexArray = createTwoBufferVao(gl, squareGeoBuffer, squareUvBuffer, vertexPositionAttributeLocation, vertexUVAttributeLocation);
if (!backgroundVertexArray)
{
    showError(`Failed to create VAOs: (`
        + `backgroundVertexArray=${ !!backgroundVertexArray })`);
}

// END Create VAO

let fb;



function updatePlayArea()
{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    targetTexture = createBufferTexture(gl, canvas.width, canvas.height);

    // Create and bind the framebuffer
    fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // attach the texture as the first color attachment
    const attachmentPoint = gl.COLOR_ATTACHMENT0;
    const level = 0;
    gl.framebufferTexture2D(gl.FRAMEBUFFER, attachmentPoint, gl.TEXTURE_2D, targetTexture, level);

    gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', updatePlayArea, true);

renderer.renderGame = function (game, time, deltaTime)
{
    let player = game.player;
    let ball = game.ball;
    let rects = game.rects;
    let explosions = game.explosions;
    let playAreaWidth = game.playAreaWidth;
    let playAreaHeight = game.playAreaHeight;

    {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        // Render the Frame
        gl.clearColor(0.00, 0.00, 0.00, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);



        // Set uniforms shared across frame...

        gl.uniform1f(uniformPositionTime, time / 1000.0);
        gl.uniform2f(uniformSize, 20.0, 20.0);
        gl.uniform2f(uniformPadding, 0.0, 0.0);
        gl.uniform2f(uniformTranslation, 0.0, 0.0);
        gl.uniform1f(uniformRotation, 0.0);
        gl.uniform1i(uniformRenderMode, 0);
        gl.uniform1i(uniformColorMode, 0);

        if (player != null && ball != null)
        {
            gl.uniform2f(uniformCameraPosition, (player.position[0] + ball.position[0]) / 2.0, (player.position[1] + ball.position[1]) / 2.0);
        }

        let screenAspect = canvas.width / canvas.height; //1.77
        let cameraAspect = playAreaWidth / playAreaHeight; //0.5

        if (screenAspect > cameraAspect)
        {
            // Screen is wider than camera: scale X
            gl.uniform2f(uniformToClipSize, (cameraAspect / screenAspect) * (2.0 / playAreaWidth), 2.0 / playAreaHeight);
        } else
        {
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

        let adjustedTime = time / 1000.0;

        //draw the ball
        if (ball != null)
        {
            let hitRatio
            if (adjustedTime < ball.hitTime + 1.0)
            {
                hitRatio = (adjustedTime - ball.hitTime) / 1.0;
            }
            gl.uniform1f(uniformRatio, clamp(hitRatio, 0.0, 1.0));

            gl.uniform2f(uniformSize, ball.size[0] * 3.0, ball.size[1] * 3.0);
            gl.uniform2f(uniformPadding, 0.2, 0.2);

            gl.uniform2f(uniformTranslation, ball.position[0], ball.position[1]);
            gl.uniform1i(uniformRenderMode, 1);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }


        //draw the player
        if (player != null)
        {
            let hitRatio;
            if (adjustedTime < player.hitTime + 1.0)
            {
                hitRatio = (adjustedTime - player.hitTime) / 1.0;
            }
            gl.uniform1f(uniformRatio, clamp(hitRatio, 0.0, 1.0));

            gl.uniform2f(uniformSize, player.size[0] * 3.0, player.size[1] * 3.0);
            gl.uniform2f(uniformPadding, 0.2, 0.2);
            gl.uniform2f(uniformTranslation, player.position[0], player.position[1]);
            gl.uniform1i(uniformRenderMode, 1);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }


        rects.forEach(rect =>
        {
            let hitRatio;
            if (adjustedTime < rect.hitTime + 1.0)
            {
                hitRatio = (adjustedTime - rect.hitTime) / 1.0;
            }
            gl.uniform1f(uniformRatio, clamp(hitRatio, 0.0, 1.0));

            if (rect.type == CollisionType.Death)
            {
                gl.uniform1i(uniformColorMode, 1);
            }
            else
            {
                gl.uniform1i(uniformColorMode, 0);
            }

            gl.uniform2f(uniformSize, rect.size[0], rect.size[1]);
            gl.uniform2f(uniformPadding, 0.2, 0.2);
            gl.uniform2f(uniformTranslation, rect.position[0], rect.position[1]);
            gl.uniform1f(uniformRotation, rect.rotation * 0.0055555555555556 * Math.PI);
            gl.uniform1i(uniformRenderMode, 2);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });

        let timeMS = time / 1000.0;
        for (let i = explosions.length - 1; i >= 0; i--) 
        {
            let explosion = explosions[i];
            if (timeMS > explosion.timeEnd)
            {
                explosions.splice(i, 1);
                continue;
            }

            let ratio = (timeMS - explosion.timeStart) / (explosion.timeEnd - explosion.timeStart);
            let size = explosion.sizeStart + (explosion.sizeEnd - explosion.sizeStart) * ratio;

            gl.uniform1f(uniformRatio, ratio);
            gl.uniform2f(uniformSize, size, size);
            gl.uniform2f(uniformPadding, 0.2, 0.2);
            gl.uniform2f(uniformTranslation, explosion.position[0], explosion.position[1]);
            gl.uniform1i(uniformRenderMode, 3);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
    }

}

gl.useProgram(movementAndColorProgram);
gl.enable(gl.BLEND);
gl.blendFunc(gl.ONE, gl.ONE);

updatePlayArea();

