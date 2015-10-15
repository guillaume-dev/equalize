attribute float bufferindex;
varying vec3 vPosition;

void main() {

	vPosition = position;

	if ( bufferindex < 10.0 ) {

		vPosition.y = 100.0;

	}

	gl_Position  = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}