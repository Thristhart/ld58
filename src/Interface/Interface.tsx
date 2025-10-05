import { GameState } from "#src/model/gamestate.ts";
import "./Interface.css";

export function Interface(props: {
    getGameState: <K extends keyof GameState>(key: K) => GameState[K];
    setGameState: (property: keyof GameState, value: GameState[keyof GameState]) => void;
}) {
    return (
        <div className="Interface">
            THIS IS AN INTERFACE...SORTA
            <Points getGameState={props.getGameState} setGameState={props.setGameState} />
            <GameSpeed getGameState={props.getGameState} setGameState={props.setGameState} />
        </div>
    );
}

export function Points(props: {
    getGameState: <K extends keyof GameState>(key: K) => GameState[K];
    setGameState: (property: keyof GameState, value: GameState[keyof GameState]) => void;
}) {
    const { getGameState, setGameState } = props;
    const points = getGameState("points");
    return (
        <div>
            <div>Points: {points}</div>
        </div>
    );
}

export function GameSpeed(props: {
    getGameState: <K extends keyof GameState>(key: K) => GameState[K];
    setGameState: (property: keyof GameState, value: GameState[keyof GameState]) => void;
}) {
    const { getGameState, setGameState } = props;
    const gameSpeed = getGameState("gameSpeed");
    return (
        <div>
            <span>DEBUG: game speed: {gameSpeed}</span>
            <input
                type="range"
                min={0.01}
                max={4}
                value={gameSpeed}
                step={0.01}
                onChange={(e) => setGameState("gameSpeed", e.target.valueAsNumber)}
            />
        </div>
    );
}
