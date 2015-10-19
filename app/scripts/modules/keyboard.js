class Keyboard {

    constructor( emitter ) {

        this.emitter = emitter;

    	document.addEventListener("keydown", this.keydown.bind( this ) );

        this.speed = 0.1;

    	this.targets = [];

    	this.targetIndex = 0;

    	this.target = null;

    }

    keydown( e ) {

        console.log( e.keyCode );

        // CTRL
        if ( e.keyCode == 17) {

        	if ( this.targets.length > 0 ) {
        		this.targetIndex++;

        		if ( this.targetIndex == this.targets.length ) {
        			this.targetIndex = 0;
        		}

        		this.target = this.targets[ this.targetIndex ];
        	}

        }

        if ( e.keyCode == 16) {

            this.speed -= 0.1;

            console.log( "Speed:", this.speed );
        }

        if ( e.keyCode == 18) {

            this.speed += 0.1;

            console.log( "Speed:", this.speed );
        }

        switch( e.keyCode ) {

        	case 13: // ENTER
        		this.target.position.z -= this.speed;
        		console.log( "position.z:", this.target.position.z);
        	break; 
        	case 32: // SPACE
        		this.target.position.z += this.speed;
        		console.log( "position.z:", this.target.position.z);
        	break;
        	case 38: // UP
        		this.target.position.y += this.speed;
        		console.log( "position.y:", this.target.position.y);
        	break; 
        	case 40: // DOWN
        		this.target.position.y -= this.speed;
        		console.log( "position.y:", this.target.position.y);
        	break;
        	case 37: // LEFT
        		this.target.position.x -= this.speed;
        		console.log( "position.x:", this.target.position.x);
        	break; 
        	case 39: // RIGHT
        		this.target.position.x += this.speed;
        		console.log( "position.x:", this.target.position.x);
        	break;
        	case 65: // A
        		this.target.rotation.z -= this.speed;
        		console.log( "rotation.z:", this.target.rotation.z);
        	break; 
        	case 69: // E
        		this.target.rotation.z += this.speed;
        		console.log( "rotation.z:", this.target.rotation.z);
        	break;
        	case 90: // Z
        		this.target.rotation.y -= this.speed;
        		console.log( "rotation.y:", this.target.rotation.y);
        	break; 
        	case 83: // S
        		this.target.rotation.y += this.speed;
        		console.log( "rotation.y:", this.target.rotation.y);
        	break;
        	case 81: // Q
        		this.target.rotation.x -= this.speed;
        		console.log( "rotation.x:", this.target.rotation.x);
        	break; 
        	case 68: // D
        		this.target.rotation.x += this.speed;
        		console.log( "rotation.x:", this.target.rotation.x);
        	break;
        }

    }

    addObject( object ) {

    	this.targets.push( object );

    	if ( this.targets.length == 1 ) {
    		this.target = this.targets[ this.targetIndex ];
    	}
    }

}

export { Keyboard };