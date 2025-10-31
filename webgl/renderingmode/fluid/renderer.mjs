export let renderer = {};
const vertexShaderSourceCode = await loadShaderSource('/renderingmode/fluid/vertexshader.glsl');
const vertexBufferShaderSourceCode = await loadShaderSource('/renderingmode/fluid/vertexshaderbuffer.glsl');
const fragmentShaderFinalSourceCode = await loadShaderSource('/renderingmode/fluid/finalimage.glsl');
const fragmentShaderBufferSourceCode = await loadShaderSource('/renderingmode/fluid/writebuffer.glsl');



const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
  -1,-1, 1,-1, -1,1, 1,1
]), gl.STATIC_DRAW);


const progA = createProgram(gl, vertexBufferShaderSourceCode, fragmentShaderBufferSourceCode);
const progFinal = createProgram(gl, vertexBufferShaderSourceCode, fragmentShaderFinalSourceCode);

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let fbo1 = createFBO(gl, canvas.width, canvas.height);
let fbo2 = createFBO(gl, canvas.width, canvas.height);
const noiseTex = makeNoise(gl, 256);

const squarePositions = new Float32Array([ -1, 1, -1, -1, 1, -1,  -1, 1, 1, -1, 1, 1 ]);
var rectUVs = new Float32Array([ 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0 ]);

const squareGeoBuffer = createStaticVertexBuffer(gl, squarePositions);
const squareUvBuffer = createStaticVertexBuffer(gl, rectUVs);
const vertexPositionAttributeLocation = gl.getAttribLocation(progA, 'vertexPosition');
console.log('vertexPositionAttributeLocation=' + vertexPositionAttributeLocation);

const vertexUVAttributeLocation = gl.getAttribLocation(progA, 'vertexUV');
console.log('vertexUVAttributeLocation=' + vertexUVAttributeLocation);


const backgroundVertexArray = createTwoBufferVao(gl, squareGeoBuffer, squareUvBuffer, vertexPositionAttributeLocation, vertexUVAttributeLocation);

function updatePlayArea()
{

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

    const now = performance.now();
    const dt = deltaTime;
    gl.useProgram(progA);
    gl.bindFramebuffer(gl.FRAMEBUFFER,fbo2.fb);
    //gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.uniform3f(gl.getUniformLocation(progA,"iResolution"),canvas.width,canvas.height,1);
    gl.uniform1f(gl.getUniformLocation(progA,"iTime"),time*0.001);
    gl.uniform1f(gl.getUniformLocation(progA,"iTimeDelta"),dt);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, noiseTex);
    gl.uniform1i(gl.getUniformLocation(progA,"iChannel0"),0);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, fbo1.tex);
    gl.uniform1i(gl.getUniformLocation(progA,"iChannel1"),1);
    //gl.drawArrays(gl.TRIANGLE_STRIP,0,4);

    const uniformToClipSize = gl.getUniformLocation(progA, 'uToClipSpace');
    const uniformCameraPosition = gl.getUniformLocation(progA, 'uCameraPosition');
    const uniformSize = gl.getUniformLocation(progA, 'uSize');
    const uniformPadding = gl.getUniformLocation(progA, 'uPadding');
    const uniformTranslation = gl.getUniformLocation(progA, 'uTranslation');
    const uniformRotation = gl.getUniformLocation(progA, 'uRotation');
    const uniformRenderMode = gl.getUniformLocation(progA, 'uRenderMode');
    gl.uniform1f(uniformRotation, 0.);
    
    gl.bindVertexArray(backgroundVertexArray);

    {

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

        {
            gl.uniform1i(uniformRenderMode, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }


        gl.uniform1i(uniformRenderMode, 1);
        //draw the ball
        if (ball != null)
        {
            // pass A
            gl.uniform2f(uniformSize, ball.size[0] * 3.0, ball.size[1] * 3.0);
            gl.uniform2f(uniformPadding, 0.2, 0.2);

            gl.uniform2f(uniformTranslation, ball.position[0], ball.position[1]);
            gl.drawArrays(gl.TRIANGLES, 0, 6);



        }


        //draw the player
        if (player != null)
        {
            // pass A
            gl.uniform2f(uniformSize, player.size[0] * 3.0, player.size[1] * 3.0);
            gl.uniform2f(uniformPadding, 0.2, 0.2);
            gl.uniform2f(uniformTranslation, player.position[0], player.position[1]);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        }


        rects.forEach(rect =>
        {
            // pass A
            gl.uniform2f(uniformSize, rect.size[0], rect.size[1]);
            gl.uniform2f(uniformPadding, 0.2, 0.2);
            gl.uniform2f(uniformTranslation, rect.position[0], rect.position[1]);
            gl.uniform1f(uniformRotation, rect.rotation * 0.0055555555555556 * Math.PI);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
        });

          // final image
          if (true)
          {
            gl.uniform1i(uniformRenderMode, 2);

            gl.bindFramebuffer(gl.FRAMEBUFFER,null);
            gl.viewport(0,0,canvas.width,canvas.height);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D,fbo2.tex);
            gl.uniform1i(gl.getUniformLocation(progA,"iChannel0"),0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D,noiseTex);
            gl.uniform1i(gl.getUniformLocation(progA,"iChannel1"),1);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            [fbo1,fbo2]=[fbo2,fbo1];
          }


    }

}

updatePlayArea();

