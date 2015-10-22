#pragma glslify: cnoise = require(./classicnoise4D)

uniform float time;
uniform float amplitudeFloor;
uniform float amplitudeRoof;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 vNormal, vTangent, vBinormal;
varying vec3 vPosition;

void main() {

	vPosition = position;
    vUv = uv;

    vec3 edges = mix( vec3( 3.0 ), vec3(5.0), smoothstep( 0.0, 1.0, vPosition.x ) );

    float easing = 0.8;
    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));

	vNormal = normalize( normalMatrix * normal );

	vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), (time * easing + 2.0)))); 
    vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing + 2.0)));

	gl_Position = projectionMatrix * modelViewMatrix * vec4( edges * normal + vPosition, 1.0);

	float d = 3.3 * sin( time * 3. + vPosition.y * 5.);									

	vertPos = ( modelViewMatrix * vec4( normal + position, 1.0) ).xyz;

}