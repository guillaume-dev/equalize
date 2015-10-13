let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Ground {

    constructor( scene, emitter, options = {} ) {

        this.scene = scene;

        this.length = 20;

        this.geometry = new THREE.PlaneGeometry( this.length, this.length, 32 );

        this.vertexShader = glslify('../../vertex-shaders/ground.vert');

        this.fragmentShader = glslify('../../fragment-shaders/simple.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
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

        this.mesh.material.uniforms[ 'time' ].value = Date.now() - this.clock;

    }
    

}

export { Ground };