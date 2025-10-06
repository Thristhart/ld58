import { Direction } from "#src/direction.ts";
import { Suspense, use, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Canvas } from "./canvas";
import "./game.css";
import { bufferedMoves, lastHandledMove, tick } from "./gameloop";
import { imageLoadPromise } from "./images";
import { LeftInterface, RightInterface } from "./Interface/Interface";
import { levelLoadPromise, levels } from "./levels/loadlevel";
import { GrassTile } from "./model/entities/grasstile";
import { Player } from "./model/entities/player";
import { GameState } from "./model/gamestate";
import { GameWorld } from "./model/gameworld";
import { bgm } from "./audio";

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

    useEffect(() => {
        function onBlur() {
            gameWorld.setGameState("isPaused", true);
        }
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === " " || e.key === "Escape") {
                gameWorld.setGameState("isPaused", true);
            }
        }

        document.body.addEventListener("keydown", onKeyDown);
        window.addEventListener("blur", onBlur);
        return () => {
            window.removeEventListener("blur", onBlur);
            document.body.removeEventListener("keydown", onKeyDown);
        };
    }, [gameWorld]);

    return { gameWorld, getGameState, setGameState, restart };
}

interface StatsPageProps {
    getGameState: <K extends keyof GameState>(key: K) => GameState[K];
}

function StatsPage(props: StatsPageProps) {
    return (
        <div>
            <div style={{ marginBottom: "32px" }}>
                Rooms Entered: {props.getGameState("roomsVisited").size} <br />
                Max Length: {props.getGameState("maxLength")} <br />
                Final Length: {props.getGameState("currentLength")} <br />
                Distance Travelled: {props.getGameState("distanceTravelled")} <br />
                <br />
                Eggs Eaten: {props.getGameState("eggsEaten")}
                <br />
                Enemies Killed: {props.getGameState("enemiesEaten")}
            </div>
        </div>
    );
}

interface DeathDialogProps {
    restart: () => void;
    getGameState: <K extends keyof GameState>(key: K) => GameState[K];
}
function DeathDialog(props: DeathDialogProps) {
    return (
        <dialog open>
            <section>
                <h2>☠️ GAME OVER ☠️</h2>
                <StatsPage getGameState={props.getGameState} />
                <button onClick={props.restart} autoFocus style={{ width: "290px" }}>
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
                <h2>Paused</h2>
                <button autoFocus onClick={props.unpause} style={{ width: "290px" }}>
                    unpause
                </button>
            </section>
        </dialog>
    );
}

function GameLoaded() {
    const [bDoneIntro, setDoneIntro] = useState(false);
    const { gameWorld, getGameState, setGameState, restart } = useGameWorld();
    const isDead = getGameState("dead");
    const isPaused = getGameState("isPaused");
    return (
        <>
            {!bDoneIntro && (
                <Intro
                    setDoneIntro={() => {
                        setDoneIntro(true);
                        setGameState("isPaused", false);
                        if (!bgm.playing()) {
                            bgm.play();
                        }
                    }}
                />
            )}
            <LeftInterface gameWorld={gameWorld} getGameState={getGameState} setGameState={setGameState} />
            <div className="CanvasContainer">
                {isDead && <DeathDialog restart={restart} getGameState={getGameState} />}
                {!isDead && isPaused && (
                    <PauseDialog
                        unpause={() => {
                            setGameState("isPaused", false);
                            if (!bgm.playing()) {
                                bgm.play();
                            }
                        }}
                    />
                )}
                <Canvas gameWorld={gameWorld} />
            </div>
            <RightInterface gameWorld={gameWorld} getGameState={getGameState} setGameState={setGameState} />
        </>
    );
}

function LoadGameDeps() {
    use(imageLoadPromise);
    use(levelLoadPromise);
    return <GameLoaded />;
}

import logoImageUrl from "#src/assets/intro/logo.png";
interface IntroProps {
    setDoneIntro: () => void;
}
function Intro(props: IntroProps) {
    return (
        <div className="Intro">
            <div className="Door">
                <img src={logoImageUrl} className="logo" />
                <button onClick={props.setDoneIntro} className="DoorButton">
                    Start Game
                </button>
            </div>
            <div className="instructions">
                <h2>How to Play</h2>
                <br />
                [w][a][s][d] or arrow keys to move
                <br />
                spacebar or esc button to pause
                <br />
                <br />
                collect and eat delicious eggs to regrow your flesh
                <br />
                eat enemies but avoid letting them hit you
                <br />
                don't run into yourself
                <p className="credits">A game by Zyrconium, LGPO, Theyflower, gqycloud, thristhart and TanVern</p>
            </div>
        </div>
    );
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
