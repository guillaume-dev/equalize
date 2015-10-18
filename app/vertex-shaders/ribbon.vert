
uniform float time;
varying vec3 vNormal;
uniform float zoom;
varying float vari;
varying float timevariance;

void main() {

    timevariance = 1000.0;
    vari = 2000.0;
    float normalRatioRange = 10.0;

    float id;               

    vNormal = normal;

    vec3 newpos = vec3(position.x, position.y , position.z  );   

    gl_Position = projectionMatrix * modelViewMatrix *  vec4( normal * normalRatioRange  + newpos, 1.0);

    // gl_Position = projectionMatrix * modelViewMatrix *  vec4( position, 1.0 );      
}