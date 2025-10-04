import { Direction } from "./direction";
import { InputState } from "./input";
import { GameWorld } from "./model/gameworld";

let lastFrameTime = performance.now();
export function tick(gameWorld: GameWorld, timestamp: number) {
    requestAnimationFrame((timestamp) => tick(gameWorld, timestamp));
    const dt = timestamp - lastFrameTime;

    advanceGame(gameWorld, dt);

    lastFrameTime = timestamp;
}

let autoMoveTimer = 0;
let timeSinceMove = 0;

let timePerAutomove = 1500;
let timePerMove = 500;
function advanceGame(gameWorld: GameWorld, dt: number) {
    autoMoveTimer += dt;
    timeSinceMove += dt;

    if (autoMoveTimer >= timePerAutomove) {
        gameWorld.player.tryMove(gameWorld.player.facing);
        autoMoveTimer = 0;
    }

    if (timeSinceMove >= timePerMove) {
        if (InputState.has("a")) {
            timeSinceMove = 0;
            autoMoveTimer = 0;
            gameWorld.player.tryMove(Direction.West);
        } else if (InputState.has("w")) {
            timeSinceMove = 0;
            autoMoveTimer = 0;
            gameWorld.player.tryMove(Direction.North);
        } else if (InputState.has("d")) {
            timeSinceMove = 0;
            autoMoveTimer = 0;
            gameWorld.player.tryMove(Direction.East);
        } else if (InputState.has("s")) {
            timeSinceMove = 0;
            autoMoveTimer = 0;
            gameWorld.player.tryMove(Direction.South);
        }
    }
}
