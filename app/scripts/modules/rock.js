import { Utils } from './utils';

let glslify = require('glslify');
let utils = new Utils();

class Rock {

  constructor( scene, emitter ) {

    this.scene = scene;
    
    let fall = utils.randomRange( -10, -15 );

    this.startPoint = new THREE.Vector3( fall, 10, 0 );

    this.endPoint = new THREE.Vector3( fall, -30, 0 );

    this.easing = 0.0008;

    this.radius = Math.random();
    this.widthSegments = 175;
    this.heightSegments = 175;
    this.amplitude = 3;

    this.segments = 30;

    this.vertexShader = glslify('../../vertex-shaders/simple.vert');

    this.fragmentShader = glslify('../../fragment-shaders/simple.frag');

    this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
                opacity: { type: "f", value: 1.0 },
                endpoint: { type: "v3", value: this.endPoint }
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            // wireframe: true
        });


    let geometry = new THREE.SphereGeometry( this.radius, 2, 2 );

    this.geometry = geometry;

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.mesh.position.x = this.startPoint.x;
    this.mesh.position.y = this.startPoint.y;
    this.mesh.position.z = this.startPoint.z;

    this.object = 

    this.clock = Date.now();

    this.scene.add( this.mesh );

  }

  getMesh() {

        return this.mesh;

  }

  update( soundData ) {

    this.mesh.position.y += ( this.endPoint.y - this.mesh.position.y ) * 0.001; 
    this.mesh.rotation.x -= 0.01; 
    
  }
}

export { Rock };
