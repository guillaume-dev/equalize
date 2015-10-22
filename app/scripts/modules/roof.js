let glslify = require('glslify');

class Roof {

  constructor( scene, emitter, options = {}) {

        this.scene = scene;
        this.emitter = emitter;
        this.size = 150;
        this.widthSegments = 350;
        this.heightSegments = 350;
        this.amplitude = 3;
        
        this.vertexShader = glslify('../../vertex-shaders/roof.vert');

        this.fragmentShader = glslify('../../fragment-shaders/roof.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                "time": { type: "f", value: 0 },
                "amplitude": { type: "f", value: this.amplitude },
                "resolution": { type: "v2", value: new THREE.Vector2( window.innerWidth, window.innerHeight ) },
            },
            side: THREE.DoubleSide,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            transparent: true,
            wireframe: false
        });

        this.geometry = new THREE.PlaneGeometry( this.size, this.size, this.widthSegments, this.heightSegments );

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.mesh.position.y = 5;
        
        this.mesh.rotation.x = 1.4;
        this.mesh.rotation.z = -1.2;

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

      if ( frequence < 15 ) {
        this.amplitude += 0.3;
      } else {
        this.amplitude -= 0.09;
      }

      if ( this.amplitude < 0 ) {
        this.amplitude = 0;
      }

      if ( this.amplitude > 8 ) {
        this.amplitude = 8;
      }
    }

    this.material.uniforms["amplitude"].value = this.amplitude;
    this.material.uniforms["time"].value = ( Date.now() - this.clock ) * 0.0008;

  }

  getMesh() {

    return this.mesh;

  }

}

export { Roof };