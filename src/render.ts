const frameDurations: number[] = new Array();
const frameDurationsSampleCount = 20;
let frameTimeIndex = 0;

export function drawFrame(dt: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    frameDurations[frameTimeIndex++] = dt;
    frameTimeIndex %= frameDurationsSampleCount;
    const averageFrameTime = frameDurations.reduce((prev, current) => prev + current) / frameDurations.length;

    context.fillStyle = "black";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(`${Math.round(1000 / averageFrameTime)} FPS`, 32, 32);
}
