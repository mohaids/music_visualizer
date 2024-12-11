function main(){
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; // for scaling
    canvas.height = window.innerHeight; // for scaling
    class Bar {
        constructor(x, y, width, height, color, index){
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.index = index;
        }
        update(audioInput){
            //this.height = micInput;
            const sound = audioInput * 1000
            if (sound > this.height){
                this.height = sound;
            } else{
                this.height -= this.height * 0.05;
            }
        }
        draw(context){ // vid stops @ 37:44 [41.38]
            //context.fillStyle = this.color;
            //context.fillRect(this.x, this.y, this.width, this.height);
            context.strokeStyle = this.color;
            context.save();
            context.translate(canvas.width/2, canvas.height/2);
            context.rotate(this.index * 0.05);
            
            context.beginPath();
            context.moveTo(100, 100);
            context.lineTo(0, this.height);
            context.stroke();
            context.restore();
        }
    }
    //const bar1 = new Bar(10, 10, 100, 200, 'blue');
    //const microphone = new Microphone();
    let bars = [];
    let barWidth = canvas.width/256;
    function createBars(){
        for (let i = 0; i < 256; i++){
            let color = 'hsl(' + i * 2 +', 100%, 50%)'; // hsl color (hue, saturation, lightness)
            bars.push(new Bar(i * barWidth, canvas.height/2, 1, 20, color, i));
        }
    }
    createBars();
    console.log(bars)
    function animate(){
        if (window.audioSource){
            const analyzer = window.audioSource.context.createAnalyzer();
            window.audioSource.connect(analyzer);
            analyzer.fftSource = 512;
            const bufferLength = analyzer.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            analyzer.getByteFrequencyData(dataArray);
            // generates audio samples from microphone
            //const samples = microphone.getSamples();
            //animate bars based on microphone data
            bars.forEach(function(bar, i){
                bar.update(dataArray[i] / 128);
                bar.draw(ctx); // context argument
            });
        }
        
        requestAnimationFrame(animate);
        
    }
    animate();
}