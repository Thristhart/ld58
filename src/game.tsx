import { Suspense, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Canvas } from "./canvas";
import "./game.css";
import { GameWorld } from "./model/gameworld";
import { Pickup } from "./model/entities/pickup";
import { Player } from "./model/entities/player";
import { Direction } from "#src/direction.ts";
import { bufferedMoves, tick } from "./gameloop";
import { GameState } from "./model/gamestate";
import { Interface } from "./Interface/Interface";
import { Position } from "./model/entity";
import { Wall } from "./model/entities/wall";
import { Buzzsaw } from "./model/entities/buzzsaw";
import { GrassTile } from "./model/entities/grasstile";
import { IntroRoom } from "./model/rooms/intro";
import { BatCountry } from "./model/rooms/batcountry";
import { ClosedDoor, OpenDoor } from "./model/entities/door";

function createGameWorld() {
    const gameWorld = new GameWorld();

    gameWorld.addEntity(new Pickup({ x: 3, y: 2 }, gameWorld));
    gameWorld.player = new Player({ x: 0, y: 0 }, gameWorld, Direction.East);
    gameWorld.addEntity(gameWorld.player);
    gameWorld.player.addSegment();
    // gameWorld.player.addSegment();
    // gameWorld.player.addSegment();
    // gameWorld.player.addSegment();
    // gameWorld.player.tryMove(Direction.North);

    const initialGrassTile = new GrassTile({ x: 0, y: 0 }, gameWorld, 0);
    gameWorld.addEntity(initialGrassTile);
    initialGrassTile.spread();

    // gameWorld.addEntity(new Buzzsaw({ x: 5, y: 5 }, gameWorld));

    const intro = gameWorld.createRoom(IntroRoom, {
        x: -Math.floor(IntroRoom.width / 2),
        y: -Math.floor(IntroRoom.height / 2),
    });
    gameWorld.createRoom(BatCountry, { x: intro.position.x, y: intro.position.y - BatCountry.height - 1 });

    // punch out a door
    const doorPos = { x: 0, y: -IntroRoom.height / 2 - 1 };
    const ents = gameWorld.getEntitiesAt(doorPos);
    for (let ent of ents) {
        if (ent instanceof Wall) {
            gameWorld.removeEntity(ent);
        }
    }
    const door = new OpenDoor(doorPos, gameWorld);
    gameWorld.addEntity(door);

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
        bufferedMoves.splice(0);
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
                <Suspense>
                    <Canvas gameWorld={gameWorld} />
                </Suspense>
            </div>
        </div>
    );
}
