let glslify = require('glslify');

class Test {


  constructor( scene, emitter, options = {} ) {

		this.scene = scene;

		this.emitter = emitter;

		this.particlesCount = 10000;

        this.radius = 1;
        this.widthSegments = 32;
        this.heightSegments = 32;

        this.vertexShader = glslify('../../vertex-shaders/test.vert');

        this.fragmentShader = glslify('../../fragment-shaders/test.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 }
            },
            side: THREE.DoubleSide,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            transparent: true
        });

        let geometry = new THREE.SphereGeometry( this.radius, this.widthSegments, this.heightSegments );

		// this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

		this.geometry = geometry;

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        // this.mesh.position.z = -10;

        this.clock = Date.now();

        this.scene.add( this.mesh );

  }

  update( ts ) {


  	this.material.uniforms["time"].value = ( Date.now() - this.clock ) * 0.0008;

  }

  addGUI() {

  	this.GUI = new dat.GUI();

  	this.GUI.add( this.geometry.parameters, 'radius' );

  	this.GUI.add( this.geometry.parameters, 'widthSegments' );

  	this.GUI.add( this.geometry.parameters, 'heightSegments' );
  }

  getMesh() {

  	return this.mesh;

  }

}

export { Test };