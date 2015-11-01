import { Keyboard } from './keyboard';
import { Audio } from './audio';
import { Blob } from './blob';
import { Floor } from './floor';
import { Roof } from './roof';
import { Utils } from './utils';

let Controls = require('orbit-controls');
let EffectComposer = require('three-effectcomposer')(THREE);
let utils = new Utils();

class Scene {

    constructor( emitter, sound, options = {} ) {

    	this.emitter = emitter;
        this.sound = sound;
    	this.scene = null;
    	this.camera = null;
        this.renderer = null;
        this.composer = null;
        this.container = options.container || document.body;
        this.controls = null;
        this.keyboard = null;
        this.frequenceMax = 0;

    	this.params = {
    		active: options.active || false,
	        height: options.height || window.innerHeight,
	        width: options.width || window.innerWidth
    	};

    	this.mouse = {
	        x: null,
	        y: null
	    };

        this.zooming = false;

        this.blobs = [];
        this.objects = [];

	    this.clock = null;

    }

    init() {

        this.addListeners();

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera( 45, this.params.width / this.params.height, 1, 10000 );

        this.target = new THREE.Vector3();
        this.camera.lookAt(this.target);

        this.camera.position.x = -8.5;
        this.camera.position.y = -18.4;
        this.camera.position.z = -66;

        this.camera.rotation.x = 2.8;
        this.camera.rotation.y = -0.35;
        this.camera.rotation.z = 3.04;

        this.sound = new Audio( this.emitter );

        this.addContext();

        this.addBlob();

        this.loadSound();

        this.renderer = new THREE.WebGLRenderer({
	        antialias: true
	    });

	    this.renderer.setClearColor( 0x000000, 1 );
    	this.renderer.setSize( this.params.width, this.params.height );

        this.composer = new EffectComposer( this.renderer );
        this.composer.addPass(new EffectComposer.RenderPass(this.scene, this.camera ))

        this.RGBShift = new EffectComposer.ShaderPass(THREE.RGBShiftShader);
        this.RGBShift.renderToScreen = false;

        this.composer.addPass(this.RGBShift);

        this.container.appendChild( this.renderer.domElement );

        this.controls = new Controls({
            distance: 80
        });

        const position = [ -1.6, -19.33, -67.25 ];
        const direction = [0.023, 0.27, 0.96];
        this.camera.position.fromArray(position);
        this.camera.lookAt(this.target.fromArray(direction));
        this.controls.update(position, direction);

    	this.clock = Date.now();

        this.animate();


    }

    loadSound() {

        this.sound.load( "music/passenger_circles.mp3" );

    }

    addBlob() {

        this.blob = new Blob( this.scene, this.emitter );

        this.objects.push( this.blob );


    }

    addContext() {

        this.floor = new Floor( this.scene, this.emitter);

        this.roof = new Roof( this.scene, this.emitter);

        this.objects.push( this.floor );

        this.objects.push( this.roof );
    }

    animate( ts ) {

        
        window.requestAnimationFrame( this.animate.bind(this) );

        let frequence = this.sound.getData();

        if (this.params.active) {

            let objectsLength = this.objects.length;
            for (let i = 0; i < objectsLength; i++) {
                this.objects[ i ].update( frequence );
            };

        } else {
            this.blob.update();
        }

        if ( frequence > 70 ) {
            this.RGBShift.renderToScreen = true;
            this.composer.render();
            this.RGBShift.uniforms.amount.value = Math.random() * 0.08;
            this.RGBShift.uniforms.angle.value = utils.randomRange( 10, 180 );
        } else {
            this.render( ts );
        }
    }

    render() {

        const position = this.camera.position.toArray();
        const direction = this.target.toArray();
        this.controls.update(position, direction);
        this.camera.position.fromArray(position);
        this.camera.lookAt(this.target.fromArray(direction));

        this.renderer.render( this.scene, this.camera );    
    }

    addListeners() { 

    	window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

        this.emitter.on('zoomOut', () => {
            this.zoomOut();
        });

        this.emitter.on('zoomIn', () => {
            this.zoomIn();
        });

        this.emitter.on( "loaded", () => {
            let title = document.getElementById("title");
            let play = document.getElementById("play");
            play.innerHTML = "PLAY";
            title.style.opacity = 1;
        });

        this.emitter.on( "ended", () => {
            let title = document.getElementById("title");
            let play = document.getElementById("play");
            play.innerHTML = "REPLAY";
            title.style.opacity = 1;
        });

        document.getElementById("play").addEventListener("click", (e) => {

            let title = document.getElementById("title");
            title.style.opacity = 0;
            this.play();

        });

    }

    play() {

        
        
        this.blob.start();
        document.getElementById("title").style.opacity = 0;
        this.zoomIn();     
        
        setTimeout( () => {

            this.sound.start();
            this.params.active = true;
            
            
        }, 500);

    }

    zoomOut() {

        if ( this.zooming || this.controls.distance == 80 ) return;

        this.zooming = true;

        TweenMax.to( this.controls, 2, {
            distance: 80,
            onComplete: () => {
                this.zooming = false;
            }
        });

    }

    zoomIn() {

        if ( this.zooming || this.controls.distance == 70 ) return;

        this.zooming = true;

        TweenMax.to( this.controls, 2, {
            distance: 70,
            onComplete: () => {
                this.zooming = false;
            }
        });

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