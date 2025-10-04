import { Direction } from "./direction";
import { InputState, Input } from "./input";
import { GameWorld } from "./model/gameworld";

let lastFrameTime = performance.now();
export function tick(gameWorld: GameWorld, timestamp: number) {
    const dt = timestamp - lastFrameTime;

    advanceGame(gameWorld, dt);

    lastFrameTime = timestamp;
}

let autoMoveTimer = 0;
let ignoreNextAutomove = false;
let bufferedMoves: Input[] = [];
let lastHandledMove: Input | undefined = undefined;

let timePerAutomove = 75;
let nextFacing: Direction | undefined = undefined;
function advanceGame(gameWorld: GameWorld, dt: number) {
    autoMoveTimer += dt;

    if (!gameWorld.getGameState("isPaused")) {
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
    }
}

export function updateInputs() {
    let lastInput = [...InputState].at(-1);
    if (lastHandledMove != lastInput && lastInput !== undefined && bufferedMoves.length < 3) {
        bufferedMoves.push(lastInput);
        lastHandledMove = lastInput;
    }
}
