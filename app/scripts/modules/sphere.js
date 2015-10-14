let glslify = require('glslify');
let THREE = require('../vendors/three.min');

class Sphere {

    constructor(scene, emitter) {

        this.scene = scene;
        this.vertexShader = glslify('../../vertex-shaders/sphere.vert');

        this.fragmentShader = glslify('../../fragment-shaders/sphere.frag');

    	this.meshMaterial = new THREE.ShaderMaterial( {

            uniforms: { 
                time: { type: "f", value: 0 },
                weight: { type: "f", value: 0 },
                amplitude: {
                    type: 'f',
                    value: 0
                },
                size: { type: 'f', value: 1024 },
                opacity: { type: 'f', value: 1.0 } 
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.FlatShading,
            wireframe: true
            
        } );
    
        this.meshGeometry = new THREE.DodecahedronGeometry( 20, 4 );

        this.mesh = new THREE.Mesh( this.meshGeometry, this.meshMaterial );

        this.mesh.position.z = -300;
        this.mesh.position.y = 45;

        this.clock = Date.now();

        this.speed = .0003;
        this.weight = 7;

        this.scene.add( this.mesh );

    }

    update( soundData ) {

        let frequency = soundData.freq;
        let time = soundData.time;

        let average = 0;

        for(var i = 0; i < time.length; i++) {
            average += time[ i ];
        }

        average /= 512;
        
        // if ( Math.abs( average - 128 ) > 100 ) {
        //     this.weight += 0.001;
        // } else if ( Math.abs( average - 128 ) > 115 ) {
        //     this.weight += 0.003;
        // } else {
        //     this.weight -= 0.01;
        // }




        this.meshMaterial.uniforms[ 'time' ].value = this.speed * ( Date.now() - this.clock );
        
        this.meshMaterial.uniforms[ 'weight' ].value = this.weight;


    }

    getMesh() {

        return this.mesh;

    }

    setWeight( _weight ) {

        this.weight = _weight;

    }

}

export { Sphere };