import { Direction } from "#src/direction.ts";
import { Suspense, use, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Canvas } from "./canvas";
import "./game.css";
import { bufferedMoves, lastHandledMove, tick } from "./gameloop";
import { imageLoadPromise } from "./images";
import { Interface } from "./Interface/Interface";
import { levelLoadPromise, levels } from "./levels/loadlevel";
import { GrassTile } from "./model/entities/grasstile";
import { Player } from "./model/entities/player";
import { GameState } from "./model/gamestate";
import { GameWorld } from "./model/gameworld";

function createGameWorld() {
    const gameWorld = new GameWorld();

    const intro = gameWorld.createRoom(levels.basic, {
        x: -Math.floor(levels.basic.width / 2),
        y: -Math.floor(levels.basic.height / 2),
    });
    gameWorld.setGameState("roomsVisited", gameWorld.getGameState("roomsVisited").add(intro.id));

    gameWorld.player = new Player({ x: 0, y: 0 }, gameWorld, Direction.East);
    gameWorld.addEntity(gameWorld.player);
    gameWorld.player.addSegment();

    const initialGrassTile = new GrassTile({ x: 0, y: 0 }, gameWorld, 0);
    gameWorld.addEntity(initialGrassTile);
    initialGrassTile.spread();

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
        lastHandledMove.value = undefined;
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

interface PauseDialogProps {
    unpause: () => void;
}
function PauseDialog(props: PauseDialogProps) {
    return (
        <dialog open>
            <section>
                <p>[w][a][s][d] or arrow keys to move</p>
                <p>collect and eat delicious eggs to regrow your flesh</p>
                <p>eat enemies but avoid letting them hit you</p>
                <p>don't run into yourself</p>
                <button autoFocus onClick={props.unpause}>
                    let's go
                </button>
            </section>
        </dialog>
    );
}

function GameLoaded() {
    const { gameWorld, getGameState, setGameState, restart } = useGameWorld();
    const isDead = getGameState("dead");
    const isPaused = getGameState("isPaused");
    return (
        <>
            <Interface getGameState={getGameState} setGameState={setGameState} />
            <div className="CanvasContainer">
                {isDead && <DeathDialog restart={restart} />}
                {!isDead && isPaused && <PauseDialog unpause={() => setGameState("isPaused", false)} />}
                <Canvas gameWorld={gameWorld} />
            </div>
        </>
    );
}

function LoadGameDeps() {
    use(imageLoadPromise);
    use(levelLoadPromise);
    return <GameLoaded />;
}

export function Game() {
    return (
        <div className="Container">
            <Suspense>
                <LoadGameDeps />
            </Suspense>
        </div>
    );
}
