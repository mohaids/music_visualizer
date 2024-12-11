function main() {
    const canvas = document.getElementById('myCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const audioElement = document.getElementById('audioPlayer');
    const startButton = document.getElementById('startButton');
    let audioContext;
    let audioSource;
    let analyser;
    let dataArray;
    let audioSourceConnected = false;
    startButton.addEventListener('click', function () {
        if (!audioContext) {
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            const bufferLength = analyser.frequencyBinCount;
            dataArray = new Uint8Array(bufferLength);
        }
        if (!audioSourceConnected) {
            audioSource = audioContext.createMediaElementSource(audioElement);
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);
            audioSourceConnected = true;
        }
        audioElement.play();
        startVisualizer();
    });
    function startVisualizer() {
        class Bar {
            constructor(x, y, width, height, color, index) {
                this.x = x;
                this.y = y;
                this.width = width;
                this.height = height;
                this.color = color;
                this.index = index;
                this.minHeight = 20;
            }
            update(audioInput) {
                // boost the sound amplitude with a multiplier 
                const sound = Math.log10(1 + audioInput) * 1500; // ideally log should help it look better visually
                if (sound > this.height) {
                    this.height = sound; // grow bar
                } else {
                    this.height -= this.height * 0.1; // smooth shrink
                    if (this.height < this.minHeight) {
                        this.height = this.minHeight;
                    }
                }
            }
            draw(context) {
                context.strokeStyle = this.color;
                context.save();
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;
                const radius = 200;
                context.translate(centerX, centerY);
                context.rotate(this.index * (Math.PI * 2 / barCount));
                // draw bars outward from the edge of the black hole
                context.beginPath();
                context.moveTo(0, radius);
                context.lineTo(0, radius + this.height); 
                context.stroke();
                context.restore();
            }
        }
        let bars = [];
        const barCount = 256;
        function createBars() {
            for (let i = 0; i < barCount; i++) {
                let color = `hsl(${i * 360 / barCount}, 100%, 50%)`; 
                bars.push(new Bar(0, 0, 1, 20, color, i));
            }
        }
        createBars();
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            analyser.getByteFrequencyData(dataArray);
            bars.forEach((bar, i) => {
                bar.update(dataArray[i] / 128); 
                bar.draw(ctx);
            });
            requestAnimationFrame(animate);
        }
        animate();
    }
}