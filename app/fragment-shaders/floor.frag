
varying vec3 vNormal;
varying vec3 vertPos;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec2 vUv;
varying vec3 vPosition;
const vec3 lightPos = vec3(0.0, 150.0, 0.0);
const vec3 diffuseColor = vec3( 0.0, 0.3, 0.6);
const vec3 specColor = vec3(0.2);

uniform vec2 mouse;
uniform vec2 resolution;
uniform float amplitude;
uniform float time;

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

float rand(float x)
{
    return fract(sin(x) * 4358.5453123);
}

float rand(vec2 co)
{
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5357);
}

float box(vec2 p, vec2 b, float r)
{
  return length(max(abs(p)-b,0.0))-r;
}



vec3 blob(vec2 uv, vec3 color, vec2 speed, vec2 size, float time) {
    vec2 point = vec2(
        sin(speed.x * time) * size.x,
        cos(speed.y * time) * size.y
    );

    float d = 1.0 / distance(uv, point);
    d = pow(d / 6.5, 2.0);
    
    return vec3(color.r * d, color.g * d, color.b * d);
}

void main( void )
{

    vec3 v = vPosition;

    vec3 edges = mix( diffuseColor, 2.5 * diffuseColor, smoothstep( 0.0, 1.5, v.x ) );

    vec3 tanNormal = normalize( (vTangent * v.x) + (vBinormal * v.y) + (vNormal * v.z) );

    vec3 diff = phong( tanNormal, vNormal, vec3(mouse,100.0), vertPos, edges, specColor);

    float opacity = ( gl_FragCoord.x + 0.5 ) / gl_FragCoord.x;

    float pulse = 1.0;

    vec2 uv = gl_FragCoord.xy / resolution.xy - 0.5;
    diff += pulse * diffuseColor * 0.5 * ( 0.9 - cos(uv.x * 4.0) );
    diff -= rand(uv) * 0.04;

    //////////////////////////
    //  Rim lighting shader //
    //////////////////////////

/*     vec3 veye = normalize(-vPosition);       
       
    float vdn = 0.9 + dot(veye, vNormal);        // the rim contribution

    if(vdn < 0.4) {
        discard;
    }

    float rim = smoothstep(0.5, 1.0, vdn);

    gl_FragColor = vec4(vec3(clamp(rim, 0.0, 1.0) * 1.0 * diffuseColor), 1.0);
 */
    vec3 veye = normalize(-vPosition);       
       
    float vdn = 0.9 + dot(veye, vNormal);        // the rim contribution

    if( vdn < 0.2 ) {
        discard;
    }

    float rim = smoothstep(-0.5, 1.5, vdn);

    gl_FragColor = vec4(vec3(clamp(rim, 0.0, 1.0) * 1.0 * diffuseColor), 1.0);
}