// purple
const vec3 diffuseColor = vec3( 226.0 / 255.0, 92.0  / 255.0, 254.0 / 255.0);
// green
// const vec3 diffuseColor = vec3( 112.0 / 255.0, 220.0  / 255.0, 194.0 / 255.0);
// blue
// const vec3 diffuseColor = vec3( 0.0, 0.3, 0.6);
const vec3 basicColor = vec3( 1.0, 1.0, 1.0);
vec3 color;
float distMax = 30.0;

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;
varying float z;

uniform float amplitude;
uniform float time;

void main( void )
{

    vec3 v = vPosition;
    
    //////////////////////////
    //  Rim lighting shader //
    //////////////////////////

    vec3 veye = normalize(vPosition);       
       
    float vdn = 0.2 + dot(veye, vNormal); 


    float rim = smoothstep(0.0, 1.0, vdn);
                   
    float alpha = 1.0;

    float dist = distance( vec2(vPosition.x, vPosition.y), vec2( 0.0, 0.0 ) );

    if ( dist < distMax ) {

        color = clamp( (amplitude * 0.008 * time), 0.5, 1.0 ) * diffuseColor * ( abs( dist - distMax ) / distMax ) * 3.14;

    } else {
        discard;
    }

    gl_FragColor = vec4(color, alpha);

}