import { Direction } from "./direction";
import { InputState, Input } from "./input";
import { GameWorld } from "./model/gameworld";

let lastFrameTime = performance.now();
export function tick(gameWorld: GameWorld, timestamp: number) {
    const dt = timestamp - lastFrameTime;

    if (!gameWorld.getGameState("isPaused")) {
        advanceGame(gameWorld, dt * gameWorld.getGameState("gameSpeed"));
    }

    lastFrameTime = timestamp;
}

let autoMoveTimer = 0;
let ignoreNextAutomove = false;
export let bufferedMoves: Input[] = [];
let lastHandledMove: Input | undefined = undefined;

let timePerAutomove = 75;
let nextFacing: Direction | undefined = undefined;
function advanceGame(gameWorld: GameWorld, dt: number) {
    autoMoveTimer += dt;

    updateInputs();

    if (autoMoveTimer >= timePerAutomove) {
        let nextInput = bufferedMoves.shift();

        if (nextInput === "a" && gameWorld.player.facing !== Direction.East) {
            nextFacing = Direction.West;
        } else if (nextInput === "w" && gameWorld.player.facing !== Direction.South) {
            nextFacing = Direction.North;
        } else if (nextInput === "d" && gameWorld.player.facing !== Direction.West) {
            nextFacing = Direction.East;
        } else if (nextInput === "s" && gameWorld.player.facing !== Direction.North) {
            nextFacing = Direction.South;
        } else {
            nextFacing = undefined;
        }
        if (!ignoreNextAutomove) {
            gameWorld.player.tryMove(nextFacing ?? gameWorld.player.facing);
            autoMoveTimer = 0;
        }
        ignoreNextAutomove = false;
    }

    const entitiesToSimulate = gameWorld.getEntitiesNear(gameWorld.player.position, 20);
    for (const entity of entitiesToSimulate) {
        entity.think(dt);
    }
}

export function updateInputs() {
    let lastInput = [...InputState].at(-1);
    if (lastHandledMove != lastInput && lastInput !== undefined && bufferedMoves.length < 3) {
        bufferedMoves.push(lastInput);
        lastHandledMove = lastInput;
    }
}
