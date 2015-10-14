#pragma glslify: cnoise = require(./classicnoise3D)

uniform float time;
uniform float frequency[ 1024 ];
attribute float bufferindex;
varying vec3 vPosition;
varying vec3 vNormal;
uniform float opacity;

float noise( float x, float y ) {

	return ( 40.0 * sin( sqrt( x * x + y * y ) ) ) / sqrt( x * x + y * y );

}


float turbulence( vec3 p ) {
    float w = 100.0;
    float t = -.5;
    for (float f = 1.0 ; f <= 10.0 ; f++ ){
        float power = pow( 2.0, f );
        t += abs( pnoise_1_5( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
    }
    return t;
}

float f( vec3 p ) {
    return pnoise_1_5( vec3( p ), vec3( 10.0, 10.0, 10.0 ) );
    return pnoise_1_5( 8.0 * vec3( p ), vec3( 10.0, 10.0, 10.0 ) );
}

// varying vec2 vUv;
// varying vec3 vNormal;
// varying vec3 vReflect;
varying float ao;
// varying vec3 vPosition;
// uniform float time;
uniform float weight;
// uniform float size;
// uniform float opacity;


float fround( float value ) {
    return floor( value + 0.5 );
}

vec3 v3round( vec3 value ) {
    return vec3( fround( value.x ), fround( value.y ), fround( value.z ) );
}

void main() {

    vPosition = position;

    float easing = 0.0008;

    float freq = frequency[ int( bufferindex ) ];
    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));
    float size = 2.0;
    float amplitude = abs( freq - 256.0 );

    // vPosition.z *= sin( dist / size + ( time / 5000.0 ) ) * freq;    
    // vPosition.x += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));
    // vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), time * easing))); 
    // vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));
    vPosition.z += sin( freq * easing ) * 5.0;

    vec3 evNormal = normal;
    vec3 aniNormal = 2.0 * evNormal + time;
    float f0 = weight * f( aniNormal );
    float fx = weight * f( aniNormal + vec3( .0001, 0.0, 0.0 ) );
    float fy = weight * f( aniNormal + vec3( 0.0, .0001, 0.0 ) );
    float fz = weight * f( aniNormal + vec3( 0.0, 0.0, .0001 ) );
    vec3 modifiedNormal = normalize( evNormal - vec3( (fx - f0) / .0001, (fy - f0) / .0001, (fz - f0) / .0001 ) );

    vNormal = modifiedNormal;

	gl_Position  = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}