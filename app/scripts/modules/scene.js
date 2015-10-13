import { Keyboard } from './keyboard';
import { Wave } from './wave';
import { Ground } from './ground';
import { Sun } from './sun';
import { GhettoBlaster } from './ghettoblaster';


let THREE = require('../vendors/three.min');
let OrbitControls = require('three-orbit-controls')(THREE);
let EffectComposer = require('three-effectcomposer')(THREE);


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
    	this.camera = new THREE.PerspectiveCamera( 45, this.params.width / this.params.height, 1, 10000 );

    	this.scene.add( this.camera );

        // this.addWave();

        this.addSun();

        this.addGround();

        this.loadSound();

        this.addLights();

        this.renderer = new THREE.WebGLRenderer({
	        antialias: true
	    });

	    this.renderer.setClearColor(  0xffffff, 1 );
    	this.renderer.setSize( this.params.width, this.params.height );
        this.renderer.shadowMap.enabled = true;

    	this.composer = new EffectComposer( this.renderer );

    	this.container.appendChild( this.renderer.domElement );

    	this.clock = Date.now();

    	this.addListeners();

        this.addControls();


    }

    loadSound() {

        this.sound.load( "music/jedimind.mp3" );
        this.emitter.on( "start", () => {
            this.animate();
        });

    }

    addWave() {

        this.wave = new Wave( this.scene, this.emitter );

    }

    addSun() {

        this.sun = new Sun( this.scene, this.emitter );

        this.ghettoblaster = new GhettoBlaster( this.scene, this.emitter );

    }

    addGround() {

        this.ground = new Ground( this.scene, this.emitter );

    }

    addControls() {

        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

    }

    addLights() {

        var ambient = new THREE.AmbientLight( 0xff0000 );
        ambient.position.set(0, 0, -100);
        this.scene.add( ambient );

        var directionalLight = new THREE.DirectionalLight( 0xe2ffaa );
        directionalLight.position.x = 0;
        directionalLight.position.y = -1;
        directionalLight.position.z = -145;
        directionalLight.position.normalize();
        this.scene.add( directionalLight );


        var light = new THREE.SpotLight( 0x999999, 2, 0 );
        light.position.set( 0, 0, -145 );
        light.target.position.set( 0, 0, 0 );
        light.castShadow = true;
        this.scene.add( light );

    }

    animate( ts ) {

        if (this.params.active) {
        
            window.requestAnimationFrame( this.animate.bind(this) );

            // this.wave.update( this.sound.getData() );

            this.ground.update( this.sound.getData() );

            this.sun.update( this.sound.getData() );

            this.ghettoblaster.update( this.sound.getData() );

            this.render( ts );

        }

    }

    render() {

    	if (!this.params.active)
        	this.params.active = true;

        this.renderer.render( this.scene, this.camera );	

    }

    addListeners() {

    	window.addEventListener( 'resize', this.onWindowResize.bind( this ), false );

    	this.keyboard = new Keyboard( this.emitter );	

        this.keyboard.addObject( this.camera );

        this.keyboard.addObject( this.ground.getMesh() );

        // this.keyboard.addObject( this.wave.getMesh() );


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