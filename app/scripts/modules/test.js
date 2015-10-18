let glslify = require('glslify');

class Test {


  constructor( scene, emitter, options = {} ) {

		this.scene = scene;

		this.emitter = emitter;

		this.particlesCount = 10000;

        this.radius = 10;
        this.widthSegments = 50;
        this.heightSegments = 50;
        this.amplitude = 2;

        this.vertexShader = glslify('../../vertex-shaders/test.vert');

        this.fragmentShader = glslify('../../fragment-shaders/test.frag');

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
            // wireframe: true
        });


        let geometry = new THREE.SphereGeometry( this.radius, this.widthSegments, this.heightSegments );
        // let geometry = new THREE.PlaneGeometry( this.radius, this.radius, this.widthSegments, this.heightSegments );
		    // this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

		    this.geometry = geometry;

        this.geometry.dynamic = true;

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        // this.mesh.rotation.x = -1.55;

        this.clock = Date.now();

        // this.scene.add( this.mesh );

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

      if ( this.amplitude > 20 ) {
        this.amplitude = 20;
      }

    }

  	this.material.uniforms["time"].value = ( Date.now() - this.clock ) * 0.0008;

  }

  addGUI() {

  	this.GUI = new dat.GUI();

  	this.GUI.add( this, 'radius' );

  	this.GUI.add( this, 'widthSegments' );

  	this.GUI.add( this, 'heightSegments' );

  }

  getMesh() {

  	return this.mesh;

  }

}

export { Test };