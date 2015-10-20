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
    float easing = 0.8;
    float dist = distance( vec2(vPosition.x, vPosition.y), vec2( 25.0, -30.0 ) );
    float size = 2.0;
    float magnitude = 25.0;

    vNormal = normalize( normalMatrix * normal );
    vTangent = normalize( normalMatrix * position );
    vBinormal = normalize( cross( normal, vTangent ) );

    if ( dist < 30.0 ) {
        //vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), (time * easing)))); 
        //vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));
        ///vPosition.x *= cos( dist / size + ( time / 5000.0 ) ) * amplitude;
        //vPosition.z *= sin( dist / size + ( time / 5000.0 ) ) * amplitude;
    }

	// deform mesh by the distance from the edge
	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0);

	float d = 3.3 * sin( time * 3. + vPosition.y * 5.);									

	vertPos = ( modelViewMatrix * vec4( normal + position, 1.0) ).xyz;

}