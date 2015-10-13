let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Broken  {

    constructor( scene, emitter ) {

    	this.scene = scene;
    	this.emitter = emitter;
    	this.max = 1000;
    	this.easing = 0.08;

    	this.geometry = new THREE.BufferGeometry();

		this.vertices = new Float32Array( this.max * 3 );
		this.initial = new Float32Array( this.max * 3 );

		for ( let i = 0; i < this.vertices.length; i+=3 ) {

			// let step = (i / this.max);

   //          let x = step * 300;

   //          let y = 0;

   //          let z = -300;
			let x = Math.random() - 0.5;
			let y = Math.random() - 0.5;
			let z = Math.random() - 0.5;
			// let x = ( Math.random() * 1000) - 1000;
			// let y = ( Math.random() * 500) - 500;
			// let z = -500;

			this.vertices[ i ] = x;
			this.vertices[ i + 1 ] = y;
			this.vertices[ i + 2 ] = z; 

		}

		for ( let i = 0; i < this.vertices.length; i += 3 ) {
			this.initial[ i ] = this.vertices[i];
			this.initial[ i + 1 ] = this.vertices[i + 1];
			this.initial[ i + 2 ] = this.vertices[i + 2];
		}

		this.geometry.addAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ) );

		this.geometry.addAttribute( 'initial', new THREE.BufferAttribute( this.initial, 3 ) );

		this.vertexShader = glslify('../../vertex-shaders/broken.vert');

        this.fragmentShader = glslify('../../fragment-shaders/broken.frag');

		this.material = new THREE.ShaderMaterial( {

			uniforms: {
				time: { type: "f", value: 1.0 }
			},
			vertexShader: this.vertexShader,
			fragmentShader: this.fragmentShader,
			side: THREE.DoubleSide,
			transparent: true

		} );

		this.mesh = new THREE.Mesh( this.geometry, this.material );

		this.mesh.position.z = -300;

		this.mesh.position.y = -48.1;

		this.mesh.rotation.x = -1.6;

		this.mesh.scale.x = 100;

		this.mesh.scale.y = 100;

		this.clock = Date.now();

        // this.scene.add( this.mesh );

    }

    getMesh() {

        return this.mesh;

    }

    update() {

    	this.mesh.material.uniforms[ 'time' ].value = Date.now() - this.clock;

    }
}

export { Broken };


// let container, stats;
// let camera, scene, renderer, vertices, geometry, initial;

// let options = {
//     "max": 10000,
//     "easing": 0.08,
//     "move": false
// };

// function init() {

// 	container = document.body;

// 	camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
// 	camera.position.z = 1;

// 	scene = new THREE.Scene();

// 	let triangles = options.max;

// 	geometry = new THREE.BufferGeometry();

// 	vertices = new THREE.BufferAttribute( new Float32Array( triangles * 3 * 3 ), 3 );
// 	initial = [];

// 	for ( let i = 0; i < vertices.length; i ++ ) {
// 		let x = Math.random() - 0.5;
// 		let y = Math.random() - 0.5;
// 		let z = Math.random() - 0.5;
// 		vertices.setXYZ( i, x, y, z );
// 	}

// 	for ( let i = 0; i < vertices.array.length; i ++ ) {
// 		initial.push( vertices.array[i] )
// 	}

// 	geometry.addAttribute( 'position', vertices );

// 	let colors = new THREE.BufferAttribute(new Float32Array( triangles * 3 * 4 ), 4 );

// 	for ( let i = 0; i < colors.length; i ++ ) {
// 		colors.setXYZW( i, 0.2, 0.2, 0.2, 0.2 );
// 	}

// 	geometry.addAttribute( 'color', colors );

// 	let material = new THREE.RawShaderMaterial( {

// 		uniforms: {
// 			time: { type: "f", value: 1.0 }
// 		},
// 		vertexShader: document.getElementById( 'vertexShader' ).textContent,
// 		fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
// 		side: THREE.DoubleSide,
// 		transparent: true

// 	} );

// 	let mesh = new THREE.Mesh( geometry, material );

// 	scene.add( mesh );

// 	renderer = new THREE.WebGLRenderer();
// 	renderer.setClearColor(  0x000000 /*0xc09e*/  );
// 	renderer.setPixelRatio( window.devicePixelRatio );
// 	renderer.setSize( window.innerWidth, window.innerHeight );
// 	container.appendChild( renderer.domElement );

// 	window.addEventListener( 'resize', onWindowResize, false );
// 	window.addEventListener( 'click', move, false );
// }

// function onWindowResize( event ) {

// 	camera.aspect = window.innerWidth / window.innerHeight;
// 	camera.updateProjectionMatrix();

// 	renderer.setSize( window.innerWidth, window.innerHeight );

// }

// function animate() {

// 	requestAnimationFrame( animate );

// 	if ( options.move ) {
// 		for ( let i = 0; i < vertices.length; i +=3 ) {

// 			let x = vertices.array[ i ];
// 			let y = vertices.array[ i + 1 ];
// 			let initx = initial[ i ];
// 			let inity = initial[ i + 1 ];

// 			let plusOrMinus = Math.random() > 0.5 ? 0.00019000000 : -0.00019000000;

// 			vertices.array[ i  ]    += ((initx - x) * options.easing) + plusOrMinus;
// 			vertices.array[ i + 1 ] += ((inity - y) * options.easing) + plusOrMinus;
// 		}
// 	}

// 	render();
// }

// function render() {

// 	geometry.attributes.position.needsUpdate = true;

// 	renderer.render( scene, camera );
// }

// function onMouseMove( mouse ) {
//     MOUSE.x = mouse.x || mouse.clientX;
//     MOUSE.y = mouse.y || mouse.clientY;
// }

// function move( mouse ) {
//     options.move = !options.move;
// }
