function main() {
    const canvas = document.getElementById('myCanvas');
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    
        const startButton = document.getElementById('startButton');
    
        let audioContext;
        let analyser;
        let dataArray;
    
        startButton.addEventListener('click', async function () {
            try {
                // Request tab sharing with audio
                const stream = await navigator.mediaDevices.getDisplayMedia({ 
                    video: true,
                    audio: true
                });
    
                // Check if audio track is present
                const audioTrack = stream.getAudioTracks()[0];
                if (!audioTrack) {
                    throw new Error('No audio track found. Please make sure to share a tab with audio.');
                }
    
                // Initialize audio context if not already done
                if (!audioContext) {
                    audioContext = new AudioContext();
                    analyser = audioContext.createAnalyser();
                    analyser.fftSize = 512;
                    const bufferLength = analyser.frequencyBinCount;
                    dataArray = new Uint8Array(bufferLength);
                }
    
                // Create and connect audio source from the stream
                const audioSource = audioContext.createMediaStreamSource(stream);
                audioSource.connect(analyser);
    
                startVisualizer();
    
                // Handle stream stop
                stream.getAudioTracks()[0].onended = () => {
                    console.log('Tab sharing stopped');
                };
    
            } catch (error) {
                console.error('Error starting tab capture:', error);
                alert('Error starting tab capture: ' + error.message);
            }
        });
    
        function startVisualizer() {
            // Define barCount once at the top level
            const barCount = 150;
    
            class Bar {
                constructor(x, y, width, height, color, index) {
                    this.x = x;
                    this.y = y;
                    this.width = width;
                    this.height = height;
                    this.color = color;
                    this.index = index;
                    this.minHeight = 5;
                }
    
                update(audioInput) {
                    const sound = audioInput * 300;
                    if (sound > this.height) {
                        this.height = sound;
                    } else {
                        this.height -= this.height * 0.1;
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
                    
                    const angle = (this.index * (Math.PI * 2) / barCount);
                    context.rotate(angle);
    
                    context.beginPath();
                    context.moveTo(0, radius);
                    context.lineTo(0, radius + this.height);
                    context.stroke();
                    context.restore();
                }
            }
    
            let bars = [];
    
            // Create exactly barCount number of bars
            for (let i = 0; i < barCount; i++) {
                let color = `hsl(${i * 360 / barCount}, 100%, 50%)`;
                bars.push(new Bar(0, 0, 1, 20, color, i));
            }
    
            function animate() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                analyser.getByteFrequencyData(dataArray);
    
                // Slice to get a subset of the frequencies
                const subsetData = dataArray.slice(0, barCount);
    
                bars.forEach((bar, i) => {
                    const normalizedValue = subsetData[i] / 255;
                    const valueWithMinimum = Math.max(normalizedValue, 0.1);
                    bar.update(valueWithMinimum);
                    bar.draw(ctx);
                });
    
                requestAnimationFrame(animate);
            }
            animate();
        }
    }