let glslify = require('glslify');

class Ribbon {

  constructor( scene, emitter ) {

    this.scene = scene;
    
    this.startPoint = new THREE.Vector3( -15, 0, 0 );

    this.endPoint = new THREE.Vector3( 40, 5, 0 );

    this.segments = 30;

    this.max = 1000;

    this.vertexShader = glslify('../../vertex-shaders/ribbon.vert');

    this.fragmentShader = glslify('../../fragment-shaders/simple.frag');

    this.material = new THREE.ShaderMaterial({
            uniforms: { 
                time: { type: "f", value: 0 },
                opacity: { type: "f", value: 1.0 },
                endpoint: { type: "v3", value: this.endPoint }
            },
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader,
            shading: THREE.SmoothShading,
            wireframe: true
        });

    let geometry = new THREE.PlaneGeometry( 0.1, 10, 30, 30 );

    // this.geometry = geometry;

    this.geometry = new THREE.BufferGeometry();
    // let verticesCount = geometry.vertices.length;
    let i = 0;
    this.positions = new Float32Array( this.max * 3 );
    this.velocities = new Float32Array( this.max * 3 );
    let lateFactor = 0.5;
    let currentPos = 0;

    console.log( this.positions.length, this.velocities.length );
    while ( i < this.positions.length ) {

      this.positions[ i ] = this.startPoint.x + currentPos;
      this.positions[ i + 1 ] = this.startPoint.y + currentPos;
      this.positions[ i + 2 ] = 0;

      this.velocities[ i ] = (Math.random() - 0.5) * 0.55;
      this.velocities[ i + 1] = (Math.random() - 0.5) * 0.55;
      this.velocities[ i + 2] = (Math.random() - 0.5) * 0.55;

      currentPos += 0.005;
      lateFactor += 0.1;
      i+=3;
    }

    console.log( this.positions[ 299 ], this.velocities[ 299 ] );
    


    this.geometry.addAttribute('position', new THREE.BufferAttribute( this.positions, 3).setDynamic(true));
    this.geometry.addAttribute('velocity', new THREE.BufferAttribute( this.velocities, 3).setDynamic(true));

    this.geometry.dynamic = true;
    this.mesh = new THREE.Points( this.geometry, this.material );

    this.object = new THREE.Object3D(); 

    this.object.add( this.mesh );
    // this.mesh.position.x = this.startPoint.x;
    // this.mesh.position.y = this.startPoint.y;
    // this.mesh.position.z = this.startPoint.z;

    this.clock = Date.now();

    this.scene.add( this.mesh );

  }

  getMesh() {

        return this.mesh;

  }

  update( soundData ) {

    let i = 0;
    this.positions = new Float32Array( this.max * 3 );
    this.velocities = new Float32Array( this.max * 3 );
    let time = ( Date.now() - this.clock ) * 0.0008;

    while ( i < this.positions.length ) {

      this.positions[ i ] += this.velocities[ i ] * time ;
    // vPosition.y = sin( pow( 2.0, sin( time ) ) ) ;;
      this.positions[ i + 1 ] += Math.sin( Math.pow( 2.0, Math.sin( time ) ) ) ;
      // this.positions[ i + 2 ] = 0;

      // this.velocities[ i ] = Math.random() + lateFactor;
      // this.velocities[ i + 1] = Math.random() + lateFactor;
      // this.velocities[ i + 2] = Math.random() * 2;

      i+=3;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.material.uniforms["time"].value = time;
  }

  getDistance( v1, v2 ) {

    return Math.sqrt( ( v1.x - v2.x ) * ( v1.x - v2.x ) + ( v1.y - v2.y ) * ( v1.y - v2.y ) );

  }
}

export { Ribbon };
