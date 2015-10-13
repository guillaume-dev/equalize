attribute vec3 initial;
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

  vPosition = position;
  vUv = uv;

  float x = position.x;
  float y = position.y;
  float initx = initial.x;
  float inity = initial.y;
  float easing = 0.8;

  float plusOrMinus = rand( vec2( position.x, position.y ) ) > 0.5 ? 0.09 : -0.09;

  vPosition.x += ((initx - x) * easing) + plusOrMinus;
  vPosition.y += ((inity - y) * easing) + plusOrMinus;

  gl_Position = projectionMatrix * modelViewMatrix * vec4( vPosition, 0.2);

}

