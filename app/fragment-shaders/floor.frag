const vec3 diffuseColor = vec3( 0.0, 0.3, 0.6);
const vec3 basicColor = vec3( 1.0, 1.0, 1.0);

varying vec2 vUv;
varying vec3 vPosition;
varying float z;

uniform float amplitude;
uniform float time;

float distMax = 30.0;
vec3 color;

void main( void )
{

    vec3 v = vPosition;
                   
    float alpha = 1.0;

    float dist = distance( vec2(vPosition.x, vPosition.y), vec2( 0.0, 0.0 ) );

    if ( dist < distMax ) {

        color = clamp( (amplitude * 0.008 * time), 0.5, 1.0 ) * diffuseColor * ( abs( dist - distMax ) / distMax ) * 3.14;

    } else {
        /* alpha = sin(vUv.y * 3.14) / 2.0;
        color = diffuseColor; */
        discard;
    }

    gl_FragColor = vec4(color, alpha);

}