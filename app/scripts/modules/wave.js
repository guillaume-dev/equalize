let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Wave {

    constructor( scene, emitter, options = {} ) {

        this.scene = scene;

        this.particlesCount = 10000;

        this.length = 30;

        this.geometry = new THREE.BufferGeometry();

        this.vertexShader = glslify('../../vertex-shaders/wave.vert');

        this.fragmentShader = glslify('../../fragment-shaders/simple.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
                amplitude: { type: "f", value: 0 },
                frequency: { type: "f", value: 0 },
                // frequency: { type: "fv1", value: [] }
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
        });

        this.vertices = new Float32Array( this.particlesCount * 3 );

        this.indexes = [];

        let currentPoint = new THREE.Vector3( 
            -100,
            0,
            -146
        );

        for ( let i = 0; i < this.vertices.length; i+=3 ) {

            let step = (i / this.particlesCount);

            let x = step * this.length;

            let y = 0; 

            let z = -100;

            this.vertices[ i ] = x;

            this.vertices[ i + 1 ] = y;

            this.vertices[ i + 2 ] = z;

        }

        for ( let i = 0; i < this.particlesCount; i++ ) {

            this.indexes[ i ] = parseFloat( i );

        }

        console.log( this.indexes );

        this.geometry.addAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ) );

        this.geometry.addAttribute( 'bufferindex', new THREE.BufferAttribute( this.indexes, 1 ) );

        this.mesh = new THREE.Points( this.geometry, this.material );

        this.mesh.position.x = -45;

        this.clock = Date.now();

        this.scene.add( this.mesh );

    }

    getMesh() {

        return this.mesh;

    }

    update( soundData ) {

        let frequency = soundData.freq;
        let time = soundData.time;
        let average = 0;

        for(var i = 0; i < time.length; i++) {
            average += time[ i ];
        }

        average /= 512;

        this.mesh.material.uniforms[ 'frequency' ].value = average;

        // this.mesh.material.uniforms[ 'frequency' ].value = time;

        this.mesh.material.uniforms[ 'time' ].value = Date.now() - this.clock;


    }
    

}

export { Wave };