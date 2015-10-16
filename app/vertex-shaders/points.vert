#pragma glslify: cnoise = require(./classicnoise4D)

uniform float time;
uniform float frequency[ 256 ];

attribute float map;
attribute float bufferindex;

varying float mapping;
varying float freq;

void main() {

    vec3 vPosition = position;

    float easing = 0.0002;
    float amplitude = abs( freq - 256.0 );

    mapping = float( map );
    freq =  frequency[ int( bufferindex ) ];

    vPosition.x += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));
    vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));

	gl_Position  = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}