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

var timeBeforeNextCheck = 0.0;
var timeBeforeNextRound = 0.0;
var waitingForNextRound = false;
var nextHitIndex = 0;
var DELAY_BETWEEN_HITS = 1000.0;
var DELAY_BETWEEN_ROUNDS = 2000.0;
var HIT_INDEX_MAX = 8;
var player = new GamePlayer([0.0, 0.5], [0.05, 0.05], [0,0]);
var ball = new GameBall([0.0, 0.0], [0.05, -1.5], [0.0, 1.0], [0.1, 0.1]);
var ballHits = [-99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0];

var playerHits = [-99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0,
                -99999.0, 0.0, 0.0];               

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
    }
}

