#pragma glslify: cnoise = require(./classicnoise3D)

uniform float time;
uniform float amplitude;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 vNormal, vTangent, vBinormal;
varying vec3 vPosition;
varying float z;

float distMax = 30.0;

void main() {

    gl_PointSize = 1.;
    vUv = uv;
    vPosition = position;
    vNormal = normalize( normalMatrix * normal );

    float noise = 2.0;
    float easing = 0.08;
    float dist = distance( vec2(vPosition.x, vPosition.y), vec2( 0.0, 0.0 ) );

    float distance = sqrt(((uv.x-0.5) * (uv.x-0.5)) + ((uv.y-0.5) * (uv.y-0.5)));
    float z = ((amplitude * easing) * sin(((time * 0.5 * easing) - (distance * 1.0)) * 3.14));

    float displacement = pnoise_1_5( .4 * position + vec3( 0, easing * time, 0 ), vec3( 100.0 ) ) * 1. * noise;

    vec3 newPosition = position;

    if ( dist < 30.0) {

      float amplitudeRatio = ( abs( dist - 30.0 ) + ( amplitude ) * 4.0 ) / 30.0;
      float elevation = amplitudeRatio;
      
      displacement += pnoise_1_5( 8. * position + vec3( 0, easing * time * 20., 0 ), vec3( 100. ) ) * .1 * noise - elevation;// * 0.008 ));//( amplitude - ( dist / 30.0 ) );

      displacement = displacement + (sin(position.x / 2. - 3.14 / 2.)) * amplitudeRatio;
      displacement = displacement + (cos(position.y / 2. - 3.14 / 2.)) * amplitudeRatio;

      newPosition = vec3(position.x, position.y, displacement + z);

    } else {
     displacement += pnoise_1_5( 8. * position + vec3( 0, easing * time * 20., 0 ), vec3( 100. ) ) * .1 * noise;
        
    }

    gl_Position      = projectionMatrix * modelViewMatrix * vec4( newPosition, 1. );

    z = newPosition.z;
}