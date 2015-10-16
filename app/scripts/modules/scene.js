import { Keyboard } from './keyboard';
import { Wave } from './wave';
import { Points } from './points';


let THREE = require('../vendors/three.min');
let OrbitControls = require('three-orbit-controls')(THREE);
let EffectComposer = require('three-effectcomposer')(THREE);
// require('../../fragment-shaders/rgbshift');
THREE.RGBShiftShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "amount":   { type: "f", value: 0.0099 },
        "angle":    { type: "f", value: 90.0 }

    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform sampler2D tDiffuse;",
        "uniform float amount;",
        "uniform float angle;",

        "varying vec2 vUv;",

        "void main() {",

            "vec2 offset = amount * vec2( cos(angle), sin(angle));",
            "vec4 cr = texture2D(tDiffuse, vUv + offset);",
            "vec4 cga = texture2D(tDiffuse, vUv);",
            "vec4 cb = texture2D(tDiffuse, vUv - offset);",
            "gl_FragColor = vec4(cr.r, cga.g, cb.b, cga.a);",

        "}"

    ].join("\n")

};


class Scene {

    constructor( emitter, sound, options = {} ) {

    	this.emitter = emitter;
        this.sound = sound;
    	this.scene = null;
    	this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.keyboard = null;
        this.container = options.container || document.body;
        this.controls = null;

    	this.params = {
    		active: options.active || false,
	        height: options.height || window.innerHeight,
	        width: options.width || window.innerWidth
    	};

    	this.mouse = {
	        x: null,
	        y: null
	    };

	    this.clock = null;

    }

    init() {

        this.emitter.on( "ready", () => {
            this.ready();
        });

        this.emitter.on( "play", () => {
            this.play();
            this.emitter.emit('start');
        });

        this.emitter.on( "replay", () => {

        });

        this.loadSound();

    	this.scene = new THREE.Scene();
    	this.camera = new THREE.PerspectiveCamera( 45, this.params.width / this.params.height, 1, 10000 );

        this.addPoints();

        this.addWave();

        // this.loadingBtn = ;
        this.playBtn = document.getElementById("playBtn");
        this.loadingBtn = document.getElementById("replayBtn");

        this.renderer = new THREE.WebGLRenderer({
	        antialias: true
	    });

	    this.renderer.setClearColor(  0x000000, 1 );
    	this.renderer.setSize( this.params.width, this.params.height );

    	this.composer = new EffectComposer( this.renderer );
        this.composer.addPass(new EffectComposer.RenderPass(this.scene, this.camera ))

        this.RGBShift = new EffectComposer.ShaderPass(THREE.RGBShiftShader);
        this.RGBShift.renderToScreen = false;

        this.composer.addPass(this.RGBShift);

    	this.container.appendChild( this.renderer.domElement );

        this.points.update();
        this.renderer.render( this.scene, this.camera );

    	this.clock = Date.now();

    	this.addListeners();

        


    }

    loadSound() {

        this.sound.load( "music/jedimind.mp3" );

    }

    addPoints() {

        this.points = new Points( this.scene, this.emitter );

    }

    addWave() {

        this.wave = new Wave( this.scene, this.emitter );

    }

    ready() {

        console.log('ready');
        document.getElementById("loadingBtn").style.opacity = 0;
        document.getElementById("playBtn").addEventListener("click", () => {
            this.play();
        });
        document.getElementById("playBtn").style.opacity = 1;

    }

    play() {

        console.log('play');
        this.playBtn.style.opacity = 0;
        this.playBtn.style.marginTop = "100%";
        this.params.active = true;
        this.emitter.emit( "start" );
        this.points.start();
        this.animate();
    }

    replay() {



    }

    animate( ts ) {

        if (this.params.active) {
            
            let sound = this.sound.getData();

            window.requestAnimationFrame( this.animate.bind(this) );

            this.points.update( sound );

            this.wave.update( sound );

            this.render( ts, sound );

        }

    }

    render( ts, soundData) {

        let time = soundData.time;
        let timeArrayLength = time.length;
        let average = 0;

        for(let i = 0; i < timeArrayLength; i++) {
            average += time[ i ];
        }

        average /= timeArrayLength;

        if ( Math.abs( average - 128 ) > 60 ) {

            this.RGBShift.renderToScreen = true;
            this.composer.render();

        } else {
            this.renderer.render( this.scene, this.camera );
        }

    }

    addListeners() {

    	window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

    	this.keyboard = new Keyboard( this.emitter );	

        this.keyboard.addObject( this.points.getMesh() );

    }

    onWindowResize() {

    	this.params.width = window.innerWidth;
	    this.params.height = window.innerHeight;

	    this.camera.aspect = this.params.width / this.params.height;
	    this.camera.updateProjectionMatrix();

	    this.renderer.setSize( this.params.width, this.params.height );

    }

}

export { Scene };