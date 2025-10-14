class GameBall
{
    constructor(position, velocity, force, size)
    {
        this.position = position;
        this.velocity = velocity;
        this.force = force;
        this.size = size;
    }

    isAlive() {
        return this.timeRemaining > 0;
    }

    update(dt)
    {
        this.velocity[0] += this.force[0] * dt;
        this.velocity[1] += this.force[1] * dt;

        this.position[0] += this.velocity[0] * dt;
        this.position[1] += this.velocity[1] * dt;
    }
}

class GamePlayer
{
    constructor(position, size, velocity)
    {
        this.position = position;
        this.size = size;
        this.velocity = velocity;
    }

    update(dt, mousePos)
    {
        let directionX = mousePos[0] - this.position[0];
        let directionY = mousePos[1] - this.position[1];

        this.position[0] += directionX * dt * 4.0;
        this.position[1] += directionY * dt * 4.0;
    }
}

class RectCollision
{
    constructor(position, size, rotation)
    {
        this.position = position;
        this.rotation = rotation;
        this.size = size;
    }   
}

var currentNumberOfHits = 0;
var hitTime = 0.0;
var timeBeforeNextCheck = 0.0;
var timeBeforeNextRound = 0.0;
var waitingForNextRound = false;
var nextHitIndex = 0;
var DELAY_BETWEEN_HITS = 1000.0;
var DELAY_BETWEEN_ROUNDS = 2000.0;
var HIT_INDEX_MAX = 8;
var player = new GamePlayer([0.0, 0.5], [0.05, 0.05], [0,0]);
var ball = new GameBall([0.0, 0.0], [0.05, -1.5], [0.0, 1.0], [0.1, 0.1]);
var ballHits = new Float32Array([-99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0]);

var playerHits = new Float32Array([-99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0]);               

var rects = [];
rects.push(new RectCollision([-1.0, 0.0], [0.1, 2.0], -45.0));
rects.push(new RectCollision([1.0, 0.0], [0.1, 2.0], 45.0));

function updateGameState(time)
{
    if (time < timeBeforeNextCheck)
    {
        return;
    }

    if (time < timeBeforeNextRound)
    {
        return;
    }

    if (waitingForNextRound)
    {
        ball = null;
        ball = new GameBall([0.0, 0.0], [0.05, -1.5], [0.0, 1.0], [0.1, 0.1]);
        waitingForNextRound = false;
        currentNumberOfHits = 0;
        createTextTexture(gl, getTailingZeroNumber(currentNumberOfHits));
    }

    if (ball.position[1] > 1.0)
    {
        timeBeforeNextRound = time + DELAY_BETWEEN_ROUNDS;
        waitingForNextRound = true;
        return;
    }

    var xSquareDistance = Math.pow(player.position[0] - ball.position[0], 2);
    var ySquareDistance = Math.pow(player.position[1] - ball.position[1], 2);
    var squareDistance = Math.pow(ball.size[0] + player.size[0], 2);
    if (squareDistance > (xSquareDistance + ySquareDistance))
    {
        var diffX = ball.position[0] - player.position[0];
        var diffY = ball.position[1] - player.position[1];
        var normalizedX = diffX / (Math.abs(diffX) + Math.abs(diffY));
        var normalizedY = diffY / (Math.abs(diffX) + Math.abs(diffY));

        ball.velocity = [normalizedX * 1.5, normalizedY * 1.5];

        timeBeforeNextCheck = time + DELAY_BETWEEN_HITS;

        ballHits[nextHitIndex] = time / 1000.0;
        ballHits[nextHitIndex+1] = ball.position[0];
        ballHits[nextHitIndex+2] = ball.position[1];
        playerHits[nextHitIndex] = time / 1000.0;
        playerHits[nextHitIndex+1] = player.position[0];
        playerHits[nextHitIndex+2] = player.position[1];
        nextHitIndex = (nextHitIndex + 3) % 24;

        hitTime = time / 1000.0;

        

        currentNumberOfHits++;
        createTextTexture(gl, getTailingZeroNumber(currentNumberOfHits));

    }

    handleCollision(ball, rects, time);
}

function getTailingZeroNumber(num)
{
    if (num >= 10)
    {
        return '' + num;
    }
    else
    {
        return '0' + num;
    }
}

function handleCollision(ball, rects, time) {
  for (const r of rects) {
    const cos = Math.cos(-r.rotation);
    const sin = Math.sin(-r.rotation);

    // --- 1. translate ball into rect local space ---
    const relX = ball.position[0]  - r.position[0] ;
    const relY = ball.position[1]  - r.position[1] ;
    const localX = relX * cos - relY * sin;
    const localY = relX * sin + relY * cos;

    const hw = r.size[0] / 2;
    const hh = r.size[1] / 2;

    // --- 2. clamp to find closest point on rectangle ---
    const clampedX = Math.max(-hw, Math.min(localX, hw));
    const clampedY = Math.max(-hh, Math.min(localY, hh));

    // --- 3. distance between ball center and closest point ---
    const dx = localX - clampedX;
    const dy = localY - clampedY;
    const distSq = dx * dx + dy * dy;

    console.log('distSq=' + distSq);
    console.log('ball.radius squared=' + (ball.size[0] * ball.size[0]));

    if (distSq < ball.size[0] * ball.size[1]) {
        console.log('hit;');
      const dist = Math.sqrt(distSq) || 0.0001;

      // --- 4. local normal (in rect space) ---
      const localNormal = { x: dx / dist, y: dy / dist };

      // --- 5. transform normal back to world space ---
      const worldNormal = {
        x: localNormal.x * cos + localNormal.y * -sin,
        y: localNormal.x * sin + localNormal.y * cos
      };

      // --- 6. move ball out of rectangle ---
      const penetration = ball.size[0] - dist;
      ball.position[0]  += worldNormal.x * penetration;
      ball.position[1]  += worldNormal.y * penetration;

      // --- 7. reflect velocity along normal (bounce) ---
      //const dot = ball.vel.x * worldNormal.x + ball.vel.y * worldNormal.y;
      //ball.vel.x -= 2 * dot * worldNormal.x;
      //ball.vel.y -= 2 * dot * worldNormal.y;

      ball.velocity = [worldNormal.x, -worldNormal.y];

      //ball.vel.scale(0.6); // damping (bounce loss)

        ballHits[nextHitIndex] = time / 1000.0;
        ballHits[nextHitIndex+1] = ball.position[0];
        ballHits[nextHitIndex+2] = ball.position[1];
        playerHits[nextHitIndex] = time / 1000.0;
        playerHits[nextHitIndex+1] = ball.position[0];
        playerHits[nextHitIndex+2] = ball.position[1];
        nextHitIndex = (nextHitIndex + 3) % 24;

      // optional: return the normal
      return worldNormal;
    }
  }
  return null;
}