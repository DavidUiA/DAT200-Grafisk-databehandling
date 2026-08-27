{
    const canvas = document.getElementById('oppg2Canvas') as HTMLCanvasElement;
    const CIRCLE_RADIUS = 10

    let strikkX = 300
    let strikkY = 300
    let isDragging = false;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    draw()

    function draw() {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'red';
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.lineTo(450, 150);
        ctx.lineTo(450, 450);
        ctx.lineTo(150, 450);
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.moveTo(150, 300);
        ctx.lineTo(strikkX, strikkY);
        ctx.stroke()
        ctx.moveTo(450, 300);
        ctx.lineTo(strikkX, strikkY);
        ctx.stroke();

        ctx.arc(strikkX, strikkY, CIRCLE_RADIUS, 0, 2*Math.PI)
        ctx.stroke()
    }

    canvas.addEventListener("mousemove", function (e) {
        handleMouse(e.clientX, e.clientY, false)
        draw()
    }, false);

    function handleMouse(clientX: number, clientY: number, isClick: boolean, clickToggle: boolean = false) {
        let mouseX = clientX - canvas.offsetLeft
        let mouseY = clientY - canvas.offsetTop;
        let distX = mouseX - strikkX
        let distY = mouseY - strikkY
        let dist = Math.sqrt(Math.pow(distX, 2) + Math.pow(distY, 2));

        if (isDragging) {
            strikkX = mouseX
            strikkY = mouseY
        }

        if (dist < CIRCLE_RADIUS) {
            if (isClick) {
                if (clickToggle) {
                    canvas.style.cursor = 'grabbing'
                    isDragging = true
                } else {
                    canvas.style.cursor = 'pointer'
                    isDragging = false
                    strikkX = 300;
                    strikkY = 300;
                }
            } else if (!isDragging) {
                canvas.style.cursor = 'pointer'
            }
        } else if (!isDragging) {
            canvas.style.cursor = 'default'
        }
    }

    canvas.addEventListener("mousedown", function (e) {
        handleMouse(e.clientX, e.clientY, true, true)
    }, false);

    canvas.addEventListener("mouseup", function (e) {
        handleMouse(e.clientX, e.clientY, true, false)
    }, false);
}
