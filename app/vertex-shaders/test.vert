#pragma glslify: cnoise = require(./classicnoise4D)

precision mediump float;

uniform float time;

varying vec2 vUv;
varying vec3 vertPos;
varying vec3 vNormal, vTangent, vBinormal;
varying vec3 vPosition;

void main() {

	vUv = uv;

	vPosition = position;

    // voronoi noise
    vec3 v = vPosition;
    vec3 edges = mix( vec3( 3.0), vec3(5.0), smoothstep( 0.0, 1.0, v.x ) );

    float easing = 0.8;

	// tangent space vectors for normal mapping
	vNormal = normalize( normalMatrix * normal );
	vTangent = normalize( normalMatrix * position );
	vBinormal = normalize( cross( normal, vTangent ) );

	vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), (time * easing)))); 
    vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));

	// deform mesh by the distance from the edge
	gl_Position = projectionMatrix * modelViewMatrix * vec4( edges * normal + vPosition, 1.0);

	float d = 3.3 * sin( time * 3.+ vPosition.y * 5.);									
  	// gl_Position.x += vec4(normal * d, 1. ).x;

	vertPos = ( modelViewMatrix * vec4( normal + position, 1.0) ).xyz;

	// gl_Position  = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}