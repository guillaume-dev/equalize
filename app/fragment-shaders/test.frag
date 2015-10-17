precision mediump float;

varying vec3 vNormal;
varying vec3 vertPos;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec2 vUv;
varying vec3 vPosition;
const vec3 lightPos = vec3(150.0);
const vec3 diffuseColor = vec3( 226.0 / 255.0, 92.0  / 255.0, 254.0 / 255.0);
const vec3 specColor = vec3(0.2);

uniform vec2 mouse;

float hash( float n )
{
    return fract(sin(n)*43758.5453);
}

vec2 hash( vec2 p )
{
    p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
    return fract(sin(p)*43758.5453);
}

/** 
 * bump mapping aware phong shading 
 *
 * @param 'normal' { vec3 }     - fragment normal
 * @param 'light' { vec3 }      - light position
 * @param 'position' { vec3 }   - fragment position
 * @param 'diffuse' { vec3 }    - diffuse color
 * @param 'spec' { vec3 }       - specular color
 * @return { vec3 }             - phong color 
 */
vec3 phong( in vec3 tanNormal, in vec3 normal, in vec3 light, in vec3 position, in vec3 diffuse, in vec3 spec)
{
    vec3 lightDir = normalize(light - position);
    vec3 reflectDir = reflect( -lightDir, tanNormal);
    vec3 viewDir = normalize( - position );
    float lambertian = max( dot( lightDir, normal ), 0.0 );
    float specular;

    if( lambertian > 0.0 ) {
        float specAngle = max( dot( reflectDir, viewDir ), 0.01 );
        specular = pow(specAngle, 4.0);
    }
    return lambertian * diffuse + specular * spec;
}

void main( void )
{

    // vec3 v = voronoi( 16.0 * vUv );
    vec3 v = vPosition;
    vec3 edges = mix( diffuseColor, 2.5 * diffuseColor, smoothstep( 0.0, 1.5, v.x ) );

    // convert the normal maps (in tangent-space) to eye-space
    vec3 tanNormal = normalize( (vTangent * v.x) + (vBinormal * v.y) + (vNormal * v.z) );

    vec3 diff = phong( tanNormal, vNormal, vec3(mouse,100.0), vertPos, edges, specColor);
    // gl_FragColor = vec4(cells,1.0) + edges * vec4(diff,1.0);
    gl_FragColor = vec4(diff,1.0);

	// gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);

}