uniform float time;
varying vec3 vPosition;
varying vec2 vUv;

highp float rand(vec2 co)
{
    highp float a = 12.9898;
    highp float b = 78.233;
    highp float c = 43758.5453;
    highp float dt= dot(co.xy ,vec2(a,b));
    highp float sn= mod(dt,3.14);
    return fract(sin(sn) * c);
}

void main()	{

	vec3 position = -1.0 + 2.0 * vPosition;
            
    float red = abs(sin( position.y * clamp( time / 5.0, 191.0 / 255.0, 38.0 / 255.0 )));
    float green = abs(sin( position.y *  clamp( time / 4.0, 209.0 / 255.0, 118.0 / 255.0 )));
    float blue = abs(sin( position.y * clamp( time / 3.0, 228.0 / 255.0, 173.0 / 255.0 ) ));
    
    gl_FragColor = vec4(red, green, blue, abs(sin( position.y * time )) + 0.5 );

}

// #define M_PI 3.1415926535897932384626433832795

// void main()
// {
// 	vec4 temp;

// 	float alpha = sin(vPosition.y * M_PI);
// 	temp = vec4(226.0 / 255.0, 92.0 / 255.0, 254.0 / 255.0, alpha);

// 	gl_FragColor = temp;
// }