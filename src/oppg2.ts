{
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

        clone() {
            return new Vector(this.x, this.y);
        }

        transformed(matrix: Matrix) {
            let newX = this.x * matrix.xVec.x + this.y * matrix.yVec.x;
            let newY = this.x * matrix.xVec.y + this.y * matrix.yVec.y;

            return new Vector(newX, newY);
        }
    }

    class Matrix {
        public xVec: Vector;
        public yVec: Vector;
        public zVec: Vector;

        constructor(xVec: Vector, yVec: Vector);
        constructor(xVec: Vector, yVec: Vector, zVec: Vector);

        constructor(xVec: Vector, yVec: Vector, zVec?: Vector) {
            this.xVec = xVec;
            this.yVec = yVec;
            if (zVec) {
                this.zVec = zVec;
            } else {
                this.zVec = new Vector(0, 0);
            }
        }
    }


    const canvas = document.getElementById('oppg1Canvas') as HTMLCanvasElement;
    //const undoButton = document.getElementById('undo') as HTMLButtonElement;
    const points: Vector[] = [];

    const π = Math.PI
    let operation = "new polygon" // use additive to approximate a circle. use multiplacitive to make the coffecup light art (if you shine light at an angle into a coffee cup)
    let clickMousePos = new Vector(0, 0)
    let currentMousePos = new Vector(0, 0)
    let clicking = false;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    draw()

    function draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'black';
        drawPolygon();
    }

    function drawPolygon() {
        let totalPoints = points.length;
        if (totalPoints === 0) return;
        for (let i = 0; i < totalPoints; i++) {
            ctx.moveTo(points[i].x, points[i].y);
            ctx.beginPath();
            ctx.arc(points[i].x, points[i].y, 5, 0, 2 * π);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < totalPoints; i++) {
            ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.stroke()
        if (operation !== "new polygon") ctx.closePath()
        else {
            ctx.beginPath();
            ctx.setLineDash([10, 20]);
            ctx.moveTo(points[totalPoints - 1].x, points[totalPoints - 1].y);
            ctx.lineTo(currentMousePos.x, currentMousePos.y);
            ctx.stroke()
            ctx.beginPath();
            ctx.arc(currentMousePos.x, currentMousePos.y, 20, 0, 2 * π);
            ctx.stroke();
            if (totalPoints > 1) {
                ctx.beginPath();
                ctx.setLineDash([3, 10]);
                ctx.moveTo(currentMousePos.x, currentMousePos.y);
                ctx.lineTo(points[0].x, points[0].y);
                ctx.stroke()
            }
            ctx.setLineDash([]);
        }
    }

    canvas.addEventListener("mousemove", function (e) {
        let mouseX = e.clientX - canvas.offsetLeft;
        let mouseY = e.clientY - canvas.offsetTop;
        currentMousePos = new Vector(mouseX, mouseY);
        draw()
    }, false);

    canvas.addEventListener("mousedown", function () {
        clicking = true;
        clickMousePos = currentMousePos.clone();

        switch (operation) {
            case 'new polygon':
                points.push(new Vector(currentMousePos.x, currentMousePos.y));
                draw();
                break;
            case 'translation':
        }
    }, false);

    canvas.addEventListener("mouseup", function () {
        clicking = false;
        console.log("click toggle: " + clicking + ", " +clickMousePos)
    }, false);
}
