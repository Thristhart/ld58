import { useState } from "react";
import { Canvas } from "./canvas";
import "./game.css";
import { GameWorld } from "./model/gameworld";
import { Pickup } from "./model/pickup";

function createGameWorld() {
    const gameworld = new GameWorld();

    gameworld.addEntity(new Pickup({ x: 3, y: 2 }));

    // @ts-ignore
    window.DEBUG_gameWorld = gameworld;

    return gameworld;
}

function useGameWorld() {
    const [gameWorld] = useState(createGameWorld);

    return gameWorld;
}

export function Game() {
    const gameWorld = useGameWorld();
    return <Canvas gameWorld={gameWorld} />;
}
