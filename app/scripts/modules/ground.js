let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Ground {

    constructor( scene, emitter, options = {} ) {

        this.scene = scene;

        this.length = 30;

        this.geometry = new THREE.PlaneGeometry( this.length, this.length );

        this.vertexShader = glslify('../../vertex-shaders/simple.vert');

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


        this.mesh = new THREE.Mesh( this.geometry, this.material );

        this.mesh.position.z = -10;

        this.clock = Date.now();

        // this.scene.add( this.mesh );

    }

    getMesh() {

        return this.mesh;

    }

    update( soundData ) {

        let frequency = soundData.freq;
        let time = soundData.time;

    }
    

}

export { Ground };