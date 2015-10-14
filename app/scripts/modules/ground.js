let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Ground {

    constructor( scene, emitter, options = {} ) {

        this.scene = scene;

        this.length = 20;

        let geometry = new THREE.PlaneGeometry( this.length, this.length, 10, 10 );

        this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        // this.geometry = new THREE.BufferGeometry();
        this.indexes = [];
        this.positions = [];
        this.frequencies = [];

        let count = 0;

        console.log( geometry.vertices.length, this.geometry.attributes );

        for ( let i = 0; i < geometry.vertices.length; i++ ) {

            this.positions[ count ] = geometry.vertices[ i ].x;
            this.positions[ count + 1 ] = geometry.vertices[ i ].y;
            this.positions[ count + 2 ] = geometry.vertices[ i ].z;

            count += 3;
        }

        // for ( let i = 0; i < geometry.vertices.length; i++ ) {

        //     this.indexes[ i ] = parseFloat( i );

        // }

        for ( let i = 0; i < this.geometry.attributes.position.array.length / 3; i++ ) {

            this.indexes[ i ] = parseFloat( i );

        }

        // this.geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array(this.positions ), 3 ) );

        this.geometry.addAttribute( 'bufferindex', new THREE.BufferAttribute( new Float32Array(this.indexes), 1 ) );

        this.vertexShader = glslify('../../vertex-shaders/ground.vert');

        this.fragmentShader = glslify('../../fragment-shaders/ground.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
                frequency: { type: "fv1", value: [] },
                opacity: { type: 'f', value: 0.8 },
                weight: { type: "f", value: 0 },
                size: { type: 'f', value: 1024 }, 
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.FlatShading,
            // wireframe: true
        });

        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.mesh.position.z = -5;
        this.mesh.position.y = -1.2;
        this.mesh.rotation.x = -1.6;

        this.clock = Date.now();

        this.scene.add( this.mesh );

    }

    getMesh() {

        return this.mesh;

    }

    update( soundData ) {

        let frequency = soundData.freq;
        let time = soundData.time;
        for ( let i = 0; i < frequency.length; i++ ) {

            this.frequencies[ i ] = frequency[ i ];

        }
        this.mesh.material.uniforms[ 'frequency' ].value = this.frequencies;

        this.mesh.material.uniforms[ 'time' ].value = Date.now() - this.clock;

    }
    

}

export { Ground };