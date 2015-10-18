#pragma glslify: cnoise = require(./classicnoise4D)

uniform float time;
uniform float amplitude;
uniform sampler2D texture;

varying float vAmount;
varying vec2 vUv;
varying vec3 vertPos;
varying vec3 vNormal, vTangent, vBinormal;
varying vec3 vPosition;
varying vec3 fPosition;

void main() {

	vUv = uv;

	vPosition = position;
	vec4 _pause = vec4( position, 1.0 )  * modelViewMatrix;
	fPosition = vec3( _pause.x, _pause.y, _pause.z );
	vNormal = normalize( normalMatrix * normal );

	float easing = 0.08;
    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));
    float size = 2.0;
    float magnitude = 25.0;

 //    vec3 v = vPosition;


 //    vec3 edges = mix( vec3( 3.0 ), vec3(5.0), smoothstep( 0.0, 1.0, v.x ) );


	// tangent space vectors for normal mapping
	// vNormal = normalize( normalMatrix * normal );
	// vTangent = normalize( normalMatrix * position );
	// vBinormal = normalize( cross( normal, vTangent ) );

	// vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), time * 0.8))); 
    // vPosition.x += (cnoise_1_4(vec4(vec3(vPosition), time * 0.8)));
    // vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time * easing)));

 //    vPosition.x *= cos( dist / size + ( time ) ) * amplitude;
 //    vPosition.y *= sin( dist / size + ( time ) ) * amplitude;
    // vPosition.z *= sin( dist / size + ( time ) ) * amplitude;

	// deform mesh by the distance from the edge
	// gl_Position = projectionMatrix * modelViewMatrix * vec4( edges * normal + vPosition, 1.0);

	vec4 bumpData = texture2D( texture, uv );
	
	vAmount = bumpData.r; // assuming map is grayscale it doesn't matter if you use r, g, or b.
	
	// move the position along the normal
    vec3 newPosition = vPosition + normal * amplitude * vAmount;
	
	// gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );

	// float d = 3.3 * sin( time * 3.+ vPosition.y * 5.);									
 //  	// gl_Position.x += vec4(normal * d, 1. ).x;

	// vertPos = ( modelViewMatrix * vec4( normal + position, 1.0) ).xyz;

	// gl_Position  = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

    // vec4 outPosition = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    // outPosition.y += (cnoise_1_4(vec4(vec3(outPosition), (time * easing)))); 
    // outPosition.z += (cnoise_1_4(vec4(vec3(outPosition), time * easing)));
    // gl_Position = outPosition;

    // vPositionW = vec3(projectionMatrix * vec4(position, 1.0));
    // vNormalW = normalize(vec3(projectionMatrix * vec4(normal, 0.0)));

	gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0);

}