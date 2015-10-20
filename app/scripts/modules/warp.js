let glslify = require('glslify');

class Warp {


  constructor( scene, emitter, options = {} ) {

    this.scene = scene;

    this.emitter = emitter;

    this.particlesCount = 10000;

        this.radius = 150;
        this.widthSegments = 50;
        this.heightSegments = 50;
        this.amplitude = 2;

        this.vertexShader = glslify('../../vertex-shaders/warp.vert');

        this.fragmentShader = glslify('../../fragment-shaders/warp.frag');

        let texture = THREE.ImageUtils.loadTexture( "images/noisebw.png" );
        // let texture = THREE.ImageUtils.loadTexture( "images/texture.jpg" );

        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set( 4, 4 );

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                "time": { type: "f", value: 0 },
                "amplitude": { type: "f", value: this.amplitude },
                "resolution": { type: "v2", value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
                "texture": { type: "t", value: texture },
            },
            side: THREE.DoubleSide,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            transparent: true,
            // wireframe: true
        });


        let geometry = new THREE.PlaneGeometry( this.radius, this.radius, this.widthSegments, this.heightSegments );
        // let geometry = new THREE.PlaneGeometry( this.radius, this.radius, this.widthSegments, this.heightSegments );
        // this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        this.geometry = geometry;

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.mesh.position.y = -56;
        this.mesh.position.z = -50;

        // this.mesh.rotation.x = -0.1; // lying down
        this.mesh.rotation.x = 3.0; // background

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
        this.amplitude += 0.1;
      } else {
        this.amplitude -= 0.01;
      }

      if ( this.amplitude < 2 ) {
        this.amplitude = 2;
      }

      if ( this.amplitude > 4 ) {
        this.amplitude = 4;
      }

    }

    this.mesh.material.uniforms[ 'amplitude' ].value = this.amplitude;
    this.material.uniforms["time"].value = ( Date.now() - this.clock ) * 0.0008;

  }

  getMesh() {

    return this.mesh;

  }

}

export { Warp };