// Want to customize things ?
// http://www.airtightinteractive.com/demos/js/uberviz/audioanalysis/

class Audio  {

    constructor( emitter ) {

        this.emitter = emitter;
        this.context = new AudioContext();

        this.bufferSize = 512; 

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

        this.request.onreadystatechange = () => {
            if (this.request.readyState == 4 && (this.request.status == 200 || this.request.status == 0)) {
                this.emitter.emit( "ready" );
            }
        };
        this.request.open( "GET", url, true );
        this.request.responseType = "arraybuffer";

        this.emitter.on( "start", () => {
            this.onLoad();
        });
        this.request.send();
    }

    onLoad() {
        this.context.decodeAudioData( this.request.response, ( buffer ) => {

            this.source = this.context.createBufferSource();
            this.source.connect( this.analyser );
            this.source.buffer = buffer;
            this.source.connect( this.context.destination );
            this.source.start( 0 );

        }, () => {
            console.log( "error" )
        } );
    }

    getData() {
        this.analyser.getByteFrequencyData( this.dataFreqArray );
        this.analyser.getByteTimeDomainData( this.dataTimeArray );
        return {
          freq: this.dataFreqArray, // from 0 - 256, no sound = 0
          time: this.dataTimeArray // from 0 -256, no sound = 128
        };
    }

}

export { Audio };

