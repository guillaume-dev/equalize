import { Test } from './test';

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

    	this.params = {
    		active: options.active || true,
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

    	this.scene = new THREE.Scene();
    	this.camera = new THREE.PerspectiveCamera( 45, this.params.width / this.params.height, 1, 1000 );

        this.target = new THREE.Vector3();


        this.camera.lookAt(this.target);
 
    	this.raycaster = new THREE.Raycaster();

        this.test();

        // this.loadSound();

        this.renderer = new THREE.WebGLRenderer({
	        antialias: true
	    });

	    this.renderer.setClearColor(  0x222222, 1 );
    	this.renderer.setSize( this.params.width, this.params.height );

        this.container.appendChild( this.renderer.domElement );

        this.controls = new Controls({
            distance: 5,
        });

        

    	this.clock = Date.now();

    	this.addListeners();

        this.animate();
    }

    loadSound() {

        this.sound.load( "music/jedimind.mp3" );
        this.emitter.on( "start", () => {
            this.animate();
        });

    }

    test() {

        this.test = new Test( this.scene, this.emitter );

    }

    animate( ts ) {

        if (this.params.active) {
        
            window.requestAnimationFrame( this.animate.bind(this) );

            this.test.update( this.sound.getData() );

            this.render( ts );

        }

    }

    render() {

    	if (!this.params.active)
        	this.params.active = true;

        const position = this.camera.position.toArray();
        const direction = this.target.toArray();
        this.controls.update(position, direction);
        this.camera.position.fromArray(position);
        this.camera.lookAt(this.target.fromArray(direction));



        this.renderer.render( this.scene, this.camera );    


    }

    addListeners() {

    	window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

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