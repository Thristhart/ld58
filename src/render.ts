import { camera } from "./camera";
import { GRID_SQUARE_SIZE } from "./constants";
import { GameWorld } from "./model/gameworld";
import { loadImage } from "./images";

const frameDurations: number[] = new Array();
const frameDurationsSampleCount = 20;
let frameTimeIndex = 0;

export function drawFrame(
    dt: number,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    gameWorld: GameWorld
) {
    frameDurations[frameTimeIndex++] = dt;
    frameTimeIndex %= frameDurationsSampleCount;
    const averageFrameTime = frameDurations.reduce((prev, current) => prev + current) / frameDurations.length;

    camera.x = gameWorld.player.position.x * GRID_SQUARE_SIZE;
    camera.y = gameWorld.player.position.y * GRID_SQUARE_SIZE;

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(
        Math.round((canvas.width / 2 - camera.x - GRID_SQUARE_SIZE / 2) * camera.scale),
        Math.round((canvas.height / 2 - camera.y - GRID_SQUARE_SIZE / 2) * camera.scale)
    );
    context.scale(camera.scale, camera.scale);

    const cameraX = Math.floor(camera.x / GRID_SQUARE_SIZE);
    const cameraY = Math.floor(camera.y / GRID_SQUARE_SIZE);
    const halfWisibleWidth = Math.ceil(canvas.width / camera.scale / GRID_SQUARE_SIZE / 2);
    const halfVisibleHeight = Math.ceil(canvas.height / camera.scale / GRID_SQUARE_SIZE / 2);

    const visibleBounds = {
        x: cameraX - halfWisibleWidth,
        y: cameraY - halfVisibleHeight,
        w: halfWisibleWidth * 2,
        h: halfVisibleHeight * 2,
    };

    const visibleEntities = gameWorld.getEntitiesInArea(visibleBounds).sort((a, b) => a.zIndex - b.zIndex);

    for (const ent of visibleEntities) {
        ent.draw(context, canvas);
    }

    context.restore();

    context.fillStyle = "black";
    context.fillText(`${Math.round(1000 / averageFrameTime)} FPS`, 32, 32);
}
