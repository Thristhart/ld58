import { camera } from "./camera";
import { GRID_SQUARE_SIZE } from "./constants";

const frameDurations: number[] = new Array();
const frameDurationsSampleCount = 20;
let frameTimeIndex = 0;

export function drawFrame(dt: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    frameDurations[frameTimeIndex++] = dt;
    frameTimeIndex %= frameDurationsSampleCount;
    const averageFrameTime = frameDurations.reduce((prev, current) => prev + current) / frameDurations.length;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(
        Math.round((canvas.width / 2 - camera.x - GRID_SQUARE_SIZE / 2) * camera.scale),
        Math.round((canvas.height / 2 - camera.y - GRID_SQUARE_SIZE / 2) * camera.scale)
    );
    context.scale(camera.scale, camera.scale);

    // temporary grid lines

    context.strokeStyle = "black";

    for (let x = -100; x < 100; x++) {
        context.beginPath();
        context.moveTo(x * GRID_SQUARE_SIZE, -1000);
        context.lineTo(x * GRID_SQUARE_SIZE, 1000);
        context.closePath();
        context.stroke();
    }
    for (let y = -100; y < 100; y++) {
        context.beginPath();
        context.moveTo(-1000, y * GRID_SQUARE_SIZE);
        context.lineTo(1000, y * GRID_SQUARE_SIZE);
        context.closePath();
        context.stroke();
    }

    context.restore();

    context.fillStyle = "black";
    context.fillText(`${Math.round(1000 / averageFrameTime)} FPS`, 32, 32);
}
