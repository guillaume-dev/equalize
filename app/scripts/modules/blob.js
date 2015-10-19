import { Utils } from './utils';

let glslify = require('glslify');
let utils = new Utils();

class Blob {

  constructor( scene, emitter ) {

		this.scene = scene;

		this.emitter = emitter;

		this.particlesCount = 10000;

        this.radius = 1;
        this.widthSegments = 175;
        this.heightSegments = 175;
        this.amplitude = 2;

        this.vertexShader = glslify('../../vertex-shaders/blob.vert');

        this.fragmentShader = glslify('../../fragment-shaders/blob.frag');

        // let texture = THREE.ImageUtils.loadTexture( "images/noisebw.png" );
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set( 4, 4 );

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                "time": { type: "f", value: 0 },
                "amplitude": { type: "f", value: this.amplitude },
                "resolution": { type: "v2", value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
                // texture: { type: "t", value: texture }
            }, 
            side: THREE.DoubleSide,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            transparent: true
        });


        let geometry = new THREE.SphereGeometry( this.radius, this.widthSegments, this.heightSegments );
        // let geometry = new THREE.CircleGeometry( this.radius, this.widthSegments );
		    this.geometry = geometry;

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.mesh.rotation.x = 6;
        this.mesh.rotation.y = -5.8;
        this.mesh.rotation.z = 1.3;

        this.clock = Date.now();

        this.scene.add( this.mesh );

  }

  update( soundData ) { 

  	

    if ( soundData ) {

      let time = soundData.time;
      let average = 0;

      for(var i = 0; i < time.length; i++) {
          average += time[ i ];
      }

      average /= 512;

      let frequence = Math.abs( average - 128 );

      if ( frequence > 15 ) {
        this.amplitude += 0.09;
      } else {
        this.amplitude -= 0.01;
      }

      if ( this.amplitude < 2 ) {
        this.amplitude = 2;
      }

      if ( this.amplitude > 8 ) {
        this.amplitude = 8;
      }

      console.log( this.amplitude );
      if ( this.amplitude > 2.5 ) {
        this.emitter.emit( "zoomOut" );
      } else if ( this.amplitude < 2.2 ) {
        this.emitter.emit( "zoomIn" );
      }

      

    }

    this.material.uniforms["time"].value = ( Date.now() - this.clock ) * 0.0008;
    this.mesh.material.uniforms[ 'amplitude' ].value = this.amplitude;

  }

  setPosition(x, y, z) {

    this.mesh.position.x = x;
    this.mesh.position.y = y;
    this.mesh.position.z = z;

  }

  getMesh() {

  	return this.mesh;

  }

}

export { Blob };