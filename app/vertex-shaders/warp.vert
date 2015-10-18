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

    float easing = 0.8;
    float dist = distance(vec2(vPosition.x, vPosition.y), vec2(0, 0));
    float size = 2.0;
    float magnitude = 25.0;

    vec3 v = vPosition;


    vec3 edges = mix( vec3( 3.0 ), vec3(5.0), smoothstep( 0.0, 1.0, v.x ) );


    // tangent space vectors for normal mapping
    vNormal = normalize( normalMatrix * normal );
    vTangent = normalize( normalMatrix * position );
    vBinormal = normalize( cross( normal, vTangent ) );

    vPosition.y += (cnoise_1_4(vec4(vec3(vPosition), time))); 
    vPosition.x += (cnoise_1_4(vec4(vec3(vPosition), time)));
    vPosition.z += (cnoise_1_4(vec4(vec3(vPosition), time)));

    vPosition.x *= cos( dist / size + ( time ) ) * amplitude;
    vPosition.y *= sin( dist / size + ( time ) ) * amplitude;
    vPosition.z *= sin( dist / size + ( time ) ) * amplitude;

    gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 1.0);



}