let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Ground {

    constructor( scene, emitter, options = {} ) {

        this.scene = scene;

        this.length = 20;

        let geometry = new THREE.PlaneGeometry( this.length, this.length, 32, 32 );

        console.log( geometry.vertices.length );

        this.geometry = new THREE.BufferGeometry().fromGeometry( geometry );

        this.indexes = [];

        for ( let i = 0; i < this.geometry.attributes.position.array.length / 3; i++ ) {

            this.indexes[ i ] = parseFloat( i );

        }

        this.geometry.addAttribute( 'bufferindex', new THREE.BufferAttribute( this.indexes, 1 ) );

        this.geometry.addAttribute( 'frequency', new THREE.BufferAttribute( [], 1 ) );

        this.vertexShader = glslify('../../vertex-shaders/ground.vert');

        this.fragmentShader = glslify('../../fragment-shaders/ground.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
                // frequency: { type: "fv1", value: [] }
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            wireframe: true
        });

        // this.material = new THREE.MeshPhongMaterial({
        //   color: 'rgb(255, 150, 150)',
        //   side: THREE.DoubleSide,
        //   shininess: 50,
        //   emissive: new THREE.Color('rgb(255, 0, 0)'),
        //   metal: false,
        // });


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

        this.mesh.geometry.addAttribute( 'frequency', new THREE.BufferAttribute( frequency, 1 ) );

        // this.mesh.material.uniforms[ 'frequency' ].value = frequency;

    }
    

}

export { Ground };