let THREE = require('../vendors/three.min');
let glslify = require('glslify');

class Ribbon {

	constructor( scene, emitter ) {

		this.scene            = scene; 

		// Ribbon

		this.positions        = [];
		this.rotations        = [];
		
		this.x                = 0;
		this.y                = 0;
		this.z                = 0;
		
		this.friction         = .01;
		this.counter          = 0;
		this.spring           = .9;
		this.speed            = 30;
		this.movement         = 10;
		this.radius           = 7000;
		this.theta            = 0;

		this.velX             = 0;
		this.velY             = 0;
		this.velZ             = 0;
		
		this.ax               = this.randomRange(-this.movement, this.movement);
		this.ay               = this.randomRange(-this.movement, this.movement);
		this.az               = this.randomRange(-this.movement, this.movement);
		
		this.width            = this.randomRange(5, 30);
		this.length           = 31;
		
		this.geometry         = new THREE.PlaneGeometry(30, 30, this.length - 1, this.length - 1);
		
		this.material         = new THREE.MeshLambertMaterial( { color:  0xff0000 } );
		
		this.mesh             = new THREE.Mesh(this.geometry, this.material);
		this.mesh.dynamic     = true;
		
		this.mesh.rotation.x  = 90;
		this.mesh.doubleSided = true;

		this.mesh.position.z = -100;

		for ( let i = 0; i < this.length * 2; i++ ) {
			// this.positions.push(0);
			// this.rotations.push(0);
			this.positions.push( new THREE.Vector3(0, 0, 0) );
			this.rotations.push( new THREE.Vector3(0, 0, 0) );
		}

		this.scene.add( this.mesh );

		console.log( this.mesh );

	}

	getMesh() {

        return this.mesh;

    }

	update( soundData ) {

		let x		= Math.cos( this.ax * this.theta) * this.speed;
		let y		= Math.sin( this.ay * this.theta) * this.speed;
		let z		= Math.sin( this.az * this.theta) * this.speed;

		this.velY += (y - this.velY) * this.friction;
		this.velZ += (z - this.velZ) * this.friction;
		
		this.x    += this.velX	= (this.velX + (x - this.x) * this.friction) * this.spring;
		this.y    += this.velY	= (this.velY + (y - this.y) * this.friction) * this.spring;
		this.z    += this.velZ	= (this.velZ + (z - this.z) * this.friction) * this.spring;
		
		this.positions.pop();
		this.positions.pop();
		this.positions.pop();
		
		this.rotations.pop();
		this.rotations.pop();
		this.rotations.pop();
		
		this.positions.unshift(this.x, this.y, this.z);
		this.rotations.unshift(Math.cos(this.counter * .1) * this.width, Math.sin( this.counter * .25 ) * this.width, 0);
		
		for (let i = 0; i < this.length; i++)
		{
			let v1 = this.geometry.vertices[ i ];
			let v2 = this.geometry.vertices[ i + 1 ];
			
			v1.x = this.positions[ i ].x + this.rotations[ i ].x;
			v1.y = this.positions[ i ].y + this.rotations[ i ].y;
			v1.z = this.positions[ i ].z + this.rotations[ i ].z;
			v2.x = this.positions[ i ].x - this.rotations[ i ].x;
			v2.y = this.positions[ i ].y - this.rotations[ i ].y;
			v2.z = this.positions[ i ].z - this.rotations[ i ].z;

		}
		
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
		this.geometry.__dirtyVertices = true;
		this.geometry.__dirtyNormals  = true;

		console.log( this.mesh.position.x, this.mesh.position.y, this.mesh.position.z );

	}

	randomRange( min, max ) {

		return Math.floor( min + Math.random() * ( max - min ) );

	}

}

export { Ribbon };

