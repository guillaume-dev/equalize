import { Curve } from './curve';

let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Curves {

    constructor( scene, emitter, options = {} ) {

        this.scene = scene;

        this.max = 8;

        this.curves = [];

        let posY = -300;

        for ( let i = 0; i < this.max; i++ ) {

            this.curves.push( new Curve( this.scene, -100, 0, posY, i ) );

            posY -= 20; 
        }

    }

    getMesh() {

        return this.curves;

    }

    update( soundData ) {

        for ( let i = 0; i < this.curves.length; i++ ) {

            this.curves[ i ].update( soundData );

        }

    }
    

}

export { Curves };