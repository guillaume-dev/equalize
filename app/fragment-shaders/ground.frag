uniform float time;
varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vNormal;
uniform float opacity;
vec3 vColor;

float rand(vec2 co){
  return fract(sin(dot(co.xy,vec2(12.9898,78.233)))* 43758.5453);
}

void main() {

	float green = 192.0 / 255.0;
    float blue = 158.0 / 255.0;

    vec3 light = vec3(0.0, green, blue);

    light = normalize(light);

    float dProd = max(0.1, dot(vNormal, light));

    vColor = vec3( dProd, dProd, dProd );

    float h = sqrt( abs( vPosition.x ) / 100.0 );

    float opac = pow( 1.0 - abs( h ), 2.0 ) * opacity;

    float rnd = rand( vNormal.xy + vColor.xy );

    gl_FragColor = vec4(
      vColor,
      clamp( pow(opac, 1.8) * rnd, 0.0, opacity)
    );

	// gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0 );
	
}

