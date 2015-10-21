varying vec3 vNormal;
varying vec3 vertPos;
varying vec3 vTangent;
varying vec3 vBinormal;
varying vec2 vUv;
varying vec3 vPosition;
const vec3 lightPos = vec3(150.0);
// purple
// const vec3 diffuseColor = vec3( 226.0 / 255.0, 92.0  / 255.0, 254.0 / 255.0);
// green
// const vec3 diffuseColor = vec3( 112.0 / 255.0, 220.0  / 255.0, 194.0 / 255.0);
// blue
// const vec3 diffuseColor = vec3( 0.0, 0.3, 0.6);
const vec3 diffuseColor = vec3( 0.0, 0.0, 0.0);
const vec3 specColor = vec3(0.2);

uniform vec2 mouse;
uniform vec2 resolution;
uniform float time;
uniform float amplitude;
uniform sampler2D texture;

varying vec3 vReflect;
varying vec3 vRefract[3];
varying float vReflectionFactor;

// Lights
varying vec3 vPositionW;
varying vec3 vNormalW;

// Refs
uniform sampler2D textureSampler;


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

float ball(vec2 p, float k, float d) {
    vec2 r = vec2(p.x * k * d, p.y * k * d);    
    return smoothstep(0.0, 1.0, 0.03 / length(r));
}

const mat2 m = mat2( 0.80,  0.60, -0.60,  0.80 );

float noise( vec2 x )
{
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float a = texture2D(texture,(p+vec2(0.5,0.5))/256.0,-32.0).x;
    float b = texture2D(texture,(p+vec2(1.5,0.5))/256.0,-32.0).x;
    float c = texture2D(texture,(p+vec2(0.5,1.5))/256.0,-32.0).x;
    float d = texture2D(texture,(p+vec2(1.5,1.5))/256.0,-32.0).x;
    return mix(mix( a, b,f.x), mix( c, d,f.x),f.y);
}

const mat2 mtx = mat2( 0.80,  0.60, -0.60,  0.80 );

float fbm4( vec2 p )
{
    float f = 0.0;

    f += 0.5000*(-1.0+2.0*noise( p )); p = mtx*p*2.02;
    f += 0.2500*(-1.0+2.0*noise( p )); p = mtx*p*2.03;
    f += 0.1250*(-1.0+2.0*noise( p )); p = mtx*p*2.01;
    f += 0.0625*(-1.0+2.0*noise( p ));

    return f/0.9375;
}

float fbm6( vec2 p )
{
    float f = 0.0;

    f += 0.500000*noise( p ); p = mtx*p*2.02;
    f += 0.250000*noise( p ); p = mtx*p*2.03;
    f += 0.125000*noise( p ); p = mtx*p*2.01;
    f += 0.062500*noise( p ); p = mtx*p*2.04;
    f += 0.031250*noise( p ); p = mtx*p*2.01;
    f += 0.015625*noise( p );

    return f/0.96875;
}

float func( vec2 q, out vec2 o, out vec2 n )
{
    float ql = length( q );
    q.x += 0.05*sin(0.11*time+ql*4.0);
    q.y += 0.05*sin(0.13*time+ql*4.0);
    q *= 0.7 + 0.2*cos(0.05*time);

    q = (q+1.0)*0.5;

    o.x = 0.5 + 0.5*fbm4( vec2(2.0*q*vec2(1.0,1.0)          )  );
    o.y = 0.5 + 0.5*fbm4( vec2(2.0*q*vec2(1.0,1.0)+vec2(5.2))  );

    float ol = length( o );
    o.x += 0.02*sin(0.11*time*ol)/ol;
    o.y += 0.02*sin(0.13*time*ol)/ol;


    n.x = fbm6( vec2(4.0*o*vec2(1.0,1.0)+vec2(9.2))  );
    n.y = fbm6( vec2(4.0*o*vec2(1.0,1.0)+vec2(5.7))  );

    vec2 p = 4.0*q + 4.0*n;

    float f = 0.5 + 0.5*fbm4( p );

    f = mix( f, f*f*f*3.5, f*abs(n.x) );

    float g = 0.5+0.5*sin(4.0*p.x)*sin(4.0*p.y);
    f *= 1.0-0.5*pow( g, 8.0 );

    return f;
}

float funcs( in vec2 q )
{
    vec2 t1, t2;
    return func(q,t1,t2);
}


void main( void )
{

    vec2 p = gl_FragCoord.xy / resolution.xy;
    vec2 q = (-resolution.xy + 2.0 * gl_FragCoord.xy) /resolution.y;
    
    vec2 o, n;
    float f = func(q, o, n);
    vec3 col = vec3(1.0);


    // col = mix( vec3(0.2,0.1,0.4), vec3(0.3,0.05,0.05), f );
    // col = mix( col, vec3(0.9,0.9,0.9), dot(n,n) );
    col = mix( col, diffuseColor, dot(n,n) );
//     col = mix( col, vec3(0.5,0.2,0.2), 0.5*o.y*o.y );
//     col = mix( col, vec3(0.0,0.2,0.4), 0.5*smoothstep(1.2,1.3,abs(n.y)+abs(n.x)) );
//     col *= f*2.0;
#if 1
    vec2 ex = vec2( 1.0 / resolution.x, 0.0 );
    vec2 ey = vec2( 0.0, 1.0 / resolution.y );
    vec3 nor = normalize( vec3( funcs(q+ex) - f, ex.x, funcs(q+ey) - f ) );
#else
    vec3 nor = normalize( vec3( dFdx(f)*resolution.x, 1.0, dFdy(f)*resolution.y ) );  
#endif
    vec3 lig = normalize( vec3( 0.9, -0.2, -0.4 ) );
    float dif = clamp( 0.3+0.7*dot( nor, lig ), 0.0, 1.0 );

    vec3 bdrf;
    bdrf  = vec3(0.85,0.90,0.95)*(nor.y*0.5+0.5);
    bdrf += vec3(0.15,0.10,0.05)*dif;

    bdrf  = vec3(0.85,0.90,0.95)*(nor.y*0.5+0.5);
    bdrf += vec3(0.15,0.10,0.05)*dif;

    // col *= bdrf;
    // col *= amplitude / 255.0;
    // col *= amplitude ;
    // col = vec3(1.0)-col;
    // col = col*col;
    // col *= vec3(1.2,1.25,1.2);
    
    col *= 0.5 + 0.5 * sqrt(16.0*p.x*p.y*(1.0-p.x)*(1.0-p.y));
    
    gl_FragColor = vec4( col, 1.0 );

}