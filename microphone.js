class Microphone {
    constructor(){
        this.initialized = false;
        navigator.mediaDevices.getUserMedia({audio: true})
        .then(function(stream){ // promise if audio is recieved
            this.audioContext = new AudioContext(); // part of Web Audio API - properties to analyze audio
            this.microphone = this.audioContext.createMediaStreamSource(stream); // converts raw audop stream to audio nodes (format that api can work with)
            this.analyzer = this.audioContext.createAnalyser(); // used to extract audio time & frequency data 4 visualizations
            this.analyzer.fftSize = 256; // (fast fourier transformation => to slice audio into equal # of samples)
            const bufferLength = this.analyzer.frequencyBinCount; // equal to 1/2 of fftSize
            this.dataArray = new Uint8Array(bufferLength);
            this.microphone.connect(this.analyzer);
            this.initialized = true;
        }.bind(this)).catch(function(err){
            alert(err);
        })
    }
    getSamples(){ // returns array of audio samples 4 visualizer
        this.analyzer.getByteTimeDomainData(this.dataArray);
        let normSamples = [...this.dataArray].map(e => e/128 - 1);
        return normSamples;
    }
    getVolume(){ // returns single average value
        this.analyzer.getByteTimeDomainData(this.dataArray);
        let normSamples = [...this.dataArray].map(e => e/128 - 1);
        let sum = 0;
        for (let i = 0; i < normSamples.length; i++){
            sum += normSamples[i] * normSamples[i];
        }
        let volume = Math.sqrt(sum / normSamples.length);
        return volume;
    }
}