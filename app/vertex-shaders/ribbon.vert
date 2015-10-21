attribute vec3 velocity;

uniform float time;
uniform vec3 endpoint;

varying vec3 vPosition;

void main() {

	vPosition = position;
	
	vPosition.x += velocity.x * time ;
	vPosition.y += velocity.y * time ;
	vPosition.z += velocity.z * time ;

    gl_Position = projectionMatrix * modelViewMatrix *  vec4( vPosition, 1.0 );

}