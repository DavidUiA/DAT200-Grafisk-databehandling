const canvas = document.getElementById('canvasInstructure') as HTMLCanvasElement;
const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
ctx.fillStyle = 'lightblue';
ctx.fillRect(0, 0, canvas.width, canvas.height);

ctx.fillStyle = 'yellow';
ctx.arc(75, 75, 50, 2 * Math.PI, 0, false)
ctx.fill()

ctx.fillStyle = 'black';
ctx.beginPath();
ctx.moveTo(100, 350);
ctx.lineTo(150, 300);
ctx.lineTo(450, 300);
ctx.lineTo(500, 350);
ctx.fill();
ctx.closePath();

ctx.fillStyle = 'green';
ctx.beginPath();
ctx.moveTo(150, 350);
ctx.lineTo(450, 350);
ctx.lineTo(450, 500);
ctx.lineTo(150, 500);
ctx.fill();
ctx.closePath();

ctx.fillStyle = 'yellow';
for (let i = 0; i < 2; i++) {
  ctx.beginPath();
  ctx.moveTo(200 + 150 * i, 375);
  ctx.lineTo(250 + 150 * i, 375);
  ctx.lineTo(250 + 150 * i, 425);
  ctx.lineTo(200 + 150 * i, 425);
  ctx.fill();
  ctx.closePath();
}

ctx.fillStyle = 'white';
ctx.beginPath();
ctx.moveTo(275, 375);
ctx.lineTo(325, 375);
ctx.lineTo(325, 475);
ctx.lineTo(275, 475);
ctx.fill();
ctx.closePath();

ctx.fillStyle = 'black';
ctx.beginPath();
ctx.moveTo(0, 310);
ctx.lineTo(200, 250);
ctx.lineTo(300, 270);
ctx.lineTo(500, 220);
ctx.lineTo(550, 270);
ctx.lineTo(700, 260);
ctx.stroke();