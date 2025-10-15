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

    update(dt, movementVector)
    {
        let directionX = movementVector.x;
        let directionY = movementVector.y;

        this.position[0] += directionX * dt;
        this.position[1] += directionY * dt;
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
rects.push(new RectCollision([-1.5, 0.5], [1.0, 1.0], 0.0));
rects.push(new RectCollision([1.5, -0.5], [1.0, 1.0], 0.0));

function updateGameState(time, dt)
{
    if (waitingForNextRound)
    {
        if (time < timeBeforeNextRound)
        {
            return;
        }

        ball = null;
        ball = new GameBall([0.0, 0.0], [0.05, -1.5], [0.0, 1.0], [0.1, 0.1]);
        waitingForNextRound = false;
        currentNumberOfHits = 0;
        createTextTexture(gl, getTailingZeroNumber(currentNumberOfHits));
    }
    else if (ball.position[1] > 1.0)
    {
        timeBeforeNextRound = time + DELAY_BETWEEN_ROUNDS;
        waitingForNextRound = true;
        return;
    }

    if (time >= timeBeforeNextCheck)
    {
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
    }

    handleCollision(ball, rects, time, dt);
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

function handleCollisionBCK(ball, rects, time, dt) {
  const EPS = 0.001;

  for (const r of rects) {
    const cos = Math.cos(-r.rotation);
    const sin = Math.sin(-r.rotation);

    // --- 1. translate ball into rect local space ---
    const relX = ball.position[0] - r.position[0];
    const relY = ball.position[1] - r.position[1];
    const localX = relX * cos - relY * sin;
    const localY = relX * sin + relY * cos;

    const hw = r.size[0] / 2;
    const hh = r.size[1] / 2;

    // --- 2. clamp to find closest point ---
    const clampedX = Math.max(-hw, Math.min(localX, hw));
    const clampedY = Math.max(-hh, Math.min(localY, hh));

    // --- 3. distance to closest point ---
    let dx = localX - clampedX;
    let dy = localY - clampedY;
    let distSq = dx * dx + dy * dy;

    const radius = ball.size[0];
    const radiusSq = radius * radius;

    // --- 4. check collision ---
    if (distSq < radiusSq) {
      let dist = Math.sqrt(distSq);

      let localNormal;
      if (dist > 1e-6) {
        // ✅ normal from circle center to closest point
        localNormal = { x: dx / dist, y: dy / dist };
      } else {
        // 🧩 ball is *inside* the rectangle → pick nearest face normal
        const dxMin = hw - Math.abs(localX);
        const dyMin = hh - Math.abs(localY);

        console.log('penetration=' + penetration);
        console.log('normal x=' + worldNormal.x + ', y=' + worldNormal.y);

        if (dxMin < dyMin) {
          // Closer to left/right wall
          localNormal = { x: Math.sign(localX), y: 0 };
          dist = dxMin;
        } else {
          // Closer to top/bottom wall
          localNormal = { x: 0, y: Math.sign(localY) };
          dist = dyMin;
        }
      }

      // --- 5. transform normal to world space ---
      const worldNormal = {
        x: localNormal.x * cos + localNormal.y * -sin,
        y: localNormal.x * sin + localNormal.y * cos
      };

      // --- 6. push ball out ---
      const penetration = radius - dist;
      ball.position[0] += worldNormal.x * (penetration + EPS);
      ball.position[1] += worldNormal.y * (penetration + EPS);

      // --- 7. reflect velocity ---
      const vx = ball.velocity[0];
      const vy = ball.velocity[1];
      const dot = vx * worldNormal.x + vy * worldNormal.y;
      if (dot < 0) {
        ball.velocity[0] -= 2 * dot * worldNormal.x;
        ball.velocity[1] -= 2 * dot * worldNormal.y;
      }

      // --- 8. damping ---
      ball.velocity[0] *= 0.9;
      ball.velocity[1] *= 0.9;
    }
  }
}




function handleCollision(ball, rects, time, dt) {
  const EPS = 0.001;

  // integrate velocity (predict motion)
  const vx = ball.velocity[0];
  const vy = ball.velocity[1];
  const moveX = vx * dt;
  const moveY = vy * dt;

  for (const r of rects) {
    const cos = Math.cos(-r.rotation);
    const sin = Math.sin(-r.rotation);

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
        console.log('hit');
      // move ball to impact point
      const hitX = localPosX + localVelX * entryTime;
      const hitY = localPosY + localVelY * entryTime;

      // --- 5. determine which axis collided first ---
      let localNormal = { x: 0, y: 0 };
      if (tminX > tminY) {
        localNormal.x = Math.sign(localVelX) * -1;
      } else {
        localNormal.y = Math.sign(localVelY) * -1;
      }

      // --- 6. transform normal back to world space ---
      const worldNormal = {
        x: localNormal.x * cos + localNormal.y * -sin,
        y: localNormal.x * sin + localNormal.y * cos
      };

      // --- 7. move to collision point (in world space) ---
      ball.position[0] = r.position[0] + (hitX * cos + hitY * sin) + worldNormal.x * EPS;
      ball.position[1] = r.position[1] + (-hitX * sin + hitY * cos) + worldNormal.y * EPS;

      // --- 8. reflect velocity ---
      const dot = vx * worldNormal.x + vy * worldNormal.y;
      ball.velocity[0] = vx - 2 * dot * worldNormal.x;
      ball.velocity[1] = vy - 2 * dot * worldNormal.y;

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