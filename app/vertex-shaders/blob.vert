#pragma glslify: cnoise = require(./classicnoise4D)

uniform float time;
uniform float amplitude;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 vNormal, vTangent, vBinormal;
varying vec3 vPosition;

void main() {

	vUv = uv;

	vPosition = position;

    vec3 v = vPosition;
    float displacement = cos( time * 0.0008 ) * 10.0;

    if ( displacement < 1.0 ) {
    	displacement = 1.0;
    }

    vec3 edges = mix( vec3( 3.0 ), vec3(5.0), smoothstep( 0.0, 1.0, v.x ) );

    float easing = 0.8;
    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));
    float size = 2.0;
    float magnitude = 25.0;

	// tangent space vectors for normal mapping
	vNormal = normalize( normalMatrix * normal );
	vTangent = normalize( normalMatrix * position );
	vBinormal = normalize( cross( normal, vTangent ) );

	vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), (time * easing)))); 
    vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));

    vPosition.x *= cos( dist / size + ( time / 5000.0 ) ) * amplitude;
    vPosition.y *= sin( dist / size + ( time / 5000.0 ) ) * amplitude;

	// deform mesh by the distance from the edge
	gl_Position = projectionMatrix * modelViewMatrix * vec4( edges * normal + vPosition, 1.0);

	float d = 3.3 * sin( time * 3. + vPosition.y * 5.);									

	vertPos = ( modelViewMatrix * vec4( normal + position, 1.0) ).xyz;

}