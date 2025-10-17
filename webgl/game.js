const CollisionTarget = Object.freeze({
  All: 0,
  Ball: 1,
  Player: 2
})

const CollisionType = Object.freeze({
  Bounce: 0,
  Death: 1,
  Gravity: 2,
  Trigger: 3
})


class GameBall
{
    constructor(position, velocity, force, size)
    {
        this.position = position;
        this.velocity = velocity;
        this.force = force;
        this.size = size;
        this.type = CollisionTarget.Ball;
    }

    isAlive() {
        return this.timeRemaining > 0;
    }

    update(dt)
    {
        this.velocity[0] += this.force[0] * dt;
        this.velocity[1] += this.force[1] * dt;
    }
}

class GamePlayer
{
    constructor(position, size, velocity)
    {
        this.position = position;
        this.size = size;
        this.velocity = velocity;
        this.type = CollisionTarget.Player;
    }

    update(dt, movementVector)
    {
        //this.force = movementVector * 3.0;
        this.velocity[0] += movementVector.x * dt * 3.0;
        this.velocity[1] += movementVector.y * dt * 3.0;

        this.velocity[0] -= (this.velocity[0] * 1.5) * dt;
        this.velocity[1] -= (this.velocity[1] * 1.5) * dt;
    }
}

class RectCollision
{
    constructor(position, size, rotation, type)
    {
        this.position = position;
        this.rotation = rotation;
        this.size = size;
        this.type = type;
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
var MINIMUM_CAMERA_HEIGHT = 2.0;
var MINIMUM_CAMERA_WIDTH = 1.0;
var HIT_INDEX_MAX = 8;
//var ball = new GameBall([0.0, 0.0], [0.0, 0.0], [0.0, 0.0], [0.1, 0.1]);
var ball = new GameBall([0.0, 0.0], [0.05, 1.5], [0.0, -1.0], [0.1, 0.1]);
player = new GamePlayer([0.0, -0.5], [0.05, 0.05], [0,0]);
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
rects.push(new RectCollision([-1.5, 0.5], [1.0, 1.0], 25, CollisionTarget.All, CollisionType.Bounce));
rects.push(new RectCollision([1.5, 0.5], [1.0, 1.0], -25, CollisionTarget.Ball, CollisionType.Bounce));
//rects.push(new RectCollision([1.5, -0.5], [1.0, 1.0], -10.0, CollisionTarget.All, CollisionType.Bounce));
rects.push(new RectCollision([0, 3.0], [6.0, 0.3], 0.0, CollisionTarget.All, CollisionType.Bounce));
rects.push(new RectCollision([3.0, 0.0], [0.3, 6.0], 0.0, CollisionTarget.All, CollisionType.Bounce));
rects.push(new RectCollision([-3.0, 0.0], [0.3, 6.0], 0.0, CollisionTarget.All, CollisionType.Bounce));

function updateGameState(time, dt)
{
    if (waitingForNextRound)
    {
        if (time < timeBeforeNextRound)
        {
            return;
        }

        
        //ball = new GameBall([0.0, 0.0], [0.05, 1.5], [0.0, 0.0], [0.0, 0.0]);
        ball = new GameBall([0.0, 0.0], [0.05, 1.5], [0.0, -1.0], [0.1, 0.1]);
        player = new GamePlayer([0.0, -0.5], [0.05, 0.05], [0,0]);
        waitingForNextRound = false;
        currentNumberOfHits = 0;
        createTextTexture(gl, getTailingZeroNumber(currentNumberOfHits));
    }
    else if (ball.position[1] < -1.0)
    {
        ball = null;
        player = null;
        timeBeforeNextRound = time + DELAY_BETWEEN_ROUNDS;
        waitingForNextRound = true;
        return;
    }

    if (time >= timeBeforeNextCheck)
    {
        var xSquareDistance = Math.pow(player.position[0] - ball.position[0], 2);
        var ySquareDistance = Math.pow(player.position[1] - ball.position[1], 2);
        var squareDistance = Math.pow(ball.size[0] * 2.0 + player.size[0] * 2.0, 2);
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
    }

    handleCollision(ball, rects, time, dt);
    handleCollision(player, rects, time, dt);

    playAreaHeight = Math.max(MINIMUM_CAMERA_HEIGHT, Math.abs(ball.position[1] - player.position[1]) + 1.0);

    playAreaWidth = (MINIMUM_CAMERA_WIDTH / MINIMUM_CAMERA_HEIGHT) * playAreaHeight;
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




function handleCollision(ball, rects, time, dt) {
  if (ball == null)
  {
    return;
  }
  const EPS = 0.001;

  // integrate velocity (predict motion)
  const vx = ball.velocity[0];
  const vy = ball.velocity[1];
  const moveX = vx * dt;
  const moveY = vy * dt;

  for (const r of rects) {

    if (ball.type != r.type && r.type != CollisionTarget.All)
    {
      continue;
    }

    const cos = Math.cos(r.rotation * 0.0055555555555556 * Math.PI);
    const sin = Math.sin(r.rotation * 0.0055555555555556 * Math.PI);

    // --- 1. transform motion into rect local space ---
    const relX = ball.position[0] - r.position[0];
    const relY = ball.position[1] - r.position[1];

    const localPosX = relX * cos - relY * sin;
    const localPosY = relX * sin + relY * cos;

    const localVelX = moveX * cos - moveY * sin;
    const localVelY = moveX * sin + moveY * cos;

    const hw = r.size[0] / 2;
    const hh = r.size[1] / 2;
    const radius = ball.size[0];

    // --- 2. expand rectangle by radius ---
    const expandedHW = hw + radius;
    const expandedHH = hh + radius;

    // --- 3. compute ray entry/exit times (swept AABB) ---
    const t1x = (-expandedHW - localPosX) / (localVelX || EPS);
    const t2x = ( expandedHW - localPosX) / (localVelX || EPS);
    const t1y = (-expandedHH - localPosY) / (localVelY || EPS);
    const t2y = ( expandedHH - localPosY) / (localVelY || EPS);

    const tminX = Math.min(t1x, t2x);
    const tmaxX = Math.max(t1x, t2x);
    const tminY = Math.min(t1y, t2y);
    const tmaxY = Math.max(t1y, t2y);

    const entryTime = Math.max(tminX, tminY);
    const exitTime = Math.min(tmaxX, tmaxY);

    // --- 4. if entry is before exit and within dt (0–1), we have a hit ---
    if (entryTime >= 0 && entryTime <= 1 && entryTime < exitTime) {
        //console.log('hit');
      // move ball to impact point
      const hitX = localPosX + localVelX * entryTime;
      const hitY = localPosY + localVelY * entryTime;

      // --- 5. determine which axis collided first ---
      //console.log('localVelX=' + localVelX + " localVelY=" + localVelY);
      let localNormal = { x: 0, y: 0 };
      if (tminX > tminY) {
        localNormal.x = Math.sign(localVelX) * -1;
      } else {
        localNormal.y = Math.sign(localVelY) * -1;
      }
      //console.log('localNormal=' + localNormal.x + " " + localNormal.y);
      const cos2 = Math.cos(-r.rotation * 0.0055555555555556 * Math.PI);
      const sin2 = Math.sin(-r.rotation * 0.0055555555555556 * Math.PI);
      // --- 6. transform normal back to world space ---
      const worldNormal = {
        x: localNormal.x * cos2 + localNormal.y * -sin2,
        y: localNormal.x * sin2 + localNormal.y * cos2
      };

      //console.log('worldNormal=' + worldNormal.x + " " + worldNormal.y);
      //console.log('vx=' + vx + " vy" + vy);

      // --- 7. move to collision point (in world space) ---
      ball.position[0] = r.position[0] + (hitX * cos + hitY * sin) + worldNormal.x * EPS;
      ball.position[1] = r.position[1] + (-hitX * sin + hitY * cos) + worldNormal.y * EPS;

      // --- 8. reflect velocity ---
      const dot = vx * worldNormal.x + vy * worldNormal.y;
      ball.velocity[0] = vx - 2 * dot * worldNormal.x;
      ball.velocity[1] = vy - 2 * dot * worldNormal.y;
      //ball.velocity[0] = worldNormal.x;
      //ball.velocity[1] = worldNormal.y;

      //console.log('ball.velocity[0]=' + ball.velocity[0] + " ball.velocity[1]" + ball.velocity[1]);

      // --- 9. apply damping (optional) ---
      ball.velocity[0] *= 0.9;
      ball.velocity[1] *= 0.9;

      // --- 10. update hit record (optional) ---
      ballHits[nextHitIndex] = time / 1000.0;
      ballHits[nextHitIndex+1] = ball.position[0];
      ballHits[nextHitIndex+2] = ball.position[1];
      nextHitIndex = (nextHitIndex + 3) % 24;
    }
  }

  // --- 11. move for remainder of dt if no hit ---
  ball.position[0] += ball.velocity[0] * dt;
  ball.position[1] += ball.velocity[1] * dt;
}