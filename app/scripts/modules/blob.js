let glslify = require('glslify');

class Blob {

  constructor( scene, emitter ) {

		this.scene = scene;

		this.emitter = emitter;

		this.particlesCount = 10000;

        this.radius = 1;
        this.widthSegments = 175;
        this.heightSegments = 175;
        this.amplitudeFloor = 8;
        this.amplitudeRoof = 8;

        this.vertexShader = glslify('../../vertex-shaders/blob.vert');

        this.fragmentShader = glslify('../../fragment-shaders/blob.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                "time": { type: "f", value: 0 },
                "amplitudeFloor": { type: "f", value: this.amplitudeFloor },
                "amplitudeRoof": { type: "f", value: this.amplitudeRoof }
            }, 
            side: THREE.DoubleSide,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            transparent: true
        });


        let geometry = new THREE.SphereGeometry( this.radius, this.widthSegments, this.heightSegments );
		    this.geometry = geometry;

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.mesh.position.y = -2.4;
        this.mesh.rotation.x = 6.4;

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

      let frequence = Math.abs( average - 128 ) * 10;

      if ( frequence > 15 ) {
        this.amplitudeFloor += 0.1;
      } else {
        this.amplitudeFloor -= 0.09;
      }

      if ( this.amplitudeFloor < 0 ) {
        this.amplitudeFloor = 0;
      }

      if ( this.amplitudeFloor > 8 ) {
        this.amplitudeFloor = 8;
      }

      if ( frequence < 15 ) {
        this.amplitudeRoof += 0.3;
      } else {
        this.amplitudeRoof -= 0.09;
      }

      if ( this.amplitudeRoof < 0 ) {
        this.amplitudeRoof = 0;
      }

      if ( this.amplitudeRoof > 8 ) {
        this.amplitudeRoof = 8;
      }

    }

    this.material.uniforms["time"].value = ( Date.now() - this.clock ) * 0.0008;
    this.mesh.material.uniforms[ 'amplitudeFloor' ].value = this.amplitudeFloor;
    this.mesh.material.uniforms[ 'amplitudeRoof' ].value = this.amplitudeRoof;

  }

  getMesh() {

  	return this.mesh;

  }

}

export { Blob };