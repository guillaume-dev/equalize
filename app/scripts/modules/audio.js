// Want to customize things ?
// http://www.airtightinteractive.com/demos/js/uberviz/audioanalysis/

class Audio  {

    constructor( emitter ) {

        this.emitter = emitter;
        this.context = new AudioContext();

        this.bufferSize = 1024; 
        this.buffer;

        this.analyser = this.context.createAnalyser();
        this.analyser.fftSize = this.bufferSize;
        this.binCount = this.analyser.frequencyBinCount; // this.bufferSize / 2

        this.dataFreqArray = new Uint8Array( this.binCount );
        this.dataTimeArray = new Uint8Array( this.binCount );

        this.binds = {};
        this.binds.onLoad = this.onLoad.bind( this );
    }

    load( url ) {

        this.request = new XMLHttpRequest();
        this.request.open( "GET", url, true );
        this.request.responseType = "arraybuffer";

        this.request.onload = this.binds.onLoad;
        this.request.send();
    }

    onLoad() {
        this.context.decodeAudioData( this.request.response, ( buffer ) => {

            this.buffer = buffer;

            this.emitter.emit( "loaded" );
            console.log('loaded');
        }, () => {} );
    }

    start() {
        this.source = this.context.createBufferSource();
        this.source.connect( this.analyser );
        this.source.buffer = this.buffer;
        this.source.connect( this.context.destination );
        this.source.start( 0 );

        this.source.onended = () => {
            this.emitter.emit( "ended" );
            console.log("ended");
        };
    }

    getData() {

        this.analyser.getByteFrequencyData( this.dataFreqArray );
        this.analyser.getByteTimeDomainData( this.dataTimeArray );

        let time = this.dataTimeArray;
        let length = time.length;
        let average = 0;

        for(var i = 0; i < length; i++) {
          average += this.dataTimeArray[ i ];
        }

        average /= 512;

        let frequence = Math.abs( average - 128 ) * 10;

        return frequence;
        // this.analyser.getByteFrequencyData( this.dataFreqArray );
        // this.analyser.getByteTimeDomainData( this.dataTimeArray );
        // return {
        //   freq: this.dataFreqArray, // from 0 - 256, no sound = 0
        //   time: this.dataTimeArray // from 0 -256, no sound = 128
        // };
    }

}

export { Audio };

