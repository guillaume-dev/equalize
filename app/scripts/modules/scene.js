import { Keyboard } from './keyboard';
import { Audio } from './audio';
import { Test } from './test';
import { Blob } from './blob';
import { Warp } from './warp';
import { Ribbon } from './ribbon';
import { Floor } from './floor';
import { Roof } from './roof';
import { Rock } from './rock';

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
    		active: options.active || true,
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

        this.keyboard = new Keyboard( this.emitter );  
    	this.scene = new THREE.Scene();
    	this.camera = new THREE.PerspectiveCamera( 45, this.params.width / this.params.height, 1, 10000 );

        this.target = new THREE.Vector3();
        this.camera.lookAt(this.target);

        this.camera.position.z = 55;

        // this.keyboard.addObject( this.camera );

        this.sound = new Audio( this.emitter );
 
    	this.raycaster = new THREE.Raycaster();

        //this.test();

        this.addRock();

        this.addRibbon();

        this.addBlob();

        this.loadSound();

        this.renderer = new THREE.WebGLRenderer({
	        antialias: true
	    });

	    this.renderer.setClearColor( 0xffffff, 1 );
    	this.renderer.setSize( this.params.width, this.params.height );

        this.container.appendChild( this.renderer.domElement );

        this.controls = new Controls({
            distance: 200,
        });

    	this.clock = Date.now();

    	this.addListeners();

        this.animate();

        this.zoomIn();

    }

    loadSound() {

        // this.sound.load( "music/jedimind.mp3" );
        this.sound.load( "music/passenger_circles.mp3" );

    }

    addRock() {

        this.rock = new Rock( this.scene, this.emitter );

        this.objects.push( this.rock );

        this.keyboard.addObject( this.rock.getMesh() );


    }

    addBlob() {

        this.blob = new Blob( this.scene, this.emitter );

        this.objects.push( this.blob );

        this.keyboard.addObject( this.blob.getMesh() );


    }

    addContext() {

        this.floor = new Floor( this.scene, this.emitter);

        this.roof = new Roof( this.scene, this.emitter);

        this.objects.push( this.floor );

        this.objects.push( this.roof );

        this.keyboard.addObject( this.floor.getMesh() );

        this.keyboard.addObject( this.roof.getMesh() );

    }

    addRibbon() {

        this.ribbon = new Ribbon( this.scene, this.emitter );

        this.objects.push( this.ribbon );

        this.keyboard.addObject( this.ribbon.getMesh() );

    }

    addWarp() {

        this.warp = new Warp( this.scene, this.emitter );

        this.objects.push( this.warp );

        this.keyboard.addObject( this.warp.getMesh() );

    }

    test() {

        this.test = new Test( this.scene, this.emitter );

        this.keyboard.addObject( this.test.getMesh() );

    }

    animate( ts ) {

        if (this.params.active) {
        
            window.requestAnimationFrame( this.animate.bind(this) );

            let objectsLength = this.objects.length;
            for (let i = 0; i < objectsLength; i++) {
                this.objects[ i ].update( this.sound.getData() );
            };

            this.render( ts );

        }

    }

    render() {

    	if (!this.params.active)
        	this.params.active = true;

        // const position = this.camera.position.toArray();
        // const direction = this.target.toArray();
        // console.log(position, this.target.fromArray(direction) )
        // this.controls.update(position, direction);
        // this.camera.position.fromArray(position);
        // this.camera.lookAt(this.target.fromArray(direction));

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

    }

    zoomOut() {

        if ( this.zooming || this.camera.position.z == 55 ) return;

        this.zooming = true;

        TweenMax.to( this.camera.position, 2, {
            z: 55,
            // y: 5,
            onComplete: () => {
                this.zooming = false;
            }
        });

    }

    zoomIn() {

        if ( this.zooming || this.camera.position.z == 35 ) return;

        this.zooming = true;

        TweenMax.to( this.camera.position, 2, {
            z: 35,
            // y: 0,
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