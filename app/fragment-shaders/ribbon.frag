vec4 vColor; 

varying float seg;

void main() {

	if ( seg > 10.0 ) {
		vColor = vec4( 1.0, 0.0, 0.0, 1.0 );
	} else {
		vColor = vec4( 0.0, 1.0, 0.0, 1.0 );
	}

	gl_FragColor = vColor;
	
}