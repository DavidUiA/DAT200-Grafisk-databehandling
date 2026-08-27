{
    const canvas = document.getElementById('canvasInstructure') as HTMLCanvasElement;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    const p = 0.1

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    let invert = false;
    for (let i = 0; i < 4; i++) {
        invert = !invert;
        for (let j = 0; j < 4; j++) {
            invert = !invert;
            drawSquare(75 + i * 150, 75 + j * 150, 75, invert);
        }
    }


    function drawSquare(x: number, y: number, radius: number, invert = false) {
        let percent = p
        if (invert) percent = 1 - p

        drawSquarePart(
            x - radius,
            y - radius,
            x + radius,
            y - radius,
            x + radius,
            y + radius,
            x - radius,
            y + radius,
            percent,
            25,
        );
    }

    function drawSquarePart(
        p0x: number,
        p0y: number,
        p1x: number,
        p1y: number,
        p2x: number,
        p2y: number,
        p3x: number,
        p3y: number,
        percent: number,
        n: number,
    ) {
        ctx.beginPath();
        ctx.moveTo(p0x, p0y);
        ctx.lineTo(p1x, p1y);
        ctx.lineTo(p2x, p2y);
        ctx.lineTo(p3x, p3y);
        ctx.lineTo(p0x, p0y);
        ctx.stroke();
        ctx.closePath();

        if (n != 0) drawSquarePart(
            lerp(p0x, p1x, percent),
            lerp(p0y, p1y, percent),
            lerp(p1x, p2x, percent),
            lerp(p1y, p2y, percent),
            lerp(p2x, p3x, percent),
            lerp(p2y, p3y, percent),
            lerp(p3x, p0x, percent),
            lerp(p3y, p0y, percent),
            percent,
            n-1,
        );
    }

    function lerp(a: number, b: number, progress: number) {
        return a + (b - a) * progress;
    }

}
