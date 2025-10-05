import { camera } from "./camera";
import { GRID_SQUARE_SIZE } from "./constants";
import { GameWorld } from "./model/gameworld";
import { lerp } from "./util";

const frameDurations: number[] = new Array();
const frameDurationsSampleCount = 20;
let frameTimeIndex = 0;

let timeSinceCameraPositionChange = 0;
let oldCameraScale = 1;
let oldCameraPosition = { x: 0, y: 0 };
let cameraTransitionDuration = 200;

export function tickFrame(
    dt: number,
    canvas: HTMLCanvasElement,
    context: CanvasRenderingContext2D,
    gameWorld: GameWorld
) {
    drawFrame(dt * gameWorld.getGameState("gameSpeed"), canvas, context, gameWorld);
}

function drawFrame(dt: number, canvas: HTMLCanvasElement, context: CanvasRenderingContext2D, gameWorld: GameWorld) {
    frameDurations[frameTimeIndex++] = dt;
    frameTimeIndex %= frameDurationsSampleCount;
    const averageFrameTime = frameDurations.reduce((prev, current) => prev + current) / frameDurations.length;

    if (gameWorld.getGameState("timeSinceCameraPositionChange") > 0) {
        gameWorld.setGameState(
            "timeSinceCameraPositionChange",
            gameWorld.getGameState("timeSinceCameraPositionChange") - dt
        );
    }

    const currentRoom = gameWorld.getRoomContainingPosition(gameWorld.player.position);
    if (currentRoom) {
        const targetWidthScale = canvas.width / (currentRoom.definition.width * GRID_SQUARE_SIZE);
        const targetHeightScale = canvas.height / (currentRoom.definition.height * GRID_SQUARE_SIZE);
        const smallestScale = Math.min(targetWidthScale, targetHeightScale);
        if (camera.scale != smallestScale) {
            gameWorld.setGameState("timeSinceCameraPositionChange", cameraTransitionDuration);
            oldCameraScale = camera.scale;
            camera.scale = smallestScale;
        } else {
            oldCameraScale = camera.scale;
        }

        const center = currentRoom.centerPoint();
        const newCameraX = center.x * GRID_SQUARE_SIZE;
        const newCameraY = center.y * GRID_SQUARE_SIZE;
        if (camera.x !== newCameraX || camera.y !== newCameraY) {
            oldCameraPosition = { x: camera.x, y: camera.y };
            gameWorld.setGameState("timeSinceCameraPositionChange", cameraTransitionDuration);
            camera.x = newCameraX;
            camera.y = newCameraY;
        }
    }

    let cameraScale = camera.scale;
    let cameraX = camera.x;
    let cameraY = camera.y;

    if (gameWorld.getGameState("timeSinceCameraPositionChange") > 0) {
        const t = 1 - gameWorld.getGameState("timeSinceCameraPositionChange") / cameraTransitionDuration;
        cameraScale = lerp(t, oldCameraScale, camera.scale);
        cameraX = lerp(t, oldCameraPosition.x, camera.x);
        cameraY = lerp(t, oldCameraPosition.y, camera.y);
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    context.save();
    context.translate(
        Math.round(canvas.width / 2 - cameraX * cameraScale),
        Math.round(canvas.height / 2 - cameraY * cameraScale)
    );
    context.scale(cameraScale, cameraScale);

    let visibleEntities;
    if (currentRoom) {
        visibleEntities = gameWorld.getEntitiesInRoom(currentRoom);
    } else {
        const cameraGridX = Math.floor(cameraX / GRID_SQUARE_SIZE);
        const cameraGridY = Math.floor(cameraY / GRID_SQUARE_SIZE);
        const halfWisibleWidth = Math.ceil(canvas.width / cameraScale / GRID_SQUARE_SIZE / 2);
        const halfVisibleHeight = Math.ceil(canvas.height / cameraScale / GRID_SQUARE_SIZE / 2);

        const visibleBounds = {
            x: cameraGridX - halfWisibleWidth - 1,
            y: cameraGridY - halfVisibleHeight - 1,
            w: halfWisibleWidth * 2 + 1,
            h: halfVisibleHeight * 2 + 1,
        };
        visibleEntities = gameWorld.getEntitiesInArea(visibleBounds);
    }
    visibleEntities = visibleEntities.sort((a, b) => a.zIndex - b.zIndex);

    for (const ent of visibleEntities) {
        ent.draw(context, canvas);
    }

    context.restore();

    context.fillStyle = "black";
    context.fillText(`${Math.round(1000 / averageFrameTime)} FPS`, 32, 32);
}
