#version 300 es

precision mediump float;
precision mediump int;
uniform int uRenderMode;

uniform vec2 uPlayerPosition;
uniform vec2 uPlayerSize;
uniform vec2 uCameraPosition;
uniform vec2 uToClipSpace;

uniform vec2 uSize;
uniform vec2 uPadding;

uniform highp float uTime;
uniform vec2 uBallPosition;
uniform vec2 uBallSize;
uniform highp float uLastHitTime;
uniform highp vec3 uBallHits[8];
uniform highp vec3 uPlayerHits[8];
uniform sampler2D uSampler;


in vec2 fragmentUV;
out vec4 outputColor;

vec3 palette( float t ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);
    vec3 d = vec3(0.263,0.416,0.557);


    //return c;
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 explosionRing(vec2 uv, vec2 explosionPosition, vec2 playerPosition, vec2 size, float time, float timeExplosion)
{
    float distanceFromExplosion = distance(explosionPosition, uv);
    float timeSinceHit = (time - timeExplosion);
    float explosionRadius = timeSinceHit;
    float explosionThickness = clamp(0.0, 1.0, (smoothstep(0.0, 0.05, timeSinceHit) - smoothstep(0.5, 2.5, timeSinceHit)) * 1.0);
    float explosion = smoothstep(size.x + explosionRadius - explosionThickness, size.x + explosionRadius, distanceFromExplosion) - smoothstep(size.x + explosionRadius, size.x + explosionRadius + explosionThickness, distanceFromExplosion);

    explosion = pow(0.1 / (1.0 - explosion), 1.2) * explosion; //smoothstepping glowy
    vec3 col = palette(length(playerPosition) + 2.0*.4 - time*0.3);

    return explosion * col;
}

