import { Keyboard } from './keyboard';
import { Audio } from './audio';
import { Blob } from './blob';
import { Floor } from './floor';
import { Roof } from './roof';

let Controls = require('orbit-controls');

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

	    this.renderer.setClearColor( 0xffffff, 1 );
    	this.renderer.setSize( this.params.width, this.params.height );

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

        if (this.params.active) {

            let objectsLength = this.objects.length;
            for (let i = 0; i < objectsLength; i++) {
                this.objects[ i ].update( this.sound.getData() );
            };

        } else {
            this.blob.update();
        }

        this.render( ts );
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
            let play = document.getElementById("play");
            play.innerHTML = "Play";
            play.style.opacity = 1;
        });

        document.getElementById("play").addEventListener("click", () => {

            this.play();

        });

    }

    play() {

        this.params.active = true;
        this.sound.start();
        this.zoomIn();

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