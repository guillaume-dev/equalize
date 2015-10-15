let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Ribbon {

	constructor( scene, emitter ) {

		this.scene = scene;
		
		this.startPoint = new THREE.Vector3( 0, 0, -100 );

		this.endPoint = new THREE.Vector3( 0, Math.random() * 40, -100 );

		this.segments = 30;

		this.vertexShader = glslify('../../vertex-shaders/ribbon.vert');

        this.fragmentShader = glslify('../../fragment-shaders/simple.frag');

		this.planeGeometry = new THREE.PlaneGeometry( 1, 1, 1, this.segments );

		let vertLength = this.planeGeometry.vertices.length;
		let segment = this.segments / 2;

		this.indexes = [];

		for ( let i = 0 ; i < vertLength ; i++) {

			if ( i % 4 == 0 ) {
				segment--;
			}

			let vert = this.planeGeometry.vertices[ i ];

			if ( i % 2 == 0 ) {
				vert.x -= ( segment + 2 ) * 0.02;
			} else {
				vert.x += ( segment + 2 ) * 0.02;
			}

			this.indexes.push( parseFloat( segment + 1 ) );

		};

		this.planeGeometry.verticesNeedUpdate = true;

		console.log( this.indexes );

		this.geometry = new THREE.BufferGeometry().fromGeometry( this.planeGeometry );

        this.geometry.addAttribute( 'bufferindex', new THREE.BufferAttribute( new Float32Array(this.indexes), 1 ) );

		this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0.0 },
                frequency: { type: "f", value: 0.0 },
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
        });

		this.mesh = new THREE.Mesh( this.geometry, this.material );

		this.mesh.position.z = this.startPoint.z;

		

		// for ( let i = 0; i < this.geometry.attributes.position.array.length / 3; i++ ) {

  //           this.indexes[ i ] = parseFloat( i );

  //       }

        // this.geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(this.positions ), 3 ) );


		this.clock = Date.now();

		this.scene.add( this.mesh );

	}

	getMesh() {

        return this.mesh;

    }

	update( soundData ) {



		return;
		let vertLength = this.planeGeometry.vertices.length;
		let segment = this.segments / 2;

		for ( let i = 0 ; i < vertLength ; i++) {

			if ( i % 4 == 0 ) {
				segment--;
			}

			let vert = this.planeGeometry.vertices[ i ];

			// vert.x += ( this.endPoint.x - vert.x ) * ( ( segment + 2 ) * 0.008 );
			vert.y += ( this.endPoint.y - vert.y ) * ( ( segment + 2 ) * 0.008 );
			// vert.z += ( 400 - vert.z ) * ( ( segment + 2 ) * 0.008 );

		};	

		this.planeGeometry.verticesNeedUpdate = true;

		// this.mesh.rotation.y += ( Date.now() - this.clock ) * 0.0008; 
		// this.mesh.rotation.z -= Math.cos( Date.now() - this.clock ); 
		
	}

	randomRange( min, max ) {

		return Math.floor( min + Math.random() * ( max - min ) );

	}

	clone(object){
		return JSON.parse(JSON.stringify(object));
	}

}

export { Ribbon };
