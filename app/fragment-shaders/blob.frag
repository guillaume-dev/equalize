uniform vec2 resolution;
uniform float amplitudeFloor;
uniform float amplitudeRoof;
uniform float time;

const vec3 diffuseColor = vec3( 0.0, 0.3, 0.6);
const vec3 secondColor = vec3( 226.0 / 255.0, 92.0  / 255.0, 254.0 / 255.0);

varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vNormal;

void main( void )
{

    vec3 v = vPosition;

    //////////////////////////
    //  Rim lighting shader //
    //////////////////////////

    vec3 veye = normalize(vPosition);       
       
    float vdn = 0.9 + dot(veye, vNormal);   
    float invertedRoof = abs( amplitudeRoof - 8.0 );
    float invertedFloor = abs( amplitudeFloor - 8.0 );
    float letBlackRoof =  abs( ( invertedRoof  * abs( (0.1 - 0.3) - 0.1 ) ) / 8.0) + 0.1;
    float letBlackFloor = abs( ( invertedFloor * abs( (0.1 - 0.3) - 0.1 ) ) / 8.0) + 0.1;


    if(vdn < letBlackFloor) {
        discard;
    }

    float rim = smoothstep(0.0, 1.0, vdn);

    float dist = distance( vec2(1.00, 1.00), vec2( 0.0, 0.0 ) );

    vec3 color = clamp( (amplitudeFloor * 0.008 * time), 0.5, 1.0 ) * vec3(clamp(rim, 0.0, 1.0) * 1.0 * diffuseColor) * ( abs( dist - 30.0 ) / 30.0 ) * 3.14;
    
    if ( vPosition.y > 0.0 ) {
        color = clamp( (amplitudeRoof * 0.008 * time), 0.5, 1.0 ) * vec3(clamp(rim, 0.0, 1.0) * 1.0 * secondColor) * ( abs( dist - 30.0 ) / 30.0 ) * 3.14;
        
        if(vdn < letBlackRoof) {
            discard;
        }

    }

    gl_FragColor = vec4(color, 1.0);
}