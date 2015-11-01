let glslify = require('glslify');

class Blob {

  constructor( scene, emitter ) {

		this.scene = scene;
		this.emitter = emitter;

    this.radius = 5;
    this.widthSegments = 175;
    this.heightSegments = 175;
    this.amplitudeFloor = 8;
    this.amplitudeRoof = 8;
    this.active = false;

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
        transparent: true,
        opacity: 0
    });


    let geometry = new THREE.SphereGeometry( this.radius, this.widthSegments, this.heightSegments );
    this.geometry = geometry;

    this.mesh = new THREE.Mesh( this.geometry, this.material );

    this.mesh.position.y = -2.4;
    this.mesh.rotation.x = 6.4;


  }

  start() {

    this.active = true;
    this.clock = Date.now();
    this.scene.add( this.mesh );

  }

  update( frequence ) { 

  	if ( !this.active ) return;

    if ( frequence ) {

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

      if ( frequence > 5 && frequence < 9 ) {
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

    if ( this.mesh.material.opacity < 1 ) {
      this.mesh.material.opacity += 0.01;
    }
  }

  getMesh() {

  	return this.mesh;

  }

}

export { Blob };