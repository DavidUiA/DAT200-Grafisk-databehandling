{
    const NEW_POLYGON = "nytt polygon"
    const TRANSLATION = "translasjon"
    const ROTATION = "rotasjon"
    const SCALING = "skaléring"

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

        flipped() {
            return new Vector(-this.x, -this.y);
        }

        transformed(matrix: Matrix) {
            let newX = this.x * matrix.xVec.x + this.y * matrix.yVec.x + matrix.zVec.x;
            let newY = this.x * matrix.xVec.y + this.y * matrix.yVec.y + matrix.zVec.y;

            return new Vector(newX, newY);
        }
    }

    class Matrix { // a pseudo-3x3 matrix where x.z, y.z = 0 and z.z = 1
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

        static Identity() {
            return new Matrix(new Vector(1, 0), new Vector(0, 1));
        }

        static Translation(translation: Vector) {
            let m = this.Identity();
            m.zVec = translation;
            return m;
        }

        static Rotation(θ: number) {
            return new Matrix(
                new Vector(Math.cos(θ), Math.sin(θ)),
                new Vector(-Math.sin(θ), Math.cos(θ)),
            )
        }

        static Scaling(scale: Vector) {
            return new Matrix(
                new Vector(scale.x, 0),
                new Vector(0, scale.y),
            )
        }

        multiply(matrix: Matrix) {
            // simplified, doesnt acount for 3rd area with just 0s and a 1
            const newXVec = new Vector(
                this.xVec.x * matrix.xVec.x + this.yVec.x * matrix.xVec.y,
                this.xVec.y * matrix.xVec.x + this.yVec.y * matrix.xVec.y,
            );
            const newYVec = new Vector(
                this.xVec.x * matrix.yVec.x + this.yVec.x * matrix.yVec.y,
                this.xVec.y * matrix.yVec.x + this.yVec.y * matrix.yVec.y,
            );
            const newZVec = new Vector(
                this.xVec.x * matrix.zVec.x +
                    this.yVec.x * matrix.zVec.y +
                    this.zVec.x,
                this.xVec.y * matrix.zVec.x +
                    this.yVec.y * matrix.zVec.y +
                    this.zVec.y,
            );
            this.xVec = newXVec;
            this.yVec = newYVec;
            this.zVec = newZVec;
            return this;
        }

        multiplyLeft(matrix: Matrix) {
            // simplified, doesnt acount for 3rd area with just 0s and a 1
            const newXVec = new Vector(
                matrix.xVec.x * this.xVec.x + matrix.yVec.x * this.xVec.y,
                matrix.xVec.y * this.xVec.x + matrix.yVec.y * this.xVec.y,
            );
            const newYVec = new Vector(
                matrix.xVec.x * this.yVec.x + matrix.yVec.x * this.yVec.y,
                matrix.xVec.y * this.yVec.x + matrix.yVec.y * this.yVec.y,
            );
            const newZVec = new Vector(
                matrix.xVec.x * this.zVec.x +
                    matrix.yVec.x * this.zVec.y +
                    matrix.zVec.x,
                matrix.xVec.y * this.zVec.x +
                    matrix.yVec.y * this.zVec.y +
                    matrix.zVec.y,
            );
            this.xVec = newXVec;
            this.yVec = newYVec;
            this.zVec = newZVec;
        }
    }


    const canvas = document.getElementById('oppg1Canvas') as HTMLCanvasElement;
    const mouseOffsetP = document.getElementById('mouseOffset') as HTMLParagraphElement;
    const centerSelectP = document.getElementById('centerSelect',) as HTMLParagraphElement;

    const operatorSelector = document.getElementById('oper') as HTMLInputElement;
    //const undoButton = document.getElementById('undo') as HTMLButtonElement;
    let points: Vector[] = [];
    const transformed: Vector[] = []; // cache
    let operations: Matrix[] = []
    let currentTransformation: Matrix = new Matrix(new Vector(1, 0), new Vector(0, 1));
    let newTransformation: Matrix = new Matrix(new Vector(1, 0), new Vector(0, 1));

    const π = Math.PI
    let operation = NEW_POLYGON; // use additive to approximate a circle. use multiplacitive to make the coffecup light art (if you shine light at an angle into a coffee cup)
    let isSelectingCenter = true;
    let selectedCenterPoint = new Vector(0, 0)
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
            let loc = points[i].transformed(currentTransformation).transformed(newTransformation);
            transformed[i] = loc;
            ctx.moveTo(loc.x, loc.y);
            ctx.beginPath();
            ctx.arc(loc.x, loc.y, 5, 0, 2 * π);
            ctx.fill();
        }
        ctx.beginPath();
        ctx.moveTo(transformed[0].x, transformed[0].y);
        for (let i = 1; i < totalPoints; i++) {
            ctx.lineTo(transformed[i].x, transformed[i].y);
        }
        if (operation !== NEW_POLYGON) {
            ctx.closePath();
            ctx.stroke();

            if (!isSelectingCenter) {
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 3;
                let center = selectedCenterPoint;
                ctx.beginPath();
                ctx.moveTo(center.x - 5, center.y - 5);
                ctx.lineTo(center.x + 5, center.y + 5);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(center.x - 5, center.y + 5);
                ctx.lineTo(center.x + 5, center.y - 5);
                ctx.stroke();
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 1;
            }
        } else {
            ctx.stroke();
            ctx.beginPath();
            ctx.setLineDash([10, 20]);
            ctx.moveTo(points[totalPoints - 1].x, points[totalPoints - 1].y);
            ctx.lineTo(currentMousePos.x, currentMousePos.y);
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(currentMousePos.x, currentMousePos.y, 20, 0, 2 * π);
            ctx.stroke();
            if (totalPoints > 1) {
                ctx.beginPath();
                ctx.setLineDash([3, 10]);
                ctx.moveTo(currentMousePos.x, currentMousePos.y);
                ctx.lineTo(points[0].x, points[0].y);
                ctx.stroke();
            }
            ctx.setLineDash([]);
        }
    }

    canvas.addEventListener("mousemove", function (e) {
        let mouseX = e.clientX - canvas.offsetLeft;
        let mouseY = e.clientY - canvas.offsetTop;
        currentMousePos = new Vector(mouseX, mouseY);
        const mouseOffset = currentMousePos.subtracted(clickMousePos)
        const currentCenterOffset = currentMousePos.subtracted(selectedCenterPoint);
        const clickCenterOffset = clickMousePos.subtracted(selectedCenterPoint);
        if(clicking) mouseOffsetP.innerText =
            'mouseOffset:  [' + mouseOffset.x + ', ' + mouseOffset.y + ']';
        switch (operation) {
            case TRANSLATION:
                if (clicking) {
                    newTransformation.zVec = mouseOffset;
                    draw();
                }
                break;
            case ROTATION:
                if (clicking && !isSelectingCenter) {
                    let β0 = Math.atan2(
                        clickCenterOffset.y,
                        clickCenterOffset.x,
                    ); // vinkel man trykka
                    let β1 = Math.atan2(
                        currentCenterOffset.y,
                        currentCenterOffset.x,
                    );
                    let θ = β1 - β0
                    let p = Matrix.Translation(selectedCenterPoint)
                    let pInv = Matrix.Translation(selectedCenterPoint.flipped());
                    let c = Matrix.Rotation(θ)
                    newTransformation = p.multiply(c).multiply(pInv)
                    draw();
                }
                break;
            case SCALING:
                if (clicking && !isSelectingCenter) {
                    let p = Matrix.Translation(selectedCenterPoint);
                    let pInv = Matrix.Translation(
                        selectedCenterPoint.flipped(),
                    );
                    let d = Matrix.Scaling(
                        new Vector(
                            currentCenterOffset.x / clickCenterOffset.x,
                            currentCenterOffset.y / clickCenterOffset.y,
                        ),
                    );
                    newTransformation = p.multiply(d).multiply(pInv);
                    draw();
                }
        }
        draw()
    }, false);

    canvas.addEventListener("mousedown", function () {
        clicking = true;
        clickMousePos = currentMousePos.clone();

        switch (operation) {
            case NEW_POLYGON:
                points.push(new Vector(currentMousePos.x, currentMousePos.y));
                draw();
                break;
            case ROTATION:
            case SCALING:
                if (isSelectingCenter) {
                    selectedCenterPoint = clickMousePos
                }
                draw();
        }
    }, false);

    canvas.addEventListener(
        'mouseup',
        function () {
            clicking = false;
            switch (operation) {
                case ROTATION:
                case SCALING:
                    if (!isSelectingCenter) {
                        applyCurrentTransformation();
                        isSelectingCenter = true;
                        centerSelectP.innerText = 'Currently selecting center';
                    } else {
                        isSelectingCenter = false;
                        centerSelectP.innerText = 'Center is selected';
                    }
                    break;
                default:
                    applyCurrentTransformation();
            }

        },
        false,
    );

    function applyCurrentTransformation() {
        currentTransformation.multiplyLeft(newTransformation);
        operations.push(newTransformation);
        newTransformation = new Matrix(new Vector(1, 0), new Vector(0, 1));
    }

    operatorSelector.addEventListener('input', () => {
        operation = operatorSelector.value;
        if (operation === NEW_POLYGON) {
            points = []
            operations = []
            currentTransformation = new Matrix(new Vector(1, 0), new Vector(0, 1));
            newTransformation = new Matrix(new Vector(1, 0), new Vector(0, 1));
        }
        newTransformation = new Matrix(new Vector(1, 0), new Vector(0, 1));
        draw()
    });
}
