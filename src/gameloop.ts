import { Dir } from "fs";
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
let ignoreNextAutomove = false;

let timePerAutomove = 75;
let nextFacing: Direction | undefined = undefined;
function advanceGame(gameWorld: GameWorld, dt: number) {
    autoMoveTimer += dt;

    if (InputState.has("a")) {
        nextFacing = Direction.West;
    } else if (InputState.has("w")) {
        nextFacing = Direction.North;
    } else if (InputState.has("d")) {
        nextFacing = Direction.East;
    } else if (InputState.has("s")) {
        nextFacing = Direction.South;
    } else {
        nextFacing = undefined;
    }

    if (autoMoveTimer >= timePerAutomove) {
        if (!ignoreNextAutomove) {
            gameWorld.player.tryMove(nextFacing ?? gameWorld.player.facing);
            autoMoveTimer = 0;
        }
        ignoreNextAutomove = false;
    }
}