void main() {
    vec2 uv = (fragmentUV * 2.0 - vec2(1.0, 1.0));
    vec2 uv0 = fragmentUV - (uCameraPosition * uToClipSpace);
    vec3 finalColor = vec3(0.0);

    float lastHitTime = uTime - uLastHitTime;
    float flash = smoothstep(0.0, 0.2, lastHitTime) - smoothstep(0.2, 1.0, lastHitTime);

    float distanceFromCursor = distance(uPlayerPosition.xy, fragmentUV.xy);
    float fractDistance = fract(distanceFromCursor * 5.0 - uTime * 0.2);
    float ring = pow(0.01 / fractDistance, 1.2); //smoothstepping glowy

    float dummy1 = uPlayerPosition.x * uTime * uBallPosition.x * uBallSize.x * uLastHitTime * uBallHits[0].x * uPlayerHits[0].x * uPlayerSize.x * 0.0 + 1.0;

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
    if (uRenderMode == 0) {
        vec2 gridUV = fract((fragmentUV) * 25.0);
        float gridX = max(1.0 - abs(gridUV.x - 0.5), 0.0);
        float gridY = max(1.0 - abs(gridUV.y - 0.5), 0.0);
        float grid = max(gridX, gridY);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        grid = pow(0.02 / (1.0 - grid), 1.2); //smoothstepping glowy
        vec3 col = palette(uv0.x + 4.0*.4 - uTime*0.13); //color

        finalColor += grid * col;
    }

    //////////////GRID2 (try to do parallax here)
    if (uRenderMode == 0) {
        vec2 gridUV = fract((fragmentUV) * 5.0);
        float gridX = max(1.0 - abs(gridUV.x - 0.5), 0.0);
        float gridY = max(1.0 - abs(gridUV.y - 0.5), 0.0);
        float grid = max(gridX, gridY);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        grid = pow(0.03 / (1.0 - grid), 1.2); //smoothstepping glowy
        vec3 col = palette(length(uv0.y) + 4.0*.4 - uTime*0.1); //color

        finalColor += grid * col;
    }
    
    ///////EXPLOSION
    if (uRenderMode == 0) {
        for (int i = 0; i<8; i++)
        {
            {
                //explosionRing(vec2 uv, vec2 explosionPosition, vec2 playerPosition, vec2 size, float time, float timeExplosion)
                finalColor += explosionRing(fragmentUV, uPlayerHits[i].yz, fragmentUV - uPlayerHits[i].yz, uPlayerSize, uTime, uPlayerHits[i].x);
            }

        }
    }


    //////////////BALL
    if (false && uRenderMode == 0) {
        float distanceFromBall = distance(uBallPosition.xy, fragmentUV.xy);
        float ball = smoothstep(uBallSize.x - 0.3, uBallSize.x, distanceFromBall) - smoothstep(uBallSize.x, uBallSize.x + 0.3, distanceFromBall);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        ball = pow(0.05 / (1.0 - ball), 1.2); //smoothstepping glowy
        vec3 col = palette(length(uv0) + 4.0*.4 - uTime*0.4); //color

        finalColor += ball * col;
        finalColor = clamp(finalColor, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));

        float black = smoothstep(uBallSize.x, uBallSize.x+ 0.02, distanceFromBall);
        finalColor = finalColor * vec3(black, black, black);

        float insideColor = smoothstep(0.0, uBallSize.x+ 0.02, distanceFromBall);
        float distanceFromRotating = distance(uBallPosition.xy + vec2(sin(uTime * 3.0), cos(uTime * 3.0)) * uBallSize.x, fragmentUV.xy);

        float mask = 1.0 - black;

        vec3 addedColor = mix(palette(abs(sin(distanceFromRotating * 20.0 + uTime * 2.0))), vec3(1.0, 1.0, 1.0), flash);

        finalColor += addedColor * mask;
    }



    //////////////PLAYER
    if (false && uRenderMode == 0) {
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

        float insideColor = smoothstep(0.0, uPlayerSize.x+ 0.02, distanceFromPlayer);
        float distanceFromRotating = distance(uPlayerPosition.xy + vec2(sin(uTime * 3.0), cos(uTime * 3.0)) * uPlayerSize.x, fragmentUV.xy);
        float mask = 1.0 - black;

        vec3 addedColor = mix(palette(abs(sin(distanceFromRotating * 20.0 + uTime * 2.0))), vec3(1.0, 1.0, 1.0), flash);

        finalColor += addedColor * mask;
    }

    //////////////TEXT
    if (uRenderMode == 0) {
        float flashScale = flash * 0.2;
        float textUvX = smoothstep(-0.5 - flashScale, 0.5 + flashScale, fragmentUV.x);
        float textUvY = smoothstep(-1.0 - flashScale, 0.0 + flashScale, fragmentUV.y);
        vec4 sampledColor = texture(uSampler, vec2(textUvX, textUvY));

        float distanceFromPlayer = sampledColor.g;
        float player = smoothstep(0.85, 0.92, distanceFromPlayer);
        player = max(distanceFromPlayer, player);

        player = pow(0.2 / (1.0 - player), 1.2); //smoothstepping glowy
        player = clamp(player, 0.0, 1.0);
        vec3 col = mix( palette(length(uv0) + 5.0*.4 - uTime*0.15), vec3(1.0, 1.0, 1.0), flash); //color

        finalColor += player * col;
        finalColor = clamp(finalColor, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));

        float white = smoothstep(0.85, 0.92, distanceFromPlayer) - smoothstep(0.95, 1.0, distanceFromPlayer);
        col = palette(length(uv0) + 5.0*.4 - uTime*0.2); //color
        finalColor += white * col * 1.3;



        //float mask = smoothstep(0.92, 1.0, distanceFromPlayer);
        //float black = 1.0 - mask *0.8;
        //finalColor = finalColor * vec3(black, black, black);
        
    }

    if (uRenderMode == 1)
    {
        float distanceFromBall = distance(fragmentUV.xy, vec2(0.5, 0.5));
        vec2 adjustedBallSize = vec2(0.3, 0.3);
        float ball = smoothstep(adjustedBallSize.x - 0.3, adjustedBallSize.x, distanceFromBall) - smoothstep(adjustedBallSize.x, adjustedBallSize.x + 0.3, distanceFromBall);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        ball = pow(0.05 / (1.0 - ball), 1.2); //smoothstepping glowy
        vec3 col = palette(length(uv0 * 5.0) + 4.0*.4 - uTime*0.4); //color

        finalColor += ball * col;
        finalColor = clamp(finalColor, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));

        float black = smoothstep(adjustedBallSize.x, adjustedBallSize.x+ 0.02, distanceFromBall);
        finalColor = finalColor * vec3(black, black, black);

        float distanceFromRotating = distance(vec2(0.5, 0.5) + vec2(sin(uTime * 3.0), cos(uTime * 3.0)) * 0.25, fragmentUV.xy);

        float mask = 1.0 - black;

        vec3 addedColor = mix(palette(abs(sin(distanceFromRotating * 10.0 + uTime * 2.0))), vec3(1.0, 1.0, 1.0), flash);

        finalColor += addedColor * mask;

        if (false)
        { //debug pink collision
            vec2 trueShape = uSize / (uSize + uPadding);
            vec2 trueShapeUVStart = (vec2(1.0, 1.0) - trueShape) * vec2(0.5, 0.5);
            vec2 trueShapeUVEnd = vec2(1.0, 1.0) - trueShapeUVStart;

            float insideX = step(fragmentUV.x, trueShapeUVStart.x) - step(fragmentUV.x, trueShapeUVEnd.x);
            float insideY = step(fragmentUV.y, trueShapeUVStart.y) - step(fragmentUV.y, trueShapeUVEnd.y);

            finalColor += insideX * insideY * vec3(1.0, 0.0, 1.0);
        }


        //finalColor = vec3(1.0, 0.0, 1.0);
    }

    if (uRenderMode == 2)
    {
        //float distanceFromBall = distance(fragmentUV.xy, vec2(0.5, 0.5));
        float distanceFromBall = max(abs(fragmentUV.x - 0.5), abs(fragmentUV.y - 0.5));
        vec2 adjustedBallSize = vec2(0.4, 0.4);
        float ball = smoothstep(adjustedBallSize.x - 0.3, adjustedBallSize.x, distanceFromBall) - smoothstep(adjustedBallSize.x, adjustedBallSize.x + 0.3, distanceFromBall);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        ball = pow(0.05 / (1.0 - ball), 1.2); //smoothstepping glowy
        vec3 col = palette(length(uv0) + 4.0*.4 - uTime*0.4); //color

        finalColor += ball * col;
        finalColor = clamp(finalColor, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));

        float black = smoothstep(adjustedBallSize.x, adjustedBallSize.x+ 0.02, distanceFromBall);
        finalColor = finalColor * vec3(black, black, black);

        float insideColor = smoothstep(0.0, adjustedBallSize.x+ 0.02, distanceFromBall);
        float distanceFromRotating = distance(uBallPosition.xy + vec2(sin(uTime * 3.0), cos(uTime * 3.0)) * adjustedBallSize.x, fragmentUV.xy);

        float mask = 1.0 - black;

        vec3 addedColor = mix(palette(abs(sin(distanceFromRotating * 20.0 + uTime * 2.0))), vec3(1.0, 1.0, 1.0), flash);

        finalColor += addedColor * mask;

        if (false)
        { //debug pink collision
            vec2 trueShape = uSize / (uSize + uPadding);
            vec2 trueShapeUVStart = (vec2(1.0, 1.0) - trueShape) * vec2(0.5, 0.5);
            vec2 trueShapeUVEnd = vec2(1.0, 1.0) - trueShapeUVStart;

            float insideX = step(fragmentUV.x, trueShapeUVStart.x) - step(fragmentUV.x, trueShapeUVEnd.x);
            float insideY = step(fragmentUV.y, trueShapeUVStart.y) - step(fragmentUV.y, trueShapeUVEnd.y);

            finalColor += insideX * insideY * vec3(1.0, 0.0, 1.0);
        }
    }
    
    outputColor = vec4(finalColor, dummy1);
}