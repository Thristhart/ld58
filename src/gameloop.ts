import { Direction } from "./direction";
import { Input, InputState } from "./input";
import { GameWorld } from "./model/gameworld";

let lastFrameTime = performance.now();
export function tick(gameWorld: GameWorld, timestamp: number) {
    const dt = timestamp - lastFrameTime;
    lastFrameTime = timestamp;

    if (!gameWorld.getGameState("isPaused") && gameWorld.getGameState("timeSinceCameraPositionChange") <= 0) {
        advanceGame(gameWorld, dt * gameWorld.getGameState("gameSpeed"));
    }
}

let enemyAddTimer = 0;
let autoMoveTimer = 0;
let upgradeAddTimer = 0;

let ignoreNextAutomove = false;
let simulationWindow = 20;
let noSpawnWindow = 2;
export let bufferedMoves: Input[] = [];
export let lastHandledMove: { value: Input | undefined } = { value: undefined };

let nextFacing: Direction | undefined = undefined;
function advanceGame(gameWorld: GameWorld, dt: number) {
    autoMoveTimer += dt;
    enemyAddTimer += dt;
    upgradeAddTimer += dt;

    updateInputs();

    if (autoMoveTimer >= gameWorld.getGameState("timePerAutomove")) {
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

    // if (enemyAddTimer >= gameWorld.getGameState("timePerEnemyAdd")) {
    //     const newPosition = getRandomPositionNear(gameWorld.player.position, noSpawnWindow, simulationWindow);
    //     const direction = getRandomDirection();
    //     const enemy = new WingedEnemy(newPosition, gameWorld, direction);
    //     gameWorld.addEntity(enemy);
    //     enemyAddTimer = 0;
    // }

    // if (upgradeAddTimer >= gameWorld.getGameState("timePerUpgradeAdd")) {
    //     const newPosition = getRandomPositionNear(gameWorld.player.position, noSpawnWindow, simulationWindow);
    //     const upgrade = new Upgrade(newPosition, gameWorld, UpgradeType.DualAmmo);
    //     gameWorld.addEntity(upgrade);
    //     upgradeAddTimer = 0;
    // }

    const currentRoom = gameWorld.getRoomContainingPosition(gameWorld.player.position);
    if (currentRoom !== undefined) {
        const entitiesToSimulate = gameWorld.getEntitiesInRoom(currentRoom);
        for (const entity of entitiesToSimulate) {
            entity.think(dt);
        }
    }
}

export function updateInputs() {
    let lastInput = [...InputState].at(-1);
    if (lastHandledMove.value != lastInput && lastInput !== undefined && bufferedMoves.length < 3) {
        bufferedMoves.push(lastInput);
        lastHandledMove.value = lastInput;
    }
}
