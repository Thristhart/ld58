import { Minimap } from "#src/Interface/minimap.tsx";
import { GameState } from "#src/model/gamestate.ts";
import { GameWorld } from "#src/model/gameworld.ts";
import "./Interface.css";
import { MuteButton } from "./mutebutton";

export function LeftInterface(props: {
    gameWorld: GameWorld;
    getGameState: <K extends keyof GameState>(key: K) => GameState[K];
    setGameState: (property: keyof GameState, value: GameState[keyof GameState]) => void;
}) {
    return (
        <div className="LeftInterface">
            {/* THIS IS AN INTERFACE...SORTA
            <Points getGameState={props.getGameState} setGameState={props.setGameState} />
            <GameSpeed getGameState={props.getGameState} setGameState={props.setGameState} /> */}
            <Minimap gameWorld={props.gameWorld} />
        </div>
    );
}

export function RightInterface(props: {
    gameWorld: GameWorld;
    getGameState: <K extends keyof GameState>(key: K) => GameState[K];
    setGameState: (property: keyof GameState, value: GameState[keyof GameState]) => void;
}) {
    return (
        <div className="RightInterface">
            <MuteButton />
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
            <div>Current room: {getGameState("currentRoom")?.definition.name ?? ""}</div>
        </div>
    );
}
