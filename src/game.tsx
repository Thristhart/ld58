import { useCallback, useState, useSyncExternalStore } from "react";
import { Canvas } from "./canvas";
import "./game.css";
import { GameWorld } from "./model/gameworld";
import { Pickup } from "./model/pickup";
import { Player } from "./model/entities/player";
import { Direction } from "#src/direction.ts";
import { tick } from "./gameloop";
import { GameState } from "./model/gamestate";
import { Interface } from "./Interface/Interface";

function createGameWorld() {
    const gameWorld = new GameWorld();

    gameWorld.addEntity(new Pickup({ x: 3, y: 2 }, gameWorld));
    gameWorld.player = new Player({ x: 0, y: 0 }, gameWorld, Direction.East);
    gameWorld.addEntity(gameWorld.player);
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();
    gameWorld.player.addSegment();

    // @ts-ignore
    window.DEBUG_gameWorld = gameWorld;

    requestAnimationFrame((timestamp) => tick(gameWorld, timestamp));

    return gameWorld;
}

function useGameWorld() {
    const [gameWorld] = useState(createGameWorld);

    const getGameState = useCallback(
        (key: keyof GameState) => {
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

    return { gameWorld, getGameState, setGameState };
}

export function Game() {
    const { gameWorld, getGameState, setGameState } = useGameWorld();
    return (
        <div className="Container">
            <Interface getGameState={getGameState} setGameState={setGameState} />
            <div className="CanvasContainer">
                <Canvas gameWorld={gameWorld} />
            </div>
        </div>
    );
}
