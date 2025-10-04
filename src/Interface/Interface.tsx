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
            <button onClick={() => setGameState("points", points + 1)}>Add Points</button>
        </div>
    );
}
