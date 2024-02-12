const vertexShaderSourceCode = `#version 300 es
precision mediump float;

in vec2 vertexPosition;
in vec2 vertexUV;
out vec2 fragmentUV;

void main() {
  fragmentUV = vertexUV;
  gl_Position = vec4(vertexPosition.xy, 0.0, 1.0);
}`;

const fragmentShaderSourceCode = `#version 300 es
precision mediump float;

uniform vec2 uCanvasSize;
uniform vec2 uPlayerPosition;
uniform vec2 uPlayerSize;
uniform float uTime;
uniform vec2 uBallPosition;
uniform vec2 uBallSize;
uniform float uLastHitTime;
uniform vec3 uBallHits[8];
uniform vec3 uPlayerHits[8];

in vec2 fragmentUV;
out vec4 outputColor;

vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);

    return a + b*cos( 6.28318*(c*t+d) );
}

void main() {
    vec2 uv = (fragmentUV * 2.0 - vec2(1.0, 1.0));
    vec2 uv0 = fragmentUV - uPlayerPosition;
    vec3 finalColor = vec3(0.0);


    float distanceFromCursor = distance(uPlayerPosition.xy, fragmentUV.xy);
    float fractDistance = fract(distanceFromCursor * 5.0 - uTime * 0.2);
    float ring = pow(0.01 / fractDistance, 1.2); //smoothstepping glowy

    float dummy1 = uPlayerPosition.x * uCanvasSize.x * uTime * uBallPosition.x * uBallSize.x * uLastHitTime * uBallHits[0].x * uPlayerHits[0].x * uPlayerSize.x * 0.0 + 1.0;

    //////////////BORDER
    {
        //float rightBorder = max(1.0 - abs(fragmentUV.x - 0.5), 0.0);
        //float leftBorder = max(1.0 - abs(fragmentUV.x + 0.5), 0.0);
    
        //float topBorder = max(1.0 - abs(fragmentUV.y - 1.0), 0.0);
        //float bottomBorder = max(1.0 - abs(fragmentUV.y + 1.0), 0.0);
    
        //float border = max(max(leftBorder, rightBorder), max(topBorder, bottomBorder) );
        //border = pow(0.01 / (1.0 - border), 1.0); //smoothstepping glowy
        //vec3 col = palette(length(uv0) + 2.0*.4 + uTime*.4); //color

        //finalColor += border * col;
    }

    //////////////GRID
    {
        vec2 gridUV = fract((fragmentUV+uPlayerPosition*0.15) * 2.5);
        float gridX = max(1.0 - abs(gridUV.x - 0.5), 0.0);
        float gridY = max(1.0 - abs(gridUV.y - 0.5), 0.0);
        float grid = max(gridX, gridY);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        grid = pow(0.02 / (1.0 - grid), 1.2); //smoothstepping glowy
        vec3 col = palette(length(uv0+uPlayerPosition*0.15) + 4.0*.4 - uTime*0.3); //color

        finalColor += grid * col;
    }

    //////////////GRID2
    {
        vec2 gridUV = fract((fragmentUV+uPlayerPosition*0.075) * 5.0);
        float gridX = max(1.0 - abs(gridUV.x - 0.5), 0.0);
        float gridY = max(1.0 - abs(gridUV.y - 0.5), 0.0);
        float grid = max(gridX, gridY);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        grid = pow(0.01 / (1.0 - grid), 1.2); //smoothstepping glowy
        vec3 col = palette(length(uv0+uPlayerPosition*0.075) + 4.0*.4 - uTime*0.3); //color

        finalColor += grid * col;
    }
    



    //////////////BALL
    {
        float distanceFromBall = distance(uBallPosition.xy, fragmentUV.xy);
        float ball = smoothstep(uBallSize.x - 0.3, uBallSize.x, distanceFromBall) - smoothstep(uBallSize.x, uBallSize.x + 0.3, distanceFromBall);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        ball = pow(0.05 / (1.0 - ball), 1.2); //smoothstepping glowy
        vec3 col = palette(length(uv0) + 4.0*.4 - uTime*0.4); //color

        finalColor += ball * col;
    }

    ///////EXPLOSION
    {
        for (int i = 0; i<8; i++)
        {
            {
                float distanceFromPlayer = distance(uPlayerHits[i].yz, fragmentUV.xy);
                float distance = (uTime - uPlayerHits[i].x) * 0.6;
                float player = smoothstep(distance - 0.3, distance, distanceFromPlayer) - smoothstep(distance, distance + 0.3, distanceFromPlayer);

                player = pow(0.1 / (1.0 - player), 1.2) * player; //smoothstepping glowy
                vec3 col = palette(length(uv0) + 2.0*.4 - uTime*0.15); //color
        
                finalColor += player * col;
            }

            {
                float distanceFromBall = distance(uBallHits[i].yz, fragmentUV.xy);
                float distance = (uTime - uBallHits[i].x) * 0.9;
                float ball = smoothstep(distance - 0.5, distance, distanceFromBall) - smoothstep(distance, distance + 0.5, distanceFromBall);
    
                ball = pow(0.05 / (1.0 - ball), 1.2) * ball; //smoothstepping glowy
                vec3 col = palette(length(uv0) + 3.0*.4 - uTime*0.35); //color
        
                finalColor += ball * col;
            }

        }
    }

    //////////////PLAYER
    {
        float distanceFromPlayer = distance(uPlayerPosition.xy, fragmentUV.xy);
        float player = smoothstep(uPlayerSize.x - 0.3, uPlayerSize.x, distanceFromPlayer) - smoothstep(uPlayerSize.x, uPlayerSize.x + 0.3, distanceFromPlayer);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        player = pow(0.05 / (1.0 - player), 1.2); //smoothstepping glowy
        vec3 col = palette(length(uv0) + 5.0*.4 - uTime*0.15); //color

        finalColor += player * col;

        finalColor = clamp(finalColor, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));

        float black = smoothstep(uPlayerSize.x, uPlayerSize.x+ 0.02, distanceFromPlayer);
        finalColor = finalColor * vec3(black, black, black);
    }
        
    outputColor = vec4(finalColor, dummy1);

}`;