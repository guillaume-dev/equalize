#pragma glslify: cnoise = require(./classicnoise4D)

uniform float time;

float noise( float x, float y ) {

	return ( 40.0 * sin( sqrt( x * x + y * y ) ) ) / sqrt( x * x + y * y );

}

void main() {

    vec3 vPosition = position;

    float easing = 0.0008;

    // vPosition.x += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));
    // vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), (time * easing))));
    // vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));


    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));
    float size = 2.0;
    float magnitude = 1.0;

    // vPosition.y += sin( dist / size + ( time / 5000.0 ) ) * amplitude;

    // vPosition.z *= sin( dist / size + ( time / 5000.0 ) ) * magnitude;
    // vPosition.z *= noise( position.x, position.y ) * cos( time * easing );

	gl_Position  = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}