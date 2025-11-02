#version 300 es

precision mediump float;
precision mediump int;
uniform int uRenderMode;
uniform int uColorMode;
uniform vec3 uColor;

uniform vec2 uCameraPosition;
uniform vec2 uToClipSpace;

uniform vec2 uSize;
uniform vec2 uPadding;

uniform highp float uTime;
uniform float uRatio;
uniform vec2 uTranslation;
uniform sampler2D uSampler;


in vec2 fragmentUV;
out vec4 outputColor;

vec3 palette( float t, int color ) {
    vec3 a = vec3(0.5, 0.5, 0.5);
    vec3 b = vec3(0.5, 0.5, 0.5);
    vec3 c = vec3(1.0, 1.0, 1.0);

    if (color == 1) {
        c = vec3(1.0,0.5,0.5);
    }
    
    vec3 d = vec3(0.263,0.416,0.557);


    //return c;
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 explosionRing(vec2 uv, float progress, vec2 pos, float time)
{
    float distanceFromExplosion = distance(uv, vec2(0.5, 0.5));
    float explosionRadius = progress * 0.5;
    float explosionThickness = clamp(0.0, 1.0, (smoothstep(0.0, 0.02, progress * 3.0) - smoothstep(0.5, 2.5, progress * 3.0)) * 0.4);
    float explosion = smoothstep(explosionRadius - explosionThickness, explosionRadius, distanceFromExplosion) - smoothstep(explosionRadius, explosionRadius + explosionThickness, distanceFromExplosion);

    explosion = pow(0.1 / (1.0 - explosion), 1.2) * explosion; //smoothstepping glowy
    vec3 col = palette(length(pos) + 2.0*.4 - time*0.3, uColorMode);

    return explosion * col;
}

void main() {
    vec2 uv = (fragmentUV * 2.0 - vec2(1.0, 1.0));
    vec2 uv0 = fragmentUV - (uCameraPosition * uToClipSpace);
    vec3 finalColor = vec3(0.0);

    float flash = smoothstep(0.0, 0.2, uRatio) - smoothstep(0.2, 1.0, uRatio);

    float dummy1 = uTime * 0.0 + 1.0;

    float horizontalEdgeSize = abs(dFdx(fragmentUV.x));
    float verticalEdgeSize = abs(dFdy(fragmentUV.y));

    //////////////GRID
    if (uRenderMode == 0) {
        vec2 gridUV = fract((fragmentUV) * 25.0);
        float gridX = max(1.0 - abs(gridUV.x - 0.5), 0.0);
        float gridY = max(1.0 - abs(gridUV.y - 0.5), 0.0);
        float grid = max(gridX, gridY);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        grid = pow(0.01 / (1.0 - grid), 1.2); //smoothstepping glowy
        vec3 col = palette(uv0.x + 4.0*.4 - uTime*0.13, uColorMode); //color

        finalColor += (grid * col);
    }

    //////////////GRID2 (try to do parallax here)
    if (uRenderMode == 0) {
        vec2 gridUV = fract((fragmentUV) * 5.0);
        float gridX = max(1.0 - abs(gridUV.x - 0.5), 0.0);
        float gridY = max(1.0 - abs(gridUV.y - 0.5), 0.0);
        float grid = max(gridX, gridY);

        //border = sin(border*8. + uTime)/8.; //alternating from -1 to 1
        //border = abs(border); //alternating from 0 to 1
        grid = pow(0.005 / (1.0 - grid), 1.2); //smoothstepping glowy
        vec3 col = palette(length(uv0.y) + 2.0*.4 - uTime*0.1, uColorMode); //color

        finalColor += (grid * col);
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
        vec3 col = mix( palette(length(uv0) + 5.0*.4 - uTime*0.15, uColorMode), vec3(1.0, 1.0, 1.0), flash); //color

        finalColor += player * col;
        finalColor = clamp(finalColor, vec3(0.0, 0.0, 0.0), vec3(1.0, 1.0, 1.0));

        float white = smoothstep(0.85, 0.92, distanceFromPlayer) - smoothstep(0.95, 1.0, distanceFromPlayer);
        col = palette(length(uv0) + 5.0*.4 - uTime*0.2, uColorMode); //color
        finalColor += white * col * 1.3;



        //float mask = smoothstep(0.92, 1.0, distanceFromPlayer);
        //float black = 1.0 - mask *0.8;
        //finalColor = finalColor * vec3(black, black, black);
        
    }

    if (uRenderMode == 1)
    {
        vec2 trueShape = uSize / (uSize + uPadding);
        float radius = trueShape.x * 0.5;
        vec2 outlineSize = vec2(0.02, 0.02) / trueShape;

        float dist = length(fragmentUV - vec2(0.5, 0.5));
        float ddx_dist = dFdx(dist);
        float ddy_dist = dFdy(dist);
        float width = sqrt(ddx_dist * ddx_dist + ddy_dist * ddy_dist);

        // 5. Use the footprint to create a smooth, anti-aliased edge
        float alpha = smoothstep(radius - width, radius, dist) - smoothstep(radius + outlineSize.x - width, radius + outlineSize.x, dist);

        finalColor += alpha * uColor;

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

    if (uRenderMode == 2)
    {

        vec2 trueShape = uSize / (uSize + uPadding);
        vec2 radius = trueShape * 0.5;
        vec2 outlineSize = vec2(0.02, 0.02) / uSize;

        vec2 dist = abs(fragmentUV - vec2(0.5, 0.5));

        vec2 inside = vec2(1., 1.) - smoothstep(radius , radius + outlineSize + vec2(horizontalEdgeSize, verticalEdgeSize), dist);

        float outlineX = smoothstep(radius.x - horizontalEdgeSize, radius.x, dist.x) - smoothstep(radius.x + outlineSize.x - horizontalEdgeSize, radius.x + outlineSize.x, dist.x);
        float outlineY = smoothstep(radius.y - verticalEdgeSize, radius.y, dist.y) - smoothstep(radius.y + outlineSize.y - verticalEdgeSize, radius.y + outlineSize.y, dist.y);
        finalColor += inside.x * inside.y * max(outlineX, outlineY) * uColor;

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

    if (uRenderMode == 3) {
        {
            //explosionRing(vec2 uv, vec2 explosionPosition, vec2 playerPosition, vec2 size, float time, float timeExplosion)
            finalColor += explosionRing(fragmentUV, uRatio, uTranslation, uTime);
        }
    }
    
    outputColor = vec4(finalColor, dummy1);
}

//vec3 explosionRing(vec2 uv, vec2 size, float progress, float timeExplosion, vec2 pos)