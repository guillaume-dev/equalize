let glslify = require('glslify');

class Roof {


  constructor( scene, emitter, options = {}) {

        this.scene = scene;

        this.emitter = emitter;

        this.particlesCount = 10000;

        this.radius = 300;
        this.widthSegments = 25;
        this.heightSegments = 25;
        this.amplitude = 3;
        
        this.vertexShader = glslify('../../vertex-shaders/floor.vert');

        this.fragmentShader = glslify('../../fragment-shaders/roof.frag');

        let texture = THREE.ImageUtils.loadTexture( "images/map.png" );
        // let texture = THREE.ImageUtils.loadTexture( "images/map.jpg" );

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
            wireframe: false
        });

        let geometry = new THREE.PlaneGeometry( this.radius, this.radius, this.widthSegments, this.heightSegments );

        this.geometry = geometry;

        this.geometry.dynamic = true;

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.mesh.position.y = 37.5;
        this.mesh.position.z = -28;

        this.mesh.rotation.x = 1.4;
        this.mesh.rotation.z = -0.7;


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

      if ( this.amplitude < 1 ) {
        this.amplitude = 2;
      }

      if ( this.amplitude > 20 ) {
        this.amplitude = 20;
      }

    }

    this.material.uniforms["time"].value = ( Date.now() - this.clock ) * 0.0008;

  }

  getMesh() {

    return this.mesh;

  }

}

export { Roof };