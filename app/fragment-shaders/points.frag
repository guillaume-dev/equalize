
uniform float time;
uniform float frequency[ 256 ];

varying float mapping;
varying float freq;

vec4 vColor;

void main() {

	if ( mapping > freq ) {
		vColor = vec4( mapping / 255.0, cos( time ), cos( time ), 1.0 );
	}
	else {
		vColor = vec4( 1.0, 1.0, 1.0, cos( time * 0.0009 ) + 0.2 );
	}

	gl_FragColor = vColor;
	
}