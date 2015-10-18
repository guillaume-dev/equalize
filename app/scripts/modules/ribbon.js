let glslify = require('glslify');

class Ribbon {

  constructor( scene, emitter ) {

    this.scene = scene;
    
    this.startPoint = new THREE.Vector3( -20, 0, 0 );

    this.endPoint = new THREE.Vector3( 40, 5, 0 );

    this.segments = 30;

    this.vertexShader = glslify('../../vertex-shaders/ribbon.vert');

    this.fragmentShader = glslify('../../fragment-shaders/simple.frag');

    this.planeGeometry = new THREE.PlaneGeometry( 1, 1, 1, this.segments );

    this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
                opacity: { type: "f", value: 1.0 },
                endpoint: { type: "v3", value: this.endPoint }
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            wireframe: true
        });

    var numPoints = 100;

    let spline = new THREE.CatmullRomCurve3([
       new THREE.Vector3(-20, -10, 0),
       new THREE.Vector3(-10, -10, 0),
       new THREE.Vector3(-5, -7, 0),
       new THREE.Vector3(0, -10, 0),
       new THREE.Vector3(5, -7, 0),
       new THREE.Vector3(10, -10, 0),
       new THREE.Vector3(20, -10, 0),
    ]);

    this.geometry = new THREE.Geometry();
    var splinePoints = spline.getPoints(numPoints);

    for(var i = 0; i < splinePoints.length; i++){
        this.geometry.vertices.push(splinePoints[i]);  
    }

    var material = new THREE.LineBasicMaterial({
      color: 0xff00f0,
  });

    this.mesh = new THREE.Line( this.geometry, material );

    // this.mesh.position.x = this.startPoint.x;
    // this.mesh.position.y = this.startPoint.y;
    // this.mesh.position.z = this.startPoint.z;

    this.clock = Date.now();

    this.scene.add( this.mesh );

  }

  getMesh() {

        return this.mesh;

  }

  update( soundData ) {

    
  }

  getDistance( v1, v2 ) {

    return Math.sqrt( ( v1.x - v2.x ) * ( v1.x - v2.x ) + ( v1.y - v2.y ) * ( v1.y - v2.y ) );

  }
}

export { Ribbon };
