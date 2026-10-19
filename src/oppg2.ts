{
    const NEW_POLYGON = "nytt polygon"
    const MOVE_POINT = "flytt punkt"

    const MOVE_POINT_RADIUS = 16

    class Vector {
        constructor(
            public x: number,
            public y: number,
        ) {}

        subtracted(other: Vector) {
            return new Vector(this.x - other.x, this.y - other.y);
        }

        clone() {
            return new Vector(this.x, this.y);
        }

        distance(other: Vector): number {
            return Math.hypot(this.x - other.x, this.y - other.y);
        }
    }


    const canvas = document.getElementById('oppg1Canvas') as HTMLCanvasElement;
    const mouseOffsetP = document.getElementById('mouseOffset') as HTMLParagraphElement;

    const operatorSelector = document.getElementById('oper') as HTMLInputElement;
    //const undoButton = document.getElementById('undo') as HTMLButtonElement;
    let points: Vector[] = [];

    const π = Math.PI
    let operation = NEW_POLYGON; // use additive to approximate a circle. use multiplacitive to make the coffecup light art (if you shine light at an angle into a coffee cup)
    let selectedPoint = -1
    let clickMousePos = new Vector(0, 0)
    let currentMousePos = new Vector(0, 0)
    let mouseClickOffset = new Vector(0, 0)
    let clicking = false;

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    draw()

    function draw() {
        ctx.fillStyle = 'yellow'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        ctx.fillStyle = 'black'
        ctx.strokeStyle = 'black'
        ctx.lineWidth = 1
        drawLine()
        let segments = points.length - 3 // 3rd degree means x + 3 points for x segments

        ctx.strokeStyle = '#000088'
        ctx.lineWidth = 3
        for (let i = 0; i < segments; i++) {
            drawBSplineSegment(i)
        }
        if (segments >= 0 && operation == NEW_POLYGON) {
            drawBSplineSegment(segments)
        }
    }

    function drawLine() {
        let totalPoints = points.length
        if (totalPoints === 0) return
        for (let i = 0; i < totalPoints; i++) { // circles around the points
            let loc = points[i]
            ctx.moveTo(loc.x, loc.y)
            ctx.beginPath()
            ctx.arc(loc.x, loc.y, 5, 0, 2 * π)
            ctx.fill()
            if (i == selectedPoint) {
                ctx.strokeStyle = 'red'
                ctx.lineWidth = 2
                if (!clicking) {
                    ctx.setLineDash([4, 4])
                }
                ctx.beginPath()
                ctx.arc(loc.x, loc.y, MOVE_POINT_RADIUS, 0, 2 * π)
                ctx.stroke()

                ctx.strokeStyle = 'black'
                ctx.lineWidth = 1
                ctx.setLineDash([])
            }
        }
        ctx.beginPath()
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < totalPoints; i++) { // lines between points
            ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.stroke()
        if (operation == NEW_POLYGON) {
            // line from last point to mouse
            ctx.beginPath()
            ctx.setLineDash([10, 20])
            ctx.moveTo(points[totalPoints - 1].x, points[totalPoints - 1].y)
            ctx.lineTo(currentMousePos.x, currentMousePos.y)
            ctx.stroke()
            // circle around mouse
            ctx.beginPath()
            ctx.arc(currentMousePos.x, currentMousePos.y, 20, 0, 2 * π)
            ctx.stroke()
            ctx.setLineDash([])
        }
    }

    function drawBSplineSegment(segment: number) {
        let stepSize = 10
        let curvePoints: Vector[] = []
        let localPoints: Vector[] = [points[segment], points[segment + 1], points[segment + 2]]
        if (segment == points.length - 3) {
            localPoints.push(currentMousePos)
            ctx.setLineDash([4, 4])
        } else {
            localPoints.push(points[segment + 3])
        }

        let Δt = 1.0 / stepSize
        for (let i = 0; i <= stepSize; i++) {
            let t = Δt * i
            let x =
                  localPoints[0].x/6 *               (1-t)**3
                + localPoints[1].x/6 * ((2-t)**3 - 4*(1-t)**3)
                + localPoints[2].x/6 * ((1+t)**3 - 4*t**3)
                + localPoints[3].x/6 *               t**3
            let y =
                  localPoints[0].y/6 *               (1-t)**3
                + localPoints[1].y/6 * ((2-t)**3 - 4*(1-t)**3)
                + localPoints[2].y/6 * ((1+t)**3 - 4*t**3)
                + localPoints[3].y/6 *               t**3
            curvePoints.push(new Vector(x, y))
        }
        ctx.beginPath()
        ctx.moveTo(curvePoints[0].x, curvePoints[0].y)
        for (let p = 1; p <= stepSize; p++) {
            ctx.lineTo(curvePoints[p].x, curvePoints[p].y)
        }
        ctx.stroke()
        ctx.setLineDash([])
    }

    canvas.addEventListener("mousemove", function (e) {
        let mouseX = e.clientX - canvas.offsetLeft;
        let mouseY = e.clientY - canvas.offsetTop;
        currentMousePos = new Vector(mouseX, mouseY);
        if(clicking) mouseOffsetP.innerText =
            'mouseOffset:  [' + mouseClickOffset.x + ', ' + mouseClickOffset.y + ']';
        switch (operation) {
            case MOVE_POINT: {
                if (!clicking) {
                    let pointDistance = 9999;
                    for (let i = 0; i < points.length; i++) {
                        let dist = points[i].distance(currentMousePos)
                        if (dist < MOVE_POINT_RADIUS && dist < pointDistance) {
                            pointDistance = dist
                            selectedPoint = i
                        }
                    }
                    if (pointDistance >= MOVE_POINT_RADIUS) selectedPoint = -1
                } else if (selectedPoint >= 0) {
                    points[selectedPoint] = currentMousePos.subtracted(mouseClickOffset)
                }
                break
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
            case MOVE_POINT:
                if (selectedPoint >= 0) mouseClickOffset = clickMousePos.subtracted(points[selectedPoint])
        }
    }, false);

    canvas.addEventListener(
        'mouseup',
        function () {
            clicking = false;
        },
        false,
    );

    operatorSelector.addEventListener('input', () => {
        operation = operatorSelector.value;
        if (operation === NEW_POLYGON) {
            points = []
        }
        draw()
    });
}
