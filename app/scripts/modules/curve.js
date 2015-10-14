let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Curve {

    constructor( scene, posX, posY, posZ, i ) {

        this.scene = scene;

        this.index = i;

        this.particlesCount = 10000;

        this.length = 100;

        this.geometry = new THREE.BufferGeometry();

        this.vertexShader = glslify('../../vertex-shaders/curve.vert');

        this.fragmentShader = glslify('../../fragment-shaders/simple.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
                amplitude: { type: "f", value: 0 },
                frequency: { type: "f", value: 0 },
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

            let theta = (i / this.particlesCount) * ( Math.PI / 3 );

            let x = Math.cos(theta) * this.length;

            let y = Math.sin(theta) * this.length; 

            let z = -300;

            this.vertices[ i ] = x;

            this.vertices[ i + 1 ] = y;

            this.vertices[ i + 2 ] = z;

        }

        for ( let i = 0; i < this.particlesCount; i++ ) {

            this.indexes[ i ] = parseFloat( i );

        }

        this.geometry.addAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ) );

        this.geometry.addAttribute( 'bufferindex', new THREE.BufferAttribute( this.indexes, 1 ) );

        this.mesh = new THREE.Points( this.geometry, this.material );

        this.mesh.position.z = posZ;

        // this.mesh.position.y = 35;

        this.mesh.rotation.z = posZ;

        this.clock = Date.now();

        this.scene.add( this.mesh );
    }

    getMesh() {

        return this.mesh;

    }

    update( soundData ) {

        let time = soundData.time;
        let average = 0;
        let multiplicator = ( 512 / 8 );
        let start = this.index * multiplicator;
        let stop = start + multiplicator;

        for(let i = start; i < stop; i++) {
            average += time[ i ];
        }

        average /= multiplicator;

        // this.mesh.rotation.z -= 0.001;

        this.mesh.material.uniforms[ 'frequency' ].value = average;

        var elapsed = Date.now() - this.clock;

        // this.mesh.rotation.z += time / 10000;

        this.mesh.material.uniforms[ 'time' ].value = elapsed;


    }
    

}

export { Curve };