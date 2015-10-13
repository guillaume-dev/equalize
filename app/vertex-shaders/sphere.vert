
#pragma glslify: cnoise = require(./classicnoise3D)

float turbulence( vec3 p ) {
	float w = 100.0;
	float t = -.5;
	for (float f = 1.0 ; f <= 10.0 ; f++ ){
		float power = pow( 2.0, f );
		t += abs( pnoise_1_5( vec3( power * p ), vec3( 10.0, 10.0, 10.0 ) ) / power );
	}
	return t;
}

float f( vec3 p ) {
	return pnoise_1_5( vec3( p ), vec3( 10.0, 10.0, 10.0 ) );
	return pnoise_1_5( 8.0 * vec3( p ), vec3( 10.0, 10.0, 10.0 ) );
}

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vReflect;
varying float ao;
varying vec3 vPosition;
uniform float time;
uniform float weight;
uniform float size;
uniform float opacity;


float fround( float value ) {
	return floor( value + 0.5 );
}

vec3 v3round( vec3 value ) {
	return vec3( fround( value.x ), fround( value.y ), fround( value.z ) );
}

void main() {

	vec3 evNormal = normal;
	vec3 aniNormal = 2.0 * evNormal + time;
	float f0 = weight * f( aniNormal );
	float fx = weight * f( aniNormal + vec3( .0001, 0.0, 0.0 ) );
	float fy = weight * f( aniNormal + vec3( 0.0, .0001, 0.0 ) );
	float fz = weight * f( aniNormal + vec3( 0.0, 0.0, .0001 ) );
	vec3 modifiedNormal = normalize( evNormal - vec3( (fx - f0) / .0001, (fy - f0) / .0001, (fz - f0) / .0001 ) );

	if( weight > 0.0 ) {
	ao = f0 / weight;
	} else {
	ao = 0.0;
	}
	vNormal = modifiedNormal;
	vUv = uv;
	vec3 newPosition = position + f0 * evNormal;
	vec3 nWorld = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * modifiedNormal );
	vReflect = normalize( reflect( normalize( newPosition.xyz - cameraPosition ), nWorld ) );

	vec4 v = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
	vPosition = newPosition;

	gl_Position = v;

}