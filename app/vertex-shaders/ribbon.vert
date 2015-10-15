
uniform float time;
uniform vec3 finalDest;

// attribute float segment;

varying float seg;

void main() {

	vec3 vPosition = position;

	float easing = 1.0;

	vPosition.x += cos( time );


	gl_Position  = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}