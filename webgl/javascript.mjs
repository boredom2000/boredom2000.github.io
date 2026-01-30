// import { renderer } from '/renderingmode/basic/renderer.mjs';
//import { renderer } from '/renderingmode/fluid/renderer.mjs';
import { renderer } from '/renderingmode/glowy/renderer.mjs';
import { game } from '/gamemode/ball.mjs';


let lastFrameTime = performance.now();
const frame = function ()
{
    const thisFrameTime = performance.now();
    const dt = (thisFrameTime - lastFrameTime) / 1000;
    lastFrameTime = thisFrameTime;

    game.updateGame(thisFrameTime, dt);
    renderer.renderGame(game, thisFrameTime, dt);

    requestAnimationFrame(frame);
};
requestAnimationFrame(frame);