uniform float time;
uniform float frequency;

void main() {

	float red = ( frequency * 1.0 ) / 255.0; 

	gl_FragColor = vec4(red, red, red, red);
	
}