uniform float time;
uniform float frequency;

void main() {

    vec3 vPosition = position;

    float easing = 0.0008;

    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));
    float size = 2.0;
    // float amplitude = abs( frequency - 256.0 );

    float normalized = ( frequency * 10.0 ) / 255.0; 

    // vPosition.z *= sin( dist / size + ( time / 5000.0 ) ) * frequency;    
    // vPosition.x += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));
    // vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), time * easing))); 

    vPosition.z += normalized;

	gl_Position  = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0 );

}