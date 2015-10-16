let THREE = require('../vendors/three.min');
let TweenMax = require('../vendors/tweenmax.js');
let glslify = require('glslify');

class Points {

    constructor( scene, emitter ) {

        this.scene = scene;

        this.emitter = emitter;
        
        this.particlesCount = 10000;

        this.length = 100;

        this.geometry = new THREE.BufferGeometry();

        this.vertexShader = glslify('../../vertex-shaders/points.vert');

        this.fragmentShader = glslify('../../fragment-shaders/points.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
                frequency: { type: "fv1", value: [] }
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
        });

        this.vertices = new Float32Array( this.particlesCount * 3 );
        this.frequencies = [];

        for ( let i = 0; i < this.vertices.length; i+=3 ) {

            let x = this.randomRange( -150, 150 );

            let y = this.randomRange( -150, 150 ); 

            let z = -1;

            this.vertices[ i ] = x;

            this.vertices[ i + 1 ] = y;

            this.vertices[ i + 2 ] = z;

        }

        this.mapping = new Float32Array( this.particlesCount * 3 );
        let divider = parseInt( this.vertices.length / 255 );
        let counter = 0;
        let current = 0; 
        let frequency = 0;

        for ( let i = 0; i < this.vertices.length; i++ ) {

            this.mapping[i] = frequency;

            current++;

            if ( current == counter + divider ) {
                counter = current;
                frequency++;
            }

        }

        this.bufferindex = new Float32Array( this.particlesCount * 3 );
        divider = parseInt( this.vertices.length / 256 );
        counter = 0;
        current = 0; 
        frequency = 0;

        for ( let i = 0; i < this.vertices.length; i++ ) {

            this.bufferindex[ i ] = frequency;

            current++;

            
            if ( current == counter + divider ) {
                counter = current;
                frequency++;

                if ( frequency > 256 ) {
                    frequency = 256
                } 

            }

        }

        console.log( frequency );

        this.geometry.addAttribute( 'position', new THREE.BufferAttribute( this.vertices, 3 ) );

        this.geometry.addAttribute( 'initial', new THREE.BufferAttribute( this.vertices, 3 ) );

        this.geometry.addAttribute( 'map', new THREE.BufferAttribute( this.mapping, 3 ) );

        this.geometry.addAttribute( 'bufferindex', new THREE.BufferAttribute( this.bufferindex, 3 ) );

        this.mesh = new THREE.Points( this.geometry, this.material );

        this.mesh.position.z = -181;
        this.mesh.position.y = -3.5;

        this.scene.add( this.mesh );
    }

    start() {

        TweenMax.to( this.mesh.rotation, 2, {
            x: -1.5,
            onComplete: () => {
                this.emitter.emit('points_ready');
            }
        });

        this.clock = Date.now();

    }
    
    update( soundData ) {

        if (soundData) {

            let frequency = soundData.freq;

            for ( let i = 0; i < frequency.length; i++ ) {

                this.frequencies[ i ] = frequency[ i ];

            }
            this.mesh.material.uniforms[ 'frequency' ].value = this.frequencies;

            var elapsed = Date.now() - this.clock;

            this.mesh.material.uniforms[ 'time' ].value = elapsed;
        } 

    }

    getMesh() {

        return this.mesh;

    }

    randomRange( min, max ) {

        return Math.floor( min + Math.random() * ( max - min ) );

    }
    

}

export { Points };