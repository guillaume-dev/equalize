let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Floor {

    constructor( scene, emitter, options = {} ) {

        this.scene = scene;

        this.boxes = [];

        this.max = 512;

        this.colors = [
            0xff0000,
            0x00ff00,
            0x0000ff
        ];

        this.frequencies = [];

        this.floorHeight = 8;
        this.floorWidth = 512 / 8;
        this.cubeWidth = 15;
        let posX = 0;
        let posY = 0;
        let posZ = -15;
        let idx = 0;

        this.mesh = new THREE.Object3D();

        this.vertexShader = glslify('../../vertex-shaders/floor.vert');

        this.fragmentShader = glslify('../../fragment-shaders/simple.frag');

        this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0.0 },
                frequency: { type: "f", value: 0.0 },
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            wireframe: true
        });

        let count = 0; 

        for ( let i = 0; i < this.floorWidth; i++ ) {

            posX = i * 15;

            for ( let j = 0; j < this.floorHeight; j++ ) {

                posY = j * 15;

                var geometry = new THREE.BufferGeometry().fromGeometry( new THREE.BoxGeometry( this.cubeWidth, this.cubeWidth, this.cubeWidth) );

                var cube = new THREE.Mesh( geometry, this.material );

                cube.position.x = posX;
                cube.position.y = posY;
                cube.position.z = posZ;

                cube._index = count;

                count++;

                this.boxes.push( cube );
                this.mesh.add( cube );

            }

        }

        this.mesh.position.z = -500;
        this.mesh.position.y = -60;
        this.mesh.position.x = -42;

        this.mesh.rotation.x = -1.7;
        this.mesh.rotation.z = -1.6;

        this.clock = Date.now();
        
        this.scene.add( this.mesh );

    }

    getMesh() {

        return this.mesh;

    }

    update( soundData ) {


        let frequency = soundData.freq;

        for ( let i = 0; i < frequency.length; i++ ) {

            this.frequencies[ i ] = frequency[ i ];

        }

        for ( let i = 0; i < this.mesh.children.length; i++ ) {

            let box = this.mesh.children[ i ];

            let freq = (frequency[ i ] * 10) / 255;
            // let freq = this.frequencies[ i ];
            box.material.uniforms[ 'frequency' ].value = parseFloat( freq );

            box.material.uniforms[ 'time' ].value = Date.now() - this.clock;

        }
    }
    

}

export { Floor };