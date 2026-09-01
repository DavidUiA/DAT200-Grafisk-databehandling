{
    const canvas = document.getElementById('oppg1Canvas') as HTMLCanvasElement;
    const nInput = document.getElementById('n') as HTMLInputElement;
    const kInput = document.getElementById('k') as HTMLInputElement;
    const aInput = document.getElementById('a') as HTMLInputElement;

    const π = Math.PI
    const CIRCLE_RADIUS = 255
    const circleCenter = 300;
    let n = nInput.valueAsNumber;
    let k = kInput.valueAsNumber;
    let additive = false // use additive to approximate a circle. use multiplacitive to make the coffecup light art (if you shine light at an angle into a coffee cup)

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    draw()

    function draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'black';
        ctx.beginPath();
        if (!additive) ctx.arc(circleCenter, circleCenter, CIRCLE_RADIUS, 0, 2*π) // sirkel
        ctx.stroke()

        for (let i = 0; i < n; i++) { // drawer k linjer med θ fordelt fra 0-2π
            drawLine((i / n) * 2 * π);
        }
    }

    function drawLine(θ: number) { // lager ei linje mellom θ og ω = θ * kx
        const x0 = CIRCLE_RADIUS * Math.cos(θ) + circleCenter;
        const y0 = CIRCLE_RADIUS * Math.sin(θ) + circleCenter;
        ctx.beginPath();
        ctx.moveTo(x0, y0);

        let ω: number
        if (additive) {
            ω = θ + (k / n) * 2 * π; // add k steps
        } else {
            ω = θ * k;
        }

        const x1 = CIRCLE_RADIUS * Math.cos(ω) + circleCenter;
        const y1 = CIRCLE_RADIUS * Math.sin(ω) + circleCenter;
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.closePath();
    }



    nInput.addEventListener('input', () => {
        n = nInput.valueAsNumber;
        kInput.max = n.toString()
        draw()
    })
    kInput.addEventListener('input', () => {
        k = kInput.valueAsNumber;
        draw()
    });
    aInput.addEventListener('input', () => {
        additive = aInput.checked;
        draw();
    });

    class Vector {
        constructor(
            public x: number,
            public y: number,
        ) {}

        added(other: Vector) {
            return new Vector(this.x + other.x, this.y + other.y);
        }

        subtracted(other: Vector) {
            return new Vector(this.x - other.x, this.y - other.y);
        }

        scaled(center: Vector, scale: Vector) {
            let relPos = this.subtracted(center)

            return new Vector(this.x + other.x, this.y + other.y);
        }
    }
}
