#pragma glslify: cnoise = require(./classicnoise4D)

uniform float time;
uniform float frequency;

void main() {

    vec3 vPosition = position;

    float easing = 0.0008;

    // vPosition.x += cos( time * easing ) / 30.0;
    // vPosition.y += sin( time * easing ) / 30.0;
    // vPosition.z += time * easing;

    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));
    float size = 2.0;
    float magnitude = 25.0;
    float amplitude = abs( frequency - 128.0 );

    vPosition.x *= sin( amplitude ) / amplitude;
    vPosition.y *= sin( amplitude ) / amplitude;

	  // // Add in the translation.
	 	// vec2 position = rotatedPosition + u_translation;

	gl_Position  = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}