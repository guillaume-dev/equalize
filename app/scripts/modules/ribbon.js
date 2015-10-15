let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Ribbon {

	constructor( scene, emitter ) {

		this.scene = scene;
		
		this.startPoint = new THREE.Vector3( 0, 0, -10 );

		this.endPoint = new THREE.Vector3( 0, Math.random() * 40, -100 );

		this.segments = 30;

		this.vertexShader = glslify('../../vertex-shaders/ribbon.vert');

        this.fragmentShader = glslify('../../fragment-shaders/ribbon.frag');

		this.planeGeometry = new THREE.PlaneGeometry( 1, 1, 1, this.segments );

		this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
                finalDest: { type: "v3", value: new THREE.Vector3( 0, 40, -100 ) }
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            wireframe: true
        });

		this.planeGeometry.verticesNeedUpdate = true;

		this.geometry = new THREE.BufferGeometry().fromGeometry( this.planeGeometry );
		
		this.mesh = new THREE.Mesh( this.geometry, this.material );

		this.mesh.position.z = this.startPoint.z;

		this.clock = Date.now();

		this.scene.add( this.mesh );

	}

	getMesh() {

        return this.mesh;

    }

	update( soundData ) {

		this.material.uniforms["time"].value = Date.now() - this.clock;
		this.material.uniforms["finalDest"].value = new THREE.Vector3( 0, 40, -100 );
		
	}
}

export { Ribbon };