/*


			function getNextRandomPosition()
			{
				for (let i=0; i<amount; i++)
				{
					let dx		= Math.cos(ribbons[i].ax * theta) * speed;
					let dy		= Math.sin(ribbons[i].ay * theta) * speed;
					let dz		= Math.sin(ribbons[i].az * theta) * speed;
					
					targets[i*3]	+= dx;
					targets[i*3+1]	+= dy;
					targets[i*3+2]	+= dz;
				}
			}

			function createRibbons()
			{
				for (let i=0; i<amount; i++)
				{
					let ribbon = new Ribbon();
					ribbons.push(ribbon);
					targets.push(0, 0, 0);
					scene.addObject(ribbon.mesh);
				}
			}
				
			function loop()
			{
				requestAnimationFrame( loop, renderer.domElement );
				
				for (let i=0; i<ribbons.length; i++)
				{
					px			= targets[i*3];
					py			= targets[i*3+1];
					pz			= targets[i*3+2];
					
					
					let ribbon	= ribbons[i];
					ribbon.update(px, py, pz);
					
					if (counter%10 == 0)	getNextRandomPosition();
				}

				theta += 1;
				camera.position.x = radius * Math.sin( theta * Math.PI / 360 );
				camera.position.y = radius * Math.sin( theta * Math.PI / 360 );
				camera.position.z = radius * Math.cos( theta * Math.PI / 360 );
				
				renderer.render(scene, camera);
				
				camera.update();
				stats.update();
				
				counter++;
			}
			
			
			function Ribbon()
			{
				this.positions			= [];
				this.rotations			= [];
				
				this.x					= 0;
				this.y					= 0;
				this.z					= 0;
				
				this.velX				= 0;
				this.velY				= 0;
				this.velZ				= 0;
				
				this.ax					= randomRange(-movement, movement);
				this.ay					= randomRange(-movement, movement);
				this.az					= randomRange(-movement, movement);
				
				this.width				= randomRange(5, 30);
				this.length				= randomRange(80, 140);
				
				this.geometry				= new THREE.Planegeometryetry(30, 30, 1, this.length-1);
				
				this.material			= new THREE.MeshLambertMaterial( { color:  Math.random()*0xFFFFFF } );
				
				this.mesh				= new THREE.Mesh(this.geometry, this.material);
				this.mesh.dynamic		= true;
				
				this.mesh.rotation.x	= 90;
				this.mesh.doubleSided	= true;
				
				for (let i=0; i<this.length*2; i++)
				{
					this.positions.push(0);
					this.rotations.push(0);
				}
				
				this.update = function(x, y, z)
				{
					
					this.velY	+= (y - this.velY) * friction;
					this.velZ	+= (z - this.velZ) * friction;
					
					this.x		+= this.velX	= (this.velX + (x - this.x) * friction) * spring;
					this.y		+= this.velY	= (this.velY + (y - this.y) * friction) * spring;
					this.z		+= this.velZ	= (this.velZ + (z - this.z) * friction) * spring;
					
					this.positions.pop();
					this.positions.pop();
					this.positions.pop();
					
					this.rotations.pop();
					this.rotations.pop();
					this.rotations.pop();
					
					this.positions.unshift(this.x, this.y, this.z);
					this.rotations.unshift(Math.cos(counter*.1)*this.width, Math.sin(counter*.25)*this.width, 0);
					
					for (let i=0; i<this.length; i++)
					{
						let v1				= this.geometry.vertices[i*2];
						let v2				= this.geometry.vertices[i*2+1];
						
						v1.position.x		= this.positions[i*3] + this.rotations[i*3];
						v1.position.y		= this.positions[i*3+1] + this.rotations[i*3+1];
						v1.position.z		= this.positions[i*3+2] + this.rotations[i*3+2];
						v2.position.x		= this.positions[i*3] - this.rotations[i*3];
						v2.position.y		= this.positions[i*3+1] - this.rotations[i*3+1];
						v2.position.z		= this.positions[i*3+2] - this.rotations[i*3+2];
					}
					
					this.geometry.computeFaceNormals();
					this.geometry.computeVertexNormals();
					this.geometry.__dirtyVertices	= true;
					this.geometry.__dirtyNormals	= true;
				}
			}
			
			function randomRange(min, max)
			{
				return min + Math.random()*(max-min);
			}




*/