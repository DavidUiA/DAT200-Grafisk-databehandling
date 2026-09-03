{
    const canvas = document.getElementById('oppg1Canvas') as HTMLCanvasElement;

    const π = Math.PI
    const circleCenter = 300;
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

        scaled(scale: Vector) {
            return new Vector(this.x * scale.x, this.y + scale.y);
        }

        transformed(matrix: Matrix) {
            let newX = this.x * matrix.xVec.x + this.y * matrix.yVec.x;
            let newY = this.x * matrix.xVec.y + this.y * matrix.yVec.y;

            return new Vector(newX, newY);
        }
    }

    class Matrix {
        constructor(
            public xVec: Vector,
            public yVec: Vector,
        ) {}
    }
}
