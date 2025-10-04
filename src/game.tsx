import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Canvas } from "./canvas";
import "./game.css";
import { GameWorld } from "./model/gameworld";
import { Pickup } from "./model/entities/pickup";
import { Player } from "./model/entities/player";
import { Direction } from "#src/direction.ts";
import { tick } from "./gameloop";
import { GameState } from "./model/gamestate";
import { Interface } from "./Interface/Interface";
import { Position } from "./model/entity";
import { Wall } from "./model/entities/wall";

function createRoom(gameWorld: GameWorld, centerX: number, centerY: number, size: number) {
    let candidates: Position[] = [];
    for (let x = centerX - size; x <= centerX + size; x++) {
        if (x !== centerX) {
            candidates.push({ x, y: centerY - size });
            candidates.push({ x, y: centerY + size });
        }
    }
    for (let y = centerY - size; y <= centerY + size; y++) {
        if (y !== centerY) {
            candidates.push({ x: centerX - size, y });
            candidates.push({ x: centerX + size, y });
        }
    }
    for (const pos of candidates) {
        if (gameWorld.getEntitiesAt(pos).size > 0) {
            continue;
        }
        const wall = new Wall(pos, gameWorld);
        gameWorld.addEntity(wall);
    }
}

function createGameWorld() {
    const gameWorld = new GameWorld();

    gameWorld.addEntity(new Pickup({ x: 3, y: 2 }, gameWorld));
    gameWorld.player = new Player({ x: 0, y: 0 }, gameWorld, Direction.East);
    gameWorld.addEntity(gameWorld.player);
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.tryMove(Direction.North);

    for (let x = -20; x < 20; x++) {
        for (let y = -20; y < 20; y++) {
            createRoom(gameWorld, x * 30, y * 30, 15);
        }
    }

    // @ts-ignore
    window.DEBUG_gameWorld = gameWorld;

    return gameWorld;
}

function useGameWorld() {
    const [gameWorld, setGameWorld] = useState(createGameWorld);

    const getGameState = useCallback(
        <K extends keyof GameState>(key: K) => {
            return useSyncExternalStore(
                (onStoreChange: () => void) => {
                    gameWorld.subscribeToStateChange(key, onStoreChange);
                    return () => gameWorld.unsubscribeFromStateChange(key, onStoreChange);
                },
                () => gameWorld.getGameState(key)
            );
        },
        [gameWorld]
    );

    const setGameState = useCallback(
        (property: keyof GameState, value: GameState[keyof GameState]) => {
            gameWorld.setGameState(property, value);
        },
        [gameWorld]
    );

    const restart = () => {
        setGameWorld(createGameWorld);
    };

    useEffect(() => {
        let frameHandle: number;
        function animationFrame(timestamp: number) {
            frameHandle = requestAnimationFrame(animationFrame);

            tick(gameWorld, timestamp);
        }

        frameHandle = requestAnimationFrame(animationFrame);

        return () => cancelAnimationFrame(frameHandle);
    }, [gameWorld]);

    return { gameWorld, getGameState, setGameState, restart };
}

interface DeathDialogProps {
    restart: () => void;
}
function DeathDialog(props: DeathDialogProps) {
    return (
        <dialog open>
            <section>
                <h2>Game Over</h2>
                <p>Try again?</p>
                <button onClick={props.restart} autoFocus>
                    Retry
                </button>
            </section>
        </dialog>
    );
}

export function Game() {
    const { gameWorld, getGameState, setGameState, restart } = useGameWorld();
    return (
        <div className="Container">
            <Interface getGameState={getGameState} setGameState={setGameState} />
            <div className="CanvasContainer">
                {getGameState("dead") && <DeathDialog restart={restart} />}
                <Canvas gameWorld={gameWorld} />
            </div>
        </div>
    );
}
